import { useEffect, useMemo, useRef, useState } from 'react';
import {
  allPhases,
  clinicalOperationsPhases,
  enterprisePhases,
  foundationPhases,
  type Phase
} from './data/roadmap';
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
            <strong>Phase 0-3</strong>
            <span>Productivity layer active</span>
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
