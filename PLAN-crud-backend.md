# CRUD Backend — NotaFiscal, Manifestação, Tag

## Goal
Create 2 NestJS modules (`notas-fiscais/`, `tags/`) with full CRUD endpoints, cursor-based pagination, filtering, XML import (single + batch via BullMQ), manifestação as sub-resource, and tag M2M operations.

## Context
- `JwtAuthGuard` is global (`APP_GUARD`) — no per-route guard needed
- `AuthenticatedRequest.user` has `{ sub, email, empresaId }` — scope all queries by `empresaId`
- `StorageService.upload(key, body, contentType)` / `.download(key)` — ready for XML storage
- `QUEUE_NAMES.XML_PROCESSING` queue exists — reuse for batch import
- `QueueModule` is `@Global()` — no need to import BullModule in new modules
- Prisma indexes: `@@index([empresaId])`, `@@index([dataEmissao])`, `chaveAcesso @unique`
- M2M: `Tag ↔ NotaFiscal` via `@relation("NotaTags")`

## Tasks

- [ ] **1. Create `notas-fiscais/` module scaffold**
  - Files: `notas-fiscais.module.ts`, `notas-fiscais.controller.ts`, `notas-fiscais.service.ts`
  - Imports: `PrismaModule`, `StorageModule`, `BullModule.registerQueue(XML_PROCESSING)`
  - Register in `AppModule`
  - Verify: `npm run build` passes, module loads

- [ ] **2. Create DTOs with `class-validator`**
  - `dto/filtro-notas.dto.ts` — query params: `cursor?`, `take?`, `tipo?`, `statusSefaz?`, `statusManifestacao?`, `emitenteCnpj?`, `emitenteNome?`, `periodoInicio?`, `periodoFim?`, `tags?`
  - `dto/importar-xml.dto.ts` — file upload validation
  - `dto/manifestar-nota.dto.ts` — `tipo` (enum), `justificativa?`
  - `dto/paginated-response.dto.ts` — generic `{ data, meta: { nextCursor, hasMore, total } }`
  - Verify: DTOs compile, validators applied

- [ ] **3. Implement `NotasFiscaisService` — List + Detail**
  - `findAll(filters, empresaId)` — cursor-based: `prisma.notaFiscal.findMany({ where, cursor, take: take+1, include: { tags: true } })`, dynamic where from DTO, return `{ data, meta }`
  - `findOne(id, empresaId)` — with `manifestacoes` + `tags` include
  - `count(where)` — for total count
  - Verify: Unit test `service.findAll()` with mocked Prisma returns paginated result

- [ ] **4. Implement XML Import (single)**
  - `POST /notas-fiscais/importar` — accept `multipart/form-data`, parse XML to extract `chaveAcesso`, `numero`, `serie`, `tipo`, valores, emitente, datas
  - Validate `chaveAcesso` (44 digits, unique), reject duplicates
  - Save XML to MinIO via `StorageService.upload('xml/{empresaId}/{chaveAcesso}.xml', buffer, 'text/xml')`
  - Create `NotaFiscal` record in Prisma with `xmlConteudo` or reference to storage key
  - Verify: POST with XML file → 201 + record in DB + file in MinIO

- [ ] **5. Implement Batch Import via BullMQ**
  - `POST /notas-fiscais/importar-lote` — accept multiple files, enqueue each as `xmlQueue.add('import-xml', { empresaId, fileName, buffer })`
  - Create `XmlImportProcessor` (`@Processor(QUEUE_NAMES.XML_PROCESSING)`) — process each XML asynchronously (reuse single import logic)
  - Return `202 Accepted` with job IDs
  - Verify: POST with 3 XMLs → 202 + 3 jobs queued, jobs process to DB records

- [ ] **6. Implement remaining endpoints**
  - `GET /notas-fiscais/:id/xml` — download XML from MinIO via `StorageService.download()`
  - `DELETE /notas-fiscais/:id` — soft delete: `prisma.notaFiscal.update({ where, data: { statusSefaz: 'inativa' } })`
  - Verify: GET xml returns file, DELETE returns 200 + status changes

- [ ] **7. Implement Manifestação (sub-resource)**
  - `POST /notas-fiscais/:id/manifestar` — validate nota belongs to empresa, create `Manifestacao` record (tipo, justificativa, usuarioId from JWT), update `NotaFiscal.statusManifestacao`
  - `GET /notas-fiscais/:id/manifestacoes` — list manifestações of nota
  - Use Prisma transaction: `prisma.$transaction([createManifestacao, updateNotaStatus])`
  - Verify: POST manifestar → record created + nota status updated

- [ ] **8. Create `tags/` module**
  - Files: `tags.module.ts`, `tags.controller.ts`, `tags.service.ts`, `dto/create-tag.dto.ts`, `dto/update-tag.dto.ts`
  - `GET /tags` — list by empresaId
  - `POST /tags` — create (nome + cor), scoped to empresa
  - `PATCH /tags/:id` — update nome/cor
  - `DELETE /tags/:id` — remove tag (cascade disconnect from notas)
  - Register in `AppModule`
  - Verify: CRUD operations work, tag scoped to empresa

- [ ] **9. Implement Tag ↔ Nota M2M operations**
  - `POST /notas-fiscais/:id/tags` — body `{ tagIds: string[] }`, connect tags via `prisma.notaFiscal.update({ where, data: { tags: { connect: tagIds.map(id => ({ id })) } } })`
  - `DELETE /notas-fiscais/:id/tags/:tagId` — disconnect single tag
  - Validate tags belong to same empresa
  - Verify: Assign tag → nota.tags contains tag, remove → does not

- [ ] **10. Verification**
  - `npm run build` — zero errors
  - `npm run test` — unit tests pass for services
  - cURL/Postman manual test: list → create → detail → manifestar → tag → delete flow
  - All endpoints return `TransformInterceptor` wrapped responses

## Done When
- [ ] `GET /notas-fiscais` returns cursor-paginated, filterable list scoped by empresa
- [ ] `POST /notas-fiscais/importar` parses XML, saves to DB + MinIO
- [ ] `POST /notas-fiscais/importar-lote` queues batch via BullMQ
- [ ] `POST /notas-fiscais/:id/manifestar` creates manifestação + updates nota status
- [ ] Tags CRUD + M2M assign/remove works
- [ ] All endpoints scoped by `empresaId` from JWT
- [ ] `npm run build` passes

## Notes
- `JwtAuthGuard` is global — endpoints are protected by default, use `@Public()` decorator to opt-out
- Reuse existing `QUEUE_NAMES.XML_PROCESSING` queue, extend processor or create new consumer
- `xmlConteudo` field exists in schema (`@db.Text`) — store small XMLs inline, large ones in MinIO only
- Consider adding `@@index([emitenteCnpj])` migration if filter by CNPJ is frequent
