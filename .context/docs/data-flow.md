# Data Flow & Integrations

FiscalZen orchestrates data exchange between end-users, a central PostgreSQL database, and Brazilian government services (SEFAZ), ensuring auditability and reliability across the document lifecycle. This document details how data enters, traverses, and exits the system, highlighting module dependencies, service orchestration, high-level workflow, and the principal external integration patterns.

---

## Data Flow & Integrations

Data originates from regulatory authorities (SEFAZ) or system users:

- **Entry:** Most data enters via two channels:
    - **User-initiated actions** through frontend interfaces—triggering business workflows or artifact retrievals through the API.
    - **Automated ingestion** (planned feature): Scheduled background tasks routinely interrogate SEFAZ to fetch new fiscal documents (NFe/CTe).
- **Processing:** XML payloads from SEFAZ are parsed, validated, and normalized by backend services; business rules are applied, and results persist to a PostgreSQL data store.
- **Interaction:** The API exposes REST endpoints for the frontend, serving normalized JSON resources for dashboards, reporting, and user interaction.
- **Outbound events:** User-triggered actions (e.g., Manifestação de Destinatário—confirming a fiscal event) are signed digitally and dispatched to SEFAZ via SOAP, leveraging mutual TLS with company-issued certificates.
- **Observability:** Event traces, logs, and state transitions are monitored; errors initiate retries or move documents into quarantine.

---

## Module Dependencies

- **fiscalzen-app (Frontend)**
    - → `fiscalzen-api` (RESTful API endpoints)
    - → `utils` (data processing and formatting)
- **fiscalzen-api (Backend)**
    - → `PostgreSQL` (main data persistence)
    - → `Redis` (operational caching, BullMQ job queue)
    - → `SEFAZ` (SOAP/XML government web services)
    - → `utils` (payload parsing, certificate handling)
- **fiscalzen-api/src/ (Controllers & Services)**
    - → `services/` (central business logic)
    - → `utils/` and `config/` (support libraries)
    - → Third-party integrations (`sefaz-ws`, `bullmq`, `pg`)

---

## Service Layer

The backend (`fiscalzen-api`) exposes modular services (implemented and planned):

- [AppService](../fiscalzen-api/src/app.service.ts): Handles general application and orchestration logic.
- **AuthService** (planned): Will manage JWT authentication, session handling, and user credentials.
- **NFeService** (planned): Responsible for NFe/CTe fiscal document parsing, validation, and business rules.
- **SefazService** (planned): Abstracts and encapsulates all SEFAZ SOAP endpoint interactions, certificate management, and network retries.

---

## High-level Flow

The following diagram summarizes FiscalZen's primary data pipeline from input to output:

```mermaid
flowchart TD
    User[User Action]<-->|REST (HTTP JSON)|API[AppController/AppService]
    API-->|Schedule/BullMQ|Jobs[Ingestion Worker]
    Jobs-->|SOAP/mTLS|SEFAZ[SEFAZ]
    SEFAZ-->|XML Response|Jobs
    Jobs-->|Parsed, validated|PG[PostgreSQL]
    API-->|Read/Write|PG
    API-->|REST (HTTP JSON)|FE[fiscalzen-app (Frontend)]
    FE-->|User Triggers Manifestação|API
    API-->|SOAP/mTLS & signed events|SEFAZ
```

**Step-wise Summary:**
1. The frontend interacts with the backend over HTTP, invoking controllers (e.g., for dashboards, document listings, manifestations).
2. Scheduled jobs (using BullMQ/Redis) periodically poll SEFAZ's SOAP services, fetching and transmitting document payloads.
3. XML payloads are parsed; valid records are persisted, while invalid documents enter a monitored quarantine state.
4. User actions, such as Manifestação de Destinatário, propagate downstream via secure (TLS+certificate) SOAP calls.
5. All state transitions, request/response pairs, and error conditions are logged and observed.

---

## Internal Movement

Backend modules collaborate through shared database access, job queues (BullMQ/Redis), and controller-service abstractions:

- **Job Queueing:** Long-running or scheduled SEFAZ interactions (e.g., retrieval, batch processing) are dispatched to BullMQ-managed workers, resilient to network failures.
- **Database as Source of Truth:** Controllers and services operate on normalized datasets, coordinating transactional integrity.
- **Utility Contracts:** Data parsing, certificate validation, and envelope creation are centralized in `utils` to ensure consistency across services.

---

## External Integrations

### SEFAZ (Secretaria da Fazenda)

- **Purpose:** Legislative source for electronic invoices (NFe/CTe, Manifestação).
- **Protocol:** SOAP over mutual TLS (X.509). Endpoints are region-specific and require whitelisting.
- **Authentication:** A1 Digital Certificate (`.pfx`) for each registered Empresa (Company).
- **Typical Transaction:**
    1. Prepare XML—sign digitally using the enterprise's certificate.
    2. Embed within SOAP envelope—base64 encode and attach headers.
    3. Dispatch to SEFAZ endpoint; handle connection timeouts/retries.
    4. Receive and parse SOAP response; update local database for status or errors.
- **Retry/Backoff:** BullMQ queue configured with exponential backoff (default 3, 8, 32, 60s) on transient network or remote unavailability.
- **Payloads:**
    - **Inbound:** Standardized government XML schema (NFe, CTe, ...).
    - **Outbound:** Manifestação events, digitally signed and validated for regulatory compliance.

---

## Observability & Failure Modes

- **API and Worker Logs:** All transactional flows are recorded—accessed via Docker logs or platform log aggregator.
- **Job Statistics:** Queue depth, retry counts, and dead-letter events are tracked in Redis/BullMQ dashboard.
- **Validation Pipeline:** Malformed or non-compliant XML inputs are flagged and sequestered in an isolated "Quarantine" table for operator review.
- **Compensation/Recovery:**
    - On SEFAZ downtime, jobs are retried; persistent failures are annotated with error codes and surfaced to admin users.
    - Application errors (e.g., database deadlocks) result in compensation logic to avoid record inconsistencies.

---

## Cross-References

- For broader system design and behavioral rationale, see [architecture.md](./architecture.md).
