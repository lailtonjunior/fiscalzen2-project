---
slug: authentication-plan
title: JWT Authentication System
summary: Implementation of JWT Authentication (NestJS + React)
status: active
generated: 2026-02-03
---

# JWT Authentication System

## Goal
Implement a secure, production-ready authentication system using JWT (JSON Web Tokens) to replace the current mock authentication in the Frontend.

## Architecture

- **Backend**: NestJS + Passport + JWT.
- **Database**: PostgreSQL (Store Users and Password Hashes).
- **Frontend**: React + Zustand (Store Token) + Axios Interceptors.

## Phase 1: Backend Implementation (NestJS)
**Agent**: `backend-specialist`

### Steps
1.  **Install Dependencies**
    -   `npm install @nestjs/passport passport passport-jwt bcrypt @types/bcrypt @types/passport-jwt`
2.  **Auth Module & Service**
    -   Generate `AuthModule`, `AuthService`, `AuthController`.
    -   Implement `validateUser(email, pass)`: Check DB and compare hash.
    -   Implement `login(user)`: Return `{ access_token: string }`.
3.  **Strategies & Guards**
    -   Implement `LocalStrategy` (for `POST /auth/login`).
    -   Implement `JwtStrategy` (for protecting routes).
    -   Create `JwtAuthGuard`.
4.  **Register Endpoint**
    -   Implement `POST /auth/register`: Create user with hashed password.

**Commit Checkpoint**: `feat(auth): implement jwt backend logic`

## Phase 2: Frontend Integration (React)
**Agent**: `frontend-specialist`

### Steps
1.  **API Client Setup**
    -   Create `src/lib/api.ts` (Axios instance).
    -   Add Interceptor: Inject `Authorization: Bearer <token>` from Zustand store.
2.  **Refactor Store**
    -   Update `useAuthStore` to remove mock logic.
    -   Implement `login()` fetching from `POST /auth/login`.
3.  **Update UI**
    -   Ensure Login Page displays real errors from API.
    -   Protect Dashboard routes (redirect to /login if no token).

**Commit Checkpoint**: `feat(frontend): integrate real auth api`

## Phase 3: Verification
**Agent**: `test-writer`

### Steps
1.  **Manual Test**: Register a user via Swagger/Postman, Login, Access Protected Route.
2.  **E2E Test**: Write `auth.e2e-spec.ts` in NestJS covering Login/Register flows.

**Commit Checkpoint**: `test(auth): verify login flow`

## User Review Required
-   **Security**: Ensure `JWT_SECRET` is strong and in `.env`.
-   **Passwords**: Verify `bcrypt` salt rounds (default 10).
