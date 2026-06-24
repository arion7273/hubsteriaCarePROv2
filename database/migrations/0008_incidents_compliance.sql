-- Incidents and compliance foundation.

CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  type TEXT NOT NULL CHECK (type IN ('fall', 'injury', 'medication_error', 'behavioral_event', 'elopement', 'infection_event')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'corrective_action', 'resolved')),
  summary TEXT NOT NULL,
  investigation TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  resolution TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compliance_issues (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID REFERENCES residents(id),
  issue TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'resolved')),
  resolution_link TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_resident ON incidents(organization_id, facility_id, resident_id);
CREATE INDEX idx_incidents_facility ON incidents(organization_id, facility_id, status, severity);
CREATE INDEX idx_compliance_issues_facility ON compliance_issues(organization_id, facility_id, status, severity);
