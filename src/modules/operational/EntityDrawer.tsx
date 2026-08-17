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
import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import type { AosServiceRuntimeSummary, DataState, RelationshipView, RepositoryRuntimeState } from '../../contracts/types'
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

export function EntityDrawer({
  entityId,
  language,
  aos,
  onClose,
  onBack,
  onNavigate,
}: {
  entityId: string | null
  language: DashboardLanguage
  aos: DataState<AosServiceRuntimeSummary[]>
  onClose: () => void
  onBack?: () => void
  onNavigate: (id: string) => void
}) {
  const t = COPY[language]
  const detail = entityId ? getEntityDetail(entityId) : null

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

  return (
    <Drawer
      open={entityId !== null}
      title={detail?.label ?? entityId ?? ''}
      eyebrow={detail?.type}
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
      {!detail ? (
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
