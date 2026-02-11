import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotasFiscaisService } from './notas-fiscais.service';
import { QUEUE_NAMES } from '../common/queue/queue.module';

interface XmlImportJobData {
    empresaId: string;
    fileName: string;
    buffer: string; // base64 encoded
}

@Processor(QUEUE_NAMES.XML_PROCESSING)
export class XmlImportProcessor extends WorkerHost {
    private readonly logger = new Logger(XmlImportProcessor.name);

    constructor(private readonly notasService: NotasFiscaisService) {
        super();
    }

    async process(job: Job<XmlImportJobData>): Promise<any> {
        const { empresaId, fileName, buffer } = job.data;
        this.logger.log(`Processing XML import job ${job.id}: ${fileName}`);

        try {
            const xmlBuffer = Buffer.from(buffer, 'base64');
            const nota = await this.notasService.importXml(xmlBuffer, fileName, empresaId);
            this.logger.log(`Job ${job.id} completed: imported ${nota.chaveAcesso}`);
            return { success: true, chaveAcesso: nota.chaveAcesso };
        } catch (error: any) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }
}
