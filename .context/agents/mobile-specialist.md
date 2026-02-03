# Mobile Specialist Agent Playbook

---

## Overview

This playbook provides comprehensive guidelines for a Mobile Specialist working on the FiscalZenProject. The primary focus is on the `fiscalzen-app` package, targeting the creation, maintenance, and enhancement of native and cross-platform mobile user experiences. The agent is expected to interact with UI components, sections, service integrations, and utilize shared utilities for formatting and data manipulation.

---

## 1. Focus Areas

### Core Codebase Segments

- **UI Components:**  
  Located in `fiscalzen-app\src\components\ui` (generic controls) and `fiscalzen-app\src\components\custom` (application-specific components).
- **Application Sections (Views):**  
  Located in `fiscalzen-app\src\sections` (e.g., `Dashboard.tsx`, `NotasFiscais.tsx`, `Relatorios.tsx`, `Manifestacao.tsx`).
- **App Entry Point:**  
  `fiscalzen-app\src\App.tsx`
- **Shared Utilities:**  
  `fiscalzen-app\src\lib\utils.ts` (helpers for formatting, parsing, etc.).
- **API Integration Service Logic:**  
  Business logic accessed via the backend service (`fiscalzen-api\src\app.service.ts`).

---

## 2. Common Workflows

### A. Adding/Modifying a UI Component

1. **Determine Type:**  
   - Generic (place in `components\ui`).  
   - Application-specific (place in `components\custom`).
2. **Follow Convention:**  
   - Use named exports.  
   - Follow component naming (PascalCase).  
   - Include prop types/interfaces at the top or near export.
3. **Testing:**  
   - Use corresponding test files (pattern: `<component>.test.tsx` if available).
   - Reuse and extend utility components (e.g., `Tooltip`, `Toggle`, `Switch`).
4. **Documentation:**  
   - Add usage examples in code comments or relevant documentation files.

### B. Creating/Editing an App Section (View/Page)

1. **Structure:**  
   - Place section logic in `src\sections\<SectionName>.tsx`.
2. **Best Practices:**  
   - Receive data and handlers as props where possible.
   - Use utility functions for formatting and parsing (import from `lib\utils.ts`).
   - Use shared UI components for consistent visuals/interactions.
3. **Integration:**  
   - Connect to App-level navigation via `App.tsx` and `Sidebar.tsx`.
   - Export main component/class as a named export.

### C. Data Formatting & Display

1. **Import Needed Utilities:**  
   - Functions like `formatCNPJ`, `formatCPF`, `formatCNPJCPF`, `formatCurrency`, `formatDate`, `formatDateTime`, etc.
2. **Apply When Displaying Data:**  
   - Always use relevant functions before displaying values in UI.
   - Utilities reside in `src\lib\utils.ts`.

### D. Backend Integration

1. **API Consumption:**  
   - Fetch data via service endpoints exposed by `fiscalzen-api`.
   - Integrate fetching logic in section components or in hooks/services.
2. **Business Logic:**  
   - Interact with core logic encapsulated in `AppService` (reference in `fiscalzen-api\src\app.service.ts`).
   - Adhere to service-oriented architecture for backend communication.

### E. Implementing Interactivity

1. **Use Internal Handlers:**  
   - Follow handler conventions, e.g., `handleSelectAll`, `handleDownload`, etc.
2. **Pass Handlers Appropriately:**  
   - Pass callback functions via props to components where triggered by user action.
3. **Consolidate Logic:**  
   - Place batch and single-action handlers in section files for clarity (`NotasFiscais.tsx` is a model).

---

## 3. Key Code Patterns and Conventions

- **Component Naming:** PascalCase for all React components, interfaces, and types.
- **Props:** Define prop types/interfaces near the component export.
- **Exports:** Use named exports exclusively for components and functions.
- **Utility Usage:**  
    - Centralize formatting and parsing within `lib\utils.ts`.
    - Do not duplicate formatting logic in components.
- **Handler Naming:**  
    - Prefix with `handle` for UI-event handlers (e.g., `handleExportExcel`).
    - Prefix with `get` for data retrieval helpers (e.g., `getManifestacaoDescription`).
- **UI Structure:**  
    - Prefer breakdown into smaller stateless components when possible.
    - Place repeated UI patterns in `/ui` and reference throughout sections.
- **Section Organization:**  
    - Keep main exported section component defaulted at the end of each section file.
    - Co-locate supporting interfaces/types/handlers within the same file.

---

## 4. Best Practices

- **Consistency:**  
  Always use utility functions for value formatting, never inline.
- **Separation of Concerns:**  
  Ensure UI components remain presentation-focused; business/data logic stays in handlers or external hooks/services.
- **Reusability:**  
  Extend UI controls from `ui` components; avoid code duplication for similar widgets (e.g., toggles, tooltips, tables).
- **Testing:**  
  Add/maintain test files for all critical UI and logic (mirroring structure and naming).
- **Documentation:**  
  Update in-code comments, especially for exported handlers and major props.
- **Error Handling:**  
  Use try/catch or equivalent with feedback via UI (e.g., `src\components\ui\sonner.tsx`).
- **Accessibility:**  
  Favor accessible props and behaviors in UI components.

---

## 5. Key Files and Their Purpose

| File/Directory                                    | Purpose/Description                                                                       |
|---------------------------------------------------|-------------------------------------------------------------------------------------------|
| `src\App.tsx`                                     | Main app entry point, top-level composition, navigation routing                           |
| `src\components\ui\*`                             | Generic, reusable UI controls (tooltips, toggles, tables, etc.)                           |
| `src\components\custom\Sidebar.tsx`               | Sidebar navigation, structure, and navigation logic                                       |
| `src\components\custom\Header.tsx`                | App header, branding, and top-level controls                                              |
| `src\sections\Dashboard.tsx`                      | Dashboard section component and logic                                                     |
| `src\sections\NotasFiscais.tsx`                   | Nota Fiscal management and interaction logic                                              |
| `src\sections\Relatorios.tsx`                     | Reporting, export handlers for Excel/PDF                                                  |
| `src\sections\Manifestacao.tsx`                   | Manifestation features, handlers, and UI                                                  |
| `src\lib\utils.ts`                                | Shared utilities: data formatting, CNPJ/CPF validation, date/currency functions           |
| `fiscalzen-api\src\app.service.ts`                | Backend: core business logic and orchestration service                                    |

---

## 6. References & Further Guidance

- **API Design:** Refer to `fiscalzen-api` structure for endpoints and business logic, align mobile interaction accordingly.
- **Navigation:**  
  - Update sidebar (`Sidebar.tsx`) and routing props for new sections/views.
- **State Management:**  
  - Favor local React state/hooks for UI control.
- **Performance:**  
  - Minimize rerenders by memoizing heavy computations and controlling component key usage.

---

## 7. Example: Adding a New Section

1. **Create Section File:** `src\sections\<NewSection>.tsx`
2. **Design UI Using UI Lib:** Compose layout with `ui` components and bring in custom when needed.
3. **Implement/Import Handlers:** Place all event handlers inside the section or import from utilities.
4. **Format Data:** Use utility functions for any formatting before display.
5. **Export Section:** Use named export for your main section component.
6. **Update Navigation:** Add new section to `Sidebar.tsx` and app routing in `App.tsx`.

---

## 8. Testing & Quality Assurance

- Ensure new/modified UI components and handlers are test-covered.
- Manual and automated testing of navigation, formatting, and error flows.

---

## 9. Summary of Recommendations

- Prioritize use of shared utilities and components for consistency.
- Maintain code separation and follow established naming/pattern conventions.
- Keep documentation and handler comments up-to-date.
- Regularly check upstream (backend) API and service contracts for changes.


---

**This playbook is a living document: Update as new features, sections, or conventions are introduced to the fiscalzen-app codebase.**
