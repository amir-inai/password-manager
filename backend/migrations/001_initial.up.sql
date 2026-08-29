-- Initial migration for password manager vault

CREATE TABLE IF NOT EXISTS vault_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    encrypted_password BLOB NOT NULL,
    encrypted_url BLOB,
    encrypted_notes BLOB,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vault_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vault_entries_created_at ON vault_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_vault_entries_category ON vault_entries(category);
