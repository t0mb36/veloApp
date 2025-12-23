# VeloApp

Web application for private sports lesson coaching.

A full-stack application with a React frontend (Vite + TypeScript) and FastAPI backend, orchestrated with Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Make (usually pre-installed on macOS/Linux)

## Quick Start

1. **Clone the repository and navigate to the project root**

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to customize settings if needed.

3. **Start the development environment**
   ```bash
   make dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Available Commands

Run `make help` to see all available commands:

### Development

| Command | Description |
|---------|-------------|
| `make dev` | Start all services in development mode with hot reloading |

### Production

| Command | Description |
|---------|-------------|
| `make build` | Build all containers for production |
| `make up` | Start all services in production mode (detached) |
| `make down` | Stop all services |
| `make restart` | Restart all services |

### Logs

| Command | Description |
|---------|-------------|
| `make logs` | Tail logs for all services |
| `make logs-backend` | Tail backend logs only |
| `make logs-frontend` | Tail frontend logs only |

### Shell Access

| Command | Description |
|---------|-------------|
| `make shell-backend` | Open a shell in the backend container |
| `make shell-frontend` | Open a shell in the frontend container |

### Cleanup

| Command | Description |
|---------|-------------|
| `make clean` | Remove all containers, volumes, and images |

## Project Structure

```
veloApp/
├── backend/                 # FastAPI backend
│   ├── app/                 # Application code
│   ├── Dockerfile           # Production & development Dockerfile
│   └── requirements.txt     # Python dependencies
├── frontend/                # React frontend (Vite)
│   ├── src/                 # Source code
│   ├── Dockerfile           # Production Dockerfile (nginx)
│   └── Dockerfile.dev       # Development Dockerfile (vite dev server)
├── docker-compose.yml       # Production compose configuration
├── docker-compose.override.yml  # Development overrides (auto-loaded)
├── .env.example             # Environment variables template
├── Makefile                 # Build and management commands
└── README.md                # This file
```

## Architecture

### Services

- **frontend**: React application served by nginx (production) or Vite dev server (development)
- **backend**: FastAPI application running on uvicorn
- **db**: PostgreSQL 15 database

### Development Features

- Hot reloading for both frontend and backend
- Source code mounted as volumes for instant updates
- Development database with persistent volume

### Production Features

- Multi-stage builds for optimized images
- Health checks for all services
- Automatic service dependency management
- Named volumes for data persistence

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `velo` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `velopassword` |
| `POSTGRES_DB` | PostgreSQL database name | `velodb` |
| `APP_NAME` | Application name | `VeloApp API` |
| `DEBUG` | Enable debug mode | `false` |
| `API_PREFIX` | API route prefix | `/api` |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:3000"]` |
| `FRONTEND_PORT` | Frontend exposed port | `3000` |
| `BACKEND_PORT` | Backend exposed port | `8000` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:8000` |

## Troubleshooting

### Database connection issues
If the backend fails to connect to the database, ensure the `db` service is healthy:
```bash
docker compose ps
```

### Hot reload not working
For frontend, ensure the `src` directory is properly mounted. For backend, the `app` directory should be mounted.

### Port conflicts
If ports 3000 or 8000 are in use, modify `FRONTEND_PORT` or `BACKEND_PORT` in `.env`.

### Clean restart
If things get into a bad state:
```bash
make clean
make dev
```
