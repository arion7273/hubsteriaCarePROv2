import { useMemo, useState } from 'react';
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

const commandSuggestions = [
  'Search resident: Maria Alvarez',
  'Create incident report',
  'Open Print Center Pro',
  'Review DigitalRX sync warnings',
  'Launch medication compliance dashboard',
  'Invite facility administrator'
];

function App() {
  const [scope, setScope] = useState<DashboardScope>('T1 Master');
  const [query, setQuery] = useState('');

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

  return (
    <div className="app-shell">
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
          {['Command', 'Global Rules', 'Dashboards', 'Hierarchy', 'Feature Registry', 'Roadmap'].map((item) => (
            <a href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" />
          <div>
            <strong>Phase 0-1.5</strong>
            <span>Foundation active</span>
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
              Search roadmap milestones now; the same interaction model is reserved for residents, staff,
              incidents, assessments, medications, reports, and quick actions.
            </p>
          </div>
          <div className="command-box">
            <label htmlFor="global-search">Global search</label>
            <input
              id="global-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search phases, modules, integrations..."
            />
            <div className="suggestions" aria-label="Command suggestions">
              {commandSuggestions.map((suggestion) => (
                <span key={suggestion}>{suggestion}</span>
              ))}
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
