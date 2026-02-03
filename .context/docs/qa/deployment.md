# Deployment Guide

This guide describes how to deploy the FiscalZen Project, including both the frontend (`fiscalzen-app`) and backend (`fiscalzen-api`) components. The project is Docker-ready and provides Dockerfiles and a `docker-compose.yml` for streamlined setup.

---

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (if running multi-container setup)
- Required environment variables and secrets configured (see notes below)

---

## Quick Start: Using Docker Compose

The recommended way to deploy both the API and app is via Docker Compose, which manages networking and configuration automatically.

### 1. Build and Run with Docker Compose

From the root of the repository (where `docker-compose.yml` is located):

```bash
docker-compose up --build
```

This will:
- Build and start the **API** server (`fiscalzen-api`)
- Build and start the **Frontend** application (`fiscalzen-app`)
- Expose the relevant ports (see your `docker-compose.yml` for details)

### 2. Accessing the Applications

- **Frontend**: Typically available at [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: Port as defined in the Docker or Compose config, commonly at [http://localhost:3333](http://localhost:3333)

---

## Manual: Build & Run Containers Separately

You may also build and run each service independently.

### a. Backend (fiscalzen-api)

```bash
cd fiscalzen-api
docker build -t fiscalzen-api .
docker run -p 3333:3333 fiscalzen-api
```

### b. Frontend (fiscalzen-app)

```bash
cd fiscalzen-app
docker build -t fiscalzen-app .
docker run -p 3000:3000 fiscalzen-app
```

---

## Configuration

- **Environment Variables**: Adjust the `.env` files in each subproject directory (if present) or set variables via the Docker Compose file as appropriate for your environment.
- **Persistence**: If your application uses a database, ensure the service is provided via Docker Compose or is accessible from inside the containers.
- **Volumes**: Map any necessary volumes defined in `docker-compose.yml` for persistent storage/logs.

---

## Production Notes

- Adjust environment variables for production (disable debugging, set secure credentials).
- For secure deployments, consider using a reverse proxy like Nginx for HTTPS.
- Monitor and scale containers as needed.

---

## Troubleshooting

- **Port Conflicts**: Make sure host ports (`3000`, `3333`, etc.) are free.
- **Network Issues**: If containers can't communicate, check the Docker network.
- **Logs**: Use `docker-compose logs` or `docker logs <container_name>` to review application output.
- **Rebuild**: Use `docker-compose build --no-cache` to force a rebuild if changes are not picked up.

---

## Example: Full Lifecycle

```bash
# Start all services
docker-compose up --build

# (In another terminal)
# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## References

- [Docker Overview](https://docs.docker.com/get-started/overview/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

If you have custom needs or run into issues, consult the README in the relevant subdirectory or check for `.env.example` files to understand required configs.
