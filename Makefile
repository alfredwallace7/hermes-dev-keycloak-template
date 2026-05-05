.PHONY: help install backend-install frontend-install dev backend-dev frontend-dev build db-init seed clean

ADMIN_EMAIL ?= natprocess.ai@gmail.com
PYTHON ?= python
PIP ?= pip
BUN ?= bun

help:
	@echo "Available targets:"
	@echo "  make install                         Install backend and frontend dependencies"
	@echo "  make backend-install                 Install Python backend dependencies"
	@echo "  make frontend-install                Install frontend dependencies"
	@echo "  make dev                             Run backend and frontend dev servers"
	@echo "  make backend-dev                     Run the FastAPI backend on :8000"
	@echo "  make frontend-dev                    Run the Vite frontend"
	@echo "  make build                           Build the frontend"
	@echo "  make db-init ADMIN_EMAIL=user@host    Initialize SQLite and seed admin user"
	@echo "  make seed ADMIN_EMAIL=user@host       Alias for db-init"
	@echo "  make clean                           Remove generated local artifacts"

install: backend-install frontend-install

backend-install:
	$(PIP) install -r backend/requirements.txt

frontend-install:
	cd frontend && $(BUN) install

dev:
	$(MAKE) -j2 backend-dev frontend-dev

backend-dev:
	cd backend && set "ADMIN_EMAIL=$(ADMIN_EMAIL)" && $(PYTHON) -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

frontend-dev:
	cd frontend && $(BUN) run dev

build:
	cd frontend && $(BUN) run build

db-init:
	cd backend && set "ADMIN_EMAIL=$(ADMIN_EMAIL)" && $(PYTHON) -c "from database import init_db; init_db(); print('Seeded admin:', '$(ADMIN_EMAIL)')"

seed: db-init

clean:
	powershell -NoProfile -Command "Remove-Item -Recurse -Force frontend/dist, backend/users.db -ErrorAction SilentlyContinue"
