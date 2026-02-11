import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { NotificacaoProcessor } from './notificacao.processor';
import { QUEUE_NAMES } from '../common/queue/queue.module';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({ name: QUEUE_NAMES.NOTIFICATION }),
    ],
    controllers: [NotificacoesController],
    providers: [NotificacoesService, NotificacaoProcessor],
    exports: [NotificacoesService],
})
export class NotificacoesModule implements OnModuleInit {
    constructor(
        @InjectQueue(QUEUE_NAMES.NOTIFICATION)
        private readonly notificationQueue: Queue,
    ) { }

    async onModuleInit() {
        await this.notificationQueue.add(
            'check-pending-manifestacoes',
            {},
            {
                repeat: { pattern: '0 * * * *' },
                removeOnComplete: true,
                removeOnFail: 5,
            },
        );
    }
}
