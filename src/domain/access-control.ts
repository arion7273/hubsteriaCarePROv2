import type { AccessContext, AccessDecision, Permission, ResourceScope, RoleTier } from './types';

const roleBasePermissions: Record<RoleTier, Permission[]> = {
  T1: ['platform:manage', 'organization:manage', 'facility:manage', 'resident:read', 'resident:write', 'report:read'],
  T2: ['organization:manage', 'facility:manage', 'resident:read', 'resident:write', 'report:read'],
  T2_5: ['facility:manage', 'resident:read', 'resident:write', 'report:read'],
  T3: ['facility:manage', 'resident:read', 'resident:write', 'report:read'],
  EMPLOYEE: ['resident:read'],
  FAMILY: ['resident:read'],
  RESIDENT: ['resident:read']
};

export function rolePermissions(roleTier: RoleTier): Permission[] {
  return roleBasePermissions[roleTier];
}

export function hasPermission(context: AccessContext, permission: Permission): boolean {
  const inherited = rolePermissions(context.user.roleTier);
  return inherited.includes(permission) || context.user.permissions.includes(permission);
}

export function canAccessScope(context: AccessContext, resource: ResourceScope): AccessDecision {
  const { user } = context;

  if (user.status !== 'active') {
    return deny('User is not active');
  }

  if (user.roleTier === 'T1') {
    return allow('T1 platform scope');
  }

  if (resource.scope === 'platform') {
    return deny('Only T1 can access platform scope');
  }

  if (!resource.organizationId) {
    return deny('Resource organization is required');
  }

  if (user.organizationId !== resource.organizationId) {
    return deny('Cross-organization access denied');
  }

  if (user.roleTier === 'T2') {
    return allow('T2 organization scope');
  }

  if (resource.scope === 'organization') {
    return deny('Only T1/T2 can access organization scope');
  }

  if (user.roleTier === 'FAMILY' || user.roleTier === 'RESIDENT') {
    if (resource.scope !== 'resident' || !resource.residentId) {
      return deny('Resident-specific access required');
    }

    if (!user.residentIds?.includes(resource.residentId)) {
      return deny('Cross-resident access denied');
    }

    return allow('Resident-scoped portal access');
  }

  if (!resource.facilityId) {
    return deny('Resource facility is required');
  }

  if (!user.facilityIds.includes(resource.facilityId)) {
    return deny('Cross-facility access denied');
  }

  return allow('Facility-scoped access');
}

export function requirePermission(
  context: AccessContext,
  resource: ResourceScope,
  permission: Permission
): AccessDecision {
  const scopeDecision = canAccessScope(context, resource);

  if (!scopeDecision.allowed) {
    return scopeDecision;
  }

  if (!hasPermission(context, permission)) {
    return deny(`Missing permission: ${permission}`);
  }

  return allow(`Permission granted: ${permission}`);
}

function allow(reason: string): AccessDecision {
  return { allowed: true, reason };
}

function deny(reason: string): AccessDecision {
  return { allowed: false, reason };
}
