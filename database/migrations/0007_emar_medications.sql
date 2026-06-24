-- eMAR and medication management foundation.

CREATE TABLE medication_orders (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route TEXT NOT NULL,
  schedule TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'future', 'prn', 'discontinued', 'hold')),
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medication_administrations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  medication_order_id UUID NOT NULL REFERENCES medication_orders(id),
  action TEXT NOT NULL CHECK (action IN ('given', 'refused', 'held', 'resident_absent', 'not_available')),
  reason TEXT,
  outcome TEXT,
  administered_at TIMESTAMPTZ NOT NULL,
  administered_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medication_orders_resident ON medication_orders(organization_id, facility_id, resident_id);
CREATE INDEX idx_medication_orders_status ON medication_orders(status);
CREATE INDEX idx_medication_administrations_resident ON medication_administrations(organization_id, facility_id, resident_id, administered_at);
