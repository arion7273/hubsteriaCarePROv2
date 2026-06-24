-- Billing and financial operations foundation.

CREATE TABLE billing_charges (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  type TEXT NOT NULL CHECK (type IN ('recurring', 'level_of_care', 'move_in', 'move_out', 'ancillary')),
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'posted', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  invoice_number TEXT NOT NULL UNIQUE,
  balance_cents INTEGER NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'posted', 'paid', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  invoice_id UUID REFERENCES invoices(id),
  type TEXT NOT NULL CHECK (type IN ('payment', 'credit', 'refund')),
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  posted_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_charges_resident ON billing_charges(organization_id, facility_id, resident_id);
CREATE INDEX idx_invoices_resident ON invoices(organization_id, facility_id, resident_id, status);
CREATE INDEX idx_payment_transactions_resident ON payment_transactions(organization_id, facility_id, resident_id, posted_at);
