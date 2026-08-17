// EntityDrawer — generic entity detail + relationship navigation
// (COMMAND_CENTER_ENTITY_NAVIGATION_AND_SEARCH, Seccion 9/13/14/15).
//
// Domain-specific composition on top of the DS-canonical Drawer (src/ui/
// Drawer.tsx -> ac-drawer). Renders ANY Knowledge entity type generically
// (Seccion 7: no hardcoded type list) — Product/Repository/Service get one
// extra cross-reference (live AOS runtime state) when resolvable, everything
// else (Standard/Technology/BusinessUnit/Endpoint/unresolved refs) uses the
// same properties+relationships layout.
//
// Never fabricates data: relationships come only from getEntityDetail()
// (Knowledge/AKG), unresolved targets are shown with their raw id and a
// "no record" notice (Seccion 15), never a crash.
import { useEffect, useState } from 'react'
import { getEntityDetail } from '../../adapters/knowledgeAdapter'
import { fetchRepositoryRuntimeFromApi, getRepositoryRuntimeById } from '../../adapters/repositoryRuntimeAdapter'
import { classifyEndpointStatus } from '../../domain/endpointReconciliation'
import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import type {
  AosEndpointSummary,
  AosServiceRuntimeSummary,
  DataState,
  EndpointMatch,
  EndpointStatusClass,
  RelationshipView,
  RepositoryRuntimeState,
} from '../../contracts/types'
import { Drawer } from '../../ui/Drawer'
import { Button } from '../../ui/Button'
import { StatusBadge, type StatusTone } from '../../ui/StatusBadge'
import { EmptyState } from '../../ui/EmptyState'
import './entity-drawer.css'

interface EntityDrawerCopy {
  type: string
  canonicalId: string
  source: string
  status: string
  properties: string
  relationships: string
  incoming: string
  outgoing: string
  noRelationships: string
  unresolvedNotice: string
  notFound: string
  back: string
  close: string
  runtimeStatus: string
  gitSection: string
  gitBranch: string
  gitDetached: string
  gitHead: string
  gitWorkingTree: string
  gitClean: string
  gitDirty: string
  gitUnknown: string
  gitWorkTreeCounts: (m: number, a: number, d: number, r: number, u: number) => string
  gitRemote: string
  gitNoUpstream: string
  gitSynced: string
  gitAhead: (n: number) => string
  gitBehind: (n: number) => string
  gitDiverged: (a: number, b: number) => string
  gitRemoteCaveat: string
  gitLastCommit: string
  gitUnavailable: (reason: string) => string
  gitObservedAt: string
  cbmSection: string
  cbmAvailable: string
  cbmNotIndexed: string
  cbmFreshness: string
  cbmIndexedHead: string
  cbmWorkingTree: string
  endpointSection: string
  endpointDomain: string
  endpointStatusClass: (cls: EndpointStatusClass) => string
  endpointHttps: string
  endpointAuthRequired: string
  endpointService: string
  endpointNoService: string
  endpointObserved: string
  endpointNoLiveMapping: string
  endpointOperationalTitle: string
  endpointOperationalNotice: string
  endpointAmbiguousNotice: (n: number) => string
  endpointAmbiguousCandidates: string
  endpointEvidence: string
  yes: string
  no: string
}

const COPY: Record<DashboardLanguage, EntityDrawerCopy> = {
  es: {
    type: 'Tipo',
    canonicalId: 'ID canónico',
    source: 'Fuente',
    status: 'Estado',
    properties: 'Propiedades',
    relationships: 'Relaciones',
    incoming: 'Entrantes',
    outgoing: 'Salientes',
    noRelationships: 'No hay relaciones disponibles',
    unresolvedNotice: 'Esta entidad solo existe como extremo de una relación — Knowledge no tiene un registro propio.',
    notFound: 'Entidad no encontrada en Knowledge.',
    back: 'Atrás',
    close: 'Cerrar',
    runtimeStatus: 'Estado en vivo (AOS)',
    gitSection: 'Git',
    gitBranch: 'Rama',
    gitDetached: 'HEAD desacoplado',
    gitHead: 'HEAD',
    gitWorkingTree: 'Árbol de trabajo',
    gitClean: 'LIMPIO',
    gitDirty: 'CON CAMBIOS',
    gitUnknown: 'DESCONOCIDO',
    gitWorkTreeCounts: (m, a, d, r, u) => `${m} modificados · ${a} añadidos · ${d} borrados · ${r} renombrados · ${u} sin seguimiento`,
    gitRemote: 'Relación con remoto',
    gitNoUpstream: 'Sin upstream configurado',
    gitSynced: 'Sincronizado',
    gitAhead: (n) => `${n} commit(s) por delante`,
    gitBehind: (n) => `${n} commit(s) por detrás`,
    gitDiverged: (a, b) => `Divergido — ${a} por delante, ${b} por detrás`,
    gitRemoteCaveat: 'Comparación con remoto basada en refs locales — no se ejecuta git fetch.',
    gitLastCommit: 'Último commit',
    gitUnavailable: (reason) => `Git no disponible: ${reason}`,
    gitObservedAt: 'Observado',
    cbmSection: 'Inteligencia de código (CBM)',
    cbmAvailable: 'Indexado',
    cbmNotIndexed: 'Sin indexar',
    cbmFreshness: 'Frescura',
    cbmIndexedHead: 'HEAD indexado',
    cbmWorkingTree: 'Árbol de trabajo (CBM)',
    endpointSection: 'Estado en vivo (AOS)',
    endpointDomain: 'Dominio',
    endpointStatusClass: (cls) => ({
      protected: 'PROTEGIDO',
      'app-authenticated': 'AUTENTICADO POR LA APP',
      'local-only': 'SOLO LOCAL / NO CONFIGURADO',
      unreachable: 'INALCANZABLE',
      exposed: 'EXPUESTO',
      configured: 'CONFIGURADO',
      unknown: 'DESCONOCIDO',
    })[cls],
    endpointHttps: 'HTTPS',
    endpointAuthRequired: 'Auth requerida',
    endpointService: 'Servicio',
    endpointNoService: 'Sin servicio asociado',
    endpointObserved: 'Observado',
    endpointNoLiveMapping: 'Solo semántico / sin runtime en vivo',
    endpointOperationalTitle: 'Endpoint (solo AOS)',
    endpointOperationalNotice: 'Este endpoint no tiene una entidad Knowledge correspondiente — vista operacional únicamente.',
    endpointAmbiguousNotice: (n) => `Coincidencia semántica ambigua — ${n} entidades Knowledge candidatas.`,
    endpointAmbiguousCandidates: 'Candidatos',
    endpointEvidence: 'Evidencia de coincidencia',
    yes: 'Sí',
    no: 'No',
  },
  en: {
    type: 'Type',
    canonicalId: 'Canonical ID',
    source: 'Source',
    status: 'Status',
    properties: 'Properties',
    relationships: 'Relationships',
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    noRelationships: 'No relationships available',
    unresolvedNotice: 'This entity only exists as a relationship target — Knowledge has no record of its own for it.',
    notFound: 'Entity not found in Knowledge.',
    back: 'Back',
    close: 'Close',
    runtimeStatus: 'Live runtime status (AOS)',
    gitSection: 'Git',
    gitBranch: 'Branch',
    gitDetached: 'Detached HEAD',
    gitHead: 'HEAD',
    gitWorkingTree: 'Working tree',
    gitClean: 'CLEAN',
    gitDirty: 'DIRTY',
    gitUnknown: 'UNKNOWN',
    gitWorkTreeCounts: (m, a, d, r, u) => `${m} modified · ${a} added · ${d} deleted · ${r} renamed · ${u} untracked`,
    gitRemote: 'Remote relation',
    gitNoUpstream: 'No upstream configured',
    gitSynced: 'Synced',
    gitAhead: (n) => `${n} commit(s) ahead`,
    gitBehind: (n) => `${n} commit(s) behind`,
    gitDiverged: (a, b) => `Diverged — ${a} ahead, ${b} behind`,
    gitRemoteCaveat: 'Remote comparison based on local refs — no git fetch is executed.',
    gitLastCommit: 'Last commit',
    gitUnavailable: (reason) => `Git unavailable: ${reason}`,
    gitObservedAt: 'Observed',
    cbmSection: 'Code intelligence (CBM)',
    cbmAvailable: 'Indexed',
    cbmNotIndexed: 'Not indexed',
    cbmFreshness: 'Freshness',
    cbmIndexedHead: 'Indexed HEAD',
    cbmWorkingTree: 'Working tree (CBM)',
    endpointSection: 'Live status (AOS)',
    endpointDomain: 'Domain',
    endpointStatusClass: (cls) => ({
      protected: 'Protected',
      'app-authenticated': 'App authenticated',
      'local-only': 'Local only / Not configured',
      unreachable: 'Unreachable',
      exposed: 'Exposed',
      configured: 'Configured',
      unknown: 'Unknown',
    })[cls],
    endpointHttps: 'HTTPS',
    endpointAuthRequired: 'Auth required',
    endpointService: 'Service',
    endpointNoService: 'No associated service',
    endpointObserved: 'Observed',
    endpointNoLiveMapping: 'Semantic only / No live runtime mapping',
    endpointOperationalTitle: 'Endpoint (AOS only)',
    endpointOperationalNotice: 'This endpoint has no corresponding Knowledge entity — operational view only.',
    endpointAmbiguousNotice: (n) => `Ambiguous semantic match — ${n} candidate Knowledge entities.`,
    endpointAmbiguousCandidates: 'Candidates',
    endpointEvidence: 'Match evidence',
    yes: 'Yes',
    no: 'No',
  },
  de: {
    type: 'Typ',
    canonicalId: 'Kanonische ID',
    source: 'Quelle',
    status: 'Status',
    properties: 'Eigenschaften',
    relationships: 'Beziehungen',
    incoming: 'Eingehend',
    outgoing: 'Ausgehend',
    noRelationships: 'Keine Beziehungen verfügbar',
    unresolvedNotice: 'Diese Entität existiert nur als Beziehungsziel — Knowledge hat dafür keinen eigenen Datensatz.',
    notFound: 'Entität nicht in Knowledge gefunden.',
    back: 'Zurück',
    close: 'Schließen',
    runtimeStatus: 'Live-Laufzeitstatus (AOS)',
    gitSection: 'Git',
    gitBranch: 'Branch',
    gitDetached: 'Detached HEAD',
    gitHead: 'HEAD',
    gitWorkingTree: 'Arbeitsverzeichnis',
    gitClean: 'SAUBER',
    gitDirty: 'GEÄNDERT',
    gitUnknown: 'UNBEKANNT',
    gitWorkTreeCounts: (m, a, d, r, u) => `${m} geändert · ${a} hinzugefügt · ${d} gelöscht · ${r} umbenannt · ${u} unversioniert`,
    gitRemote: 'Remote-Beziehung',
    gitNoUpstream: 'Kein Upstream konfiguriert',
    gitSynced: 'Synchronisiert',
    gitAhead: (n) => `${n} Commit(s) voraus`,
    gitBehind: (n) => `${n} Commit(s) zurück`,
    gitDiverged: (a, b) => `Divergiert — ${a} voraus, ${b} zurück`,
    gitRemoteCaveat: 'Remote-Vergleich basiert auf lokalen Refs — kein git fetch wird ausgeführt.',
    gitLastCommit: 'Letzter Commit',
    gitUnavailable: (reason) => `Git nicht verfügbar: ${reason}`,
    gitObservedAt: 'Beobachtet',
    cbmSection: 'Code-Intelligenz (CBM)',
    cbmAvailable: 'Indiziert',
    cbmNotIndexed: 'Nicht indiziert',
    cbmFreshness: 'Aktualität',
    cbmIndexedHead: 'Indizierter HEAD',
    cbmWorkingTree: 'Arbeitsverzeichnis (CBM)',
    endpointSection: 'Live-Status (AOS)',
    endpointDomain: 'Domain',
    endpointStatusClass: (cls) => ({
      protected: 'Geschützt',
      'app-authenticated': 'App-authentifiziert',
      'local-only': 'Nur lokal / Nicht konfiguriert',
      unreachable: 'Nicht erreichbar',
      exposed: 'Exponiert',
      configured: 'Konfiguriert',
      unknown: 'Unbekannt',
    })[cls],
    endpointHttps: 'HTTPS',
    endpointAuthRequired: 'Auth erforderlich',
    endpointService: 'Dienst',
    endpointNoService: 'Kein zugehöriger Dienst',
    endpointObserved: 'Beobachtet',
    endpointNoLiveMapping: 'Nur semantisch / keine Live-Laufzeitzuordnung',
    endpointOperationalTitle: 'Endpoint (nur AOS)',
    endpointOperationalNotice: 'Dieser Endpoint hat keine entsprechende Knowledge-Entität — nur operative Ansicht.',
    endpointAmbiguousNotice: (n) => `Mehrdeutige semantische Zuordnung — ${n} Kandidaten-Entitäten.`,
    endpointAmbiguousCandidates: 'Kandidaten',
    endpointEvidence: 'Zuordnungsnachweis',
    yes: 'Ja',
    no: 'Nein',
  },
}

function relationshipVerb(type: string): string {
  return type.toLowerCase().replace(/_/g, ' ')
}

function RelationshipGroup({
  title,
  items,
  onNavigate,
}: {
  title: string
  items: RelationshipView[]
  onNavigate: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="op-rel-group">
      <h4 className="op-rel-group__title">{title}</h4>
      <ul className="op-rel-list">
        {items.map((rel) => (
          <li key={rel.id} className="op-rel-item">
            <span className="op-rel-item__verb">{relationshipVerb(rel.type)}</span>
            {rel.counterpart.found ? (
              <button type="button" className="op-rel-item__target" onClick={() => onNavigate(rel.counterpart.id)}>
                {rel.counterpart.label}
              </button>
            ) : (
              <span className="op-rel-item__target op-rel-item__target--unresolved" title={rel.counterpart.id}>
                {rel.counterpart.label}
              </span>
            )}
            <span className="op-rel-item__type">{rel.counterpart.type}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function divergenceTone(divergence: RepositoryRuntimeState['divergence']): StatusTone {
  switch (divergence) {
    case 'SYNCED':
      return 'success'
    case 'AHEAD':
    case 'BEHIND':
      return 'info'
    case 'DIVERGED':
      return 'warning'
    default:
      return 'muted'
  }
}

function divergenceLabel(rt: RepositoryRuntimeState, t: EntityDrawerCopy): string {
  switch (rt.divergence) {
    case 'SYNCED':
      return t.gitSynced
    case 'AHEAD':
      return t.gitAhead(rt.ahead ?? 0)
    case 'BEHIND':
      return t.gitBehind(rt.behind ?? 0)
    case 'DIVERGED':
      return t.gitDiverged(rt.ahead ?? 0, rt.behind ?? 0)
    case 'NO_UPSTREAM':
      return t.gitNoUpstream
    default:
      return t.gitUnknown
  }
}

// Repository Git + CBM section — Seccion 19/20/40: Git y CBM son fuentes
// separadas de Knowledge, mostradas con evidencia propia, nunca fusionadas
// en un campo ambiguo.
function RepositoryGitSection({ runtime: rt, t }: { runtime: RepositoryRuntimeState; t: EntityDrawerCopy }) {
  if (!rt.available) {
    return (
      <div className="op-entity-section">
        <h3 className="op-entity-section__title">{t.gitSection}</h3>
        <EmptyState title={t.gitUnavailable(rt.errors[0] ?? t.gitUnknown)} />
      </div>
    )
  }

  const cleanTone: StatusTone = rt.clean === null ? 'muted' : rt.clean ? 'success' : 'warning'
  const cleanLabel = rt.clean === null ? t.gitUnknown : rt.clean ? t.gitClean : t.gitDirty

  return (
    <>
      <div className="op-entity-section">
        <h3 className="op-entity-section__title">{t.gitSection}</h3>
        <dl className="op-entity-props">
          <div>
            <dt>{t.gitBranch}</dt>
            <dd>{rt.detached ? t.gitDetached : (rt.branch ?? '—')}</dd>
          </div>
          <div>
            <dt>{t.gitHead}</dt>
            <dd className="op-entity-meta__mono">{rt.shortHead ?? '—'}</dd>
          </div>
          <div>
            <dt>{t.gitWorkingTree}</dt>
            <dd>
              <StatusBadge tone={cleanTone} label={cleanLabel} />
            </dd>
          </div>
          {!rt.clean && (
            <div>
              <dt />
              <dd>{t.gitWorkTreeCounts(rt.modifiedCount, rt.addedCount, rt.deletedCount, rt.renamedCount, rt.untrackedCount)}</dd>
            </div>
          )}
          <div>
            <dt>{t.gitRemote}</dt>
            <dd>
              <StatusBadge tone={divergenceTone(rt.divergence)} label={divergenceLabel(rt, t)} />
              {rt.divergence !== 'NO_UPSTREAM' && rt.divergence !== 'UNKNOWN' && (
                <div className="ac-data-table__meta">{t.gitRemoteCaveat}</div>
              )}
            </dd>
          </div>
          {rt.lastCommit && (
            <div>
              <dt>{t.gitLastCommit}</dt>
              <dd>
                {rt.lastCommit.subject} <span className="op-entity-meta__mono">({rt.lastCommit.shortHash})</span>
                <div className="ac-data-table__meta">{rt.lastCommit.authorName}</div>
              </dd>
            </div>
          )}
          <div>
            <dt>{t.gitObservedAt}</dt>
            <dd title={rt.observedAt}>{new Date(rt.observedAt).toLocaleTimeString()}</dd>
          </div>
        </dl>
      </div>

      <div className="op-entity-section">
        <h3 className="op-entity-section__title">{t.cbmSection}</h3>
        {rt.cbm.available ? (
          <dl className="op-entity-props">
            <div>
              <dt>{t.cbmFreshness}</dt>
              <dd>
                <StatusBadge tone={rt.cbm.freshness === 'FRESH' ? 'success' : 'info'} label={rt.cbm.freshness ?? t.gitUnknown} />
              </dd>
            </div>
            <div>
              <dt>{t.cbmIndexedHead}</dt>
              <dd className="op-entity-meta__mono">{rt.cbm.indexedHead ?? '—'}</dd>
            </div>
            <div>
              <dt>{t.cbmWorkingTree}</dt>
              <dd>{rt.cbm.workingTree ?? t.gitUnknown}</dd>
            </div>
          </dl>
        ) : (
          <EmptyState title={t.cbmNotIndexed} />
        )}
      </div>
    </>
  )
}

function endpointStatusTone(cls: EndpointStatusClass): StatusTone {
  switch (cls) {
    case 'protected':
    case 'app-authenticated':
      return 'success'
    case 'exposed':
    case 'configured':
      return 'info'
    case 'unreachable':
      return 'danger'
    case 'local-only':
      return 'muted'
    default:
      return 'warning'
  }
}

// Live AOS fields shared by both paths (Knowledge Endpoint matched + AOS-only
// operational reference) — Seccion 14/18: LIVE AOS block, source-labeled,
// never merged into an ambiguous field.
function EndpointLiveFields({ aos, t, onOpenService }: { aos: AosEndpointSummary; t: EntityDrawerCopy; onOpenService: () => void }) {
  const cls = classifyEndpointStatus(aos)
  return (
    <dl className="op-entity-props">
      <div>
        <dt>{t.endpointDomain}</dt>
        <dd>{aos.domain ?? '—'}</dd>
      </div>
      <div>
        <dt>{t.status}</dt>
        <dd>
          <StatusBadge tone={endpointStatusTone(cls)} label={t.endpointStatusClass(cls)} />
        </dd>
      </div>
      <div>
        <dt>{t.endpointHttps}</dt>
        <dd>{aos.https ? t.yes : t.no}</dd>
      </div>
      <div>
        <dt>{t.endpointAuthRequired}</dt>
        <dd>{aos.authRequired ? t.yes : t.no}</dd>
      </div>
      <div>
        <dt>{t.endpointService}</dt>
        <dd>
          {aos.service ? (
            <button type="button" className="op-rel-item__target" onClick={onOpenService}>
              {aos.service}
            </button>
          ) : (
            t.endpointNoService
          )}
        </dd>
      </div>
    </dl>
  )
}

// Endpoint reconciliado con Knowledge Endpoint (Seccion 18): entidad
// generica normal + este bloque LIVE AOS extra.
function EndpointKnowledgeLiveSection({ match, t, onNavigate }: { match: EndpointMatch; t: EntityDrawerCopy; onNavigate: (id: string) => void }) {
  return (
    <div className="op-entity-section">
      <h3 className="op-entity-section__title">{t.endpointSection}</h3>
      <EndpointLiveFields aos={match.aos} t={t} onOpenService={() => onNavigate(`service:${match.aos.service}`)} />
    </div>
  )
}

// Endpoint SOLO-AOS sin entidad Knowledge (Seccion 16): view model de
// Command Center, nunca escrito a Knowledge. Cubre UNMATCHED, AMBIGUOUS
// (con lista de candidatos, sin auto-elegir) y NOT_APPLICABLE (local-only).
function OperationalEndpointView({ match, t, onNavigate }: { match: EndpointMatch; t: EntityDrawerCopy; onNavigate: (id: string) => void }) {
  return (
    <>
      <dl className="op-entity-meta">
        <div>
          <dt>{t.canonicalId}</dt>
          <dd className="op-entity-meta__mono">{match.id}</dd>
        </div>
        <div>
          <dt>{t.source}</dt>
          <dd>aos</dd>
        </div>
      </dl>

      {/* NOT_APPLICABLE (local-only) ya queda claro via el badge "Local only /
          Not configured" en Live AOS abajo — no hace falta un aviso extra. */}
      {match.result === 'UNMATCHED' && <EmptyState title={t.endpointOperationalNotice} />}

      {match.result === 'AMBIGUOUS' && (
        <div className="op-entity-section">
          <EmptyState title={t.endpointAmbiguousNotice(match.candidateIds.length)} />
          <h4 className="op-rel-group__title">{t.endpointAmbiguousCandidates}</h4>
          <ul className="op-rel-list">
            {match.candidateIds.map((id) => (
              <li key={id} className="op-rel-item">
                <button type="button" className="op-rel-item__target" onClick={() => onNavigate(id)}>
                  {id}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="op-entity-section">
        <h3 className="op-entity-section__title">{t.endpointSection}</h3>
        <EndpointLiveFields aos={match.aos} t={t} onOpenService={() => onNavigate(`service:${match.aos.service}`)} />
      </div>

      <div className="op-entity-section">
        <h3 className="op-entity-section__title">{t.endpointEvidence}</h3>
        <p className="op-entity-props">{match.evidence}</p>
      </div>
    </>
  )
}

export function EntityDrawer({
  entityId,
  language,
  aos,
  endpointMatches = [],
  onClose,
  onBack,
  onNavigate,
}: {
  entityId: string | null
  language: DashboardLanguage
  aos: DataState<AosServiceRuntimeSummary[]>
  endpointMatches?: EndpointMatch[]
  onClose: () => void
  onBack?: () => void
  onNavigate: (id: string) => void
}) {
  const t = COPY[language]
  const detail = entityId ? getEntityDetail(entityId) : null

  // Endpoint reconciliation (COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION):
  // "endpoint:*" ids that resolved to a real Knowledge entity get a Live AOS
  // section added; "aos-endpoint:*" synthetic ids (no Knowledge entity)
  // render the operational-only view below instead of the not-found state.
  const isOperationalEndpoint = entityId?.startsWith('aos-endpoint:') ?? false
  const endpointMatch = isOperationalEndpoint
    ? endpointMatches.find((m) => m.id === entityId)
    : detail?.type === 'Endpoint'
      ? endpointMatches.find((m) => m.knowledgeId === entityId)
      : undefined

  const runtime =
    detail && detail.type === 'Service' && aos.status === 'READY'
      ? aos.data.find((s) => s.service === detail.id.replace(/^service:/, ''))
      : undefined

  // Repository: pinta primero el runtime ya cargado en el lote (si existe)
  // y dispara una prueba en vivo propia al abrir (Seccion 25) — la mas
  // reciente gana. Nunca bloquea el resto del drawer mientras carga.
  const censusId = detail?.type === 'Repository' ? (detail.properties.census_id as string | undefined) : undefined
  const [liveRepoRuntime, setLiveRepoRuntime] = useState<{ censusId: string; data: RepositoryRuntimeState | null } | null>(null)
  useEffect(() => {
    if (!censusId) return
    let cancelled = false
    void fetchRepositoryRuntimeFromApi(censusId).then((result) => {
      if (!cancelled) setLiveRepoRuntime({ censusId, data: result })
    })
    return () => {
      cancelled = true
    }
  }, [censusId])
  const freshRepoRuntime = liveRepoRuntime && liveRepoRuntime.censusId === censusId ? liveRepoRuntime.data : null
  const repoRuntime = censusId ? (freshRepoRuntime ?? getRepositoryRuntimeById(censusId)) : null

  const incoming = detail?.relationships.filter((r) => r.direction === 'incoming') ?? []
  const outgoing = detail?.relationships.filter((r) => r.direction === 'outgoing') ?? []

  const propertyEntries = detail ? Object.entries(detail.properties) : []
  const statusEntries = detail ? Object.entries(detail.status) : []

  const operationalTitle = endpointMatch?.aos.domain ?? endpointMatch?.aos.service ?? entityId ?? ''

  return (
    <Drawer
      open={entityId !== null}
      title={isOperationalEndpoint ? operationalTitle : (detail?.label ?? entityId ?? '')}
      eyebrow={isOperationalEndpoint ? t.endpointOperationalTitle : detail?.type}
      onClose={onClose}
      footer={
        <>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              ← {t.back}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t.close}
          </Button>
        </>
      }
    >
      {isOperationalEndpoint ? (
        endpointMatch ? (
          <OperationalEndpointView match={endpointMatch} t={t} onNavigate={onNavigate} />
        ) : (
          <EmptyState title={t.notFound} />
        )
      ) : !detail ? (
        <EmptyState title={t.notFound} />
      ) : (
        <>
          <dl className="op-entity-meta">
            <div>
              <dt>{t.canonicalId}</dt>
              <dd className="op-entity-meta__mono">{detail.id}</dd>
            </div>
            <div>
              <dt>{t.source}</dt>
              <dd>{detail.source}</dd>
            </div>
          </dl>

          {!detail.found && <EmptyState title={t.unresolvedNotice} />}

          {repoRuntime && <RepositoryGitSection runtime={repoRuntime} t={t} />}

          {endpointMatch && <EndpointKnowledgeLiveSection match={endpointMatch} t={t} onNavigate={onNavigate} />}
          {detail.type === 'Endpoint' && !endpointMatch && <EmptyState title={t.endpointNoLiveMapping} />}

          {runtime && (
            <div className="op-entity-section">
              <h3 className="op-entity-section__title">{t.runtimeStatus}</h3>
              <div className="op-entity-runtime">
                <StatusBadge tone={runtime.state === 'running' ? 'success' : runtime.state === 'unhealthy' ? 'danger' : 'neutral'} label={runtime.state} />
                <StatusBadge tone={runtime.health === 'ok' ? 'success' : runtime.health === 'failed' ? 'danger' : 'muted'} label={runtime.health} />
              </div>
            </div>
          )}

          {statusEntries.length > 0 && (
            <div className="op-entity-section">
              <h3 className="op-entity-section__title">{t.status}</h3>
              <dl className="op-entity-props">
                {statusEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {propertyEntries.length > 0 && (
            <div className="op-entity-section">
              <h3 className="op-entity-section__title">{t.properties}</h3>
              <dl className="op-entity-props">
                {propertyEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value === null ? '—' : String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="op-entity-section">
            <h3 className="op-entity-section__title">{t.relationships}</h3>
            {incoming.length === 0 && outgoing.length === 0 ? (
              <EmptyState title={t.noRelationships} />
            ) : (
              <>
                <RelationshipGroup title={t.incoming} items={incoming} onNavigate={onNavigate} />
                <RelationshipGroup title={t.outgoing} items={outgoing} onNavigate={onNavigate} />
              </>
            )}
          </div>
        </>
      )}
    </Drawer>
  )
}
