import {
  completeBackgroundJobHandler,
  createOperationalRecordHandler,
  createFacilityHandler,
  enqueueBackgroundJobHandler,
  enqueueAiGenerationJobHandler,
  enqueueDigitalRxSyncJobHandler,
  enqueueNotificationJobHandler,
  enqueuePrintJobHandler,
  enqueueWorkflowActionJobHandler,
  failBackgroundJobHandler,
  createAssessmentHandler,
  createCarePlanHandler,
  completeCareTaskHandler,
  createCareTaskHandler,
  createMedicationOrderHandler,
  createComplianceIssueHandler,
  createIncidentHandler,
  createBillingChargeHandler,
  createInvoiceHandler,
  createOrganizationHandler,
  createResidentHandler,
  createUserHandler,
  createServicePlanHandler,
  getFacilityHandler,
  getOperationalRecordHandler,
  getOrganizationHandler,
  getResidentHandler,
  listFeaturesHandler,
  listAssessmentsHandler,
  listCarePlansHandler,
  listComplianceIssuesHandler,
  listFacilitiesHandler,
  listIncidentsHandler,
  listOrganizationsHandler,
  listOperationalRecordsHandler,
  listResidentsHandler,
  listUsersHandler,
  leaseBackgroundJobsHandler,
  listBackgroundJobsHandler,
  listAdlsHandler,
  listCareTasksHandler,
  listServicePlansHandler,
  logAdlHandler,
  listMedicationAdministrationsHandler,
  listMedicationOrdersHandler,
  listBillingChargesHandler,
  listInvoicesHandler,
  listPaymentsHandler,
  loginHandler,
  logoutHandler,
  passwordResetHandler,
  registerFeatureHandler,
  recordMedicationAdministrationHandler,
  updateIncidentHandler,
  recordPaymentHandler,
  updateFacilityHandler,
  updateOperationalRecordHandler,
  updateOrganizationHandler,
  updateResidentHandler,
  updateUserHandler,
  verifyMfaHandler,
  type ApiServices
} from './handlers';
import type { ApiRequest, ApiResponse, HttpMethod } from './http';
import { fail } from './http';
import { composeMiddleware, type ApiMiddleware } from './middleware';
import { apiRoutes } from './routes';
import {
  isCompleteBackgroundJobBody,
  isCreateFacilityBody,
  isCreateOperationalRecordBody,
  isEnqueueBackgroundJobBody,
  isEnqueueAiGenerationJobBody,
  isEnqueueDigitalRxSyncJobBody,
  isEnqueueNotificationJobBody,
  isEnqueuePrintJobBody,
  isEnqueueWorkflowActionJobBody,
  isFailBackgroundJobBody,
  isCreateAssessmentBody,
  isCreateCarePlanBody,
  isCompleteCareTaskBody,
  isCreateCareTaskBody,
  isCreateMedicationOrderBody,
  isCreateComplianceIssueBody,
  isCreateIncidentBody,
  isCreateBillingChargeBody,
  isCreateInvoiceBody,
  isCreateOrganizationBody,
  isCreateResidentBody,
  isCreateUserBody,
  isCreateServicePlanBody,
  isLogAdlBody,
  isUpdateFacilityBody,
  isUpdateIncidentBody,
  isUpdateOperationalRecordBody,
  isUpdateOrganizationBody,
  isLoginBody,
  isPasswordResetBody,
  isRecordMedicationAdministrationBody,
  isRecordPaymentBody,
  isRegisteredFeatureBody,
  isUpdateResidentBody,
  isUpdateUserBody,
  isVerifyMfaBody,
  validateRequestBody
} from './validation';

type RouteHandler = (services: ApiServices, request: ApiRequest) => Promise<ApiResponse>;

type RouteConfig = {
  method: HttpMethod;
  path: string;
  validate?: (body: unknown) => boolean;
  handler: RouteHandler;
};

const routeConfigs: RouteConfig[] = [
  {
    method: 'POST',
    path: '/auth/login',
    validate: isLoginBody,
    handler: loginHandler as RouteHandler
  },
  {
    method: 'POST',
    path: '/auth/mfa/verify',
    validate: isVerifyMfaBody,
    handler: verifyMfaHandler as RouteHandler
  },
  {
    method: 'POST',
    path: '/auth/logout',
    handler: logoutHandler
  },
  {
    method: 'POST',
    path: '/auth/password-reset',
    validate: isPasswordResetBody,
    handler: passwordResetHandler as RouteHandler
  },
  {
    method: 'POST',
    path: '/organizations',
    validate: isCreateOrganizationBody,
    handler: createOrganizationHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/organizations',
    handler: listOrganizationsHandler
  },
  {
    method: 'GET',
    path: '/organizations/get',
    handler: getOrganizationHandler
  },
  {
    method: 'PATCH',
    path: '/organizations',
    validate: isUpdateOrganizationBody,
    handler: updateOrganizationHandler as RouteHandler
  },
  {
    method: 'POST',
    path: '/facilities',
    validate: isCreateFacilityBody,
    handler: createFacilityHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/facilities',
    handler: listFacilitiesHandler
  },
  {
    method: 'GET',
    path: '/facilities/get',
    handler: getFacilityHandler
  },
  {
    method: 'PATCH',
    path: '/facilities',
    validate: isUpdateFacilityBody,
    handler: updateFacilityHandler as RouteHandler
  },
  {
    method: 'POST',
    path: '/feature-registry',
    validate: isRegisteredFeatureBody,
    handler: registerFeatureHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/feature-registry',
    handler: listFeaturesHandler
  },
  {
    method: 'POST',
    path: '/residents',
    validate: isCreateResidentBody,
    handler: createResidentHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/residents',
    handler: listResidentsHandler
  },
  {
    method: 'GET',
    path: '/residents/get',
    handler: getResidentHandler
  },
  {
    method: 'PATCH',
    path: '/residents',
    validate: isUpdateResidentBody,
    handler: updateResidentHandler as RouteHandler
  },
  {
    method: 'POST',
    path: '/users',
    validate: isCreateUserBody,
    handler: createUserHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/users',
    handler: listUsersHandler
  },
  {
    method: 'PATCH',
    path: '/users',
    validate: isUpdateUserBody,
    handler: updateUserHandler as RouteHandler
  },
  { method: 'POST', path: '/background-jobs', validate: isEnqueueBackgroundJobBody, handler: enqueueBackgroundJobHandler as RouteHandler },
  { method: 'GET', path: '/background-jobs', handler: listBackgroundJobsHandler },
  { method: 'POST', path: '/background-jobs/lease', handler: leaseBackgroundJobsHandler },
  { method: 'PATCH', path: '/background-jobs/complete', validate: isCompleteBackgroundJobBody, handler: completeBackgroundJobHandler as RouteHandler },
  { method: 'PATCH', path: '/background-jobs/fail', validate: isFailBackgroundJobBody, handler: failBackgroundJobHandler as RouteHandler },
  { method: 'POST', path: '/jobs/notifications', validate: isEnqueueNotificationJobBody, handler: enqueueNotificationJobHandler as RouteHandler },
  { method: 'POST', path: '/jobs/print', validate: isEnqueuePrintJobBody, handler: enqueuePrintJobHandler as RouteHandler },
  { method: 'POST', path: '/jobs/digitalrx', validate: isEnqueueDigitalRxSyncJobBody, handler: enqueueDigitalRxSyncJobHandler as RouteHandler },
  { method: 'POST', path: '/jobs/ai', validate: isEnqueueAiGenerationJobBody, handler: enqueueAiGenerationJobHandler as RouteHandler },
  { method: 'POST', path: '/jobs/workflow-actions', validate: isEnqueueWorkflowActionJobBody, handler: enqueueWorkflowActionJobHandler as RouteHandler },
  {
    method: 'POST',
    path: '/assessments',
    validate: isCreateAssessmentBody,
    handler: createAssessmentHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/assessments',
    handler: listAssessmentsHandler
  },
  {
    method: 'POST',
    path: '/care-plans',
    validate: isCreateCarePlanBody,
    handler: createCarePlanHandler as RouteHandler
  },
  {
    method: 'GET',
    path: '/care-plans',
    handler: listCarePlansHandler
  },
  { method: 'POST', path: '/tasks', validate: isCreateCareTaskBody, handler: createCareTaskHandler as RouteHandler },
  { method: 'GET', path: '/tasks', handler: listCareTasksHandler },
  { method: 'PATCH', path: '/tasks/complete', validate: isCompleteCareTaskBody, handler: completeCareTaskHandler as RouteHandler },
  { method: 'POST', path: '/adls', validate: isLogAdlBody, handler: logAdlHandler as RouteHandler },
  { method: 'GET', path: '/adls', handler: listAdlsHandler },
  { method: 'POST', path: '/service-plans', validate: isCreateServicePlanBody, handler: createServicePlanHandler as RouteHandler },
  { method: 'GET', path: '/service-plans', handler: listServicePlansHandler },
  { method: 'POST', path: '/medication-orders', validate: isCreateMedicationOrderBody, handler: createMedicationOrderHandler as RouteHandler },
  { method: 'GET', path: '/medication-orders', handler: listMedicationOrdersHandler },
  { method: 'POST', path: '/medication-administrations', validate: isRecordMedicationAdministrationBody, handler: recordMedicationAdministrationHandler as RouteHandler },
  { method: 'GET', path: '/medication-administrations', handler: listMedicationAdministrationsHandler },
  { method: 'POST', path: '/incidents', validate: isCreateIncidentBody, handler: createIncidentHandler as RouteHandler },
  { method: 'GET', path: '/incidents', handler: listIncidentsHandler },
  { method: 'PATCH', path: '/incidents', validate: isUpdateIncidentBody, handler: updateIncidentHandler as RouteHandler },
  { method: 'POST', path: '/compliance-issues', validate: isCreateComplianceIssueBody, handler: createComplianceIssueHandler as RouteHandler },
  { method: 'GET', path: '/compliance-issues', handler: listComplianceIssuesHandler },
  { method: 'POST', path: '/billing/charges', validate: isCreateBillingChargeBody, handler: createBillingChargeHandler as RouteHandler },
  { method: 'GET', path: '/billing/charges', handler: listBillingChargesHandler },
  { method: 'POST', path: '/billing/invoices', validate: isCreateInvoiceBody, handler: createInvoiceHandler as RouteHandler },
  { method: 'GET', path: '/billing/invoices', handler: listInvoicesHandler },
  { method: 'POST', path: '/billing/payments', validate: isRecordPaymentBody, handler: recordPaymentHandler as RouteHandler },
  { method: 'GET', path: '/billing/payments', handler: listPaymentsHandler }
  { method: 'POST', path: '/operational-records', validate: isCreateOperationalRecordBody, handler: createOperationalRecordHandler as RouteHandler },
  { method: 'GET', path: '/operational-records', handler: listOperationalRecordsHandler },
  { method: 'GET', path: '/operational-records/get', handler: getOperationalRecordHandler },
  { method: 'PATCH', path: '/operational-records', validate: isUpdateOperationalRecordBody, handler: updateOperationalRecordHandler as RouteHandler }
];

export function createApiRouter(services: ApiServices, middlewares: ApiMiddleware[] = []) {
  const dispatch = async (request: ApiRequest): Promise<ApiResponse> => {
    const route = routeConfigs.find((candidate) => candidate.path === request.path && candidate.method === request.method);

    if (!route) {
      const pathExists = apiRoutes.some((candidate) => candidate.path === request.path);
      return pathExists
        ? fail('method_not_allowed', `Method ${request.method} is not allowed for ${request.path}`, 405)
        : fail('not_found', `Route not found: ${request.method} ${request.path}`, 404);
    }

    if (route.validate) {
      const validation = validateRequestBody(request, route.validate);

      if (!validation.valid) {
        return validation.response;
      }

      return route.handler(services, {
        ...request,
        body: validation.body
      });
    }

    return route.handler(services, request);
  };
  const handle = composeMiddleware(middlewares, dispatch);

  return {
    async handle(request: ApiRequest): Promise<ApiResponse> {
      return handle(request);
    }
  };
}
