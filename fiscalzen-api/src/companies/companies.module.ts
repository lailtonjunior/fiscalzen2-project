import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../common/storage';
import { SefazModule } from '../sefaz/sefaz.module';

@Module({
    imports: [PrismaModule, StorageModule, SefazModule],
    controllers: [CompaniesController],
    providers: [CompaniesService],
    exports: [CompaniesService],
})
export class CompaniesModule { }
