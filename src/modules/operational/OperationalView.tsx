import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import { getEndpoints, getProducts, getRepositories, getServices, getSystemHealth } from '../../adapters/knowledgeAdapter'
import { getAosRuntimeStatus } from '../../adapters/aosAdapter'
import { DataStateView } from './DataStateView'
import './operational-view.css'

export type OperationalSection = 'overview' | 'products' | 'repositories' | 'services' | 'knowledge'

interface Copy {
  loading: string
  empty: string
  unavailable: string
  error: string
  stale: (asOf: string) => string
  overviewTitle: string
  repos: string
  products: string
  services: string
  akgEntities: string
  akgRelationships: string
  akgConflicts: string
  buildId: string
  generatedAt: string
  productsTitle: string
  reposTitle: string
  servicesTitle: string
  knowledgeTitle: string
  unknownField: string
  source: string
  status: string
  visibility: string
  businessUnit: string
  repo: string
  port: string
  health: string
  runtimeState: string
  noSourceOfTruth: string
}

const copy: Record<DashboardLanguage, Copy> = {
  es: {
    loading: 'Cargando…',
    empty: 'Sin datos disponibles todavía.',
    unavailable: 'Fuente no disponible.',
    error: 'Error al leer la fuente.',
    stale: (asOf: string) => `Datos generados el ${new Date(asOf).toLocaleString('es-ES')} — puede estar desactualizado.`,
    overviewTitle: 'Estado del ecosistema',
    repos: 'Repositorios',
    products: 'Productos',
    services: 'Servicios',
    akgEntities: 'Entidades AKG',
    akgRelationships: 'Relaciones AKG',
    akgConflicts: 'Conflictos AKG',
    buildId: 'Build ID de Knowledge',
    generatedAt: 'Generado',
    productsTitle: 'Productos',
    reposTitle: 'Repositorios',
    servicesTitle: 'Servicios (AOS)',
    knowledgeTitle: 'Knowledge / AKG',
    unknownField: 'desconocido',
    source: 'fuente',
    status: 'estado',
    visibility: 'visibilidad',
    businessUnit: 'business unit',
    repo: 'repo',
    port: 'puerto',
    health: 'salud',
    runtimeState: 'estado runtime',
    noSourceOfTruth: 'No es fuente de verdad local',
  },
  en: {
    loading: 'Loading…',
    empty: 'No data available yet.',
    unavailable: 'Source unavailable.',
    error: 'Failed to read source.',
    stale: (asOf: string) => `Data generated on ${new Date(asOf).toLocaleString('en-US')} — may be stale.`,
    overviewTitle: 'Ecosystem status',
    repos: 'Repositories',
    products: 'Products',
    services: 'Services',
    akgEntities: 'AKG entities',
    akgRelationships: 'AKG relationships',
    akgConflicts: 'AKG conflicts',
    buildId: 'Knowledge build ID',
    generatedAt: 'Generated',
    productsTitle: 'Products',
    reposTitle: 'Repositories',
    servicesTitle: 'Services (AOS)',
    knowledgeTitle: 'Knowledge / AKG',
    unknownField: 'unknown',
    source: 'source',
    status: 'status',
    visibility: 'visibility',
    businessUnit: 'business unit',
    repo: 'repo',
    port: 'port',
    health: 'health',
    runtimeState: 'runtime state',
    noSourceOfTruth: 'Not a local source of truth',
  },
  de: {
    loading: 'Wird geladen…',
    empty: 'Noch keine Daten verfügbar.',
    unavailable: 'Quelle nicht verfügbar.',
    error: 'Fehler beim Lesen der Quelle.',
    stale: (asOf: string) => `Daten erzeugt am ${new Date(asOf).toLocaleString('de-DE')} — möglicherweise veraltet.`,
    overviewTitle: 'Ökosystemstatus',
    repos: 'Repositories',
    products: 'Produkte',
    services: 'Dienste',
    akgEntities: 'AKG-Entitäten',
    akgRelationships: 'AKG-Beziehungen',
    akgConflicts: 'AKG-Konflikte',
    buildId: 'Knowledge Build-ID',
    generatedAt: 'Erzeugt',
    productsTitle: 'Produkte',
    reposTitle: 'Repositories',
    servicesTitle: 'Dienste (AOS)',
    knowledgeTitle: 'Knowledge / AKG',
    unknownField: 'unbekannt',
    source: 'Quelle',
    status: 'Status',
    visibility: 'Sichtbarkeit',
    businessUnit: 'Business Unit',
    repo: 'Repo',
    port: 'Port',
    health: 'Zustand',
    runtimeState: 'Laufzeitstatus',
    noSourceOfTruth: 'Keine lokale Quelle der Wahrheit',
  },
}

export function OperationalView({
  section,
  language,
}: {
  section: OperationalSection
  language: DashboardLanguage
}) {
  const t = copy[language]

  if (section === 'overview') return <OverviewSection t={t} />
  if (section === 'products') return <ProductsSection t={t} />
  if (section === 'repositories') return <RepositoriesSection t={t} />
  if (section === 'services') return <ServicesSection t={t} />
  return <KnowledgeSection t={t} />
}

function stateLabels(t: Copy) {
  return {
    loading: t.loading,
    empty: t.empty,
    unavailable: t.unavailable,
    error: t.error,
    staleNote: t.stale,
  }
}

function OverviewSection({ t }: { t: Copy }) {
  const health = getSystemHealth()
  const aos = getAosRuntimeStatus()

  return (
    <section className="op-section" aria-labelledby="overview-heading">
      <h2 id="overview-heading" className="op-section__title">
        {t.overviewTitle}
      </h2>
      <DataStateView state={health} labels={stateLabels(t)}>
        {(data) => (
          <dl className="op-metric-grid">
            <Metric label={t.repos} value={data.ecosystemRepoCount} />
            <Metric label={t.products} value={data.productCount} />
            <Metric label={t.services} value={data.serviceCount} />
            <Metric label={t.akgEntities} value={data.akgEntityCount} />
            <Metric label={t.akgRelationships} value={data.akgRelationshipCount} />
            <Metric label={t.akgConflicts} value={data.akgConflictCount} />
            <Metric label={t.buildId} value={data.knowledgeBuildId ?? t.unknownField} mono />
            <Metric
              label={t.generatedAt}
              value={data.knowledgeGeneratedAt ? new Date(data.knowledgeGeneratedAt).toLocaleString() : t.unknownField}
            />
          </dl>
        )}
      </DataStateView>

      <h3 className="op-section__subtitle">AOS Runtime</h3>
      <DataStateView state={aos} labels={stateLabels(t)}>
        {(services) => (
          <p className="op-note">
            {services.filter((s) => s.processState !== 'stopped').length} / {services.length}{' '}
            {t.runtimeState.toLowerCase()}
          </p>
        )}
      </DataStateView>
    </section>
  )
}

function Metric({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="op-metric">
      <dt className="op-metric__label">{label}</dt>
      <dd className={mono ? 'op-metric__value op-metric__value--mono' : 'op-metric__value'}>{value}</dd>
    </div>
  )
}

function ProductsSection({ t }: { t: Copy }) {
  const products = getProducts()
  return (
    <section className="op-section" aria-labelledby="products-heading">
      <h2 id="products-heading" className="op-section__title">
        {t.productsTitle}
      </h2>
      <DataStateView state={products} labels={stateLabels(t)}>
        {(items) => (
          <ul className="op-list">
            {items.map((p) => (
              <li key={p.id} className="op-list__item">
                <span className="op-list__name">{p.name}</span>
                <span className="op-list__meta">
                  {t.status}: {p.productStatus} · {t.businessUnit}: {p.businessUnitId ?? t.unknownField}
                  {p.repoId ? ` · ${t.repo}: ${p.repoId.replace('repo:ToniIAPro73/', '')}` : ''}
                </span>
                <span className="op-list__source">
                  {t.source}: {p.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DataStateView>
    </section>
  )
}

function RepositoriesSection({ t }: { t: Copy }) {
  const repos = getRepositories()
  return (
    <section className="op-section" aria-labelledby="repos-heading">
      <h2 id="repos-heading" className="op-section__title">
        {t.reposTitle}
      </h2>
      <DataStateView state={repos} labels={stateLabels(t)}>
        {(items) => (
          <ul className="op-list">
            {items.map((r) => (
              <li key={r.id} className="op-list__item">
                <span className="op-list__name">{r.name}</span>
                <span className="op-list__meta">
                  {t.status}: {r.portfolioStatus} · {t.visibility}: {r.githubVisibility}
                </span>
                {r.sourceOfTruthLocal === false && (
                  <span className="op-badge op-badge--info">{t.noSourceOfTruth}</span>
                )}
                <span className="op-list__source">
                  {t.source}: {r.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DataStateView>
    </section>
  )
}

function ServicesSection({ t }: { t: Copy }) {
  const services = getServices()
  const endpoints = getEndpoints()
  return (
    <section className="op-section" aria-labelledby="services-heading">
      <h2 id="services-heading" className="op-section__title">
        {t.servicesTitle}
      </h2>
      <DataStateView state={services} labels={stateLabels(t)}>
        {(items) => (
          <ul className="op-list">
            {items.map((s) => (
              <li key={s.id} className="op-list__item">
                <span className="op-list__name">{s.name}</span>
                <span className="op-list__meta">
                  {t.status}: {s.serviceStatus}
                  {s.port ? ` · ${t.port}: ${s.port}` : ''}
                </span>
                <span className="op-list__source">
                  {t.source}: {s.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DataStateView>

      <h3 className="op-section__subtitle">Endpoints</h3>
      <DataStateView state={endpoints} labels={stateLabels(t)}>
        {(items) => (
          <ul className="op-list">
            {items.map((e) => (
              <li key={e.id} className="op-list__item">
                <span className="op-list__name">{e.host}</span>
                <span className="op-list__meta">{t.status}: {e.endpointStatus}</span>
              </li>
            ))}
          </ul>
        )}
      </DataStateView>
    </section>
  )
}

function KnowledgeSection({ t }: { t: Copy }) {
  const health = getSystemHealth()
  return (
    <section className="op-section" aria-labelledby="knowledge-heading">
      <h2 id="knowledge-heading" className="op-section__title">
        {t.knowledgeTitle}
      </h2>
      <DataStateView state={health} labels={stateLabels(t)}>
        {(data) => (
          <dl className="op-metric-grid">
            <Metric label={t.akgEntities} value={data.akgEntityCount} />
            <Metric label={t.akgRelationships} value={data.akgRelationshipCount} />
            <Metric label={t.akgConflicts} value={data.akgConflictCount} />
            <Metric label={t.buildId} value={data.knowledgeBuildId ?? t.unknownField} mono />
          </dl>
        )}
      </DataStateView>
      <p className="op-note">
        anclora-infrastructure/knowledge — {t.noSourceOfTruth.toLowerCase()}.
      </p>
    </section>
  )
}
