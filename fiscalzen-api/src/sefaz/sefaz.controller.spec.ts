import { Test, TestingModule } from '@nestjs/testing';
import { SefazController } from './sefaz.controller';
import { SefazService } from './sefaz.service';

describe('SefazController', () => {
  let controller: SefazController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SefazController],
      providers: [
        {
          provide: SefazService,
          useValue: {
            checkStatus: jest.fn(),
            getCertificateInfo: jest.fn(),
            uploadCertificate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SefazController>(SefazController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
