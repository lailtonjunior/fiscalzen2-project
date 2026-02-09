import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SefazService } from './sefaz.service';
import { SefazController } from './sefaz.controller';
import { CertificateService } from './certificate.service';
import { XmlFactoryService } from './xml-factory.service';
import { SoapService } from './soap.service';
import { StorageModule } from '../common/storage';
import { PrismaModule } from '../prisma/prisma.module';
import { QUEUE_NAMES } from '../common/queue/queue.module';
import {
  NFeXmlBuilderService,
  XmlSignerService,
  NFeTransmissionService,
  NFeProcessor,
  NFeController,
  DanfeGeneratorService,
} from './nfe';

@Module({
  imports: [
    StorageModule,
    PrismaModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.XML_PROCESSING }),
  ],
  controllers: [SefazController, NFeController],
  providers: [
    SefazService,
    CertificateService,
    XmlFactoryService,
    SoapService,
    NFeXmlBuilderService,
    XmlSignerService,
    NFeTransmissionService,
    NFeProcessor,
    DanfeGeneratorService,
  ],
  exports: [CertificateService, SefazService, NFeXmlBuilderService, XmlSignerService, NFeTransmissionService],
})
export class SefazModule { }
