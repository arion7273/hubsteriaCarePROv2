import type { RegisteredFeature } from '../domain';
import type { ApiRequest, ApiResponse } from './http';
import { fail } from './http';
import type {
  CompleteBackgroundJobBody,
  CompletePasswordResetBody,
  CompleteCareTaskBody,
  CreateAssessmentBody,
  CreateBillingChargeBody,
  CreateCarePlanBody,
  CreateCareTaskBody,
  CreateComplianceIssueBody,
  CreateFacilityBody,
  CreateIncidentBody,
  CreateInvoiceBody,
  CreateMedicationOrderBody,
  CreateOperationalRecordBody,
  CreateOrganizationBody,
  CreateResidentBody,
  CreateServicePlanBody,
  CreateUserBody,
  EnqueueAiGenerationJobBody,
  EnqueueBackgroundJobBody,
  EnqueueDigitalRxSyncJobBody,
  EnqueueNotificationJobBody,
  EnqueuePrintJobBody,
  EnqueueWorkflowActionJobBody,
  FailBackgroundJobBody,
  LogAdlBody,
  LoginBody,
  RecordMedicationAdministrationBody,
  RecordPaymentBody,
  UpdateFacilityBody,
  UpdateIncidentBody,
  UpdateOperationalRecordBody,
  UpdateOrganizationBody,
  UpdateResidentBody,
  UpdateUserBody,
  VerifyMfaBody
} from './handlers';

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

export function isCompletePasswordResetBody(body: unknown): body is CompletePasswordResetBody {
  return isRecord(body) && isNonEmptyString(body.requestId) && isNonEmptyString(body.newPassword) && body.newPassword.length >= 12;
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

export function isEnqueueBackgroundJobBody(body: unknown): body is EnqueueBackgroundJobBody {
  return isRecord(body) && (body.organizationId === undefined || isNonEmptyString(body.organizationId)) && (body.facilityId === undefined || isNonEmptyString(body.facilityId)) && (body.residentId === undefined || isNonEmptyString(body.residentId)) && ['notification', 'print', 'digitalrx_sync', 'ai_generation', 'workflow_action', 'audit_export'].includes(String(body.type)) && ['low', 'normal', 'high', 'critical'].includes(String(body.priority)) && isRecord(body.payload) && typeof body.maxAttempts === 'number' && isNonEmptyString(body.availableAt);
}

export function isCompleteBackgroundJobBody(body: unknown): body is CompleteBackgroundJobBody {
  return isRecord(body) && isNonEmptyString(body.jobId);
}

export function isFailBackgroundJobBody(body: unknown): body is FailBackgroundJobBody {
  return isRecord(body) && isNonEmptyString(body.jobId) && isNonEmptyString(body.error);
}

export function isEnqueueNotificationJobBody(body: unknown): body is EnqueueNotificationJobBody {
  return isRecord(body) && ['in_app', 'email', 'sms', 'push'].includes(String(body.channel)) && isNonEmptyString(body.template) && isNonEmptyString(body.recipient) && isRecord(body.payload);
}

export function isEnqueuePrintJobBody(body: unknown): body is EnqueuePrintJobBody {
  return isRecord(body) && isNonEmptyString(body.template) && ['pdf', 'csv', 'excel'].includes(String(body.format)) && Array.isArray(body.recordIds) && body.recordIds.every((id) => typeof id === 'string');
}

export function isEnqueueDigitalRxSyncJobBody(body: unknown): body is EnqueueDigitalRxSyncJobBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && ['order_created', 'order_updated', 'order_discontinued', 'refill_updated'].includes(String(body.event)) && isRecord(body.payload);
}

export function isEnqueueAiGenerationJobBody(body: unknown): body is EnqueueAiGenerationJobBody {
  return isRecord(body) && ['resident_summary', 'compliance_insight', 'family_update_draft', 'knowledge_answer'].includes(String(body.task)) && isRecord(body.payload);
}

export function isEnqueueWorkflowActionJobBody(body: unknown): body is EnqueueWorkflowActionJobBody {
  return isRecord(body) && isNonEmptyString(body.trigger) && isNonEmptyString(body.action) && isRecord(body.payload);
}

export function isCreateAssessmentBody(body: unknown): body is CreateAssessmentBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.organizationId) &&
    isNonEmptyString(body.facilityId) &&
    isNonEmptyString(body.residentId) &&
    isNonEmptyString(body.type) &&
    ['due', 'in_progress', 'review', 'complete'].includes(String(body.status)) &&
    (body.score === undefined || typeof body.score === 'number') &&
    isRecord(body.answers)
  );
}

export function isCreateCarePlanBody(body: unknown): body is CreateCarePlanBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.organizationId) &&
    isNonEmptyString(body.facilityId) &&
    isNonEmptyString(body.residentId) &&
    isNonEmptyString(body.goal) &&
    Array.isArray(body.interventions) &&
    body.interventions.every((intervention) => typeof intervention === 'string') &&
    isNonEmptyString(body.outcome) &&
    isNonEmptyString(body.reviewDate) &&
    isNonEmptyString(body.assignedStaff) &&
    ['active', 'resolved', 'inactive'].includes(String(body.status))
  );
}

export function isCreateCareTaskBody(body: unknown): body is CreateCareTaskBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && isNonEmptyString(body.title) && ['one_time', 'daily', 'weekly', 'monthly', 'custom_recurring'].includes(String(body.taskType)) && isNonEmptyString(body.dueAt) && isNonEmptyString(body.assignedStaff) && ['due', 'overdue', 'complete', 'missed', 'unassigned'].includes(String(body.status));
}

export function isCompleteCareTaskBody(body: unknown): body is CompleteCareTaskBody {
  return isRecord(body) && isNonEmptyString(body.taskId);
}

export function isLogAdlBody(body: unknown): body is LogAdlBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && isNonEmptyString(body.category) && isNonEmptyString(body.outcome) && optionalString(body.note);
}

export function isCreateServicePlanBody(body: unknown): body is CreateServicePlanBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && isNonEmptyString(body.service) && isNonEmptyString(body.schedule) && isNonEmptyString(body.assignedStaff) && optionalString(body.exceptions) && ['active', 'inactive'].includes(String(body.status));
}

export function isCreateMedicationOrderBody(body: unknown): body is CreateMedicationOrderBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && isNonEmptyString(body.medication) && isNonEmptyString(body.dosage) && isNonEmptyString(body.route) && isNonEmptyString(body.schedule) && ['active', 'future', 'prn', 'discontinued', 'hold'].includes(String(body.status)) && optionalString(body.instructions);
}

export function isRecordMedicationAdministrationBody(body: unknown): body is RecordMedicationAdministrationBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && isNonEmptyString(body.medicationOrderId) && ['given', 'refused', 'held', 'resident_absent', 'not_available'].includes(String(body.action)) && optionalString(body.reason) && optionalString(body.outcome);
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

export function isCreateBillingChargeBody(body: unknown): body is CreateBillingChargeBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && ['recurring', 'level_of_care', 'move_in', 'move_out', 'ancillary'].includes(String(body.type)) && isNonEmptyString(body.description) && typeof body.amountCents === 'number' && ['draft', 'posted', 'void'].includes(String(body.status));
}

export function isCreateInvoiceBody(body: unknown): body is CreateInvoiceBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && isNonEmptyString(body.invoiceNumber) && typeof body.balanceCents === 'number' && isNonEmptyString(body.dueDate) && ['draft', 'posted', 'paid', 'overdue'].includes(String(body.status));
}

export function isRecordPaymentBody(body: unknown): body is RecordPaymentBody {
  return isRecord(body) && isNonEmptyString(body.organizationId) && isNonEmptyString(body.facilityId) && isNonEmptyString(body.residentId) && (body.invoiceId === undefined || isNonEmptyString(body.invoiceId)) && ['payment', 'credit', 'refund'].includes(String(body.type)) && typeof body.amountCents === 'number' && isNonEmptyString(body.method);
}

export function isCreateOperationalRecordBody(body: unknown): body is CreateOperationalRecordBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.organizationId) &&
    optionalString(body.facilityId) &&
    optionalString(body.residentId) &&
    isOperationalRecordModule(body.module) &&
    isNonEmptyString(body.recordType) &&
    isOperationalRecordStatus(body.status) &&
    isNonEmptyString(body.title) &&
    isRecord(body.payload)
  );
}

export function isUpdateOperationalRecordBody(body: unknown): body is UpdateOperationalRecordBody {
  return (
    isRecord(body) &&
    isNonEmptyString(body.recordId) &&
    isRecord(body.updates) &&
    (body.updates.module === undefined || isOperationalRecordModule(body.updates.module)) &&
    (body.updates.recordType === undefined || isNonEmptyString(body.updates.recordType)) &&
    (body.updates.status === undefined || isOperationalRecordStatus(body.updates.status)) &&
    (body.updates.title === undefined || isNonEmptyString(body.updates.title)) &&
    (body.updates.payload === undefined || isRecord(body.updates.payload))
  );
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

function isOperationalRecordModule(value: unknown): boolean {
  return ['notifications', 'print', 'digitalrx', 'workflow', 'ai', 'communication', 'family', 'support', 'integrations'].includes(String(value));
}

function isOperationalRecordStatus(value: unknown): boolean {
  return ['draft', 'active', 'queued', 'processing', 'completed', 'failed', 'archived'].includes(String(value));
}
