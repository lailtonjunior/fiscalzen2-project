# Code Reviewer Agent Playbook

---

## Overview

This playbook provides comprehensive guidance for a Code Reviewer AI agent operating within the FiscalZenProject repository. The agent’s purpose is to assess code changes for quality, style compliance, maintainability, and adherence to architectural and business logic conventions specific to this codebase.

---

## 1. Focus Areas for Code Review

### **A. Core Layers**

#### 1. Controllers (`fiscalzen-api`)
- *Handles routing, HTTP requests, and delegates business logic to services.*
  - Key Files:
    - `fiscalzen-api/src/app.controller.ts` (main entry for request handling)
    - `fiscalzen-api/src/app.module.ts` (application module configuration)
    - Test files in `fiscalzen-api/test`

#### 2. Services (`fiscalzen-api`)
- *Encapsulates and orchestrates business logic, should not contain direct API or UI logic.*
  - Key Files:
    - `fiscalzen-api/src/app.service.ts` (core service logic)

#### 3. Utilities & Helpers (`fiscalzen-app`)
- *Provides reusable utility functions for formatting (CNPJ, CPF, Currency, Dates, XML parsing).*
  - Key Files:
    - `fiscalzen-app/src/lib/utils.ts` (utility function definitions)

#### 4. Types & Shared State (`fiscalzen-app`)
- *Defines data types and shared state management for the frontend.*
  - Types:
    - `fiscalzen-app/src/types/index.ts` (all main data types: Empresa, NotaFiscal, etc.)
  - State:
    - `fiscalzen-app/src/hooks/useStore.ts` (`AuthState`, `NotasState`, etc.)
    - `fiscalzen-app/src/hooks/use-mobile.ts` (mobile state)

#### 5. Components & UI (`fiscalzen-app`)
- *Manages rendering and interaction logic for the user interface.*
  - Key Files:
    - UI components: 
      - `fiscalzen-app/src/components/ui/tooltip.tsx`
      - `fiscalzen-app/src/components/ui/toggle.tsx`
      - `fiscalzen-app/src/components/ui/toggle-group.tsx`
      - `fiscalzen-app/src/components/ui/textarea.tsx`
      - `fiscalzen-app/src/components/ui/tabs.tsx`
    - Custom components: 
      - `fiscalzen-app/src/components/custom/Sidebar.tsx`
      - `fiscalzen-app/src/components/custom/Header.tsx`
    - Feature sections:
      - `fiscalzen-app/src/sections/Relatorios.tsx`
      - `fiscalzen-app/src/sections/Manifestacao.tsx`
      - `fiscalzen-app/src/sections/Dashboard.tsx`
      - `fiscalzen-app/src/sections/NotasFiscais.tsx`
    - Application entry:
      - `fiscalzen-app/src/App.tsx`

---

## 2. Review Workflows & Steps

### **A. General Steps for Reviewing a Pull Request (PR) or Change**

1. **Identify Touched Files**
   - Note which layer(s) and key files are modified.
   - Prioritize core layers and high-impact modules.

2. **Check for Scope Compliance**
   - Confirm that controllers only handle routing and delegate business logic appropriately.
   - Ensure services encapsulate logic without leaking request or presentation responsibilities.
   - Validate utils do not introduce side effects or stateful logic.

3. **Code Quality & Style**
   - Enforce consistent formatting.
   - Verify naming conventions match examples from key files/types.
   - Ensure appropriate use of TypeScript types and type safety.

4. **Architecture & Conventions**
   - Respect separation of concerns between controllers, services, utils, and components.
   - Reuse available utilities from `utils.ts` for formatting and parsing.
   - Use types from `src/types/index.ts` for clarity and maintainability.

5. **Testing & Coverage**
   - Check for the presence or updates to test files in `fiscalzen-api/test`.
   - Ensure new/changed logic in services and controllers is covered by tests.
   - Where applicable, confirm component updates have corresponding tests/stories.

6. **Documentation & Comments**
   - API endpoints, complex business logic, and utilities should be adequately documented with comments.
   - Update or reference documentation when modifying behaviors.

---

## 3. Codebase Best Practices

### **A. Layer Responsibilities**

- **Controllers:** Minimal business logic—focus on mapping requests to service calls.
- **Services:** Encapsulate all business processes, perform orchestrations, use dependency injection.
- **Utils:** Pure functions only—stateless, side-effect free, well-named, and easily composable.
- **Types:** Centralized type definitions—reuse and consistently extend from typedefs.
- **State Hooks:** Use single source of truth via custom hooks like `useStore.ts`, leverage TypeScript for state typing.

### **B. Naming Conventions**

- Service classes: `*Service` (e.g., `AppService`)
- Controllers: `*Controller`
- Utilities: lowerCamelCase functions (e.g., `formatCurrency`, `truncateText`)
- Types/interfaces: PascalCase (e.g., `Usuario`, `NotaFiscal`, `AuthState`)
- Component files: PascalCase ending in `.tsx`

### **C. TypeScript Usage**

- Always annotate function inputs/outputs with explicit types.
- Favor interface/type reuse from `src/types/index.ts`—do not redeclare types inline.
- Handle `null` and `undefined` defensively, especially for optional props or API data.

### **D. Utility Function Patterns**

- Prefer reusing existing functions in `lib/utils.ts` for formatting, parsing, and transformations.
- Utility functions should be *pure*—rely solely on inputs, avoid mutating state.

### **E. Component Structure**

- UI components organized in `components/ui/` and `components/custom/`—favor composition and clear prop typing.
- Sections (`sections/`) encapsulate domain views—rely on hooks/services for data.
- Use destructuring for props and state, keep component functions concise.

### **F. Testing**

- Place all backend tests in `fiscalzen-api/test`.
- Tests should cover positive and negative scenarios, including edge cases for services and controllers.
- Ensure new features/components include new or updated tests.

---

## 4. Code Patterns & Conventions

### **Controller Example**
```typescript
@Controller('api/v1/resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  getAll(): Promise<Resource[]> {
    return this.resourceService.findAll();
  }
}
```
- **Pattern:** Controller delegates all logic to a service.

### **Service Example**
```typescript
@Injectable()
export class ResourceService {
  findAll(): Promise<Resource[]> {
    // Business logic here
  }
}
```
- **Pattern:** Centralizes business workflow, no direct request/response code.

### **Utility Function Example**
```typescript
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
```
- **Pattern:** Stateless, pure, easily reused.

### **Type Usage Example**
```typescript
import { Usuario } from '../types/index';

function greetUser(user: Usuario): string {
  return `Olá, ${user.nome}`;
}
```
- **Pattern:** Always use centrally defined types.

---

## 5. Key Files & Their Purposes

| File                                             | Purpose                                                                         |
|--------------------------------------------------|---------------------------------------------------------------------------------|
| `fiscalzen-api/src/app.controller.ts`            | Defines HTTP endpoints and routing for core API logic.                           |
| `fiscalzen-api/src/app.service.ts`               | Contains main service and orchestrates business logic.                           |
| `fiscalzen-api/src/app.module.ts`                | Application module configuration and dependency injection root.                  |
| `fiscalzen-api/test/`                            | Contains backend (API/service) unit and integration tests.                       |
| `fiscalzen-api/src/main.ts`                      | Server bootstrap and application startup logic.                                  |
| `fiscalzen-app/src/lib/utils.ts`                 | Common formatting, parsing, and helper functions (stateless utilities).          |
| `fiscalzen-app/src/types/index.ts`               | Centralized TypeScript types and interfaces (domain models, DTOs, etc.).         |
| `fiscalzen-app/src/hooks/useStore.ts`            | Manages global frontend state using custom React hooks/store patterns.           |
| `fiscalzen-app/src/sections/Relatorios.tsx`      | Implements the reports/analytics UI section.                                     |
| `fiscalzen-app/src/sections/Manifestacao.tsx`    | Implements fiscal manifestation logic (frontend).                                |
| `fiscalzen-app/src/sections/Dashboard.tsx`       | Dashboard UI, summary, and main KPIs section.                                   |
| `fiscalzen-app/src/sections/NotasFiscais.tsx`    | Section listing and managing fiscal documents.                                  |
| `fiscalzen-app/src/components/ui/xxx.tsx`        | UI library controls: tooltip, toggle, textarea, tabs, etc.                       |
| `fiscalzen-app/src/components/custom/Sidebar.tsx`| Custom navigation component for the sidebar.                                     |
| `fiscalzen-app/src/components/custom/Header.tsx` | Custom header/navigation bar component.                                          |
| `fiscalzen-app/src/App.tsx`                      | Frontend application root and routing.                                           |
| `fiscalzen-app/src/hooks/use-mobile.ts`          | Detects and manages mobile user experience logic.                                |

---

## 6. Common Review Checks

- **Are controllers lean and delegating?**
- **Is business logic centralized in services?**
- **Are utility functions pure and stateless?**
- **Is type safety observed everywhere?**
- **Are existing utilities/types reused instead of duplicated?**
- **Does the code follow the naming and file structure conventions outlined above?**
- **Are there corresponding, up-to-date tests for core changes?**
- **Is the documentation kept accurate and up to date for new/altered APIs and behaviors?**
- **Does the code avoid anti-patterns (mixing concerns, type any, direct state mutation, etc.)?**

---

## 7. Summary

A successful code review in this repository ensures:
- Separation of concerns between API, service, UI, and utility layers.
- Strict adherence to code patterns, naming conventions, and best practices.
- Complete, correct, and well-tested business logic.
- Use of centralized utilities and types for maintainability.
- Clear, maintainable, and TypeScript-strong code at all layers.

---

**End of Playbook**
