
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getResumoMensal(empresaId: string, startDate: Date, endDate: Date) {
        // Total count and value
        const total = await this.prisma.notaFiscal.aggregate({
            where: {
                empresaId,
                dataEmissao: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _sum: { valorTotal: true },
        });

        // By Status
        const byStatus = await this.prisma.notaFiscal.groupBy({
            by: ['statusSefaz'],
            where: {
                empresaId,
                dataEmissao: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _sum: { valorTotal: true },
        });

        // By Issuer (Top 10)
        const byIssuer = await this.prisma.notaFiscal.groupBy({
            by: ['emitenteNome'],
            where: {
                empresaId,
                dataEmissao: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _sum: { valorTotal: true },
            orderBy: { _sum: { valorTotal: 'desc' } },
            take: 10,
        });

        return {
            total: {
                count: total._count.id,
                value: total._sum.valorTotal || 0,
            },
            byStatus: byStatus.map(s => ({ status: s.statusSefaz, count: s._count.id, value: s._sum.valorTotal || 0 })),
            byIssuer: byIssuer.map(i => ({ issuer: i.emitenteNome, count: i._count.id, value: i._sum.valorTotal || 0 })),
        };
    }

    async getDetalhamentoImpostos(empresaId: string, startDate: Date, endDate: Date) {
        const notas = await this.prisma.notaFiscal.findMany({
            where: {
                empresaId,
                dataEmissao: { gte: startDate, lte: endDate },
            },
            select: {
                numero: true,
                serie: true,
                dataEmissao: true,
                emitenteNome: true,
                valorTotal: true,
                valorIcms: true,
            },
            orderBy: { dataEmissao: 'desc' },
        });

        return notas.map(n => ({
            ...n,
            valorIcms: Number(n.valorIcms) || 0,
        }));
    }

    async getNotasPorFornecedor(empresaId: string, startDate: Date, endDate: Date) {
        const grouped = await this.prisma.notaFiscal.groupBy({
            by: ['emitenteCnpj', 'emitenteNome'],
            where: {
                empresaId,
                dataEmissao: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _sum: { valorTotal: true },
            orderBy: { _sum: { valorTotal: 'desc' } },
        });

        return grouped.map(g => ({
            cnpj: g.emitenteCnpj,
            nome: g.emitenteNome,
            qtd: g._count.id,
            total: g._sum.valorTotal || 0,
        }));
    }

    async getManifestacoesPendentes(empresaId: string) {
        // Assuming 'statusSefaz' reflects manifestation or we check event table (mock logic)
        // Real implementation should check Manifestacao table if exists or verify 'status'
        // Here we query notes that are AUTHORIZED but not MANIFESTED (if we tracked it)
        // For now, listing recent notes without clear manifestation status

        // Simplification: Return notes older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return this.prisma.notaFiscal.findMany({
            where: {
                empresaId,
                dataEmissao: { lte: sevenDaysAgo },
                // Add logic for "not manifested" if field exists
            },
            orderBy: { dataEmissao: 'asc' },
            take: 50,
        });
    }

    async getConferenciaSped(empresaId: string) {
        // Mock comparison
        return [
            { nfe: '1234', serie: '1', status: 'Divergente', motivo: 'Valor ICMS difere do SPED' },
            { nfe: '5678', serie: '1', status: 'Ausente no SPED', motivo: 'Nota de entrada não escriturada' },
        ];
    }
}
