
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './generators/pdf-generator/pdf-generator.service';
import { ExcelGeneratorService } from './generators/excel-generator/excel-generator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService, ExcelGeneratorService],
})
export class ReportsModule { }
