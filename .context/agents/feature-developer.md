# Feature-Developer Agent Playbook

---

## Overview

This playbook provides comprehensive guidance for the "feature-developer" agent working within the FiscalZenProject monorepo. It covers which files to focus on in both backend and frontend, effective workflows for adding features, established best practices, and essential files/symbols to understand before development.

---

## 1. Focus Areas

### Backend (API Layer)
- **Controllers**: Handle request routing and input processing
  - Directory: `fiscalzen-api\src`
  - Key Files: 
    - `app.controller.ts`
    - Other controllers following the `*.controller.ts` naming pattern
- **Services**: Encapsulate business logic and orchestrate operations
  - Directory: `fiscalzen-api\src`
  - Key Files:
    - `app.service.ts`
    - Additional services following the `*.service.ts` naming pattern

### Frontend (App Layer)
- **UI Components**: Build reusable UI primitives and custom features
  - Generic UI Components: `fiscalzen-app\src\components\ui`
  - Application-Specific Components: `fiscalzen-app\src\components\custom`
  - Key Files:
    - `Sidebar.tsx`, `Header.tsx`, `chart.tsx`, and all UI primitives in `/ui`

---

## 2. Common Workflows

### A. Adding a New Backend Feature

1. **Extend or Create Service**
   - Locate or create a relevant Service (e.g., `app.service.ts`).
   - Add/Update business logic methods and keep methods concise and testable.

2. **Expose via Controller**
   - Modify or create a Controller (e.g., `app.controller.ts`).
   - Add endpoint handlers that call service methods.
   - Use clear REST conventions for method naming and HTTP verbs.

3. **Testing**
   - Locate matching tests in `fiscalzen-api\test` or create new ones.
   - Follow similar structure to existing tests (unit for services, integration for controllers).

4. **Update Module Declarations**
   - Ensure new services/controllers are declared in `app.module.ts`.

**File Flow Example**:
- `src\something.service.ts` ⟶ `src\something.controller.ts` ⟶ `src\app.module.ts`

---

### B. Adding/Updating a UI Feature

1. **UI Primitives and Custom Components**
   - Prefer using or extending components within `fiscalzen-app\src\components\ui`.
   - For app-specific features, work within `fiscalzen-app\src\components\custom`.

2. **Component Creation or Update**
   - Ensure new components follow existing patterns (`function` components, prop-driven, TS support).
   - Export using named exports, matching the detected codebase convention.

3. **Reusable Patterns**
   - Refer to core UI patterns: e.g., encapsulate state logic in hooks, pass props, avoid side-effects in component render cycles.

4. **Testing and Storybook**
   - If tests exist, follow their pattern (file co-location or `__tests__` directory).

**Component Example**:  
- New element: `fiscalzen-app\src\components\ui\my-new-toggle.tsx`
- New app-level feature: `fiscalzen-app\src\components\custom\FeaturePanel.tsx`

---

## 3. Best Practices

### Coding Patterns

- **Services**
  - Single-responsibility principle for each method.
  - Avoid business logic in controllers; delegate to services.
  - Export services and use dependency injection patterns.

- **Controllers**
  - Map HTTP endpoints to clear controller methods.
  - Minimal direct business logic; focus on parsing input and handling responses.

- **UI Components**
  - Use functional components with TypeScript types for props.
  - Use named exports.
  - Structure props and states clearly; document key props with JSDoc if applicable.
  - Leverage and extend `/ui` primitives for consistency.
  - Custom components in `/custom` directory for project-level features.

### Style & Conventions

- Preferred structure: `export function ComponentName() { ... }`
- Consistent naming: 
  - Controllers: `XController`
  - Services: `XService`
  - UI: `ComponentName.tsx`
- Tests:
  - Mirror the directory and filename of production code.
  - Use `describe/it` or similar patterns for clarity.
- Configurations and modules:
  - Always declare new services and controllers in app module files (e.g., `app.module.ts`).

---

## 4. Key Files and Their Purposes

| File/Directory                                            | Purpose                                                       |
|-----------------------------------------------------------|---------------------------------------------------------------|
| `fiscalzen-api\src\app.service.ts`                        | Main service for backend logic; exported as `AppService`.     |
| `fiscalzen-api\src\app.controller.ts`                     | Main controller, routes backend requests.                     |
| `fiscalzen-api\src\app.module.ts`                         | Declares controllers and services for DI container.           |
| `fiscalzen-api\test\`                                     | Backend tests (unit/integration).                             |
| `fiscalzen-app\src\components\ui\`                        | Core, reusable UI primitives (toggles, tooltips, tables, etc).|
| `fiscalzen-app\src\components\custom\Sidebar.tsx`         | Sidebar navigation component; integrates `NavItem` symbol.    |
| `fiscalzen-app\src\components\custom\Header.tsx`          | App header; uses `HeaderProps` type.                          |
| `fiscalzen-app\src\components\ui\tooltip.tsx`             | Tooltip UI, including `TooltipProvider`, `TooltipContent`, etc.|
| `fiscalzen-app\src\components\ui\toggle.tsx`              | Toggle switch/checkbox UI; exported as `Toggle`.              |

---

## 5. Symbols & Usage

- **Backend**:
  - `AppService`: Central class for shared logic.
  - `AppController`: Main entry point for backend routes.

- **Frontend**:
  - Core UI: `Tooltip`, `Toggle`, `Tabs`, `Table`, `Switch`, etc.
  - Custom: `Sidebar`, `Header`, custom types (e.g., `NavItem`, `HeaderProps`).

---

## 6. Reference Patterns

**Backend**
```typescript
// Service Example
@Injectable()
export class DemoService {
  getFeature(): DataType { ... }
}
```
```typescript
// Controller Example
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}
  @Get()
  findAll() { return this.demoService.getFeature(); }
}
```

**Frontend**
```tsx
// UI Component Example
export function MyComponent(props: MyComponentProps) {
  return <div>{props.label}</div>;
}
```
```tsx
// Custom Component Example
type FeaturePanelProps = { ... }
export function FeaturePanel(props: FeaturePanelProps) {
  return <Sidebar {...props} />
}
```

---

## 7. Summary Checklist

- [ ] Identify correct file/area for new feature (API or UI)
- [ ] Update/create service and controller (backend) or component (frontend)
- [ ] Export using named exports (TS)
- [ ] Register components/services in relevant module files
- [ ] Update/add tests following project conventions
- [ ] Follow code and styling patterns based on the codebase
- [ ] Document surfaces and props/types as necessary

---

## 8. Additional Resources

- Explore symbol definitions with code navigation tools.
- Review similar features for naming, structure, and patterns.
- Refer to project README or contributing documentation for setup/testing (if available).

---

**This playbook serves as your detailed guide for new feature implementation within FiscalZenProject. Adhere closely to these workflows and best practices to ensure codebase consistency and quality as you develop.**
