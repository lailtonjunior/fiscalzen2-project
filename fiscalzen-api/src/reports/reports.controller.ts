
import { Controller, Get, Query, Res, UseGuards, Request, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PdfGeneratorService } from './generators/pdf-generator/pdf-generator.service';
import { ExcelGeneratorService } from './generators/excel-generator/excel-generator.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        empresaId: string;
    };
}

@ApiTags('relatorios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly pdfGenerator: PdfGeneratorService,
        private readonly excelGenerator: ExcelGeneratorService,
    ) { }

    @Get('resumo-mensal')
    @ApiOperation({ summary: 'Resumo Mensal de NFe' })
    @ApiQuery({ name: 'start', type: String })
    @ApiQuery({ name: 'end', type: String })
    @ApiQuery({ name: 'format', enum: ['json', 'pdf', 'xlsx'], required: false })
    async getResumoMensal(
        @Request() req: AuthenticatedRequest,
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('format') format = 'json',
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getResumoMensal(
            req.user.empresaId,
            new Date(start),
            new Date(end),
        );

        if (format === 'json') return res.json(data);

        // Flatten for export
        const exportData = [
            ...data.byStatus.map(s => ({ Categoria: 'Status', Chave: s.status, Qtd: s.count, Valor: s.value })),
            ...data.byIssuer.map(s => ({ Categoria: 'Emitente', Chave: s.issuer, Qtd: s.count, Valor: s.value })),
        ];

        if (format === 'xlsx') {
            const buffer = this.excelGenerator.generateReport(exportData, 'Resumo Mensal');
            this.sendExcel(res, buffer, 'resumo-mensal.xlsx');
        } else if (format === 'pdf') {
            const buffer = await this.pdfGenerator.generateReport(
                'Resumo Mensal de NFe',
                exportData,
                ['Categoria', 'Chave', 'Qtd', 'Valor']
            );
            this.sendPdf(res, buffer, 'resumo-mensal.pdf');
        }
    }

    @Get('impostos')
    async getImpostos(
        @Request() req: AuthenticatedRequest,
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('format') format = 'json',
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getDetalhamentoImpostos(
            req.user.empresaId,
            new Date(start),
            new Date(end),
        );

        if (format === 'json') return res.json(data);

        if (format === 'xlsx') {
            const buffer = this.excelGenerator.generateReport(data, 'Impostos');
            this.sendExcel(res, buffer, 'impostos.xlsx');
        } else if (format === 'pdf') {
            const buffer = await this.pdfGenerator.generateReport(
                'Detalhamento de Impostos',
                data,
                ['numero', 'dataEmissao', 'emitenteNome', 'valorTotal', 'valorIcms', 'valorIpi']
            );
            this.sendPdf(res, buffer, 'impostos.pdf');
        }
    }


    @Get('notas-por-fornecedor')
    @ApiOperation({ summary: 'Notas por Fornecedor (Agrupado)' })
    @ApiQuery({ name: 'start', type: String })
    @ApiQuery({ name: 'end', type: String })
    @ApiQuery({ name: 'format', enum: ['json', 'pdf', 'xlsx'], required: false })
    async getNotasPorFornecedor(
        @Request() req: AuthenticatedRequest,
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('format') format = 'json',
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getNotasPorFornecedor(
            req.user.empresaId,
            new Date(start),
            new Date(end),
        );

        if (format === 'json') return res.json(data);

        if (format === 'xlsx') {
            const buffer = this.excelGenerator.generateReport(data, 'Fornecedores');
            this.sendExcel(res, buffer, 'fornecedores.xlsx');
        } else if (format === 'pdf') {
            const buffer = await this.pdfGenerator.generateReport(
                'Notas por Fornecedor',
                data,
                ['cnpj', 'nome', 'qtd', 'total']
            );
            this.sendPdf(res, buffer, 'fornecedores.pdf');
        }
    }

    @Get('manifestacoes-pendentes')
    @ApiOperation({ summary: 'Notas Pendentes de Manifestação' })
    @ApiQuery({ name: 'format', enum: ['json', 'pdf', 'xlsx'], required: false })
    async getManifestacoesPendentes(
        @Request() req: AuthenticatedRequest,
        @Query('format') format = 'json',
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getManifestacoesPendentes(req.user.empresaId);

        // Flatten logic if needed, but data is already flat from Prisma
        if (format === 'json') return res.json(data);

        const exportData = data.map(n => ({
            Chave: n.chaveAcesso,
            Emitente: n.emitenteNome,
            Valor: Number(n.valorTotal),
            Emissao: n.dataEmissao,
        }));

        if (format === 'xlsx') {
            const buffer = this.excelGenerator.generateReport(exportData, 'Pendentes');
            this.sendExcel(res, buffer, 'manifestacoes-pendentes.xlsx');
        } else if (format === 'pdf') {
            const buffer = await this.pdfGenerator.generateReport(
                'Manifestações Pendentes (> 7 dias)',
                exportData,
                ['Chave', 'Emitente', 'Valor', 'Emissao']
            );
            this.sendPdf(res, buffer, 'manifestacoes-pendentes.pdf');
        }
    }

    @Get('conferencia-sped')
    @ApiOperation({ summary: 'Conferência SPED (Mock)' })
    @ApiQuery({ name: 'format', enum: ['json', 'pdf', 'xlsx'], required: false })
    async getConferenciaSped(
        @Request() req: AuthenticatedRequest,
        @Query('format') format = 'json',
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getConferenciaSped(req.user.empresaId);

        if (format === 'json') return res.json(data);

        if (format === 'xlsx') {
            const buffer = this.excelGenerator.generateReport(data, 'SPED');
            this.sendExcel(res, buffer, 'conferencia-sped.xlsx');
        } else if (format === 'pdf') {
            const buffer = await this.pdfGenerator.generateReport(
                'Conferência SPED vs NFe',
                data,
                ['nfe', 'serie', 'status', 'motivo']
            );
            this.sendPdf(res, buffer, 'conferencia-sped.pdf');
        }
    }

    private sendExcel(res: Response, buffer: Buffer, filename: string) {
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    private sendPdf(res: Response, buffer: Buffer, filename: string) {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
