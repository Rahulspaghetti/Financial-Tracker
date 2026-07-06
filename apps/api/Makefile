.PHONY: dev migrate migrate-down test lint format install

# ── Setup ─────────────────────────────────────────────────────────────────────

install:
	python -m pip install -r requirements.txt

# ── Development server ────────────────────────────────────────────────────────

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ── Database migrations ───────────────────────────────────────────────────────

# Create a new migration (usage: make migration name="add users table")
migration:
	alembic revision --autogenerate -m "$(name)"

migrate:
	alembic upgrade head

migrate-down:
	alembic downgrade -1

migrate-history:
	alembic history --verbose

# ── Testing ───────────────────────────────────────────────────────────────────

test:
	pytest -v

test-cov:
	pytest --cov=app --cov-report=term-missing -v

# ── Linting / formatting ──────────────────────────────────────────────────────

lint:
	ruff check app/

format:
	ruff format app/
	ruff check --fix app/
