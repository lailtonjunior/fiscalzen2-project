# FiscalZen Project Documentation

Welcome to the FiscalZen Project! This repository powers an end-to-end platform for Brazilian fiscal document management, featuring robust back-end APIs and a modern front-end application.

---

## Documentation Index

Start here to get oriented, then dive into specific guides as needed. All documentation lives in the `docs/` directory.

### Core Guides

- [Project Overview](./project-overview.md): High-level summary of the project, objectives, and status.
- [Architecture Notes](./architecture.md): Technical architecture and design decisions.
- [Development Workflow](./development-workflow.md): How to contribute and run the project locally.
- [Testing Strategy](./testing-strategy.md): Testing approach, types, and coverage.
- [Glossary & Domain Concepts](./glossary.md): Business and technical terminology.
- [Data Flow & Integrations](./data-flow.md): Data lifecycle and system interfaces.
- [Security & Compliance Notes](./security.md): Security principles and compliance guidelines.
- [Tooling & Productivity Guide](./tooling.md): Developer productivity tools and scripts.

---

## Repository Structure

- [`fiscalzen-api/`](../fiscalzen-api/): NestJS back-end for API and business logic.
- [`fiscalzen-app/`](../fiscalzen-app/): Next.js/React front-end for user experience.
- [`docker-compose.yml`](../docker-compose.yml): Container orchestration for local development.
- [`docs/`](./): Project documentation.

See [Architecture Notes](./architecture.md) for details on conventions and dependencies.

---

## Key Concepts & Codebase Highlights

### Domains, Types, and Interfaces

FiscalZen manages domain models such as Empresa (Company), NotaFiscal (Fiscal Invoice), Manifestacao (Tax Manifestation), Relatorios (Reports), Tags, and more. Types and interfaces are centrally defined in `fiscalzen-app/src/types/index.ts` to ensure strong typing across the stack.

### API and Application Entrypoints

- **AppModule, AppController, AppService** (NestJS): See `fiscalzen-api/src/app.module.ts`, `app.controller.ts`, and `app.service.ts`.
- **Main Application Entrypoints**:
  - Backend: `fiscalzen-api/src/main.ts`
  - Frontend: `fiscalzen-app/src/main.tsx`

### Utilities & Component Library

A rich set of utilities are provided in `fiscalzen-app/src/lib/utils.ts`, including:

- Formatting helpers: `formatCNPJ`, `formatCPF`, `formatCurrency`, etc.
- File handling: `downloadFile`, `exportToExcel`.
- Data processing: `groupBy`, `debounce`, `daysDifference`.
- Status/color mapping: `getStatusLabel`, `getStatusColor`.

Shared UI components lie in `fiscalzen-app/src/components/ui/` and `components/custom/`, enabling rapid and consistent front-end development.

### State Management & Hooks

Application state (such as user authentication, invoice selection, notification handling) is managed using custom React hooks, e.g., `useStore.ts`, `use-mobile.ts`.

### Test Strategy

- Unit and integration tests for APIs: See `fiscalzen-api/test/` and test files throughout.
- Front-end tests: Located within respective component or hooks directories.

Full testing, CI, and coverage details in the [Testing Strategy](./testing-strategy.md).

---

## How to Get Started

1. **Review Project Overview** to understand the scope and domain.
2. **See Development Workflow** for instructions on environment setup, local run, and code contribution.
3. **Familiarize with Key Types/Functions** by browsing `fiscalzen-app/src/types/index.ts` and `lib/utils.ts`.
4. **Explore Component Usage** and API endpoints for hands-on understanding.
5. **Check Testing Strategy** before submitting changes.

---

## Further Resources

- [Glossary & Domain Concepts](./glossary.md)
- [API Docs](../fiscalzen-api/README.md) *(if available in repo)*
- [Component Library Reference](../fiscalzen-app/src/components/ui/README.md) *(if available in repo)*

---

## Feedback & Contributions

We welcome improvements and suggestions! For questions on structure or contributions, see the [Development Workflow](./development-workflow.md) or open a GitHub issue.

---

**Happy hacking from the FiscalZen Team!**
