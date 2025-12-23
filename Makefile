.PHONY: dev build up down logs logs-backend logs-frontend shell-backend shell-frontend clean restart help

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

## help: Show this help message
help:
	@echo "$(CYAN)VeloApp - Available Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@echo "  make dev              Start all services in development mode (with hot reload)"
	@echo ""
	@echo "$(GREEN)Production:$(RESET)"
	@echo "  make build            Build all containers"
	@echo "  make up               Start all services in production mode"
	@echo "  make down             Stop all services"
	@echo "  make restart          Restart all services"
	@echo ""
	@echo "$(GREEN)Logs:$(RESET)"
	@echo "  make logs             Tail logs for all services"
	@echo "  make logs-backend     Tail backend logs only"
	@echo "  make logs-frontend    Tail frontend logs only"
	@echo ""
	@echo "$(GREEN)Shell Access:$(RESET)"
	@echo "  make shell-backend    Open a shell in the backend container"
	@echo "  make shell-frontend   Open a shell in the frontend container"
	@echo ""
	@echo "$(GREEN)Cleanup:$(RESET)"
	@echo "  make clean            Remove all containers, volumes, and images"

## dev: Start all services in development mode with hot reloading
dev:
	@echo "$(CYAN)Starting services in development mode...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Copying from .env.example...$(RESET)"; \
		cp .env.example .env; \
	fi
	docker compose up --build

## build: Build all containers
build:
	@echo "$(CYAN)Building all containers...$(RESET)"
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

## up: Start all services in production mode
up:
	@echo "$(CYAN)Starting services in production mode...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Copying from .env.example...$(RESET)"; \
		cp .env.example .env; \
	fi
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

## down: Stop all services
down:
	@echo "$(CYAN)Stopping all services...$(RESET)"
	docker compose down

## logs: Tail logs for all services
logs:
	docker compose logs -f

## logs-backend: Tail backend logs only
logs-backend:
	docker compose logs -f backend

## logs-frontend: Tail frontend logs only
logs-frontend:
	docker compose logs -f frontend

## shell-backend: Open a shell in the backend container
shell-backend:
	docker compose exec backend /bin/bash || docker compose exec backend /bin/sh

## shell-frontend: Open a shell in the frontend container
shell-frontend:
	docker compose exec frontend /bin/sh

## clean: Remove all containers, volumes, and images
clean:
	@echo "$(YELLOW)Warning: This will remove all containers, volumes, and images for this project.$(RESET)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(RESET)"
	@sleep 5
	@echo "$(CYAN)Removing containers and volumes...$(RESET)"
	docker compose down -v --rmi local --remove-orphans
	@echo "$(GREEN)Cleanup complete.$(RESET)"

## restart: Restart all services
restart:
	@echo "$(CYAN)Restarting all services...$(RESET)"
	docker compose restart
