
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CertificateService } from '../src/sefaz/certificate.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const certificateService = app.get(CertificateService);
    const prisma = app.get(PrismaService);

    const company = await prisma.empresa.findFirst();

    if (!company) {
        console.error('No company found');
        process.exit(1);
    }

    console.log(`Company ID: ${company.id}`);
    console.log(`DB CNPJ: ${company.cnpj}`);
    console.log(`DB Password: ${company.certPassword ? '******' : 'NULL'}`);
    console.log(`Env Password: ${process.env.CERT_PASSWORD ? '******' : 'NULL'}`);

    const password = company.certPassword || process.env.CERT_PASSWORD;

    if (!password) {
        console.error('No password available to load certificate');
        process.exit(1);
    }

    try {
        console.log('Loading certificate...');
        const cert = await certificateService.loadFromStorage(company.id, password);

        console.log('\n--- Certificate Details ---');
        console.log(`Subject: ${cert.info.subject}`);
        // Manually inspect attributes to see where CNPJ might be
        console.log('Subject Attributes:');
        cert.certificate.subject.attributes.forEach(attr => {
            console.log(` - ${attr.name} (${attr.shortName}): ${attr.value}`);
        });

        console.log(`\nDerived CNPJ: ${cert.info.cnpj}`);

        if (cert.info.cnpj) {
            const certCnpjRaw = cert.info.cnpj.replace(/\D/g, '');
            const dbCnpjRaw = company.cnpj.replace(/\D/g, '');

            if (certCnpjRaw !== dbCnpjRaw) {
                console.log(`MISMATCH detected! Updating DB to ${certCnpjRaw}...`);
                await prisma.empresa.update({
                    where: { id: company.id },
                    data: { cnpj: certCnpjRaw }
                });
                console.log('UPDATED.');
            } else {
                console.log('CNPJ matches.');
            }
        } else {
            console.warn('Could not extract CNPJ from certificate info automatically.');
        }

    } catch (e) {
        console.error('Error loading certificate:', e.message);
    }

    await app.close();
}

bootstrap();
