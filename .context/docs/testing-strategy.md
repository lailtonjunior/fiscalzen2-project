# Testing Strategy

Quality across the FiscalZen codebase is maintained through a multi-layered approach, combining automated tests, static analysis, and enforced code standards. This strategy ensures defects are caught early, critical business logic is robustly verified, and user-facing workflows are reliable across both backend and frontend systems.

## Testing Strategy

Our testing approach includes:

- **Early Defect Detection**: 
  - Static analysis with TypeScript and ESLint catches errors before code runs.
  - Automated test suites validate critical logic and workflows before deployment.

- **Backend Focus**: 
  - The backend API (NestJS, TypeScript) is prioritized with high coverage on services, controllers, and integrations, particularly business rules and database interactions.

- **Frontend Reliability**: 
  - UI components and state management are covered by focused tests to guarantee main user paths work as intended.
 
- **Continuous Integration**:
  - All tests, lints, and builds run in CI pipelines, ensuring merge requests do not introduce regressions.

## Test Types

- **Unit Tests**
  - **Framework**: Jest
  - **Location**: Backend files (e.g., `*.spec.ts`), co-located with services, controllers, and utility logic.
  - **Scope**: Pure functions, services, and component logic in isolation.
  - **Mocking**: Jest mocks simulate database calls, HTTP requests, and external APIs.

- **Integration (E2E) Tests**
  - **Framework**: Jest with `supertest`
  - **Location**: `fiscalzen-api/test` directory
  - **Scope**: API endpoints and their full stack (HTTP server, database, main flows).
  - **Naming Convention**: `*.e2e-spec.ts`
  - **Tools**: Test environment uses a dedicated test database (Postgres; see troubleshooting).

- **Frontend Tests**
  - **Framework**: Vitest and React Testing Library
  - **Location**: Typically within `fiscalzen-app/src`, alongside components as `*.test.tsx`
  - **Scope**: Component rendering, interaction, and UI state changes.
  - **Mocking**: Mock service functions as needed for isolated UI logic.

## Running Tests

- **Backend Unit Tests**
  ```bash
  cd fiscalzen-api
  npm run test
  ```
- **Backend E2E (Integration) Tests**
  ```bash
  cd fiscalzen-api
  npm run test:e2e
  ```
- **Backend Watch Mode**
  ```bash
  cd fiscalzen-api
  npm run test:watch
  ```
- **Backend Test Coverage**
  ```bash
  cd fiscalzen-api
  npm run test:cov
  ```

- **Frontend Unit/Component Tests** *(if configured in fiscalzen-app)*
  ```bash
  cd fiscalzen-app
  npm run test
  ```

*See [development-workflow.md](./development-workflow.md) for full CI/CD pipeline integration and developer workflows.*

## Quality Gates

Every pull request must satisfy these requirements before merging:

1. **Lint**: Code must pass linting (`npm run lint`) with no ESLint errors or warnings.
2. **Build**: The project must build successfully (`npm run build`), with no TypeScript errors.
3. **Tests**: All automated tests (unit, integration, and E2E) must pass in CI and locally.
4. **Coverage**: 
   - Target coverage is >70% for new or changed business logic.
   - Critical files should not reduce overall project coverage.
5. **Formatting** *(if configured)*: Ensure consistent formatting (e.g., Prettier).

## Troubleshooting

- **Database for Integration Tests**:
  - Integration/E2E tests in `fiscalzen-api` require a running Postgres database instance.
  - Start with: 
    ```bash
    docker-compose up postgres
    ```
    Or use your preferred method to launch a test DB locally.

- **Test Timeouts & External Dependencies**:
  - Some E2E suites (particularly SEFAZ/SOAP integrations) may timeout or fail if not properly mocked.
  - Always mock external SOAP or HTTP services during local test runs to isolate failures and improve speed.

- **Long-Running Tests**:
  - Avoid unmocked network/database calls which can slow down test suites.
  - Split large integration test files or use Jest’s timeout control (`jest.setTimeout`) if needed.

- **Flaky Tests**:
  - Track and prioritize fixing tests that intermittently fail, as these reduce trust in automated gates.

For further guidance on the complete development and QA workflow, see [development-workflow.md](./development-workflow.md).

---

This document is intended for developers contributing to the FiscalZen platform. For questions or improvements to our testing approach, please reach out via the project’s main communication channels or submit a proposal via pull request.
