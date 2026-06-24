export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'HubsteriaCarePRO API',
    version: '0.1.0',
    description: 'Initial backend API contract for authentication, tenant administration, and feature registry.'
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true
        },
        responses: {
          '200': { description: 'Session and optional MFA challenge' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/mfa/verify': {
      post: {
        summary: 'Verify MFA',
        requestBody: {
          required: true
        },
        responses: {
          '200': { description: 'Verified session' },
          '401': { description: 'Invalid or expired MFA challenge' }
        }
      }
    },
    '/auth/logout': {
      post: {
        summary: 'Logout',
        security: [{ session: [] }],
        responses: {
          '200': { description: 'Revoked session' },
          '401': { description: 'Missing or invalid session' }
        }
      }
    },
    '/auth/password-reset': {
      post: {
        summary: 'Request password reset',
        requestBody: {
          required: true
        },
        responses: {
          '200': { description: 'Password reset request created' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/organizations': {
      post: {
        summary: 'Create organization',
        security: [{ session: [] }],
        responses: {
          '201': { description: 'Organization created' },
          '403': { description: 'Insufficient permissions' }
        }
      }
    },
    '/facilities': {
      post: {
        summary: 'Create facility',
        security: [{ session: [] }],
        responses: {
          '201': { description: 'Facility created' },
          '403': { description: 'Insufficient permissions or tenant mismatch' }
        }
      }
    },
    '/feature-registry': {
      get: {
        summary: 'List features',
        security: [{ session: [] }],
        responses: {
          '200': { description: 'Registered feature list' }
        }
      },
      post: {
        summary: 'Register feature',
        security: [{ session: [] }],
        responses: {
          '201': { description: 'Feature registered' },
          '400': { description: 'Invalid feature registration' }
        }
      }
    },
    '/residents': {
      get: {
        summary: 'List residents by facility',
        security: [{ session: [] }],
        responses: {
          '200': { description: 'Resident list' },
          '403': { description: 'Insufficient permissions or tenant mismatch' }
        }
      },
      post: {
        summary: 'Create resident',
        security: [{ session: [] }],
        requestBody: {
          required: true
        },
        responses: {
          '201': { description: 'Resident created' },
          '403': { description: 'Insufficient permissions or tenant mismatch' }
        }
      },
      patch: {
        summary: 'Update resident',
        security: [{ session: [] }],
        requestBody: {
          required: true
        },
        responses: {
          '200': { description: 'Resident updated' },
          '404': { description: 'Resident not found' }
        }
      }
    },
    '/residents/get': {
      get: {
        summary: 'Get resident by ID',
        security: [{ session: [] }],
        responses: {
          '200': { description: 'Resident record' },
          '404': { description: 'Resident not found' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'List users by organization',
        security: [{ session: [] }],
        responses: {
          '200': { description: 'User list' },
          '403': { description: 'Insufficient permissions or tenant mismatch' }
        }
      },
      post: {
        summary: 'Create user',
        security: [{ session: [] }],
        requestBody: {
          required: true
        },
        responses: {
          '201': { description: 'User created' },
          '403': { description: 'Insufficient permissions or tenant mismatch' }
        }
      },
      patch: {
        summary: 'Update user',
        security: [{ session: [] }],
        requestBody: {
          required: true
        },
        responses: {
          '200': { description: 'User updated' },
          '404': { description: 'User not found' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      session: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Session-Id'
      }
    }
  }
} as const;
