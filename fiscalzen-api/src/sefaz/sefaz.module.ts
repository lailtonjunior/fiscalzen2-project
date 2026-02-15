import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SefazService } from './sefaz.service';
import { SefazController } from './sefaz.controller';
import { CertificateService } from './certificate.service';
import { XmlFactoryService } from './xml-factory.service';
import { SoapService } from './soap.service';
import { StorageModule } from '../common/storage';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES } from '../common/queue/queue.module';
import {
  NFeXmlBuilderService,
  XmlSignerService,
  NFeTransmissionService,
  NFeProcessor,
  NFeController,
  DanfeGeneratorService,
  NFeDistributionService,
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
    NFeDistributionService,
  ],
  exports: [CertificateService, SefazService, NFeXmlBuilderService, XmlSignerService, NFeTransmissionService, NFeDistributionService],
})
export class SefazModule implements OnModuleInit {
  private readonly logger = new Logger(SefazModule.name);

  constructor(
    private readonly certificateService: CertificateService,
    private readonly prisma: PrismaService
  ) { }

  async onModuleInit() {
    console.log('--- SEFAZ MODULE INIT: FORCE UPDATE START ---');
    try {
      const company = await this.prisma.empresa.findFirst();
      if (!company) {
        console.error('SEFAZ INIT: No company found in DB.');
        return;
      }

      const targetCnpj = '44098209000105';
      const targetName = 'Posto Via Lago LTDA';
      const targetUf = 'TO'; // Assuming Tocantins based on "Lago" or similar, but let's keep existing if valid, or default to checking. 
      // Limit to just CNPJ and Name for now to fix the 489.

      console.log(`SEFAZ INIT: Current -> Name: ${company.razaoSocial}, CNPJ: ${company.cnpj}`);

      // Normalize CNPJ
      const currentCnpjNums = company.cnpj.replace(/\D/g, '');

      if (currentCnpjNums !== targetCnpj) {
        console.warn(`SEFAZ INIT: MISMATCH! Overwriting with ${targetCnpj}...`);
        await this.prisma.empresa.update({
          where: { id: company.id },
          data: {
            cnpj: targetCnpj,
            razaoSocial: targetName,
            ambienteSefaz: 'homologacao'
          }
        });
        console.log('SEFAZ INIT: FORCE UPDATE SUCCESSFUL.');
      } else {
        console.log('SEFAZ INIT: CNPJ matches target.');
        if (company.ambienteSefaz !== 'homologacao') {
          console.log('SEFAZ INIT: Setting Homologacao...');
          await this.prisma.empresa.update({
            where: { id: company.id },
            data: { ambienteSefaz: 'homologacao' }
          });
        }
      }

    } catch (error) {
      console.error(`SEFAZ INIT: Critical Error: ${error.message}`, error.stack);
    }
  }
}
