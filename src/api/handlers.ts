import type { RegisteredFeature } from '../domain';
import {
  AuthService,
  BackendFoundationService,
  type AccessContext,
  type AdlEntry,
  type AiGenerationJobInput,
  type Assessment,
  type BackgroundJob,
  type BackendRepositories,
  type CarePlan,
  type CareTask,
  type DigitalRxSyncJobInput,
  type Facility,
  type NotificationJobInput,
  type Organization,
  type PrintJobInput,
  type Resident,
  type ServicePlanRecord,
  type User,
  type UUID,
  type WorkflowActionJobInput
} from '../domain';
import type { ApiRequest, ApiResponse } from './http';
import { fail, ok, toApiResponse } from './http';

export type ApiServices = {
  auth: AuthService;
  backend: BackendFoundationService;
  repositories: BackendRepositories;
  now?: () => Date;
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

export type EnqueueBackgroundJobBody = Omit<BackgroundJob, 'id' | 'status' | 'attempts' | 'createdAt' | 'updatedAt'>;
export type FailBackgroundJobBody = { jobId: UUID; error: string };
export type CompleteBackgroundJobBody = { jobId: UUID };
export type EnqueueNotificationJobBody = NotificationJobInput;
export type EnqueuePrintJobBody = PrintJobInput;
export type EnqueueDigitalRxSyncJobBody = DigitalRxSyncJobInput;
export type EnqueueAiGenerationJobBody = AiGenerationJobInput;
export type EnqueueWorkflowActionJobBody = WorkflowActionJobInput;
export type CreateAssessmentBody = Omit<Assessment, 'id'>;
export type CreateCarePlanBody = Omit<CarePlan, 'id'>;
export type CreateCareTaskBody = Omit<CareTask, 'id'>;
export type CompleteCareTaskBody = { taskId: UUID };
export type LogAdlBody = Omit<AdlEntry, 'id' | 'recordedAt' | 'recordedBy'>;
export type CreateServicePlanBody = Omit<ServicePlanRecord, 'id'>;

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

export async function enqueueBackgroundJobHandler(services: ApiServices, request: ApiRequest<EnqueueBackgroundJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.enqueueBackgroundJob(context, request.body);
  }, 201);
}

export async function leaseBackgroundJobsHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => services.backend.leaseQueuedJobs(context, Number(request.query?.limit ?? 10)));
}

export async function completeBackgroundJobHandler(services: ApiServices, request: ApiRequest<CompleteBackgroundJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.completeBackgroundJob(context, request.body.jobId);
  });
}

export async function failBackgroundJobHandler(services: ApiServices, request: ApiRequest<FailBackgroundJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.failBackgroundJob(context, request.body.jobId, request.body.error);
  });
}

export async function listBackgroundJobsHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) =>
    services.backend.listBackgroundJobsByScope(context, {
      organizationId: request.query?.organizationId,
      facilityId: request.query?.facilityId,
      residentId: request.query?.residentId
    })
  );
}

export async function enqueueNotificationJobHandler(services: ApiServices, request: ApiRequest<EnqueueNotificationJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.enqueueNotificationJob(context, request.body);
  }, 201);
}

export async function enqueuePrintJobHandler(services: ApiServices, request: ApiRequest<EnqueuePrintJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.enqueuePrintJob(context, request.body);
  }, 201);
}

export async function enqueueDigitalRxSyncJobHandler(services: ApiServices, request: ApiRequest<EnqueueDigitalRxSyncJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.enqueueDigitalRxSyncJob(context, request.body);
  }, 201);
}

export async function enqueueAiGenerationJobHandler(services: ApiServices, request: ApiRequest<EnqueueAiGenerationJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.enqueueAiGenerationJob(context, request.body);
  }, 201);
}

export async function enqueueWorkflowActionJobHandler(services: ApiServices, request: ApiRequest<EnqueueWorkflowActionJobBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.enqueueWorkflowActionJob(context, request.body);
  }, 201);
}

export async function createAssessmentHandler(services: ApiServices, request: ApiRequest<CreateAssessmentBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createAssessment(context, request.body);
  }, 201);
}

export async function listAssessmentsHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const residentId = request.query?.residentId;

    if (!residentId) {
      throw new Error('residentId is required');
    }

    return services.backend.listAssessmentsByResident(context, residentId);
  });
}

export async function createCarePlanHandler(services: ApiServices, request: ApiRequest<CreateCarePlanBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createCarePlan(context, request.body);
  }, 201);
}

export async function listCarePlansHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const residentId = request.query?.residentId;

    if (!residentId) {
      throw new Error('residentId is required');
    }

    return services.backend.listCarePlansByResident(context, residentId);
  });
}

export async function createCareTaskHandler(services: ApiServices, request: ApiRequest<CreateCareTaskBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createCareTask(context, request.body);
  }, 201);
}

export async function listCareTasksHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const residentId = request.query?.residentId;
    if (!residentId) throw new Error('residentId is required');
    return services.backend.listCareTasksByResident(context, residentId);
  });
}

export async function completeCareTaskHandler(services: ApiServices, request: ApiRequest<CompleteCareTaskBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.completeCareTask(context, request.body.taskId);
  });
}

export async function logAdlHandler(services: ApiServices, request: ApiRequest<LogAdlBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.logAdl(context, request.body);
  }, 201);
}

export async function listAdlsHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const residentId = request.query?.residentId;
    if (!residentId) throw new Error('residentId is required');
    return services.backend.listAdlsByResident(context, residentId);
  });
}

export async function createServicePlanHandler(services: ApiServices, request: ApiRequest<CreateServicePlanBody>): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    assertBody(request.body);
    return services.backend.createServicePlan(context, request.body);
  }, 201);
}

export async function listServicePlansHandler(services: ApiServices, request: ApiRequest): Promise<ApiResponse> {
  return withContext(services, request, async (context) => {
    const residentId = request.query?.residentId;
    if (!residentId) throw new Error('residentId is required');
    return services.backend.listServicePlansByResident(context, residentId);
  });
}

export async function resolveContext(services: ApiServices, sessionId: UUID | undefined): Promise<AccessContext> {
  if (!sessionId) {
    throw new Error('Session is required');
  }

  const session = await services.repositories.authSessions.getById(sessionId);

  const now = services.now?.() ?? new Date();

  if (!session || session.revokedAt || Date.parse(session.expiresAt) < now.getTime()) {
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
