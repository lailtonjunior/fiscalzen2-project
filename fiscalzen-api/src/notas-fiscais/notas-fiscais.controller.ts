import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    Body,
    Request,
    Res,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Logger,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { NotasFiscaisService } from './notas-fiscais.service';
import { FiltroNotasDto, ManifestarNotaDto, AssignTagsDto } from './dto';
import { QUEUE_NAMES } from '../common/queue/queue.module';

interface AuthenticatedRequest extends Request {
    user: { sub: string; email: string; empresaId: string };
}

@Controller('notas-fiscais')
export class NotasFiscaisController {
    private readonly logger = new Logger(NotasFiscaisController.name);

    constructor(
        private readonly service: NotasFiscaisService,
        @InjectQueue(QUEUE_NAMES.XML_PROCESSING)
        private readonly xmlQueue: Queue,
    ) { }

    @Get()
    async findAll(
        @Request() req: AuthenticatedRequest,
        @Query() filters: FiltroNotasDto,
    ) {
        return this.service.findAll(filters, req.user.empresaId);
    }

    @Get(':id')
    async findOne(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.findOne(id, req.user.empresaId);
    }

    @Get(':id/xml')
    async downloadXml(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const { buffer, chaveAcesso } = await this.service.downloadXml(id, req.user.empresaId);
        res.set({
            'Content-Type': 'text/xml',
            'Content-Disposition': `attachment; filename="${chaveAcesso}.xml"`,
        });
        res.send(buffer);
    }

    @Post('importar')
    @UseInterceptors(FileInterceptor('file'))
    async importXml(
        @Request() req: AuthenticatedRequest,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new Error('Nenhum arquivo enviado');
        }
        return this.service.importXml(file.buffer, file.originalname, req.user.empresaId);
    }

    @Post('importar-lote')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseInterceptors(FilesInterceptor('files', 50))
    async importLote(
        @Request() req: AuthenticatedRequest,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files?.length) {
            throw new Error('Nenhum arquivo enviado');
        }

        const jobs = await Promise.all(
            files.map((file) =>
                this.xmlQueue.add('import-xml', {
                    empresaId: req.user.empresaId,
                    fileName: file.originalname,
                    buffer: file.buffer.toString('base64'),
                }),
            ),
        );

        this.logger.log(`Queued ${jobs.length} XML imports for empresa ${req.user.empresaId}`);

        return {
            message: `${jobs.length} arquivos enfileirados para processamento`,
            jobIds: jobs.map((j) => j.id),
        };
    }

    @Delete(':id')
    async softDelete(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.softDelete(id, req.user.empresaId);
    }

    // --- Manifestação (sub-resource) ---

    @Post(':id/manifestar')
    @HttpCode(HttpStatus.CREATED)
    async manifestar(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() dto: ManifestarNotaDto,
    ) {
        return this.service.manifestar(
            id,
            req.user.empresaId,
            req.user.sub,
            dto.tipo,
            dto.justificativa,
        );
    }

    @Get(':id/manifestacoes')
    async getManifestacoes(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.getManifestacoes(id, req.user.empresaId);
    }

    // --- Tags (M2M operations) ---

    @Post(':id/tags')
    async assignTags(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() dto: AssignTagsDto,
    ) {
        return this.service.assignTags(id, req.user.empresaId, dto.tagIds);
    }

    @Delete(':id/tags/:tagId')
    async removeTag(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Param('tagId') tagId: string,
    ) {
        return this.service.removeTag(id, req.user.empresaId, tagId);
    }
}
