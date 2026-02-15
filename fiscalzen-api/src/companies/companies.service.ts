import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto';
import { CertificateService } from '../sefaz/certificate.service';

@Injectable()
export class CompaniesService {
    private readonly logger = new Logger(CompaniesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly certificateService: CertificateService,
    ) { }

    async findByUserId(userId: string) {
        const user = await this.prisma.usuario.findUnique({
            where: { id: userId },
            include: { empresa: true },
        });

        if (!user || !user.empresa) {
            throw new NotFoundException('Empresa não encontrada');
        }

        return user.empresa;
    }

    async findById(companyId: string) {
        const company = await this.prisma.empresa.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            throw new NotFoundException('Empresa não encontrada');
        }

        return company;
    }

    async update(companyId: string, dto: UpdateCompanyDto) {
        const company = await this.prisma.empresa.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            throw new NotFoundException('Empresa não encontrada');
        }

        return this.prisma.empresa.update({
            where: { id: companyId },
            data: dto,
        });
    }

    async uploadCertificate(
        companyId: string,
        file: Express.Multer.File,
        password: string,
    ) {
        const company = await this.findById(companyId);

        // Upload and validate using CertificateService
        // This ensures the certificate is stored at the correct path (certificates/{companyId}/cert.pfx)
        const result = await this.certificateService.uploadAndValidate(
            companyId,
            file.buffer,
            password
        );

        // Update company with certificate password
        await this.prisma.empresa.update({
            where: { id: companyId },
            data: { certPassword: password } as any,
        });

        return {
            success: true,
            key: result.storageKey,
            // url: result.url, // URL might not be returned by uploadAndValidate, check it
            message: 'Certificado enviado e validado com sucesso',
        };
    }
}
