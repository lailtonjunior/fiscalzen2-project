# Architect Specialist Agent Playbook

---

## Overview

The architect-specialist agent guides and enforces architectural integrity and scalable design across the FiscalZenProject, with a focus on maintaining robust patterns, clear boundaries between layers, and best practices for maintainability and extensibility.

---

## Areas of Focus

### 1. API Layer (Request Handling and Routing)

- **Location:** `fiscalzen-api/src`
- **Key Files:** 
  - `fiscalzen-api/src/app.controller.ts` (`AppController`)
  - `fiscalzen-api/src/app.module.ts` (`AppModule`)
- **Purpose:** Entry point for all HTTP requests; routes requests to appropriate service methods. Defines route structure and high-level orchestration.

### 2. Service Layer (Business Logic)

- **Location:** `fiscalzen-api/src`
- **Key Files:** 
  - `fiscalzen-api/src/app.service.ts` (`AppService`)
- **Purpose:** Encapsulates core business logic, validation, and orchestration. Isolated from direct request/response handling to allow for testability.

### 3. Shared Types and Utilities

- **Location:** `fiscalzen-app/src/types`
- **Key Files:** 
  - `fiscalzen-app/src/types/index.ts` (`RelatorioConfig`, `SpedConfig`)
- **Purpose:** Defines shared data structures for consistent cross-module communication and type safety in both backend and frontend codebases.

### 4. UI Components (For Data & Chart Representation)

- **Location:** `fiscalzen-app/src/components/ui`
- **Key Files:** 
  - `fiscalzen-app/src/components/ui/chart.tsx` (`getPayloadConfigFromPayload`)
- **Purpose:** Handles configuration, rendering logic, and transformation of data for UI presentation, ensuring strong type safety and clear separation from business rules.

---

## Workflows & Step-by-Step Guidance

### A. Adding or Refactoring a Service

1. **Create the Service Class**
   - Place new service classes in `fiscalzen-api/src`.
   - Extend the singleton class pattern using dependency injection provided by the framework.

2. **Define Public Methods Clearly**
   - Each public method should correspond to a business use case or domain action.
   - Use clear, descriptive naming.

3. **Write Reusable, Testable Logic**
   - Keep logic stateless where possible.
   - Avoid direct references to controller/request objects.

4. **Document Service Contracts**
   - Use JSDoc/TSDoc above each method.
   - Reference types from `fiscalzen-app/src/types/index.ts` for consistency.

### B. Introducing or Modifying a Controller

1. **Controllers Only Orchestrate**
   - Instantiate controllers in `fiscalzen-api/src/app.controller.ts` or related files.
   - Use dependency injection to access required services.
   - Controllers should not contain business logic—delegate to services.

2. **Route Design**
   - Follow clear REST conventions (`GET`,`POST`,`PUT`,`DELETE`).
   - Each route method should focus on a single responsibility and leverage strongly typed request/response models.

3. **Request/Response Validation**
   - Validate incoming data at the boundary (controller), using DTOs/types from `fiscalzen-app/src/types`.

### C. Updating Shared Types or Configurations

1. **Centralize Type Definitions**
   - Modify or add new shared types in `fiscalzen-app/src/types/index.ts`.
   - Ensure all business and UI contracts reference these types.

2. **Version and Document Changes**
   - Use clear comments and update documentation for structural changes or migrating type definitions.

### D. Managing UI Component Architecture (Charts & Data)

1. **Component Boundaries**
   - Place new chart/data transformation logic in `fiscalzen-app/src/components/ui/chart.tsx` or relevant UI/component folders.

2. **Transformation and Mapping**
   - Extract data transformation logic into helper functions (e.g., `getPayloadConfigFromPayload`).
   - Reference type contracts for payloads to ensure type safety.

---

## Best Practices in the FiscalZenProject

- **Strict Layer Separation:** No business logic in controllers; services only orchestrate and operate on data.
- **Type Safety & Centralization:** All major interfaces/configs for backend and frontend live in `fiscalzen-app/src/types`.
- **Consistent Routing and Pattern Usage:** RESTful patterns for API; single-responsibility methods in controllers and services.
- **Testability:** Avoid tight coupling to HTTP/express objects; decouple logic for easy unit testing.
- **Documentation:** Method-level JSDoc or TSDoc in services and complex components.
- **Scalability:** Modular organization with a clear path for introducing new domains and services.

---

## Key Files and Their Purposes

| File Path                                                      | Purpose                                                                                      |
|---------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `fiscalzen-api/src/app.controller.ts`                         | Main API controller; routes requests, delegates to services.                                 |
| `fiscalzen-api/src/app.module.ts`                             | Root module; central for dependency injection and bootstrapping API components.              |
| `fiscalzen-api/src/app.service.ts`                            | Core service; business logic and orchestration point.                                        |
| `fiscalzen-app/src/types/index.ts`                            | Shared type and interface declarations for backend/frontend data consistency.                |
| `fiscalzen-app/src/components/ui/chart.tsx`                   | Chart transformation/render logic; `getPayloadConfigFromPayload` for UI configuration needs. |

---

## Architectural Diagram (Textual)

```
[UI Components] <-----> [Shared Types] <-----> [API Controllers] <-----> [Services]
    |                       ^                        |                        |
    |                       |                        |                        |
    v                       |                        v                        v
  Chart.tsx  <------------ index.ts ------------> app.controller.ts ---> app.service.ts
```

---

## Summary for Agent Operation

- **Focus Areas:** API structure (`fiscalzen-api`), service encapsulation, shared types, UI data flow.
- **Key Tasks:** Enforce layering, add/refactor services, keep typings up-to-date, document patterns.
- **Conventions:** RESTful routing, clean separation of responsibility, central type management.

This playbook provides guidance for system-wide architectural consistency, rapid onboarding, and streamlined development within the FiscalZenProject.
