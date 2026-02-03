# DevOps Specialist Agent Playbook

---

## Overview

This playbook guides the **DevOps Specialist Agent** to design, implement, and maintain DevOps workflows—including CI/CD, environment automation, and operational best practices—for the FiscalZenProject codebase.

---

## 1. Scope and Focus Areas

### A. Deployment Pipeline & Automation
- **Primary Directory**: `fiscalzen-api`, `fiscalzen-app`
- **Key Tasks**: Building, testing, and deploying both the backend (`fiscalzen-api`) and frontend (`fiscalzen-app`).
- **Config Files**: Look for root-level CI/CD config files (e.g., `.github/workflows/*`, `.gitlab-ci.yml`, `docker-compose.yml`).

### B. Environment & Configuration Management
- **Primary Directories**: All `.env*` files in the root and application subdirectories.
- **Key Tasks**: Managing environment variables, secrets handling, and configuration templating for local, staging, and production.

### C. Monitoring & Observability
- **Primary Focus**: Instrument integration points for logging, health checks, and alerts.
- **Key Files**: Look for custom utility files in `fiscalzen-app/src/lib/utils.ts` or relevant middleware in `fiscalzen-api/src/`.

### D. Infrastructure as Code & Containerization
- **Primary Focus**: Docker, Compose, IaC files (if present).
- **Key Files**: `Dockerfile`, `docker-compose.yml`, `infrastructure/*` (if exists).

---

## 2. Common Workflows & Tasks

### Workflow 1: Setting Up CI/CD Pipelines

**Steps:**
1. Identify all services requiring CI/CD (typically `fiscalzen-api` and `fiscalzen-app`).
2. Locate or create pipeline configuration files:
   - GitHub Actions: `.github/workflows/*`
   - GitLab CI: `.gitlab-ci.yml`
   - Others: `.circleci/config.yml`, etc.
3. Define standard stages: *Install*, *Lint*, *Build*, *Test*, *Deploy*.
4. Use `npm ci` or `pnpm install` as per codebase preference for dependency management.
5. Set up caching for `node_modules`/`pnpm-store` to speed up builds.
6. Configure build artifacts for both frontend and backend.
7. Deploy artifacts to the appropriate environment; use environment variables for secrets.

### Workflow 2: Managing Environment Variables

**Steps:**
1. Keep sensitive values in `.env` files, never commit secrets.
2. Document all required variables in `.env.example` or documentation.
3. Use process managers (e.g., PM2, systemd), container orchestrators, or cloud platforms to inject variables at runtime.
4. Validate existence of `.env` with preflight scripts or CI steps.

### Workflow 3: Dockerizing Applications

**Steps:**
1. Place `Dockerfile` in the root of each service:
   - Use Node.js Alpine images for small size.
   - Implement multi-stage builds: install dependencies → build app → copy to runtime-only image if needed.
2. Use `.dockerignore` to exclude `node_modules` and sensitive files.
3. Create `docker-compose.yml` (if services depend on each other, e.g., database + app).
4. Document build & run commands in README.
5. Run `docker-compose up --build` locally and validate all healthchecks/pass.

### Workflow 4: Infrastructure Automation

**Steps:**
1. Prefer IaC files (`infrastructure/`, `terraform/`, `cloudformation/`) for provisioning environments.
2. Store templates and state files securely.
3. Version-control infrastructure code alongside the app code.

### Workflow 5: Testing and Quality Control

**Steps:**
1. Ensure all changes pass lint, type checks, and tests before merging.
2. Use badge reporting for build status in the README.
3. Run frontend tests in headless mode; backend tests in isolated containers/services.

---

## 3. Best Practices (Based on Codebase)

- **Environment Separation**: Keep dev, staging, and prod deployment configs separate. Avoid secrets in source code.
- **Reusable Utilities**: Use shared utilities in `fiscalzen-app/src/lib/utils.ts` for scripts (date/currency formatters, XML parsing).
- **Type-Safety**: Leverage common types/interfaces from `fiscalzen-app/src/types/index.ts` in all scripting or automation.
- **Logging**: Instrument logging at deploy/build/test steps for fast troubleshooting.
- **Atomic Commits**: Link code pushes to atomic pipeline runs for easy rollback.
- **Documentation**: Inline document each pipeline stage—use comments in YAML or Markdown in repo root.
- **Security**: Regularly scan dependencies for vulnerabilities (via `npm audit`, `pnpm audit`, or CI plugins).

---

## 4. Key Files & Their Purposes

| File/Folder                                      | Purpose                                                                         |
|--------------------------------------------------|----------------------------------------------------------------------------------|
| `fiscalzen-api/src/app.controller.ts`            | Node.js API entrypoint, route handling                                           |
| `fiscalzen-api/src/app.service.ts`               | API service/business logic layer                                                 |
| `fiscalzen-app/src/lib/utils.ts`                 | Shared utility functions for formatting and parsing                              |
| `fiscalzen-app/src/types/index.ts`               | Collection of shared TypeScript types for robust automation & scripting          |
| `.env`, `.env.example`, etc.                     | Environment variable templates (never commit secrets)                            |
| `Dockerfile`, `.dockerignore`                    | Docker container specifications & ignore patterns                                |
| `docker-compose.yml` (if present)                | Multi-container orchestration definition                                         |
| CI Config files (e.g., `.github/workflows/*`)    | Build/test/deploy pipelines                                                      |
| `README.md`, `/docs/`                            | Documentation for setup, configuration, and operation                            |

---

## 5. Patterns & Conventions

- **Service/Controller Separation**: Logic in dedicated service files, API endpoints in controller files.
- **UI/Components**: Frontend in `fiscalzen-app/src/components/ui/`, reusable, isolated UI files.
- **Type-Driven**: All shared types consolidated in a central index, referenced across automation/process scripts.
- **Utility-First**: Prefer using utility exports from `utils.ts` for any formatting/parsing scripts.
- **Directory Structure**: Respect separation of backend (`fiscalzen-api`) and frontend (`fiscalzen-app`).

---

## 6. Additional Recommendations

- **Automate Backup/Restore** for critical environments.
- **Add Monitoring Hooks** as needed in runtime containers for health and log visibility.
- **Update `.env.example`** with every new environment variable.
- **Keep Infra as Code Current**—document changes and update README accordingly.
- **Regularly Review Pipeline Logs** for recurring warnings/errors.

---

## Appendix: Quick References

- **NPM/PNPM Cache for CI:**  
  `actions/cache@v3` (GitHub Actions)  
  `cache: paths` (GitLab CI)

- **YAML Commenting Example:**  
  ```yaml
  # Install dependencies
  - run: npm ci
  ```

- **Healthcheck Snippet (Docker Compose):**  
  ```yaml
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
  ```

---

**Keep the pipelines robust, secure, and easy to maintain. Use this playbook as a living document, and update as new patterns emerge in the repository.**
