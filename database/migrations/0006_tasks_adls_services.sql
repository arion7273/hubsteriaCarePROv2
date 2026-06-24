-- Tasks, ADLs, and service plans foundation.

CREATE TABLE care_tasks (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('one_time', 'daily', 'weekly', 'monthly', 'custom_recurring')),
  due_at TIMESTAMPTZ NOT NULL,
  assigned_staff TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('due', 'overdue', 'complete', 'missed', 'unassigned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE adl_entries (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  category TEXT NOT NULL,
  outcome TEXT NOT NULL,
  note TEXT,
  recorded_at TIMESTAMPTZ NOT NULL,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_plans (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  service TEXT NOT NULL,
  schedule TEXT NOT NULL,
  assigned_staff TEXT NOT NULL,
  exceptions TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_tasks_resident ON care_tasks(organization_id, facility_id, resident_id);
CREATE INDEX idx_care_tasks_status ON care_tasks(status, due_at);
CREATE INDEX idx_adl_entries_resident ON adl_entries(organization_id, facility_id, resident_id, recorded_at);
CREATE INDEX idx_service_plans_resident ON service_plans(organization_id, facility_id, resident_id);
