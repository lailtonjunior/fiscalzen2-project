import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';

// Mock pdfmake before imports (logically, but imports hoist)
// Since the service uses require(), we need to mock it effectively.
jest.mock('pdfmake', () => {
  return class PdfPrinter {
    constructor() { }
    createPdfKitDocument() {
      return {
        on: (event: string, callback: (data?: any) => void) => {
          if (event === 'data') {
            callback(Buffer.from('%PDF-1.4'));
          }
          if (event === 'end') {
            callback();
          }
          return;
        },
        end: () => { },
      };
    }
  };
});

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
