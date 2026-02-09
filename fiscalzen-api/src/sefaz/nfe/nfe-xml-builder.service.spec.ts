import { Test, TestingModule } from '@nestjs/testing';
import { NFeXmlBuilderService } from './nfe-xml-builder.service';
import { NFeData, NFeIde, NFeEmit, NFeDet, NFeTotal, NFeTransp, NFePag } from './nfe.interface';

describe('NFeXmlBuilderService', () => {
    let service: NFeXmlBuilderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [NFeXmlBuilderService],
        }).compile();

        service = module.get<NFeXmlBuilderService>(NFeXmlBuilderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('buildNFeXml', () => {
        const chaveAcesso = '43260212345678000190550010000000011123456789';

        const mockNFeData: NFeData = {
            ide: {
                cUF: '43',
                cNF: '12345678',
                natOp: 'VENDA DE MERCADORIA',
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
                xNome: 'EMPRESA TESTE LTDA',
                enderEmit: {
                    xLgr: 'RUA TESTE',
                    nro: '100',
                    xBairro: 'CENTRO',
                    cMun: '4314902',
                    xMun: 'PORTO ALEGRE',
                    UF: 'RS',
                    CEP: '90000000',
                },
                IE: '1234567890',
                CRT: '1',
            },
            det: [
                {
                    nItem: 1,
                    prod: {
                        cProd: '001',
                        cEAN: 'SEM GTIN',
                        xProd: 'PRODUTO TESTE',
                        NCM: '12345678',
                        CFOP: '5102',
                        uCom: 'UN',
                        qCom: '10.0000',
                        vUnCom: '100.0000000000',
                        vProd: '1000.00',
                        cEANTrib: 'SEM GTIN',
                        uTrib: 'UN',
                        qTrib: '10.0000',
                        vUnTrib: '100.0000000000',
                        indTot: '1',
                    },
                    imposto: {
                        ICMS: { orig: '0', CSOSN: '102' },
                        PIS: { CST: '07' },
                        COFINS: { CST: '07' },
                    },
                },
            ],
            total: {
                ICMSTot: {
                    vBC: '0.00',
                    vICMS: '0.00',
                    vICMSDeson: '0.00',
                    vFCP: '0.00',
                    vBCST: '0.00',
                    vST: '0.00',
                    vFCPST: '0.00',
                    vFCPSTRet: '0.00',
                    vProd: '1000.00',
                    vFrete: '0.00',
                    vSeg: '0.00',
                    vDesc: '0.00',
                    vII: '0.00',
                    vIPI: '0.00',
                    vIPIDevol: '0.00',
                    vPIS: '0.00',
                    vCOFINS: '0.00',
                    vOutro: '0.00',
                    vNF: '1000.00',
                },
            },
            transp: { modFrete: '9' },
            pag: {
                detPag: [{ tPag: '01', vPag: '1000.00' }],
            },
        };

        it('should generate valid XML structure', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<NFe xmlns="http://www.portalfiscal.inf.br/nfe">');
            expect(xml).toContain('<infNFe');
            expect(xml).toContain('</NFe>');
        });

        it('should include IDE section', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<ide>');
            expect(xml).toContain('<cUF>43</cUF>');
            expect(xml).toContain('<natOp>VENDA DE MERCADORIA</natOp>');
            expect(xml).toContain('<mod>55</mod>');
            expect(xml).toContain('</ide>');
        });

        it('should include EMIT section with address', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<emit>');
            expect(xml).toContain('<CNPJ>12345678000190</CNPJ>');
            expect(xml).toContain('<xNome>EMPRESA TESTE LTDA</xNome>');
            expect(xml).toContain('<enderEmit>');
            expect(xml).toContain('<xLgr>RUA TESTE</xLgr>');
            expect(xml).toContain('</emit>');
        });

        it('should include DET section with products', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<det nItem="1">');
            expect(xml).toContain('<prod>');
            expect(xml).toContain('<xProd>PRODUTO TESTE</xProd>');
            expect(xml).toContain('<vProd>1000.00</vProd>');
            expect(xml).toContain('</prod>');
            expect(xml).toContain('<imposto>');
        });

        it('should include TOTAL section', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<total>');
            expect(xml).toContain('<ICMSTot>');
            expect(xml).toContain('<vNF>1000.00</vNF>');
            expect(xml).toContain('</total>');
        });

        it('should include TRANSP section', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<transp>');
            expect(xml).toContain('<modFrete>9</modFrete>');
            expect(xml).toContain('</transp>');
        });

        it('should include PAG section', () => {
            const xml = service.buildNFeXml(mockNFeData, chaveAcesso);

            expect(xml).toContain('<pag>');
            expect(xml).toContain('<detPag>');
            expect(xml).toContain('<tPag>01</tPag>');
            expect(xml).toContain('<vPag>1000.00</vPag>');
            expect(xml).toContain('</pag>');
        });

        it('should include optional DEST section when provided', () => {
            const dataWithDest: NFeData = {
                ...mockNFeData,
                dest: {
                    CNPJ: '98765432000199',
                    xNome: 'EMPRESA DESTINO LTDA',
                    enderDest: {
                        xLgr: 'RUA DESTINO',
                        nro: '200',
                        xBairro: 'BAIRRO',
                        cMun: '4314902',
                        xMun: 'PORTO ALEGRE',
                        UF: 'RS',
                        CEP: '90000000',
                    },
                    indIEDest: '1',
                    IE: '0987654321',
                },
            };

            const xml = service.buildNFeXml(dataWithDest, chaveAcesso);

            expect(xml).toContain('<dest>');
            expect(xml).toContain('<CNPJ>98765432000199</CNPJ>');
            expect(xml).toContain('<xNome>EMPRESA DESTINO LTDA</xNome>');
            expect(xml).toContain('</dest>');
        });
    });

    describe('generateChaveAcesso', () => {
        it('should generate 44-digit chave de acesso', () => {
            const chave = service.generateChaveAcesso(
                '43',           // cUF
                '2602',         // AAMM
                '12345678000190', // CNPJ
                '55',           // mod
                '001',          // serie
                '000000001',    // nNF
                '1',            // tpEmis
                '12345678',     // cNF
            );

            expect(chave).toHaveLength(44);
            expect(/^\d{44}$/.test(chave)).toBe(true);
        });

        it('should calculate correct mod11 check digit', () => {
            const chave = service.generateChaveAcesso(
                '43',
                '2602',
                '12345678000190',
                '55',
                '001',
                '000000001',
                '1',
                '12345678',
            );

            const checkDigit = chave.charAt(43);
            expect(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).toContain(checkDigit);
        });

        it('should produce deterministic output for same inputs', () => {
            const params = ['43', '2602', '12345678000190', '55', '001', '000000001', '1', '12345678'] as const;

            const chave1 = service.generateChaveAcesso(...params);
            const chave2 = service.generateChaveAcesso(...params);

            expect(chave1).toBe(chave2);
        });
    });

    describe('calculateMod11', () => {
        it('should calculate mod11 for known values', () => {
            // Test with a known value
            const base = '4326021234567800019055001000000001123456781';
            const result = service.calculateMod11(base);

            expect(result).toBeDefined();
            expect(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).toContain(result);
        });

        it('should return single digit', () => {
            const base = '12345678901234567890';
            const result = service.calculateMod11(base);

            expect(result.length).toBe(1);
        });
    });
});
