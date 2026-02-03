# Test Writer Agent Playbook

---
type: agent-playbook
name: Test Writer
description: Comprehensive guide for writing and maintaining unit and integration tests in the FiscalZenProject codebase.
agentType: test-writer
phases: [E, V]
version: "1.0.0"
---

## Overview

This playbook is for the Test Writer Agent responsible for ensuring high-quality, maintainable, and comprehensive tests throughout the FiscalZenProject repo. It outlines the architectural layers relevant to testing: controllers, services, and utility functions. The guide includes actionable workflows, code patterns, best practices, and directories to focus on.

---

## 1. Key Files and Areas of Focus

### 1.1. Test Files
- **Directory:** `fiscalzen-api\test`
  - Contains unit and integration tests for API controllers and services

### 1.2. Controller Layer
- **Files:**
  - `fiscalzen-api\src\app.controller.ts`  
    - Main entrypoint for API request handling (export: `AppController`)
  - `fiscalzen-api\src\app.module.ts`  
    - Module definition (export: `AppModule`)

### 1.3. Service Layer
- **Files:**
  - `fiscalzen-api\src\app.service.ts`  
    - Business logic encapsulated in the `AppService` class

### 1.4. Utility Functions
- **Directory:** `fiscalzen-app\src\lib`
  - **Key utility file:** `utils.ts`  
    - Contains utility functions: `cn`, `formatCNPJ`, `formatCPF`, `formatCNPJCPF`, `formatCurrency`, `formatDate`, `formatDateTime`, `formatChaveAcesso`, `truncateText`, `parseXML` 

---

## 2. Testing Workflows

### 2.1. Unit Tests

**Purpose:** Test logic in isolation (e.g., service methods, utility functions).

**Workflow:**
1. **Identify Target:**
   - Use file naming convention: `<target>.spec.ts`
   - Place in or mirror structure of source directory (usually in `test`).

2. **Setup Test Bed:**
   - For services/utilities, import required modules and dependencies using mocking where necessary.
   - For controller/service tests, use NestJS testing utilities (e.g., `Test.createTestingModule`).

3. **Write Isolated Tests:**
   - Cover standard, edge, and error cases based on the function/method’s signature and JS/TS idioms.

4. **Assertions:**
   - Use clear, explicit assertions for expected outputs.
   - Mock/stub dependencies (db calls, API requests, etc.).

5. **Best Practices:**
   - Keep tests deterministic; avoid reliance on external state.
   - Use descriptive test and suite names.

### 2.2. Integration Tests

**Purpose:** Test interactions among components, modules, or layers.

**Workflow:**
1. **Setup Integration Environment:**
   - Spin up NestJS app using `Test.createTestingModule` with all required providers/controllers.

2. **Realistic Interactions:**
   - Send HTTP requests to controllers (use Supertest or similar for API layer).
   - Validate full request/response life cycle.

3. **Database/External System Handling:**
   - Use test/mock/staging databases for integration tests, reset state as needed.

4. **Clean-up:**
   - Ensure tests clean up any data or state changes.

---

## 3. Test Patterns & Conventions

### 3.1. File Naming Conventions
- Test files: `<name>.spec.ts`
- Place adjacent to source file or in parallel/`test` directory.

### 3.2. Projected Test Structure

#### Example: Service Test (`app.service.spec.ts`)
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases here
});
```

#### Example: Controller Test (`app.controller.spec.ts`)
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return expected result', () => {
    expect(controller.someMethod()).toEqual(expectedValue);
  });
});
```

#### Example: Utility Function Test
```typescript
import { formatCurrency } from '../../src/lib/utils';

describe('formatCurrency', () => {
  it('formats number as BRL currency', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });
});
```

### 3.3. Mocks & Stubs
- Use Jest mocking utilities: `jest.fn()`, `jest.spyOn()`
- For dependencies (e.g., services within controllers), provide mocks to isolate target logic.

### 3.4. Arrange-Act-Assert Pattern
- **Arrange:** Set up conditions and inputs.
- **Act:** Call the method or function under test.
- **Assert:** Check outputs or effects.

---

## 4. Best Practices

- **Coverage:** Ensure core logic, utilities, and possible edge cases are tested.
- **Independence:** Each test should run independently and not rely on outcome/state of others.
- **Descriptive Naming:** Test names should describe the scenario and expected outcome.
- **Maintenance:** Update/remove tests along with code changes to keep suite relevant.
- **Documentation:** If a test covers complex logic, include brief comments for clarity.
- **Test-Driven Development (Optional):** For new features, consider writing tests before implementing functionality.

---

## 5. Key Files and Their Purpose

| File/Dir                                   | Purpose                                      |
|---------------------------------------------|----------------------------------------------|
| `fiscalzen-api/test/`                       | Root directory for unit/integration tests    |
| `fiscalzen-api/src/app.controller.ts`       | API controllers, request handling            |
| `fiscalzen-api/src/app.service.ts`          | Business logic, service class                |
| `fiscalzen-api/src/app.module.ts`           | Application module configuration             |
| `fiscalzen-app/src/lib/utils.ts`            | Shared utility functions                     |

---

## 6. Additional Notes

- **Framework:** The backend uses NestJS—leverage its testing utilities.
- **Test Runner:** By convention, Jest is typical; adapt instructions if a different runner is used.
- **Continuous Integration:** Ensure tests run in CI for PRs and main branch merges.
- **Documentation:** Add meaningful comments for intricate scenarios; maintain a high-level test plan as the codebase grows.

---

## 7. Quick Reference Checklist

- [ ] Create/locate `.spec.ts` for each controller, service, and utility.
- [ ] Mock or stub dependencies in every test.
- [ ] Cover positive, negative, and edge cases.
- [ ] Assert both type and value of results.
- [ ] Use descriptive test names and structure.
- [ ] Clean up state after integration tests.
- [ ] Review and update tests with source changes.

---

**End of Playbook**
