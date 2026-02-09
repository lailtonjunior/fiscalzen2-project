import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAMES = {
    NOTIFICATION: 'notification',
    XML_PROCESSING: 'xml-processing',
    SEFAZ_SYNC: 'sefaz-sync',
} as const;

@Global()
@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
            },
        }),
        BullModule.registerQueue(
            { name: QUEUE_NAMES.NOTIFICATION },
            { name: QUEUE_NAMES.XML_PROCESSING },
            { name: QUEUE_NAMES.SEFAZ_SYNC },
        ),
    ],
    exports: [BullModule],
})
export class QueueModule { }
