import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// ===== Enums =====

export enum TipoOperacaoNFe {
    ENTRADA = '0',
    SAIDA = '1',
}

export enum TipoAmbiente {
    PRODUCAO = '1',
    HOMOLOGACAO = '2',
}

export enum FormaPagamentoNFe {
    DINHEIRO = '01',
    CHEQUE = '02',
    CARTAO_CREDITO = '03',
    CARTAO_DEBITO = '04',
    CREDITO_LOJA = '05',
    VALE_ALIMENTACAO = '10',
    VALE_REFEICAO = '11',
    VALE_PRESENTE = '12',
    VALE_COMBUSTIVEL = '13',
    DUPLICATA = '14',
    BOLETO = '15',
    DEPOSITO = '16',
    PIX = '17',
    TRANSFERENCIA = '18',
    PROGRAMA_FIDELIDADE = '19',
    SEM_PAGAMENTO = '90',
    OUTROS = '99',
}

// ===== Product DTO =====

export class ProdutoNFeDto {
    @ApiProperty({ description: 'Código do produto' })
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @ApiProperty({ description: 'Descrição do produto' })
    @IsString()
    @IsNotEmpty()
    descricao: string;

    @ApiProperty({ description: 'NCM do produto' })
    @IsString()
    @IsNotEmpty()
    ncm: string;

    @ApiProperty({ description: 'CFOP' })
    @IsString()
    @IsNotEmpty()
    cfop: string;

    @ApiProperty({ description: 'Unidade comercial' })
    @IsString()
    @IsNotEmpty()
    unidade: string;

    @ApiProperty({ description: 'Quantidade' })
    @IsNumber()
    quantidade: number;

    @ApiProperty({ description: 'Valor unitário' })
    @IsNumber()
    valorUnitario: number;

    @ApiPropertyOptional({ description: 'Código EAN/GTIN' })
    @IsOptional()
    @IsString()
    ean?: string;

    @ApiPropertyOptional({ description: 'Valor do desconto' })
    @IsOptional()
    @IsNumber()
    desconto?: number;

    @ApiPropertyOptional({ description: 'Valor do frete' })
    @IsOptional()
    @IsNumber()
    frete?: number;

    @ApiPropertyOptional({ description: 'CEST' })
    @IsOptional()
    @IsString()
    cest?: string;
}

// ===== Destinatário DTO =====

export class DestinatarioNFeDto {
    @ApiPropertyOptional({ description: 'CNPJ do destinatário' })
    @IsOptional()
    @IsString()
    cnpj?: string;

    @ApiPropertyOptional({ description: 'CPF do destinatário' })
    @IsOptional()
    @IsString()
    cpf?: string;

    @ApiPropertyOptional({ description: 'Nome/Razão Social' })
    @IsOptional()
    @IsString()
    nome?: string;

    @ApiPropertyOptional({ description: 'Email' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ description: 'Logradouro' })
    @IsOptional()
    @IsString()
    logradouro?: string;

    @ApiPropertyOptional({ description: 'Número' })
    @IsOptional()
    @IsString()
    numero?: string;

    @ApiPropertyOptional({ description: 'Bairro' })
    @IsOptional()
    @IsString()
    bairro?: string;

    @ApiPropertyOptional({ description: 'Código do município (IBGE)' })
    @IsOptional()
    @IsString()
    codigoMunicipio?: string;

    @ApiPropertyOptional({ description: 'Nome do município' })
    @IsOptional()
    @IsString()
    municipio?: string;

    @ApiPropertyOptional({ description: 'UF' })
    @IsOptional()
    @IsString()
    uf?: string;

    @ApiPropertyOptional({ description: 'CEP' })
    @IsOptional()
    @IsString()
    cep?: string;

    @ApiPropertyOptional({ description: 'Inscrição Estadual' })
    @IsOptional()
    @IsString()
    ie?: string;
}

// ===== Pagamento DTO =====

export class PagamentoNFeDto {
    @ApiProperty({ description: 'Forma de pagamento', enum: FormaPagamentoNFe })
    @IsEnum(FormaPagamentoNFe)
    forma: FormaPagamentoNFe;

    @ApiProperty({ description: 'Valor do pagamento' })
    @IsNumber()
    valor: number;
}

// ===== Main Emissão DTO =====

export class EmitirNFeDto {
    @ApiProperty({ description: 'Natureza da operação' })
    @IsString()
    @IsNotEmpty()
    naturezaOperacao: string;

    @ApiProperty({ description: 'Tipo de operação', enum: TipoOperacaoNFe })
    @IsEnum(TipoOperacaoNFe)
    tipoOperacao: TipoOperacaoNFe;

    @ApiPropertyOptional({ description: 'Série da NF-e (default: 1)' })
    @IsOptional()
    @IsString()
    serie?: string;

    @ApiPropertyOptional({ description: 'Número da NF-e (auto-generated if omitted)' })
    @IsOptional()
    @IsString()
    numero?: string;

    @ApiPropertyOptional({ description: 'Destinatário' })
    @IsOptional()
    @ValidateNested()
    @Type(() => DestinatarioNFeDto)
    destinatario?: DestinatarioNFeDto;

    @ApiProperty({ description: 'Lista de produtos', type: [ProdutoNFeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProdutoNFeDto)
    produtos: ProdutoNFeDto[];

    @ApiProperty({ description: 'Pagamentos', type: [PagamentoNFeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PagamentoNFeDto)
    pagamentos: PagamentoNFeDto[];

    @ApiPropertyOptional({ description: 'Informações complementares' })
    @IsOptional()
    @IsString()
    informacoesComplementares?: string;

    @ApiPropertyOptional({ description: 'Usar ambiente de produção', default: false })
    @IsOptional()
    @IsBoolean()
    producao?: boolean;
}

// ===== Response DTOs =====

export class EmissaoResultDto {
    @ApiProperty()
    success: boolean;

    @ApiPropertyOptional()
    chaveAcesso?: string;

    @ApiPropertyOptional()
    protocolo?: string;

    @ApiPropertyOptional()
    status?: number;

    @ApiProperty()
    mensagem: string;

    @ApiPropertyOptional()
    dataAutorizacao?: string;

    @ApiPropertyOptional()
    jobId?: string;
}

export class StatusNFeDto {
    @ApiProperty()
    chaveAcesso: string;

    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    protocolo?: string;

    @ApiPropertyOptional()
    dataAutorizacao?: string;

    @ApiPropertyOptional()
    motivoRejeicao?: string;

    @ApiPropertyOptional()
    xmlAutorizado?: boolean;
}
