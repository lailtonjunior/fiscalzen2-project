# Especificação da API Backend - NFe Master SaaS

## 📋 Visão Geral

Esta documentação descreve a API RESTful do backend da plataforma NFe Master SaaS.

### Base URL

```
Desenvolvimento: http://localhost:3000/api/v1
Produção: https://api.nfemaster.com.br/v1
```

### Autenticação

Todas as requisições devem incluir o header de autorização:

```http
Authorization: Bearer {token_jwt}
```

---

## 🔐 Autenticação

### POST /auth/login

Realiza login no sistema.

**Request:**
```json
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "nome": "João Silva",
      "email": "usuario@empresa.com",
      "perfil": "admin",
      "empresaId": "1"
    }
  }
}
```

### POST /auth/refresh

Renova o token de acesso.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout

Realiza logout do sistema.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 📄 Notas Fiscais

### GET /notas-fiscais

Lista notas fiscais com paginação e filtros.

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página atual (default: 1) |
| limit | number | Itens por página (default: 20) |
| tipo | string | NFe, CTe, NFCe, NFSe |
| status_sefaz | string | autorizada, cancelada, denegada |
| status_manifestacao | string | pendente, ciencia, confirmada |
| data_inicio | date | Data inicial (YYYY-MM-DD) |
| data_fim | date | Data final (YYYY-MM-DD) |
| emitente_cnpj | string | CNPJ do emitente |
| valor_min | number | Valor mínimo |
| valor_max | number | Valor máximo |
| search | string | Busca textual |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "chave_acesso": "35241212345678000190550010000001231234567890",
        "tipo": "NFe",
        "numero": "123",
        "serie": "1",
        "data_emissao": "2024-12-10T08:30:00Z",
        "data_autorizacao": "2024-12-10T08:31:15Z",
        "valor_total": 15450.00,
        "emitente": {
          "cnpj": "98.765.432/0001-10",
          "nome": "FORNECEDOR ABC LTDA",
          "ie": "987654321"
        },
        "destinatario": {
          "cnpj": "12.345.678/0001-90",
          "nome": "DEMO EMPRESA LTDA"
        },
        "status_sefaz": "autorizada",
        "status_manifestacao": "confirmada",
        "xml_url": "https://storage.nfemaster.com.br/xml/...",
        "pdf_url": "https://storage.nfemaster.com.br/pdf/...",
        "tags": ["Importante", "Pago"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3456,
      "total_pages": 173
    }
  }
}
```

### GET /notas-fiscais/:id

Obtém detalhes de uma nota fiscal específica.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "chave_acesso": "35241212345678000190550010000001231234567890",
    "tipo": "NFe",
    "numero": "123",
    "serie": "1",
    "data_emissao": "2024-12-10T08:30:00Z",
    "data_autorizacao": "2024-12-10T08:31:15Z",
    "data_entrada_saida": "2024-12-12T10:00:00Z",
    "valor_total": 15450.00,
    "valor_produtos": 12500.00,
    "valor_icms": 2790.00,
    "valor_ipi": 0,
    "valor_pis": 0,
    "valor_cofins": 0,
    "valor_frete": 450.00,
    "valor_seguro": 0,
    "valor_desconto": 0,
    "emitente": {
      "cnpj": "98.765.432/0001-10",
      "nome": "FORNECEDOR ABC LTDA",
      "ie": "987654321",
      "endereco": "Rua das Flores, 123",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01001-000"
    },
    "destinatario": {
      "cnpj": "12.345.678/0001-90",
      "nome": "DEMO EMPRESA LTDA",
      "ie": "123456789"
    },
    "status_sefaz": "autorizada",
    "status_manifestacao": "confirmada",
    "protocolo_autorizacao": "135241234567890",
    "natureza_operacao": "Venda de Mercadoria",
    "cfop": "5102",
    "informacoes_complementares": "...",
    "xml_conteudo": "<?xml version=\"1.0\"...",
    "itens": [
      {
        "numero_item": 1,
        "codigo_produto": "PROD001",
        "descricao": "Produto Exemplo",
        "ncm": "1234.56.78",
        "cfop": "5102",
        "unidade": "UN",
        "quantidade": 10,
        "valor_unitario": 1250.00,
        "valor_total": 12500.00,
        "valor_icms": 2250.00,
        "aliquota_icms": 18.00
      }
    ],
    "tags": ["Importante", "Pago"],
    "created_at": "2024-12-10T08:35:00Z",
    "updated_at": "2024-12-10T14:20:00Z"
  }
}
```

### GET /notas-fiscais/:id/download

Download do XML ou PDF da nota.

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| formato | string | xml, pdf, zip |

**Response:**
```
Content-Type: application/xml (ou application/pdf, application/zip)
Content-Disposition: attachment; filename="NFe_12345678901234567890123456789012345678901234.xml"
```

### POST /notas-fiscais/download-lote

Download em lote de múltiplas notas.

**Request:**
```json
{
  "notas_ids": ["1", "2", "3"],
  "formato": "zip"
}
```

**Response:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="notas_fiscais_20241215.zip"
```

### POST /notas-fiscais/:id/tags

Adiciona tags a uma nota fiscal.

**Request:**
```json
{
  "tags": ["Importante", "Conferir"]
}
```

### DELETE /notas-fiscais/:id/tags/:tag

Remove uma tag da nota fiscal.

---

## ✅ Manifestação

### POST /manifestacao

Realiza manifestação do destinatário.

**Request:**
```json
{
  "nota_id": "1",
  "tipo": "confirmacao",
  "justificativa": "Operação realizada conforme descrito"
}
```

**Tipos de Manifestação:**
- `ciencia` - Ciência da Emissão
- `confirmacao` - Confirmação da Operação
- `desconhecimento` - Desconhecimento da Operação
- `nao_realizada` - Operação Não Realizada
- `desacordo` - Desacordo da Operação (CTe)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "manifest_1",
    "nota_id": "1",
    "tipo": "confirmacao",
    "data_manifestacao": "2024-12-15T10:30:00Z",
    "protocolo_sefaz": "135241234567901",
    "usuario_id": "1",
    "sucesso": true
  }
}
```

### POST /manifestacao/lote

Manifestação em lote.

**Request:**
```json
{
  "notas_ids": ["1", "2", "3"],
  "tipo": "ciencia",
  "justificativa": "Tomamos ciência das operações"
}
```

---

## 🔍 Consulta SEFAZ

### POST /sefaz/consulta

Inicia consulta de notas na SEFAZ.

**Request:**
```json
{
  "data_inicio": "2024-12-01",
  "data_fim": "2024-12-15",
  "tipo": "NFe"
}
```

**Response (202):**
```json
{
  "success": true,
  "data": {
    "consulta_id": "consulta_123",
    "status": "processando",
    "message": "Consulta iniciada. Você será notificado quando concluir."
  }
}
```

### GET /sefaz/consulta/:id/status

Verifica status da consulta.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "consulta_id": "consulta_123",
    "status": "concluido",
    "notas_encontradas": 15,
    "notas_baixadas": 15,
    "concluido_em": "2024-12-15T10:35:00Z"
  }
}
```

---

## 📊 Relatórios

### GET /relatorios/resumo

Obtém dados para o dashboard.

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| periodo | string | 7d, 30d, 90d, 1y |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_notas": 3456,
    "total_notas_mes": 287,
    "notas_pendentes_manifestacao": 42,
    "notas_manifestadas": 3380,
    "valor_total_notas": 12547890.50,
    "valor_total_mes": 987654.32,
    "fornecedores_ativos": 156,
    "downloads_realizados": 8923
  }
}
```

### GET /relatorios/notas-por-mes

Dados para gráfico de notas por mês.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "labels": ["Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    "datasets": [
      {
        "label": "NFe",
        "data": [245, 289, 312, 298, 267, 287]
      },
      {
        "label": "CTe",
        "data": [45, 52, 48, 61, 55, 49]
      }
    ]
  }
}
```

### GET /relatorios/fornecedores

Lista fornecedores com estatísticas.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "cnpj": "98.765.432/0001-10",
      "nome": "FORNECEDOR ABC LTDA",
      "quantidade_notas": 156,
      "valor_total": 1250000.00,
      "cidade": "São Paulo",
      "uf": "SP"
    }
  ]
}
```

### POST /relatorios/exportar

Exporta relatório em Excel ou PDF.

**Request:**
```json
{
  "tipo": "notas",
  "formato": "excel",
  "filtros": {
    "data_inicio": "2024-12-01",
    "data_fim": "2024-12-15"
  }
}
```

---

## 👥 Usuários

### GET /usuarios

Lista usuários da empresa.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nome": "Administrador Master",
      "email": "admin@demoempresa.com",
      "telefone": "(11) 99999-9999",
      "cargo": "Diretor",
      "perfil": "admin",
      "ativo": true,
      "ultimo_acesso": "2024-12-15T10:30:00Z",
      "created_at": "2024-01-15"
    }
  ]
}
```

### POST /usuarios

Cria novo usuário.

**Request:**
```json
{
  "nome": "Novo Usuário",
  "email": "novo@empresa.com",
  "telefone": "(11) 98888-8888",
  "cargo": "Analista",
  "perfil": "operador"
}
```

### PUT /usuarios/:id

Atualiza dados do usuário.

### DELETE /usuarios/:id

Desativa um usuário.

---

## 🏢 Empresa

### GET /empresa

Obtém dados da empresa logada.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "cnpj": "12.345.678/0001-90",
    "razao_social": "DEMO EMPRESA LTDA",
    "nome_fantasia": "Demo Empresa",
    "inscricao_estadual": "123456789",
    "inscricao_municipal": "987654321",
    "endereco": {
      "logradouro": "Rua das Flores",
      "numero": "123",
      "complemento": "Sala 456",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01001-000"
    },
    "certificado": {
      "id": "cert1",
      "nome": "Certificado A1",
      "valido_de": "2024-01-01",
      "valido_ate": "2025-01-01",
      "emissor": "Serasa"
    },
    "ambiente_sefaz": "producao",
    "plano": {
      "nome": "Business",
      "limite_notas": 5000,
      "notas_utilizadas": 3456
    }
  }
}
```

### PUT /empresa

Atualiza dados da empresa.

### POST /empresa/certificado

Upload de certificado digital.

**Request (multipart/form-data):**
```
certificado: [arquivo .pfx ou .p12]
senha: "senha_do_certificado"
```

---

## 🔔 Notificações

### GET /notificacoes

Lista notificações do usuário.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "tipo": "info",
      "titulo": "Novas notas disponíveis",
      "mensagem": "Foram encontradas 5 novas notas fiscais na SEFAZ.",
      "lida": false,
      "link": "/notas-fiscais?status=pendente",
      "created_at": "2024-12-15T08:00:00Z"
    }
  ],
  "unread_count": 2
}
```

### PUT /notificacoes/:id/lida

Marca notificação como lida.

### PUT /notificacoes/lidas

Marca todas as notificações como lidas.

---

## 🏷️ Tags

### GET /tags

Lista tags da empresa.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nome": "Importante",
      "cor": "#ef4444",
      "created_at": "2024-01-01"
    }
  ]
}
```

### POST /tags

Cria nova tag.

**Request:**
```json
{
  "nome": "Urgente",
  "cor": "#dc2626"
}
```

### PUT /tags/:id

Atualiza tag.

### DELETE /tags/:id

Remove tag.

---

## 📋 Códigos de Resposta

### Sucesso

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 202 | Accepted - Requisição aceita para processamento |
| 204 | No Content - Sem conteúdo para retornar |

### Erro do Cliente

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Requisição inválida |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 422 | Unprocessable Entity - Dados inválidos |
| 429 | Too Many Requests - Rate limit excedido |

### Erro do Servidor

| Código | Descrição |
|--------|-----------|
| 500 | Internal Server Error - Erro interno |
| 502 | Bad Gateway - Erro no gateway |
| 503 | Service Unavailable - Serviço indisponível |

---

## 🔒 Rate Limiting

| Endpoint | Limite |
|----------|--------|
| /auth/* | 10 requisições/minuto |
| /sefaz/* | 30 requisições/minuto |
| /notas-fiscais | 100 requisições/minuto |
| Outros | 60 requisições/minuto |

---

## 📚 Webhooks

### Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| `nota.recebida` | Nova nota recebida da SEFAZ |
| `nota.manifestada` | Nota manifestada |
| `consulta.concluida` | Consulta SEFAZ concluída |
| `certificado.vencendo` | Certificado próximo do vencimento |

### Formato do Payload

```json
{
  "event": "nota.recebida",
  "timestamp": "2024-12-15T10:30:00Z",
  "data": {
    "nota_id": "1",
    "chave_acesso": "35241212345678000190550010000001231234567890",
    "tipo": "NFe",
    "emitente": "FORNECEDOR ABC LTDA",
    "valor": 15450.00
  }
}
```

---

## 📖 Changelog

### v1.0.0 (2024-12-15)
- Versão inicial da API
- Endpoints de autenticação
- CRUD de notas fiscais
- Manifestação do destinatário
- Consulta SEFAZ
- Relatórios

---

**Documentação Version**: 1.0.0  
**Last Updated**: 2024-12-15
