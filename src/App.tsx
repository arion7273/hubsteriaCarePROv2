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
import { residentCommandCenter } from './data/resident';

type DashboardScope = 'T1 Master' | 'T2 Organization' | 'T3 Facility';

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

function App() {
  const [scope, setScope] = useState<DashboardScope>('T1 Master');
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const globalSearchRef = useRef<HTMLInputElement>(null);

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
            <strong>Phase 0-11</strong>
            <span>Communication active</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
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

        <section className="content-card assessments-center" id="assessments-care-plans" aria-labelledby="assessments-title">
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

        <section className="content-card tasks-center" id="tasks-adls-services" aria-labelledby="tasks-title">
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

        <section className="content-card medication-center" id="emar-medication-management" aria-labelledby="medication-title">
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

          <div className="medication-metric-grid">
            {medicationMetrics.map((metric) => (
              <article className="medication-metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
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
                        <button type="button" key={action}>
                          {action}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
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

        <section className="content-card incidents-center" id="incidents-compliance-center" aria-labelledby="incidents-title">
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

        <section className="content-card resident-command-center" id="resident-command-center" aria-labelledby="resident-title">
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

export default App;
