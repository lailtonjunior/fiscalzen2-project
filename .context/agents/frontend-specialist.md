# Frontend Specialist Agent Playbook

---

## Overview

This playbook guides a **frontend-specialist agent** working on the FiscalZenProject. It defines important file areas, workflows for common tasks, reusable code patterns, best practices, and key utilities/components, helping maintain high-quality, scalable, and consistent UI development.

---

## 1. Focus Areas & Relevant Files

The agent should prioritize the following areas in the `fiscalzen-app` directory:

### 1.1. Components

- **Custom UI:**  
  - `src\components\custom\Sidebar.tsx` → Main navigation sidebar (NavItem, Sidebar)
  - `src\components\custom\Header.tsx` → Page/application header (Header, HeaderProps)
- **Reusable UI Library:**  
  - All files in `src\components\ui\` (Tooltip, Toggle, Tabs, Table, Spinner, Skeleton, etc.) – Implement and update shared components for consistent UI.

### 1.2. Sections/Views

- **Business Views:**  
  - `src\sections\Relatorios.tsx` (Reports view, SummaryCard, handleExport* functions)
  - `src\sections\Manifestacao.tsx` (Manifestation view, StatCard, actions)
  - `src\sections\Dashboard.tsx` (Dashboard view, StatCards)
  - `src\sections\NotasFiscais.tsx` (Invoices view, selection/download/manifestation logic)

### 1.3. Utilities

- `src\lib\utils.ts`: 
  - Shared formatting and helper functions, e.g., `formatCNPJ`, `formatCPF`, `formatCurrency`, `formatDate`, `truncateText`, XML parsing.

### 1.4. Entry Point

- `src\App.tsx`: 
  - Main React application entry and routing logic.

---

## 2. Recommended Workflows

### 2.1. Building/Reusing Components

- **Location:**  
  - Place new **common components** in `src\components\ui\`.
  - Place **business-specific or scoped components** in `src\components\custom\` or the relevant `section`.

- **Naming:**  
  - Use **PascalCase** for React component files and exports.
  - Main file should have `export` of component by the same name.

- **Composability:**  
  - Prefer composition over inheritance; rely on component props and React children structure (see `TooltipProvider` and `TooltipContent`).
  - Extract repeated visual blocks into dedicated presentational components.

### 2.2. Adding or Modifying Views/Pages

- **Sections:**  
  - Place or update screens in `src\sections\`.
  - Follow the convention of exporting the named page/component (`export const Relatorios = ...`).
- **Data/Service Integration:**  
  - Interact with backend APIs via service layer or hooks (if available).
- **Action Handlers:**  
  - Define specific handlers (e.g., `handleExportExcel`, `handleManifestacao`) for each distinct UI action.

### 2.3. Utility Usage

- **Formatting:**  
  - Use functions from `src\lib\utils.ts` for all CNPJ/CPF, currency, date, XML, and text manipulations.
- **Avoid Redundancy:**  
  - Never duplicate utility logic inside components; refactor repeated patterns into utils file.

### 2.4. State & Props Patterns

- Prefer passing props and callbacks explicitly.
- Define `Props` types/interfaces for each component (`SummaryCardProps`, `StatCardProps`, etc.).
- For sections, group stateful logic at top-level and pass handlers/components downward.

### 2.5. Common UI Patterns

- **Cards for Summary Stats:**  
  - Use `SummaryCard` or `StatCard` for dashboards and summaries.
- **Tables for Lists:**  
  - Use `src\components\ui\table.tsx` for data representation.
- **User Feedback:**  
  - Use `Spinner`, `Skeleton`, or `Sonner` for loading and notification feedback patterns.

---

## 3. Code Patterns & Conventions

- **Component Export:**  
  ```tsx
  export const MyComponent = () => {...}
  ```
- **Props Definition:**
  ```tsx
  interface MyComponentProps { ... }
  export const MyComponent: React.FC<MyComponentProps> = (props) => { ... }
  ```
- **Handlers:**  
  - Define as arrow functions (`const handleDoSomething = () => {...}`), and group related logic together.
- **File Naming:**  
  - `MyComponent.tsx` for React components, `utils.ts` for helpers.
- **TypeScript Usage:**  
  - Prefer explicit typing for props, state, utility functions.
- **Separation:**  
  - UI logic and presentation in components; business logic in sections or hooks.

---

## 4. Best Practices

- **Reuse:**  
  - Leverage UI library components (`ui/`) before creating new ones to keep UI consistent.
- **Single Source of Truth:**  
  - Use utilities for repeated business/data formatting.
- **Explicit Imports:**  
  - Import only what is needed from utility modules.
- **Accessibility:**  
  - When creating custom UI, ensure proper aria attributes and keyboard navigation support (e.g., in tooltips, toggles, tables).
- **Scoped Styles:**  
  - Co-locate CSS Modules or style files with their components and avoid global namespace pollution.

---

## 5. Key Files: Purposes & Exports

| File                                             | Purpose                                                                 | Key Exports/Symbols   |
|--------------------------------------------------|-------------------------------------------------------------------------|-----------------------|
| `src\App.tsx`                                   | App entry point, routing                                                | App                   |
| `src\components\custom\Sidebar.tsx`             | Main sidebar navigation                                                 | NavItem, Sidebar      |
| `src\components\custom\Header.tsx`              | Application header                                                      | Header, HeaderProps   |
| `src\components\ui\tooltip.tsx`                 | Tooltip provider & components                                           | Tooltip*, etc.        |
| `src\components\ui\table.tsx`                   | Table component                                                         | Table, etc.           |
| `src\sections\Dashboard.tsx`                    | Dashboard screen                                                        | Dashboard, StatCard   |
| `src\sections\Relatorios.tsx`                   | Reports/summary screen                                                  | Relatorios, handlers  |
| `src\sections\Manifestacao.tsx`                 | Manifestation actions                                                   | Manifestacao, StatCard, handlers |
| `src\sections\NotasFiscais.tsx`                 | Invoices/NF-e management                                                | NotasFiscais, handlers|
| `src\lib\utils.ts`                              | Data formatting, parsing utilities                                      | cn, format*, parseXML |

---

## 6. Testing & Validation (If Available)

- Check for existing test files under a `__tests__` or similar directory.
- Use component tests for UI elements and integration tests for sections/pages.
- Follow the same structure as the main code for test files.

---

## 7. Documentation & Onboarding

- Include/update JSDoc comments for all exported utilities and complex components.
- Whenever a new component or section is created, update the onboarding documentation to cover its usage and extensibility.

---

## 8. Implementation Checklist

- [ ] UI task starts with checking `ui/` and `custom/` components for reuse.
- [ ] Format all CNPJ/CPF, currency, date, and other sensitive data via shared utils.
- [ ] Use stateless components unless owning page state is required.
- [ ] All components, props, and handlers are documented and typed.
- [ ] Pull requests reference the section/component(s) affected and follow project conventions.

---

## 9. Quick Reference: Common Utilities

- `cn` – className (classnames) helper combining classes
- `formatCNPJ`, `formatCPF`, `formatCNPJCPF` – CPF/CNPJ masking/formatting
- `formatCurrency` – Monetary formatting (BRL, etc.)
- `formatDate`, `formatDateTime` – Converts dates to readable text
- `truncateText` – Ellipsis truncation
- `parseXML` – Transforms XML to usable JS object

---

## 10. Example Component Pattern

```tsx
// src/components/ui/MyComponent.tsx
import React from 'react';

export interface MyComponentProps {
  label: string;
  onChange: (val: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ label, onChange }) => (
  <div>
    <label>{label}</label>
    <input onChange={e => onChange(e.target.value)} />
  </div>
);
```

---

## 11. Summary

- Focus on `components/ui`, `components/custom`, `sections`, and `lib/utils.ts` for all frontend work.
- Follow established conventions for file location, naming, and typing.
- Strive for maximum reusability and consistency.
- Ensure enhanced user experience and accessibility.
- Document and test as you go.

---
**End of Playbook**
