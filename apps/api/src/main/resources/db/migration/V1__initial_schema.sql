-- Initial schema (ported from Python Alembic 001_initial)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(1024),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id);

CREATE TABLE IF NOT EXISTS plaid_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plaid_item_id VARCHAR(255) NOT NULL UNIQUE,
    access_token_encrypted TEXT NOT NULL,
    institution_id VARCHAR(255),
    institution_name VARCHAR(255),
    cursor VARCHAR(512),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_plaid_items_user_id ON plaid_items (user_id);
CREATE INDEX IF NOT EXISTS ix_plaid_items_plaid_item_id ON plaid_items (plaid_item_id);

CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    plaid_account_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plaid_item_id VARCHAR(36) NOT NULL REFERENCES plaid_items (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    official_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    subtype VARCHAR(50),
    balance_current NUMERIC(15, 2) NOT NULL DEFAULT 0,
    balance_available NUMERIC(15, 2),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    institution_name VARCHAR(255),
    institution_logo VARCHAR(1024),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_accounts_plaid_account_id ON accounts (plaid_account_id);
CREATE INDEX IF NOT EXISTS ix_accounts_user_id ON accounts (user_id);
CREATE INDEX IF NOT EXISTS ix_accounts_plaid_item_id ON accounts (plaid_item_id);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    plaid_transaction_id VARCHAR(255) UNIQUE,
    account_id VARCHAR(36) NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'debit',
    name VARCHAR(512) NOT NULL,
    merchant_name VARCHAR(255),
    category VARCHAR(100),
    category_id VARCHAR(36),
    date DATE NOT NULL,
    pending BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    logo_url VARCHAR(1024),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_transactions_plaid_transaction_id ON transactions (plaid_transaction_id);
CREATE INDEX IF NOT EXISTS ix_transactions_account_id ON transactions (account_id);
CREATE INDEX IF NOT EXISTS ix_transactions_category ON transactions (category);
CREATE INDEX IF NOT EXISTS ix_transactions_category_id ON transactions (category_id);
CREATE INDEX IF NOT EXISTS ix_transactions_date ON transactions (date);
CREATE INDEX IF NOT EXISTS ix_transactions_merchant_name ON transactions (merchant_name);
