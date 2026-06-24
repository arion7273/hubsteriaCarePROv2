import type { RegisteredFeature } from '../domain';
import { AuthService, BackendFoundationService, type AccessContext, type BackendRepositories, type Facility, type Organization, type Resident, type User, type UUID } from '../domain';
import type { ApiRequest, ApiResponse } from './http';
import { fail, ok, toApiResponse } from './http';

export type ApiServices = {
  auth: AuthService;
  backend: BackendFoundationService;
  repositories: BackendRepositories;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type VerifyMfaBody = {
  sessionId: UUID;
  challengeId: UUID;
  code: string;
};

export type CreateOrganizationBody = {
  name: string;
};

export type UpdateOrganizationBody = {
  organizationId: UUID;
  updates: Partial<Omit<Organization, 'id'>>;
};

export type CreateFacilityBody = {
  organizationId: UUID;
  name: string;
};

export type UpdateFacilityBody = {
  facilityId: UUID;
  updates: Partial<Omit<Facility, 'id' | 'organizationId'>>;
};

export type CreateResidentBody = Omit<Resident, 'id' | 'status'>;

export type UpdateResidentBody = {
  residentId: UUID;
  updates: Partial<Omit<Resident, 'id' | 'organizationId' | 'facilityId'>>;
};

export type CreateUserBody = Omit<User, 'id' | 'status'>;

export type UpdateUserBody = {
  userId: UUID;
  updates: Partial<Omit<User, 'id'>>;
};

export async function loginHandler(services: ApiServices, request: ApiRequest<LoginBody>): Promise<ApiResponse> {
  return toApiResponse(async () => {
    assertBody(request.body);
    return services.auth.login(request.body);
  });
}

export async function verifyMfaHandler(services: ApiServices, request: ApiRequest<VerifyMfaBody>): Promise<ApiResponse> {
  return toApiResponse(async () => {
    assertBody(request.body);
    return services.auth.verifyMfa(request.body);
  });
}

export async function logoutHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  if (!request.sessionId) {
    return fail('missing_session', 'Session is required', 401);
  }

  return toApiResponse(async () => services.auth.logout(request.sessionId as UUID));
}

export async function passwordResetHandler(services: ApiServices, request: ApiRequest<{ email: string }>): Promise<ApiResponse> {
  return toApiResponse(async () => {
    assertBody(request.body);
    return services.auth.requestPasswordReset(request.body.email);
  });
}

export async function createOrganizationHandler(
  services: ApiServices,
  request: ApiRequest<CreateOrganizationBody>
): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createOrganization(context, request.body);
  }, 201);
}

export async function listOrganizationsHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => services.backend.listOrganizations(context));
}

export async function getOrganizationHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const organizationId = request.query?.organizationId;

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    return services.backend.getOrganization(context, organizationId);
  });
}

export async function updateOrganizationHandler(services: ApiServices, request: ApiRequest<UpdateOrganizationBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.updateOrganization(context, request.body.organizationId, request.body.updates);
  });
}

export async function createFacilityHandler(services: ApiServices, request: ApiRequest<CreateFacilityBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createFacility(context, request.body);
  }, 201);
}

export async function listFacilitiesHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const organizationId = request.query?.organizationId;

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    return services.backend.listFacilitiesByOrganization(context, organizationId);
  });
}

export async function getFacilityHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const facilityId = request.query?.facilityId;

    if (!facilityId) {
      throw new Error('facilityId is required');
    }

    return services.backend.getFacility(context, facilityId);
  });
}

export async function updateFacilityHandler(services: ApiServices, request: ApiRequest<UpdateFacilityBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.updateFacility(context, request.body.facilityId, request.body.updates);
  });
}

export async function registerFeatureHandler(services: ApiServices, request: ApiRequest<RegisteredFeature>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.registerFeature(context, request.body);
  }, 201);
}

export async function listFeaturesHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async () => services.repositories.featureRegistry.list());
}

export async function createResidentHandler(services: ApiServices, request: ApiRequest<CreateResidentBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createResident(context, request.body);
  }, 201);
}

export async function listResidentsHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const organizationId = request.query?.organizationId;
    const facilityId = request.query?.facilityId;

    if (!organizationId || !facilityId) {
      throw new Error('organizationId and facilityId are required');
    }

    return services.backend.listResidentsByFacility(context, { organizationId, facilityId });
  });
}

export async function getResidentHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const residentId = request.query?.residentId;

    if (!residentId) {
      throw new Error('residentId is required');
    }

    return services.backend.getResident(context, residentId);
  });
}

export async function updateResidentHandler(services: ApiServices, request: ApiRequest<UpdateResidentBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.updateResident(context, request.body.residentId, request.body.updates);
  });
}

export async function createUserHandler(services: ApiServices, request: ApiRequest<CreateUserBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createUser(context, request.body);
  }, 201);
}

export async function listUsersHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const organizationId = request.query?.organizationId;

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    return services.backend.listUsersByOrganization(context, organizationId);
  });
}

export async function updateUserHandler(services: ApiServices, request: ApiRequest<UpdateUserBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.updateUser(context, request.body.userId, request.body.updates);
  });
}

export async function resolveContext(services: ApiServices, sessionId: UUID | undefined): Promise<AccessContext> {
  if (!sessionId) {
    throw new Error('Session is required');
  }

  const session = await services.repositories.authSessions.getById(sessionId);

  if (!session || session.revokedAt || Date.parse(session.expiresAt) < Date.now()) {
    throw new Error('Session expired');
  }

  if (!session.mfaVerified) {
    throw new Error('MFA verification required');
  }

  const user = await services.repositories.users.getById(session.userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    user,
    activeOrganizationId: user.organizationId,
    activeFacilityId: user.facilityIds[0]
  };
}

async function withContext<TData>(
  services: ApiServices,
  request: ApiRequest,
  handler: (context: AccessContext) => Promise<TData>,
  successStatus = 200
): Promise<ApiResponse<TData>> {
  return toApiResponse(async () => handler(await resolveContext(services, request.sessionId)), successStatus);
}

function assertBody<TBody>(body: TBody | undefined): asserts body is TBody {
  if (!body) {
    throw new Error('Request body is required');
  }
}
