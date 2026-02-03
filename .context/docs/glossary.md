# Glossary & Domain Concepts

This document defines domain terminology, type definitions, enumerations, and business rules essential for understanding and building upon the FiscalZen project. It is intended to serve as a reference for developers, business stakeholders, and technical writers. For an architectural overview and broader context, refer to [project-overview.md](project-overview.md).

---

## Glossary & Domain Concepts

- **Empresa**: Represents a legal entity (company) within the system, including identification, legal and trade names, CNPJ, and compliance-related information. Central domain aggregate for most operations.
- **Endereco**: A postal address, generally associated with an `Empresa`.
- **Certificado**: Refers to a digital certificate belonging to an `Empresa`, used for authentication and digital signature in fiscal operations.
- **Nota Fiscal (NF-e)**: Brazilian electronic invoice model, core transaction entity for fiscal flows, including sales, purchases, and service invoices.
- **ItemNotaFiscal**: An item line within a `NotaFiscal`, detailing product/service and tax information.
- **Usuario**: System user entity. May represent internal staff, accountants, or clients, each with distinct permissions.
- **Manifestacao**: Mechanism by which an `Empresa` acknowledges or contests fiscal documents they receive (e.g., confirmation, acknowledgment, or dispute).
- **SpedConfig**: Configuration for SPED (Public Digital Bookkeeping System) integration, allowing companies to generate electronic accounting and fiscal files for authorities.
- **ConferenciaSped**: Represents reconciliation processes against SPED files, identifying inconsistencies or missed documents.
- **Webhook**: Mechanism for notifying external systems asynchronously on key system events.
- **DashboardStats / GraficoDados**: Structures for summary metrics, visualizations, and business intelligence, shown on dashboards.
- **Notificacao**: In-app notification or alert, often about processing status or integration outcomes.
- **LogIntegracao**: Audit trail for system integrations (such as API consumption, SPED import logs, etc.).
- **RelatorioConfig**: Report configuration, defining parameters for periodic or on-demand reporting exports.
- **ApiKey**: Authentication token for API clients, with management of permissions and metadata.
- **Tag**: Arbitrary label or categorization for entities such as `NotaFiscal`, aiding search, grouping, and analytics.

---

## Type Definitions

| Name                       | Location                                                                                                                             | Description                                     |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `Empresa`                  | [fiscalzen-app/src/types/index.ts:3](../fiscalzen-app/src/types/index.ts#L3)                                                         | Company entity                                  |
| `Endereco`                 | [fiscalzen-app/src/types/index.ts:19](../fiscalzen-app/src/types/index.ts#L19)                                                       | Address entity                                  |
| `Certificado`              | [fiscalzen-app/src/types/index.ts:29](../fiscalzen-app/src/types/index.ts#L29)                                                       | Digital certificate                             |
| `Usuario`                  | [fiscalzen-app/src/types/index.ts:39](../fiscalzen-app/src/types/index.ts#L39)                                                       | System user                                     |
| `NotaFiscal`               | [fiscalzen-app/src/types/index.ts:58](../fiscalzen-app/src/types/index.ts#L58)                                                       | Electronic invoice                              |
| `ItemNotaFiscal`           | [fiscalzen-app/src/types/index.ts:125](../fiscalzen-app/src/types/index.ts#L125)                                                     | Invoice item                                    |
| `Manifestacao`             | [fiscalzen-app/src/types/index.ts:146](../fiscalzen-app/src/types/index.ts#L146)                                                     | Manifestation event                             |
| `FiltroNotas`              | [fiscalzen-app/src/types/index.ts:159](../fiscalzen-app/src/types/index.ts#L159)                                                     | Filter for searching invoices                   |
| `DashboardStats`           | [fiscalzen-app/src/types/index.ts:174](../fiscalzen-app/src/types/index.ts#L174)                                                     | Dashboard stats structure                       |
| `GraficoDados`             | [fiscalzen-app/src/types/index.ts:185](../fiscalzen-app/src/types/index.ts#L185)                                                     | Chart data/metrics                              |
| `RelatorioConfig`          | [fiscalzen-app/src/types/index.ts:194](../fiscalzen-app/src/types/index.ts#L194)                                                     | Report configuration                            |
| `Notificacao`              | [fiscalzen-app/src/types/index.ts:212](../fiscalzen-app/src/types/index.ts#L212)                                                     | Notification entity                             |
| `LogIntegracao`            | [fiscalzen-app/src/types/index.ts:224](../fiscalzen-app/src/types/index.ts#L224)                                                     | Integration log                                 |
| `SpedConfig`               | [fiscalzen-app/src/types/index.ts:237](../fiscalzen-app/src/types/index.ts#L237)                                                     | SPED configuration                              |
| `ConferenciaSped`          | [fiscalzen-app/src/types/index.ts:252](../fiscalzen-app/src/types/index.ts#L252)                                                     | SPED reconciliation                             |
| `ApiKey`                   | [fiscalzen-app/src/types/index.ts:263](../fiscalzen-app/src/types/index.ts#L263)                                                     | API Key for authentication                      |
| `Webhook`                  | [fiscalzen-app/src/types/index.ts:276](../fiscalzen-app/src/types/index.ts#L276)                                                     | Webhook configuration                           |
| `Tag`                      | [fiscalzen-app/src/types/index.ts:289](../fiscalzen-app/src/types/index.ts#L289)                                                     | Entity label / tag                              |
| _(Additional internal UI/State types omitted for brevity)_                                                |                                                                                                                              |                                                 |


---

## Enumerations

| Name                | Location                                                                                           | Description                                   |
|---------------------|----------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `TipoDocumento`     | [fiscalzen-app/src/types/index.ts:53](../fiscalzen-app/src/types/index.ts#L53)                     | Document type (e.g., NF-e, NFS-e)             |
| `StatusSefaz`       | [fiscalzen-app/src/types/index.ts:54](../fiscalzen-app/src/types/index.ts#L54)                     | SEFAZ processing status                       |
| `StatusManifestacao`| [fiscalzen-app/src/types/index.ts:55](../fiscalzen-app/src/types/index.ts#L55)                     | Manifestation status                          |
| `TipoManifestacao`  | [fiscalzen-app/src/types/index.ts:56](../fiscalzen-app/src/types/index.ts#L56)                     | Manifestation type (e.g., confirm, unknown)   |

---

## Core Terms

- **CNPJ**: Unique identifier for companies in Brazil; critical for fiscal document validation and lookup.
- **SEFAZ**: State-level finance secretariat. Responsible for processing and authorizing `Nota Fiscal` documents.
- **NF-e**: "Nota Fiscal Eletrônica" (Electronic Invoice); Primary fiscal document for goods transfers.
- **NFS-e**: "Nota Fiscal de Serviços Eletrônica" (Electronic Service Invoice); Used for service transactions.
- **Manifestação do Destinatário**: Legal protocol by which a recipient acknowledges an incoming NF-e, mandated to enhance fiscal tracking and anti-fraud mechanisms.
- **SPED**: Brazil's "Public Digital Bookkeeping System" — encompasses compliance files such as EFD, NF-e receipts, and reconciliation features.
- **WEBHOOK**: HTTP-based callback used to notify external services about real-time events such as document status changes or integration updates.
- **Tagging**: Facility to assign custom tags to invoices (`NotaFiscal`) or other entities; enhances filtering and reporting.
- **Reconciliation (Conferência)**: Automated process for checking consistency between internal records/invoices and regulatory submissions (e.g., via SPED).

---

## Acronyms & Abbreviations

| Acronym | Full Term                                         | Notes / Relation                |
|---------|---------------------------------------------------|---------------------------------|
| CNPJ    | Cadastro Nacional da Pessoa Jurídica               | Company registration number     |
| CPF     | Cadastro de Pessoas Físicas                        | Individual tax ID               |
| SEFAZ   | Secretaria da Fazenda                              | State tax authority             |
| NF-e    | Nota Fiscal Eletrônica                             | Electronic invoice              |
| NFS-e   | Nota Fiscal de Serviços Eletrônica                 | Electronic service invoice      |
| SPED    | Sistema Público de Escrituração Digital            | Electronic bookkeeping, compliance|
| API     | Application Programming Interface                  | System integration              |
| CSV     | Comma-Separated Values                             | Data export/import file format  |
| XML     | Extensible Markup Language                         | Fiscal document data encoding   |


---

## Personas / Actors

- **Administrator (Admin)**: Manages companies, system configuration, integrations, and user permissions. Needs robust error diagnosis/reporting and insight into all records.
- **Accountant/Contador**: Oversees compliance, requests SPED files, initiates reconciliation, and audits digital certificates. Critical for ensuring accuracy and legal compliance.
- **Client User**: Views their company's dashboard, visualizes invoices/metrics, downloads required documents, and manages notifications.
- **Developer (API Integrator)**: Consumes provided APIs, configures webhooks, and manages API keys to automate workflow with external systems.
- **Auditor**: Investigates logs and fiscal records for discrepancies, compliance breaches, or integration failures.

**Key Workflows**:
- Uploading and validating digital certificates.
- Fetching and processing NF-es from SEFAZ.
- Reconciling internal data with SPED reports.
- Managing and responding to document manifestations.
- Exporting, tagging, and filtering fiscal documents for compliance and operations.

---

## Domain Rules & Invariants

- **CNPJ/CPF Validation**: All entities involving tax identification must validate the CNPJ/CPF format and check digit.
- **Certificate Management**: Certificates must be valid, not expired, and associated with the correct company. Expiry monitoring and notification is mandatory.
- **NF-e Integrity**: All fields must conform to SEFAZ standards, and duplicate or altered invoices are strictly rejected.
- **Manifestation Timelines**: Certain manifestations must be completed within regulatory deadlines (in days) or are flagged as pending.
- **SPED Consistency**: Data submitted via SPED must reconcile with internally stored invoices; mismatches are logged as exceptions and require resolution.
- **Audit Trail**: All integration actions, API access, and sensitive operations are logged.
- **Region/State Variations**: SEFAZ endpoints and formats may differ by Brazilian state; all operations must adapt accordingly.
- **Data Export**: Exports to PDF, Excel, or CSV formats must accurately mirror authoritative data.

---

For a broader system overview and architecture, see [project-overview.md](project-overview.md).
