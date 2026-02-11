import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../common/storage';
import { NotasFiscaisController } from './notas-fiscais.controller';
import { NotasFiscaisService } from './notas-fiscais.service';
import { XmlImportProcessor } from './xml-import.processor';
import { QUEUE_NAMES } from '../common/queue/queue.module';

@Module({
    imports: [
        PrismaModule,
        StorageModule,
        BullModule.registerQueue({ name: QUEUE_NAMES.XML_PROCESSING }),
    ],
    controllers: [NotasFiscaisController],
    providers: [NotasFiscaisService, XmlImportProcessor],
    exports: [NotasFiscaisService],
})
export class NotasFiscaisModule { }
