/**
 * NFe (Nota Fiscal Eletrônica) Data Interfaces
 * Based on NFe Layout 4.00
 * Reference: Manual de Orientação do Contribuinte (MOC)
 */

// ===== Core Types =====

export type TipoOperacao = '0' | '1'; // 0=Entrada, 1=Saída
export type FinalidadeNFe = '1' | '2' | '3' | '4'; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
export type TipoEmissao = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '9';
export type ModalidadeFrete = '0' | '1' | '2' | '3' | '4' | '9';
export type IndicadorPagamento = '0' | '1' | '2'; // 0=À vista, 1=A prazo, 2=Outros
export type FormaPagamento =
    | '01' | '02' | '03' | '04' | '05' | '10' | '11' | '12' | '13'
    | '14' | '15' | '16' | '17' | '18' | '19' | '90' | '99';

// ===== Identification (IDE) =====

export interface NFeIde {
    /** Código da UF do emitente */
    cUF: string;
    /** Código numérico que compõe a Chave de Acesso */
    cNF: string;
    /** Natureza da Operação */
    natOp: string;
    /** Modelo do Documento Fiscal (55=NFe, 65=NFCe) */
    mod: '55' | '65';
    /** Série do Documento Fiscal */
    serie: string;
    /** Número do Documento Fiscal */
    nNF: string;
    /** Data e hora de emissão (formato: YYYY-MM-DDTHH:MM:SS-03:00) */
    dhEmi: string;
    /** Data e hora de Saída ou da Entrada da Mercadoria/Produto */
    dhSaiEnt?: string;
    /** Tipo de Operação */
    tpNF: TipoOperacao;
    /** Identificador de local de destino da operação */
    idDest: '1' | '2' | '3'; // 1=Op.interna, 2=Op.interestadual, 3=Op.exterior
    /** Código do Município de Ocorrência */
    cMunFG: string;
    /** Tipo de impressão do DANFE */
    tpImp: '0' | '1' | '2' | '3' | '4' | '5';
    /** Tipo de Emissão da NFe */
    tpEmis: TipoEmissao;
    /** Dígito Verificador da Chave de Acesso */
    cDV?: string;
    /** Tipo do Ambiente */
    tpAmb: '1' | '2'; // 1=Produção, 2=Homologação
    /** Finalidade de emissão da NFe */
    finNFe: FinalidadeNFe;
    /** Indica operação com Consumidor final */
    indFinal: '0' | '1';
    /** Indicador de presença do comprador */
    indPres: '0' | '1' | '2' | '3' | '4' | '5' | '9';
    /** Processo de emissão da NF-e */
    procEmi: '0' | '1' | '2' | '3';
    /** Versão do Processo de emissão da NF-e */
    verProc: string;
}

// ===== Emitente (EMIT) =====

export interface NFeEmit {
    /** CNPJ do emitente */
    CNPJ: string;
    /** Razão Social ou Nome do emitente */
    xNome: string;
    /** Nome fantasia */
    xFant?: string;
    /** Endereço do emitente */
    enderEmit: NFeEndereco;
    /** Inscrição Estadual do Emitente */
    IE: string;
    /** IE do Substituto Tributário */
    IEST?: string;
    /** Inscrição Municipal do Prestador de Serviço */
    IM?: string;
    /** CNAE fiscal */
    CNAE?: string;
    /** Código de Regime Tributário */
    CRT: '1' | '2' | '3'; // 1=Simples Nacional, 2=SN Excesso, 3=Normal
}

// ===== Destinatário (DEST) =====

export interface NFeDest {
    /** CNPJ do destinatário */
    CNPJ?: string;
    /** CPF do destinatário */
    CPF?: string;
    /** Identificação do destinatário no caso de comprador estrangeiro */
    idEstrangeiro?: string;
    /** Razão Social ou nome do destinatário */
    xNome?: string;
    /** Endereço do Destinatário */
    enderDest?: NFeEndereco;
    /** Indicador da IE do Destinatário */
    indIEDest: '1' | '2' | '9';
    /** Inscrição Estadual do Destinatário */
    IE?: string;
    /** Inscrição Suframa */
    ISUF?: string;
    /** Inscrição Municipal do tomador do serviço */
    IM?: string;
    /** Email */
    email?: string;
}

// ===== Endereço =====

export interface NFeEndereco {
    /** Logradouro */
    xLgr: string;
    /** Número */
    nro: string;
    /** Complemento */
    xCpl?: string;
    /** Bairro */
    xBairro: string;
    /** Código do município */
    cMun: string;
    /** Nome do município */
    xMun: string;
    /** Sigla da UF */
    UF: string;
    /** Código do CEP */
    CEP: string;
    /** Código do País */
    cPais?: string;
    /** Nome do País */
    xPais?: string;
    /** Telefone */
    fone?: string;
}

// ===== Produto (DET) =====

export interface NFeDet {
    /** Número do item */
    nItem: number;
    /** Produto */
    prod: NFeProd;
    /** Tributos do produto */
    imposto: NFeImposto;
    /** Informações adicionais do produto */
    infAdProd?: string;
}

export interface NFeProd {
    /** Código do produto */
    cProd: string;
    /** GTIN (Global Trade Item Number) do produto */
    cEAN: string;
    /** Descrição do produto */
    xProd: string;
    /** NCM */
    NCM: string;
    /** NVE */
    NVE?: string;
    /** Código CEST */
    CEST?: string;
    /** CFOP */
    CFOP: string;
    /** Unidade comercial */
    uCom: string;
    /** Quantidade Comercial */
    qCom: string;
    /** Valor Unitário de Comercialização */
    vUnCom: string;
    /** Valor Total Bruto dos Produtos */
    vProd: string;
    /** GTIN da unidade tributável */
    cEANTrib: string;
    /** Unidade Tributável */
    uTrib: string;
    /** Quantidade Tributável */
    qTrib: string;
    /** Valor Unitário de tributação */
    vUnTrib: string;
    /** Valor Total do Frete */
    vFrete?: string;
    /** Valor Total do Seguro */
    vSeg?: string;
    /** Valor do Desconto */
    vDesc?: string;
    /** Outras despesas acessórias */
    vOutro?: string;
    /** Indica se valor do Item entra no total */
    indTot: '0' | '1';
}

// ===== Impostos =====

export interface NFeImposto {
    /** Valor aproximado total de tributos */
    vTotTrib?: string;
    /** ICMS */
    ICMS: NFeICMS;
    /** IPI */
    IPI?: NFeIPI;
    /** PIS */
    PIS: NFePIS;
    /** COFINS */
    COFINS: NFeCOFINS;
}

export interface NFeICMS {
    /** CST/CSOSN do ICMS */
    orig: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
    CST?: string;
    CSOSN?: string;
    /** Modalidade de determinação da BC do ICMS */
    modBC?: string;
    /** Valor da BC do ICMS */
    vBC?: string;
    /** Alíquota do imposto */
    pICMS?: string;
    /** Valor do ICMS */
    vICMS?: string;
    /** Percentual da Redução de BC */
    pRedBC?: string;
}

export interface NFeIPI {
    /** Código de Enquadramento Legal do IPI */
    cEnq: string;
    /** CST do IPI */
    CST?: string;
    /** Valor da BC do IPI */
    vBC?: string;
    /** Alíquota do IPI */
    pIPI?: string;
    /** Valor do IPI */
    vIPI?: string;
}

export interface NFePIS {
    /** CST do PIS */
    CST: string;
    /** Valor da Base de Cálculo do PIS */
    vBC?: string;
    /** Alíquota do PIS (em percentual) */
    pPIS?: string;
    /** Valor do PIS */
    vPIS?: string;
}

export interface NFeCOFINS {
    /** CST da COFINS */
    CST: string;
    /** Valor da Base de Cálculo da COFINS */
    vBC?: string;
    /** Alíquota da COFINS (em percentual) */
    pCOFINS?: string;
    /** Valor da COFINS */
    vCOFINS?: string;
}

// ===== Totais =====

export interface NFeTotal {
    /** Totais referentes ao ICMS */
    ICMSTot: NFeICMSTot;
}

export interface NFeICMSTot {
    /** Base de Cálculo do ICMS */
    vBC: string;
    /** Valor Total do ICMS */
    vICMS: string;
    /** Valor Total do ICMS Desonerado */
    vICMSDeson: string;
    /** Valor Total do ICMS relativo Fundo de Combate à Pobreza */
    vFCPUFDest?: string;
    /** Valor Total do ICMS Interestadual para a UF de destino */
    vICMSUFDest?: string;
    /** Valor Total do ICMS Interestadual para a UF do remetente */
    vICMSUFRemet?: string;
    /** Valor Total do FCP */
    vFCP: string;
    /** Base de Cálculo do ICMS ST */
    vBCST: string;
    /** Valor Total do ICMS ST */
    vST: string;
    /** Valor Total do FCP retido por ST */
    vFCPST: string;
    /** Valor Total do FCP retido anteriormente por ST */
    vFCPSTRet: string;
    /** Valor Total dos produtos e serviços */
    vProd: string;
    /** Valor Total do Frete */
    vFrete: string;
    /** Valor Total do Seguro */
    vSeg: string;
    /** Valor Total do Desconto */
    vDesc: string;
    /** Valor Total do II */
    vII: string;
    /** Valor Total do IPI */
    vIPI: string;
    /** Valor Total do IPI devolvido */
    vIPIDevol: string;
    /** Valor do PIS */
    vPIS: string;
    /** Valor do COFINS */
    vCOFINS: string;
    /** Outras Despesas acessórias */
    vOutro: string;
    /** Valor Total da NF-e */
    vNF: string;
    /** Valor aproximado total de tributos */
    vTotTrib?: string;
}

// ===== Transporte =====

export interface NFeTransp {
    /** Modalidade do frete */
    modFrete: ModalidadeFrete;
    /** Transportadora */
    transporta?: NFeTransportadora;
    /** Veículo */
    veicTransp?: NFeVeiculo;
    /** Volumes */
    vol?: NFeVolume[];
}

export interface NFeTransportadora {
    /** CNPJ ou CPF */
    CNPJ?: string;
    CPF?: string;
    /** IE do Transportador */
    IE?: string;
    /** Razão Social ou nome */
    xNome?: string;
    /** Endereço Completo */
    xEnder?: string;
    /** Nome do município */
    xMun?: string;
    /** Sigla da UF */
    UF?: string;
}

export interface NFeVeiculo {
    /** Placa do Veículo */
    placa: string;
    /** Sigla da UF */
    UF: string;
    /** RNTC */
    RNTC?: string;
}

export interface NFeVolume {
    /** Quantidade de volumes */
    qVol?: string;
    /** Espécie dos volumes */
    esp?: string;
    /** Marca dos volumes */
    marca?: string;
    /** Numeração dos volumes */
    nVol?: string;
    /** Peso Líquido (em kg) */
    pesoL?: string;
    /** Peso Bruto (em kg) */
    pesoB?: string;
}

// ===== Cobrança =====

export interface NFeCobr {
    /** Duplicatas da cobrança */
    fat?: NFeFatura;
    /** Duplicatas */
    dup?: NFeDuplicata[];
}

export interface NFeFatura {
    /** Número da Fatura */
    nFat?: string;
    /** Valor Original da Fatura */
    vOrig?: string;
    /** Valor do desconto */
    vDesc?: string;
    /** Valor Líquido da Fatura */
    vLiq?: string;
}

export interface NFeDuplicata {
    /** Número da Duplicata */
    nDup?: string;
    /** Data de vencimento */
    dVenc?: string;
    /** Valor da duplicata */
    vDup?: string;
}

// ===== Pagamento =====

export interface NFePag {
    /** Grupo de detalhamento da forma de pagamento */
    detPag: NFeDetPag[];
    /** Valor do Troco */
    vTroco?: string;
}

export interface NFeDetPag {
    /** Indicador da Forma de Pagamento */
    indPag?: IndicadorPagamento;
    /** Meio de pagamento */
    tPag: FormaPagamento;
    /** Valor do Pagamento */
    vPag: string;
    /** Grupo de Cartões */
    card?: NFeCard;
}

export interface NFeCard {
    /** Tipo de Integração */
    tpIntegra: '1' | '2';
    /** CNPJ da Credenciadora */
    CNPJ?: string;
    /** Bandeira da operadora */
    tBand?: string;
    /** Número de autorização */
    cAut?: string;
}

// ===== Informações Adicionais =====

export interface NFeInfAdic {
    /** Informações Adicionais de Interesse do Fisco */
    infAdFisco?: string;
    /** Informações Complementares de interesse do Contribuinte */
    infCpl?: string;
}

// ===== Main NFe Data Structure =====

export interface NFeData {
    /** Identificação da NFe */
    ide: NFeIde;
    /** Emitente */
    emit: NFeEmit;
    /** Destinatário */
    dest?: NFeDest;
    /** Detalhamento dos Produtos e Serviços */
    det: NFeDet[];
    /** Valores Totais */
    total: NFeTotal;
    /** Informações do Transporte */
    transp: NFeTransp;
    /** Cobrança */
    cobr?: NFeCobr;
    /** Pagamento */
    pag: NFePag;
    /** Informações Adicionais */
    infAdic?: NFeInfAdic;
}

// ===== Helper for creating empty NFe =====

export function createEmptyNFe(): Partial<NFeData> {
    return {
        ide: {} as NFeIde,
        emit: {} as NFeEmit,
        det: [],
        total: {
            ICMSTot: {
                vBC: '0.00',
                vICMS: '0.00',
                vICMSDeson: '0.00',
                vFCP: '0.00',
                vBCST: '0.00',
                vST: '0.00',
                vFCPST: '0.00',
                vFCPSTRet: '0.00',
                vProd: '0.00',
                vFrete: '0.00',
                vSeg: '0.00',
                vDesc: '0.00',
                vII: '0.00',
                vIPI: '0.00',
                vIPIDevol: '0.00',
                vPIS: '0.00',
                vCOFINS: '0.00',
                vOutro: '0.00',
                vNF: '0.00',
            },
        },
        transp: {
            modFrete: '9',
        },
        pag: {
            detPag: [],
        },
    };
}
