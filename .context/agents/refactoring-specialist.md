# Refactoring Specialist Agent Playbook

---
type: playbook
name: Refactoring Specialist Agent Playbook
description: Comprehensive guide for a refactoring-specialist agent to identify and refactor code smells, improve maintainability, and ensure consistency across the FiscalZen project.
version: "1.0.0"
generated: 2026-02-02
status: active
agentType: refactoring-specialist
---

## 1. Area of Focus

### Primary Layers

- **Services Layer:** Core business logic and orchestration, primarily in `fiscalzen-api\src`.
- **Utils Layer:** Shared utility helpers, formatting, and miscellaneous utilities, primarily in `fiscalzen-app\src\lib`.

### Key Focus Directories and Files

- **`fiscalzen-api\src\app.service.ts`:** Home to the main business logic in the form of the `AppService` class.
- **`fiscalzen-app\src\lib\utils.ts`:** Centralized utility functions—potential for repeated logic, bloat, or grouping opportunities.

### Key Symbols and Exports

- Classes, functions, and constants with high usage or business value, e.g.:
  - `AppService`
  - Utility functions like `formatCNPJ`, `formatCPF`, `debounce`, `groupBy`, `parseXML`, etc.

---

## 2. Workflows & Step-by-Step Refactoring Processes

### A. Code Smell and Improvement Opportunity Identification

**Steps:**
1. **Spot Common Smells:** Search for duplicate code, large methods, deeply nested conditionals, and long parameter lists.
2. **Review Utilities:** Look for functionally overlapping utils, complex utility functions, lack of type consistency, and missed opportunities for code reuse.
3. **Service Layer Audit:** Identify monolithic service methods, business logic mixed with data access, and improper exception handling.

### B. Performing Safe Refactors

**Steps:**
1. **Locate & Isolate Change:** Use the symbol map to find precise locations (`utils.ts`, `app.service.ts`) and ensure only one responsibility is addressed at a time.
2. **Extract Functions/Classes:** For large or repeated blocks, extract well-named helper functions or classes in logical locations.
3. **Parameter Simplification:** Simplify function/method parameters using clearly defined types or interfaces.
4. **Consistent Naming:** Ensure all function and variable names follow existing conventions (camelCase for variables/functions, PascalCase for types/classes).
5. **Optimize Imports:** Remove unused or duplicate imports.
6. **Update all references:** Refactor across all dependent files, ensuring a search-and-replace update for moved/renamed entities.

### C. Validation (Testing & Safety Nets)

**Steps:**
1. **Run Existing Tests:** Identify and execute tests, especially after modifying utilities with broad impact.
2. **Add/Update Unit Tests:** For critical or newly refactored code, provide/adjust corresponding tests.
3. **Manual QA:** For service layer changes, run relevant functional flows in the application for validation.

---

## 3. Best Practices & Conventions from the Codebase

### Utilities (`fiscalzen-app\src\lib\utils.ts`)

- **Single Responsibility:** Utilities should do one thing well; split if a function handles multiple tasks or is over 15-20 lines.
- **Statelessness:** Utility functions should avoid internal state and side effects.
- **Type Annotations:** Use explicit TypeScript types for input/output in all utilities for clarity and reliability.
- **Export Consistency:** Ensure all utility functions are exported in the same style (e.g., named exports).

### Service Layer (`fiscalzen-api\src\app.service.ts`)

- **Clean Class Design:** `AppService` should be kept focused—decompose where possible into smaller service classes or methods.
- **Dependency Injection:** All service dependencies should be injected where possible (NestJS convention).
- **No Logic in Controllers:** Keep business logic in services, not in controller actions.
- **Explicit Error Handling:** Use consistent, explicit error management for service methods.

### General

- **Naming Conventions:** 
  - camelCase for functions/variables
  - PascalCase for classes/types
- **File Structure:** 
  - Group related utility functions in logically named modules/files.
  - Avoid bloated files—split when a file grows beyond 200-300 lines or contains unrelated logic.
- **Documentation:** 
  - Add clear JSDoc comments to all exported functions/classes, especially where side effects or edge cases are involved.

---

## 4. Code Patterns and Conventions

### Utility Function Example Pattern

```typescript
/**
 * Formats a Brazilian CNPJ number for display.
 * @param cnpj - The CNPJ string
 * @returns Formatted CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  // Implementation here
}
```

### Service Method Extraction Example

```typescript
class AppService {
  // Instead of a very long method...
  processFiscalData(data: FiscalData): Result {
    const validated = this.validateData(data);
    const formatted = this.formatData(validated);
    // Delegates complexity
    return this.saveData(formatted);
  }
}
```

---

## 5. Key Files & Their Purposes

| File/Directory                                 | Purpose                                                       |
|------------------------------------------------|---------------------------------------------------------------|
| `fiscalzen-api\src\app.service.ts`             | Core business logic, service orchestration                    |
| `fiscalzen-app\src\lib\utils.ts`               | Central store for shared utility and formatting functions     |
| `fiscalzen-api\src\`                           | All backend service layer files—look here for refactoring ops |
| `fiscalzen-app\src\lib\`                       | All application-level utilities                               |

---

## 6. Refactoring Checklist

- [ ] Isolate code smells (duplication, long functions, etc.)
- [ ] Apply single responsibility principle
- [ ] Decompose large service methods
- [ ] Type all function parameters and return types
- [ ] Remove dead or unused code/exports
- [ ] Verify impact with automated and manual tests
- [ ] Update documentation if API or behavior changes

---

## 7. References & Further Reading

- [Refactoring (Martin Fowler)](https://refactoring.com/)
- [NestJS Service Best Practices](https://docs.nestjs.com/providers)
- [Clean Code: A Handbook of Agile Software Craftsmanship (Robert C. Martin)](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

---

**This playbook is designed to support the efficient, safe, and consistent refactoring of core service and utility logic throughout FiscalZen.**
