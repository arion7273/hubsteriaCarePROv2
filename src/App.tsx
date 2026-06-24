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
            'Hierarchy',
            'Feature Registry',
            'Roadmap'
          ].map((item) => (
            <a href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div>
            <strong>Phase 0-5.5</strong>
            <span>Configuration active</span>
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
