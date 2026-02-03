# Architecture Notes

FiscalZen is architected to provide a modular, extensible, and robust platform for managing fiscal documents and compliance events. The system leverages a clear separation of concerns across distinct layers: user interface, application logic, data management, and integrations with external authorities (SEFAZ). The design prioritizes scalability, maintainability, and reliability, enabling features such as high-volume document processing, responsive client interactions, and robust data synchronization. Adopted patterns and infrastructure choices aim to minimize coupling, ease onboarding, and foster a consistent developer experience.

# System Architecture Overview

FiscalZen employs a two-tiered modular architecture, composed of a web frontend (`fiscalzen-app`) and a backend API (`fiscalzen-api`). Both applications are decoupled and communicate exclusively via HTTP (REST). The API handles all business logic, data persistence, and external integrations, while the frontend is responsible for dynamic user interfaces and state management on the client side.

Deployment is containerized using Docker Compose, orchestrating API, frontend, PostgreSQL, and Redis services. Requests from end users are received by the frontend, routed to the API, which validates, processes, and retrieves/stores data in Postgres or Redis. Asynchronous processing (e.g., XML parsing and polling SEFAZ) is performed via background workers. The implementation leverages dependency injection in the API layer, component abstraction on the frontend, and is aligned with atomic design principles.

> For more in-depth data flow, see [data-flow.md](./data-flow.md).

# Architectural Layers

- **Controllers**: Handle incoming API requests, route to services (`fiscalzen-api/src`, `fiscalzen-api/test`).
- **Services**: Business logic and domain operations (`fiscalzen-api/src`).
- **Database Layer**: Database models, migrations, and access (`fiscalzen-api/prisma`, `fiscalzen-api/src`).
- **Utils/Helpers**: Shared, pure functions for utilities (`fiscalzen-app/src/lib/`).
- **UI Components**: Reusable UI atoms and molecules (`fiscalzen-app/src/components/ui`, `fiscalzen-app/src/components/custom`).
- **Hooks/State Management**: React hooks for UI state, domain-specific stores (`fiscalzen-app/src/hooks/`).
- **Sections/Views**: Page-level and domain-driven React views (`fiscalzen-app/src/sections/`).

> See [`codebase-map.json`](./codebase-map.json) for complete symbol counts and dependency graphs.

# Detected Design Patterns

| Pattern                | Confidence | Locations                                                                                             | Description                                               |
|------------------------|------------|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| Repository             | 90%        | [`prisma.service.ts`](../fiscalzen-api/src/prisma/prisma.service.ts), [`app.service.ts`](../fiscalzen-api/src/app.service.ts)             | Abstraction over database access logic using Prisma ORM   |
| Dependency Injection   | 100%       | [`app.module.ts`](../fiscalzen-api/src/app.module.ts), [`app.controller.ts`](../fiscalzen-api/src/app.controller.ts)                       | NestJS DI for services, controllers, providers            |
| Component-based UI     | 95%        | [`components/ui/`](../fiscalzen-app/src/components/ui/), [`components/custom/`](../fiscalzen-app/src/components/custom/)                   | React components for modular UI/following Atomic Design   |
| Observer (React Hooks) | 80%        | [`hooks/useStore.ts`](../fiscalzen-app/src/hooks/useStore.ts)                                         | State updates propagate via custom hooks                  |
| Factory (Utility)      | 65%        | [`utils.ts`](../fiscalzen-app/src/lib/utils.ts)                                                        | Utility functions act as simple factories for data        |

# Entry Points

- [fiscalzen-api/src/main.ts](../fiscalzen-api/src/main.ts) &mdash; **Backend API bootstrap**
- [fiscalzen-app/src/main.tsx](../fiscalzen-app/src/main.tsx) &mdash; **Frontend SPA entry point**

# Public API

| Symbol             | Type       | Location                                                                    |
|--------------------|------------|-----------------------------------------------------------------------------|
| ApiKey             | Interface  | fiscalzen-app/src/types/index.ts:263                                         |
| AppController      | Class      | fiscalzen-api/src/app.controller.ts:5                                        |
| AppModule          | Class      | fiscalzen-api/src/app.module.ts:10                                           |
| AppService         | Class      | fiscalzen-api/src/app.service.ts:4                                           |
| Certificado        | Interface  | fiscalzen-app/src/types/index.ts:29                                          |
| ChartConfig        | Type       | fiscalzen-app/src/components/ui/chart.tsx:11                                 |
| cn                 | Function   | fiscalzen-app/src/lib/utils.ts:4                                             |
| ConferenciaSped    | Interface  | fiscalzen-app/src/types/index.ts:252                                         |
| Dashboard          | Function   | fiscalzen-app/src/sections/Dashboard.tsx:49                                  |
| DashboardStats     | Interface  | fiscalzen-app/src/types/index.ts:174                                         |
| daysDifference     | Function   | fiscalzen-app/src/lib/utils.ts:177                                           |
| debounce           | Function   | fiscalzen-app/src/lib/utils.ts:165                                           |
| downloadFile       | Function   | fiscalzen-app/src/lib/utils.ts:95                                            |
| Empresa            | Interface  | fiscalzen-app/src/types/index.ts:3                                           |
| Endereco           | Interface  | fiscalzen-app/src/types/index.ts:19                                          |
| exportToExcel      | Function   | fiscalzen-app/src/lib/utils.ts:226                                           |
| FiltroNotas        | Interface  | fiscalzen-app/src/types/index.ts:159                                         |
| formatChaveAcesso  | Function   | fiscalzen-app/src/lib/utils.ts:73                                            |
| formatCNPJ         | Function   | fiscalzen-app/src/lib/utils.ts:9                                             |
| formatCNPJCPF      | Function   | fiscalzen-app/src/lib/utils.ts:31                                            |
| formatCPF          | Function   | fiscalzen-app/src/lib/utils.ts:20                                            |
| formatCurrency     | Function   | fiscalzen-app/src/lib/utils.ts:40                                            |
| formatDate         | Function   | fiscalzen-app/src/lib/utils.ts:49                                            |
| formatDateTime     | Function   | fiscalzen-app/src/lib/utils.ts:60                                            |
| generateRandomColor| Function   | fiscalzen-app/src/lib/utils.ts:111                                           |
| getStatusColor     | Function   | fiscalzen-app/src/lib/utils.ts:183                                           |
| getStatusLabel     | Function   | fiscalzen-app/src/lib/utils.ts:204                                           |
| GraficoDados       | Interface  | fiscalzen-app/src/types/index.ts:185                                         |
| groupBy            | Function   | fiscalzen-app/src/lib/utils.ts:155                                           |
| Header             | Function   | fiscalzen-app/src/components/custom/Header.tsx:44                            |
| isValidCNPJ        | Function   | fiscalzen-app/src/lib/utils.ts:122                                           |
| ItemNotaFiscal     | Interface  | fiscalzen-app/src/types/index.ts:125                                         |
| LogIntegracao      | Interface  | fiscalzen-app/src/types/index.ts:224                                         |
| Manifestacao       | Interface  | fiscalzen-app/src/types/index.ts:146                                         |
| Manifestacao       | Function   | fiscalzen-app/src/sections/Manifestacao.tsx:42                               |
| NotaFiscal         | Interface  | fiscalzen-app/src/types/index.ts:58                                          |
| NotasFiscais       | Function   | fiscalzen-app/src/sections/NotasFiscais.tsx:58                               |
| Notificacao        | Interface  | fiscalzen-app/src/types/index.ts:212                                         |
| parseXML           | Function   | fiscalzen-app/src/lib/utils.ts:85                                            |
| RelatorioConfig    | Interface  | fiscalzen-app/src/types/index.ts:194                                         |
| Relatorios         | Function   | fiscalzen-app/src/sections/Relatorios.tsx:58                                 |
| Sidebar            | Function   | fiscalzen-app/src/components/custom/Sidebar.tsx:124                          |
| SpedConfig         | Interface  | fiscalzen-app/src/types/index.ts:237                                         |
| StatusManifestacao | Type       | fiscalzen-app/src/types/index.ts:55                                          |
| StatusSefaz        | Type       | fiscalzen-app/src/types/index.ts:54                                          |
| Tag                | Interface  | fiscalzen-app/src/types/index.ts:289                                         |
| TipoDocumento      | Type       | fiscalzen-app/src/types/index.ts:53                                          |
| TipoManifestacao   | Type       | fiscalzen-app/src/types/index.ts:56                                          |
| truncateText       | Function   | fiscalzen-app/src/lib/utils.ts:79                                            |
| useIsMobile        | Function   | fiscalzen-app/src/hooks/use-mobile.ts:5                                      |

# Internal System Boundaries

- **Frontend/Backend Contract**: All client/server communication occurs via clearly defined REST endpoints. The backend validates and enforces all business rules, ensuring frontend clients cannot subvert domain policies.
- **Persistence Layer**: Data access and migration responsibilities are encapsulated within the backend only, chiefly using Prisma ORM. The database belongs solely to backend code; the frontend never interacts directly with persistent storage.
- **Background Jobs**: Decoupled from HTTP processing. Heavy operations like XML parsing or batch SEFAZ polling are queued and processed asynchronously, enforcing separation between API responsiveness and long-running computation.
- **Domain Entities**: Types and interfaces for fiscal documents, users, and events are shared as contract definitions (see `src/types`) but logic remains encapsulated within their respective modules.

# External Service Dependencies

- **SEFAZ (Brazilian Fiscal Authority)**: Main integration point for fetching and posting fiscal documents.
  - **Authentication**: Uses certificates managed and stored securely on the backend.
  - **Rate Limiting**: SEFAZ exposes strict throughput constraints; backend implements throttling and retries.
  - **Failure Handling**: Temporary network and SEFAZ outages are tolerated via retry logic and persistent job queues.
- **PostgreSQL**: Primary transactional data store.
  - **Backup/Restore**: Managed via Docker volumes/mounts in dev; production guidance recommends managed RDS or equivalent.
- **Redis**: Used for both cache (speeding up idempotent calls) and as backend for job queues (via BullMQ).
  - **Failure**: API tolerates cache loss but job queue interruptions degrade system throughput.

# Key Decisions & Trade-offs

- **Backend-enforced Authorization**: Ensures data security/regulatory compliance by restricting all critical mutations to authenticated and authorized server paths.
- **Async Processing via Queues**: Chosen for resilience and scalability versus pure synchronous approaches.
- **Containerization via Docker Compose**: Simplifies onboarding and local integration testing at the expense of increased developer storage/network usage.
- **React SPA over SSR**: Prioritizes interactive/dynamic interfaces; can add SSR later if SEO or load times become an issue.
- **Prisma ORM**: Offers type safety and rapid schema evolution but necessitates explicit migrations and constraints definition.

# Diagrams

```mermaid
graph TD
  subgraph Frontend [fiscalzen-app]
    A[User Browser] --> B[React SPA]
  end
  subgraph Backend [fiscalzen-api]
    B --> C[NestJS API]
    C --> D[Prisma ORM]
    C --> E[Redis (Cache/Queue)]
    C --> F[SEFAZ API]
  end
  subgraph Infrastructure
    D --> G[(PostgreSQL DB)]
    E --> H[(Redis)]
  end
  F -.->|XML Polling| C
```

# Risks & Constraints

- **SEFAZ Availability/Latency**: Outages or throttling severely impact document retrieval timelines.
- **Job Queue Overload**: If Redis is down or jobs backlog for extended periods, delayed processing results.
- **Schema Coupling**: Changes in SEFAZ document formats require rapid backend schema evolution, risking bugs or incompatibility.
- **Local Development Parity**: Docker Compose environments may differ from cloud or production-scale topologies; additional effort may be required to simulate prod issues.

# Top Directories Snapshot

- `/fiscalzen-api/` &mdash; NestJS API codebase (~60 files)
- `/fiscalzen-app/` &mdash; React frontend SPA (~90 files)
- `/fiscalzen-api/prisma/` &mdash; Prisma data models & migrations (~10 files)
- `/fiscalzen-app/src/components/ui/` &mdash; Atomic UI components (~40 files)
- `/fiscalzen-app/src/sections/` &mdash; Pages and domain-driven views (~15 files)
- `/fiscalzen-app/src/hooks/` &mdash; Custom React hooks for state management (~10 files)
- `/fiscalzen-app/src/lib/` &mdash; Utility methods and libraries (~10 files)

# Related Resources

- [Project Overview](./project-overview.md)
- [Data Flow](./data-flow.md)
- [Codebase Symbol Map](./codebase-map.json)
- [Tooling Guide](./tooling.md)
