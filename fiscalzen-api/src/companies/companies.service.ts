import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto';
import { StorageService } from '../common/storage';

@Injectable()
export class CompaniesService {
    private readonly logger = new Logger(CompaniesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
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

        // Generate unique key for the certificate
        const key = `certificates/${companyId}/${Date.now()}_${file.originalname}`;

        // Upload to storage
        const result = await this.storage.upload(key, file.buffer, file.mimetype);

        this.logger.log(`Certificate uploaded: ${result.key}`);

        // TODO: Parse .pfx file to extract metadata (expiry, issuer)
        // For now, just return the storage result
        // In production, use a library like `node-forge` to parse the certificate

        return {
            success: true,
            key: result.key,
            url: result.url,
            message: 'Certificado enviado com sucesso',
        };
    }
}
