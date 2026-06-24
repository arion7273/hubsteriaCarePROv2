-- HubsteriaCarePRO multi-tenant foundation schema.
-- Target: PostgreSQL-compatible relational datastore.

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  facility_id UUID REFERENCES facilities(id),
  tier TEXT NOT NULL CHECK (tier IN ('T1', 'T2', 'T2_5', 'T3', 'EMPLOYEE', 'FAMILY', 'RESIDENT')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  primary_facility_id UUID REFERENCES facilities(id),
  email TEXT NOT NULL UNIQUE,
  role_id UUID NOT NULL REFERENCES roles(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  mfa_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_facilities (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, facility_id)
);

CREATE TABLE residents (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  preferred_name TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  room TEXT,
  level_of_care TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'discharged', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feature_registry (
  id UUID PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('registered', 'planned', 'gated')),
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  action TEXT NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  actor_role TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  facility_id UUID REFERENCES facilities(id),
  resident_id UUID REFERENCES residents(id),
  before_state JSONB,
  after_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No UPDATE/DELETE paths should be granted for audit_logs in production.
CREATE INDEX idx_facilities_organization ON facilities(organization_id);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_user_facilities_facility ON user_facilities(facility_id);
CREATE INDEX idx_residents_tenant ON residents(organization_id, facility_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(organization_id, facility_id, resident_id);
CREATE INDEX idx_feature_registry_module ON feature_registry(module);
