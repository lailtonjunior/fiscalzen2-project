# Manual de Instalação - NFe Master SaaS

## 📋 Pré-requisitos

### Sistema Operacional
- **Desenvolvimento**: Windows 10/11, macOS 12+, ou Linux (Ubuntu 20.04+)
- **Produção**: Linux (Ubuntu Server 22.04 LTS recomendado)

### Software Necessário

| Software | Versão Mínima | Download |
|----------|---------------|----------|
| Node.js | 20.x LTS | https://nodejs.org/ |
| npm | 10.x | Incluído com Node.js |
| Git | 2.40+ | https://git-scm.com/ |

### Verificação da Instalação

```bash
# Verificar Node.js
node --version
# Deve retornar: v20.x.x

# Verificar npm
npm --version
# Deve retornar: 10.x.x

# Verificar Git
git --version
# Deve retornar: 2.x.x
```

---

## 🚀 Instalação do Projeto

### 1. Clone do Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nfe-master-saas.git

# Acesse o diretório
cd nfe-master-saas
```

### 2. Instalação das Dependências

```bash
# Instalar dependências do projeto
npm install
```

### 3. Configuração do Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas configurações
nano .env
```

#### Variáveis de Ambiente (.env)

```env
# Ambiente
NODE_ENV=development
VITE_APP_NAME=NFe Master SaaS
VITE_APP_VERSION=1.0.0

# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# SEFAZ Integration
VITE_SEFAZ_HOMOLOGACAO=true
VITE_SEFAZ_TIMEOUT=30000

# Storage
VITE_STORAGE_TYPE=local
VITE_MAX_FILE_SIZE=10485760

# Features
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_WEBSOCKET=true
```

### 4. Execução em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# A aplicação estará disponível em:
# http://localhost:5173
```

### 5. Build para Produção

```bash
# Criar build de produção
npm run build

# Os arquivos serão gerados em: ./dist
```

### 6. Preview da Build

```bash
# Visualizar a build localmente
npm run preview

# Disponível em: http://localhost:4173
```

---

## 🐳 Docker (Opcional)

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # Backend services (para desenvolvimento completo)
  # api:
  #   build: ./backend
  #   ports:
  #     - "3000:3000"
  #   environment:
  #     - DATABASE_URL=postgresql://user:pass@db:5432/nfe_master
  #   depends_on:
  #     - db
  #
  # db:
  #   image: postgres:16-alpine
  #   environment:
  #     - POSTGRES_USER=user
  #     - POSTGRES_PASSWORD=pass
  #     - POSTGRES_DB=nfe_master
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data

# volumes:
#   postgres_data:
```

### Comandos Docker

```bash
# Build e execução
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f frontend
```

---

## ☁️ Deploy em Produção

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront

```bash
# Instalar AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

# Configurar credenciais
aws configure

# Sync para S3
aws s3 sync dist/ s3://seu-bucket-nfe-master --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id SEU_ID --paths "/*"
```

### GCP Cloud Storage

```bash
# Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Autenticar
gcloud auth login

# Set project
gcloud config set project SEU_PROJETO

# Upload
gsutil -m cp -r dist/* gs://seu-bucket-nfe-master/
```

---

## 🔧 Configuração do Nginx

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

## 📊 Estrutura de Diretórios

```
nfe-master-saas/
├── docs/                       # Documentação
│   ├── 01-ANALISE-ARQUITETURA.md
│   ├── 02-MANUAL-INSTALACAO.md
│   └── 03-MANUAL-USUARIO.md
├── public/                     # Assets públicos
│   └── favicon.ico
├── src/
│   ├── components/             # Componentes React
│   │   ├── custom/             # Componentes customizados
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── data/                   # Dados mockados
│   │   └── mockData.ts
│   ├── hooks/                  # Custom hooks
│   │   └── useStore.ts
│   ├── lib/                    # Utilitários
│   │   └── utils.ts
│   ├── sections/               # Páginas/Sections
│   │   ├── Dashboard.tsx
│   │   ├── Manifestacao.tsx
│   │   ├── NotasFiscais.tsx
│   │   └── Relatorios.tsx
│   ├── types/                  # Definições TypeScript
│   │   └── index.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── dist/                       # Build de produção
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes com coverage
npm run test:coverage

# Executar testes e2e
npm run test:e2e
```

---

## 🔍 Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"

```bash
# Matar processo na porta 5173
npx kill-port 5173

# Ou usar porta diferente
npm run dev -- --port 3000
```

### Erro de build TypeScript

```bash
# Verificar erros de tipo
npx tsc --noEmit

# Limpar cache TypeScript
rm -rf node_modules/.tmp
```

### Problemas com dependências

```bash
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix
```

---

## 📚 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Preview da build local |
| `npm run lint` | Executa ESLint |
| `npm run lint:fix` | Corrige erros do ESLint |
| `npm run test` | Executa testes |
| `npm run test:coverage` | Testes com coverage |

---

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs de erro no console do navegador
2. Consulte a documentação oficial:
   - [React](https://react.dev/)
   - [Vite](https://vitejs.dev/)
   - [Tailwind CSS](https://tailwindcss.com/)
   - [shadcn/ui](https://ui.shadcn.com/)
3. Abra uma issue no repositório do projeto

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.
