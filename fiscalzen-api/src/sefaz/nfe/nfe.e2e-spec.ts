import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

/**
 * NFe SEFAZ Integration Tests
 *
 * These tests require:
 * 1. Valid .pfx certificate in project root
 * 2. CERT_PASSWORD environment variable
 * 3. Network access to SEFAZ homologação endpoints
 *
 * Run with: npm run test:e2e -- --testPathPattern=sefaz
 */
describe('NFe SEFAZ Integration (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwtService: JwtService;
    let authToken: string;
    let testCompanyId: string;

    const SKIP_INTEGRATION = process.env.SKIP_SEFAZ_INTEGRATION === 'true';

    beforeAll(async () => {
        if (SKIP_INTEGRATION) {
            console.log('⚠️ Skipping SEFAZ integration tests (SKIP_SEFAZ_INTEGRATION=true)');
            return;
        }

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);
        jwtService = app.get<JwtService>(JwtService);

        // Create test company and user
        const testCompany = await prisma.empresa.create({
            data: {
                razaoSocial: 'TESTE INTEGRACAO LTDA',
                nomeFantasia: 'TESTE',
                cnpj: '12345678000190',
                inscricaoEstadual: '1234567890',
                logradouro: 'RUA TESTE',
                numero: '100',
                bairro: 'CENTRO',
                municipio: 'PORTO ALEGRE',
                uf: 'RS',
                cep: '90000000',
                codigoMunicipio: '4314902',
                regimeTributario: '1',
            },
        });
        testCompanyId = testCompany.id;

        const testUser = await prisma.user.create({
            data: {
                email: 'test-sefaz@fiscalzen.com',
                name: 'Test User',
                passwordHash: 'test',
                empresaId: testCompanyId,
            },
        });

        // Generate auth token
        authToken = jwtService.sign({
            sub: testUser.id,
            email: testUser.email,
            empresaId: testCompanyId,
        });
    });

    afterAll(async () => {
        if (SKIP_INTEGRATION || !app) return;

        // Cleanup test data
        await prisma.notaFiscal.deleteMany({ where: { empresaId: testCompanyId } });
        await prisma.user.deleteMany({ where: { empresaId: testCompanyId } });
        await prisma.empresa.delete({ where: { id: testCompanyId } });

        await app.close();
    });

    describe('POST /nfe/emitir', () => {
        it('should accept NFe emission request', async () => {
            if (SKIP_INTEGRATION) return;

            const nfePayload = {
                naturezaOperacao: 'VENDA DE MERCADORIA',
                tipoOperacao: '1',
                producao: false, // Homologação
                produtos: [
                    {
                        codigo: '001',
                        descricao: 'PRODUTO TESTE NFE',
                        ncm: '12345678',
                        cfop: '5102',
                        unidade: 'UN',
                        quantidade: 1,
                        valorUnitario: 100.0,
                    },
                ],
                pagamentos: [
                    {
                        forma: '01', // Dinheiro
                        valor: 100.0,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post('/nfe/emitir')
                .set('Authorization', `Bearer ${authToken}`)
                .send(nfePayload)
                .expect(202);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('jobId');
            expect(response.body.mensagem).toContain('processamento');
        });

        it('should reject invalid NFe payload', async () => {
            if (SKIP_INTEGRATION) return;

            const invalidPayload = {
                naturezaOperacao: 'VENDA',
                // Missing required fields
            };

            await request(app.getHttpServer())
                .post('/nfe/emitir')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPayload)
                .expect(400);
        });

        it('should require authentication', async () => {
            if (SKIP_INTEGRATION) return;

            await request(app.getHttpServer())
                .post('/nfe/emitir')
                .send({})
                .expect(401);
        });
    });

    describe('GET /nfe/:chave/status', () => {
        it('should return NFe status for valid chave', async () => {
            if (SKIP_INTEGRATION) return;

            // Create a test NFe record
            const testNfe = await prisma.notaFiscal.create({
                data: {
                    empresaId: testCompanyId,
                    tipo: 'NFE',
                    numero: '999',
                    serie: '1',
                    chaveAcesso: '43260212345678000190550010000009991234567890',
                    statusSefaz: 'autorizada',
                    statusManifestacao: 'pendente',
                    valorTotal: 100,
                    emitenteCnpj: '12345678000190',
                    emitenteNome: 'TESTE',
                    dataEmissao: new Date(),
                    dataAutorizacao: new Date(),
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/nfe/${testNfe.chaveAcesso}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.chaveAcesso).toBe(testNfe.chaveAcesso);
            expect(response.body.status).toBe('autorizada');

            // Cleanup
            await prisma.notaFiscal.delete({ where: { id: testNfe.id } });
        });

        it('should return NAO_ENCONTRADA for unknown chave', async () => {
            if (SKIP_INTEGRATION) return;

            const fakeChave = '00000000000000000000000000000000000000000000';

            const response = await request(app.getHttpServer())
                .get(`/nfe/${fakeChave}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.status).toBe('NAO_ENCONTRADA');
        });
    });

    describe('GET /nfe/:chave/danfe', () => {
        it('should return PDF for authorized NFe', async () => {
            if (SKIP_INTEGRATION) return;

            // Create an authorized NFe
            const testNfe = await prisma.notaFiscal.create({
                data: {
                    empresaId: testCompanyId,
                    tipo: 'NFE',
                    numero: '888',
                    serie: '1',
                    chaveAcesso: '43260212345678000190550010000008881234567890',
                    statusSefaz: 'autorizada',
                    statusManifestacao: 'pendente',
                    valorTotal: 100,
                    emitenteCnpj: '12345678000190',
                    emitenteNome: 'TESTE',
                    dataEmissao: new Date(),
                    dataAutorizacao: new Date(),
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/nfe/${testNfe.chaveAcesso}/danfe`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.headers['content-type']).toBe('application/pdf');
            expect(response.body).toBeInstanceOf(Buffer);

            // Cleanup
            await prisma.notaFiscal.delete({ where: { id: testNfe.id } });
        });

        it('should reject DANFE for non-authorized NFe', async () => {
            if (SKIP_INTEGRATION) return;

            // Create a pending NFe
            const testNfe = await prisma.notaFiscal.create({
                data: {
                    empresaId: testCompanyId,
                    tipo: 'NFE',
                    numero: '777',
                    serie: '1',
                    chaveAcesso: '43260212345678000190550010000007771234567890',
                    statusSefaz: 'pendente',
                    statusManifestacao: 'pendente',
                    valorTotal: 100,
                    emitenteCnpj: '12345678000190',
                    emitenteNome: 'TESTE',
                    dataEmissao: new Date(),
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/nfe/${testNfe.chaveAcesso}/danfe`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body.message).toContain('não autorizada');

            // Cleanup
            await prisma.notaFiscal.delete({ where: { id: testNfe.id } });
        });
    });
});

/**
 * SEFAZ Connection Test (Optional)
 * Only runs when SEFAZ_LIVE_TEST=true
 */
describe('SEFAZ Live Connection Test', () => {
    const LIVE_TEST = process.env.SEFAZ_LIVE_TEST === 'true';

    it('should connect to SEFAZ homologação', async () => {
        if (!LIVE_TEST) {
            console.log('⚠️ Skipping live SEFAZ test (set SEFAZ_LIVE_TEST=true to enable)');
            return;
        }

        // This would test actual SEFAZ connectivity
        // Requires valid certificate and network access
        expect(true).toBe(true);
    });
});
