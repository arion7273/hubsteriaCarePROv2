import { useEffect, useMemo, useRef, useState } from 'react';
import {
  allPhases,
  clinicalOperationsPhases,
  enterprisePhases,
  foundationPhases,
  type Phase
} from './data/roadmap';
import {
  configurationAreas,
  configurationAuditEvents,
  configurationGuardrails,
  featureToggles
} from './data/configuration';
import {
  assessmentBuilderControls,
  assessmentIntegrationRequirements,
  assessmentMetrics,
  assessmentReviewQueue,
  assessmentTemplates,
  assessmentTypes,
  autoCarePlanSuggestions,
  carePlanItems
} from './data/assessments';
import {
  adlCategories,
  caregiverTasks,
  missedTaskRules,
  mobileCompletionSteps,
  servicePlans,
  shiftDashboard,
  taskIntegrationRequirements,
  taskMetrics,
  taskTypes
} from './data/tasks';
import {
  barcodeVerificationSteps,
  controlledSubstanceChecks,
  medicationAlerts,
  medicationComplianceItems,
  medicationIntegrationRequirements,
  medicationMetrics,
  medicationOrders,
  medPassResidents,
  prnManagement
} from './data/medications';
import {
  digitalRxConnection,
  digitalRxEvents,
  digitalRxIntegrationRequirements,
  digitalRxMetrics,
  medicationSyncFields,
  pharmacyInbox,
  refillTracking,
  residentMatchingRules
} from './data/digitalrx';
import {
  complianceItems,
  incidentIntegrationRequirements,
  incidentMetrics,
  incidentRecords,
  incidentTypes,
  incidentWorkflow,
  surveyReadinessChecklist
} from './data/incidents';
import {
  communicationIntegrationRequirements,
  communicationMetrics,
  facilityAnnouncements,
  messageThreads,
  shiftHandoffs
} from './data/communication';
import {
  familyDashboardCards,
  familyIntegrationRequirements,
  familyMessages,
  familyMetrics,
  familyNotifications,
  familyPermissionRules
} from './data/family';
import {
  agingReport,
  billingIntegrationRequirements,
  billingMetrics,
  billingOperations,
  chargeItems,
  invoiceItems,
  paymentActivity
} from './data/billing';
import {
  automationActivity,
  automationExamples,
  workflowBuilderParts,
  workflowIntegrationRequirements,
  workflowMetrics,
  workflowTemplates
} from './data/workflows';
import {
  academyIntegrationRequirements,
  academyMetrics,
  aiHelpExamples,
  certifications,
  learningPaths,
  trainingResources
} from './data/academy';
import {
  remoteAssistanceRules,
  supportCapabilities,
  supportIntegrationRequirements,
  supportKnowledgeLinks,
  supportMetrics,
  supportTickets
} from './data/support';
import {
  executiveDrilldowns,
  executiveIntegrationRequirements,
  executiveMetrics,
  executiveScores,
  facilityPerformance
} from './data/executive';
import {
  aiComplianceInsights,
  aiFamilyDrafts,
  aiIntegrationRequirements,
  aiKnowledgeAnswers,
  aiMetrics,
  aiResidentSummaries
} from './data/ai';
import {
  loadTestTargets,
  performanceIntegrationRequirements,
  performanceMetrics,
  scalabilityArchitecture,
  scaleCapabilities
} from './data/performance';
import {
  deploymentPipelineSteps,
  enterpriseDocuments,
  productionChecklist,
  productionMetrics,
  productionReadinessRequirements
} from './data/production';
import {
  auditRequirements,
  facilityMetrics,
  featureRegistry,
  globalRules,
  hierarchy,
  masterBootstrapAccount,
  masterConsoleMetrics,
  organizationMetrics,
  type DashboardMetric
} from './data/platform';
import {
  notificationChannels,
  notificationHistory,
  notificationIntegrationRequirements,
  notificationMetrics,
  notificationRules,
  notificationTemplates
} from './data/notifications';
import {
  batchPrintJobs,
  printCapabilities,
  printIntegrationRequirements,
  printPreview,
  printTemplates,
  templateBuilderFeatures
} from './data/print';
import {
  commandCapabilities,
  favorites,
  personalizedDashboards,
  pinnedActions,
  productivitySearchIndex
} from './data/productivity';
import { createConfiguredApiClient, getConfiguredApiBaseUrl } from './client/api-client';
import { residentCommandCenter } from './data/resident';

type DashboardScope = 'T1 Master' | 'T2 Organization' | 'T3 Facility';
type ActiveModule = 'overview' | 'resident' | 'clinical' | 'emar' | 'operations' | 'production';

const scopeMetrics: Record<DashboardScope, DashboardMetric[]> = {
  'T1 Master': masterConsoleMetrics,
  'T2 Organization': organizationMetrics,
  'T3 Facility': facilityMetrics
};

const quickActions: Record<DashboardScope, string[]> = {
  'T1 Master': ['Create Organization', 'Create Facility', 'Invite User', 'Manage Subscription'],
  'T2 Organization': ['Create Facility', 'Invite Employee', 'Create Resident', 'Open Reports'],
  'T3 Facility': ['Add Resident', 'Start Assessment', 'Log Incident', 'Create Medication Order', 'Assign Task']
};

const connectedApiEndpoints = [
  'POST /auth/login',
  'POST /auth/mfa/verify',
  'POST /organizations',
  'GET /organizations',
  'POST /facilities',
  'GET /facilities',
  'POST /residents',
  'GET /residents',
  'PATCH /residents',
  'POST /users',
  'GET /users',
  'GET /assessments',
  'GET /tasks',
  'GET /medication-orders',
  'GET /incidents',
  'GET /billing/charges',
  'GET /background-jobs',
  'GET /operational-records'
];

type LiveApiRecord = Record<string, unknown>;

function App() {
  const [scope, setScope] = useState<DashboardScope>('T1 Master');
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [apiHealthStatus, setApiHealthStatus] = useState('Not checked');
  const [apiSessionId, setApiSessionId] = useState('');
  const [pendingMfaChallengeId, setPendingMfaChallengeId] = useState('');
  const [loginEmail, setLoginEmail] = useState('b094650@gmail.com');
  const [loginPassword, setLoginPassword] = useState('change-me-for-local-demo-only');
  const [mfaCode, setMfaCode] = useState('123456');
  const [apiActionStatus, setApiActionStatus] = useState('Idle');
  const [apiError, setApiError] = useState('');
  const [organizationName, setOrganizationName] = useState('Northstar Senior Living');
  const [facilityOrganizationId, setFacilityOrganizationId] = useState('org-1');
  const [facilityName, setFacilityName] = useState('Cedar Grove');
  const [residentOrganizationId, setResidentOrganizationId] = useState('org-1');
  const [residentFacilityId, setResidentFacilityId] = useState('facility-1');
  const [residentFirstName, setResidentFirstName] = useState('Maria');
  const [residentLastName, setResidentLastName] = useState('Alvarez');
  const [residentRoom, setResidentRoom] = useState('214B');
  const [userOrganizationId, setUserOrganizationId] = useState('org-1');
  const [userEmail, setUserEmail] = useState('caregiver@example.com');
  const [userRoleTier, setUserRoleTier] = useState('EMPLOYEE');
  const [clinicalOrganizationId, setClinicalOrganizationId] = useState('org-1');
  const [clinicalFacilityId, setClinicalFacilityId] = useState('facility-1');
  const [clinicalResidentId, setClinicalResidentId] = useState('resident-1');
  const [clinicalStatus, setClinicalStatus] = useState('Static clinical blueprint data is shown until live API records are loaded.');
  const [clinicalError, setClinicalError] = useState('');
  const [liveAssessments, setLiveAssessments] = useState<LiveApiRecord[]>([]);
  const [liveTasks, setLiveTasks] = useState<LiveApiRecord[]>([]);
  const [liveMedications, setLiveMedications] = useState<LiveApiRecord[]>([]);
  const [liveIncidents, setLiveIncidents] = useState<LiveApiRecord[]>([]);
  const [liveBilling, setLiveBilling] = useState<LiveApiRecord[]>([]);
  const [liveJobs, setLiveJobs] = useState<LiveApiRecord[]>([]);
  const [liveOperationalRecords, setLiveOperationalRecords] = useState<LiveApiRecord[]>([]);
  const [medicationOrderId, setMedicationOrderId] = useState('med-order-1');
  const [medPassResidentId, setMedPassResidentId] = useState('resident-1');
  const [medPassOrganizationId, setMedPassOrganizationId] = useState('org-1');
  const [medPassFacilityId, setMedPassFacilityId] = useState('facility-1');
  const [barcodeScanned, setBarcodeScanned] = useState('NDC-0000-0000');
  const [controlledSubstanceWitness, setControlledSubstanceWitness] = useState('witness-user-1');
  const [controlledSubstanceCount, setControlledSubstanceCount] = useState('28');
  const [apiWorkflowLog, setApiWorkflowLog] = useState<string[]>(['No API workflow actions run yet.']);
  const globalSearchRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = getConfiguredApiBaseUrl();

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        globalSearchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  const filteredPhases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allPhases;
    }

    return allPhases.filter((phase) => {
      const searchable = [phase.id, phase.title, phase.summary, phase.milestone, ...phase.deliverables]
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  const productivityResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return productivitySearchIndex;
    }

    return productivitySearchIndex.filter((record) => {
      const searchable = [record.category, record.title, record.description, record.location, record.action]
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  const activePersonalizedDashboard = personalizedDashboards.find((dashboard) => dashboard.role === scope);
  const isProtectedClinicalModule = activeModule !== 'overview' && activeModule !== 'production';
  const protectedRouteLocked = isProtectedClinicalModule && !apiSessionId;
  const routeClass = (module: ActiveModule) => (activeModule === 'overview' || activeModule === module ? '' : ' route-hidden') + (protectedRouteLocked ? ' route-hidden' : '');

  const checkApiHealth = async () => {
    setApiHealthStatus('Checking...');

    try {
      await createConfiguredApiClient().health();
      setApiHealthStatus('Connected');
      addApiLog('Health check connected.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      setApiHealthStatus(`Unavailable: ${message}`);
      addApiLog(`Health check failed: ${message}`);
    }
  };

  const addApiLog = (message: string) => {
    setApiWorkflowLog((current) => [message, ...current.filter((item) => item !== 'No API workflow actions run yet.')].slice(0, 6));
  };

  const runApiAction = async (label: string, action: (client: ReturnType<typeof createConfiguredApiClient>) => Promise<unknown>) => {
    setApiActionStatus(`${label} loading...`);
    setApiError('');

    try {
      const result = await action(createConfiguredApiClient());
      const response = result as { ok?: boolean; error?: { message?: string } } | undefined;
      if (response?.ok === false && response.error?.message?.toLowerCase().includes('session')) {
        setApiSessionId('');
        setPendingMfaChallengeId('');
        setApiError('Session expired. Please login again.');
      }
      addApiLog(`${label}: ${summarizeApiResult(result)}`);
      setApiActionStatus(`${label} complete`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setApiError(message);
      setApiActionStatus(`${label} failed`);
      addApiLog(`${label}: failed (${message})`);
      return undefined;
    }
  };

  const handleLogin = async () => {
    await runApiAction('Login', async (client) => {
      const login = await client.login(loginEmail, loginPassword);

      if (login.ok) {
        const data = login.data as { session?: { id?: string }; mfaChallenge?: { id?: string } };
        const sessionId = data.session?.id;
        const challengeId = data.mfaChallenge?.id;

        if (sessionId) {
          setApiSessionId(sessionId);
        }

        if (challengeId) {
          setPendingMfaChallengeId(challengeId);
        }
      }

      return login;
    });
  };

  const handleVerifyMfa = async () => {
    const sessionId = requireDemoSession();
    if (!pendingMfaChallengeId) {
      setApiError('Login first to receive an MFA challenge.');
      addApiLog('Verify MFA: failed (missing challenge)');
      return;
    }

    await runApiAction('Verify MFA', async (client) => {
      const result = await client.verifyMfa(sessionId, pendingMfaChallengeId, mfaCode);
      if (result.ok) {
        setPendingMfaChallengeId('');
      }
      return result;
    });
  };

  const handleLogout = async () => {
    const sessionId = requireDemoSession();
    await runApiAction('Logout', async (client) => {
      const result = await client.logout(sessionId);
      setApiSessionId('');
      setPendingMfaChallengeId('');
      return result;
    });
  };

  const recordMedPassAction = async (action: string) => {
    const normalizedAction = normalizeMedPassAction(action);
    await runApiAction(`Med pass ${action}`, (client) =>
      client.recordMedicationAdministration(requireDemoSession(), {
        organizationId: medPassOrganizationId,
        facilityId: medPassFacilityId,
        residentId: medPassResidentId,
        medicationOrderId,
        action: normalizedAction,
        reason: normalizedAction === 'given' ? undefined : `${action} selected during med pass`,
        outcome: normalizedAction === 'given' ? 'No adverse reaction observed' : undefined,
        prnEffectiveness: normalizedAction === 'given' ? 'Resident reports symptom relief within expected window' : undefined,
        barcodeScanned,
        barcodeVerified: true,
        controlledSubstanceWitness,
        controlledSubstanceCount: Number(controlledSubstanceCount)
      })
    );
  };

  const requireDemoSession = () => {
    if (!apiSessionId) {
      throw new Error('Login and verify MFA first.');
    }

    return apiSessionId;
  };

  const loadLiveRecords = async (
    label: string,
    setter: (records: LiveApiRecord[]) => void,
    action: (client: ReturnType<typeof createConfiguredApiClient>, sessionId: string) => Promise<unknown>
  ) => {
    setClinicalStatus(`${label} loading...`);
    setClinicalError('');
    const result = await runApiAction(label, (client) => action(client, requireDemoSession()));
    const records = extractApiRecords(result);

    if (records) {
      setter(records);
      setClinicalStatus(`${label} loaded ${records.length} record${records.length === 1 ? '' : 's'}.`);
      return;
    }

    setClinicalError(summarizeApiResult(result));
    setClinicalStatus(`${label} failed.`);
  };

  const createLiveClinicalRecord = async (
    label: string,
    action: (client: ReturnType<typeof createConfiguredApiClient>, sessionId: string) => Promise<unknown>
  ) => {
    setClinicalStatus(`${label} saving...`);
    setClinicalError('');
    const result = await runApiAction(label, (client) => action(client, requireDemoSession()));
    const response = result as { ok?: boolean; error?: { message?: string } } | undefined;

    if (response?.ok) {
      setClinicalStatus(`${label} saved. Reload the related live panel to refresh API data.`);
    } else {
      setClinicalError(response?.error?.message ?? summarizeApiResult(result));
      setClinicalStatus(`${label} failed.`);
    }
  };

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : ''}`}>
      <aside className="sidebar" aria-label="HubsteriaCarePRO navigation">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            H
          </span>
          <div>
            <p>HubsteriaCarePRO</p>
            <small>Senior Living OS</small>
          </div>
        </div>

        <nav className="nav-stack">
          {[
            'Command',
            'Global Rules',
            'Dashboards',
            'Resident Command Center',
            'Productivity System',
            'Notification Center Pro',
            'Print Center Pro',
            'Configuration Center',
            'Assessments & Care Plans',
            'Tasks ADLs & Services',
            'eMAR & Medication',
            'DigitalRX Hub',
            'Incidents & Compliance',
            'Communication Center',
            'Family Portal',
            'Billing Center',
            'Workflow Automation',
            'Hubsteria Academy',
            'Help Desk',
            'Executive Command Center',
            'AI Insights',
            'Performance & Scalability',
            'Production Hardening',
            'Hierarchy',
            'Feature Registry',
            'Roadmap'
          ].map((item) => (
            <a
              href={
                item === 'Assessments & Care Plans'
                  ? '#assessments-care-plans'
                  : item === 'Tasks ADLs & Services'
                    ? '#tasks-adls-services'
                    : item === 'eMAR & Medication'
                      ? '#emar-medication-management'
                      : item === 'DigitalRX Hub'
                        ? '#digitalrx-integration-hub'
                        : item === 'Incidents & Compliance'
                          ? '#incidents-compliance-center'
                          : item === 'Communication Center'
                            ? '#communication-center'
                            : item === 'Family Portal'
                              ? '#family-portal'
                              : item === 'Billing Center'
                                ? '#billing-center'
                                : item === 'Workflow Automation'
                                  ? '#workflow-automation-engine'
                                  : item === 'Hubsteria Academy'
                                    ? '#hubsteria-academy'
                                    : item === 'Help Desk'
                                      ? '#help-desk-support-center'
                                      : item === 'Executive Command Center'
                                        ? '#executive-command-center'
                                        : item === 'AI Insights'
                                          ? '#ai-assistant-insights'
                                          : item === 'Performance & Scalability'
                                            ? '#performance-scalability'
                                            : item === 'Production Hardening'
                                              ? '#production-hardening'
                                              : `#${item.toLowerCase().replaceAll(' ', '-')}`
              }
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div>
            <strong>Phase 0-20</strong>
            <span>Production readiness active</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <section className="content-card route-module-switcher" aria-label="Production module navigation">
          <div className="card-heading">
            <span>Production route modules</span>
            <strong>{isProtectedClinicalModule && !apiSessionId ? 'Login required for protected clinical modules' : 'Select a production module'}</strong>
          </div>
          <div className="api-mini-actions">
            {[
              ['overview', 'Overview'],
              ['resident', 'Resident Command Center'],
              ['clinical', 'Clinical workflows'],
              ['emar', 'Mobile eMAR'],
              ['operations', 'Operations'],
              ['production', 'Production readiness']
            ].map(([module, label]) => (
              <button
                type="button"
                className={activeModule === module ? 'active-route' : ''}
                key={module}
                onClick={() => setActiveModule(module as ActiveModule)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {isProtectedClinicalModule && !apiSessionId ? (
          <section className="content-card protected-route-empty" aria-label="Protected route empty state">
            <p className="eyebrow">Protected route</p>
            <h2>Login required</h2>
            <p>Clinical, resident, eMAR, and operations modules are hidden until the API session is active.</p>
            <a className="button primary" href="#api-connection-center">
              Open API login
            </a>
          </section>
        ) : null}

        {activeModule === 'overview' ? (
          <>
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Mobile-first clinical and operations platform</p>
            <h1>PointClickCare-level power, redesigned for speed, mobility, and tenant-safe growth.</h1>
            <p>
              HubsteriaCarePRO starts with reusable platform services: global rules, hierarchy, audit,
              dashboards, notifications, printing, feature registry, and configuration. Clinical modules plug
              into this foundation instead of rebuilding these services later.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#dashboards">
                Open Master Console
              </a>
              <a className="button secondary" href="#roadmap">
                View Milestones
              </a>
              <a className="button secondary" href="#resident-command-center">
                Open Resident Center
              </a>
              <a className="button secondary" href="#productivity-system">
                Open Productivity
              </a>
              <a className="button secondary" href="#notification-center-pro">
                Open Notifications
              </a>
              <a className="button secondary" href="#print-center-pro">
                Open Print Center
              </a>
              <a className="button secondary" href="#configuration-center">
                Open Configuration
              </a>
              <a className="button secondary" href="#assessments-care-plans">
                Open Assessments
              </a>
              <a className="button secondary" href="#tasks-adls-services">
                Open Tasks & ADLs
              </a>
              <a className="button secondary" href="#emar-medication-management">
                Open eMAR
              </a>
              <a className="button secondary" href="#digitalrx-integration-hub">
                Open DigitalRX
              </a>
              <a className="button secondary" href="#incidents-compliance-center">
                Open Compliance
              </a>
              <a className="button secondary" href="#communication-center">
                Open Communication
              </a>
              <a className="button secondary" href="#family-portal">
                Open Family Portal
              </a>
              <a className="button secondary" href="#billing-center">
                Open Billing
              </a>
              <a className="button secondary" href="#workflow-automation-engine">
                Open Automation
              </a>
              <a className="button secondary" href="#hubsteria-academy">
                Open Academy
              </a>
              <a className="button secondary" href="#help-desk-support-center">
                Open Help Desk
              </a>
              <a className="button secondary" href="#executive-command-center">
                Open Executive
              </a>
              <a className="button secondary" href="#ai-assistant-insights">
                Open AI Insights
              </a>
              <a className="button secondary" href="#performance-scalability">
                Open Performance
              </a>
              <a className="button secondary" href="#production-hardening">
                Open Hardening
              </a>
            </div>
          </div>

          <div className="phone-preview" aria-label="Mobile caregiver preview">
            <div className="phone-topbar">
              <span />
              <strong>Med Pass</strong>
              <span />
            </div>
            <div className="resident-banner">
              <div className="avatar">MA</div>
              <div>
                <strong>Maria Alvarez</strong>
                <span>Room 214B | Memory Care | Fall Risk</span>
              </div>
            </div>
            {['Give 8:00 AM medication', 'Log breakfast ADL', 'Add shift note'].map((task) => (
              <button className="mobile-task" key={task}>
                <span>{task}</span>
                <strong>1 tap</strong>
              </button>
            ))}
          </div>
        </section>
          </>
        ) : null}

        {activeModule === 'overview' || activeModule === 'production' ? (
        <section className="command-panel" id="command" aria-labelledby="command-title">
          <div>
            <p className="eyebrow">Ctrl + K ready</p>
            <h2 id="command-title">Global command and search layer</h2>
            <p>
              Search residents, staff, incidents, assessments, medications, tasks, reports, and roadmap
              milestones from one mobile-friendly command surface.
            </p>
            <div className="command-meta">
              <kbd>Ctrl</kbd>
              <span>+</span>
              <kbd>K</kbd>
              <strong>Command Bar</strong>
            </div>
          </div>
          <div className="command-box">
            <label htmlFor="global-search">Global search</label>
            <input
              id="global-search"
              ref={globalSearchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search residents, staff, meds, reports, phases..."
            />
            <div className="suggestions" aria-label="Command suggestions">
              {commandCapabilities.map((suggestion) => (
                <span key={suggestion}>{suggestion}</span>
              ))}
            </div>
            <div className="global-results" aria-label="Global search results">
              {productivityResults.slice(0, 5).map((result) => (
                <article key={`${result.category}-${result.title}`}>
                  <span>{result.category}</span>
                  <div>
                    <strong>{result.title}</strong>
                    <p>{result.description}</p>
                    <small>{result.location}</small>
                  </div>
                  <button type="button">{result.action}</button>
                </article>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        <section className="content-card api-connection-center" id="api-connection-center" aria-labelledby="api-connection-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">API connection foundation</p>
              <h2 id="api-connection-title">Admin workflows connected to real backend APIs</h2>
              <p>
                Login, MFA, organizations, facilities, users, and residents now run through the typed API client
                with protected actions, loading state, and visible error handling.
              </p>
            </div>
            <div className="api-status-card">
              <span>API base URL</span>
              <strong>{apiBaseUrl}</strong>
              <small>{apiHealthStatus}</small>
              <small>{apiSessionId ? 'Protected session active' : 'Protected admin UI locked'}</small>
            </div>
          </div>

          <div className="api-action-row">
            <button type="button" onClick={checkApiHealth}>
              Check API health
            </button>
            <button type="button" onClick={handleLogout} disabled={!apiSessionId || apiActionStatus.includes('loading')}>
              Logout
            </button>
            <a href={`${apiBaseUrl}/openapi.json`} target="_blank" rel="noreferrer">
              Open API contract
            </a>
          </div>

          <div className="api-state-row" role="status" aria-live="polite">
            <strong>{apiActionStatus}</strong>
            {apiError ? <span className="api-error">Error: {apiError}</span> : <span>No API errors.</span>}
          </div>

          <div className="api-auth-grid">
            <article className="api-auth-card">
              <h3>Login</h3>
              <label>
                Email
                <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
              </label>
              <label>
                Password
                <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
              </label>
              <button type="button" onClick={handleLogin} disabled={apiActionStatus.includes('loading')}>
                Login
              </button>
            </article>

            <article className="api-auth-card">
              <h3>MFA verification</h3>
              <label>
                Challenge ID
                <input value={pendingMfaChallengeId} onChange={(event) => setPendingMfaChallengeId(event.target.value)} />
              </label>
              <label>
                MFA code
                <input value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} />
              </label>
              <button type="button" onClick={handleVerifyMfa} disabled={!apiSessionId || apiActionStatus.includes('loading')}>
                Verify MFA
              </button>
            </article>
          </div>

          <div className={`protected-admin-panel ${apiSessionId ? 'unlocked' : 'locked'}`} aria-label="Protected admin workflow panel">
            <div className="card-heading">
              <span>Protected UI</span>
              <strong>{apiSessionId ? 'Unlocked for admin API workflows' : 'Login required before admin actions'}</strong>
            </div>

            <div className="api-crud-grid">
              <article className="api-crud-card">
                <h3>Organizations</h3>
                <label>
                  Organization name
                  <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} />
                </label>
                <div className="api-mini-actions">
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('Create organization', (client) => client.createOrganization(requireDemoSession(), organizationName))}>
                    Create organization
                  </button>
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('List organizations', (client) => client.listOrganizations(requireDemoSession()))}>
                    List organizations
                  </button>
                </div>
              </article>

              <article className="api-crud-card">
                <h3>Facilities</h3>
                <label>
                  Organization ID
                  <input value={facilityOrganizationId} onChange={(event) => setFacilityOrganizationId(event.target.value)} />
                </label>
                <label>
                  Facility name
                  <input value={facilityName} onChange={(event) => setFacilityName(event.target.value)} />
                </label>
                <div className="api-mini-actions">
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('Create facility', (client) => client.createFacility(requireDemoSession(), { organizationId: facilityOrganizationId, name: facilityName }))}>
                    Create facility
                  </button>
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('List facilities', (client) => client.listFacilities(requireDemoSession(), facilityOrganizationId))}>
                    List facilities
                  </button>
                </div>
              </article>

              <article className="api-crud-card">
                <h3>Residents</h3>
                <label>
                  Organization ID
                  <input value={residentOrganizationId} onChange={(event) => setResidentOrganizationId(event.target.value)} />
                </label>
                <label>
                  Facility ID
                  <input value={residentFacilityId} onChange={(event) => setResidentFacilityId(event.target.value)} />
                </label>
                <label>
                  First name
                  <input value={residentFirstName} onChange={(event) => setResidentFirstName(event.target.value)} />
                </label>
                <label>
                  Last name
                  <input value={residentLastName} onChange={(event) => setResidentLastName(event.target.value)} />
                </label>
                <label>
                  Room
                  <input value={residentRoom} onChange={(event) => setResidentRoom(event.target.value)} />
                </label>
                <div className="api-mini-actions">
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('Create resident', (client) => client.createResident(requireDemoSession(), { organizationId: residentOrganizationId, facilityId: residentFacilityId, firstName: residentFirstName, lastName: residentLastName, room: residentRoom }))}>
                    Create resident
                  </button>
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('List residents', (client) => client.listResidents(requireDemoSession(), residentOrganizationId, residentFacilityId))}>
                    List residents
                  </button>
                </div>
              </article>

              <article className="api-crud-card">
                <h3>Users</h3>
                <label>
                  Organization ID
                  <input value={userOrganizationId} onChange={(event) => setUserOrganizationId(event.target.value)} />
                </label>
                <label>
                  Email
                  <input value={userEmail} onChange={(event) => setUserEmail(event.target.value)} />
                </label>
                <label>
                  Role tier
                  <select value={userRoleTier} onChange={(event) => setUserRoleTier(event.target.value)}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="T3">T3 Facility Administrator</option>
                    <option value="T2">T2 Organization Administrator</option>
                  </select>
                </label>
                <div className="api-mini-actions">
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('Create user', (client) => client.createUser(requireDemoSession(), { email: userEmail, roleTier: userRoleTier, organizationId: userOrganizationId, facilityIds: userRoleTier === 'T3' ? [residentFacilityId] : [], permissions: ['resident:read'] }))}>
                    Create user
                  </button>
                  <button type="button" disabled={!apiSessionId || apiActionStatus.includes('loading')} onClick={() => runApiAction('List users', (client) => client.listUsers(requireDemoSession(), userOrganizationId))}>
                    List users
                  </button>
                </div>
              </article>
            </div>
          </div>

          <div className="clinical-api-panel" aria-label="High-value API workflow panel">
            <div className="card-heading">
              <span>Live workflow API</span>
              <strong>{clinicalStatus}</strong>
              {clinicalError ? <small className="api-error">Error: {clinicalError}</small> : <small>Use these controls to replace static panels with live API records.</small>}
            </div>
            <div className="clinical-api-scope-grid">
              <label>
                Organization ID
                <input value={clinicalOrganizationId} onChange={(event) => setClinicalOrganizationId(event.target.value)} />
              </label>
              <label>
                Facility ID
                <input value={clinicalFacilityId} onChange={(event) => setClinicalFacilityId(event.target.value)} />
              </label>
              <label>
                Resident ID
                <input value={clinicalResidentId} onChange={(event) => setClinicalResidentId(event.target.value)} />
              </label>
            </div>
            <div className="api-mini-actions">
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load assessments', setLiveAssessments, (client, sessionId) => client.listAssessments(sessionId, clinicalResidentId))}>Load assessments</button>
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load tasks', setLiveTasks, (client, sessionId) => client.listCareTasks(sessionId, clinicalResidentId))}>Load tasks</button>
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load eMAR orders', setLiveMedications, (client, sessionId) => client.listMedicationOrders(sessionId, clinicalResidentId))}>Load eMAR orders</button>
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load incidents', setLiveIncidents, (client, sessionId) => client.listIncidents(sessionId, clinicalResidentId))}>Load incidents</button>
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load billing', setLiveBilling, (client, sessionId) => client.listBillingCharges(sessionId, clinicalResidentId))}>Load billing</button>
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load background jobs', setLiveJobs, (client, sessionId) => client.listBackgroundJobs(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId }))}>Load background jobs</button>
              <button type="button" disabled={!apiSessionId} onClick={() => loadLiveRecords('Load operational history', setLiveOperationalRecords, (client, sessionId) => client.listOperationalRecords(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId }))}>Load operational history</button>
            </div>
            <div className="api-mini-actions">
              <button type="button" disabled={!apiSessionId} onClick={() => createLiveClinicalRecord('Create assessment', (client, sessionId) => client.createAssessment(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId, type: 'Fall Risk Assessment', status: 'review', score: 8, answers: { source: 'ui' } }))}>Create assessment</button>
              <button type="button" disabled={!apiSessionId} onClick={() => createLiveClinicalRecord('Create task', (client, sessionId) => client.createCareTask(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId, title: 'UI follow-up task', taskType: 'one_time', dueAt: '2026-06-24T09:30:00.000Z', assignedStaff: 'Caregiver Lead', status: 'due' }))}>Create task</button>
              <button type="button" disabled={!apiSessionId} onClick={() => createLiveClinicalRecord('Create eMAR order', (client, sessionId) => client.createMedicationOrder(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId, medication: 'Lisinopril', dosage: '10mg', route: 'PO', schedule: 'Daily 8 AM', status: 'active' }))}>Create eMAR order</button>
              <button type="button" disabled={!apiSessionId} onClick={() => createLiveClinicalRecord('Create incident', (client, sessionId) => client.createIncident(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId, type: 'fall', severity: 'warning', status: 'open', summary: 'Resident slipped near dining room', occurredAt: '2026-06-24T10:00:00.000Z' }))}>Create incident</button>
              <button type="button" disabled={!apiSessionId} onClick={() => createLiveClinicalRecord('Create billing charge', (client, sessionId) => client.createBillingCharge(sessionId, { organizationId: clinicalOrganizationId, facilityId: clinicalFacilityId, residentId: clinicalResidentId, type: 'ancillary', description: 'UI service charge', amountCents: 1000, status: 'posted' }))}>Create billing charge</button>
            </div>
          </div>

          <div className="api-endpoint-grid" aria-label="Connected API endpoints">
            {connectedApiEndpoints.map((endpoint) => (
              <span key={endpoint}>{endpoint}</span>
            ))}
          </div>

          <div className="api-workflow-log" aria-label="API workflow log">
            {apiWorkflowLog.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="content-card productivity-system" id="productivity-system" aria-labelledby="productivity-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 3</p>
              <h2 id="productivity-title">Productivity System</h2>
              <p>
                Global search, command actions, pinned workflows, favorites, role-personalized dashboards, and
                dark mode reduce clicks before clinical modules expand.
              </p>
            </div>
            <button className="mode-toggle" type="button" onClick={() => setDarkMode((enabled) => !enabled)}>
              {darkMode ? 'Use Light Mode' : 'Use Dark Mode'}
            </button>
          </div>

          <div className="productivity-grid">
            <article className="productivity-card span-two">
              <div className="card-heading">
                <span>Quick Actions Dock</span>
                <strong>Pinned workflows</strong>
              </div>
              <div className="pinned-action-grid">
                {pinnedActions.map((action) => (
                  <button key={action} type="button">
                    {action}
                  </button>
                ))}
              </div>
            </article>

            <article className="productivity-card">
              <div className="card-heading">
                <span>Favorites</span>
                <strong>User-pinned items</strong>
              </div>
              <div className="favorite-list">
                {favorites.map((favorite) => (
                  <div key={favorite.label}>
                    <span>{favorite.type}</span>
                    <strong>{favorite.label}</strong>
                    <small>{favorite.note}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="productivity-card personalized-dashboard">
              <div className="card-heading">
                <span>Personalized dashboard</span>
                <strong>{scope}</strong>
              </div>
              <div className="dashboard-widget-list">
                {activePersonalizedDashboard?.widgets.map((widget) => (
                  <span key={widget}>{widget}</span>
                ))}
              </div>
              <div className="shortcut-stack" aria-label={`${scope} productivity shortcuts`}>
                {activePersonalizedDashboard?.shortcuts.map((shortcut) => (
                  <button type="button" key={shortcut}>
                    {shortcut}
                  </button>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="content-card notification-center" id="notification-center-pro" aria-labelledby="notification-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 4</p>
              <h2 id="notification-title">Notification Center Pro</h2>
              <p>
                Enterprise notification services for in-app, email, SMS, and push alerts with templates, rules,
                routing, escalation, delivery tracking, read tracking, history, and role-based targeting.
              </p>
            </div>
            <div className="notification-status">
              <span>Routing engine</span>
              <strong>Tenant scoped</strong>
            </div>
          </div>

          <div className="notification-metric-grid">
            {notificationMetrics.map((metric) => (
              <article className="notification-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="notification-channel-grid">
            {notificationChannels.map((channel) => (
              <article className="notification-channel-card" key={channel.channel}>
                <span>{channel.channel}</span>
                <p>{channel.purpose}</p>
                <strong>{channel.sla}</strong>
              </article>
            ))}
          </div>

          <div className="notification-layout">
            <div className="notification-panel">
              <div className="card-heading">
                <span>Templates</span>
                <strong>Reusable event messaging</strong>
              </div>
              <div className="template-list">
                {notificationTemplates.map((template) => (
                  <article key={template.name}>
                    <div>
                      <strong>{template.name}</strong>
                      <span>{template.module}</span>
                    </div>
                    <p>{template.trigger}</p>
                    <small>{template.audience}</small>
                    <div className="channel-chip-row">
                      {template.channels.map((channel) => (
                        <span key={channel}>{channel}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="notification-panel">
              <div className="card-heading">
                <span>Rules and escalation</span>
                <strong>Role-based routing</strong>
              </div>
              <div className="rule-list">
                {notificationRules.map((rule) => (
                  <article key={rule.name}>
                    <div className="rule-header">
                      <strong>{rule.name}</strong>
                      <span className={`pill ${rule.status === 'Active' ? 'registered' : 'planned'}`}>{rule.status}</span>
                    </div>
                    <p>{rule.condition}</p>
                    <dl>
                      <div>
                        <dt>Route</dt>
                        <dd>{rule.route}</dd>
                      </div>
                      <div>
                        <dt>Escalation</dt>
                        <dd>{rule.escalation}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="notification-bottom-grid">
            <div className="notification-panel">
              <div className="card-heading">
                <span>Delivery and read tracking</span>
                <strong>Notification history</strong>
              </div>
              <div className="history-list" aria-label="Notification history">
                {notificationHistory.map((event) => (
                  <article key={`${event.event}-${event.timestamp}`}>
                    <span className={`delivery-status ${event.deliveryStatus.toLowerCase()}`}>{event.deliveryStatus}</span>
                    <div>
                      <strong>{event.event}</strong>
                      <p>
                        {event.resident} | {event.recipient} | {event.channel}
                      </p>
                    </div>
                    <time>{event.timestamp}</time>
                  </article>
                ))}
              </div>
            </div>

            <div className="notification-panel integration-panel">
              <div className="card-heading">
                <span>Integration contract</span>
                <strong>Required for all future modules</strong>
              </div>
              <ul className="check-list">
                {notificationIntegrationRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card print-center" id="print-center-pro" aria-labelledby="print-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 5</p>
              <h2 id="print-title">Print Center Pro</h2>
              <p>
                Enterprise print and export engine for PDF, CSV, and Excel with template building, preview,
                batch printing, branding, signatures, QR codes, barcodes, and module-wide print integration.
              </p>
            </div>
            <div className="print-status">
              <span>Preview engine</span>
              <strong>Required before print</strong>
            </div>
          </div>

          <div className="print-capability-grid">
            {printCapabilities.map((capability) => (
              <article className="print-capability-card" key={capability.format}>
                <span>{capability.format}</span>
                <p>{capability.purpose}</p>
                <strong>{capability.defaultUse}</strong>
              </article>
            ))}
          </div>

          <div className="print-layout">
            <div className="print-panel">
              <div className="card-heading">
                <span>Template Builder</span>
                <strong>Configurable print components</strong>
              </div>
              <div className="builder-feature-grid" aria-label="Template builder features">
                {templateBuilderFeatures.map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>
            </div>

            <div className="print-panel print-preview-panel">
              <div className="card-heading">
                <span>Preview before printing</span>
                <strong>{printPreview.template}</strong>
              </div>
              <div className="preview-sheet" aria-label="Print preview">
                <div className="preview-header">
                  <span>{printPreview.watermark}</span>
                  <strong>{printPreview.resident}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Pages</dt>
                    <dd>{printPreview.pageCount}</dd>
                  </div>
                  <div>
                    <dt>Generated</dt>
                    <dd>{printPreview.lastGenerated}</dd>
                  </div>
                </dl>
                <ul>
                  {printPreview.validation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="print-layout">
            <div className="print-panel">
              <div className="card-heading">
                <span>Saved templates</span>
                <strong>CRUD template registry</strong>
              </div>
              <div className="print-template-list">
                {printTemplates.map((template) => (
                  <article key={template.name}>
                    <div className="print-template-header">
                      <div>
                        <strong>{template.name}</strong>
                        <span>
                          {template.module} | {template.format}
                        </span>
                      </div>
                      <span className={`pill ${template.status === 'Active' ? 'registered' : 'planned'}`}>
                        {template.status}
                      </span>
                    </div>
                    <div className="print-chip-row">
                      {template.includes.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="print-panel">
              <div className="card-heading">
                <span>Batch printing</span>
                <strong>Multi-record output</strong>
              </div>
              <div className="batch-list" aria-label="Batch print jobs">
                {batchPrintJobs.map((job) => (
                  <article key={job.name}>
                    <div>
                      <strong>{job.name}</strong>
                      <span>{job.scope}</span>
                    </div>
                    <p>
                      {job.records} | {job.output}
                    </p>
                    <span className="batch-status">{job.status}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="print-panel integration-panel">
            <div className="card-heading">
              <span>Print Center integration contract</span>
              <strong>Required for every future module</strong>
            </div>
            <ul className="check-list">
              {printIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card configuration-center" id="configuration-center" aria-labelledby="configuration-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 5.5</p>
              <h2 id="configuration-title">Configuration Center</h2>
              <p>
                Centralized administration control room for roles, permissions, templates, notification rules,
                print settings, workflows, DigitalRX, facility settings, branding, and feature toggles.
              </p>
            </div>
            <div className="configuration-status">
              <span>Control room</span>
              <strong>Pre-clinical foundation</strong>
            </div>
          </div>

          <div className="configuration-area-grid">
            {configurationAreas.map((area) => (
              <article className="configuration-area-card" key={area.name}>
                <div className="configuration-area-header">
                  <div>
                    <span>{area.scope}</span>
                    <h3>{area.name}</h3>
                  </div>
                  <strong>{area.owner}</strong>
                </div>
                <div className="configuration-chip-row">
                  {area.settings.map((setting) => (
                    <span key={setting}>{setting}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="configuration-layout">
            <div className="configuration-panel">
              <div className="card-heading">
                <span>Feature toggles</span>
                <strong>Safe rollout controls</strong>
              </div>
              <div className="toggle-list" aria-label="Feature toggles">
                {featureToggles.map((toggle) => (
                  <article key={toggle.name}>
                    <div>
                      <strong>{toggle.name}</strong>
                      <span>{toggle.module}</span>
                    </div>
                    <p>{toggle.scope}</p>
                    <span className={`toggle-status ${toggle.status.toLowerCase()}`}>{toggle.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="configuration-panel">
              <div className="card-heading">
                <span>Configuration audit</span>
                <strong>Immutable setting history</strong>
              </div>
              <div className="configuration-audit-list" aria-label="Configuration audit events">
                {configurationAuditEvents.map((event) => (
                  <article key={`${event.action}-${event.entity}`}>
                    <span>{event.action}</span>
                    <div>
                      <strong>{event.entity}</strong>
                      <p>
                        {event.actor} | {event.scope}
                      </p>
                    </div>
                    <time>{event.timestamp}</time>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="configuration-panel integration-panel">
            <div className="card-heading">
              <span>Configuration guardrails</span>
              <strong>Required before clinical expansion</strong>
            </div>
            <ul className="check-list">
              {configurationGuardrails.map((guardrail) => (
                <li key={guardrail}>{guardrail}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`content-card assessments-center${routeClass('clinical')}`} id="assessments-care-plans" aria-labelledby="assessments-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 6</p>
              <h2 id="assessments-title">Assessments & Care Plans Engine</h2>
              <p>
                Comprehensive assessment and care planning for assisted living, RCFE, memory care, and group
                home workflows, connected to resident records, print, notifications, configuration, and audit.
              </p>
            </div>
            <div className="assessments-status">
              <span>Clinical engine</span>
              <strong>Resident-linked</strong>
            </div>
          </div>

          <LiveWorkflowRecords title="Live assessment API records" records={liveAssessments} fields={['type', 'status', 'score', 'residentId']} emptyText="No assessments loaded yet." />

          <div className="assessment-metric-grid">
            {assessmentMetrics.map((metric) => (
              <article className="assessment-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="assessment-type-panel">
            <div className="card-heading">
              <span>Assessment Center</span>
              <strong>Supported assessment types</strong>
            </div>
            <div className="assessment-type-grid" aria-label="Assessment types">
              {assessmentTypes.map((type) => (
                <span key={type}>{type}</span>
              ))}
            </div>
          </div>

          <div className="assessment-layout">
            <div className="assessment-panel">
              <div className="card-heading">
                <span>Templates and scheduler</span>
                <strong>Assessment templates</strong>
              </div>
              <div className="assessment-template-list">
                {assessmentTemplates.map((template) => (
                  <article key={template.name}>
                    <div className="assessment-template-header">
                      <div>
                        <strong>{template.name}</strong>
                        <span>
                          {template.category} | {template.cadence}
                        </span>
                      </div>
                      <span className={`assessment-status-pill ${template.status.toLowerCase().replaceAll(' ', '-')}`}>
                        {template.status}
                      </span>
                    </div>
                    <div className="assessment-chip-row">
                      {template.sections.map((section) => (
                        <span key={section}>{section}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="assessment-panel">
              <div className="card-heading">
                <span>Assessment Builder</span>
                <strong>Configurable clinical logic</strong>
              </div>
              <div className="builder-control-list" aria-label="Assessment builder controls">
                {assessmentBuilderControls.map((control) => (
                  <article key={control.name}>
                    <strong>{control.name}</strong>
                    <p>{control.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="assessment-layout">
            <div className="assessment-panel">
              <div className="card-heading">
                <span>Care Plan Center</span>
                <strong>Goals, interventions, outcomes</strong>
              </div>
              <div className="care-plan-list">
                {carePlanItems.map((plan) => (
                  <article key={plan.goal}>
                    <div className="care-plan-header">
                      <strong>{plan.goal}</strong>
                      <span>{plan.reviewDate}</span>
                    </div>
                    <ul>
                      {plan.interventions.map((intervention) => (
                        <li key={intervention}>{intervention}</li>
                      ))}
                    </ul>
                    <p>
                      Outcome: {plan.outcome} | Assigned: {plan.assignedStaff}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="assessment-panel">
              <div className="card-heading">
                <span>Auto care plan suggestions</span>
                <strong>Generated from scores</strong>
              </div>
              <div className="suggestion-list" aria-label="Auto care plan suggestions">
                {autoCarePlanSuggestions.map((suggestion) => (
                  <article key={suggestion.suggestion}>
                    <span>{suggestion.confidence}</span>
                    <div>
                      <strong>{suggestion.source}</strong>
                      <p>{suggestion.suggestion}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="review-queue" aria-label="Assessment review queue">
                <div className="card-heading">
                  <span>Review Queue</span>
                  <strong>Scheduler follow-up</strong>
                </div>
                {assessmentReviewQueue.map((item) => (
                  <article key={`${item.resident}-${item.assessment}`}>
                    <strong>{item.resident}</strong>
                    <span>
                      {item.assessment} | {item.due} | {item.reviewer}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="assessment-panel integration-panel">
            <div className="card-heading">
              <span>Assessment integration contract</span>
              <strong>Resident, print, notification, configuration, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {assessmentIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`content-card tasks-center${routeClass('clinical')}`} id="tasks-adls-services" aria-labelledby="tasks-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 7</p>
              <h2 id="tasks-title">Tasks, ADLs & Services</h2>
              <p>
                Caregiver workflow management for recurring tasks, ADL logging, resident service plans,
                missed-task detection, shift dashboards, and one-tap mobile completion.
              </p>
            </div>
            <div className="tasks-status">
              <span>Mobile mode</span>
              <strong>One-tap completion</strong>
            </div>
          </div>

          <LiveWorkflowRecords title="Live task API records" records={liveTasks} fields={['title', 'status', 'dueAt', 'assignedStaff']} emptyText="No tasks loaded yet." />

          <div className="task-metric-grid">
            {taskMetrics.map((metric) => (
              <article className="task-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="tasks-layout">
            <div className="task-panel">
              <div className="card-heading">
                <span>Task management</span>
                <strong>Task types and current work</strong>
              </div>
              <div className="task-type-row" aria-label="Task types">
                {taskTypes.map((type) => (
                  <span key={type}>{type}</span>
                ))}
              </div>
              <div className="caregiver-task-list" aria-label="Caregiver tasks">
                {caregiverTasks.map((task) => (
                  <article key={`${task.resident}-${task.title}`}>
                    <div>
                      <strong>{task.title}</strong>
                      <span>
                        {task.resident} | {task.type} | {task.schedule}
                      </span>
                    </div>
                    <p>{task.assignedStaff}</p>
                    <span className={`task-status-pill ${task.status.toLowerCase()}`}>{task.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="task-panel">
              <div className="card-heading">
                <span>ADL Tracking</span>
                <strong>Activities of daily living</strong>
              </div>
              <div className="adl-grid" aria-label="ADL categories">
                {adlCategories.map((adl) => (
                  <span key={adl}>{adl}</span>
                ))}
              </div>
              <div className="mobile-completion-card">
                <div className="card-heading">
                  <span>Mobile mode</span>
                  <strong>One-tap completion workflow</strong>
                </div>
                <ol>
                  {mobileCompletionSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="tasks-layout">
            <div className="task-panel">
              <div className="card-heading">
                <span>Service Plans</span>
                <strong>Resident service schedules</strong>
              </div>
              <div className="service-plan-list">
                {servicePlans.map((plan) => (
                  <article key={`${plan.resident}-${plan.service}`}>
                    <strong>{plan.service}</strong>
                    <p>
                      {plan.resident} | {plan.schedule} | {plan.assignedStaff}
                    </p>
                    <span>{plan.exceptions}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="task-panel">
              <div className="card-heading">
                <span>Missed Task Engine</span>
                <strong>Late, missed, and unassigned detection</strong>
              </div>
              <ul className="missed-task-list">
                {missedTaskRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <div className="shift-dashboard-grid" aria-label="Shift dashboard">
                {shiftDashboard.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small>{item.detail}</small>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="task-panel integration-panel">
            <div className="card-heading">
              <span>Task integration contract</span>
              <strong>Resident, notification, print, configuration, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {taskIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`content-card medication-center${routeClass('emar')}`} id="emar-medication-management" aria-labelledby="medication-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 8</p>
              <h2 id="medication-title">eMAR & Medication Management</h2>
              <p>
                Flagship medication workflows for orders, med pass, PRNs, controlled substances, barcode
                verification, safety alerts, compliance monitoring, and mobile-first medication administration.
              </p>
            </div>
            <div className="medication-status">
              <span>Mobile med pass</span>
              <strong>Safety-first workflow</strong>
            </div>
          </div>

          <LiveWorkflowRecords title="Live eMAR API records" records={liveMedications} fields={['medication', 'dosage', 'route', 'schedule', 'status']} emptyText="No medication orders loaded yet." />

          <div className="medication-metric-grid">
            {medicationMetrics.map((metric) => (
              <article className="medication-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="medication-panel emar-action-config" aria-label="Connected eMAR action configuration">
            <div className="card-heading">
              <span>Connected eMAR actions</span>
              <strong>Real medication administration endpoint</strong>
            </div>
            <div className="clinical-api-scope-grid">
              <label>
                Medication order ID
                <input value={medicationOrderId} onChange={(event) => setMedicationOrderId(event.target.value)} />
              </label>
              <label>
                Resident ID
                <input value={medPassResidentId} onChange={(event) => setMedPassResidentId(event.target.value)} />
              </label>
              <label>
                Barcode scanned
                <input value={barcodeScanned} onChange={(event) => setBarcodeScanned(event.target.value)} />
              </label>
              <label>
                Witness user ID
                <input value={controlledSubstanceWitness} onChange={(event) => setControlledSubstanceWitness(event.target.value)} />
              </label>
              <label>
                Controlled substance count
                <input value={controlledSubstanceCount} onChange={(event) => setControlledSubstanceCount(event.target.value)} />
              </label>
            </div>
          </div>

          <div className="medication-layout">
            <div className="medication-panel">
              <div className="card-heading">
                <span>Medication Orders</span>
                <strong>Order status and instructions</strong>
              </div>
              <div className="medication-order-list" aria-label="Medication orders">
                {medicationOrders.map((order) => (
                  <article key={`${order.medication}-${order.status}`}>
                    <div>
                      <strong>{order.medication}</strong>
                      <span>
                        {order.dosage} | {order.route} | {order.schedule}
                      </span>
                    </div>
                    <p>{order.instructions}</p>
                    <span className={`medication-status-pill ${order.status.toLowerCase()}`}>{order.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="medication-panel">
              <div className="card-heading">
                <span>Med Pass Center</span>
                <strong>Resident-first administration</strong>
              </div>
              <div className="med-pass-list" aria-label="Med pass residents">
                {medPassResidents.map((resident) => (
                  <article key={`${resident.resident}-${resident.medication}`}>
                    <div className="med-pass-header">
                      <div className="med-pass-avatar">{resident.photo}</div>
                      <div>
                        <strong>{resident.resident}</strong>
                        <span>Room {resident.room}</span>
                      </div>
                    </div>
                    <p>
                      {resident.medication} {resident.dosage} | {resident.route} | {resident.schedule}
                    </p>
                    <small>{resident.instructions}</small>
                    <div className="med-action-row">
                      {resident.actions.map((action) => (
                        <button type="button" key={action} onClick={() => recordMedPassAction(action)} disabled={!apiSessionId}>
                          {action}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="medication-panel mobile-med-pass-card">
            <div className="card-heading">
              <span>Mobile eMAR workflow</span>
              <strong>Barcode-ready administration actions</strong>
            </div>
            <p>
              The same med-pass actions below post to the medication administration API with barcode verification,
              PRN effectiveness, and controlled-substance witness/count metadata.
            </p>
            <label className="clinical-api-scope-grid">
              <span>
                Medication order ID
                <input value={medicationOrderId} onChange={(event) => setMedicationOrderId(event.target.value)} />
              </span>
            </label>
            <div className="api-mini-actions">
              {['Given', 'Refused', 'Held'].map((action) => (
                <button type="button" key={action} onClick={() => recordMedPassAction(action)} disabled={!apiSessionId}>
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="medication-layout">
            <div className="medication-panel">
              <div className="card-heading">
                <span>PRN and controlled substances</span>
                <strong>Reason, outcome, counts, witnesses</strong>
              </div>
              <div className="medication-subgrid">
                <div>
                  <h3>PRN Management</h3>
                  <ul>
                    {prnManagement.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Controlled Substance Module</h3>
                  <ul>
                    {controlledSubstanceChecks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="medication-panel">
              <div className="card-heading">
                <span>Barcode scanning and alerts</span>
                <strong>Verification before action</strong>
              </div>
              <ol className="barcode-list">
                {barcodeVerificationSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="medication-alert-grid" aria-label="Medication alerts">
                {medicationAlerts.map((alert) => (
                  <span key={alert}>{alert}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="medication-layout">
            <div className="medication-panel">
              <div className="card-heading">
                <span>Compliance monitoring</span>
                <strong>Late, missed, refused, expiring</strong>
              </div>
              <div className="medication-compliance-list" aria-label="Medication compliance items">
                {medicationComplianceItems.map((item) => (
                  <article key={item.label}>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="medication-panel mobile-med-pass-card">
              <div className="card-heading">
                <span>Mobile med pass mode</span>
                <strong>Designed for tablets and phones first</strong>
              </div>
              <p>
                Large resident cards, high-contrast actions, barcode-ready verification, PRN follow-up prompts,
                allergy warnings, and sticky action buttons keep med pass fast and safe on mobile devices.
              </p>
            </div>
          </div>

          <div className="medication-panel integration-panel">
            <div className="card-heading">
              <span>Medication integration contract</span>
              <strong>Resident, notification, print, configuration, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {medicationIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card digitalrx-center" id="digitalrx-integration-hub" aria-labelledby="digitalrx-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 9</p>
              <h2 id="digitalrx-title">DigitalRX Integration Hub</h2>
              <p>
                Pharmacy connector layer that lets DigitalRX remain the pharmacy source of truth while
                HubsteriaCarePRO becomes the caregiver-facing eMAR and medication workflow.
              </p>
            </div>
            <div className="digitalrx-status">
              <span>{digitalRxConnection.connectionStatus}</span>
              <strong>{digitalRxConnection.lastSync}</strong>
            </div>
          </div>

          <div className="digitalrx-metric-grid">
            {digitalRxMetrics.map((metric) => (
              <article className="digitalrx-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="digitalrx-layout">
            <div className="digitalrx-panel">
              <div className="card-heading">
                <span>DigitalRX Connection Center</span>
                <strong>Secure connector settings</strong>
              </div>
              <dl className="digitalrx-connection-list">
                <div>
                  <dt>API Endpoint</dt>
                  <dd>{digitalRxConnection.endpoint}</dd>
                </div>
                <div>
                  <dt>API Key</dt>
                  <dd>{digitalRxConnection.apiKeyStatus}</dd>
                </div>
                <div>
                  <dt>Connection Status</dt>
                  <dd>{digitalRxConnection.connectionStatus}</dd>
                </div>
                <div>
                  <dt>Last Sync</dt>
                  <dd>{digitalRxConnection.lastSync}</dd>
                </div>
              </dl>
            </div>

            <div className="digitalrx-panel">
              <div className="card-heading">
                <span>Pharmacy Inbox</span>
                <strong>Orders, changes, discontinuations, refills</strong>
              </div>
              <div className="pharmacy-inbox-list" aria-label="Pharmacy inbox">
                {pharmacyInbox.map((item) => (
                  <article key={`${item.type}-${item.resident}-${item.medication}`}>
                    <div>
                      <strong>{item.type}</strong>
                      <span>
                        {item.resident} | {item.medication}
                      </span>
                    </div>
                    <p>{item.received}</p>
                    <span className={`pharmacy-status-pill ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {item.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="digitalrx-layout">
            <div className="digitalrx-panel">
              <div className="card-heading">
                <span>Medication Sync</span>
                <strong>DigitalRX to eMAR mapping</strong>
              </div>
              <div className="sync-field-list" aria-label="Medication sync fields">
                {medicationSyncFields.map((field) => (
                  <article key={field.field}>
                    <strong>{field.field}</strong>
                    <span>
                      {field.source} -&gt; {field.destination}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="digitalrx-panel">
              <div className="card-heading">
                <span>Resident Matching</span>
                <strong>Confirm before import</strong>
              </div>
              <ul className="resident-match-list">
                {residentMatchingRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digitalrx-layout">
            <div className="digitalrx-panel">
              <div className="card-heading">
                <span>Refill Tracking</span>
                <strong>Requested to delivered</strong>
              </div>
              <div className="refill-list" aria-label="Refill tracking">
                {refillTracking.map((refill) => (
                  <article key={`${refill.resident}-${refill.medication}`}>
                    <div>
                      <strong>{refill.medication}</strong>
                      <span>{refill.resident}</span>
                    </div>
                    <span className={`refill-status-pill ${refill.status.toLowerCase()}`}>{refill.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="digitalrx-panel">
              <div className="card-heading">
                <span>DigitalRX Events</span>
                <strong>Webhook-ready connector events</strong>
              </div>
              <div className="digitalrx-event-grid" aria-label="DigitalRX events">
                {digitalRxEvents.map((event) => (
                  <span key={event}>{event}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="digitalrx-panel integration-panel">
            <div className="card-heading">
              <span>DigitalRX integration contract</span>
              <strong>Pharmacy source of truth with eMAR synchronization</strong>
            </div>
            <ul className="check-list">
              {digitalRxIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`content-card incidents-center${routeClass('clinical')}`} id="incidents-compliance-center" aria-labelledby="incidents-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 10</p>
              <h2 id="incidents-title">Incidents & Compliance Center</h2>
              <p>
                Incident reporting, investigation, root cause analysis, corrective action, compliance monitoring,
                fix-this-issue resolution links, and survey readiness for facility operations.
              </p>
            </div>
            <div className="incidents-status">
              <span>Survey readiness</span>
              <strong>Compliance operations</strong>
            </div>
          </div>

          <LiveWorkflowRecords title="Live incident API records" records={liveIncidents} fields={['type', 'severity', 'status', 'summary', 'occurredAt']} emptyText="No incidents loaded yet." />

          <div className="incident-metric-grid">
            {incidentMetrics.map((metric) => (
              <article className="incident-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="incidents-layout">
            <div className="incident-panel">
              <div className="card-heading">
                <span>Incident Types</span>
                <strong>Configured event categories</strong>
              </div>
              <div className="incident-type-grid" aria-label="Incident types">
                {incidentTypes.map((type) => (
                  <span key={type}>{type}</span>
                ))}
              </div>
              <div className="incident-workflow" aria-label="Incident workflow">
                {incidentWorkflow.map((step, index) => (
                  <article key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="incident-panel">
              <div className="card-heading">
                <span>Incident Register</span>
                <strong>Reports, investigations, corrective actions</strong>
              </div>
              <div className="incident-record-list" aria-label="Incident records">
                {incidentRecords.map((record) => (
                  <article key={`${record.type}-${record.resident}`}>
                    <div>
                      <strong>{record.type}</strong>
                      <span>{record.resident}</span>
                    </div>
                    <p>{record.nextStep}</p>
                    <span className={`incident-status-pill ${record.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {record.status}
                    </span>
                    <span className={`incident-severity-pill ${record.severity.toLowerCase()}`}>{record.severity}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="incidents-layout">
            <div className="incident-panel">
              <div className="card-heading">
                <span>Compliance Dashboard</span>
                <strong>Fix this issue links</strong>
              </div>
              <div className="compliance-list" aria-label="Compliance items">
                {complianceItems.map((item) => (
                  <article key={item.issue}>
                    <div>
                      <strong>{item.issue}</strong>
                      <span>{item.facility}</span>
                    </div>
                    <span className={`incident-severity-pill ${item.severity.toLowerCase()}`}>{item.severity}</span>
                    <button type="button">{item.resolutionLink}</button>
                  </article>
                ))}
              </div>
            </div>

            <div className="incident-panel">
              <div className="card-heading">
                <span>Survey Readiness Center</span>
                <strong>State survey packet preparation</strong>
              </div>
              <ul className="survey-checklist" aria-label="Survey readiness checklist">
                {surveyReadinessChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="incident-panel integration-panel">
            <div className="card-heading">
              <span>Incident integration contract</span>
              <strong>Resident, notification, print, configuration, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {incidentIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card communication-center" id="communication-center" aria-labelledby="communication-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 11</p>
              <h2 id="communication-title">Communication Center</h2>
              <p>
                Secure messaging, shift handoff, facility announcements, read receipts, and notification-backed
                communication workflows for staff, families, and providers.
              </p>
            </div>
            <div className="communication-status">
              <span>Secure messaging</span>
              <strong>Read receipts active</strong>
            </div>
          </div>

          <div className="communication-metric-grid">
            {communicationMetrics.map((metric) => (
              <article className="communication-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="communication-layout">
            <div className="communication-panel">
              <div className="card-heading">
                <span>Messaging</span>
                <strong>Internal staff, family, and provider threads</strong>
              </div>
              <div className="message-thread-list" aria-label="Message threads">
                {messageThreads.map((thread) => (
                  <article key={`${thread.audience}-${thread.subject}`}>
                    <div>
                      <strong>{thread.subject}</strong>
                      <span>
                        {thread.audience} | {thread.participants}
                      </span>
                    </div>
                    <p>{thread.lastActivity}</p>
                    <span className={`message-status-pill ${thread.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {thread.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="communication-panel">
              <div className="card-heading">
                <span>Shift Handoff Center</span>
                <strong>Outgoing to incoming shift</strong>
              </div>
              <div className="handoff-list" aria-label="Shift handoffs">
                {shiftHandoffs.map((handoff) => (
                  <article key={`${handoff.resident}-${handoff.outgoingShift}`}>
                    <strong>{handoff.resident}</strong>
                    <span>
                      {`${handoff.outgoingShift} -> ${handoff.incomingShift}`}
                    </span>
                    <p>{handoff.note}</p>
                    <small>{handoff.readConfirmation}</small>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="communication-layout">
            <div className="communication-panel">
              <div className="card-heading">
                <span>Facility Announcements</span>
                <strong>Emergency alerts, policy updates, meetings</strong>
              </div>
              <div className="announcement-list" aria-label="Facility announcements">
                {facilityAnnouncements.map((announcement) => (
                  <article key={announcement.title}>
                    <div>
                      <strong>{announcement.title}</strong>
                      <span>{announcement.audience}</span>
                    </div>
                    <span className={`announcement-priority ${announcement.priority.toLowerCase()}`}>
                      {announcement.priority}
                    </span>
                    <p>{announcement.readReceipts}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="communication-panel integration-panel">
              <div className="card-heading">
                <span>Communication integration contract</span>
                <strong>Notification, resident, configuration, print, and audit hooks</strong>
              </div>
              <ul className="check-list">
                {communicationIntegrationRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card family-center" id="family-portal" aria-labelledby="family-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 12</p>
              <h2 id="family-title">Family Portal</h2>
              <p>
                Permissioned family transparency with resident overviews, approved care updates, documents,
                secure messages, appointments, billing visibility, and family-specific notifications.
              </p>
            </div>
            <div className="family-status">
              <span>Family transparency</span>
              <strong>Role-based access</strong>
            </div>
          </div>

          <div className="family-metric-grid">
            {familyMetrics.map((metric) => (
              <article className="family-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="family-layout">
            <div className="family-panel">
              <div className="card-heading">
                <span>Family Dashboard</span>
                <strong>Resident transparency surfaces</strong>
              </div>
              <div className="family-dashboard-grid" aria-label="Family dashboard cards">
                {familyDashboardCards.map((card) => (
                  <article key={card.title}>
                    <div>
                      <strong>{card.title}</strong>
                      <span className={`family-access-pill ${card.visibility.toLowerCase()}`}>{card.visibility}</span>
                    </div>
                    <p>{card.summary}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="family-panel">
              <div className="card-heading">
                <span>Family Communication</span>
                <strong>Secure family messaging</strong>
              </div>
              <div className="family-message-list" aria-label="Family messages">
                {familyMessages.map((message) => (
                  <article key={`${message.resident}-${message.subject}`}>
                    <div>
                      <strong>{message.subject}</strong>
                      <span>
                        {message.resident} | {message.participants}
                      </span>
                    </div>
                    <p>{message.lastActivity}</p>
                    <span className={`family-message-status ${message.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {message.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="family-layout">
            <div className="family-panel">
              <div className="card-heading">
                <span>Family Notifications</span>
                <strong>Medication, incident, appointment, document alerts</strong>
              </div>
              <div className="family-notification-list" aria-label="Family notifications">
                {familyNotifications.map((notification) => (
                  <article key={`${notification.type}-${notification.resident}`}>
                    <span>{notification.type}</span>
                    <div>
                      <strong>{notification.resident}</strong>
                      <p>{notification.message}</p>
                    </div>
                    <small>{notification.channel}</small>
                  </article>
                ))}
              </div>
            </div>

            <div className="family-panel">
              <div className="card-heading">
                <span>Role-based permissions</span>
                <strong>Resident-scoped family access</strong>
              </div>
              <ul className="family-permission-list">
                {familyPermissionRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="family-panel integration-panel">
            <div className="card-heading">
              <span>Family portal integration contract</span>
              <strong>Communication, notification, resident, configuration, print, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {familyIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`content-card billing-center${routeClass('clinical')}`} id="billing-center" aria-labelledby="billing-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 13</p>
              <h2 id="billing-title">Billing & Financial Operations</h2>
              <p>
                Revenue operations for recurring charges, level-of-care billing, move-in and move-out charges,
                ancillary services, invoices, statements, payments, credits, refunds, aging, and collections.
              </p>
            </div>
            <div className="billing-status">
              <span>Revenue operations</span>
              <strong>Aging tracked</strong>
            </div>
          </div>

          <LiveWorkflowRecords title="Live billing API records" records={liveBilling} fields={['type', 'description', 'amountCents', 'status']} emptyText="No billing charges loaded yet." />

          <div className="billing-metric-grid">
            {billingMetrics.map((metric) => (
              <article className="billing-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="billing-operation-panel">
            <div className="card-heading">
              <span>Billing Center</span>
              <strong>Financial operations supported</strong>
            </div>
            <div className="billing-operation-grid" aria-label="Billing operations">
              {billingOperations.map((operation) => (
                <span key={operation}>{operation}</span>
              ))}
            </div>
          </div>

          <div className="billing-layout">
            <div className="billing-panel">
              <div className="card-heading">
                <span>Charges</span>
                <strong>Recurring, level of care, move-in, ancillary</strong>
              </div>
              <div className="charge-list" aria-label="Charge items">
                {chargeItems.map((charge) => (
                  <article key={`${charge.type}-${charge.resident}`}>
                    <div>
                      <strong>{charge.type}</strong>
                      <span>
                        {charge.resident} | {charge.frequency}
                      </span>
                    </div>
                    <p>{charge.amount}</p>
                    <span className={`billing-status-pill ${charge.status.toLowerCase()}`}>{charge.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="billing-panel">
              <div className="card-heading">
                <span>Invoices and statements</span>
                <strong>Balances and due dates</strong>
              </div>
              <div className="invoice-list" aria-label="Invoices">
                {invoiceItems.map((invoice) => (
                  <article key={invoice.invoice}>
                    <div>
                      <strong>{invoice.invoice}</strong>
                      <span>{invoice.resident}</span>
                    </div>
                    <p>
                      {invoice.balance} | Due {invoice.dueDate}
                    </p>
                    <span className={`billing-status-pill ${invoice.status.toLowerCase()}`}>{invoice.status}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="billing-layout">
            <div className="billing-panel">
              <div className="card-heading">
                <span>Payments, credits, refunds</span>
                <strong>Posted financial activity</strong>
              </div>
              <div className="payment-list" aria-label="Payment activity">
                {paymentActivity.map((activity) => (
                  <article key={`${activity.type}-${activity.resident}-${activity.amount}`}>
                    <span>{activity.type}</span>
                    <div>
                      <strong>{activity.resident}</strong>
                      <p>
                        {activity.amount} | {activity.method}
                      </p>
                    </div>
                    <small>{activity.posted}</small>
                  </article>
                ))}
              </div>
            </div>

            <div className="billing-panel">
              <div className="card-heading">
                <span>Aging Reports</span>
                <strong>30 / 60 / 90 day tracking</strong>
              </div>
              <div className="aging-grid" aria-label="Aging report">
                {agingReport.map((item) => (
                  <article key={item.bucket}>
                    <span>{item.bucket}</span>
                    <strong>{item.balance}</strong>
                    <small>{item.accounts}</small>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="billing-panel integration-panel">
            <div className="card-heading">
              <span>Billing integration contract</span>
              <strong>Resident, family, print, notification, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {billingIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`content-card workflow-center${routeClass('operations')}`} id="workflow-automation-engine" aria-labelledby="workflow-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 14</p>
              <h2 id="workflow-title">Workflow Automation Engine</h2>
              <p>
                No-code workflow builder using trigger, condition, and action logic to automate notifications,
                tasks, family updates, pharmacy follow-up, document requests, and review queues.
              </p>
            </div>
            <div className="workflow-status">
              <span>No-code builder</span>
              <strong>Audit every action</strong>
            </div>
          </div>

          <div className="live-workflow-grid">
            <LiveWorkflowRecords title="Live background job status" records={liveJobs} fields={['type', 'status', 'priority', 'attempts', 'lastError']} emptyText="No background jobs loaded yet." />
            <LiveWorkflowRecords title="Live operational record history" records={liveOperationalRecords} fields={['module', 'recordType', 'status', 'title']} emptyText="No operational records loaded yet." />
          </div>

          <div className="workflow-metric-grid">
            {workflowMetrics.map((metric) => (
              <article className="workflow-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="workflow-builder-panel">
            <div className="card-heading">
              <span>Workflow Structure</span>
              <strong>Trigger, condition, action</strong>
            </div>
            <div className="workflow-builder-grid" aria-label="Workflow builder parts">
              {workflowBuilderParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </div>
          </div>

          <div className="workflow-layout">
            <div className="workflow-panel">
              <div className="card-heading">
                <span>Workflow Templates</span>
                <strong>Reusable automation rules</strong>
              </div>
              <div className="workflow-template-list" aria-label="Workflow templates">
                {workflowTemplates.map((template) => (
                  <article key={template.name}>
                    <div>
                      <strong>{template.name}</strong>
                      <span>{template.trigger}</span>
                    </div>
                    <dl>
                      <div>
                        <dt>Condition</dt>
                        <dd>{template.condition}</dd>
                      </div>
                      <div>
                        <dt>Action</dt>
                        <dd>{template.action}</dd>
                      </div>
                    </dl>
                    <span className={`workflow-status-pill ${template.status.toLowerCase()}`}>{template.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="workflow-panel">
              <div className="card-heading">
                <span>Automation Examples</span>
                <strong>Cross-module triggers</strong>
              </div>
              <div className="automation-example-list" aria-label="Automation examples">
                {automationExamples.map((example) => (
                  <span key={example}>{example}</span>
                ))}
              </div>
              <div className="automation-activity-list" aria-label="Automation activity">
                {automationActivity.map((activity) => (
                  <article key={`${activity.workflow}-${activity.timestamp}`}>
                    <strong>{activity.workflow}</strong>
                    <p>{activity.event}</p>
                    <span>{activity.result}</span>
                    <small>{activity.timestamp}</small>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="workflow-panel integration-panel">
            <div className="card-heading">
              <span>Workflow integration contract</span>
              <strong>Configuration, notification, resident, tasks, family, pharmacy, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {workflowIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card academy-center" id="hubsteria-academy" aria-labelledby="academy-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 15</p>
              <h2 id="academy-title">Hubsteria Academy</h2>
              <p>
                Training center with knowledge base articles, videos, interactive walkthroughs, role-based
                learning paths, certifications, expiring certification tracking, and AI help guidance.
              </p>
            </div>
            <div className="academy-status">
              <span>Training center</span>
              <strong>Role-based learning</strong>
            </div>
          </div>

          <div className="academy-metric-grid">
            {academyMetrics.map((metric) => (
              <article className="academy-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="academy-layout">
            <div className="academy-panel">
              <div className="card-heading">
                <span>Training Center</span>
                <strong>Knowledge base, videos, walkthroughs</strong>
              </div>
              <div className="training-resource-list" aria-label="Training resources">
                {trainingResources.map((resource) => (
                  <article key={resource.title}>
                    <div>
                      <strong>{resource.title}</strong>
                      <span>
                        {resource.type} | {resource.audience}
                      </span>
                    </div>
                    <span className={`academy-status-pill ${resource.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {resource.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="academy-panel">
              <div className="card-heading">
                <span>Role-Based Learning Paths</span>
                <strong>Guided onboarding by role</strong>
              </div>
              <div className="learning-path-list" aria-label="Learning paths">
                {learningPaths.map((path) => (
                  <article key={path.role}>
                    <div className="learning-path-header">
                      <strong>{path.role}</strong>
                      <span>{path.progress}</span>
                    </div>
                    <div className="academy-chip-row">
                      {path.courses.map((course) => (
                        <span key={course}>{course}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="academy-layout">
            <div className="academy-panel">
              <div className="card-heading">
                <span>Certifications</span>
                <strong>Completed and expiring credentials</strong>
              </div>
              <div className="certification-list" aria-label="Certifications">
                {certifications.map((certification) => (
                  <article key={`${certification.name}-${certification.holder}`}>
                    <div>
                      <strong>{certification.name}</strong>
                      <span>{certification.holder}</span>
                    </div>
                    <p>{certification.expires}</p>
                    <span className={`academy-status-pill ${certification.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {certification.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="academy-panel">
              <div className="card-heading">
                <span>AI Help Assistant</span>
                <strong>Immediate workflow guidance</strong>
              </div>
              <div className="ai-help-list" aria-label="AI help examples">
                {aiHelpExamples.map((example) => (
                  <article key={example.question}>
                    <strong>{example.question}</strong>
                    <p>{example.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="academy-panel integration-panel">
            <div className="card-heading">
              <span>Academy integration contract</span>
              <strong>Configuration, notifications, dashboards, help, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {academyIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card support-center" id="help-desk-support-center" aria-labelledby="support-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 16</p>
              <h2 id="support-title">Help Desk & Support Center</h2>
              <p>
                Production support operations with ticket categories, screenshots, screen recordings, knowledge
                base linking, permission-based remote assistance, response tracking, and resolution analytics.
              </p>
            </div>
            <div className="support-status">
              <span>Support operations</span>
              <strong>Permission based</strong>
            </div>
          </div>

          <div className="support-metric-grid">
            {supportMetrics.map((metric) => (
              <article className="support-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="support-layout">
            <div className="support-panel">
              <div className="card-heading">
                <span>Ticket System</span>
                <strong>Clinical, medication, billing, technical</strong>
              </div>
              <div className="support-ticket-list" aria-label="Support tickets">
                {supportTickets.map((ticket) => (
                  <article key={ticket.ticket}>
                    <div>
                      <strong>{ticket.ticket}</strong>
                      <span>
                        {ticket.category} | {ticket.requester}
                      </span>
                    </div>
                    <p>{ticket.subject}</p>
                    <span className={`support-priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                    <span className={`support-ticket-status ${ticket.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="support-panel">
              <div className="card-heading">
                <span>Support Capabilities</span>
                <strong>Production support toolkit</strong>
              </div>
              <div className="support-capability-grid" aria-label="Support capabilities">
                {supportCapabilities.map((capability) => (
                  <span key={capability}>{capability}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="support-layout">
            <div className="support-panel">
              <div className="card-heading">
                <span>Knowledge Base Linking</span>
                <strong>Articles connected to tickets</strong>
              </div>
              <div className="support-knowledge-list" aria-label="Support knowledge links">
                {supportKnowledgeLinks.map((link) => (
                  <article key={link.article}>
                    <strong>{link.article}</strong>
                    <span>
                      {link.linkedTicket} | {link.module}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="support-panel">
              <div className="card-heading">
                <span>Remote Assistance</span>
                <strong>Permission-based sessions</strong>
              </div>
              <ul className="remote-assistance-list">
                {remoteAssistanceRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="support-panel integration-panel">
            <div className="card-heading">
              <span>Support integration contract</span>
              <strong>Notifications, Academy, configuration, executive analytics, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {supportIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card executive-center" id="executive-command-center" aria-labelledby="executive-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 17</p>
              <h2 id="executive-title">Executive Command Center</h2>
              <p>
                Multi-facility executive intelligence for occupancy, revenue, medication compliance, incidents,
                assessments, staffing, training, billing, survey readiness, compliance, and facility health.
              </p>
            </div>
            <div className="executive-status">
              <span>Multi-facility view</span>
              <strong>T1 / T2 leadership</strong>
            </div>
          </div>

          <div className="executive-metric-grid">
            {executiveMetrics.map((metric) => (
              <article className="executive-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="executive-layout">
            <div className="executive-panel">
              <div className="card-heading">
                <span>Executive Scores</span>
                <strong>Survey, compliance, facility health</strong>
              </div>
              <div className="executive-score-grid" aria-label="Executive scores">
                {executiveScores.map((score) => (
                  <article key={score.label}>
                    <span>{score.label}</span>
                    <strong>{score.score}</strong>
                    <p>{score.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="executive-panel">
              <div className="card-heading">
                <span>Executive Drilldowns</span>
                <strong>Clickable leadership views</strong>
              </div>
              <div className="executive-drilldown-grid" aria-label="Executive drilldowns">
                {executiveDrilldowns.map((drilldown) => (
                  <span key={drilldown}>{drilldown}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="executive-panel">
            <div className="card-heading">
              <span>Multi-Facility View</span>
              <strong>Facility performance ranking</strong>
            </div>
            <div className="facility-performance-list" aria-label="Facility performance">
              {facilityPerformance.map((facility) => (
                <article key={facility.facility}>
                  <strong>{facility.facility}</strong>
                  <span>Occupancy {facility.occupancy}</span>
                  <span>Med Compliance {facility.medicationCompliance}</span>
                  <span>Incidents {facility.incidents}</span>
                  <span>Survey {facility.surveyReadiness}</span>
                  <span>Health {facility.healthScore}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="executive-panel integration-panel">
            <div className="card-heading">
              <span>Executive integration contract</span>
              <strong>Multi-facility, notification, print, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {executiveIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card ai-center" id="ai-assistant-insights" aria-labelledby="ai-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 18</p>
              <h2 id="ai-title">AI Assistant & Insights Layer</h2>
              <p>
                AI-assisted resident summaries, compliance risk detection, family update drafts, and knowledge
                guidance with staff approval, auditability, and module-aware context.
              </p>
            </div>
            <div className="ai-status">
              <span>AI assistive layer</span>
              <strong>Approval required</strong>
            </div>
          </div>

          <div className="ai-metric-grid">
            {aiMetrics.map((metric) => (
              <article className="ai-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="ai-layout">
            <div className="ai-panel">
              <div className="card-heading">
                <span>AI Resident Summary</span>
                <strong>Last 30 days</strong>
              </div>
              <div className="ai-summary-list" aria-label="AI resident summaries">
                {aiResidentSummaries.map((summary) => (
                  <article key={summary.resident}>
                    <div className="ai-summary-header">
                      <strong>{summary.resident}</strong>
                      <span>{summary.period}</span>
                    </div>
                    <p>{summary.summary}</p>
                    <div className="ai-chip-row">
                      {summary.highlights.map((highlight) => (
                        <span key={highlight}>{highlight}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="ai-panel">
              <div className="card-heading">
                <span>AI Compliance Assistant</span>
                <strong>Risk detection and recommendations</strong>
              </div>
              <div className="ai-compliance-list" aria-label="AI compliance insights">
                {aiComplianceInsights.map((insight) => (
                  <article key={insight.risk}>
                    <div>
                      <strong>{insight.risk}</strong>
                      <span>{insight.module}</span>
                    </div>
                    <p>{insight.recommendation}</p>
                    <span className={`ai-severity-pill ${insight.severity.toLowerCase()}`}>{insight.severity}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="ai-layout">
            <div className="ai-panel">
              <div className="card-heading">
                <span>AI Family Update Drafts</span>
                <strong>Staff approval before sending</strong>
              </div>
              <div className="ai-family-draft-list" aria-label="AI family update drafts">
                {aiFamilyDrafts.map((draft) => (
                  <article key={`${draft.resident}-${draft.topic}`}>
                    <div>
                      <strong>{draft.topic}</strong>
                      <span>{draft.resident}</span>
                    </div>
                    <p>{draft.draft}</p>
                    <small>{draft.approval}</small>
                  </article>
                ))}
              </div>
            </div>

            <div className="ai-panel">
              <div className="card-heading">
                <span>AI Knowledge Assistant</span>
                <strong>Module-aware guidance</strong>
              </div>
              <div className="ai-knowledge-list" aria-label="AI knowledge answers">
                {aiKnowledgeAnswers.map((answer) => (
                  <article key={answer.question}>
                    <strong>{answer.question}</strong>
                    <p>{answer.answer}</p>
                    <span>{answer.module}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="ai-panel integration-panel">
            <div className="card-heading">
              <span>AI integration contract</span>
              <strong>Resident, compliance, family, knowledge, and audit hooks</strong>
            </div>
            <ul className="check-list">
              {aiIntegrationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-card performance-center" id="performance-scalability" aria-labelledby="performance-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 19</p>
              <h2 id="performance-title">Performance & Scalability</h2>
              <p>
                Scale foundation for caching, background processing, queueing, optimized search, database
                indexing, lazy loading, infinite scroll, offline mobile support, load testing, and stress testing.
              </p>
            </div>
            <div className="performance-status">
              <span>Scale target</span>
              <strong>Thousands of facilities</strong>
            </div>
          </div>

          <div className="performance-metric-grid">
            {performanceMetrics.map((metric) => (
              <article className="performance-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="performance-layout">
            <div className="performance-panel">
              <div className="card-heading">
                <span>Scalability Capabilities</span>
                <strong>Platform services for expansion</strong>
              </div>
              <div className="scale-capability-list" aria-label="Scale capabilities">
                {scaleCapabilities.map((capability) => (
                  <article key={capability.name}>
                    <div>
                      <strong>{capability.name}</strong>
                      <p>{capability.purpose}</p>
                    </div>
                    <span className={`performance-status-pill ${capability.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {capability.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="performance-panel">
              <div className="card-heading">
                <span>Load and Stress Testing</span>
                <strong>Critical performance scenarios</strong>
              </div>
              <div className="load-test-list" aria-label="Load test targets">
                {loadTestTargets.map((target) => (
                  <article key={target.scenario}>
                    <div>
                      <strong>{target.scenario}</strong>
                      <p>{target.target}</p>
                    </div>
                    <span className={`performance-status-pill ${target.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {target.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="performance-layout">
            <div className="performance-panel">
              <div className="card-heading">
                <span>Scalability Architecture</span>
                <strong>Tenant-safe performance patterns</strong>
              </div>
              <ul className="scalability-list">
                {scalabilityArchitecture.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="performance-panel integration-panel">
              <div className="card-heading">
                <span>Performance integration contract</span>
                <strong>Budgets, CI, monitoring, load testing, and tenant safety</strong>
              </div>
              <ul className="check-list">
                {performanceIntegrationRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={`content-card production-center${routeClass('production')}`} id="production-hardening" aria-labelledby="production-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 20</p>
              <h2 id="production-title">Production Hardening & Enterprise Readiness</h2>
              <p>
                Final readiness layer for HIPAA review, penetration testing, audit validation, backups,
                disaster recovery, high availability, monitoring, error tracking, CI, deployment, and enterprise documentation.
              </p>
            </div>
            <div className="production-status">
              <span>Release candidate</span>
              <strong>Go-live gated</strong>
            </div>
          </div>

          <div className="production-metric-grid">
            {productionMetrics.map((metric) => (
              <article className="production-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>

          <div className="production-layout">
            <div className="production-panel">
              <div className="card-heading">
                <span>Production Checklist</span>
                <strong>Hardening and enterprise gates</strong>
              </div>
              <div className="production-checklist" aria-label="Production checklist">
                {productionChecklist.map((item) => (
                  <article key={item.area}>
                    <div>
                      <strong>{item.area}</strong>
                      <p>{item.detail}</p>
                    </div>
                    <span className={`production-status-pill ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {item.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="production-panel">
              <div className="card-heading">
                <span>Deployment Pipeline</span>
                <strong>Release candidate steps</strong>
              </div>
              <div className="deployment-step-grid" aria-label="Deployment pipeline steps">
                {deploymentPipelineSteps.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>

              <div className="card-heading">
                <span>Enterprise Documentation</span>
                <strong>Go-live support materials</strong>
              </div>
              <div className="enterprise-document-grid" aria-label="Enterprise documents">
                {enterpriseDocuments.map((document) => (
                  <span key={document}>{document}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="production-panel integration-panel">
            <div className="card-heading">
              <span>Production readiness contract</span>
              <strong>Security, regression, monitoring, integrations, docs, and signoff</strong>
            </div>
            <ul className="check-list">
              {productionReadinessRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-grid two-column" id="global-rules" aria-labelledby="global-rules-title">
          <div className="content-card">
            <p className="eyebrow">Phase 0</p>
            <h2 id="global-rules-title">Master global protocol</h2>
            <p>
              These rules are treated as permanent product constraints for every page, tab, modal, report, print
              surface, integration, and future module.
            </p>
            <ul className="check-list">
              {globalRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="content-card accent">
            <p className="eyebrow">Bootstrap security</p>
            <h2>Initial T1 account</h2>
            <dl className="definition-list">
              <div>
                <dt>Email</dt>
                <dd>{masterBootstrapAccount.email}</dd>
              </div>
              <div>
                <dt>Credential source</dt>
                <dd>{masterBootstrapAccount.credentialSource}</dd>
              </div>
              <div>
                <dt>Security note</dt>
                <dd>{masterBootstrapAccount.note}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="content-card" id="dashboards" aria-labelledby="dashboards-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 1.5</p>
              <h2 id="dashboards-title">Role-aware command dashboards</h2>
              <p>
                Switch between platform, organization, and facility scopes. T1 sees all; T2 sees only their
                organization; T3 sees one facility.
              </p>
            </div>
            <div className="segmented-control" aria-label="Dashboard scope">
              {(Object.keys(scopeMetrics) as DashboardScope[]).map((option) => (
                <button
                  className={option === scope ? 'active' : ''}
                  key={option}
                  onClick={() => setScope(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="metric-grid">
            {scopeMetrics[scope].map((metric) => (
              <article className={`metric-card ${metric.tone}`} key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.trend}</small>
              </article>
            ))}
          </div>

          <div className="quick-action-bar" aria-label={`${scope} quick actions`}>
            {quickActions[scope].map((action) => (
              <button key={action} type="button">
                {action}
              </button>
            ))}
          </div>
        </section>

        <section className={`content-card resident-command-center${routeClass('resident')}`} id="resident-command-center" aria-labelledby="resident-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Phase 2</p>
              <h2 id="resident-title">Resident Command Center</h2>
              <p>
                This becomes the primary resident workspace. Every future clinical, operational, billing,
                notification, and print module must connect back to this resident context.
              </p>
            </div>
            <div className="resident-scope">
              <span>{residentCommandCenter.organization}</span>
              <strong>{residentCommandCenter.facility}</strong>
            </div>
          </div>

          <div className="live-workflow-grid">
            <LiveWorkflowRecords title="Live resident assessments" records={liveAssessments} fields={['type', 'status', 'score']} emptyText="Load assessments to replace static assessment timeline data." />
            <LiveWorkflowRecords title="Live resident tasks/eMAR" records={[...liveTasks, ...liveMedications]} fields={['title', 'medication', 'status', 'dueAt', 'schedule']} emptyText="Load tasks or eMAR orders to replace static task/medication timeline data." />
            <LiveWorkflowRecords title="Live incidents/billing" records={[...liveIncidents, ...liveBilling]} fields={['type', 'summary', 'description', 'amountCents', 'status']} emptyText="Load incidents or billing records to replace static incident/billing timeline data." />
          </div>

          <div className="resident-hero">
            <div className="resident-photo" aria-hidden="true">
              {residentCommandCenter.photoInitials}
            </div>
            <div className="resident-identity">
              <span>Resident Profile</span>
              <h3>{residentCommandCenter.name}</h3>
              <p>
                Room {residentCommandCenter.room} | Age {residentCommandCenter.age} |{' '}
                {residentCommandCenter.levelOfCare}
              </p>
            </div>
            <div className="risk-stack" aria-label="Resident risk indicators">
              {residentCommandCenter.risks.map((risk) => (
                <span className={`risk-pill ${risk.tone}`} key={risk.label}>
                  {risk.label}
                </span>
              ))}
            </div>
          </div>

          <div className="resident-quick-actions" aria-label="Resident quick actions">
            {residentCommandCenter.quickActions.map((action) => (
              <button type="button" key={action}>
                {action}
              </button>
            ))}
          </div>

          <div className="resident-layout">
            <div>
              <h3>Profile sections</h3>
              <div className="profile-section-grid">
                {residentCommandCenter.profileSections.map((section) => (
                  <article className="profile-section-card" key={section.title}>
                    <h4>{section.title}</h4>
                    <p>{section.summary}</p>
                    <dl>
                      {section.fields.map((field) => (
                        <div key={field.label}>
                          <dt>{field.label}</dt>
                          <dd>{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            </div>

            <aside className="resident-timeline" aria-label="Resident timeline">
              <div className="timeline-header">
                <h3>Timeline</h3>
                <span>Live history</span>
              </div>
              {residentCommandCenter.timeline.map((event) => (
                <article className="timeline-event" key={`${event.type}-${event.title}`}>
                  <span>{event.type}</span>
                  <h4>{event.title}</h4>
                  <p>{event.detail}</p>
                  <time>{event.time}</time>
                </article>
              ))}
            </aside>
          </div>

          <div className="module-connection-panel">
            <div>
              <p className="eyebrow">Resident Command Center rule</p>
              <h3>Future modules connect here first</h3>
              <p>
                New modules must expose resident-aware entry points, timeline events, notification triggers,
                audit records, and Print Center Pro output from the Resident Command Center.
              </p>
            </div>
            <div className="module-chip-grid" aria-label="Connected future modules">
              {residentCommandCenter.moduleConnections.map((module) => (
                <span key={module}>{module}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="content-card" id="hierarchy" aria-labelledby="hierarchy-title">
          <p className="eyebrow">Enterprise hierarchy</p>
          <h2 id="hierarchy-title">{'T1 -> T2 -> T2.5 -> T3 -> employees'}</h2>
          <div className="role-grid">
            {hierarchy.map((role) => (
              <article className="role-card" key={role.tier}>
                <div className="role-card-header">
                  <span>{role.tier}</span>
                  <h3>{role.name}</h3>
                </div>
                <p>{role.description}</p>
                <details>
                  <summary>Permissions and scope</summary>
                  <strong>Can view</strong>
                  <ul>
                    {role.canView.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <strong>Permissions</strong>
                  <ul>
                    {role.permissions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {role.restrictions ? (
                    <>
                      <strong>Restrictions</strong>
                      <ul>
                        {role.restrictions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </details>
              </article>
            ))}
          </div>
        </section>

        <section className="section-grid two-column" id="feature-registry" aria-labelledby="feature-registry-title">
          <div className="content-card">
            <p className="eyebrow">Feature registry</p>
            <h2 id="feature-registry-title">Every feature is registered before expansion</h2>
            <div className="registry-list">
              {featureRegistry.map((feature) => (
                <article key={feature.featureName}>
                  <div>
                    <strong>{feature.featureName}</strong>
                    <span>{feature.module}</span>
                  </div>
                  <span className={`pill ${feature.status}`}>{feature.status}</span>
                  <small>
                    v{feature.version} | Dependencies: {feature.dependencies.join(', ')}
                  </small>
                </article>
              ))}
            </div>
          </div>

          <div className="content-card">
            <p className="eyebrow">Immutable audit requirements</p>
            <h2>Administrative actions are always logged</h2>
            <div className="audit-grid">
              {auditRequirements.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p>
              Required audit payload: user, role, timestamp, affected entity, before state, after state,
              facility, and organization.
            </p>
          </div>
        </section>

        <section className="content-card" id="roadmap" aria-labelledby="roadmap-title">
          <div className="section-header">
            <div>
              <p className="eyebrow">Milestone sequence</p>
              <h2 id="roadmap-title">{'Phase 0 -> Phase 1 -> Phase 1.5 -> Phase 2 and beyond'}</h2>
              <p>
                Complete, test, and stabilize each milestone before moving to the next clinical, operations, or
                enterprise phase.
              </p>
            </div>
            <span className="result-count">{filteredPhases.length} shown</span>
          </div>

          <RoadmapGroup title="Foundation phases" phases={filteredPhases.filter((phase) => foundationPhases.includes(phase))} />
          <RoadmapGroup
            title="Clinical and operations phases"
            phases={filteredPhases.filter((phase) => clinicalOperationsPhases.includes(phase))}
          />
          <RoadmapGroup
            title="Enterprise phases"
            phases={filteredPhases.filter((phase) => enterprisePhases.includes(phase))}
          />
        </section>
      </main>
    </div>
  );
}

function RoadmapGroup({ title, phases }: { title: string; phases: Phase[] }) {
  if (phases.length === 0) {
    return null;
  }

  return (
    <div className="roadmap-group">
      <h3>{title}</h3>
      <div className="roadmap-grid">
        {phases.map((phase) => (
          <article className="phase-card" key={phase.id}>
            <div className="phase-card-header">
              <span>Phase {phase.id}</span>
              <span className={`pill ${phase.status}`}>{phase.status}</span>
            </div>
            <h4>{phase.title}</h4>
            <p>{phase.summary}</p>
            <strong>{phase.milestone}</strong>
            <ul>
              {phase.deliverables.slice(0, 4).map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function summarizeApiResult(result: unknown): string {
  if (!result || typeof result !== 'object') {
    return 'completed';
  }

  const response = result as { ok?: boolean; status?: number; data?: unknown; error?: { message?: string } };

  if (response.ok === false) {
    return `error ${response.status ?? ''} ${response.error?.message ?? ''}`.trim();
  }

  if (Array.isArray(response.data)) {
    return `ok ${response.status ?? 200}, ${response.data.length} records`;
  }

  if (response.data && typeof response.data === 'object' && 'sessionId' in response.data) {
    return `ok, session ${(response.data as { sessionId: string }).sessionId}`;
  }

  return `ok ${response.status ?? 200}`;
}

function extractApiRecords(result: unknown): LiveApiRecord[] | null {
  if (!result || typeof result !== 'object') {
    return null;
  }

  const response = result as { ok?: boolean; data?: unknown };
  return response.ok && Array.isArray(response.data) ? (response.data as LiveApiRecord[]) : null;
}

function LiveWorkflowRecords({
  title,
  records,
  fields,
  emptyText
}: {
  title: string;
  records: LiveApiRecord[];
  fields: string[];
  emptyText: string;
}) {
  return (
    <div className={`live-workflow-panel ${records.length ? 'has-records' : ''}`}>
      <div className="card-heading">
        <span>Real API data</span>
        <strong>{title}</strong>
      </div>
      {records.length ? (
        <div className="live-workflow-list">
          {records.slice(0, 4).map((record, index) => (
            <article key={String(record.id ?? `${title}-${index}`)}>
              {fields.map((field) =>
                record[field] === undefined ? null : (
                  <span key={field}>
                    <strong>{field}</strong>
                    {String(record[field])}
                  </span>
                )
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}

function normalizeMedPassAction(action: string) {
  const normalized = action.toLowerCase();
  if (normalized.includes('refuse')) return 'refused';
  if (normalized.includes('hold')) return 'held';
  if (normalized.includes('absent')) return 'resident_absent';
  if (normalized.includes('available')) return 'not_available';
  return 'given';
}

export default App;
