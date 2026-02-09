import { Test, TestingModule } from '@nestjs/testing';
import { XmlSignerService } from './xml-signer.service';
import { CertificateService, ParsedCertificate } from '../certificate.service';
import * as forge from 'node-forge';

// Generate a self-signed test certificate matching ParsedCertificate interface
function generateTestCertificate(): ParsedCertificate {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    const attrs = [
        { name: 'commonName', value: 'Test Certificate' },
        { name: 'countryName', value: 'BR' },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    return {
        certificate: cert,
        privateKey: keys.privateKey,
        info: {
            subjectName: 'Test Certificate',
            issuerName: 'Test Certificate',
            serialNumber: '01',
            validFrom: cert.validity.notBefore,
            validTo: cert.validity.notAfter,
            cnpj: '12345678000190',
            isValid: true,
            daysRemaining: 365,
        },
    };
}

// Mock CertificateService
const mockCertificateService = {
    loadFromStorage: jest.fn(),
    getPassword: jest.fn().mockReturnValue('test123'),
};

describe('XmlSignerService', () => {
    let service: XmlSignerService;
    let testCert: ParsedCertificate;

    beforeAll(() => {
        testCert = generateTestCertificate();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                XmlSignerService,
                {
                    provide: CertificateService,
                    useValue: mockCertificateService,
                },
            ],
        }).compile();

        service = module.get<XmlSignerService>(XmlSignerService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signNFeXml', () => {
        it('should call loadFromStorage with correct parameters', async () => {
            mockCertificateService.loadFromStorage.mockResolvedValue(testCert);

            const xml = `<?xml version="1.0"?>
        <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
          <infNFe Id="NFe43260212345678000190550010000000011123456789" versao="4.00">
            <ide><cUF>43</cUF></ide>
          </infNFe>
        </NFe>`;

            await service.signNFeXml(xml, 'company-123');

            expect(mockCertificateService.loadFromStorage).toHaveBeenCalledWith('company-123', 'test123');
        });

        it('should return signed XML with Signature element', async () => {
            mockCertificateService.loadFromStorage.mockResolvedValue(testCert);

            const xml = `<?xml version="1.0"?>
        <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
          <infNFe Id="NFe43260212345678000190550010000000011123456789" versao="4.00">
            <ide><cUF>43</cUF></ide>
          </infNFe>
        </NFe>`;

            const signedXml = await service.signNFeXml(xml, 'company-123');

            expect(signedXml).toContain('<Signature');
            expect(signedXml).toContain('<SignedInfo');
            expect(signedXml).toContain('<SignatureValue>');
            expect(signedXml).toContain('</Signature>');
        });

        it('should include X509Certificate in signed XML', async () => {
            mockCertificateService.loadFromStorage.mockResolvedValue(testCert);

            const xml = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
        <infNFe Id="NFe12345" versao="4.00">
          <ide><cUF>43</cUF></ide>
        </infNFe>
      </NFe>`;

            const signedXml = await service.signNFeXml(xml, 'company-123');

            expect(signedXml).toContain('<X509Certificate>');
            expect(signedXml).toContain('</X509Certificate>');
        });

        it('should throw when certificate loading fails', async () => {
            mockCertificateService.loadFromStorage.mockRejectedValue(new Error('Certificate not found'));

            const xml = '<NFe><infNFe Id="NFe123"></infNFe></NFe>';

            await expect(service.signNFeXml(xml, 'company-123')).rejects.toThrow();
        });
    });

    describe('signXml', () => {
        it('should sign XML with provided certificate', () => {
            const xml = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
        <infNFe Id="NFe12345678" versao="4.00">
          <ide><cUF>43</cUF></ide>
        </infNFe>
      </NFe>`;

            const signedXml = service.signXml(xml, testCert, 'NFe');

            expect(signedXml).toContain('<Signature');
            expect(signedXml).toContain('SignatureValue');
        });

        it('should throw when element Id not found', () => {
            const xml = '<root><child>value</child></root>';

            expect(() => {
                service.signXml(xml, testCert, 'NonExistent');
            }).toThrow();
        });

        it('should include correct algorithm URIs', () => {
            const xml = `<NFe><infNFe Id="NFe99999" versao="4.00"><ide/></infNFe></NFe>`;

            const signedXml = service.signXml(xml, testCert, 'NFe');

            // RSA-SHA256
            expect(signedXml).toContain('http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');
            // SHA-256 for digest
            expect(signedXml).toContain('http://www.w3.org/2001/04/xmlenc#sha256');
            // C14N
            expect(signedXml).toContain('http://www.w3.org/TR/2001/REC-xml-c14n-20010315');
        });

        it('should include enveloped-signature transform', () => {
            const xml = `<NFe><infNFe Id="NFe77777" versao="4.00"><ide/></infNFe></NFe>`;

            const signedXml = service.signXml(xml, testCert, 'NFe');

            expect(signedXml).toContain('enveloped-signature');
        });
    });

    describe('verifySignature', () => {
        it('should return false for unsigned XML', () => {
            const unsignedXml = '<root><child>value</child></root>';

            const result = service.verifySignature(unsignedXml);

            expect(result).toBe(false);
        });

        it('should return false for XML without DigestValue', () => {
            const invalidSignature = `
        <root>
          <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
            <SignedInfo></SignedInfo>
          </Signature>
        </root>`;

            const result = service.verifySignature(invalidSignature);

            expect(result).toBe(false);
        });

        it('should return false for XML without Reference URI', () => {
            const invalidSignature = `
        <root>
          <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
            <SignedInfo>
              <DigestValue>abc123</DigestValue>
            </SignedInfo>
          </Signature>
        </root>`;

            const result = service.verifySignature(invalidSignature);

            expect(result).toBe(false);
        });

        it('should not throw on any input', () => {
            const xml = `<NFe><infNFe Id="NFe88888" versao="4.00"><ide/></infNFe></NFe>`;
            const signedXml = service.signXml(xml, testCert, 'NFe');

            expect(() => service.verifySignature(signedXml)).not.toThrow();
        });
    });

    describe('signature structure', () => {
        it('should not break XML structure', () => {
            const xml = `<NFe><infNFe Id="NFe55555" versao="4.00"><ide><cUF>43</cUF></ide></infNFe></NFe>`;

            const signedXml = service.signXml(xml, testCert, 'NFe');

            // Original content should still be present
            expect(signedXml).toContain('<cUF>43</cUF>');
            expect(signedXml).toContain('<infNFe');
            expect(signedXml).toContain('</NFe>');
        });

        it('should include KeyInfo with X509Data', () => {
            const xml = `<NFe><infNFe Id="NFe44444" versao="4.00"><ide/></infNFe></NFe>`;

            const signedXml = service.signXml(xml, testCert, 'NFe');

            expect(signedXml).toContain('<KeyInfo>');
            expect(signedXml).toContain('<X509Data>');
        });
    });
});
