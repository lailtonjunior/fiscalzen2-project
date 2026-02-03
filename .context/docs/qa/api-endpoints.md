# FiscalZen API Endpoints

This document provides a comprehensive overview of the API endpoints exposed by the FiscalZen backend, focusing on the main endpoints controlled by `AppController` and relevant types for API key management and request/response shapes. Use these endpoints to interact with core FiscalZen entities such as Empresa, NotaFiscal, Manifestacao, and more.

## Base URL

The FiscalZen API base URL is typically:

```
https://<your-domain>/api/
```

All examples below assume this as the base path. Adjust accordingly for your deployment.

---

## Authentication

Most endpoints require an **API Key** for authentication, represented by the `ApiKey` type:

```ts
interface ApiKey {
  id: string;
  key: string;
  status: 'active' | 'revoked';
  createdAt: Date;
  lastUsedAt?: Date;
}
```

Send your API key as a header:

```
Authorization: Bearer <your-api-key>
```

---

## Core Endpoints

### 1. Empresas (Companies)

#### List Companies

**GET** `/empresas`

Retrieve a list of registered companies.

**Response Example:**

```json
[
  {
    "id": "empresa_1",
    "nome": "ACME Ltda",
    "cnpj": "12.345.678/0001-99",
    "endereco": {
      "logradouro": "...",
      "numero": "...",
      "bairro": "...",
      "municipio": "...",
      "uf": "...",
      "cep": "..."
    },
    ...
  }
]
```

#### Get Company

**GET** `/empresas/:id`

Get information for a specific company.

**Response:** Same as above for a company object.

---

### 2. Notas Fiscais (Fiscal Notes)

#### List Fiscal Notes

**GET** `/notas-fiscais`

Returns a paginated list of Nota Fiscal documents. Supports filtering via query params as described in `FiltroNotas` type.

**Query Parameters Example:**

- `empresaId=empresa_1`
- `status=emitida`
- `dataInicio=2024-01-01`
- `dataFim=2024-01-31`
- ...

**Response Example:**

```json
{
  "items": [
    {
      "id": "nfe_1",
      "empresaId": "empresa_1",
      "emissao": "2024-01-10",
      "valorTotal": 1234.56,
      ...
    }
  ],
  "total": 100
}
```

#### Get Nota Fiscal

**GET** `/notas-fiscais/:id`

Retrieve detailed information for a specific fiscal note (`NotaFiscal`).

---

### 3. Manifestação (Manifestation/Acknowledgement)

#### Send Manifestação

**POST** `/manifestacoes`

Send a manifestation about a note.

**Body Example:**

```json
{
  "notaFiscalId": "nfe_1",
  "tipo": "confirmação",
  "descricao": "Nota fiscal confirmada"
}
```

Relevant payload type: `Manifestacao`

**Response:**

Status and result of the manifestation.

---

### 4. Relatórios (Reports)

#### Generate Report

**POST** `/relatorios`

Generate a report based on filters.

**Body:** Defined by `RelatorioConfig` type, e.g.

```json
{
  "empresaId": "empresa_1",
  "dataInicio": "2024-01-01",
  "dataFim": "2024-01-31",
  "tipo": "mensal"
}
```

**Response:** Download link or file depending on report type.

---

### 5. Certificados (Certificates)

Endpoints for managing digital certificates (`Certificado`):

- **GET** `/certificados`
- **POST** `/certificados`
- **DELETE** `/certificados/:id`

---

### 6. Notificações (Notifications)

- **GET** `/notificacoes` — List notifications for authenticated user
- **PATCH** `/notificacoes/:id` — Mark as read

---

### 7. Tags

- **GET** `/tags` — List tags available for organizing notes
- **POST** `/tags` — Create new tag

---

### 8. Webhooks

- **GET** `/webhooks` — List registered webhooks
- **POST** `/webhooks` — Register a new webhook callback URL

---

## Common Types

Types used in request/response payloads:

- **Empresa**: Company profile
- **Endereco**: Address structure for companies
- **NotaFiscal**: Core model for fiscal notes
- **ItemNotaFiscal**: Line items within fiscal notes
- **Manifestacao**: Manifestation/acknowledgment on a note
- **FiltroNotas**: Filters for note listing
- **Certificado**: Digital certificate model
- **ApiKey**: API authentication model
- **Notificacao**: Notification model
- **Tag**: Tagging model for classification

For definitions, see [`src/types/index.ts`](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/types/index.ts).

---

## Example: Fetching Notas Fiscais with Axios

```js
import axios from 'axios';

const API_URL = 'https://your-api-domain/api/notas-fiscais';
const API_KEY = 'your-api-key-here';

axios.get(API_URL, {
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
  params: {
    empresaId: 'empresa_1',
    dataInicio: '2024-01-01',
    dataFim: '2024-01-31',
  }
})
.then(res => {
  console.log(res.data.items);
})
.catch(err => {
  console.error(err);
});
```

---

## Best Practices

- **Authentication**: Always protect your API keys, and use HTTPS.
- **Rate Limiting**: Respect any rate limits configured for your API key.
- **Data Filtering**: Use filtering, pagination, and sorting parameters to manage responses efficiently.
- **Error Handling**: All endpoints return standard HTTP status codes and descriptive error messages when possible.

---

## Cross References

- [Types Reference](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/types/index.ts)
- [AppController](../../AppData/Local/Programs/Antigravity/fiscalzen-api/src/app.controller.ts)
- [How to Use the SDK](./sdk-usage.md) _(if applicable)_

---

For further details on payload structures and advanced workflows, see the [TypeScript type definitions](../../AppData/Local/Programs/Antigravity/fiscalzen-app/src/types/index.ts) or contact the FiscalZen development team.

---

_Last updated: 2026-02-02_
