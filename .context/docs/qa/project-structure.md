# FiscalZen Project Structure

This document provides a practical overview of the FiscalZen codebase, describing how the project is organized, the main components, and key conventions. It is intended for developers seeking to understand, navigate, or contribute to the codebase efficiently.

---

## Top-Level Structure

The repository is organized into two primary directories:

- **`fiscalzen-api/`**: Backend REST API (NestJS)
- **`fiscalzen-app/`**: Frontend web application (React)

Each directory represents a separate application but shares types, integration points, and business logic concepts.

---

## Backend: `fiscalzen-api/`

**Purpose**: Provides REST API endpoints, handles business logic, authentication, and data persistence.

### Structure

```
fiscalzen-api/
  ├── src/
  │   ├── controllers/   # Route handlers (Controllers)
  │   ├── services/      # Business logic services
  │   ├── app.module.ts  # NestJS module configuration
  │   ├── app.controller.ts  # Main API controller
  │   ├── app.service.ts     # Main application service
  │   └── main.ts        # App bootstrap entry point
  ├── test/              # API test cases (e2e and unit tests)
  └── ...
```

### Key Files

- **`app.module.ts`**: Central module registering controllers, services, and providers.
- **`app.controller.ts`**: Main API route controller.
- **`app.service.ts`**: Shared application logic (can be used by controllers).
- **`main.ts`**: Application entry point (bootstraps NestJS app).

### Common Patterns

- **Controllers** use decorators (`@Controller`, `@Get`, etc.) and depend on **Services** for business logic.
- **Services** encapsulate reusable business logic, typically injected via NestJS's dependency injection.

### Example: Creating an API Endpoint

```typescript
// In src/controllers/hello.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HelloService } from '../services/hello.service';

@Controller('hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  sayHello() {
    return this.helloService.sayHello();
  }
}
```

---

## Frontend: `fiscalzen-app/`

**Purpose**: Implements the user interface (dashboard, forms, charts), manages client-side logic and interactions.

### Structure

```
fiscalzen-app/
  ├── src/
  │   ├── components/
  │   │   ├── ui/        # Generic, reusable UI components (Button, Modal, etc.)
  │   │   └── custom/    # App-specific custom components (Sidebar, Header, etc.)
  │   ├── sections/      # Page-level React components (Dashboard, Reports, etc.)
  │   ├── types/         # Shared TypeScript interfaces and types
  │   ├── hooks/         # Custom React hooks (state management, helpers)
  │   ├── lib/           # Utility functions (formatting, downloads, etc.)
  │   └── main.tsx       # Client app entry point
  └── ...
```

### Key Conventions

- **UI Components**: Small, focused, easily reusable (prefer `ui/`)
- **Custom Components**: Structured, app-segment focused, e.g., `Sidebar`, `Header`
- **Sections**: Large, feature-specific or route-specific components (pages)
- **Types**: Single source of truth for TypeScript interfaces, enabling strong types across API and frontend
- **Hooks**: Encapsulate logic for state or effects (e.g., `useIsMobile`)
- **Lib**: Utility functions for formatting, parsing, grouping data, etc.

### Example File Locations

- **Sidebar component**: `src/components/custom/Sidebar.tsx`
- **Utility functions**: `src/lib/utils.ts`
- **Data types and interfaces**: `src/types/index.ts`
- **Dashboard page**: `src/sections/Dashboard.tsx`

### Example: Using Utilities and Types

```typescript
// src/sections/NotasFiscais.tsx
import { formatCurrency } from '../lib/utils';
import type { NotaFiscal } from '../types';

function NotaFiscalRow({ nota }: { nota: NotaFiscal }) {
  return <span>{formatCurrency(nota.total)}</span>;
}
```

---

## Common Types & Utilities

### Type Definitions (`fiscalzen-app/src/types/index.ts`)

- **Empresa, Endereco, Certificado, Usuario,...**: Core domain interfaces
- Strong typing used in both API and frontend logic

### Utility Functions (`fiscalzen-app/src/lib/utils.ts`)

Frequently-used helpers, e.g.,

- `formatCNPJ`, `formatCPF`: Format Brazilian document numbers
- `groupBy`, `debounce`: Data manipulation utilities
- `exportToExcel`, `downloadFile`: File export/download logic

---

## Testing

- **Backend tests**: Found under `fiscalzen-api/test/`, using Jest or Supertest
- **Frontend tests**: Conventions favor colocating tests next to components (`*.test.tsx`), not shown in this summary

---

## Integration Points

- **Type Consistency**: Types in `fiscalzen-app/src/types/` enforce alignment between backend data models and frontend usage.
- **API Endpoints**: Consumed from React using `fetch`/`axios` (not detailed here).

---

## Summary

- **Backend (`fiscalzen-api`)**: Responsible for data and business logic; follows NestJS controller/service conventions.
- **Frontend (`fiscalzen-app`)**: Modular, component-driven React application using strong TypeScript typing, utilities, and custom hooks.
- **Utilities & Types**: Shared patterns and contracts make the code easily maintainable and extendable.

---

For further detail, refer to:
- Specific directories (`controllers/`, `services/`, `components/`, `sections/`)
- The source of truth for data contracts (`types/index.ts`)
- Utility implementations (`lib/utils.ts`)

Use this document to orient yourself quickly to FiscalZen’s project layout and coding conventions.
