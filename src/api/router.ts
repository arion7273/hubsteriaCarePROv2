import {
  createFacilityHandler,
  createBillingChargeHandler,
  createInvoiceHandler,
  createOrganizationHandler,
  createResidentHandler,
  createUserHandler,
  getFacilityHandler,
  getOrganizationHandler,
  getResidentHandler,
  listFeaturesHandler,
  listFacilitiesHandler,
  listOrganizationsHandler,
  listResidentsHandler,
  listUsersHandler,
  listBillingChargesHandler,
  listInvoicesHandler,
  listPaymentsHandler,
  loginHandler,
  logoutHandler,
  passwordResetHandler,
  registerFeatureHandler,
  recordPaymentHandler,
  updateFacilityHandler,
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
  isCreateFacilityBody,
  isCreateBillingChargeBody,
  isCreateInvoiceBody,
  isCreateOrganizationBody,
  isCreateResidentBody,
  isCreateUserBody,
  isUpdateFacilityBody,
  isUpdateOrganizationBody,
  isLoginBody,
  isPasswordResetBody,
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
  { method: 'POST', path: '/billing/charges', validate: isCreateBillingChargeBody, handler: createBillingChargeHandler as RouteHandler },
  { method: 'GET', path: '/billing/charges', handler: listBillingChargesHandler },
  { method: 'POST', path: '/billing/invoices', validate: isCreateInvoiceBody, handler: createInvoiceHandler as RouteHandler },
  { method: 'GET', path: '/billing/invoices', handler: listInvoicesHandler },
  { method: 'POST', path: '/billing/payments', validate: isRecordPaymentBody, handler: recordPaymentHandler as RouteHandler },
  { method: 'GET', path: '/billing/payments', handler: listPaymentsHandler }
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
