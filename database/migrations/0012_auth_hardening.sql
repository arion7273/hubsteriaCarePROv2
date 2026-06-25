CREATE TABLE IF NOT EXISTS account_security_states (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_failed_at timestamptz,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_security_locked_until
  ON account_security_states (locked_until);
