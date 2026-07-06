# Financial Tracker (Tally)

> Money, understood.

A personal finance web app that connects bank accounts via [Plaid](https://plaid.com), syncs transactions, and shows income, expenses, category breakdowns, and detected subscriptions — similar to the core analytics experience of Rocket Money.

**Stack:** Next.js 14 · FastAPI · PostgreSQL · Plaid · Google OAuth

---

## Features

- **Google sign-in** — NextAuth on the frontend, JWT issued by the API
- **Plaid account linking** — connect checking, savings, and credit accounts (read-only)
- **Transaction sync** — incremental sync with manual refresh
- **Dashboard** — spending hero, income vs expenses, cash-flow chart, category breakdown
- **Subscriptions** — heuristic detection of recurring charges
- **Transactions page** — search, date filters, pagination

AI chat and agent tooling are **not included in this repository** (see [`.gitignore`](.gitignore)).

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Python | 3.11+ |
| PostgreSQL | 14+ (local instance) |
| npm or pnpm | latest |

**External accounts (free tiers available):**

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — OAuth 2.0 client (Web application), redirect URI `http://localhost:3000/api/auth/callback/google`
2. [Plaid Dashboard](https://dashboard.plaid.com) — app with **Transactions** enabled (start in **Sandbox**)

---

## Project structure

```
├── apps/
│   ├── api/          # FastAPI backend (port 8000)
│   └── web/          # Next.js frontend (port 3000)
├── packages/design/  # Shared CSS design tokens
├── preview/        # Design system HTML specimens
├── ui_kits/        # Mobile/web UI prototypes
└── docker-compose.yml   # Optional Postgres (local Postgres is fine)
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rahulspaghetti/Financial-Tracker.git
cd Financial-Tracker
```

### 2. Database

Create a PostgreSQL database on your local instance:

```bash
createdb tally
# or: psql -c "CREATE DATABASE tally;"
```

### 3. Backend (`apps/api`)

```bash
cd apps/api
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit **`apps/api/.env`**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | e.g. `postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/tally` |
| `JWT_SECRET` | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `PLAID_ENV` | `sandbox` for development |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` | From Plaid Dashboard |
| `PLAID_TOKEN_ENCRYPTION_KEY` | `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` |

Run migrations:

```bash
python -m alembic upgrade head
```

### 4. Frontend (`apps/web`)

```bash
cd apps/web
cp .env.local.example .env.local
```

Edit **`apps/web/.env.local`**:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Same as API |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |

Install dependencies:

```bash
npm install
```

If you see an SSL certificate error on Windows:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
```

---

## Run locally

Open two terminals.

**Terminal 1 — API**

```bash
cd apps/api
.venv\Scripts\activate          # or source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs (when `DEBUG=true`): http://localhost:8000/docs

**Terminal 2 — Web**

```bash
cd apps/web
npm run dev
```

App: http://localhost:3000

### First-time flow

1. Sign in with Google at `/login`
2. Go to **Accounts** → **Connect account**
3. In Plaid Sandbox, use `user_good` / `pass_good`
4. Open **Dashboard** to see spending analytics; **Transactions** for the full list

Use **Sync now** on Accounts to refresh balances and transactions.

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/google` | Exchange Google id_token for JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET` | `/api/v1/users/me` | Current user |
| `POST` | `/api/v1/plaid/link-token` | Plaid Link token |
| `POST` | `/api/v1/plaid/exchange` | Link institution |
| `POST` | `/api/v1/plaid/sync` | Sync all items |
| `GET` | `/api/v1/accounts` | Linked accounts |
| `GET` | `/api/v1/transactions` | Paginated transactions |
| `GET` | `/api/v1/transactions/summary` | Dashboard analytics |
| `GET` | `/api/v1/subscriptions` | Detected recurring charges |

All endpoints except `/auth/*` and `/health` require `Authorization: Bearer <access_token>`.

---

## Optional: Docker Postgres

If you prefer Docker instead of a local Postgres install:

```bash
docker compose up -d postgres
```

Default connection string: `postgresql+asyncpg://tally:tally_dev@localhost:5432/tally`

---

## Design system

Visual tokens live in [`colors_and_type.css`](colors_and_type.css) and [`packages/design/tokens.css`](packages/design/tokens.css). UI prototypes are in `ui_kits/` and `preview/`.

Brand rules: cream canvas (`#FAF7F2`), forest green accent (`#1F4D3F`), Instrument Serif + Geist fonts, Lucide icons at stroke 1.75.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `password authentication failed` | Set `DATABASE_URL` to match your local Postgres user/password |
| Plaid `503` / link token fails | Verify `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV=sandbox` |
| Google sign-in loops | Check `GOOGLE_CLIENT_ID` matches in both `.env` files; redirect URI must include `/api/auth/callback/google` |
| Empty dashboard after linking | Click **Sync now** on Accounts; wait a few seconds and refresh |
| `npm install` SSL error (Windows) | Run with `$env:NODE_OPTIONS="--use-system-ca"` |

---

## License

Private project. All rights reserved.
