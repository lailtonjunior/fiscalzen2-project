# Project Overview

**FiscalZen** is a modern platform designed to streamline the management, storage, and compliance of electronic fiscal documents (NFe, CTe) for Brazilian businesses. By automating the capture, manifestation, and retention of fiscal data, FiscalZen empowers organizations to simplify regulatory processes, reduce manual work, and maintain compliance with SEFAZ requirements.

---

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

---

## Quick Facts

- Root: `C:\Users\InfoHunters\Downloads\FiscalZenProject`
- Languages: TypeScript (majority), JavaScript, (minor) shell/docker config; see file counts in `codebase-map.json`
- Entry points:  
  - API: `fiscalzen-api/src/main.ts`
  - Frontend: `fiscalzen-app/src/main.tsx`
- Full analysis: [`codebase-map.json`](./codebase-map.json)

---

## Entry Points

- **Backend API (NestJS):** [`fiscalzen-api/src/main.ts`](../fiscalzen-api/src/main.ts#L4)
- **Main Application Module:** [`fiscalzen-api/src/app.module.ts`](../fiscalzen-api/src/app.module.ts#L10)
- **Frontend SPA (React):** [`fiscalzen-app/src/main.tsx`](../fiscalzen-app/src/main.tsx#L1)
- **App Entry (React):** [`fiscalzen-app/src/App.tsx`](../fiscalzen-app/src/App.tsx#L13)

---

## Key Exports

See [`codebase-map.json`](./codebase-map.json) for a comprehensive, up-to-date list of all exported symbols, components, and utility functions across the API and frontend apps.

---

## File Structure & Code Organization

- `fiscalzen-api/` — NestJS-based backend API, including controllers, services, modules, and integration logic.
- `fiscalzen-app/` — React SPA frontend, with UI components, hooks, sections, and utility functions.
- `docs/` — Project documentation and specs.
- `docker/` — Container definitions and compose files for local and production orchestration.
- `prisma/` — Database schema, migrations, and Prisma ORM configurations.
- `tests/` — Automated test suites for various project modules.

---

## Technology Stack Summary

The FiscalZen project leverages TypeScript as its primary language across both frontend and backend, ensuring type safety and maintainability. The backend is powered by NestJS (Node.js runtime), exposing RESTful APIs and managing business logic. The React frontend utilizes Vite for fast builds and hot reloading, styled using Tailwind CSS and shadcn/ui for consistent, accessible UI components.

Containerization is managed via Docker and Docker Compose, enabling seamless local development and reproducible production environments. PostgreSQL serves as the relational database, with Prisma for schema and query management. Redis is adopted for caching and background job processing. Standard tools such as ESLint, Prettier, and Husky (for pre-commit hooks) enforce code quality and formatting.

---

## Core Framework Stack

- **Backend:**  
  - [NestJS](https://nestjs.com/) enforces modular architecture, dependency injection, and layered controllers/services for scalable API design.
  - [Prisma ORM](https://prisma.io/) provides schema-driven database access and migrations.
- **Frontend:**  
  - [React](https://react.dev/) with hooks and Context API organizes logic and state.
  - [Vite](https://vitejs.dev/) for rapid development and builds.
  - [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for utility-first and accessible UI patterns.
- **Data & Messaging:**  
  - [PostgreSQL](https://www.postgresql.org/) (relational data)
  - [Redis](https://redis.io/) for caching and pub/sub (jobs and tasks)
- **Containerization:**  
  - [Docker](https://www.docker.com/) and Compose for orchestration.

The architecture follows clear separation of concerns, encouraging DRY principles and scalable modularity.

---

## UI & Interaction Libraries

- **UI Kits:**  
  - [shadcn/ui](https://ui.shadcn.com/) for customizable, accessible components conforming to WAI-ARIA.
  - Tailwind CSS utility classes for rapid and consistent styling across the app.
- **Form & Validation:**  
  - React Hook Form for managing forms and validation logic.
  - Custom hooks in `fiscalzen-app/src/hooks/` for device detection (`useIsMobile`) and state management (`useStore`).
- **Accessibility & Theming:**  
  - Focus on semantic HTML, ARIA roles, and responsive design.
- **Localization:**  
  - Project structure supports future internationalization (i18n) needs.

---

## Development Tools Overview

- **CLI & Scripts:**  
  - `npm` scripts for linting, testing, and building across both frontend and backend.
  - `docker-compose` for unified spin-up/down of all project services.
- **Linting/Quality:**  
  - ESLint and Prettier configurations for both API and app, auto-enforced via Husky pre-commit hooks.
- **Testing:**  
  - Jest and Cypress (where applicable) for backend and frontend tests.
- **Tooling Guide:**  
  - See [tooling.md](./tooling.md) for extended dev environment details and customization tips.

---

## Getting Started Checklist

1. **Clone the repository** locally:
    ```shell
    git clone <repo-url>
    cd FiscalZenProject
    ```
2. **Install local (non-container) dependencies** (optional, for custom runs):
    ```shell
    cd fiscalzen-app
    npm install
    cd ../fiscalzen-api
    npm install
    ```
3. **Start all services via Docker Compose:**
    ```shell
    docker-compose up -d
    ```
4. **Access the application:**
    - Frontend: [http://localhost:8080](http://localhost:8080)
    - API: [http://localhost:3000](http://localhost:3000)
5. **Verify:**  
   - Visit the frontend and ensure you see the login/dashboard.
   - API should expose `/api` routes; test with Postman or curl if needed.
6. **Explore:**  
   - Check [`development-workflow.md`](./development-workflow.md) for branch, commit, and release process recommendations.

---

## Next Steps

As FiscalZen continues to evolve:
- Real-time SEFAZ (Brazilian tax authority) integration is in-progress, aiming for full compliance capability.
- Frontend connections are shifting from mock data to actual API consumption.
- Security is being enhanced with RBAC (Role-Based Access Control) and advanced audit logging.
- Product specs and stakeholder documentation will be extended; see forthcoming docs or contact the product owner.

For more on system design or cross-team collaboration, check out [architecture.md](./architecture.md) and [tooling.md](./tooling.md).

---

**Related Docs:**
- [architecture.md](./architecture.md)
- [development-workflow.md](./development-workflow.md)
- [tooling.md](./tooling.md)
- [codebase-map.json](./codebase-map.json)
