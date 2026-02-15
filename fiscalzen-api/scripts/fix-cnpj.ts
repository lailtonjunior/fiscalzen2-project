
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CertificateService } from '../src/sefaz/certificate.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const certificateService = app.get(CertificateService);
    const prisma = app.get(PrismaService);

    // ID derived from the user logs (781d5bba-c91a-46d9-af76-2273b74879f7)
    // or we can find the first company
    const company = await prisma.empresa.findFirst();

    if (!company) {
        console.error('No company found in database');
        process.exit(1);
    }

    const companyId = company.id;
    console.log(`Checking company ${companyId} (${company.razaoSocial})`);
    console.log(`Current DB CNPJ: ${company.cnpj}`);

    try {
        const password = company.certPassword || process.env.CERT_PASSWORD || '123456'; // Fallback
        console.log(`Using password: ${password ? '******' : 'None'}`);

        const cert = await certificateService.loadFromStorage(companyId, password);

        console.log('--- Certificate Info ---');
        console.log(`Subject: ${cert.info.subject}`);
        console.log(`Extracted CNPJ: ${cert.info.cnpj}`);
        console.log(`Valid To: ${cert.info.validTo}`);

        if (!cert.info.cnpj) {
            console.error('Could not extract CNPJ from certificate');
            return;
        }

        const certCnpjRaw = cert.info.cnpj.replace(/\D/g, '');
        const dbCnpjRaw = company.cnpj.replace(/\D/g, '');

        if (certCnpjRaw !== dbCnpjRaw) {
            console.log(`\nMISMATCH FOUND! Updating Database...`);
            console.log(`Changing ${dbCnpjRaw} -> ${certCnpjRaw}`);

            await prisma.empresa.update({
                where: { id: companyId },
                data: {
                    cnpj: certCnpjRaw,
                    ambienteSefaz: 'homologacao'
                }
            });
            console.log('SUCCESS: Database updated with Certificate CNPJ and set to Homologacao.');
        } else {
            console.log('\nCNPJ matches. Verifying environment...');
            if (company.ambienteSefaz !== 'homologacao') {
                console.log('Switching to homologacao for testing...');
                await prisma.empresa.update({
                    where: { id: companyId },
                    data: { ambienteSefaz: 'homologacao' }
                });
                console.log('Environment set to Homologacao.');
            } else {
                console.log('Environment is already Homologacao.');
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.message.includes('password')) {
            console.log('Tip: Ensure CERT_PASSWORD is set or saved in DB');
        }
    }

    await app.close();
}

bootstrap();
