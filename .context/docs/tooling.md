# Tooling & Productivity Guide

This guide consolidates the essential tools, scripts, and best practices that empower developers to maximize productivity in the FiscalZen project. Establishing a consistent environment and utilizing recommended tooling will help contributors onboard quickly, catch issues early, and streamline daily workflows.

> For a detailed overview of our overall development process, see [development-workflow.md](./development-workflow.md).

---

## Required Tooling

Below is a list of critical tools with installation instructions and notes on their role in the project:

1. **Node.js (v20+)**
   - _Purpose:_ Runs all build, test, and dev scripts; powers backend API.
   - _Install:_ Download from [nodejs.org](https://nodejs.org/)

2. **npm**
   - _Purpose:_ Primary package manager for both app and API.
   - _Install:_ Ships with Node.js.

3. **Docker**
   - _Purpose:_ Containerizes PostgreSQL, Redis, and other local services.
   - _Install:_ [Docker Desktop](https://www.docker.com/products/docker-desktop/)

4. **VS Code (Recommended)**
   - _Purpose:_ Consistent editor experience.
   - _Install:_ [VS Code](https://code.visualstudio.com/)

5. **ESLint**
   - _Purpose:_ Enforces code quality, detects bugs and anti-patterns.
   - _Install:_  
     ```bash
     npm install -g eslint
     # or project-local: npm install --save-dev eslint
     ```

6. **Prettier**
   - _Purpose:_ Ensures consistent code formatting across the team.
   - _Install:_  
     ```bash
     npm install -g prettier
     # or project-local: npm install --save-dev prettier
     ```

7. **PostgreSQL (via Docker)**
   - _Purpose:_ Primary database for development and testing.
   - _Usage:_ Auto-provisioned with `docker-compose`.

8. **Redis (via Docker)**
   - _Purpose:_ In-memory cache and queue.
   - _Usage:_ Auto-provisioned with `docker-compose`.

9. **Prisma**
   - _Purpose:_ Type-safe database ORM for the backend.
   - _Install:_  
     ```bash
     npm install --save-dev prisma
     ```

10. **Vite**
    - _Purpose:_ Lightning-fast dev server and build tool for React app.
    - _Install:_  
      ```bash
      # Already included as a dependency in fiscalzen-app
      ```

11. **NestJS CLI**
    - _Purpose:_ Scaffolding and running backend services.
    - _Install:_  
      ```bash
      npm install -g @nestjs/cli
      ```

---

## Recommended Automation

Automation is deeply integrated into the FiscalZen workflow to improve consistency and reduce manual toil. Below are the key automation scripts, hooks, and commands you should know:

### Monorepo Install & Management

- Install all dependencies in root and both apps:
  ```bash
  npm install
  cd fiscalzen-app && npm install
  cd ../fiscalzen-api && npm install
  ```

### Linting & Formatting

- **Lint (all):**
  ```bash
  npm run lint
  ```
  - _App:_ `cd fiscalzen-app && npm run lint`
  - _API:_ `cd fiscalzen-api && npm run lint`

- **Format (all):**
  ```bash
  npm run format
  ```
  - Applies Prettier to the codebase.

> _Tip:_ Use `npm run fix` or similar if defined to auto-fix minor lint errors. Check package.json scripts for available options.

### Type Checking

- **TypeScript check:**
  ```bash
  npm run type-check
  ```
  - Ensures type safety across the codebase.

### Code Generation & Prisma

- **Prisma generate:**
  ```bash
  cd fiscalzen-api
  npx prisma generate
  ```
  - Regenerates Prisma client after any schema changes.

- **Migrate Database:**
  ```bash
  npx prisma migrate dev
  ```
  - Runs pending migrations and applies schema to local database.

### Pre-commit Hooks (Highly Recommended)

- **Husky** is typically used for Git hooks (install with `npm install --save-dev husky`):
  - Automatically runs linter, formatter, and type checks before commits.
  - To enable, run:  
    ```bash
    npx husky install
    ```
  - Check for a `.husky` folder or reference in `package.json` scripts.

### Running Tests

- **API tests:**  
  ```bash
  cd fiscalzen-api
  npm run test
  ```
- **Run in watch mode (if available):**  
  ```bash
  npm run test:watch
  ```

### Watch Modes

- **Vite App (frontend):**  
  ```bash
  cd fiscalzen-app
  npm run dev
  ```
- **NestJS API (backend):**  
  ```bash
  cd fiscalzen-api
  npm run start:dev
  ```

### Start Local Infrastructure

Spin up containers for local services:
```bash
docker-compose up -d
```

---

## IDE / Editor Setup

For the best developer experience, especially in VS Code, consider installing the following extensions:

- **ESLint**  
  _Finds and fixes problems in your code._
- **Prettier**  
  _Format code on save._
- **Prisma**
  _Syntax highlighting for Prisma schema files._
- **Tailwind CSS IntelliSense**
  _Autocomplete and highlighting for Tailwind CSS classes._
- **Docker**
  _Manage containers, images, and compose from within VS Code._

### Editor Configurations

- Enable "Format on Save".
- Set default formatter to Prettier.
- Recommended workspace settings are often checked into `.vscode/settings.json`.

---

## Productivity Tips

- **Terminal Aliases:**  
  Speed up navigation and commands with shell aliases.
  Example:
  ```bash
  alias apidev="cd fiscalzen-api && npm run start:dev"
  alias appdev="cd fiscalzen-app && npm run dev"
  ```

- **Container Workflow:**  
  Rely on Docker Compose for hassle-free environment setup. Always run `docker-compose up -d` at the project root to turn on databases and caches.

- **Prisma Workflow:**  
  Always run `npx prisma generate` after editing `schema.prisma`.

- **Code Navigation:**  
  Leverage editor features like “Go to Definition” and symbol search. The FiscalZen project is structured into `controllers`, `services`, `utils`, and `components` for clarity.

- **Shared Scripts:**  
  Custom scripts are often defined in `package.json` under the `scripts` key. Run `npm run` in each package to see all shortcuts.

- **Testing Fast:**  
  Use test filters or watch mode (where available) to quickly iterate on a subset of tests during development.

---

## Cross-References

- [Development Workflow Guide](./development-workflow.md)
- [Architecture Overview](./architecture.md)

Stay productive, consistent, and collaborative with these shared tools and practices!
