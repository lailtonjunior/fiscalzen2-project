import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NFeTransmissionService, NFeAuthorizationResult } from './nfe-transmission.service';
import { NFeData } from './nfe.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from '../../common/queue/queue.module';

export interface NFeJobData {
    type: 'EMITIR' | 'CONSULTAR_RECIBO' | 'CONSULTAR_STATUS';
    companyId: string;
    nfeData?: NFeData;
    chaveAcesso?: string;
    recibo?: string;
    notaFiscalId?: string;
    production?: boolean;
}

export interface NFeJobResult {
    success: boolean;
    chaveAcesso?: string;
    protocolo?: string;
    status?: number;
    message: string;
    data?: NFeAuthorizationResult;
}

@Processor(QUEUE_NAMES.XML_PROCESSING)
export class NFeProcessor extends WorkerHost {
    private readonly logger = new Logger(NFeProcessor.name);

    constructor(
        private readonly transmissionService: NFeTransmissionService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<NFeJobData>): Promise<NFeJobResult> {
        this.logger.log(`Processing job ${job.id} of type ${job.data.type}`);

        try {
            switch (job.data.type) {
                case 'EMITIR':
                    return await this.processEmitir(job);

                case 'CONSULTAR_RECIBO':
                    return await this.processConsultarRecibo(job);

                case 'CONSULTAR_STATUS':
                    return await this.processConsultarStatus(job);

                default:
                    return {
                        success: false,
                        message: `Unknown job type: ${job.data.type}`,
                    };
            }
        } catch (error) {
            this.logger.error(`Job ${job.id} failed:`, error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Process NFe emission
     */
    private async processEmitir(job: Job<NFeJobData>): Promise<NFeJobResult> {
        const { companyId, nfeData, notaFiscalId, production } = job.data;

        if (!nfeData) {
            return { success: false, message: 'NFe data is required' };
        }

        // Update status to processing
        if (notaFiscalId) {
            await this.updateNotaStatus(notaFiscalId, 'processando');
        }

        // Transmit to SEFAZ
        const result = await this.transmissionService.transmitNFe(
            nfeData,
            companyId,
            production ?? false,
        );

        // Update database with result
        if (notaFiscalId) {
            await this.updateNotaWithResult(notaFiscalId, result);
        }

        // If batch processing, schedule receipt consultation
        if (result.status === 105 && result.protocolNumber) {
            this.logger.log(`Should schedule recibo consultation: ${result.protocolNumber}`);
        }

        return {
            success: result.success,
            chaveAcesso: result.chaveAcesso,
            protocolo: result.protocolNumber,
            status: result.status,
            message: result.statusMessage,
            data: result,
        };
    }

    /**
     * Process receipt consultation
     */
    private async processConsultarRecibo(job: Job<NFeJobData>): Promise<NFeJobResult> {
        const { companyId, recibo, notaFiscalId, production } = job.data;

        if (!recibo) {
            return { success: false, message: 'Recibo is required' };
        }

        const result = await this.transmissionService.consultarRecibo(
            recibo,
            companyId,
            production ?? false,
        );

        // If still processing, retry later
        if (this.transmissionService.shouldRetryConsulta(result.status)) {
            throw new Error('Lote ainda em processamento');
        }

        // Update database with results
        if (notaFiscalId && result.protNFe && result.protNFe.length > 0) {
            const nfeResult = result.protNFe[0];
            await this.updateNotaWithResult(notaFiscalId, nfeResult);
        }

        return {
            success: result.success,
            status: result.status,
            message: result.statusMessage,
        };
    }

    /**
     * Process status consultation
     */
    private async processConsultarStatus(job: Job<NFeJobData>): Promise<NFeJobResult> {
        const { chaveAcesso } = job.data;

        if (!chaveAcesso) {
            return { success: false, message: 'Chave de acesso is required' };
        }

        const nota = await this.prisma.notaFiscal.findFirst({
            where: { chaveAcesso },
        });

        if (!nota) {
            return { success: false, message: 'Nota fiscal não encontrada' };
        }

        return {
            success: true,
            chaveAcesso,
            message: nota.statusSefaz,
        };
    }

    /**
     * Update nota fiscal status in database
     */
    private async updateNotaStatus(notaFiscalId: string, status: string): Promise<void> {
        try {
            await this.prisma.notaFiscal.update({
                where: { id: notaFiscalId },
                data: { statusSefaz: status },
            });
        } catch (error) {
            this.logger.warn(`Failed to update nota status: ${error.message}`);
        }
    }

    /**
     * Update nota fiscal with SEFAZ result
     */
    private async updateNotaWithResult(
        notaFiscalId: string,
        result: NFeAuthorizationResult,
    ): Promise<void> {
        try {
            const status = result.success ? 'autorizada' : 'rejeitada';

            await this.prisma.notaFiscal.update({
                where: { id: notaFiscalId },
                data: {
                    statusSefaz: status,
                    chaveAcesso: result.chaveAcesso || '',
                    dataAutorizacao: result.authorizationDate
                        ? new Date(result.authorizationDate)
                        : undefined,
                    xmlConteudo: result.xmlProtocolo,
                },
            });
        } catch (error) {
            this.logger.warn(`Failed to update nota with result: ${error.message}`);
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<NFeJobData>) {
        this.logger.log(`Job ${job.id} completed`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<NFeJobData>, error: Error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`);
    }
}
