import type { RegisteredFeature } from '../domain';
import type { ApiRequest, ApiResponse } from './http';
import { fail } from './http';
import type { CreateComplianceIssueBody, CreateFacilityBody, CreateIncidentBody, CreateOrganizationBody, CreateResidentBody, CreateUserBody, LoginBody, UpdateFacilityBody, UpdateIncidentBody, UpdateOrganizationBody, UpdateResidentBody, UpdateUserBody, VerifyMfaBody } from './handlers';

export type ValidationResult =
  | {
      valid: true;
      body: unknown;
    }
  | {
      valid: false;
      response: ApiResponse<never>;
    };

export function validateRequestBody(
  request: ApiRequest,
  validator: (body: unknown) => boolean
): ValidationResult {
  if (!validator(request.body)) {
    return {
      valid: false,
      response: fail('invalid_request_body', 'Request body is invalid', 400)
    };
  }

  return {
    valid: true,
    body: request.body
  };
}

export function isLoginBody(body: unknown): body is LoginBody {
  return isRecord(body) && isNonEmptyString(body.email) && isNonEmptyString(body.password);
}

export function isVerifyMfaBody(body: unknown): body is VerifyMfaBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.sessionId) &&
    isNonEmptyString(body.challengeId) &&
    isNonEmptyString(body.code)
  );
}

export function isPasswordResetBody(body: unknown): body is { email: string } {
  return isRecord(body) && isNonEmptyString(body.email);
}

export function isCreateOrganizationBody(body: unknown): body is CreateOrganizationBody {
  return isRecord(body) && isNonEmptyString(body.name);
}

export function isUpdateOrganizationBody(body: unknown): body is UpdateOrganizationBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.organizationId) &&
    isRecord(body.updates) &&
    (body.updates.name === undefined || isNonEmptyString(body.updates.name)) &&
    (body.updates.status === undefined || ['active', 'suspended'].includes(String(body.updates.status)))
  );
}

export function isCreateFacilityBody(body: unknown): body is CreateFacilityBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.name);
}

export function isUpdateFacilityBody(body: unknown): body is UpdateFacilityBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.facilityId) &&
    isRecord(body.updates) &&
    (body.updates.name === undefined || isNonEmptyString(body.updates.name)) &&
    (body.updates.status === undefined || ['active', 'suspended'].includes(String(body.updates.status)))
  );
}

export function isRegisteredFeatureBody(body: unknown): body is RegisteredFeature {
  return (
    isRecord(body) &&
    isNonEmptyString(body.featureName) &&
    isNonEmptyString(body.module) &&
    ['registered', 'planned', 'gated'].includes(String(body.status)) &&
    Array.isArray(body.dependencies) &&
    body.dependencies.every((dependency) => typeof dependency === 'string') &&
    isNonEmptyString(body.version)
  );
}

export function isCreateResidentBody(body: unknown): body is CreateResidentBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.organizationId) &&
    isNonEmptyString(body.facilityId) &&
    isNonEmptyString(body.firstName) &&
    isNonEmptyString(body.lastName) &&
    optionalString(body.preferredName) &&
    optionalString(body.room) &&
    optionalString(body.levelOfCare)
  );
}

export function isUpdateResidentBody(body: unknown): body is UpdateResidentBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.residentId) &&
    isRecord(body.updates) &&
    optionalString(body.updates.firstName) &&
    optionalString(body.updates.lastName) &&
    optionalString(body.updates.preferredName) &&
    optionalString(body.updates.room) &&
    optionalString(body.updates.levelOfCare) &&
    (body.updates.status === undefined || ['active', 'discharged', 'inactive'].includes(String(body.updates.status)))
  );
}

export function isCreateUserBody(body: unknown): body is CreateUserBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.email) &&
    ['T1', 'T2', 'T2_5', 'T3', 'EMPLOYEE', 'FAMILY', 'RESIDENT'].includes(String(body.roleTier)) &&
    (body.organizationId === undefined || isNonEmptyString(body.organizationId)) &&
    Array.isArray(body.facilityIds) &&
    body.facilityIds.every((facilityId) => typeof facilityId === 'string') &&
    Array.isArray(body.permissions) &&
    body.permissions.every((permission) => typeof permission === 'string')
  );
}

export function isUpdateUserBody(body: unknown): body is UpdateUserBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.userId) &&
    isRecord(body.updates) &&
    (body.updates.email === undefined || isNonEmptyString(body.updates.email)) &&
    (body.updates.roleTier === undefined ||
      ['T1', 'T2', 'T2_5', 'T3', 'EMPLOYEE', 'FAMILY', 'RESIDENT'].includes(String(body.updates.roleTier))) &&
    (body.updates.organizationId === undefined || isNonEmptyString(body.updates.organizationId)) &&
    (body.updates.facilityIds === undefined ||
      (Array.isArray(body.updates.facilityIds) && body.updates.facilityIds.every((facilityId) => typeof facilityId === 'string'))) &&
    (body.updates.permissions === undefined ||
      (Array.isArray(body.updates.permissions) && body.updates.permissions.every((permission) => typeof permission === 'string'))) &&
    (body.updates.status === undefined || ['active', 'inactive'].includes(String(body.updates.status)))
  );
}

export function isCreateIncidentBody(body: unknown): body is CreateIncidentBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && ['fall', 'injury', 'medication_error', 'behavioral_event', 'elopement', 'infection_event'].includes(String(body.type)) && ['info', 'warning', 'critical'].includes(String(body.severity)) && ['open', 'investigating', 'corrective_action', 'resolved'].includes(String(body.status)) && isNonEmptyString(body.summary) && isNonEmptyString(body.occurredAt);
}

export function isUpdateIncidentBody(body: unknown): body is UpdateIncidentBody {
  return isRecord(body) && isNonEmptyString(body.incidentId) && isRecord(body.updates);
}

export function isCreateComplianceIssueBody(body: unknown): body is CreateComplianceIssueBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.issue) && ['info', 'warning', 'critical'].includes(String(body.severity)) && ['open', 'resolved'].includes(String(body.status)) && isNonEmptyString(body.resolutionLink);
}

function isRecord(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null && !Array.isArray(body);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}
