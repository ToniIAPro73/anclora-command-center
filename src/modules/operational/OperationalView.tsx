import { useState } from 'react'
import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import type {
  AosEndpointSummary,
  AosServiceRuntimeSummary,
  ConflictSummary,
  DataState,
  EndpointSummary,
  ProductSummary,
  RepositorySummary,
  ServiceSummary,
  SystemHealth,
} from '../../contracts/types'
import type { GlobalOperationalStatus, OperationalIssue } from '../../domain/types'
import { postServiceAction, type ServiceActionOp } from '../../adapters/aosAdapter'
import { DataStateView } from './DataStateView'
import { Button } from '../../ui/Button'
import { StatusBadge, type StatusTone } from '../../ui/StatusBadge'
import { ConfirmationDialog } from '../../ui/ConfirmationDialog'
import { EmptyState } from '../../ui/EmptyState'
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
  managedExternal: string
  httpsAuthProtected: string
  backendDown: string
  runtime: string
  endpointState: (status: string) => string
  serviceState: (state: string) => string
  healthState: (health: string) => string
  attentionTitle: string
  noIssues: string
  noIssuesSummary: string
  evidence: string
  suggestedAction: string
  globalStatus: (status: GlobalOperationalStatus) => string
  actionStart: string
  actionStop: string
  actionRestart: string
  actionViewOnly: string
  confirmTitle: (op: string, service: string) => string
  confirmSummary: (op: string, service: string) => string
  confirmConsequenceStop: string
  confirmConsequenceRestart: string
  confirmCancel: string
  confirmConfirm: (op: string) => string
  selfStopBlocked: string
  actionFailed: (reason: string) => string
  conflictsTitle: string
  noConflicts: string
}

// Vocabulario UI de estados: labels humanas ESTABLES (mayusculas) para los
// enums del contrato AOS (service.state / endpoint.status / health). Mantener
// sincronizado con aos-runtime/schema/status.schema.json.
const SERVICE_STATE_LABELS: Record<string, string> = {
  running: 'RUNNING',
  stopped: 'STOPPED',
  unhealthy: 'UNHEALTHY',
  starting: 'STARTING',
  not_configured: 'NOT CONFIGURED',
  unknown: 'UNKNOWN',
}

const ENDPOINT_STATE_LABELS: Record<string, string> = {
  not_configured: 'NOT CONFIGURED',
  configured: 'CONFIGURED',
  exposed: 'EXPOSED',
  auth_protected: 'AUTH PROTECTED',
  unreachable: 'UNREACHABLE',
  unknown: 'UNKNOWN',
}

const HEALTH_LABELS: Record<string, string> = {
  ok: 'OK',
  failed: 'FAILED',
  not_configured: 'NOT CONFIGURED',
  unknown: 'UNKNOWN',
}

// Mapeo de estado -> tono semantico generico (Seccion 15): jamas
// "--color-aos-running", siempre success/warning/danger/info/neutral/muted.
function stateTone(state: string): StatusTone {
  switch (state) {
    case 'running':
    case 'exposed':
    case 'auth_protected':
    case 'ok':
      return 'success'
    case 'stopped':
      return 'neutral'
    case 'unhealthy':
    case 'unreachable':
    case 'failed':
      return 'danger'
    case 'starting':
    case 'unknown':
      return 'warning'
    case 'not_configured':
    case 'configured':
      return 'muted'
    default:
      return 'warning'
  }
}

function globalStatusTone(status: GlobalOperationalStatus): StatusTone {
  switch (status) {
    case 'HEALTHY':
      return 'success'
    case 'DEGRADED':
      return 'warning'
    case 'CRITICAL':
      return 'danger'
    default:
      return 'neutral'
  }
}

function issueSeverityTone(severity: OperationalIssue['severity']): StatusTone {
  if (severity === 'critical') return 'danger'
  if (severity === 'warning') return 'warning'
  return 'info'
}

const copy: Record<DashboardLanguage, Copy> = {
  es: {
    loading: 'Cargando…',
    empty: 'Sin datos disponibles todavía.',
    unavailable: 'Fuente no disponible.',
    error: 'Error al leer la fuente.',
    stale: (asOf: string) => `Datos generados el ${new Date(asOf).toLocaleString('es-ES')} — puede estar desactualizado.`,
    overviewTitle: 'Estado operacional',
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
    runtimeState: 'runtime',
    noSourceOfTruth: 'No es fuente de verdad local',
    refresh: 'Actualizar',
    lastUpdated: 'Actualizado',
    managedExternal: 'EXTERNAL',
    httpsAuthProtected: 'HTTPS: auth protected',
    backendDown: '(backend caído)',
    runtime: 'runtime',
    endpointState: (status: string) => ENDPOINT_STATE_LABELS[status] ?? 'UNKNOWN',
    serviceState: (state: string) => SERVICE_STATE_LABELS[state] ?? 'UNKNOWN',
    healthState: (health: string) => HEALTH_LABELS[health] ?? 'UNKNOWN',
    attentionTitle: 'Necesita atención',
    noIssues: 'No se detectaron problemas operacionales',
    noIssuesSummary: 'AOS, Knowledge y los endpoints reconciliados no reportan ningún issue accionable.',
    evidence: 'Evidencia',
    suggestedAction: 'Acción sugerida',
    globalStatus: (s) => ({ HEALTHY: 'SALUDABLE', DEGRADED: 'DEGRADADO', CRITICAL: 'CRÍTICO', UNKNOWN: 'DESCONOCIDO' })[s],
    actionStart: 'Iniciar',
    actionStop: 'Detener',
    actionRestart: 'Reiniciar',
    actionViewOnly: 'SOLO LECTURA',
    confirmTitle: (op, service) => `${op} ${service}`,
    confirmSummary: (op, service) => `Vas a ejecutar "${op}" sobre el servicio "${service}" gestionado por AOS.`,
    confirmConsequenceStop: 'El servicio dejará de estar disponible hasta que se inicie de nuevo.',
    confirmConsequenceRestart: 'El servicio se detendrá brevemente y volverá a arrancar.',
    confirmCancel: 'Cancelar',
    confirmConfirm: (op) => op,
    selfStopBlocked: 'command-center no puede pararse ni reiniciarse desde su propia interfaz.',
    actionFailed: (reason) => `La acción falló: ${reason}`,
    conflictsTitle: 'Conflictos de Knowledge',
    noConflicts: 'Sin conflictos detectados.',
  },
  en: {
    loading: 'Loading…',
    empty: 'No data available yet.',
    unavailable: 'Source unavailable.',
    error: 'Failed to read source.',
    stale: (asOf: string) => `Data generated on ${new Date(asOf).toLocaleString('en-US')} — may be stale.`,
    overviewTitle: 'Operational status',
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
    runtimeState: 'runtime',
    noSourceOfTruth: 'Not a local source of truth',
    refresh: 'Refresh',
    lastUpdated: 'Updated',
    managedExternal: 'EXTERNAL',
    httpsAuthProtected: 'HTTPS: auth protected',
    backendDown: '(backend down)',
    runtime: 'runtime',
    endpointState: (status: string) => ENDPOINT_STATE_LABELS[status] ?? 'UNKNOWN',
    serviceState: (state: string) => SERVICE_STATE_LABELS[state] ?? 'UNKNOWN',
    healthState: (health: string) => HEALTH_LABELS[health] ?? 'UNKNOWN',
    attentionTitle: 'Needs attention',
    noIssues: 'No operational issues detected',
    noIssuesSummary: 'AOS, Knowledge and reconciled endpoints report no actionable issue.',
    evidence: 'Evidence',
    suggestedAction: 'Suggested action',
    globalStatus: (s) => s,
    actionStart: 'Start',
    actionStop: 'Stop',
    actionRestart: 'Restart',
    actionViewOnly: 'VIEW ONLY',
    confirmTitle: (op, service) => `${op} ${service}`,
    confirmSummary: (op, service) => `You are about to run "${op}" on the AOS-managed service "${service}".`,
    confirmConsequenceStop: 'The service will become unavailable until it is started again.',
    confirmConsequenceRestart: 'The service will stop briefly and come back up.',
    confirmCancel: 'Cancel',
    confirmConfirm: (op) => op,
    selfStopBlocked: 'command-center cannot be stopped or restarted from its own UI.',
    actionFailed: (reason) => `Action failed: ${reason}`,
    conflictsTitle: 'Knowledge conflicts',
    noConflicts: 'No conflicts detected.',
  },
  de: {
    loading: 'Wird geladen…',
    empty: 'Noch keine Daten verfügbar.',
    unavailable: 'Quelle nicht verfügbar.',
    error: 'Fehler beim Lesen der Quelle.',
    stale: (asOf: string) => `Daten erzeugt am ${new Date(asOf).toLocaleString('de-DE')} — möglicherweise veraltet.`,
    overviewTitle: 'Betriebsstatus',
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
    managedExternal: 'EXTERNAL',
    httpsAuthProtected: 'HTTPS: Auth geschützt',
    backendDown: '(Backend ausgefallen)',
    runtime: 'Laufzeit',
    endpointState: (status: string) => ENDPOINT_STATE_LABELS[status] ?? 'UNKNOWN',
    serviceState: (state: string) => SERVICE_STATE_LABELS[state] ?? 'UNKNOWN',
    healthState: (health: string) => HEALTH_LABELS[health] ?? 'UNKNOWN',
    attentionTitle: 'Erfordert Aufmerksamkeit',
    noIssues: 'Keine betrieblichen Probleme erkannt',
    noIssuesSummary: 'AOS, Knowledge und die abgeglichenen Endpoints melden kein handlungsrelevantes Problem.',
    evidence: 'Nachweis',
    suggestedAction: 'Empfohlene Aktion',
    globalStatus: (s) => ({ HEALTHY: 'GESUND', DEGRADED: 'BEEINTRÄCHTIGT', CRITICAL: 'KRITISCH', UNKNOWN: 'UNBEKANNT' })[s],
    actionStart: 'Starten',
    actionStop: 'Stoppen',
    actionRestart: 'Neu starten',
    actionViewOnly: 'NUR ANSICHT',
    confirmTitle: (op, service) => `${op} ${service}`,
    confirmSummary: (op, service) => `Du fuhrst "${op}" fur den AOS-verwalteten Dienst "${service}" aus.`,
    confirmConsequenceStop: 'Der Dienst ist nicht mehr verfugbar, bis er erneut gestartet wird.',
    confirmConsequenceRestart: 'Der Dienst wird kurz gestoppt und startet danach neu.',
    confirmCancel: 'Abbrechen',
    confirmConfirm: (op) => op,
    selfStopBlocked: 'command-center kann nicht von der eigenen Oberflache gestoppt oder neu gestartet werden.',
    actionFailed: (reason) => `Aktion fehlgeschlagen: ${reason}`,
    conflictsTitle: 'Knowledge-Konflikte',
    noConflicts: 'Keine Konflikte erkannt.',
  },
}

export interface OperationalDataProps {
  // Datos inyectados por useOperationalData (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT):
  // los componentes jamas hacen fetch ni tocan adapters directamente (salvo la
  // unica accion de escritura, postServiceAction, disparada desde ServicesSection).
  loadingInitial: boolean
  aosLastUpdatedAt: Date | null
  aos: DataState<AosServiceRuntimeSummary[]>
  aosEndpoints: DataState<AosEndpointSummary[]>
  knowledgeHealth: DataState<SystemHealth>
  repositories: DataState<RepositorySummary[]>
  products: DataState<ProductSummary[]>
  services: DataState<ServiceSummary[]>
  endpoints: DataState<EndpointSummary[]>
  conflicts: DataState<ConflictSummary[]>
  issues: OperationalIssue[]
  globalStatus: GlobalOperationalStatus
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
  if (section === 'services')
    return <ServicesSection t={t} aos={data.aos} aosEndpoints={data.aosEndpoints} onRefresh={data.onRefresh} />
  return <KnowledgeSection t={t} health={data.knowledgeHealth} conflicts={data.conflicts} />
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
    <Button variant="ghost" size="sm" className="op-refresh" onClick={onRefresh}>
      {t.refresh}
    </Button>
  )
}

// ================================================================ OVERVIEW
// Prioridad Seccion 19: Operational Status -> Attention -> Core Services ->
// Endpoints -> Repositories -> Knowledge Health -> Recent Changes. Los
// contadores de entidades quedan al final, no al principio.
function OverviewSection(props: OperationalDataProps & { t: Copy }) {
  const { t } = props
  return (
    <section className="op-section" aria-labelledby="overview-heading">
      <div className="op-overview-header">
        <h2 id="overview-heading" className="op-section__title">
          {t.overviewTitle}
        </h2>
        <StatusBadge tone={globalStatusTone(props.globalStatus)} label={t.globalStatus(props.globalStatus)} />
      </div>
      <RefreshButton t={t} onRefresh={props.onRefresh} />
      {!props.loadingInitial && props.aosLastUpdatedAt && (
        <p className="op-note">
          {t.lastUpdated}: {props.aosLastUpdatedAt.toLocaleTimeString()}
        </p>
      )}

      <AttentionList t={t} issues={props.issues} />

      <h3 className="op-section__subtitle">{t.servicesTitle}</h3>
      <DataStateView state={props.aos} labels={stateLabels(t)}>
        {(services) => (
          <p className="op-note">
            {services.filter((s) => s.processState !== 'stopped').length} / {services.length}{' '}
            {t.runtimeState.toLowerCase()}
          </p>
        )}
      </DataStateView>

      <h3 className="op-section__subtitle">Endpoints</h3>
      <DataStateView state={props.aosEndpoints} labels={stateLabels(t)}>
        {(endpoints) => (
          <p className="op-note">
            {endpoints.filter((e) => e.status === 'exposed' || e.status === 'auth_protected').length} / {endpoints.length}{' '}
            reachable
          </p>
        )}
      </DataStateView>

      <h3 className="op-section__subtitle">{t.reposTitle}</h3>
      <DataStateView state={props.repositories} labels={stateLabels(t)}>
        {(repos) => <p className="op-note">{repos.length}</p>}
      </DataStateView>

      <h3 className="op-section__subtitle">{t.knowledgeTitle}</h3>
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
    </section>
  )
}

function AttentionList({ t, issues }: { t: Copy; issues: OperationalIssue[] }) {
  return (
    <div className="op-attention" aria-labelledby="attention-heading">
      <h3 id="attention-heading" className="op-section__subtitle">
        {t.attentionTitle}
      </h3>
      {issues.length === 0 ? (
        <EmptyState title={t.noIssues} summary={t.noIssuesSummary} />
      ) : (
        <ul className="op-issue-list">
          {issues.map((issue) => (
            <li key={issue.id} className="op-issue">
              <div className="op-issue__head">
                <StatusBadge tone={issueSeverityTone(issue.severity)} label={issue.severity} />
                <span className="op-issue__title">{issue.title}</span>
              </div>
              <p className="op-issue__summary">{issue.summary}</p>
              {issue.evidence.length > 0 && (
                <div className="op-issue__evidence">
                  <span className="op-issue__evidence-label">{t.evidence}:</span>
                  <ul>
                    {issue.evidence.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {issue.suggestedAction && (
                <p className="op-issue__action">
                  {t.suggestedAction}: {issue.suggestedAction}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
                  {t.status}: {p.productStatus} · {t.businessUnit}: {p.businessUnitLabel ?? p.businessUnitId ?? t.unknownField}
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
                  <StatusBadge tone="info" label={t.noSourceOfTruth} />
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

// ================================================================ SERVICES
// ServicesSection (AOS_OPERATIONAL_TRUTH_RECONCILIATION):
// la fuente de la vista es el RUNTIME AOS (aos status --json v1.1), no el
// catalogo estatico de Knowledge. Ademas de la vista, expone las acciones
// seguras START/STOP/RESTART (Seccion 32) solo para managed=aos; external
// queda VIEW ONLY. command-center bloquea stop/restart (self-stop policy).
const SELF_SERVICE_ID = 'command-center'

interface PendingAction {
  serviceId: string
  op: ServiceActionOp
}

function ServicesSection({
  t,
  aos,
  aosEndpoints,
  onRefresh,
}: {
  t: Copy
  aos: DataState<AosServiceRuntimeSummary[]>
  aosEndpoints: DataState<AosEndpointSummary[]>
  onRefresh: () => void
}) {
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function requestAction(serviceId: string, op: ServiceActionOp) {
    setError(null)
    if (op === 'start') {
      void runAction(serviceId, op)
      return
    }
    setPending({ serviceId, op })
  }

  async function runAction(serviceId: string, op: ServiceActionOp) {
    setBusy(true)
    setError(null)
    const result = await postServiceAction(serviceId, op)
    setBusy(false)
    if (!result.ok) {
      setError(t.actionFailed(result.reason ?? `HTTP ${result.status}`))
      return
    }
    setPending(null)
    onRefresh()
    // Estado terminal no siempre es inmediato (STARTING/STOPPING) — un
    // segundo refresh corto tras la accion, sin polling agresivo (Seccion 39/65).
    setTimeout(() => onRefresh(), 2000)
  }

  return (
    <section className="op-section" aria-labelledby="services-heading">
      <h2 id="services-heading" className="op-section__title">
        {t.servicesTitle}
      </h2>
      {error && (
        <p className="op-state op-state--error" role="alert">
          {error}
        </p>
      )}
      <DataStateView state={aos} labels={stateLabels(t)}>
        {(items) => (
          <ul className="op-list">
            {items.map((s) => {
              const isExternal = s.managed === 'external'
              const isSelf = s.service === SELF_SERVICE_ID
              const isRunning = s.state === 'running' || s.state === 'starting'
              return (
                <li key={s.service} className="op-list__item">
                  <span className="op-list__name">{s.service}</span>
                  <StatusBadge tone={stateTone(s.state)} label={t.serviceState(s.state)} />
                  {isExternal && <StatusBadge tone="muted" label={t.managedExternal} />}
                  <span className="op-list__meta">{s.localUrl ?? (s.port ? `${s.port}` : '')}</span>
                  <span className="op-list__meta">
                    {t.health}: {t.healthState(s.health)}
                  </span>
                  {s.publicUrl && s.health === 'ok' && <span className="op-list__meta">HTTPS: {s.publicUrl}</span>}
                  <span className="op-list__source">
                    {t.source}: aos · {t.runtime}
                  </span>
                  <div className="op-list__actions">
                    {isExternal ? (
                      <StatusBadge tone="muted" label={t.actionViewOnly} />
                    ) : (
                      <>
                        <Button variant="secondary" size="sm" disabled={isRunning || busy} onClick={() => requestAction(s.service, 'start')}>
                          {t.actionStart}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy || isSelf || !isRunning}
                          title={isSelf ? t.selfStopBlocked : undefined}
                          onClick={() => requestAction(s.service, 'stop')}
                        >
                          {t.actionStop}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy || isSelf}
                          title={isSelf ? t.selfStopBlocked : undefined}
                          onClick={() => requestAction(s.service, 'restart')}
                        >
                          {t.actionRestart}
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DataStateView>

      <h3 className="op-section__subtitle">Endpoints</h3>
      <DataStateView state={aosEndpoints} labels={stateLabels(t)}>
        {(items) => (
          <ul className="op-list">
            {items.map((e) => (
              <li key={e.domain ?? e.service ?? e.status} className="op-list__item">
                <span className="op-list__name">{e.domain ?? t.unknownField}</span>
                <StatusBadge tone={stateTone(e.status)} label={t.endpointState(e.status)} />
                <span className="op-list__meta">
                  {e.authProtected && e.https ? t.httpsAuthProtected : ''}
                  {e.backendReachable === false && e.configured ? ` ${t.backendDown}` : ''}
                </span>
                {e.service && (
                  <span className="op-list__source">
                    {t.source}: aos · {e.service}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </DataStateView>

      {pending && (
        <ConfirmationDialog
          open
          title={t.confirmTitle(pending.op, pending.serviceId)}
          summary={t.confirmSummary(pending.op, pending.serviceId)}
          consequence={pending.op === 'stop' ? t.confirmConsequenceStop : t.confirmConsequenceRestart}
          confirmLabel={t.confirmConfirm(pending.op === 'stop' ? t.actionStop : t.actionRestart)}
          cancelLabel={t.confirmCancel}
          busy={busy}
          error={error}
          destructive={pending.op === 'stop'}
          onConfirm={() => void runAction(pending.serviceId, pending.op)}
          onCancel={() => {
            setPending(null)
            setError(null)
          }}
        />
      )}
    </section>
  )
}

function KnowledgeSection({
  t,
  health,
  conflicts,
}: {
  t: Copy
  health: DataState<SystemHealth>
  conflicts: DataState<ConflictSummary[]>
}) {
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

      <h3 className="op-section__subtitle">{t.conflictsTitle}</h3>
      <DataStateView state={conflicts} labels={stateLabels(t)}>
        {(items) =>
          items.length === 0 ? (
            <p className="op-note">{t.noConflicts}</p>
          ) : (
            <ul className="op-list">
              {items.map((c) => (
                <li key={c.id} className="op-list__item">
                  <span className="op-list__name">
                    {c.entityId}.{c.field}
                  </span>
                  <StatusBadge tone={c.reviewRequired ? 'danger' : 'warning'} label={c.status} />
                  <span className="op-list__meta">
                    {c.authoritativeSource}={JSON.stringify(c.authoritativeValue)} vs {c.observedSource}=
                    {JSON.stringify(c.observedValue)}
                  </span>
                </li>
              ))}
            </ul>
          )
        }
      </DataStateView>
    </section>
  )
}
