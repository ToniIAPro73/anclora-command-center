import vaultData from './generated/vault-data.json'
import './App.css'

type LabelValue = {
  label: string
  value: string
}

type Partner = {
  title: string
  status: string
  influenceLevel: string
  company: string
  role: string
  location: string
  contactChannel: string
  trustLevel: string
  summary: string
  executiveBullets: string[]
  nextAction: string
  projectLinks: string[]
  personalNotes: string
}

const data = vaultData as {
  generatedAt: string
  commandCenter: {
    executivePulse: string[]
    partnerRadar: { name: string; influence: string; summary: string }[]
    stack: LabelValue[]
    route: string[]
    projects: Record<string, string>[]
    activity: { repo: string; pushedAt: string }[]
    synergies: string[]
    decisions: string[]
    communicationAssets: string[]
    swObjective: string[]
    monitorCoverage: { label: string; value: string } | null
    monitorAlerts: string[]
    quickActions: string[]
  }
  group: { meta: Record<string, unknown> }
  partners: Partner[]
}

function stripWikilinks(text: string) {
  return text.replace(/\[\[([^\]|]+)\|?([^\]]+)?\]\]/g, (_, target: string, label?: string) => label || target)
}

function Panel({
  eyebrow,
  title,
  children,
  accent = 'default',
}: {
  eyebrow?: string
  title: string
  children: React.ReactNode
  accent?: 'default' | 'signal' | 'warning'
}) {
  return (
    <section className={`panel panel--${accent}`}>
      {eyebrow ? <p className="panel__eyebrow">{eyebrow}</p> : null}
      <h2 className="panel__title">{title}</h2>
      <div className="panel__body">{children}</div>
    </section>
  )
}

function App() {
  const generatedAt = new Date(data.generatedAt).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <main className="dashboard-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Anclora Group Operating Surface</p>
          <h1>Anclora Command Center</h1>
          <p className="hero__lede">
            Dashboard operativo conectado a la bóveda. El contenido se genera desde{' '}
            <span>Anclora Command Center.md</span> y notas relacionadas para mantener una única fuente de verdad.
          </p>
          <div className="hero__meta">
            <span>Foco: {String(data.group.meta.territorio_foco ?? 'Suroeste de Mallorca')}</span>
            <span>Última sincronización: {generatedAt}</span>
          </div>
        </div>
        <aside className="hero__signal">
          <p className="hero__signal-label">Pulso Ejecutivo</p>
          <ul>
            {data.commandCenter.executivePulse.map((item) => (
              <li key={item}>{stripWikilinks(item)}</li>
            ))}
          </ul>
        </aside>
      </header>

      <section className="grid grid--top">
        <Panel eyebrow="Partners" title="Radar de Influencia" accent="signal">
          <div className="partner-grid">
            {data.commandCenter.partnerRadar.map((partner) => {
              const profile = data.partners.find((item) => item.title === partner.name)
              return (
                <article className="partner-card" key={partner.name}>
                  <div className="partner-card__header">
                    <div>
                      <p className="partner-card__name">{partner.name}</p>
                      <p className="partner-card__company">{profile?.company}</p>
                    </div>
                    <span className={`pill pill--${partner.influence.toLowerCase()}`}>{partner.influence}</span>
                  </div>
                  <p className="partner-card__summary">{partner.summary}</p>
                  {profile ? (
                    <dl className="partner-card__meta">
                      <div>
                        <dt>Rol</dt>
                        <dd>{profile.role}</dd>
                      </div>
                      <div>
                        <dt>Ubicación</dt>
                        <dd>{profile.location}</dd>
                      </div>
                      <div>
                        <dt>Estado</dt>
                        <dd>{profile.status}</dd>
                      </div>
                      <div>
                        <dt>Canal</dt>
                        <dd>{profile.contactChannel}</dd>
                      </div>
                    </dl>
                  ) : null}
                </article>
              )
            })}
          </div>
        </Panel>

        <Panel eyebrow="Mallorca / eXp" title="Stack Operativo">
          <div className="stack-list">
            {data.commandCenter.stack.map((item) => (
              <div className="stack-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{stripWikilinks(item.value)}</strong>
              </div>
            ))}
          </div>
          <div className="route">
            <h3>Ruta Operativa</h3>
            <ol>
              {data.commandCenter.route.map((step) => (
                <li key={step}>{stripWikilinks(step)}</li>
              ))}
            </ol>
          </div>
        </Panel>
      </section>

      <section className="grid grid--middle">
        <Panel eyebrow="Pipeline" title="Aplicaciones Activas">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {Object.keys(data.commandCenter.projects[0] ?? {}).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.commandCenter.projects.map((row) => (
                  <tr key={row.Nodo}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={`${row.Nodo}-${key}`}>{stripWikilinks(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel eyebrow="Prospección" title="Monitor SW Mallorca" accent="warning">
          <div className="coverage">
            <span className="coverage__value">{data.commandCenter.monitorCoverage?.value ?? '--'}</span>
            <p>{stripWikilinks(data.commandCenter.monitorCoverage?.label ?? '')}</p>
          </div>
          <h3>Alertas Nexus</h3>
          <ul className="signal-list">
            {data.commandCenter.monitorAlerts.map((alert) => (
              <li key={alert}>{stripWikilinks(alert)}</li>
            ))}
          </ul>
          <h3>Objetivo operativo</h3>
          <ul className="signal-list">
            {data.commandCenter.swObjective.map((item) => (
              <li key={item}>{stripWikilinks(item)}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="grid grid--bottom">
        <Panel eyebrow="GitHub" title="Actividad Reciente">
          <div className="activity-list">
            {data.commandCenter.activity.map((item) => (
              <article className="activity-item" key={item.repo}>
                <p>{item.repo}</p>
                <strong>{item.pushedAt}</strong>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Activación" title="Playbooks y Acciones">
          <div className="lists">
            <div>
              <h3>Sinergias</h3>
              <ul>
                {data.commandCenter.synergies.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Próximas decisiones</h3>
              <ul>
                {data.commandCenter.decisions.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Activos de comunicación</h3>
              <ul>
                {data.commandCenter.communicationAssets.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Acciones rápidas</h3>
              <ul>
                {data.commandCenter.quickActions.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      </section>
    </main>
  )
}

export default App
