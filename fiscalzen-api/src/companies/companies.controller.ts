import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto';

import { RolesGuard, Roles } from '../auth/roles.guard';

interface AuthenticatedRequest {
    user: { sub: string; email: string };
}

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user company data' })
    async getMyCompany(@Request() req: AuthenticatedRequest) {
        return this.companiesService.findByUserId(req.user.sub);
    }

    @Put('me')
    @Roles('admin')
    @ApiOperation({ summary: 'Update current user company data' })
    async updateMyCompany(
        @Request() req: AuthenticatedRequest,
        @Body() dto: UpdateCompanyDto,
    ) {
        const company = await this.companiesService.findByUserId(req.user.sub);
        return this.companiesService.update(company.id, dto);
    }

    @Post('me/certificate')
    @ApiOperation({ summary: 'Upload digital certificate (.pfx)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Certificate file (.pfx or .p12)',
                },
                password: {
                    type: 'string',
                    description: 'Certificate password',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    @Roles('admin')
    async uploadCertificate(
        @Request() req: AuthenticatedRequest,
        @UploadedFile() file: Express.Multer.File,
        @Body('password') password: string,
    ) {
        if (!file) {
            throw new BadRequestException('Arquivo não enviado');
        }

        const allowedMimeTypes = [
            'application/x-pkcs12',
            'application/octet-stream',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Tipo de arquivo inválido. Envie um arquivo .pfx ou .p12');
        }

        if (!password) {
            throw new BadRequestException('Senha do certificado é obrigatória');
        }

        const company = await this.companiesService.findByUserId(req.user.sub);
        return this.companiesService.uploadCertificate(company.id, file, password);
    }
}
