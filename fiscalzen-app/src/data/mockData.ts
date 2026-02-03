// Mock data for NFe Master SaaS Platform

import type { 
  Empresa, 
  Usuario, 
  NotaFiscal, 
  Manifestacao, 
  DashboardStats, 
  Notificacao,
  LogIntegracao,
  Tag
} from '@/types';

export const mockEmpresa: Empresa = {
  id: '1',
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'DEMO EMPRESA LTDA',
  nomeFantasia: 'Demo Empresa',
  inscricaoEstadual: '123456789',
  inscricaoMunicipal: '987654321',
  endereco: {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Sala 456',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01001-000'
  },
  certificado: {
    id: 'cert1',
    nome: 'Certificado A1',
    validoDe: '2024-01-01',
    validoAte: '2025-01-01',
    emissor: 'Serasa',
    serial: '1234567890',
    ultimoUso: '2024-12-15T10:30:00Z'
  },
  ambienteSefaz: 'producao',
  ativo: true,
  dataCadastro: '2024-01-15',
  limiteNotas: 10000,
  notasUtilizadas: 3456
};

export const mockUsuarios: Usuario[] = [
  {
    id: '1',
    empresaId: '1',
    nome: 'Administrador Master',
    email: 'admin@demoempresa.com',
    telefone: '(11) 99999-9999',
    cargo: 'Diretor',
    perfil: 'admin',
    ativo: true,
    ultimoAcesso: '2024-12-15T10:30:00Z',
    createdAt: '2024-01-15',
    permissoes: ['*']
  },
  {
    id: '2',
    empresaId: '1',
    nome: 'Maria Contadora',
    email: 'contabilidade@demoempresa.com',
    telefone: '(11) 98888-8888',
    cargo: 'Contadora',
    perfil: 'contador',
    ativo: true,
    ultimoAcesso: '2024-12-14T16:45:00Z',
    createdAt: '2024-02-01',
    permissoes: ['notas.visualizar', 'notas.download', 'relatorios.visualizar', 'sped.conferir']
  },
  {
    id: '3',
    empresaId: '1',
    nome: 'João Operador',
    email: 'joao@demoempresa.com',
    telefone: '(11) 97777-7777',
    cargo: 'Analista Fiscal',
    perfil: 'operador',
    ativo: true,
    ultimoAcesso: '2024-12-15T09:15:00Z',
    createdAt: '2024-03-10',
    permissoes: ['notas.visualizar', 'notas.download', 'notas.manifestar', 'notas.etiquetar']
  },
  {
    id: '4',
    empresaId: '1',
    nome: 'Ana Visualizadora',
    email: 'ana@demoempresa.com',
    telefone: '(11) 96666-6666',
    cargo: 'Assistente',
    perfil: 'visualizador',
    ativo: true,
    ultimoAcesso: '2024-12-10T14:20:00Z',
    createdAt: '2024-06-01',
    permissoes: ['notas.visualizar']
  }
];

export const mockNotasFiscais: NotaFiscal[] = [
  {
    id: '1',
    empresaId: '1',
    chaveAcesso: '35241212345678000190550010000001231234567890',
    tipo: 'NFe',
    numero: '123',
    serie: '1',
    dataEmissao: '2024-12-10T08:30:00Z',
    dataAutorizacao: '2024-12-10T08:31:15Z',
    dataEntradaSaida: '2024-12-12T10:00:00Z',
    valorTotal: 15450.00,
    valorProdutos: 12500.00,
    valorIcms: 2790.00,
    valorIpi: 0,
    valorFrete: 450.00,
    emitenteCnpj: '98.765.432/0001-10',
    emitenteNome: 'FORNECEDOR ABC LTDA',
    emitenteIe: '987654321',
    emitenteCidade: 'São Paulo',
    emitenteUf: 'SP',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'confirmada',
    protocoloAutorizacao: '135241234567890',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-12-10T08:35:00Z',
    updatedAt: '2024-12-10T14:20:00Z',
    dataDownload: '2024-12-10T08:35:00Z',
    tags: ['Importante', 'Pago']
  },
  {
    id: '2',
    empresaId: '1',
    chaveAcesso: '35241298765432100010550020000004569876543210',
    tipo: 'NFe',
    numero: '456',
    serie: '2',
    dataEmissao: '2024-12-11T14:20:00Z',
    dataAutorizacao: '2024-12-11T14:21:30Z',
    valorTotal: 8750.50,
    valorProdutos: 7500.00,
    valorIcms: 1125.50,
    valorFrete: 125.00,
    emitenteCnpj: '55.444.333/0001-22',
    emitenteNome: 'DISTRIBUIDORA XYZ S/A',
    emitenteIe: '456789123',
    emitenteCidade: 'Rio de Janeiro',
    emitenteUf: 'RJ',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'ciencia',
    protocoloAutorizacao: '135241234567891',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '6102',
    createdAt: '2024-12-11T14:25:00Z',
    updatedAt: '2024-12-11T16:00:00Z',
    dataDownload: '2024-12-11T14:25:00Z',
    tags: ['Conferir']
  },
  {
    id: '3',
    empresaId: '1',
    chaveAcesso: '35241211122233344455550030000007891112223344',
    tipo: 'NFe',
    numero: '789',
    serie: '3',
    dataEmissao: '2024-12-12T09:00:00Z',
    dataAutorizacao: '2024-12-12T09:01:45Z',
    valorTotal: 32100.00,
    valorProdutos: 28000.00,
    valorIcms: 4100.00,
    emitenteCnpj: '77.888.999/0001-33',
    emitenteNome: 'INDUSTRIA BRASIL LTDA',
    emitenteIe: '789123456',
    emitenteCidade: 'Belo Horizonte',
    emitenteUf: 'MG',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'pendente',
    protocoloAutorizacao: '135241234567892',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-12-12T09:05:00Z',
    updatedAt: '2024-12-12T09:05:00Z',
    dataDownload: '2024-12-12T09:05:00Z'
  },
  {
    id: '4',
    empresaId: '1',
    chaveAcesso: '35241255566677788899990040000001235556667788',
    tipo: 'CTe',
    numero: '100',
    serie: '1',
    dataEmissao: '2024-12-13T11:30:00Z',
    dataAutorizacao: '2024-12-13T11:32:00Z',
    valorTotal: 1250.00,
    valorFrete: 1250.00,
    emitenteCnpj: '22.333.444/0001-55',
    emitenteNome: 'TRANSPORTADORA RAPIDO LTDA',
    emitenteIe: '321654987',
    emitenteCidade: 'Curitiba',
    emitenteUf: 'PR',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'pendente',
    protocoloAutorizacao: '135241234567893',
    naturezaOperacao: 'Transporte',
    createdAt: '2024-12-13T11:35:00Z',
    updatedAt: '2024-12-13T11:35:00Z',
    dataDownload: '2024-12-13T11:35:00Z'
  },
  {
    id: '5',
    empresaId: '1',
    chaveAcesso: '35241299988877766655550050000001558887776655',
    tipo: 'NFe',
    numero: '155',
    serie: '5',
    dataEmissao: '2024-12-14T16:45:00Z',
    dataAutorizacao: '2024-12-14T16:47:20Z',
    valorTotal: 5670.80,
    valorProdutos: 5000.00,
    valorIcms: 670.80,
    emitenteCnpj: '44.555.666/0001-77',
    emitenteNome: 'COMERCIO ATACADISTA S/A',
    emitenteIe: '147258369',
    emitenteCidade: 'Porto Alegre',
    emitenteUf: 'RS',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'desconhecida',
    protocoloAutorizacao: '135241234567894',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '6108',
    createdAt: '2024-12-14T16:50:00Z',
    updatedAt: '2024-12-14T17:30:00Z',
    dataDownload: '2024-12-14T16:50:00Z',
    tags: ['Divergência']
  },
  {
    id: '6',
    empresaId: '1',
    chaveAcesso: '35241233344455566677770060000001883334445566',
    tipo: 'NFe',
    numero: '188',
    serie: '6',
    dataEmissao: '2024-12-15T08:00:00Z',
    dataAutorizacao: '2024-12-15T08:02:10Z',
    valorTotal: 12340.00,
    valorProdutos: 10500.00,
    valorIcms: 1840.00,
    emitenteCnpj: '66.777.888/0001-99',
    emitenteNome: 'MATERIAIS CONSTRUCAO LTDA',
    emitenteIe: '369258147',
    emitenteCidade: 'Salvador',
    emitenteUf: 'BA',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'pendente',
    protocoloAutorizacao: '135241234567895',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-12-15T08:05:00Z',
    updatedAt: '2024-12-15T08:05:00Z',
    dataDownload: '2024-12-15T08:05:00Z'
  },
  {
    id: '7',
    empresaId: '1',
    chaveAcesso: '35241277788899900011110070000002117778889900',
    tipo: 'NFe',
    numero: '211',
    serie: '7',
    dataEmissao: '2024-12-01T10:30:00Z',
    dataAutorizacao: '2024-12-01T10:32:00Z',
    valorTotal: 8900.00,
    valorProdutos: 7500.00,
    valorIcms: 1400.00,
    emitenteCnpj: '11.222.333/0001-44',
    emitenteNome: 'EQUIPAMENTOS INDUSTRIAIS S/A',
    emitenteIe: '951753852',
    emitenteCidade: 'Campinas',
    emitenteUf: 'SP',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'cancelada',
    statusManifestacao: 'nao_realizada',
    protocoloAutorizacao: '135241234567896',
    protocoloCancelamento: '135241234567897',
    justificativaCancelamento: 'Cancelamento por erro no preenchimento',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-12-01T10:35:00Z',
    updatedAt: '2024-12-02T09:00:00Z',
    dataDownload: '2024-12-01T10:35:00Z',
    tags: ['Cancelada']
  },
  {
    id: '8',
    empresaId: '1',
    chaveAcesso: '35241200011122233344440080000002440001112223',
    tipo: 'NFe',
    numero: '244',
    serie: '8',
    dataEmissao: '2024-11-28T14:00:00Z',
    dataAutorizacao: '2024-11-28T14:02:30Z',
    valorTotal: 45600.00,
    valorProdutos: 40000.00,
    valorIcms: 5600.00,
    emitenteCnpj: '33.444.555/0001-66',
    emitenteNome: 'TECNOLOGIA AVANCADA LTDA',
    emitenteIe: '753159456',
    emitenteCidade: 'São Paulo',
    emitenteUf: 'SP',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'confirmada',
    protocoloAutorizacao: '135241234567898',
    naturezaOperacao: 'Compra de Ativo',
    cfop: '1551',
    createdAt: '2024-11-28T14:05:00Z',
    updatedAt: '2024-11-29T10:00:00Z',
    dataDownload: '2024-11-28T14:05:00Z',
    tags: ['Ativo', 'Importante']
  },
  {
    id: '9',
    empresaId: '1',
    chaveAcesso: '35241244455566677788880090000002774445556667',
    tipo: 'NFe',
    numero: '277',
    serie: '9',
    dataEmissao: '2024-11-25T09:15:00Z',
    dataAutorizacao: '2024-11-25T09:17:00Z',
    valorTotal: 2340.50,
    valorProdutos: 2000.00,
    valorIcms: 340.50,
    emitenteCnpj: '88.999.000/0001-11',
    emitenteNome: 'PAPELARIA ESCRITORIO LTDA',
    emitenteIe: '159357456',
    emitenteCidade: 'São Paulo',
    emitenteUf: 'SP',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'confirmada',
    protocoloAutorizacao: '135241234567899',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-11-25T09:20:00Z',
    updatedAt: '2024-11-26T08:00:00Z',
    dataDownload: '2024-11-25T09:20:00Z',
    tags: ['Material de Escritório']
  },
  {
    id: '10',
    empresaId: '1',
    chaveAcesso: '35241288899900011122220100000003008889990001',
    tipo: 'CTe',
    numero: '300',
    serie: '10',
    dataEmissao: '2024-11-20T11:00:00Z',
    dataAutorizacao: '2024-11-20T11:02:15Z',
    valorTotal: 2800.00,
    valorFrete: 2800.00,
    emitenteCnpj: '99.000.111/0001-22',
    emitenteNome: 'LOGISTICA TOTAL S/A',
    emitenteIe: '357951753',
    emitenteCidade: 'Guarulhos',
    emitenteUf: 'SP',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'desacordo',
    protocoloAutorizacao: '135241234567900',
    naturezaOperacao: 'Transporte',
    createdAt: '2024-11-20T11:05:00Z',
    updatedAt: '2024-11-21T14:00:00Z',
    dataDownload: '2024-11-20T11:05:00Z',
    tags: ['Frete', 'Desacordo']
  }
];

export const mockManifestacoes: Manifestacao[] = [
  {
    id: '1',
    notaFiscalId: '1',
    tipo: 'confirmacao',
    dataManifestacao: '2024-12-10T14:20:00Z',
    protocoloSefaz: '135241234567901',
    usuarioId: '3',
    usuarioNome: 'João Operador',
    sucesso: true
  },
  {
    id: '2',
    notaFiscalId: '2',
    tipo: 'ciencia',
    dataManifestacao: '2024-12-11T16:00:00Z',
    protocoloSefaz: '135241234567902',
    usuarioId: '3',
    usuarioNome: 'João Operador',
    sucesso: true
  },
  {
    id: '3',
    notaFiscalId: '5',
    tipo: 'desconhecimento',
    dataManifestacao: '2024-12-14T17:30:00Z',
    protocoloSefaz: '135241234567903',
    usuarioId: '2',
    usuarioNome: 'Maria Contadora',
    justificativa: 'Não reconhecemos esta operação com o fornecedor',
    sucesso: true
  },
  {
    id: '4',
    notaFiscalId: '7',
    tipo: 'nao_realizada',
    dataManifestacao: '2024-12-02T09:00:00Z',
    protocoloSefaz: '135241234567904',
    usuarioId: '2',
    usuarioNome: 'Maria Contadora',
    justificativa: 'Operação não foi realizada, nota cancelada pelo emitente',
    sucesso: true
  },
  {
    id: '5',
    notaFiscalId: '10',
    tipo: 'desacordo',
    dataManifestacao: '2024-11-21T14:00:00Z',
    protocoloSefaz: '135241234567905',
    usuarioId: '3',
    usuarioNome: 'João Operador',
    justificativa: 'Mercadoria entregue com avarias, frete não corresponde ao acordado',
    sucesso: true
  }
];

export const mockDashboardStats: DashboardStats = {
  totalNotas: 3456,
  totalNotasMes: 287,
  notasPendentesManifestacao: 42,
  notasManifestadas: 3380,
  valorTotalNotas: 12547890.50,
  valorTotalMes: 987654.32,
  fornecedoresAtivos: 156,
  downloadsRealizados: 8923
};

export const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    empresaId: '1',
    tipo: 'info',
    titulo: 'Novas notas disponíveis',
    mensagem: 'Foram encontradas 5 novas notas fiscais na SEFAZ.',
    lida: false,
    link: '/notas-fiscais?status=pendente',
    createdAt: '2024-12-15T08:00:00Z'
  },
  {
    id: '2',
    empresaId: '1',
    tipo: 'warning',
    titulo: 'Manifestações pendentes',
    mensagem: 'Você possui 42 notas aguardando manifestação. Prazo: 180 dias.',
    lida: false,
    link: '/notas-fiscais?manifestacao=pendente',
    createdAt: '2024-12-14T18:00:00Z'
  },
  {
    id: '3',
    empresaId: '1',
    usuarioId: '3',
    tipo: 'success',
    titulo: 'Manifestação realizada',
    mensagem: 'A nota 123 foi confirmada com sucesso.',
    lida: true,
    createdAt: '2024-12-10T14:25:00Z'
  },
  {
    id: '4',
    empresaId: '1',
    tipo: 'error',
    titulo: 'Erro na consulta SEFAZ',
    mensagem: 'Não foi possível consultar a SEFAZ. Tente novamente mais tarde.',
    lida: true,
    createdAt: '2024-12-09T10:00:00Z'
  },
  {
    id: '5',
    empresaId: '1',
    tipo: 'info',
    titulo: 'Backup realizado',
    mensagem: 'O backup automático foi concluído com sucesso.',
    lida: true,
    createdAt: '2024-12-08T02:00:00Z'
  }
];

export const mockLogsIntegracao: LogIntegracao[] = [
  {
    id: '1',
    empresaId: '1',
    tipo: 'consulta_sefaz',
    status: 'sucesso',
    mensagem: 'Consulta à SEFAZ realizada com sucesso',
    detalhes: '5 notas encontradas',
    usuarioId: '1',
    ipOrigem: '192.168.1.100',
    createdAt: '2024-12-15T08:00:00Z'
  },
  {
    id: '2',
    empresaId: '1',
    tipo: 'download',
    status: 'sucesso',
    mensagem: 'Download de XML realizado',
    detalhes: 'Nota 123 - FORNECEDOR ABC LTDA',
    chaveAcesso: '35241212345678000190550010000001231234567890',
    usuarioId: '3',
    ipOrigem: '192.168.1.105',
    createdAt: '2024-12-15T07:30:00Z'
  },
  {
    id: '3',
    empresaId: '1',
    tipo: 'manifestacao',
    status: 'sucesso',
    mensagem: 'Manifestação realizada com sucesso',
    detalhes: 'Tipo: Confirmação - Nota 123',
    chaveAcesso: '35241212345678000190550010000001231234567890',
    usuarioId: '3',
    ipOrigem: '192.168.1.105',
    createdAt: '2024-12-14T16:00:00Z'
  },
  {
    id: '4',
    empresaId: '1',
    tipo: 'consulta_sefaz',
    status: 'erro',
    mensagem: 'Erro na comunicação com SEFAZ',
    detalhes: 'Timeout na conexão',
    usuarioId: '1',
    ipOrigem: '192.168.1.100',
    createdAt: '2024-12-14T10:00:00Z'
  },
  {
    id: '5',
    empresaId: '1',
    tipo: 'importacao',
    status: 'sucesso',
    mensagem: 'Importação de SPED concluída',
    detalhes: 'Arquivo: SPED_FISCAL_112024.txt - 1.234 registros',
    usuarioId: '2',
    ipOrigem: '192.168.1.102',
    createdAt: '2024-12-13T14:00:00Z'
  }
];

export const mockTags: Tag[] = [
  { id: '1', empresaId: '1', nome: 'Importante', cor: '#ef4444', createdAt: '2024-01-01' },
  { id: '2', empresaId: '1', nome: 'Pago', cor: '#22c55e', createdAt: '2024-01-01' },
  { id: '3', empresaId: '1', nome: 'Conferir', cor: '#f59e0b', createdAt: '2024-01-01' },
  { id: '4', empresaId: '1', nome: 'Divergência', cor: '#8b5cf6', createdAt: '2024-01-01' },
  { id: '5', empresaId: '1', nome: 'Cancelada', cor: '#6b7280', createdAt: '2024-01-01' },
  { id: '6', empresaId: '1', nome: 'Ativo', cor: '#3b82f6', createdAt: '2024-01-01' },
  { id: '7', empresaId: '1', nome: 'Frete', cor: '#ec4899', createdAt: '2024-01-01' },
  { id: '8', empresaId: '1', nome: 'Desacordo', cor: '#f97316', createdAt: '2024-01-01' },
  { id: '9', empresaId: '1', nome: 'Material de Escritório', cor: '#14b8a6', createdAt: '2024-01-01' }
];

// Dados para gráficos
export const mockGraficoNotasPorMes = {
  labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'NFe',
      data: [245, 289, 312, 298, 267, 287],
      color: '#3b82f6'
    },
    {
      label: 'CTe',
      data: [45, 52, 48, 61, 55, 49],
      color: '#8b5cf6'
    }
  ]
};

export const mockGraficoValorPorMes = {
  labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Valor Total (R$)',
      data: [1850000, 2100000, 1950000, 2300000, 2150000, 987654],
      color: '#22c55e'
    }
  ]
};

export const mockGraficoStatusManifestacao = {
  labels: ['Confirmada', 'Ciência', 'Pendente', 'Desconhecida', 'Não Realizada', 'Desacordo'],
  datasets: [
    {
      label: 'Quantidade',
      data: [2890, 340, 42, 15, 8, 5],
      color: '#3b82f6'
    }
  ]
};

export const mockGraficoTopFornecedores = {
  labels: ['FORNECEDOR ABC LTDA', 'DISTRIBUIDORA XYZ S/A', 'INDUSTRIA BRASIL LTDA', 'TECNOLOGIA AVANCADA LTDA', 'MATERIAIS CONSTRUCAO LTDA'],
  datasets: [
    {
      label: 'Valor Total (R$)',
      data: [1250000, 980000, 850000, 720000, 650000],
      color: '#f59e0b'
    }
  ]
};
