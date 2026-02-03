// Types for NFe Master SaaS Platform

export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco?: Endereco;
  certificado?: Certificado;
  ambienteSefaz: 'producao' | 'homologacao';
  ativo: boolean;
  dataCadastro: string;
  limiteNotas: number;
  notasUtilizadas: number;
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Certificado {
  id: string;
  nome: string;
  validoDe: string;
  validoAte: string;
  emissor: string;
  serial: string;
  ultimoUso?: string;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  perfil: 'admin' | 'gerente' | 'operador' | 'contador' | 'visualizador';
  ativo: boolean;
  ultimoAcesso?: string;
  createdAt: string;
  permissoes: string[];
}

export type TipoDocumento = 'NFe' | 'CTe' | 'NFCe' | 'NFSe' | 'MDFe';
export type StatusSefaz = 'autorizada' | 'cancelada' | 'denegada' | 'inutilizada' | 'pendente';
export type StatusManifestacao = 'pendente' | 'ciencia' | 'confirmada' | 'desconhecida' | 'nao_realizada' | 'desacordo';
export type TipoManifestacao = 'ciencia' | 'confirmacao' | 'desconhecimento' | 'nao_realizada' | 'desacordo';

export interface NotaFiscal {
  id: string;
  empresaId: string;
  chaveAcesso: string;
  tipo: TipoDocumento;
  numero: string;
  serie: string;
  dataEmissao: string;
  dataAutorizacao?: string;
  dataEntradaSaida?: string;
  valorTotal: number;
  valorProdutos?: number;
  valorIcms?: number;
  valorIpi?: number;
  valorPis?: number;
  valorCofins?: number;
  valorFrete?: number;
  valorSeguro?: number;
  valorDesconto?: number;
  valorOutras?: number;
  
  // Emitente
  emitenteCnpj: string;
  emitenteNome: string;
  emitenteIe?: string;
  emitenteEndereco?: string;
  emitenteCidade?: string;
  emitenteUf?: string;
  
  // Destinatário
  destinatarioCnpjCpf: string;
  destinatarioNome: string;
  destinatarioIe?: string;
  destinatarioEndereco?: string;
  destinatarioCidade?: string;
  destinatarioUf?: string;
  
  // Status
  statusSefaz: StatusSefaz;
  statusManifestacao: StatusManifestacao;
  protocoloAutorizacao?: string;
  protocoloCancelamento?: string;
  justificativaCancelamento?: string;
  
  // XML e PDF
  xmlConteudo?: string;
  xmlUrl?: string;
  pdfUrl?: string;
  pdfDacteUrl?: string;
  
  // Dados adicionais
  naturezaOperacao?: string;
  cfop?: string;
  informacoesComplementares?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  dataDownload?: string;
  
  // Tags
  tags?: string[];
  
  // Itens (para detalhes)
  itens?: ItemNotaFiscal[];
}

export interface ItemNotaFiscal {
  id: string;
  notaFiscalId: string;
  numeroItem: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorIcms?: number;
  valorIpi?: number;
  valorPis?: number;
  valorCofins?: number;
  aliquotaIcms?: number;
  aliquotaIpi?: number;
  baseCalculoIcms?: number;
}

export interface Manifestacao {
  id: string;
  notaFiscalId: string;
  tipo: TipoManifestacao;
  dataManifestacao: string;
  protocoloSefaz?: string;
  usuarioId: string;
  usuarioNome?: string;
  justificativa?: string;
  sucesso: boolean;
  mensagemErro?: string;
}

export interface FiltroNotas {
  periodoInicio?: string;
  periodoFim?: string;
  tipo?: TipoDocumento[];
  statusSefaz?: StatusSefaz[];
  statusManifestacao?: StatusManifestacao[];
  emitenteCnpj?: string;
  emitenteNome?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  chaveAcesso?: string;
  numero?: string;
  tags?: string[];
}

export interface DashboardStats {
  totalNotas: number;
  totalNotasMes: number;
  notasPendentesManifestacao: number;
  notasManifestadas: number;
  valorTotalNotas: number;
  valorTotalMes: number;
  fornecedoresAtivos: number;
  downloadsRealizados: number;
}

export interface GraficoDados {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface RelatorioConfig {
  id: string;
  nome: string;
  tipo: 'notas' | 'fornecedores' | 'tributos' | 'custom';
  filtros: FiltroNotas;
  colunas: string[];
  formato: 'excel' | 'pdf' | 'csv';
  agendamento?: {
    ativo: boolean;
    frequencia: 'diario' | 'semanal' | 'mensal';
    dia?: number;
    hora?: string;
    emails: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notificacao {
  id: string;
  empresaId: string;
  usuarioId?: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  createdAt: string;
}

export interface LogIntegracao {
  id: string;
  empresaId: string;
  tipo: 'consulta_sefaz' | 'download' | 'manifestacao' | 'importacao' | 'exportacao';
  status: 'sucesso' | 'erro' | 'aviso';
  mensagem: string;
  detalhes?: string;
  chaveAcesso?: string;
  usuarioId?: string;
  ipOrigem?: string;
  createdAt: string;
}

export interface SpedConfig {
  id: string;
  empresaId: string;
  nome: string;
  tipo: 'fiscal' | 'contribuicoes';
  arquivoSped?: string;
  periodoInicio: string;
  periodoFim: string;
  statusConferencia: 'pendente' | 'em_andamento' | 'concluido';
  convergencias?: number;
  divergencias?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConferenciaSped {
  id: string;
  spedConfigId: string;
  chaveAcesso: string;
  status: 'convergente' | 'divergente' | 'nao_encontrado' | 'pendente';
  tipoDivergencia?: string;
  valorNota?: number;
  valorSped?: number;
  detalhes?: string;
}

export interface ApiKey {
  id: string;
  empresaId: string;
  nome: string;
  chave: string;
  ultimoUso?: string;
  limiteRequisicoes?: number;
  requisicoesRealizadas: number;
  ativo: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface Webhook {
  id: string;
  empresaId: string;
  url: string;
  eventos: string[];
  ativo: boolean;
  secret?: string;
  ultimoEnvio?: string;
  ultimoStatus?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  empresaId: string;
  nome: string;
  cor: string;
  createdAt: string;
}
