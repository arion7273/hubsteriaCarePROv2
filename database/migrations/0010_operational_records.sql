-- Generic operational records for integration, communication, family portal, workflow, academy, support, executive, AI, print, and notification modules.

CREATE TABLE operational_records (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID REFERENCES facilities(id),
  resident_id UUID REFERENCES residents(id),
  module TEXT NOT NULL CHECK (module IN ('digitalrx', 'communication', 'family_portal', 'workflow', 'academy', 'support', 'executive', 'ai', 'print', 'notification')),
  record_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'active', 'resolved', 'archived', 'error')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_operational_records_module ON operational_records(organization_id, module, status);
CREATE INDEX idx_operational_records_resident ON operational_records(organization_id, facility_id, resident_id, module);
