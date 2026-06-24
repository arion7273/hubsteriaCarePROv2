import type { RegisteredFeature } from '../domain';
import { AuthService, BackendFoundationService, type AccessContext, type BackendRepositories, type UUID } from '../domain';
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

export type CreateFacilityBody = {
  organizationId: UUID;
  name: string;
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

export async function createFacilityHandler(services: ApiServices, request: ApiRequest<CreateFacilityBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createFacility(context, request.body);
  }, 201);
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
