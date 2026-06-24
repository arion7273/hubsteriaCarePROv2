CREATE TABLE IF NOT EXISTS operational_records (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  facility_id uuid REFERENCES facilities(id),
  resident_id uuid REFERENCES residents(id),
  module text NOT NULL,
  record_type text NOT NULL,
  status text NOT NULL,
  title text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_operational_records_scope
  ON operational_records (organization_id, facility_id, resident_id, module, created_at DESC);

ALTER TABLE operational_records
  ADD CONSTRAINT operational_records_module_check
  CHECK (module IN ('notifications', 'print', 'digitalrx', 'workflow', 'ai', 'communication', 'family', 'support', 'integrations'));

ALTER TABLE operational_records
  ADD CONSTRAINT operational_records_status_check
  CHECK (status IN ('draft', 'active', 'queued', 'processing', 'completed', 'failed', 'archived'));
