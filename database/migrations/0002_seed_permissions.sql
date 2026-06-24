-- Base permission keys aligned with src/domain/types.ts.

INSERT INTO permissions (id, key, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'platform:manage', 'Manage platform-wide settings and tenants'),
  ('00000000-0000-0000-0000-000000000002', 'organization:manage', 'Manage organization settings and facilities'),
  ('00000000-0000-0000-0000-000000000003', 'facility:manage', 'Manage facility settings and operations'),
  ('00000000-0000-0000-0000-000000000004', 'resident:read', 'Read resident records within assigned scope'),
  ('00000000-0000-0000-0000-000000000005', 'resident:write', 'Create and update resident records within assigned scope'),
  ('00000000-0000-0000-0000-000000000006', 'medication:manage', 'Manage medication orders and med pass workflows'),
  ('00000000-0000-0000-0000-000000000007', 'assessment:manage', 'Manage assessments and care plans'),
  ('00000000-0000-0000-0000-000000000008', 'billing:manage', 'Manage billing, invoices, payments, credits, and refunds'),
  ('00000000-0000-0000-0000-000000000009', 'communication:manage', 'Manage secure messaging and announcements'),
  ('00000000-0000-0000-0000-000000000010', 'support:manage', 'Manage support tickets and remote assistance'),
  ('00000000-0000-0000-0000-000000000011', 'report:read', 'Read dashboards, analytics, reports, and exports')
ON CONFLICT (key) DO NOTHING;
