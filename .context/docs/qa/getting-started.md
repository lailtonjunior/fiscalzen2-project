# Getting Started with FiscalZenProject

Welcome to the FiscalZenProject! This guide will help you set up and run the project for local development.

---

## Prerequisites

Before you begin, make sure you have the following software installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)
- Optional: [Yarn](https://yarnpkg.com/) if you prefer over npm

## Cloning the Repository

Start by cloning the project repository to your local machine:

```bash
git clone <repository-url>
cd FiscalZenProject
```

Replace `<repository-url>` with the actual URL of your repository.

## Installing Dependencies

Install the required dependencies for both the API and the App:

### 1. FiscalZen API (Backend)

```bash
cd fiscalzen-api
npm install
```

### 2. FiscalZen App (Frontend)

In a new terminal window/tab:

```bash
cd fiscalzen-app
npm install
```

## Running the Applications

You will typically want to run the backend (API) and frontend (App) concurrently in separate terminal windows.

### Start the API Server

From the root directory:

```bash
cd fiscalzen-api
npm run start:dev
```

This will start the backend server in development mode. By default, it should run on [http://localhost:3000](http://localhost:3000).

### Start the Frontend

In another terminal window:

```bash
cd fiscalzen-app
npm run dev
```

The frontend application will start on [http://localhost:5173](http://localhost:5173) (or the port configured in `vite.config.ts`).

## Available Scripts

To see all available npm/yarn scripts:

```bash
npm run
# or
yarn run
```

**Common scripts:**

- `npm run build` — Build the application for production use
- `npm run test` — Run tests (unit/integration)
- `npm run lint` — Check code quality

Refer to each package’s `package.json` for a full list of scripts.

## Configuration

Configuration files may need to be adjusted for your development environment:

- **Environment variables**: Copy `.env.example` to `.env` in both `fiscalzen-api` and `fiscalzen-app`, then adjust as needed with database credentials, API keys, etc.
- **API URL**: Ensure the frontend is pointing to the correct backend URL if you have made changes.

## Folder Structure

High-level overview:

```
FiscalZenProject/
├── fiscalzen-api/   # Backend - NestJS API
└── fiscalzen-app/   # Frontend - React app (Vite)
```

- `fiscalzen-api/` contains all backend code (controllers, services, etc.)
- `fiscalzen-app/` contains the frontend (components, pages, utils, etc.)

## Troubleshooting

- **Port in use?** Make sure no other app is running on ports 3000 (backend) or 5173 (frontend)
- **Dependency issues?** Run `npm install` or delete `node_modules` and install again
- **Environment variables not set?** Double-check your `.env` files

For further help, see [README.md](../../README.md) or ask in your team channel.

## Next Steps

- Explore API endpoints in `fiscalzen-api/src/`
- Work with UI components in `fiscalzen-app/src/components/`
- Review type definitions in `fiscalzen-app/src/types/`
- Write and run tests in `fiscalzen-api/test/` and `fiscalzen-app/src/__tests__/`

---

You’re now ready to start developing with FiscalZenProject! Happy coding.
