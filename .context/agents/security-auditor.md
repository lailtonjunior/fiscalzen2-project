# Security Auditor Agent Playbook

---

## Overview

This playbook provides comprehensive guidelines for the Security Auditor Agent tasked with identifying security vulnerabilities in the FiscalZenProject codebase. It summarizes the key code layers, highlights areas of focus, defines actionable workflows, codifies best practices, and documents critical files and their roles.

---

## 1. Focus Areas for Security Auditing

### 1.1. Controllers

- **Locations**: `fiscalzen-api/src/app.controller.ts`
- **Role**: Handles external requests and routes them to services. A primary entry point, prone to input validation and authorization vulnerabilities.

### 1.2. Services

- **Locations**: `fiscalzen-api/src/app.service.ts`
- **Role**: Encapsulates business logic; potential locus for privilege escalation and data leakage if not securely implemented.

### 1.3. Authentication & State Management

- **Locations**: `fiscalzen-app/src/hooks/useStore.ts`
- **Key Symbol**: `AuthState`
- **Role**: Manages authentication state, essential for validating authentication, session persistence, and state-related vulnerabilities.

### 1.4. Configuration & Test Directories

- **Directories**: 
  - `fiscalzen-api/test`
  - Configuration files typically found in root or `src` directories.
- **Role**: Test for hardcoded secrets, improper configs, and lack of negative tests.

---

## 2. Security Auditing Workflows

### 2.1. Endpoint Security Validation

- **Step 1:** Identify all controllers (`*.controller.ts`). List all routes and their HTTP methods.
- **Step 2:** Verify the presence and correctness of authentication and authorization checks (middleware, guards, etc.) for each route.
- **Step 3:** Validate input sanitization and output encoding to defend against injection attacks (SQLi, XSS).
- **Step 4:** Confirm usage of secure HTTP headers and CORS policies.

### 2.2. Service Layer Hardening

- **Step 1:** Inspect service methods (`AppService` in `app.service.ts`) for sensitive data handling.
- **Step 2:** Ensure no business logic circumvents authentication, permission checks, or audit logging.
- **Step 3:** Validate the handling of user-supplied data. Verify server-side validation logic is implemented.

### 2.3. Authentication & State Safety

- **Step 1:** Examine `AuthState` in `useStore.ts` for secure token storage, expiry checks, and state tampering prevention.
- **Step 2:** Detect any token leakage in logs or improper token/session handling on the client side.

### 2.4. Secure Configuration and Secrets Management

- **Step 1:** Audit configuration files for hardcoded secrets, keys, credentials, tokens, or passwords.
- **Step 2:** Ensure sensitive values are injected via environment variables and never stored in source control.

### 2.5. Test Coverage and Security Testing

- **Step 1:** Inspect test cases under `fiscalzen-api/test` for coverage of edge cases, negative scenarios, and authorization failures.
- **Step 2:** Add/Refactor tests to include:
    - Invalid/malicious inputs
    - Permission boundaries
    - Session expiry/invalid states

---

## 3. Best Practices from the Codebase

- **Encapsulation:** Core business logic resides in service classes, decoupled from controllers.
- **Explicit Exports:** Key modules (`AppModule`, `AppController`, `AppService`) are explicitly exported for clear boundaries.
- **State Isolation:** Authentication state managed with a central `AuthState` hook/component.
- **Layered Validation:** Each layer (controller, service) should independently validate critical input.
- **No Trust on Client State:** Never trust client-managed authentication state or tokens without server-side verification.
- **Comprehensive Testing:** Use the test directory for both positive and negative testing patterns.

---

## 4. Code Patterns & Conventions

- **Naming:** Controllers (`*.controller.ts`), Services (`*.service.ts`).
- **Structure:** 
  - `src/` for core logic
  - `test/` for tests
  - Separate API and App directories (`fiscalzen-api`, `fiscalzen-app`)
- **Exports/Imports:** Explicit import/export in all TypeScript files for clarity.

---

## 5. Key Files and Purposes

| File / Directory                           | Purpose                                                                                  |
|--------------------------------------------|------------------------------------------------------------------------------------------|
| `fiscalzen-api/src/app.controller.ts`      | Main HTTP controller. Entry point for routes. Audit for endpoint security.                |
| `fiscalzen-api/src/app.service.ts`         | Service layer with core business logic. Examine for authorization, validation, and leaks. |
| `fiscalzen-app/src/hooks/useStore.ts`      | Authentication and state management logic. Key for session control and state safety.       |
| `fiscalzen-api/test/`                      | Test cases. Ensure coverage of negative and security-relevant cases.                      |
| *Config files in root or `src`*            | Application secrets and configs. Ensure secure storage and handling.                       |

---

## 6. Action Checklist

- [ ] List and classify all routes with their access control (public/protected).
- [ ] Check for missing or weak authentication/authorization on sensitive endpoints.
- [ ] Ensure input is always validated and sanitized at both controller and service layers.
- [ ] Identify exposure of sensitive data (in responses, logs, errors).
- [ ] Verify secure management of secrets and tokens (no hardcoded credentials).
- [ ] Review tests for realistic attack scenarios and appropriate handling of exceptions.
- [ ] Recommend improvements or refactoring where industry standards (OWASP Top 10) are not met.

---

## 7. References

- [OWASP Top Ten Security Risks](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://github.com/lirantal/nodejs-security-best-practices)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/best-practices)

---

## 8. Reporting Template

**Vulnerability Title:**  
**Affected File(s):**  
**Description:**  
**Security Risk:**  
**Evidence:**  
**Remediation Recommendation:**  
**References:**  

---

*Use this playbook for all security audits. Update as necessary to reflect new threats, libraries, or codebase changes.*
