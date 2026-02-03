# Feature Developer Agent Playbook

Welcome, Feature Developer Agent! This playbook will guide you through efficiently adding new features to the FiscalZenProject codebase. It includes an overview of key areas, actionable workflows, established code patterns, and best practices to ensure your contributions are high-quality and well-integrated.

---

## 1. Key Areas & Files to Focus On

### Backend (API Layer)
- **Controllers**  
  Handle API requests, routing, and responses.  
  *Directory:* `fiscalzen-api/src`  
  *Main Files:*  
    - `app.controller.ts` — Exports `AppController`, main entry point for request handling.
    - `app.module.ts` — Exports `AppModule`, application bootstrap and dependency container.
- **Services**  
  Business logic and orchestration.  
  *Directory:* `fiscalzen-api/src`  
  *Main File:*  
    - `app.service.ts` — Exports `AppService`, central business logic layer.

### Frontend (UI Layer)
- **Custom Components**  
  Advanced application UI and layouts.  
  *Directory:* `fiscalzen-app/src/components/custom`  
  *Main Files:*  
    - `Sidebar.tsx` (`Sidebar`, `NavItem`)
    - `Header.tsx` (`Header`, `HeaderProps`)
- **UI Components**  
  Reusable, atomic UI elements.  
  *Directory:* `fiscalzen-app/src/components/ui`  
  *Examples:*  
    - Tables: `table.tsx` (exports `Table`, `TableHeader`, etc.)
    - Toggles: `toggle.tsx`, `toggle-group.tsx`
    - Misc: `tooltip.tsx`, `slider.tsx`, `switch.tsx`, `spinner.tsx`, etc.

### Test & Documentation Locations
- Backend tests: `fiscalzen-api/test`
- Internal documentation: `/docs`, `/AGENTS.md`, `/CONTRIBUTING.md`

---

## 2. Feature Development Workflow

### A. Planning & Discovery
1. **Analyze Feature Request:**  
   Review the feature specification for context, affected areas, acceptance criteria, and dependencies.
2. **Identify Impacted Areas:**  
   - API: New endpoints, DTOs, business logic.
   - UI: New components, views, or extensions to existing ones.
   - State/Integration: Data flow changes, API consumption updates.

### B. Backend Implementation
1. **Controller Update:**  
   - Add new route(s) in `app.controller.ts` or create a new controller.
   - Decorate with proper HTTP method decorators (`@Get()`, `@Post()`, etc).
   - Delegate logic to the appropriate service.
2. **Service Logic:**  
   - Add or extend methods in `app.service.ts`.
   - Encapsulate business logic and validation.
3. **Data Models (if applicable):**  
   - Extend existing DTOs/models or create new ones.
   - Register new providers/modules as needed in `app.module.ts`.

### C. Frontend Implementation
1. **Custom/Reusable Components:**  
   - Add new or extend components in `fiscalzen-app/src/components/custom` or `ui`.
   - Favor composition and reuse per existing patterns (e.g., use of Table, Toggle, Tooltip, etc.).
2. **State and API Handling:**  
   - Use existing data fetching patterns or hooks.
   - Type your data/props using found patterns (`HeaderProps`, etc.).
3. **UI Integration:**  
   - Wire new/updated components into the main app layout or relevant screens.
   - Ensure seamless integration with `Sidebar`, `Header`, and navigation (`NavItem`).

### D. Testing
1. **Backend:**  
   - Add/extend tests in `fiscalzen-api/test`.
   - Cover new controller routes and service logic.
2. **Frontend:**  
   - Add/extend tests for new components and interactions if test setup is present.
   - Use snapshot, unit, or integration tests per existing patterns.

### E. Documentation & Cleanup
1. **Update Docs:**  
   - Document new endpoints, component APIs, and feature usage in `/docs` or code comments.
2. **Consistency Check:**  
   - Review for code style alignment, DRY principle, and modularity.
3. **Self/Peer Review:**  
   - Ensure all acceptance criteria are met.
   - Attempt a smoke-test of the new feature, or flag for code review.

---

## 3. Best Practices & Patterns

- **Service/Controller Separation:**  
  Keep business logic in services, thin controllers handle request/response only.
- **Component Structure:**  
  Custom components in `custom`, atomic UI elements in `ui`. Use props & types for configurability.
- **Type Safety:**  
  Use TypeScript types/interfaces across UI and API.
- **Naming Conventions:**  
  - Classes/Components/Exports: `PascalCase`
  - Files: `camelCase` for components (`sidebar.tsx`, etc.)
- **Export Patterns:**  
  Prefer named exports for reusability and clarity.
- **Props/Type Defs:**  
  Co-locate simple props/interfaces above component definitions.
- **Reusability:**  
  Use composition—build complex UI from atomic `ui` components.
- **Testing:**  
  Place backend tests under `fiscalzen-api/test`. Adopt similar structure for frontend if testing setup exists.

---

## 4. Key Files Reference

| Area                        | File/Component                                       | Exports/Role                                             |
|-----------------------------|------------------------------------------------------|----------------------------------------------------------|
| Backend Controller          | `fiscalzen-api/src/app.controller.ts`                | `AppController` - Handles routes                         |
| Backend Service             | `fiscalzen-api/src/app.service.ts`                   | `AppService` - Encapsulates business logic               |
| Backend Module              | `fiscalzen-api/src/app.module.ts`                    | `AppModule` - Registers controllers/services             |
| UI Sidebar                  | `fiscalzen-app/src/components/custom/Sidebar.tsx`    | `Sidebar`, `NavItem`                                     |
| UI Header                   | `fiscalzen-app/src/components/custom/Header.tsx`     | `Header`, `HeaderProps`                                  |
| UI Components Library       | `fiscalzen-app/src/components/ui/`                   | Table, Tooltip, Toggle, Switch, Spinner, etc.            |
| Tooltip (UI Example)        | `fiscalzen-app/src/components/ui/tooltip.tsx`        | `Tooltip`, `TooltipProvider`, etc.                       |
| Table (UI Example)          | `fiscalzen-app/src/components/ui/table.tsx`          | `Table`, `TableHeader`, `TableBody`, etc.                |

---

## 5. Code Patterns & Conventions

- **Controllers**
  ```typescript
  @Controller('feature')
  export class FeatureController {
    constructor(private readonly featureService: FeatureService) {}

    @Get()
    async getAll() { return this.featureService.findAll(); }
  }
  ```
- **Services**
  ```typescript
  @Injectable()
  export class FeatureService {
    findAll() { /* business logic */ }
  }
  ```
- **UI Components**
  ```tsx
  import { Table, TableHeader, TableBody } from '../ui/table';

  export function FeatureTable({ items }: FeatureTableProps) {
    return (
      <Table>
        <TableHeader>...</TableHeader>
        <TableBody>...</TableBody>
      </Table>
    );
  }
  ```
- **Type Usage**
  ```tsx
  interface FeatureTableProps {
    items: MyType[];
  }
  ```
- **Exporting Components**
  ```tsx
  export { MyComponent };
  // or
  export default MyComponent;
  ```

---

## 6. Additional Resources

- [Documentation Index](../docs/README.md)
- [Agent Knowledge Base](../../AGENTS.md)
- [Contributor Guidelines](../../CONTRIBUTING.md)

---

**Summary:**  
When developing features, always trace the flow: Specification → Affected Areas → Backend (Controller/Service) → Frontend (Components/UI) → Tests → Docs. Stick to codebase conventions, reuse existing patterns, and document anything new for maintainability.

**Ready to implement a feature? Start by reviewing the specification and identifying its API and UI impact, then follow this playbook for a streamlined development cycle.**
