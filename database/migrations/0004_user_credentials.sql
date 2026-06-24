-- Secure credential storage. Stores password hashes only; never plain-text passwords.

CREATE TABLE user_credentials (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_credentials_updated_at ON user_credentials(updated_at);
