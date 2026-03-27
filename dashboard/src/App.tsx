import { useEffect, useState } from 'react'
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
  commandCenterLocales: Record<'es' | 'en' | 'de', {
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
  }>
  group: { meta: Record<string, unknown> }
  partners: Partner[]
  partnersLocales: Record<'es' | 'en' | 'de', Partner[]>
}

const uiMessages = {
  es: {
    backToGroup: 'VOLVER A ANCLORA GROUP',
    brandLine: 'Control operativo del ecosistema',
    topbarThemeAria: 'Selector de tema',
    topbarLanguageAria: 'Selector de idioma',
    themeDark: 'Tema oscuro',
    themeLight: 'Tema claro',
    themeSystem: 'Tema del sistema',
    heroEyebrow: 'Superficie operativa de Anclora Group',
    heroTitle: 'Anclora Command Center',
    heroLedePrefix: 'Dashboard operativo conectado a la bóveda. El contenido se genera desde',
    heroLedeSuffix: 'y notas relacionadas para mantener una única fuente de verdad.',
    focusLabel: 'Foco',
    syncLabel: 'Última sincronización',
    executivePulse: 'Pulso Ejecutivo',
    paletteEyebrow: 'Paleta del sistema',
    paletteTitle: 'Interfaz premium en tiempo real',
    partnersEyebrow: 'Partners',
    partnersTitle: 'Radar de Influencia',
    roleLabel: 'Rol',
    locationLabel: 'Ubicación',
    statusLabel: 'Estado',
    channelLabel: 'Canal',
    stackEyebrow: 'Mallorca / eXp',
    stackTitle: 'Stack Operativo',
    routeTitle: 'Ruta Operativa',
    pipelineEyebrow: 'Pipeline',
    pipelineTitle: 'Aplicaciones Activas',
    prospectingEyebrow: 'Prospección',
    prospectingTitle: 'Monitor SW Mallorca',
    alertsTitle: 'Alertas Nexus',
    objectiveTitle: 'Objetivo operativo',
    githubEyebrow: 'GitHub',
    githubTitle: 'Actividad Reciente',
    activationEyebrow: 'Activación',
    activationTitle: 'Playbooks y Acciones',
    synergiesTitle: 'Sinergias',
    decisionsTitle: 'Próximas decisiones',
    communicationTitle: 'Activos de comunicación',
    quickActionsTitle: 'Acciones rápidas',
  },
  en: {
    backToGroup: 'BACK TO ANCLORA GROUP',
    brandLine: 'Operational control for the ecosystem',
    topbarThemeAria: 'Theme switcher',
    topbarLanguageAria: 'Language switcher',
    themeDark: 'Dark theme',
    themeLight: 'Light theme',
    themeSystem: 'System theme',
    heroEyebrow: 'Anclora Group operating surface',
    heroTitle: 'Anclora Command Center',
    heroLedePrefix: 'Operational dashboard connected to the vault. Content is generated from',
    heroLedeSuffix: 'and related notes to keep a single source of truth.',
    focusLabel: 'Focus',
    syncLabel: 'Last sync',
    executivePulse: 'Executive Pulse',
    paletteEyebrow: 'System palette',
    paletteTitle: 'Premium interface in real time',
    partnersEyebrow: 'Partners',
    partnersTitle: 'Influence Radar',
    roleLabel: 'Role',
    locationLabel: 'Location',
    statusLabel: 'Status',
    channelLabel: 'Channel',
    stackEyebrow: 'Mallorca / eXp',
    stackTitle: 'Operating Stack',
    routeTitle: 'Operating Route',
    pipelineEyebrow: 'Pipeline',
    pipelineTitle: 'Active Applications',
    prospectingEyebrow: 'Prospecting',
    prospectingTitle: 'SW Mallorca Monitor',
    alertsTitle: 'Nexus Alerts',
    objectiveTitle: 'Operating objective',
    githubEyebrow: 'GitHub',
    githubTitle: 'Recent Activity',
    activationEyebrow: 'Activation',
    activationTitle: 'Playbooks and Actions',
    synergiesTitle: 'Synergies',
    decisionsTitle: 'Next decisions',
    communicationTitle: 'Communication assets',
    quickActionsTitle: 'Quick actions',
  },
  de: {
    backToGroup: 'ZURÜCK ZU ANCLORA GROUP',
    brandLine: 'Operative Kontrolle des Ökosystems',
    topbarThemeAria: 'Themenauswahl',
    topbarLanguageAria: 'Sprachauswahl',
    themeDark: 'Dunkles Thema',
    themeLight: 'Helles Thema',
    themeSystem: 'Systemthema',
    heroEyebrow: 'Operative Oberfläche von Anclora Group',
    heroTitle: 'Anclora Command Center',
    heroLedePrefix: 'Operatives Dashboard, verbunden mit dem Vault. Der Inhalt wird aus',
    heroLedeSuffix: 'und verwandten Notizen erzeugt, um eine einzige Quelle der Wahrheit zu halten.',
    focusLabel: 'Fokus',
    syncLabel: 'Letzte Synchronisierung',
    executivePulse: 'Operativer Puls',
    paletteEyebrow: 'Systempalette',
    paletteTitle: 'Premium-Oberfläche in Echtzeit',
    partnersEyebrow: 'Partner',
    partnersTitle: 'Einflussradar',
    roleLabel: 'Rolle',
    locationLabel: 'Standort',
    statusLabel: 'Status',
    channelLabel: 'Kanal',
    stackEyebrow: 'Mallorca / eXp',
    stackTitle: 'Operativer Stack',
    routeTitle: 'Operative Route',
    pipelineEyebrow: 'Pipeline',
    pipelineTitle: 'Aktive Anwendungen',
    prospectingEyebrow: 'Akquise',
    prospectingTitle: 'SW-Mallorca-Monitor',
    alertsTitle: 'Nexus-Warnungen',
    objectiveTitle: 'Operatives Ziel',
    githubEyebrow: 'GitHub',
    githubTitle: 'Letzte Aktivität',
    activationEyebrow: 'Aktivierung',
    activationTitle: 'Playbooks und Aktionen',
    synergiesTitle: 'Synergien',
    decisionsTitle: 'Nächste Entscheidungen',
    communicationTitle: 'Kommunikationsassets',
    quickActionsTitle: 'Schnellaktionen',
  },
} as const

function stripWikilinks(text: string) {
  return text.replace(/\[\[([^\]|]+)\|?([^\]]+)?\]\]/g, (_, target: string, label?: string) => label || target)
}

function localizeFocus(value: string, language: 'es' | 'en' | 'de') {
  if (language === 'en') return value.replaceAll('Suroeste de Mallorca', 'Southwest Mallorca')
  if (language === 'de') return value.replaceAll('Suroeste de Mallorca', 'Südwesten Mallorcas')
  return value
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

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.5 3.5a8 8 0 1 0 5 14.2A8.5 8.5 0 0 1 15.5 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16h-11A2.5 2.5 0 0 1 4 13.5v-7ZM9 20h6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-command-center-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })
  const [language, setLanguage] = useState<'es' | 'en' | 'de'>('es')

  useEffect(() => {
    const root = document.documentElement
    const resolveTheme = () =>
      theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : theme

    root.dataset.theme = resolveTheme()
    window.localStorage.setItem('anclora-command-center-theme', theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      root.dataset.theme = media.matches ? 'light' : 'dark'
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES'
  const t = uiMessages[language]
  const commandCenter = data.commandCenterLocales[language] ?? data.commandCenter
  const partners = data.partnersLocales[language] ?? data.partners
  const generatedAt = new Date(data.generatedAt).toLocaleString(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a
          className="topbar__backlink"
          href="https://anclora-group.vercel.app/workspace"
          target="_blank"
          rel="noreferrer"
        >
          {t.backToGroup}
        </a>

        <div className="topbar__brand">
          <img
            className="topbar__brand-logo"
            src="/brand/logo-anclora-command-center.png"
            alt="Logo Anclora Command Center"
          />
          <div>
            <p className="topbar__brand-name">ANCLORA COMMAND CENTER</p>
            <p className="topbar__brand-line">{t.brandLine}</p>
          </div>
        </div>

        <div className="topbar__controls">
          <div className="topbar__toggle-group" aria-label={t.topbarThemeAria}>
            {([
              { value: 'dark', label: t.themeDark, icon: MoonIcon },
              { value: 'light', label: t.themeLight, icon: SunIcon },
              { value: 'system', label: t.themeSystem, icon: ScreenIcon },
            ] as const).map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.value}
                  type="button"
                  className={item.value === theme ? 'is-active' : ''}
                  onClick={() => setTheme(item.value)}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon />
                </button>
              )
            })}
          </div>

          <div className="topbar__toggle-group" aria-label={t.topbarLanguageAria}>
            {(['es', 'en', 'de'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={item === language ? 'is-active' : ''}
                onClick={() => setLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <header className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero__lede">
            {t.heroLedePrefix}{' '}
            <span>Anclora Command Center.md</span> {t.heroLedeSuffix}
          </p>
          <div className="hero__meta">
            <span>{t.focusLabel}: {localizeFocus(String(data.group.meta.territorio_foco ?? 'Suroeste de Mallorca'), language)}</span>
            <span>{t.syncLabel}: {generatedAt}</span>
          </div>
        </div>
        <div className="hero__aside">
          <aside className="hero__signal">
            <p className="hero__signal-label">{t.executivePulse}</p>
            <ul>
              {commandCenter.executivePulse.map((item) => (
                <li key={item}>{stripWikilinks(item)}</li>
              ))}
            </ul>
          </aside>
          <section className="hero__palette">
            <div className="hero__palette-copy">
              <p className="hero__signal-label">{t.paletteEyebrow}</p>
              <h2>{t.paletteTitle}</h2>
            </div>
            <img
              className="hero__palette-image"
              src="/brand/paleta-anclora-command-center.png"
              alt="Paleta visual de Anclora Command Center"
            />
          </section>
        </div>
      </header>

      <section className="grid grid--top">
        <Panel eyebrow={t.partnersEyebrow} title={t.partnersTitle} accent="signal">
          <div className="partner-grid">
            {commandCenter.partnerRadar.map((partner) => {
              const profile = partners.find((item) => item.title === partner.name)
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
                        <dt>{t.roleLabel}</dt>
                        <dd>{profile.role}</dd>
                      </div>
                      <div>
                        <dt>{t.locationLabel}</dt>
                        <dd>{profile.location}</dd>
                      </div>
                      <div>
                        <dt>{t.statusLabel}</dt>
                        <dd>{profile.status}</dd>
                      </div>
                      <div>
                        <dt>{t.channelLabel}</dt>
                        <dd>{profile.contactChannel}</dd>
                      </div>
                    </dl>
                  ) : null}
                </article>
              )
            })}
          </div>
        </Panel>

        <Panel eyebrow={t.stackEyebrow} title={t.stackTitle}>
          <div className="stack-list">
            {commandCenter.stack.map((item) => (
              <div className="stack-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{stripWikilinks(item.value)}</strong>
              </div>
            ))}
          </div>
          <div className="route">
            <h3>{t.routeTitle}</h3>
            <ol>
              {commandCenter.route.map((step) => (
                <li key={step}>{stripWikilinks(step)}</li>
              ))}
            </ol>
          </div>
        </Panel>
      </section>

      <section className="grid grid--middle">
        <Panel eyebrow={t.pipelineEyebrow} title={t.pipelineTitle}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {Object.keys(commandCenter.projects[0] ?? {}).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commandCenter.projects.map((row, index) => (
                  <tr key={Object.values(row)[0] ?? index}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={`${Object.values(row)[0] ?? index}-${key}`}>{stripWikilinks(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel eyebrow={t.prospectingEyebrow} title={t.prospectingTitle} accent="warning">
          <div className="coverage">
            <span className="coverage__value">{commandCenter.monitorCoverage?.value ?? '--'}</span>
            <p>{stripWikilinks(commandCenter.monitorCoverage?.label ?? '')}</p>
          </div>
          <h3>{t.alertsTitle}</h3>
          <ul className="signal-list">
            {commandCenter.monitorAlerts.map((alert) => (
              <li key={alert}>{stripWikilinks(alert)}</li>
            ))}
          </ul>
          <h3>{t.objectiveTitle}</h3>
          <ul className="signal-list">
            {commandCenter.swObjective.map((item) => (
              <li key={item}>{stripWikilinks(item)}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="grid grid--bottom">
        <Panel eyebrow={t.githubEyebrow} title={t.githubTitle}>
          <div className="activity-list">
            {commandCenter.activity.map((item) => (
              <article className="activity-item" key={item.repo}>
                <p>{item.repo}</p>
                <strong>{item.pushedAt}</strong>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow={t.activationEyebrow} title={t.activationTitle}>
          <div className="lists">
            <div>
              <h3>{t.synergiesTitle}</h3>
              <ul>
                {commandCenter.synergies.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.decisionsTitle}</h3>
              <ul>
                {commandCenter.decisions.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.communicationTitle}</h3>
              <ul>
                {commandCenter.communicationAssets.map((item) => (
                  <li key={item}>{stripWikilinks(item)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.quickActionsTitle}</h3>
              <ul>
                {commandCenter.quickActions.map((item) => (
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
