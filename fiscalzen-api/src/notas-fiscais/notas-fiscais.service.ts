import {
    Injectable,
    Logger,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage';
import { FiltroNotasDto } from './dto';
import { validateXmlSafe } from '../common/utils/xml-sanitizer';

@Injectable()
export class NotasFiscaisService {
    private readonly logger = new Logger(NotasFiscaisService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) { }

    async findAll(filters: FiltroNotasDto, empresaId: string) {
        const take = filters.take ?? 20;

        const where: Prisma.NotaFiscalWhereInput = {
            empresaId,
            ...(filters.tipo && { tipo: filters.tipo }),
            ...(filters.statusSefaz && { statusSefaz: filters.statusSefaz }),
            ...(filters.statusManifestacao && { statusManifestacao: filters.statusManifestacao }),
            ...(filters.emitenteCnpj && { emitenteCnpj: { contains: filters.emitenteCnpj } }),
            ...(filters.emitenteNome && { emitenteNome: { contains: filters.emitenteNome, mode: 'insensitive' as const } }),
            ...(filters.periodoInicio || filters.periodoFim ? {
                dataEmissao: {
                    ...(filters.periodoInicio && { gte: new Date(filters.periodoInicio) }),
                    ...(filters.periodoFim && { lte: new Date(filters.periodoFim) }),
                },
            } : {}),
            ...(filters.tags?.length && {
                tags: { some: { nome: { in: filters.tags } } },
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.notaFiscal.findMany({
                where,
                take: take + 1,
                ...(filters.cursor && {
                    cursor: { id: filters.cursor },
                    skip: 1,
                }),
                orderBy: { dataEmissao: 'desc' },
                include: { tags: true },
            }),
            this.prisma.notaFiscal.count({ where }),
        ]);

        const hasMore = data.length > take;
        if (hasMore) data.pop();

        return {
            data,
            meta: {
                total,
                hasMore,
                nextCursor: hasMore ? data[data.length - 1]?.id : null,
            },
        };
    }

    async findOne(id: string, empresaId: string) {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id, empresaId },
            include: {
                tags: true,
                manifestacoes: {
                    include: { usuario: { select: { id: true, nome: true, email: true } } },
                    orderBy: { dataManifestacao: 'desc' },
                },
            },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        return nota;
    }

    async importXml(xmlBuffer: Buffer, fileName: string, empresaId: string) {
        // XXE Protection
        validateXmlSafe(xmlBuffer);
        const xmlContent = xmlBuffer.toString('utf-8');

        const parsed = this.parseNFeXml(xmlContent);
        if (!parsed) {
            throw new BadRequestException('XML inválido ou formato não suportado');
        }

        const existing = await this.prisma.notaFiscal.findUnique({
            where: { chaveAcesso: parsed.chaveAcesso },
        });

        if (existing) {
            throw new ConflictException(`Nota com chave ${parsed.chaveAcesso} já existe`);
        }

        const storageKey = `xml/${empresaId}/${parsed.chaveAcesso}.xml`;
        await this.storage.upload(storageKey, xmlBuffer, 'text/xml');

        const nota = await this.prisma.notaFiscal.create({
            data: {
                chaveAcesso: parsed.chaveAcesso,
                numero: parsed.numero,
                serie: parsed.serie,
                tipo: parsed.tipo,
                valorTotal: parsed.valorTotal,
                valorProdutos: parsed.valorProdutos,
                valorIcms: parsed.valorIcms,
                emitenteCnpj: parsed.emitenteCnpj,
                emitenteNome: parsed.emitenteNome,
                dataEmissao: parsed.dataEmissao,
                dataAutorizacao: parsed.dataAutorizacao,
                statusSefaz: 'autorizada',
                statusManifestacao: 'pendente',
                empresaId,
                xmlConteudo: xmlContent,
            },
            include: { tags: true },
        });

        this.logger.log(`XML imported: ${parsed.chaveAcesso} for empresa ${empresaId}`);
        return nota;
    }

    async downloadXml(id: string, empresaId: string): Promise<{ buffer: Buffer; chaveAcesso: string }> {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id, empresaId },
            select: { chaveAcesso: true, xmlConteudo: true },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        if (nota.xmlConteudo) {
            return { buffer: Buffer.from(nota.xmlConteudo, 'utf-8'), chaveAcesso: nota.chaveAcesso };
        }

        const storageKey = `xml/${empresaId}/${nota.chaveAcesso}.xml`;
        const buffer = await this.storage.download(storageKey);
        return { buffer, chaveAcesso: nota.chaveAcesso };
    }

    async softDelete(id: string, empresaId: string) {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id, empresaId },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        return this.prisma.notaFiscal.update({
            where: { id },
            data: { statusSefaz: 'inativa' },
        });
    }

    async manifestar(notaId: string, empresaId: string, usuarioId: string, tipo: string, justificativa?: string) {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id: notaId, empresaId },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        return this.prisma.$transaction(async (tx) => {
            const manifestacao = await tx.manifestacao.create({
                data: {
                    tipo,
                    justificativa,
                    notaFiscalId: notaId,
                    usuarioId,
                },
            });

            await tx.notaFiscal.update({
                where: { id: notaId },
                data: { statusManifestacao: tipo },
            });

            return manifestacao;
        });
    }

    async getManifestacoes(notaId: string, empresaId: string) {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id: notaId, empresaId },
            select: { id: true },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        return this.prisma.manifestacao.findMany({
            where: { notaFiscalId: notaId },
            include: { usuario: { select: { id: true, nome: true, email: true } } },
            orderBy: { dataManifestacao: 'desc' },
        });
    }

    async assignTags(notaId: string, empresaId: string, tagIds: string[]) {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id: notaId, empresaId },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        const tags = await this.prisma.tag.findMany({
            where: { id: { in: tagIds }, empresaId },
        });

        if (tags.length !== tagIds.length) {
            throw new BadRequestException('Uma ou mais tags não pertencem à empresa');
        }

        return this.prisma.notaFiscal.update({
            where: { id: notaId },
            data: {
                tags: { connect: tagIds.map((id) => ({ id })) },
            },
            include: { tags: true },
        });
    }

    async removeTag(notaId: string, empresaId: string, tagId: string) {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: { id: notaId, empresaId },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        return this.prisma.notaFiscal.update({
            where: { id: notaId },
            data: {
                tags: { disconnect: { id: tagId } },
            },
            include: { tags: true },
        });
    }

    private parseNFeXml(xmlContent: string): ParsedNFe | null {
        try {
            const getTag = (tag: string): string => {
                const match = xmlContent.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
                return match?.[1] ?? '';
            };

            const chaveAcesso = getTag('chNFe') || getTag('chCTe');
            if (!chaveAcesso || chaveAcesso.length !== 44) {
                return null;
            }

            const tipo = xmlContent.includes('<NFe') || xmlContent.includes('<nfeProc') ? 'NFe' : 'CTe';

            return {
                chaveAcesso,
                numero: getTag('nNF') || getTag('nCT') || '0',
                serie: getTag('serie') || '1',
                tipo,
                valorTotal: parseFloat(getTag('vNF') || getTag('vTPrest') || '0'),
                valorProdutos: parseFloat(getTag('vProd') || '0') || undefined,
                valorIcms: parseFloat(getTag('vICMS') || '0') || undefined,
                emitenteCnpj: getTag('CNPJ') || '',
                emitenteNome: getTag('xNome') || '',
                dataEmissao: new Date(getTag('dhEmi') || getTag('dhEmiss') || new Date().toISOString()),
                dataAutorizacao: getTag('dhRecbto') ? new Date(getTag('dhRecbto')) : undefined,
            };
        } catch (error) {
            this.logger.error('Failed to parse XML', error);
            return null;
        }
    }
}

interface ParsedNFe {
    chaveAcesso: string;
    numero: string;
    serie: string;
    tipo: string;
    valorTotal: number;
    valorProdutos?: number;
    valorIcms?: number;
    emitenteCnpj: string;
    emitenteNome: string;
    dataEmissao: Date;
    dataAutorizacao?: Date;
}
