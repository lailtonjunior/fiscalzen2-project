import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from './notificacoes.service';
import { QUEUE_NAMES } from '../common/queue/queue.module';

@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificacaoProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificacaoProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificacoesService: NotificacoesService,
    ) {
        super();
    }

    async process(job: Job): Promise<void> {
        switch (job.name) {
            case 'check-pending-manifestacoes':
                await this.checkPendingManifestacoes();
                break;
            case 'create-notification':
                await this.notificacoesService.create(job.data);
                break;
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async checkPendingManifestacoes() {
        this.logger.log('Checking for pending manifestações...');

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const empresas = await this.prisma.empresa.findMany({
            where: { ativo: true },
            select: { id: true },
        });

        for (const empresa of empresas) {
            const pendingCount = await this.prisma.notaFiscal.count({
                where: {
                    empresaId: empresa.id,
                    statusManifestacao: 'pendente',
                    dataEmissao: { lte: sevenDaysAgo },
                },
            });

            if (pendingCount > 0) {
                const existing = await this.prisma.notificacao.findFirst({
                    where: {
                        empresaId: empresa.id,
                        tipo: 'MANIFESTO_PENDENTE',
                        lida: false,
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    },
                });

                if (!existing) {
                    await this.notificacoesService.create({
                        tipo: 'MANIFESTO_PENDENTE',
                        titulo: 'Manifestações pendentes',
                        mensagem: `Você possui ${pendingCount} nota(s) fiscal(is) pendente(s) de manifestação há mais de 7 dias.`,
                        empresaId: empresa.id,
                        dadosExtra: { pendingCount },
                    });
                    this.logger.log(`Created MANIFESTO_PENDENTE notification for empresa ${empresa.id}`);
                }
            }
        }
    }
}
