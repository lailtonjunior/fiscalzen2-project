# Análise de Arquitetura - Plataforma SaaS de Gestão de Documentos Fiscais Eletrônicos

## 📋 Visão Geral do Projeto

### Nome da Plataforma
**NFe Master SaaS** - Plataforma completa para gestão de Notas Fiscais Eletrônicas

### Objetivo
Desenvolver uma plataforma SaaS robusta para empresas de todos os portes gerenciarem documentos fiscais eletrônicos (NFe, CTe, NFCe), com foco em:
- Captura automática de notas fiscais da SEFAZ
- Gestão completa do ciclo de vida dos documentos fiscais
- Conformidade fiscal e armazenamento seguro
- Relatórios avançados e análise de dados

---

## 🏗️ Arquitetura do Sistema

### 1. Arquitetura Geral - Microserviços

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE APRESENTAÇÃO                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │  Mobile App │  │   Portal    │  │  API para Clientes  │ │
│  │   (React)   │  │  (Futuro)   │  │  Contador   │  │    (REST/SOAP)      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE API GATEWAY                               │
│                    (Kong / AWS API Gateway / Nginx)                         │
│                     - Rate Limiting, Autenticação, SSL                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE MICROSERVIÇOS                             │
│                                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │   Auth       │ │   NFe        │ │  Manifestação│ │   Relatórios     │   │
│  │   Service    │ │   Service    │ │  Service     │ │   Service        │   │
│  │              │ │              │ │              │ │                  │   │
│  │ - Login      │ │ - Consulta   │ │ - CIência    │ │ - Dashboards     │   │
│  │ - JWT/OAuth2 │ │   SEFAZ      │ │ - Confirmação│ │ - Excel/PDF      │   │
│  │ - Permissões │ │ - Download   │ │ - Desacordo  │ │ - Análises       │   │
│  │              │ │   XML/PDF    │ │ - Lote       │ │                  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘   │
│                                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │   Storage    │ │   SPED       │ │  Notificações│ │   Empresas       │   │
│  │   Service    │ │   Service    │ │  Service     │ │   Service        │   │
│  │              │ │              │ │              │ │                  │   │
│  │ - Upload     │ │ - Importação │ │ - Email      │ │ - Cadastro       │   │
│  │ - Download   │ │ - Validação  │ │ - Webhook    │ │ - CNPJ           │   │
│  │ - Backup     │ │ - Conferência│ │ - SMS        │ │ - Certificados   │   │
│  │              │ │ - C100/D100  │ │              │ │                  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE MENSAGERIA                                │
│                    (Apache Kafka / RabbitMQ / AWS SQS)                      │
│              - Filas para processamento assíncrono de notas                 │
│              - Eventos entre microserviços                                  │
│              - Processamento em lote                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE DADOS                                     │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   PostgreSQL    │  │     MongoDB     │  │        Redis                │  │
│  │   (Principal)   │  │   (Logs/Cache)  │  │       (Cache/Sessões)       │  │
│  │                 │  │                 │  │                             │  │
│  │ - Empresas      │  │ - XML brutos    │  │ - Cache de consultas        │  │
│  │ - Usuários      │  │ - Logs SEFAZ    │  │ - Sessões JWT               │  │
│  │ - Notas Fiscais │  │ - Eventos       │  │ - Rate limiting             │  │
│  │ - Manifestações │  │ - Auditoria     │  │ - Filas temporárias         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Elasticsearch │  │   MinIO / S3    │  │    ClickHouse / BigQuery    │  │
│  │   (Busca)       │  │   (Arquivos)    │  │       (Data Warehouse)      │  │
│  │                 │  │                 │  │                             │  │
│  │ - Busca full    │  │ - XML/PDF       │  │ - Análises históricas       │  │
│  │   text em notas │  │ - Anexos        │  │ - Relatórios BI             │  │
│  │ - Filtros       │  │ - Backups       │  │ - Métricas de uso           │  │
│  │   avançados     │  │ - Exports       │  │ - Previsões                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE INTEGRAÇÕES EXTERNAS                         │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │    SEFAZ     │  │  Prefeituras │  │    SPED      │  │   Receita      │   │
│  │   Nacional   │  │   (NFSe)     │  │   Fiscal     │  │   Federal      │   │
│  │              │  │              │  │              │  │                │   │
│  │ - NFe        │  │ - Consulta   │  │ - Importação │  │ - Consulta     │   │
│  │ - CTe        │  │   NFSe       │  │   EFD ICMS   │  │   CNPJ         │   │
│  │ - Manifesto  │  │ - Download   │  │ - Validação  │  │ - Validacao    │   │
│  │   destinatário│  │   XML        │  │ - Conferência│  │                │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Stack Tecnológico Completo

### Frontend (Web Application)

| Componente | Tecnologia | Versão | Justificativa |
|------------|-----------|--------|---------------|
| Framework | React | 18.x | Performance, ecossistema maduro |
| Linguagem | TypeScript | 5.x | Tipagem forte, manutenibilidade |
| Build Tool | Vite | 5.x | Build rápido, HMR eficiente |
| Estilização | Tailwind CSS | 3.4.x | Utility-first, design consistente |
| UI Components | shadcn/ui | latest | Componentes acessíveis, customizáveis |
| Estado Global | Zustand | 4.x | Leve, simples, TypeScript-native |
| Queries | TanStack Query | 5.x | Cache eficiente, sincronização servidor |
| Formulários | React Hook Form | 7.x | Performance, validação flexível |
| Validação | Zod | 3.x | Schema validation TypeScript |
| Tabelas | TanStack Table | 8.x | Tabelas avançadas, ordenação, filtros |
| Gráficos | Recharts | 2.x | Gráficos responsivos, integração React |
| PDF Viewer | react-pdf | 7.x | Visualização de DANFe/DACTe |
| XML Viewer | xml-js + prism | latest | Parse e syntax highlight XML |
| Export Excel | xlsx | 0.18.x | Geração de relatórios Excel |
| Date Picker | date-fns | 3.x | Manipulação de datas brasileiras |
| Toast/Notif. | Sonner | latest | Notificações elegantes |

### Backend (Microserviços)

| Componente | Tecnologia | Versão | Justificativa |
|------------|-----------|--------|---------------|
| Runtime | Node.js | 20.x LTS | Performance, async I/O |
| Framework | NestJS | 10.x | Arquitetura modular, injeção de dependências |
| Linguagem | TypeScript | 5.x | Consistência com frontend |
| ORM | Prisma | 5.x | Type-safe database queries |
| Validação | class-validator | latest | DTOs validados |
| Documentação | Swagger/OpenAPI | 3.x | API documentada automaticamente |
| Autenticação | Passport.js + JWT | latest | Estratégias flexíveis |
| Autorização | CASL | latest | Permissões granulares |
| HTTP Client | Axios | 1.x | Requisições SEFAZ |
| SOAP Client | soap | latest | Integrações legado SEFAZ |
| XML Parser | fast-xml-parser | 4.x | Parse eficiente de XML |
| PDF Generator | pdfmake | latest | Geração de DANFe |
| Queue | BullMQ | latest | Filas com Redis |
| Scheduler | node-cron | latest | Agendamentos |
| Email | Nodemailer | latest | Envio de notificações |
| SMS | Twilio SDK | latest | SMS (futuro) |

### Banco de Dados

| Componente | Tecnologia | Uso |
|------------|-----------|-----|
| Principal | PostgreSQL 16 | Dados estruturados (empresas, notas, usuários) |
| Cache | Redis 7 | Sessões, cache de consultas, rate limiting |
| Documentos | MongoDB 7 | Logs de integração SEFAZ, XML brutos |
| Busca | Elasticsearch 8 | Full-text search em notas |
| Data Warehouse | ClickHouse | Análises históricas, BI |
| Arquivos | MinIO (S3-compatible) | Storage de XML/PDF |

### Infraestrutura & DevOps

| Componente | Tecnologia | Uso |
|------------|-----------|-----|
| Container | Docker | Empacotamento de serviços |
| Orquestração | Kubernetes | Escalabilidade, alta disponibilidade |
| Service Mesh | Istio | Comunicação entre serviços |
| API Gateway | Kong | Rate limiting, autenticação, roteamento |
| Mensageria | Apache Kafka | Eventos entre serviços |
| Monitoramento | Prometheus + Grafana | Métricas e dashboards |
| Logs | ELK Stack (Elasticsearch, Logstash, Kibana) | Centralização de logs |
| Tracing | Jaeger | Distributed tracing |
| CI/CD | GitHub Actions | Automação de deploy |
| Cloud | Google Cloud Platform | Infraestrutura cloud |
| CDN | CloudFlare | Distribuição global, segurança |
| DNS | CloudFlare | Gerenciamento de DNS |

### Segurança

| Componente | Tecnologia | Uso |
|------------|-----------|-----|
| WAF | CloudFlare | Proteção contra ataques |
| DDoS Protection | CloudFlare | Mitigação DDoS |
| Secrets | HashiCorp Vault | Gerenciamento de segredos |
| Certificados | Let's Encrypt | SSL/TLS gratuito |
| Code Scan | SonarQube | Análise estática de código |
| Dependency Check | Snyk | Verificação de vulnerabilidades |

---

## 📊 Modelo de Dados (Simplificado)

### Entidades Principais

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    EMPRESA      │     │     USUÁRIO     │     │    PERMISSÃO    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ cnpj (unique)   │◄────┤ empresa_id (FK) │     │ nome            │
│ razao_social    │     │ nome            │     │ descricao       │
│ nome_fantasia   │     │ email (unique)  │     │ recurso         │
│ inscricao_estadual│   │ senha_hash      │     │ acao            │
│ certificado_pfx │     │ ativo           │     └─────────────────┘
│ cert_senha      │     │ ultimo_acesso   │            ▲
│ data_cadastro   │     │ created_at      │            │
│ ativo           │     └─────────────────┘            │
│ ambiente_sefaz  │              ▲                     │
│ (producao/homol)│              │                     │
└─────────────────┘              │              ┌─────┴─────────────┐
         ▲                       │              │  USUARIO_PERMISSAO│
         │                       │              ├─────────────────┤
         │                       │              │ usuario_id (FK) │
         │                       │              │ permissao_id(FK)│
         │                       │              └─────────────────┘
         │                       │
         │                ┌──────┴──────────┐
         │                │  PERFIL_ACESSO  │
         │                ├─────────────────┤
         │                │ id (PK)         │
         │                │ nome            │
         │                │ descricao       │
         │                │ permissoes[]    │
         │                └─────────────────┘
         │
         │
         │         ┌─────────────────┐
         │         │  NOTA_FISCAL    │
         │         ├─────────────────┤
         │         │ id (PK)         │
         └────────►│ empresa_id (FK) │
                   │ chave_acesso    │
                   │ numero          │
                   │ serie           │
                   │ tipo (NFe/CTe)  │
                   │ xml_conteudo    │
                   │ pdf_danfe       │
                   │ data_emissao    │
                   │ data_autorizacao│
                   │ valor_total     │
                   │ emitente_cnpj   │
                   │ emitente_nome   │
                   │ destinatario_cnpj│
                   │ status_sefaz    │
                   │ status_manifesto│
                   │ data_manifesto  │
                   │ created_at      │
                   └─────────────────┘
                            │
                            │
                   ┌────────┴────────┐
                   │  MANIFESTACAO   │
                   ├─────────────────┤
                   │ id (PK)         │
                   │ nota_id (FK)    │
                   │ tipo_manifesto  │
                   │ (ciencia/conf/  │
                   │  desc/desacordo)│
                   │ data_manifesto  │
                   │ protocolo_sefaz │
                   │ usuario_id (FK) │
                   │ justificativa   │
                   │ created_at      │
                   └─────────────────┘
```

---

## 🔌 Integrações com SEFAZ

### Fluxo de Consulta à SEFAZ

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────►│   Nosso     │────►│   Serviço   │────►│    SEFAZ    │
│   (Web)     │     │   Backend   │     │   SEFAZ     │     │   Nacional  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │                    │
                           │                   │                    │
                           ▼                   ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │  Fila de    │     │  Web Service│     │  Resposta   │
                    │  Consultas  │     │  SOAP/REST  │     │  XML        │
                    │  (BullMQ)   │     │  + Certif.  │     │             │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

### Serviços SEFAZ Integrados

| Serviço | Descrição | Protocolo |
|---------|-----------|-----------|
| NFeDistribuicaoDFe | Download de NFe emitidas contra CNPJ | SOAP |
| NFeConsultaProtocolo | Consulta situação da NFe | SOAP |
| NFeManifestacao | Manifestação do destinatário | SOAP |
| CTeDistribuicaoDFe | Download de CTe emitidos contra CNPJ | SOAP |
| CTeManifestacao | Manifestação do destinatário CTe | SOAP |
| NFSe (municipal) | Consulta NFSe por prefeitura | SOAP/REST |

---

## 📈 Escalabilidade e Performance

### Estratégias de Escalabilidade

1. **Horizontal Scaling**: Kubernetes HPA para escalar pods baseado em CPU/memória
2. **Database Sharding**: Particionamento por empresa_id para grandes volumes
3. **Read Replicas**: Réplicas de leitura PostgreSQL para consultas
4. **Caching Estratégico**: Redis para cache de consultas frequentes
5. **CDN**: CloudFlare para assets estáticos
6. **Async Processing**: Filas para processamento de lotes

### Métricas de Performance Esperadas

| Métrica | Meta |
|---------|------|
| Tempo de resposta API | < 200ms (p95) |
| Tempo de consulta SEFAZ | < 3s |
| Throughput de notas | 10.000 notas/minuto |
| Disponibilidade | 99.9% |
| RPO (Recovery Point) | < 1 hora |
| RTO (Recovery Time) | < 4 horas |

---

## 🔐 Segurança e Conformidade

### Certificações e Conformidade

| Requisito | Implementação |
|-----------|---------------|
| ISO 27001 | Políticas de segurança, controles de acesso |
| LGPD | Consentimento, anonimização, direito ao esquecimento |
| Guarda Documentos | 5 anos conforme legislação fiscal |
| Certificados Digitais | A1 e A3 suportados |
| Criptografia | AES-256 para dados em repouso, TLS 1.3 em trânsito |

### Controles de Segurança

1. **Autenticação**: MFA obrigatório para admins
2. **Autorização**: RBAC com permissões granulares
3. **Auditoria**: Log de todas as operações
4. **Backup**: Backup diário automático, retenção 30 dias
5. **Criptografia**: Dados sensíveis criptografados
6. **WAF**: Proteção contra SQL injection, XSS
7. **Rate Limiting**: Prevenção de abuso

---

## 💰 Modelo de Negócio (SaaS)

### Planos Sugeridos

| Plano | Volume Mensal | Preço | Funcionalidades |
|-------|--------------|-------|-----------------|
| Starter | Até 500 notas | R$ 99/mês | Consulta, download, manifestação básica |
| Business | Até 5.000 notas | R$ 299/mês | + Relatórios, SPED, multiusuário |
| Enterprise | Até 50.000 notas | R$ 799/mês | + API, painel contador, suporte prioritário |
| Custom | Ilimitado | Sob consulta | Infra dedicada, SLAs customizados |

---

## 📅 Roadmap de Desenvolvimento

### Fase 1 - MVP (2-3 meses)
- [x] Autenticação e gestão de usuários
- [x] Consulta SEFAZ e download de XML
- [x] Visualização de NFe e CTe
- [x] Manifestação do destinatário
- [x] Armazenamento básico

### Fase 2 - Funcionalidades Avançadas (2 meses)
- [ ] Relatórios e dashboards
- [ ] Conferência SPED
- [ ] Gestão multiempresa
- [ ] Painel do contador

### Fase 3 - Escala e Integrações (2 meses)
- [ ] API pública
- [ ] Integrações ERP (TOTVS, SAP)
- [ ] Mobile app
- [ ] Inteligência artificial para análise

---

## 📚 Próximos Documentos

1. `02-ESPECIFICACAO-API.md` - Especificação detalhada da API
2. `03-MANUAL-INSTALACAO.md` - Guia de instalação e configuração
3. `04-MANUAL-USUARIO.md` - Manual do usuário
4. `05-ARQUITETURA-DETALHADA.md` - Diagramas C4 e detalhes técnicos
