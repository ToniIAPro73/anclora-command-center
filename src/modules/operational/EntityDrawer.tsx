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
import { getEntityDetail } from '../../adapters/knowledgeAdapter'
import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import type { AosServiceRuntimeSummary, DataState, RelationshipView } from '../../contracts/types'
import { Drawer } from '../../ui/Drawer'
import { Button } from '../../ui/Button'
import { StatusBadge } from '../../ui/StatusBadge'
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
