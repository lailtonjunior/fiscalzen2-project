import { Test, TestingModule } from '@nestjs/testing';
import { NFeTransmissionService, SefazStatus, NFeAuthorizationResult, NFeConsultaResult } from './nfe-transmission.service';
import { SoapService } from '../soap.service';
import { XmlSignerService } from './xml-signer.service';
import { NFeXmlBuilderService } from './nfe-xml-builder.service';

// Mock dependencies
const mockSoapService = {
    sendNFeAutorizacao: jest.fn(),
    consultarRecibo: jest.fn(),
};

const mockXmlSignerService = {
    signNFeXml: jest.fn(),
};

const mockXmlBuilderService = {
    buildNFeXml: jest.fn(),
    generateChaveAcesso: jest.fn(),
};

describe('NFeTransmissionService', () => {
    let service: NFeTransmissionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NFeTransmissionService,
                { provide: SoapService, useValue: mockSoapService },
                { provide: XmlSignerService, useValue: mockXmlSignerService },
                { provide: NFeXmlBuilderService, useValue: mockXmlBuilderService },
            ],
        }).compile();

        service = module.get<NFeTransmissionService>(NFeTransmissionService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('SefazStatus enum', () => {
        it('should have correct status values', () => {
            expect(SefazStatus.AUTORIZADO).toBe(100);
            expect(SefazStatus.AUTORIZADO_FORA_PRAZO).toBe(150);
            expect(SefazStatus.LOTE_EM_PROCESSAMENTO).toBe(105);
            expect(SefazStatus.LOTE_PROCESSADO).toBe(104);
            expect(SefazStatus.REJEITADO_DUPLICIDADE).toBe(204);
        });
    });

    describe('isAuthorized', () => {
        it('should return true for status 100', () => {
            expect(service.isAuthorized(100)).toBe(true);
        });

        it('should return true for status 150', () => {
            expect(service.isAuthorized(150)).toBe(true);
        });

        it('should return false for status 105', () => {
            expect(service.isAuthorized(105)).toBe(false);
        });

        it('should return false for status 204', () => {
            expect(service.isAuthorized(204)).toBe(false);
        });
    });

    describe('shouldRetryConsulta', () => {
        it('should return true for status 105', () => {
            expect(service.shouldRetryConsulta(105)).toBe(true);
        });

        it('should return false for status 100', () => {
            expect(service.shouldRetryConsulta(100)).toBe(false);
        });

        it('should return false for status 204', () => {
            expect(service.shouldRetryConsulta(204)).toBe(false);
        });
    });

    describe('getStatusDescription', () => {
        it('should return description for AUTORIZADO', () => {
            const desc = service.getStatusDescription(100);
            expect(desc).toContain('Autorizado');
        });

        it('should return description for LOTE_EM_PROCESSAMENTO', () => {
            const desc = service.getStatusDescription(105);
            expect(desc).toContain('processamento');
        });

        it('should return description for REJEITADO_DUPLICIDADE', () => {
            const desc = service.getStatusDescription(204);
            expect(desc).toContain('Duplicidade');
        });

        it('should return default for unknown status', () => {
            const desc = service.getStatusDescription(9999);
            expect(desc).toContain('9999');
        });
    });

    describe('transmitNFe', () => {
        const mockNFeData = {
            ide: {
                cUF: '43',
                cNF: '',
                cDV: '',
                natOp: 'VENDA',
                mod: '55',
                serie: '1',
                nNF: '1',
                dhEmi: '2026-02-08T12:00:00-03:00',
                tpNF: '1',
                idDest: '1',
                cMunFG: '4314902',
                tpImp: '1',
                tpEmis: '1',
                tpAmb: '2',
                finNFe: '1',
                indFinal: '1',
                indPres: '1',
                procEmi: '0',
                verProc: 'FiscalZen 1.0',
            },
            emit: {
                CNPJ: '12345678000190',
                xNome: 'TESTE',
                enderEmit: {
                    xLgr: 'RUA',
                    nro: '1',
                    xBairro: 'CENTRO',
                    cMun: '4314902',
                    xMun: 'POA',
                    UF: 'RS',
                    CEP: '90000000',
                },
                IE: '123',
                CRT: '1',
            },
            det: [],
            total: {
                ICMSTot: {
                    vBC: '0', vICMS: '0', vICMSDeson: '0', vFCP: '0',
                    vBCST: '0', vST: '0', vFCPST: '0', vFCPSTRet: '0',
                    vProd: '0', vFrete: '0', vSeg: '0', vDesc: '0',
                    vII: '0', vIPI: '0', vIPIDevol: '0',
                    vPIS: '0', vCOFINS: '0', vOutro: '0', vNF: '0',
                },
            },
            transp: { modFrete: '9' },
            pag: { detPag: [] },
        };

        it('should return authorization result on success', async () => {
            mockXmlBuilderService.generateChaveAcesso.mockReturnValue('12345678901234567890123456789012345678901234');
            mockXmlBuilderService.buildNFeXml.mockReturnValue('<NFe><infNFe Id="NFe123"></infNFe></NFe>');
            mockXmlSignerService.signNFeXml.mockResolvedValue('<NFe signed>content</NFe>');
            mockSoapService.sendNFeAutorizacao.mockResolvedValue({
                data: `
          <retEnviNFe>
            <cStat>100</cStat>
            <xMotivo>Autorizado o uso da NF-e</xMotivo>
            <protNFe><infProt><nProt>123456789012345</nProt></infProt></protNFe>
          </retEnviNFe>
        `,
            });

            const result = await service.transmitNFe(mockNFeData, 'company-123', false);

            expect(result.success).toBe(true);
            expect(result.status).toBe(100);
            expect(result.statusMessage).toContain('Autorizado');
        });

        it('should return processing status when 105', async () => {
            mockXmlBuilderService.generateChaveAcesso.mockReturnValue('12345678901234567890123456789012345678901234');
            mockXmlBuilderService.buildNFeXml.mockReturnValue('<NFe><infNFe Id="NFe123"></infNFe></NFe>');
            mockXmlSignerService.signNFeXml.mockResolvedValue('<NFe signed>content</NFe>');
            mockSoapService.sendNFeAutorizacao.mockResolvedValue({
                data: `
          <retEnviNFe>
            <cStat>105</cStat>
            <xMotivo>Lote em processamento</xMotivo>
            <infRec><nRec>987654321098765</nRec></infRec>
          </retEnviNFe>
        `,
            });

            const result = await service.transmitNFe(mockNFeData, 'company-123', false);

            expect(result.success).toBe(false);
            expect(result.status).toBe(105);
            expect(result.protocolNumber).toBe('987654321098765');
        });

        it('should return rejection result on error', async () => {
            mockXmlBuilderService.generateChaveAcesso.mockReturnValue('12345678901234567890123456789012345678901234');
            mockXmlBuilderService.buildNFeXml.mockReturnValue('<NFe><infNFe Id="NFe123"></infNFe></NFe>');
            mockXmlSignerService.signNFeXml.mockResolvedValue('<NFe signed>content</NFe>');
            mockSoapService.sendNFeAutorizacao.mockResolvedValue({
                data: `
          <retEnviNFe>
            <cStat>204</cStat>
            <xMotivo>Rejeição: Duplicidade de NF-e</xMotivo>
          </retEnviNFe>
        `,
            });

            const result = await service.transmitNFe(mockNFeData, 'company-123', false);

            expect(result.success).toBe(false);
            expect(result.status).toBe(204);
            expect(result.errors).toContain('Rejeição: Duplicidade de NF-e');
        });

        it('should handle SEFAZ connection failure', async () => {
            mockXmlBuilderService.generateChaveAcesso.mockReturnValue('12345678901234567890123456789012345678901234');
            mockXmlBuilderService.buildNFeXml.mockReturnValue('<NFe><infNFe Id="NFe123"></infNFe></NFe>');
            mockXmlSignerService.signNFeXml.mockRejectedValue(new Error('Certificate not found'));

            const result = await service.transmitNFe(mockNFeData, 'company-123', false);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors![0]).toContain('Certificate not found');
        });
    });

    describe('consultarRecibo', () => {
        it('should return consulta result on success', async () => {
            mockSoapService.consultarRecibo.mockResolvedValue({
                data: `
          <retConsReciNFe>
            <cStat>104</cStat>
            <xMotivo>Lote processado</xMotivo>
            <protNFe>
              <infProt>
                <chNFe>43260212345678000190550010000000011123456789</chNFe>
                <nProt>143260000000001</nProt>
                <cStat>100</cStat>
                <xMotivo>Autorizado</xMotivo>
              </infProt>
            </protNFe>
          </retConsReciNFe>
        `,
            });

            const result = await service.consultarRecibo('987654321098765', 'company-123', false);

            expect(result.success).toBe(true);
            expect(result.status).toBe(104);
            expect(result.protNFe).toBeDefined();
            expect(result.protNFe!.length).toBeGreaterThan(0);
        });

        it('should return processing status when still processing', async () => {
            mockSoapService.consultarRecibo.mockResolvedValue({
                data: `
          <retConsReciNFe>
            <cStat>105</cStat>
            <xMotivo>Lote em processamento</xMotivo>
          </retConsReciNFe>
        `,
            });

            const result = await service.consultarRecibo('987654321098765', 'company-123', false);

            expect(result.success).toBe(true); // Still processing is not an error
            expect(result.status).toBe(105);
        });

        it('should handle consultation failure', async () => {
            mockSoapService.consultarRecibo.mockRejectedValue(new Error('Network error'));

            const result = await service.consultarRecibo('987654321098765', 'company-123', false);

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });
});
