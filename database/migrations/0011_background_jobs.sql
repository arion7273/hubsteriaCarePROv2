-- Background job queue foundation.

CREATE TABLE background_jobs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  facility_id UUID REFERENCES facilities(id),
  resident_id UUID REFERENCES residents(id),
  type TEXT NOT NULL CHECK (type IN ('notification', 'print', 'digitalrx_sync', 'ai_generation', 'workflow_action', 'audit_export')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'succeeded', 'failed', 'dead_letter')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT
);

CREATE INDEX idx_background_jobs_queue ON background_jobs(status, priority, available_at);
CREATE INDEX idx_background_jobs_scope ON background_jobs(organization_id, facility_id, resident_id);
