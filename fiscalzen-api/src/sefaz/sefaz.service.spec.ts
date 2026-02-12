import { Test, TestingModule } from '@nestjs/testing';
import { SefazService } from './sefaz.service';
import { XmlFactoryService } from './xml-factory.service';
import { SoapService } from './soap.service';
import { CertificateService } from './certificate.service';

describe('SefazService', () => {
  let service: SefazService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SefazService,
        {
          provide: XmlFactoryService,
          useValue: {
            createStatusCheckXml: jest.fn(),
            wrapInSoapEnvelope: jest.fn(),
          },
        },
        {
          provide: SoapService,
          useValue: {
            sendStatusCheck: jest.fn(),
          },
        },
        {
          provide: CertificateService,
          useValue: {
            getPassword: jest.fn(),
            loadFromStorage: jest.fn(),
            uploadAndValidate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SefazService>(SefazService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
