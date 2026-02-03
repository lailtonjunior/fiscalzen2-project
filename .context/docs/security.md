# Security & Compliance Notes

This document outlines the security and compliance patterns, practices, and requirements for the FiscalZen project. It is intended for developers to reference policies, code guardrails, authentication methods, handling of secrets, and adherence to relevant regulatory standards throughout the codebase and architecture.

For architectural details of subsystem boundaries, deployment, and service topology, see [architecture.md](architecture.md).

---

## Authentication & Authorization

FiscalZen implements modern, standards-based authentication and authorization mechanisms to secure access to sensitive data and operations throughout its services.

### Identity Providers

- **Primary Mechanism**: JWT (JSON Web Token) authentication is the default method across back-end (`fiscalzen-api`) and front-end (`fiscalzen-app`) applications.
- **User Model**: The `Usuario` interface (see `fiscalzen-app/src/types/index.ts`) defines roles, permissions, and attributes for authenticated users.
- **Extensibility**: The architecture allows for pluggable identity providers (e.g., integration with third-party OAuth2, SAML, or enterprise SSO) if organizational requirements demand it.

### Token Format & Handling

- **Tokens**: JWT tokens are signed using a strong secret or private key, set in environment variables and rotated periodically.
- **Claims**: Tokens include standard claims (`sub`, `exp`, `iat`) with additional custom claims for user role and permissions.
- **Expiration**: Short-lived access tokens (e.g., 15 minutes to 1 hour). Refresh tokens may be used for session continuity, stored securely HTTP-only.

### Session Management

- **Stateless Sessions**: API is stateless and validates each request’s token; no server-side session storage.
- **API Key Support**: Service accounts or machine integrations may use API keys (`ApiKey` type) with scoped permissions and IP whitelisting.

### Roles & Permissions

- **Role-Based Access Control (RBAC)**: All endpoints and components are protected via RBAC policies.
- **Granular Permissions**: Permissions are defined per feature/module (e.g., note fiscal viewing, administration, reporting).
- **Enforcement**: Controllers and services in `fiscalzen-api/src` enforce authorization through middleware and role-check utilities.

**Example:**  
```typescript
// Example role check (pseudocode)
if (!user.roles.includes('admin') && !user.permissions.includes('VIEW_NOTAS')) {
  throw new ForbiddenException();
}
```

---

## Secrets & Sensitive Data

Proper management of secrets and sensitive data is core to maintaining the integrity and confidentiality of FiscalZen’s environment.

### Storage & Management

- **Environment Variables**: All credentials, API keys, encryption passphrases, and signing keys are stored in environment variables (never hardcoded in source).
- **Secret Vaults**: Integration with managed secret stores (e.g., AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault) is recommended for staging and production.
- **Backup and Audit**: All secret accesses are logged and periodically audited.

### Rotation & Expiry

- **Rotation Cadence**: All secrets (API keys, JWT signing secrets, tokens) must be rotated at least every 90 days, or immediately upon departure of privileged staff.
- **Automated Rotation**: Where possible, secret rotation is implemented via automation pipelines or cloud-managed solutions.

### Encryption

- **At Rest**: Sensitive data (e.g., certificates, user PII) is encrypted using strong, industry-standard algorithms (AES-256 or better).
- **In Transit**: All API and web traffic is protected by HTTPS/TLS 1.2+.
- **Key Management**: Encryption keys are stored and managed using dedicated key management services (KMS) where supported.

### Data Classification

- **PII Handling**: Personally Identifiable Information and business data are explicitly marked by classification and processed accordingly.
- **Logging and Debugging**: Sensitive fields are never logged; logs are reviewed for accidental data leaks.

---

## Compliance & Policies

- **GDPR**: Personal data practices comply with the EU’s General Data Protection Regulation.
- **SOC 2**: All security controls are mapped to SOC 2 Trust Principles (Security, Availability, Confidentiality).
- **Internal Security Policy**: Adherence to company-specific secure coding, deploy, and access policies as documented in onboarding materials.
- **Evidence Requirements**: Access logs, audit reports, and incident records are maintained as compliance evidence.
- **Change Management**: All code impacting security is peer-reviewed and must pass automated security linting/tests before merge.

---

## Incident Response

- **On-call Contacts**: The security team maintains a rotating on-call schedule; see internal wiki for current roster.
- **Detection & Alerting**: Automated alerts for unauthorized access attempts, abnormal usage, or secrets exposure.
- **Escalation Steps**:
  1. Triage alert using audit logs.
  2. If validated, escalate to incident commander and execute containment.
  3. Notify stakeholders and, if required, regulators.
  4. After-action review and remediation.
- **Post-Incident Analysis**: All incidents are logged, root cause is analyzed, and mitigations are permanently tracked.

---

**For more details on system components and their security boundary, see [architecture.md](architecture.md).**
