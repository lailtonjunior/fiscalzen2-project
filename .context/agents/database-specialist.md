# Database Specialist Agent Playbook

---
type: playbook
name: Database Specialist Agent Playbook
description: Guidance for AI agents specializing in database design, schema optimization, and data layer best practices for the FiscalZen Project.
agentType: database-specialist
version: 1.0
generated: 2026-02-02
status: active
---

## Purpose

This playbook equips the database-specialist agent with actionable workflows, conventions, and best practices for database design and optimization tasks within the FiscalZen Project.

---

## 1. Codebase Focus Areas

### 1.1 Primary Directories

- **`fiscalzen-api\src\`**  
  - Source of application business logic, service orchestration, and data-related operations.
  - Likely contains service, model, and possibly data-access files.

### 1.2 Key Files

| File/Directory                                 | Purpose                                                                           |
|------------------------------------------------|-----------------------------------------------------------------------------------|
| `fiscalzen-api\src\app.service.ts`             | Entry point for business/service logic. May interface with database/data-access.   |
| `fiscalzen-api\src\entities\`                  | Canonical location for entities or database models (if exists).                    |
| `fiscalzen-api\src\database\`                  | Potential place for typeorm/migration/configuration (if exists).                   |
| `ormconfig.js/ormconfig.json`                  | TypeORM, Sequelize, or other ORM configuration (if used).                          |
| `.env` / `.env.example`                        | Contains DB credentials, host info, and connection details.                        |

---

## 2. Workflows & Steps for Common Database Tasks

### 2.1 Designing and Modifying Schemas

1. **Locate Entity Definitions:**  
   - Inspect `fiscalzen-api\src\entities\` (or similar) for ORM models.
   - Review any decorators (`@Entity()`, `@Column()`) or schema definition blocks.

2. **Add/Modify an Entity:**  
   - Create/edit a corresponding `.ts` file in `entities/`.
   - Follow codebase conventions for naming, field typing, nullable, and relations.
   - Ensure metadata annotations, e.g., primary key, unique index, are present.

3. **Update Relationships:**  
   - Define relations using ORM-provided decorators/constructs (`@ManyToOne`, `@OneToMany`, etc.).
   - Use cascade rules and lazy/eager loading per project standards.

4. **Migration Generation:**  
   - If using migration tools (e.g., TypeORM CLI), run/generate migration files after schema changes.
   - Store generated migrations in `fiscalzen-api\src\migration\` or as per codebase convention.
   - Validate migration content (up/down logic) before applying.

5. **Schema Synchronization:**  
   - Apply migrations using developer workflow/scripts (e.g., `npm run migration:run`).
   - Check schema is in sync after deployment.

### 2.2 Database Query Best Practices

- Always use parameterized queries to prevent SQL injection.
- Use repository/service pattern: Queries should be encapsulated in dedicated service or repository files, never mixed in controller logic.
- Apply appropriate indexes for frequently queried fields; review query plans if performance is a concern.
- Use transactions for multi-step data mutations.

### 2.3 Database Configuration & Environment

- Store DB credentials and connection info in `.env` files; never hard-code.
- Refer to `ormconfig.js/json` for ORM and connection options, sync: false in production.
- Separate development and production databases for safety.

---

## 3. Best Practices and Code Conventions

### 3.1 Entity & Field Naming

- Use singular, PascalCase for entity/model names, e.g., `User`, `Invoice`.
- Use camelCase for property/field names, e.g., `firstName`, `invoiceDate`.
- Avoid abbreviations; be explicit for field clarity.

### 3.2 Type and Nullability

- Use strict typing for all fields (string, number, Date, etc.).
- Clearly declare nullable fields; keep required fields explicit with `nullable: false`.

### 3.3 Relationships

- Use clear foreign key naming, e.g., `userId`, not just `id`.
- Define join tables for many-to-many, avoid implicit mapping.

### 3.4 Migrations

- Never edit old migrations; always create new migration files for each change.
- Use clear, descriptive migration names (e.g., `add-invoice-status-field.ts`).
- Always test migrations up and down before merging.

### 3.5 Documentation

- Document each entity/model with a short comment on its purpose and main fields.
- Use JSDoc or TypeScript comments to specify complex relationships and constraints.

---

## 4. Code Patterns and Examples

```typescript
// Example entity definition (TypeORM)
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({ type: 'date', nullable: false })
  issueDate: Date;

  @ManyToOne(() => User, user => user.invoices)
  user: User;
}
```

---

## 5. Key Files and Their Purposes

| File/Directory                         | Description                                                              |
|----------------------------------------|--------------------------------------------------------------------------|
| `app.service.ts`                       | Handles high-level business processes; be alert for data-access code.    |
| `entities/` (if present)               | Source of data models/entities.                                          |
| `migration/` (if present)              | Database schema migrations.                                              |
| `.env`                                 | Database connection settings.                                            |
| `ormconfig.js/json`                    | ORM and connection tuning.                                               |

---

## 6. Testing Patterns

- Prefer integration tests that bootstrap a test database instance.
- Test both entities/models and migration scripts for correct up/down application.
- Include tests for complex queries and edge cases.
- Place tests in `fiscalzen-api\test` or nearest `__tests__` folder.

---

## 7. Key Recommendations

- Review all schema changes with the team before applying to production.
- Keep up-to-date ER diagrams or schema documentation.
- Enforce data integrity with constraints, both in code and at the DB layer.
- Monitor query performance/logs for optimization over time.

---

**End of Playbook**
