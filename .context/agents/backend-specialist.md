# Backend Specialist Agent Playbook

---

type: playbook  
role: backend-specialist  
title: Backend Specialist Agent Playbook  
description: Step-by-step guide for efficient backend development in FiscalZenProject, including file focus, workflows, best practices, key patterns, and file purposes.  
version: 1.0.0  
created: 2026-02-02  

---

## Scope & Codebase Structure

### Primary Focus Areas

- **Controller Layer**: Request handling and input validation  
  (`fiscalzen-api\src\app.controller.ts`)
- **Service Layer**: Business logic encapsulation  
  (`fiscalzen-api\src\app.service.ts`)
- **Dependency Injection & App Structure**: Module definition and wiring  
  (`fiscalzen-api\src\app.module.ts`)
- **Application Bootstrap**: Server initialization  
  (`fiscalzen-api\src\main.ts`)
- **Types & Shared Entities**: Definitions and interfaces  
  (`fiscalzen-app\src\types\index.ts`)
- **Testing**: Test workflow and stubs  
  (`fiscalzen-api\test`)

---

## Key Files & Their Purposes

| File/Directory                                     | Purpose                                                        |
|----------------------------------------------------|----------------------------------------------------------------|
| `fiscalzen-api\src\app.controller.ts`              | Defines HTTP endpoints, wire-up between HTTP and Service layer  |
| `fiscalzen-api\src\app.service.ts`                 | Contains business logic, reusable backend methods               |
| `fiscalzen-api\src\app.module.ts`                  | NestJS module definition, DI container for controller/service   |
| `fiscalzen-app\src\types\index.ts`                 | Shared/enforced backend types and interfaces                    |
| `fiscalzen-api\src\main.ts`                        | Application entry point/bootstrapping                          |
| `fiscalzen-api\test`                               | Test suites for API and services                                |

---

## Common Backend Workflows

### 1. Creating a New Endpoint

1. **Define Route in Controller**
   - Edit `app.controller.ts` using NestJS decorators (`@Get()`, `@Post()`, etc).
   - Validate and parse input using DTOs/types.
2. **Business Logic in Service**
   - Create/reuse method in `app.service.ts`.
   - Keep controller "thin," move logic here.
3. **Register Dependencies**
   - Ensure new service/classes are included in `app.module.ts`.
4. **Wire Up Types**
   - Define request/response types in `types/index.ts` and use consistently.
5. **Testing**
   - Write/modify tests in `test` directory corresponding to controllers/services.

### 2. Modifying/Extending Business Logic

- Change only `app.service.ts` (unless new endpoints are required).
- Refactor reusable logic into distinct service functions.
- **Update types** as needed to reflect any interface/contract changes.
- **Write/Update tests** for new logic blocks.

### 3. Dependency Injection

- Use NestJS `@Injectable()` for services and DI in controllers.
- Register providers in `app.module.ts`.

### 4. Bootstrapping/Environment Setup

- Manage app startup logic in `main.ts`.
- Handle global middleware, error handlers, and validation pipes here.

---

## Best Practices & Code Patterns

### Controllers

- Keep controllers minimal: do **not** embed business logic.
- Use class-based NestJS controllers with decorator routing (`@Controller()`, `@Get()`, etc).
- Always apply HTTP status codes explicitly via NestJS tools when returning custom responses.

### Services

- Extract business logic into service methods (single responsibility).
- Mark all injectable classes with `@Injectable()`.
- Reuse utility methods rather than duplicating logic across service methods.

### Typing & Data Contracts

- Define request/response/data interface structures in `src/types/index.ts`.
- Reference shared types everywhere (don’t retype in controllers/services).
- Use TypeScript’s access modifiers (public/private) to encapsulate service details.

### Testing

- Structure test files to mirror source tree.
- Use NestJS testing tools: `@nestjs/testing` module for dependency setup.
- Always mock external dependencies when testing services/controllers.

### Configuration

- Register new services/controllers in `app.module.ts` for DI and app wiring.
- Group related dependencies under single providers array.

---

## Coding Conventions

- **Filanames:** Use lowercase with dashes for files (`user.service.ts`).
- **Classes:** PascalCase for all class names (`AppService`).
- **Methods:** camelCase for function and method names.

---

## Example Code Patterns

**Controller Sample:**
```typescript
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  async findAll(): Promise<ExampleDto[]> {
    return this.exampleService.getAll();
  }
}
```

**Service Sample:**
```typescript
@Injectable()
export class ExampleService {
  async getAll(): Promise<ExampleDto[]> {
    // business logic
  }
}
```

**Type Sample (`src/types/index.ts`):**
```typescript
export interface ExampleDto {
  id: number;
  name: string;
}
```

**Module Registration:**
```typescript
@Module({
  controllers: [AppController, ExampleController],
  providers: [AppService, ExampleService],
})
export class AppModule {}
```

---

## Conventions for Test Writing

- Place all test files under `fiscalzen-api/test`.
- Mirror source naming and hierarchy (`app.controller.spec.ts`, etc).
- Use Jest with NestJS testing patterns:

```typescript
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return data', () => {
    expect(appController.getData()).toBeDefined();
  });
});
```

---

## Summary: Agent Focus Checklist

- Implement only necessary logic in controllers; delegate to services.
- All business logic must be unit tested and isolated from request context.
- Update types/interfaces centrally in `src/types/index.ts` as contracts change.
- Register new modules/services/controllers immediately in `app.module.ts`.
- Maintain a clear separation of concerns by following the codebase’s layering and conventions.

---

For all changes:  
- Adhere to discovered conventions and code patterns.
- Maintain test coverage for all new features or bugfixes.
- Keep the codebase idiomatic to NestJS and TypeScript standards used in FiscalZenProject.
