-- Assessments and care plans foundation.

CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('due', 'in_progress', 'review', 'complete')),
  score INTEGER,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE care_plans (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  goal TEXT NOT NULL,
  interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome TEXT NOT NULL,
  review_date DATE NOT NULL,
  assigned_staff TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_resident ON assessments(organization_id, facility_id, resident_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_care_plans_resident ON care_plans(organization_id, facility_id, resident_id);
CREATE INDEX idx_care_plans_status ON care_plans(status);
