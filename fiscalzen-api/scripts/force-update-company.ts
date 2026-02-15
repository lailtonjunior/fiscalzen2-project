
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    const company = await prisma.empresa.findFirst();

    if (!company) {
        console.error('No company found to update');
        process.exit(1);
    }

    console.log(`Updating Company: ${company.razaoSocial} (${company.cnpj})`);

    const newCnpj = '44098209000105';
    const newRazaoSocial = 'Posto Via Lago LTDA';

    // Note: We are keeping the existing password if it works.

    await prisma.empresa.update({
        where: { id: company.id },
        data: {
            cnpj: newCnpj,
            razaoSocial: newRazaoSocial,
            ambienteSefaz: 'homologacao' // Ensure we are testing in homologation
        }
    });

    console.log('SUCCESS: Company updated manually.');
    console.log(`New Data: ${newRazaoSocial} - ${newCnpj}`);

    await app.close();
}

bootstrap();
