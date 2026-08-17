import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import type {
  AosServiceRuntimeSummary,
  DataState,
  EndpointSummary,
  ProductSummary,
  RepositorySummary,
  ServiceSummary,
  SystemHealth,
} from '../../contracts/types'
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
  refresh: string
  lastUpdated: string
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
    refresh: 'Actualizar',
    lastUpdated: 'Actualizado',
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
    refresh: 'Refresh',
    lastUpdated: 'Updated',
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
    refresh: 'Aktualisieren',
    lastUpdated: 'Aktualisiert',
  },
}

export interface OperationalDataProps {
  // Datos inyectados por useOperationalData (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT):
  // los componentes jamas hacen fetch ni tocan adapters directamente.
  loadingInitial: boolean
  aosLastUpdatedAt: Date | null
  aos: DataState<AosServiceRuntimeSummary[]>
  knowledgeHealth: DataState<SystemHealth>
  repositories: DataState<RepositorySummary[]>
  products: DataState<ProductSummary[]>
  services: DataState<ServiceSummary[]>
  endpoints: DataState<EndpointSummary[]>
  onRefresh: () => void
}

export function OperationalView({
  section,
  language,
  data,
}: {
  section: OperationalSection
  language: DashboardLanguage
  data: OperationalDataProps
}) {
  const t = copy[language]

  if (section === 'overview') return <OverviewSection t={t} {...data} />
  if (section === 'products') return <ProductsSection t={t} data={data.products} />
  if (section === 'repositories') return <RepositoriesSection t={t} data={data.repositories} />
  if (section === 'services') return <ServicesSection t={t} services={data.services} endpoints={data.endpoints} />
  return <KnowledgeSection t={t} health={data.knowledgeHealth} />
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

function RefreshButton({ t, onRefresh }: { t: Copy; onRefresh: () => void }) {
  return (
    <button type="button" className="op-refresh" onClick={onRefresh}>
      {t.refresh}
    </button>
  )
}

function OverviewSection(props: OperationalDataProps & { t: Copy }) {
  const { t } = props
  return (
    <section className="op-section" aria-labelledby="overview-heading">
      <h2 id="overview-heading" className="op-section__title">
        {t.overviewTitle}
      </h2>
      <RefreshButton t={t} onRefresh={props.onRefresh} />
      {!props.loadingInitial && props.aosLastUpdatedAt && (
        <p className="op-note">
          {t.lastUpdated}: {props.aosLastUpdatedAt.toLocaleTimeString()}
        </p>
      )}
      <DataStateView state={props.knowledgeHealth} labels={stateLabels(t)}>
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
      <DataStateView state={props.aos} labels={stateLabels(t)}>
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

function ProductsSection({ t, data }: { t: Copy; data: DataState<ProductSummary[]> }) {
  return (
    <section className="op-section" aria-labelledby="products-heading">
      <h2 id="products-heading" className="op-section__title">
        {t.productsTitle}
      </h2>
      <DataStateView state={data} labels={stateLabels(t)}>
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

function RepositoriesSection({ t, data }: { t: Copy; data: DataState<RepositorySummary[]> }) {
  return (
    <section className="op-section" aria-labelledby="repos-heading">
      <h2 id="repos-heading" className="op-section__title">
        {t.reposTitle}
      </h2>
      <DataStateView state={data} labels={stateLabels(t)}>
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

function ServicesSection({
  t,
  services,
  endpoints,
}: {
  t: Copy
  services: DataState<ServiceSummary[]>
  endpoints: DataState<EndpointSummary[]>
}) {
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

function KnowledgeSection({ t, health }: { t: Copy; health: DataState<SystemHealth> }) {
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