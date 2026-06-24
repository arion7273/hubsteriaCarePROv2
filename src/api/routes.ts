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
    method: 'POST',
    path: '/facilities',
    authRequired: true,
    description: 'Create facility'
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
  }
];
