import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';

import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './generators/pdf-generator/pdf-generator.service';
import { ExcelGeneratorService } from './generators/excel-generator/excel-generator.service';

describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getResumoMensal: jest.fn(),
            getDetalhamentoImpostos: jest.fn(),
            getNotasPorFornecedor: jest.fn(),
            getManifestacoesPendentes: jest.fn(),
            getConferenciaSped: jest.fn(),
          },
        },
        {
          provide: PdfGeneratorService,
          useValue: {
            generateReport: jest.fn(),
          },
        },
        {
          provide: ExcelGeneratorService,
          useValue: {
            generateReport: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
