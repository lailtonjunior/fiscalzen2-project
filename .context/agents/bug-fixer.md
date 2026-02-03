# Bug-Fixer Agent Playbook

---

type: agent-playbook  
name: Bug-Fixer Agent Playbook  
description: Comprehensive guide for automated bug-fixing in the FiscalZenProject repository.  
version: 1.0.0  
generated: 2026-02-02  

---

## 🧭 Focus Areas & File Structure

The bug-fixer agent must primarily target the following layers and file locations, based on the codebase structure:

### 1. Controllers
- **Purpose:** Entry points for HTTP/API requests, routing, input validation, error handling.
- **Directories to prioritize:**
  - `fiscalzen-api\src\app.controller.ts`
- **Tests:**
  - `fiscalzen-api\test\` (Controller test specs)

### 2. Services
- **Purpose:** Business logic processing, orchestration, application state management.
- **Directories to prioritize:**
  - `fiscalzen-api\src\app.service.ts`
- **Tests:**
  - `fiscalzen-api\test\` (Service test specs)

### 3. Utils / Shared Helpers
- **Purpose:** String, date, and currency formatting; text manipulation; XML parsing; utility helpers used across components.
- **Directories to prioritize:**
  - `fiscalzen-app\src\lib\utils.ts`
- **Key exports for utilities:** `cn`, `formatCNPJ`, `formatCPF`, `formatCNPJCPF`, `formatCurrency`, `formatDate`, `formatDateTime`, `formatChaveAcesso`, `truncateText`, `parseXML`
- **Related components:**
  - `fiscalzen-app\src\components\ui\field.tsx` (notably `FieldError`)

---

## 🛠️ Workflows & Common Tasks

### 1. Reading and Analyzing Bug Reports
- Pull error messages, stack traces, or automated test failures from code comments, logs, or test reports.
- Locate relevant source line using stack trace references (file path and line number).
- If a bug report points to a symbol (e.g., `AppService`, `formatCNPJ`), trace its definition and usages.

### 2. Root Cause Analysis
- If a bug is in a controller, check data validation, request/response formatting, and error handling in `app.controller.ts`.
- For business/context errors, inspect orchestration logic in `app.service.ts`.
- For display, formatting, or transformation errors, locate the relevant function in `utils.ts` or associated UI component (e.g., `field.tsx`).
- Look for recent changes, TODOs, or commented code blocks near the issue.

### 3. Reproducing and Isolating the Bug
- Identify/test the corresponding unit or integration test in `fiscalzen-api\test\`.
- If no test exists, create minimal test coverage replicating the failure/scenario.
- For UI/utility bugs, make a minimal reproduction in the component using the affected util.

### 4. Implementing the Fix
- Adhere to function/class layouts and naming observed in the codebase.
- Update or replace the defective logic.
- If fixing a utility, ensure all its consumers are validated for expected behavior.
- Write spec tests for the bug scenario and common edge cases.

### 5. Validation and Verification
- Run all tests in `fiscalzen-api\test\` after the fix.
- If UI/utility-facing, confirm formatters and component output (e.g., `FieldError` rendering) are correct.

### 6. Documentation & Communication
- If the fix involves conventions or required changes to how functions are consumed, update inline comments and (if present) docstrings.
- Reference the fix in the relevant bug report/comment.

---

## 💡 Best Practices & Patterns

1. **Controller Actions:** Use DTO (Data Transfer Objects) for method parameters; always wrap responses in error handling logic.
2. **Service Layer:** Encapsulate business logic in well-named methods; do not let controller logic leak into services.
3. **Utilities:** Single-responsibility per utility function; always include parameter type checks and fallback/edge case handling.
4. **Reusable Components (FieldError):** Extend and reuse existing error-handling components; maintain enum/type safety.
5. **Testing:** Place tests in the corresponding `test` folders; have at least one "happy path" and one "error path" test per bug scenario.
6. **Naming & Organization:** Follow existing filet structure and symbol naming conventions; keep functions small and modular.

---

## 📌 Key Files and Their Purposes

| File / Directory                                     | Purpose / Comments                                                                                     |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `fiscalzen-api\src\app.controller.ts`                | Main entry point for API requests; action methods; request validation and error catching               |
| `fiscalzen-api\src\app.service.ts`                   | Encapsulates business logic; main service for controller actions                                       |
| `fiscalzen-app\src\lib\utils.ts`                     | Collection of formatting, parsing, and utility functions used across the app                           |
| `fiscalzen-app\src\components\ui\field.tsx`          | UI component for form fields; contains `FieldError` for error display                                 |
| `fiscalzen-api\test\`                                | Automated tests for API controllers and services (strongly recommended to update/add tests for bugs)   |


---

## 🔄 Sample Bug-Fix Workflow

1. **Identify Bug Location:**  
   Use stack trace or bug report (e.g., controller, service, or utility function).

2. **Read and Understand Code:**  
   Open the implicated file, reference symbols and functions.

3. **Find and Update Test(s):**  
   Locate or add relevant test in `fiscalzen-api\test\` or, for utils, where the util is consumed/tested.

4. **Reproduce Issue:**  
   Run the failing test or simulate error scenario.

5. **Fix Code:**  
   Apply changes, following observed code conventions.

6. **Test Thoroughly:**  
   Run regression and edge case tests. Ensure the bug is fixed and nothing else is broken.

7. **Document:**  
   Comment in code and bug tracker, referencing cause and resolution.

---

## 📋 Code Conventions to Follow

- **TypeScript/TSX:**
  - Use explicit typing for function parameters and return types.
  - Prefer immutability; avoid direct object mutation where possible.
  - Use named exports for utilities and components.
- **Error Handling:**
  - Controllers: Use try/catch and proper HTTP status codes.
  - Services/Utils: Throw or return errors explicitly for unexpected conditions.
- **Formatting Functions:**
  - Validate all input.
  - Return consistent output type/format.
- **Testing:**
  - Test files should be colocated in `test` directories or alongside source when applicable.
  - Use descriptive test names aligned with bug context.

---

## 🛑 What Not To Do

- Do not modify code in unrelated modules or layers.
- Do not bypass existing validation, error handling, or formatting conventions.
- Do not add unused parameters or options.
- Do not leave catch blocks empty—always log or handle errors.
- Do not mix controller/service logic—respect separation of concerns.

---

## 🗝️ Example Touchpoints

**Fix in Controller:**  
`fiscalzen-api\src\app.controller.ts`  
➡️ Fix route handler; validate inputs using DTO; update associated test in `fiscalzen-api\test\`.

**Fix in Service Layer:**  
`fiscalzen-api\src\app.service.ts`  
➡️ Isolate business logic; add scenario test.

**Fix in Utility:**  
`fiscalzen-app\src\lib\utils.ts`  
➡️ Patch formatting bug; add/expand test.

**UI Field Error:**  
`fiscalzen-app\src\components\ui\field.tsx`  
➡️ Update `FieldError` logic; test rendering of error states.

---

## 🏁 Summary

The bug-fixer agent should **focus on the Controllers, Services, and Utils layers**, leveraging careful analysis, existing test infrastructure, and best-practice code conventions. By methodically tracing and resolving defects within these boundaries, the agent will enhance stability, reliability, and maintainability of the FiscalZenProject codebase.
