import { useMemo, useState } from 'react'

import type { DashboardLanguage } from '../../shell/dashboard-shell.types'

type RealEstateApp = {
  app_id: string
  app_name: string
  ecosystem_role: string
  documented_state: string
  territory_focus: string
  action_now: string
  next_focus: string
  main_risks: string
  ecosystem_layer: string
  priority_band: string
}

type PriorityRankingItem = {
  rank: number
  app_id: string
  app_name: string
  priority_score: number
  priority_band: string
  documented_state: string
  action_now: string
  main_risks: string
  next_focus: string
}

type ActionCard = {
  app_id: string
  app_name: string
  priority_band: string
  title: string
  action_now: string
  why_now: string
}

type DistributionEntry = {
  label: string
  value: number
}

type RiskSummaryItem = {
  app_name: string
  priority_band: string
  main_risks: string
}

type DependencyNode = {
  id: string
  label: string
  layer: string
  band: string
}

type DependencyLink = {
  source: string
  target: string
  type: string
  label: string
}

type SourceItem = {
  app_name: string
  source_note: string
  source_type: string
  evidence_summary: string
}

export type RealEstateDataset = {
  generatedAt: string
  sourceWorkbook: string
  apps: RealEstateApp[]
  sources: SourceItem[]
  derived: {
    priorityRanking: PriorityRankingItem[]
    actionCards: ActionCard[]
    riskSummary: RiskSummaryItem[]
    layerDistribution: DistributionEntry[]
    confidenceSummary: DistributionEntry[]
    dependencyMap: {
      nodes?: DependencyNode[]
      links: DependencyLink[]
    }
  }
}

const layerLabels = {
  es: {
    all: 'Todas',
    'commercial-vertical': 'Vertical comercial',
    intelligence: 'Inteligencia',
    partnerships: 'Partnerships',
    operations: 'Operaciones',
    content: 'Contenido',
  },
  en: {
    all: 'All',
    'commercial-vertical': 'Commercial vertical',
    intelligence: 'Intelligence',
    partnerships: 'Partnerships',
    operations: 'Operations',
    content: 'Content',
  },
  de: {
    all: 'Alle',
    'commercial-vertical': 'Vertriebs-Vertikal',
    intelligence: 'Intelligenz',
    partnerships: 'Partnerschaften',
    operations: 'Betrieb',
    content: 'Inhalt',
  },
} as const

const bandLabels = {
  es: {
    critical: 'Crítica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  },
  en: {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  de: {
    critical: 'Kritisch',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
  },
} as const

const uiMessages = {
  es: {
    heroEyebrow: 'Vertical inmobiliario',
    heroTitle: 'Qué requiere atención ahora',
    heroLede:
      'Vista analítica consolidada para leer prioridad, riesgos, dependencias y siguiente acción del ecosistema Real Estate sin salir del shell unificado.',
    sourceLabel: 'Fuente',
    generatedLabel: 'Actualizado',
    scopeLabel: 'Apps en alcance',
    priorityCardEyebrow: 'Prioridad principal',
    priorityCardScore: 'Score',
    priorityCardRisk: 'Riesgo dominante',
    rankingEyebrow: 'Ranking',
    rankingTitle: 'Board de prioridades',
    rankingActionLabel: 'Acción',
    rankingRiskLabel: 'Riesgo',
    actionEyebrow: 'Acción inmediata',
    actionTitle: 'Tarjetas operativas',
    inventoryEyebrow: 'Inventario',
    inventoryTitle: 'Apps y foco actual',
    dependencyEyebrow: 'Relaciones',
    dependencyTitle: 'Mapa de dependencias críticas',
    riskEyebrow: 'Riesgo',
    riskTitle: 'Riesgos principales',
    traceEyebrow: 'Trazabilidad',
    traceTitle: 'Fuentes y distribución',
    sourceTypeFallback: 'sin clasificar',
    appLabel: 'App',
    layerLabel: 'Capa',
    stateLabel: 'Estado',
    bandLabel: 'Prioridad',
    nextFocusLabel: 'Siguiente foco',
    territoryLabel: 'Territorio',
    confidenceTitle: 'Confianza',
    layersTitle: 'Capas',
    sourceListTitle: 'Fuentes',
  },
  en: {
    heroEyebrow: 'Real estate vertical',
    heroTitle: 'What requires attention now',
    heroLede:
      'Consolidated analytical view to read priority, risk, dependencies, and next actions across the Real Estate ecosystem inside the unified shell.',
    sourceLabel: 'Source',
    generatedLabel: 'Updated',
    scopeLabel: 'Apps in scope',
    priorityCardEyebrow: 'Top priority',
    priorityCardScore: 'Score',
    priorityCardRisk: 'Dominant risk',
    rankingEyebrow: 'Ranking',
    rankingTitle: 'Priority board',
    rankingActionLabel: 'Action',
    rankingRiskLabel: 'Risk',
    actionEyebrow: 'Immediate action',
    actionTitle: 'Operational cards',
    inventoryEyebrow: 'Inventory',
    inventoryTitle: 'Apps and current focus',
    dependencyEyebrow: 'Relationships',
    dependencyTitle: 'Critical dependency map',
    riskEyebrow: 'Risk',
    riskTitle: 'Main risks',
    traceEyebrow: 'Traceability',
    traceTitle: 'Sources and distribution',
    sourceTypeFallback: 'unclassified',
    appLabel: 'App',
    layerLabel: 'Layer',
    stateLabel: 'State',
    bandLabel: 'Priority',
    nextFocusLabel: 'Next focus',
    territoryLabel: 'Territory',
    confidenceTitle: 'Confidence',
    layersTitle: 'Layers',
    sourceListTitle: 'Sources',
  },
  de: {
    heroEyebrow: 'Immobilien-Vertikal',
    heroTitle: 'Was jetzt Aufmerksamkeit braucht',
    heroLede:
      'Konsolidierte Analyseansicht für Priorität, Risiken, Abhängigkeiten und nächste Aktionen im Real-Estate-Ökosystem innerhalb der vereinheitlichten Shell.',
    sourceLabel: 'Quelle',
    generatedLabel: 'Aktualisiert',
    scopeLabel: 'Apps im Scope',
    priorityCardEyebrow: 'Top-Priorität',
    priorityCardScore: 'Score',
    priorityCardRisk: 'Hauptrisiko',
    rankingEyebrow: 'Ranking',
    rankingTitle: 'Prioritäten-Board',
    rankingActionLabel: 'Aktion',
    rankingRiskLabel: 'Risiko',
    actionEyebrow: 'Sofortmaßnahme',
    actionTitle: 'Operative Karten',
    inventoryEyebrow: 'Inventar',
    inventoryTitle: 'Apps und aktueller Fokus',
    dependencyEyebrow: 'Beziehungen',
    dependencyTitle: 'Kritische Abhängigkeitskarte',
    riskEyebrow: 'Risiko',
    riskTitle: 'Hauptrisiken',
    traceEyebrow: 'Nachvollziehbarkeit',
    traceTitle: 'Quellen und Verteilung',
    sourceTypeFallback: 'nicht klassifiziert',
    appLabel: 'App',
    layerLabel: 'Schicht',
    stateLabel: 'Status',
    bandLabel: 'Priorität',
    nextFocusLabel: 'Nächster Fokus',
    territoryLabel: 'Gebiet',
    confidenceTitle: 'Vertrauen',
    layersTitle: 'Schichten',
    sourceListTitle: 'Quellen',
  },
} as const

function stripPath(value: string) {
  return value.replaceAll('\\', '/')
}

function formatBandLabel(language: DashboardLanguage, band: string) {
  const labels = bandLabels[language] as Record<string, string>
  return labels[band] ?? band.replace(/-/g, ' ')
}

function bandClassName(band: string) {
  return `band band--${band}`
}

function layerLabel(language: DashboardLanguage, layer: string) {
  const labels = layerLabels[language] as Record<string, string>
  return labels[layer] ?? layer
}

export function RealEstateView({
  data,
  language,
}: {
  data: RealEstateDataset
  language: DashboardLanguage
}) {
  const [activeLayer, setActiveLayer] = useState<string>('all')

  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'es-ES'
  const t = uiMessages[language]
  const generatedAt = new Date(data.generatedAt).toLocaleString(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const topPriority = data.derived.priorityRanking[0]
  const layers = useMemo(
    () => ['all', ...new Set(data.apps.map((app) => app.ecosystem_layer))] as string[],
    [data.apps],
  )

  const rankingById = useMemo(
    () =>
      new Map(
        data.derived.priorityRanking.map((item) => [
          item.app_id,
          item,
        ]),
      ),
    [data.derived.priorityRanking],
  )

  const filteredApps = useMemo(() => {
    if (activeLayer === 'all') return data.apps
    return data.apps.filter((app) => app.ecosystem_layer === activeLayer)
  }, [activeLayer, data.apps])

  const displaySources = useMemo(
    () =>
      data.sources.filter(
        (source) => source.source_note && source.evidence_summary,
      ),
    [data.sources],
  )

  return (
    <>
      <section className="hero hero--real-estate">
        <div className="hero__copy">
          <p className="hero__eyebrow">{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero__lede">{t.heroLede}</p>
          <div className="hero__meta">
            <span>
              {t.sourceLabel}: {stripPath(data.sourceWorkbook)}
            </span>
            <span>
              {t.generatedLabel}: {generatedAt}
            </span>
            <span>
              {t.scopeLabel}: {data.apps.length}
            </span>
          </div>
        </div>

        {topPriority ? (
          <aside className="hero__priority-card">
            <p className="hero__eyebrow">{t.priorityCardEyebrow}</p>
            <h2>{topPriority.app_name}</h2>
            <div className="hero__score-row">
              <div>
                <span className="hero__score-label">{t.priorityCardScore}</span>
                <strong>{topPriority.priority_score}</strong>
              </div>
              <span className={bandClassName(topPriority.priority_band)}>
                {formatBandLabel(language, topPriority.priority_band)}
              </span>
            </div>
            <p className="hero__action">{topPriority.action_now}</p>
            <div className="hero__priority-risk">
              <span>{t.priorityCardRisk}</span>
              <p>{topPriority.main_risks}</p>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="grid grid--top">
        <section className="panel">
          <p className="panel__eyebrow">{t.rankingEyebrow}</p>
          <h2 className="panel__title">{t.rankingTitle}</h2>
          <div className="priority-list">
            {data.derived.priorityRanking.map((item) => (
              <article className="priority-item" key={item.app_id}>
                <div className="priority-item__rank">{item.rank}</div>
                <div className="priority-item__copy">
                  <div className="priority-item__header">
                    <strong>{item.app_name}</strong>
                    <span className={bandClassName(item.priority_band)}>
                      {formatBandLabel(language, item.priority_band)}
                    </span>
                  </div>
                  <p>{item.action_now}</p>
                  <div className="priority-item__meta">
                    <span>
                      {t.rankingActionLabel}: {item.next_focus}
                    </span>
                    <span>
                      {t.rankingRiskLabel}: {item.main_risks}
                    </span>
                  </div>
                </div>
                <div className="priority-item__score">{item.priority_score}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel--accent">
          <p className="panel__eyebrow">{t.actionEyebrow}</p>
          <h2 className="panel__title">{t.actionTitle}</h2>
          <div className="action-grid">
            {data.derived.actionCards.map((item) => (
              <article className="action-card" key={item.app_id}>
                <div className="action-card__top">
                  <h3>{item.title}</h3>
                  <span className={bandClassName(item.priority_band)}>
                    {formatBandLabel(language, item.priority_band)}
                  </span>
                </div>
                <p className="action-card__body">{item.action_now}</p>
                <p className="action-card__why">{item.why_now}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid grid--middle">
        <section className="panel">
          <p className="panel__eyebrow">{t.inventoryEyebrow}</p>
          <div className="panel__heading-row">
            <h2 className="panel__title">{t.inventoryTitle}</h2>
            <div className="filter-row" role="tablist" aria-label={t.layerLabel}>
              {layers.map((layer) => (
                <button
                  key={layer}
                  type="button"
                  className={layer === activeLayer ? 'is-active' : ''}
                  onClick={() => setActiveLayer(layer)}
                >
                  {layerLabel(language, layer)}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.appLabel}</th>
                  <th>{t.layerLabel}</th>
                  <th>{t.stateLabel}</th>
                  <th>{t.bandLabel}</th>
                  <th>{t.nextFocusLabel}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const ranked = rankingById.get(app.app_id)
                  return (
                    <tr key={app.app_id}>
                      <td>
                        <strong>{app.app_name}</strong>
                        <div className="table-sub">{app.ecosystem_role}</div>
                      </td>
                      <td>{layerLabel(language, app.ecosystem_layer)}</td>
                      <td>{app.documented_state}</td>
                      <td>
                        <span className={bandClassName(ranked?.priority_band ?? app.priority_band)}>
                          {formatBandLabel(language, ranked?.priority_band ?? app.priority_band)}
                        </span>
                      </td>
                      <td>{app.next_focus || app.action_now}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <p className="panel__eyebrow">{t.dependencyEyebrow}</p>
          <h2 className="panel__title">{t.dependencyTitle}</h2>
          <div className="dependency-grid">
            {data.derived.dependencyMap.links.map((link) => (
              <article className="dependency-link" key={`${link.source}-${link.target}-${link.type}`}>
                <div className="dependency-link__apps">
                  <span>{link.source}</span>
                  <span className="dependency-link__arrow">→</span>
                  <span>{link.target}</span>
                </div>
                <strong>{link.type}</strong>
                <p>{link.label}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid grid--bottom">
        <section className="panel">
          <p className="panel__eyebrow">{t.riskEyebrow}</p>
          <h2 className="panel__title">{t.riskTitle}</h2>
          <div className="risk-list">
            {data.derived.riskSummary.map((item) => (
              <article className="risk-item" key={item.app_name}>
                <div className="risk-item__header">
                  <strong>{item.app_name}</strong>
                  <span className={bandClassName(item.priority_band)}>
                    {formatBandLabel(language, item.priority_band)}
                  </span>
                </div>
                <p>{item.main_risks}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="panel__eyebrow">{t.traceEyebrow}</p>
          <h2 className="panel__title">{t.traceTitle}</h2>
          <div className="mini-stats">
            <div>
              <h3>{t.layersTitle}</h3>
              <ul>
                {data.derived.layerDistribution.map((item) => (
                  <li key={item.label}>
                    <span>{layerLabel(language, item.label)}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.confidenceTitle}</h3>
              <ul>
                {data.derived.confidenceSummary.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sources-list">
            <h3>{t.sourceListTitle}</h3>
            {displaySources.map((item, index) => (
              <article className="source-item" key={`${item.app_name}-${item.source_note}-${index}`}>
                <div className="source-item__top">
                  <strong>{item.app_name}</strong>
                  <span>{item.source_type || t.sourceTypeFallback}</span>
                </div>
                <p>{item.evidence_summary}</p>
                <code>{item.source_note}</code>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}
