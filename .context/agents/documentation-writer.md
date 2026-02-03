# Documentation-Writer Agent Playbook

---

## Overview

This playbook provides detailed, actionable guidelines for a Documentation-Writer agent operating within the FiscalZenProject codebase. It covers focus areas, key files, workflows, code patterns, and best documentation practices derived directly from the repository.

---

## 1. Focus Areas for Documentation

### High-Priority Source Layers

- **Controllers:**  
  Location: `fiscalzen-api\src`, `fiscalzen-api\test`  
  Purpose: Handles routing, API request handling, and endpoints.  
  Key Exports:
    - `AppController`
    - `AppModule`

- **Services:**  
  Location: `fiscalzen-api\src`  
  Purpose: Contains business logic, core features, and orchestration.  
  Key Export:
    - `AppService`

- **Utilities:**  
  Location: `fiscalzen-app\src\lib`  
  Purpose: Shared functionality, formatting helpers, and data processing utilities.  
  Key Exports:
    - `cn`, `formatCNPJ`, `formatCPF`, `formatCNPJCPF`, `formatCurrency`, `formatDate`, `formatDateTime`, `formatChaveAcesso`, `truncateText`, `parseXML`

### Additional Documentation Targets

- **Configuration Files:**  
  Discover and document entry points, environment variables, and build configurations as found in root and source directories.

- **Test Files:**  
  Found in `fiscalzen-api\test`, useful for examples and clarifying behavior of controllers/services.

- **Documentation/README Files:**  
  Any file aimed at onboarding or high-level understanding, such as `README.md`, should be regularly updated for consistency.

---

## 2. Workflows and Steps for Common Documentation Tasks

### A. API Endpoint Documentation

1. **Locate all controller files** in `fiscalzen-api\src`.
2. For each controller, extract:
    - Route paths
    - Method (GET, POST, etc.)
    - Input parameters (body, path, query)
    - Return types and typical response bodies/status codes
3. Generate:
    - Endpoint summaries (purpose, usage)
    - Request/response examples
    - Error cases or known constraints

### B. Service & Logic Documentation

1. Identify all service classes (e.g., `AppService`).
2. For each method:
    - Document its goal and use case.
    - List parameters and return type.
    - Describe dependencies or data sources.
    - Include links or references to calling controllers/routes.

### C. Utility Function Documentation

1. Catalog each exported helper in `fiscalzen-app\src\lib\utils.ts`.
2. For each utility:
    - Purpose, parameters, return value
    - Short example usage for common contexts

### D. Codebase Onboarding/Overview

1. Aggregate summaries of each main directory and its role in the product.
2. Maintain a "Key Files" section describing the role of each bootstrap, config, or high-level file.
3. Describe the high-level architecture (controllers-services-utils) and how they interact.

---

## 3. Best Practices from the Codebase

- **JSDoc Style for TypeScript**:  
  Use `/** ... */` comments before each function, class, and export. Provide clear, concise summaries and tag all parameters and return types.

- **API Example-Driven**:  
  Augment endpoint documentation with real input and output samples for typical and edge cases.

- **Linkage Between Layers**:  
  When documenting a controller method, reference the service method it invokes. When documenting a utility, list where it is most frequently used.

- **Testing-Driven Documentation**:  
  Use test cases as a source for realistic usage examples. Reference or cross-link related tests in the docs.

- **Consistency in Terminology**:  
  Use codebase vocabulary (e.g., "CNPJ", "ChaveAcesso") consistently throughout documentation.

- **Sectioned Documentation**:  
  Organize documentation files into:  
    - Overview
    - Usage
    - API/Exports
    - Examples
    - References

---

## 4. Code Patterns and Documentation Conventions

- **Controller Pattern:**  
  ```
  @Controller('route')
  export class SomeController {
    @Get()
    getMethod(): ReturnType { ... }
  }
  ```
  _Document each method with its HTTP verb, route, params, and description of side effects._

- **Service Pattern:**  
  ```
  @Injectable()
  export class SomeService {
    someMethod(param: Type): ReturnType { ... }
  }
  ```
  _Explain each method’s business logic, expected inputs and outputs._

- **Utility Export Pattern:**  
  ```
  export function someUtility(input: string): string { ... }
  ```
  _Document with typical input/output and practical examples._

---

## 5. Key Files and Their Purposes

| File/Directory                         | Purpose                                                                 |
|----------------------------------------|-------------------------------------------------------------------------|
| `fiscalzen-api\src\app.module.ts`      | Application entry point; bootstraps controllers/services                 |
| `fiscalzen-api\src\app.controller.ts`  | Main API routing and request handling                                   |
| `fiscalzen-api\src\app.service.ts`     | Central service for business logic                                      |
| `fiscalzen-app\src\lib\utils.ts`       | Shared framework-independent utilities (formatting, parsing, etc.)      |
| `fiscalzen-api\test\`                  | Automated tests; basis for usage examples and expected behaviors         |

---

## 6. Example Documentation Template

```markdown
## <Function/Class/Endpoint Name>
**Location:** `<path/to/file>`

**Purpose:**  
Concise description of what this does and in what situations it should be used.

**Parameters:**  
| Name | Type  | Description                  |
|------|-------|------------------------------|
| param1 | type | Description of param1        |

**Returns:**  
Type, and explanation of what the return value means.

**Example:**  
```typescript
const result = functionName(sampleInput);
```
**Related:**  
- References to other files, functions, or endpoints.
```

---

## 7. Final Recommendations

- Regularly review and update documentation as code evolves.
- Cross-check exported modules and update the "Key Files" section accordingly.
- Emphasize clarity: target docs for both newcomers and maintainers.
- Favor practical, example-driven communication.
- Follow codebase-specific conventions for format, vocabulary, and file structure.
- Use automated tools where possible to scaffold API documentation (e.g., Swagger, Compodoc).

---

## Appendix: Directory Roles

- `fiscalzen-api`: Core API, including entry point, controllers, services, and integration tests.
- `fiscalzen-app`: Supplementary app code and shared utilities.
- `test/`: Test coverage for critical logic and API contracts.

---

This playbook ensures the documentation-writer agent produces clear, contextual, and valuable documentation aligned with FiscalZenProject’s structure and conventions.
