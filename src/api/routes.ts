import type { HttpMethod } from './http';

export type ApiRouteDefinition = {
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  description: string;
};

export const apiRoutes: ApiRouteDefinition[] = [
  {
    method: 'POST',
    path: '/auth/login',
    authRequired: false,
    description: 'Login and create session/MFA challenge'
  },
  {
    method: 'POST',
    path: '/auth/mfa/verify',
    authRequired: false,
    description: 'Verify MFA challenge and mark session verified'
  },
  {
    method: 'POST',
    path: '/auth/logout',
    authRequired: true,
    description: 'Revoke active session'
  },
  {
    method: 'POST',
    path: '/auth/password-reset',
    authRequired: false,
    description: 'Create password reset request'
  },
  {
    method: 'POST',
    path: '/organizations',
    authRequired: true,
    description: 'Create organization'
  },
  {
    method: 'GET',
    path: '/organizations',
    authRequired: true,
    description: 'List organizations'
  },
  {
    method: 'GET',
    path: '/organizations/get',
    authRequired: true,
    description: 'Get organization by ID'
  },
  {
    method: 'PATCH',
    path: '/organizations',
    authRequired: true,
    description: 'Update organization'
  },
  {
    method: 'POST',
    path: '/facilities',
    authRequired: true,
    description: 'Create facility'
  },
  {
    method: 'GET',
    path: '/facilities',
    authRequired: true,
    description: 'List facilities by organization'
  },
  {
    method: 'GET',
    path: '/facilities/get',
    authRequired: true,
    description: 'Get facility by ID'
  },
  {
    method: 'PATCH',
    path: '/facilities',
    authRequired: true,
    description: 'Update facility'
  },
  {
    method: 'POST',
    path: '/feature-registry',
    authRequired: true,
    description: 'Register feature'
  },
  {
    method: 'GET',
    path: '/feature-registry',
    authRequired: true,
    description: 'List registered features'
  },
  {
    method: 'POST',
    path: '/residents',
    authRequired: true,
    description: 'Create resident'
  },
  {
    method: 'GET',
    path: '/residents',
    authRequired: true,
    description: 'List residents by facility'
  },
  {
    method: 'GET',
    path: '/residents/get',
    authRequired: true,
    description: 'Get resident by ID'
  },
  {
    method: 'PATCH',
    path: '/residents',
    authRequired: true,
    description: 'Update resident'
  },
  {
    method: 'POST',
    path: '/users',
    authRequired: true,
    description: 'Create user'
  },
  {
    method: 'GET',
    path: '/users',
    authRequired: true,
    description: 'List users by organization'
  },
  {
    method: 'PATCH',
    path: '/users',
    authRequired: true,
    description: 'Update user'
  },
  {
    method: 'POST',
    path: '/incidents',
    authRequired: true,
    description: 'Create incident'
  },
  {
    method: 'GET',
    path: '/incidents',
    authRequired: true,
    description: 'List incidents by resident or facility'
  },
  {
    method: 'PATCH',
    path: '/incidents',
    authRequired: true,
    description: 'Update incident'
  },
  {
    method: 'POST',
    path: '/compliance-issues',
    authRequired: true,
    description: 'Create compliance issue'
  },
  {
    method: 'GET',
    path: '/compliance-issues',
    authRequired: true,
    description: 'List compliance issues by facility'
  }
];
