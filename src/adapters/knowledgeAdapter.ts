// Adapter: unica frontera entre la fuente Knowledge/AKG (local backend) y los contratos UI.
//
// COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT (2026-08-17): la fuente deja de ser un
// snapshot estático importado en build-time (src/generated/) y pasa a ser el
// endpoint local `/api/knowledge` servido por server/server.mjs, que lee el
// knowledge-model.json derivado real (Knowledge/AKG) con cache por mtime.
//
// Este adapter expone un MAPPER PURO (mapKnowledgeSnapshot) —dado el payload
// del API— que devuelve los contratos UI (DataState). El hook
// useOperationalData (src/api) es quien hace el fetch y alimenta el mapper.
//
// Ningun componente React debe importar `src/generated/knowledge-snapshot.json`
// ni recorrer la estructura cruda. Todo pasa por aqui.
//
// Boundary: source -> adapter -> contracts -> UI.
// Solo lectura: no expone ninguna operacion de escritura.

import type {
  ConflictSummary,
  DataState,
  EndpointSummary,
  ProductSummary,
  RelationshipSummary,
  RepositorySummary,
  ServiceSummary,
  SystemHealth,
} from '../contracts/types'

interface RawEntity {
  id: string
  type: string
  name: string
  status: Record<string, unknown>
  fields: Record<string, unknown>
}

interface RawRelationship {
  id: string
  type: string
  from: string
  to: string
  confidence: string
}

interface RawSnapshot {
  schema_version: string
  metadata: {
    generated_at: string
    rebuild_id: string
    counts?: { entities?: number; relationships?: number; conflicts?: number }
  }
  entities: {
    repositories: RawEntity[]
    products: RawEntity[]
    services: RawEntity[]
    endpoints: RawEntity[]
    standards: RawEntity[]
    technologies: RawEntity[]
    'business-units': RawEntity[]
  }
  relationships: RawRelationship[]
  conflicts: RawConflict[]
}

// Forma real de anclora_knowledge/conflicts.py:ConflictRecord.to_dict() —
// campos con valor None se omiten al serializar (resolution_note?, etc.),
// por eso todos los opcionales aqui son tolerantes a ausencia.
interface RawConflict {
  conflict_id?: string
  entity_id?: string
  field?: string
  authoritative_value?: unknown
  authoritative_source?: string
  observed_value?: unknown
  observed_source?: string
  mode?: string
  status?: string
  detected_at?: string
  review_required?: boolean
  resolution_note?: string
}

/** Umbral de frescura del snapshot antes de considerarlo STALE (Seccion 17). */
const STALE_AFTER_MS = 1000 * 60 * 60 * 24 * 30 // 30 dias

function field<T>(entity: RawEntity, key: string): T | null {
  const value = entity.fields[key]
  return value === undefined ? null : (value as T)
}

function statusField(entity: RawEntity, key: string): string {
  const value = entity.status[key]
  return typeof value === 'string' ? value : 'UNKNOWN'
}

function withFreshness<T>(meta: RawSnapshot['metadata'] | undefined, data: T, isEmpty: boolean): DataState<T> {
  if (isEmpty) return { status: 'EMPTY' }

  const generatedAt = meta?.generated_at
  if (generatedAt) {
    const ageMs = Date.now() - new Date(generatedAt).getTime()
    if (Number.isFinite(ageMs) && ageMs > STALE_AFTER_MS) {
      return { status: 'STALE', data, asOf: generatedAt }
    }
  }
  return { status: 'READY', data }
}

/**
 * MAPPER PURO — dado el payload del endpoint /api/knowledge (o un snapshot
 * equivalente), devuelve los contratos UI. Sin side effects.
 */
export function mapKnowledgeSnapshot(raw: RawSnapshot | null | undefined): {
  repositories: DataState<RepositorySummary[]>
  products: DataState<ProductSummary[]>
  services: DataState<ServiceSummary[]>
  endpoints: DataState<EndpointSummary[]>
  health: DataState<SystemHealth>
  conflicts: DataState<ConflictSummary[]>
  relationshipsFor: (entityId: string) => RelationshipSummary[]
} {
  const unavailable: DataState<never> = {
    status: 'UNAVAILABLE',
    reason: 'Knowledge no disponible (el backend local no pudo leer el modelo)',
  }

  if (!raw) {
    return {
      repositories: unavailable,
      products: unavailable,
      services: unavailable,
      endpoints: unavailable,
      health: unavailable,
      conflicts: unavailable,
      relationshipsFor: () => [],
    }
  }

  const entities = raw.entities ?? {}

  // Labels humanas de business units: Knowledge es la fuente (entity.name);
  // la UI muestra la label y conserva el ID canonico (bu:x) intacto en el
  // contrato. Sin diccionario hardcodeado (BUSINESS_UNIT_IDS_HUMANIZED).
  const businessUnitLabels = new Map<string, string>()
  if (Array.isArray(entities['business-units'])) {
    for (const bu of entities['business-units']) {
      if (typeof bu.id === 'string' && typeof bu.name === 'string') {
        businessUnitLabels.set(bu.id, bu.name)
      }
    }
  }
  const businessUnitLabelOf = (id: string | null): string | null =>
    id === null ? null : (businessUnitLabels.get(id) ?? null)

  const repositories: DataState<RepositorySummary[]> = Array.isArray(entities.repositories)
    ? withFreshness(
        raw.metadata,
        entities.repositories.map((r) => ({
          id: r.id,
          name: r.name,
          githubOwner: field(r, 'github_owner'),
          githubVisibility: field<string>(r, 'github_visibility') ?? 'unknown',
          repositoryStatus: statusField(r, 'repository_status'),
          portfolioStatus: statusField(r, 'portfolio_status'),
          defaultBranch: field<string>(r, 'default_branch') ?? 'main',
          productId: null,
          targetRole: field(r, 'target_role'),
          sourceOfTruthLocal: field(r, 'source_of_truth_local'),
          source: 'knowledge' as const,
          sourceId: r.id,
        })),
        entities.repositories.length === 0,
      )
    : unavailable

  const products: DataState<ProductSummary[]> = Array.isArray(entities.products)
    ? withFreshness(
        raw.metadata,
        entities.products.map((p) => {
          const businessUnitId = field<string>(p, 'business_unit_id')
          return {
            id: p.id,
            name: p.name,
            businessUnitId,
            businessUnitLabel: businessUnitLabelOf(businessUnitId),
            repoId: field(p, 'repo_id'),
            productStatus: statusField(p, 'product_status'),
            domain: field(p, 'domain'),
            source: 'knowledge' as const,
            sourceId: p.id,
          }
        }),
        entities.products.length === 0,
      )
    : unavailable

  const services: DataState<ServiceSummary[]> = Array.isArray(entities.services)
    ? withFreshness(
        raw.metadata,
        entities.services.map((s) => ({
          id: s.id,
          name: s.name,
          port: field(s, 'port'),
          bindHost: field(s, 'bind_host'),
          serviceStatus: statusField(s, 'service_status'),
          repoId: field(s, 'repo_id'),
          productId: field(s, 'product_id'),
          publicHost: field(s, 'public_host'),
          source: 'aos' as const,
          sourceId: s.id,
        })),
        entities.services.length === 0,
      )
    : unavailable

  const endpoints: DataState<EndpointSummary[]> = Array.isArray(entities.endpoints)
    ? withFreshness(
        raw.metadata,
        entities.endpoints.map((e) => ({
          id: e.id,
          host: field<string>(e, 'host') ?? e.name,
          port: field(e, 'port'),
          endpointStatus: statusField(e, 'endpoint_status'),
          source: 'aos' as const,
          sourceId: e.id,
        })),
        entities.endpoints.length === 0,
      )
    : unavailable

  const health: DataState<SystemHealth> = raw.metadata
    ? withFreshness(
        raw.metadata,
        {
          ecosystemRepoCount: entities.repositories?.length ?? 0,
          productCount: entities.products?.length ?? 0,
          serviceCount: entities.services?.length ?? 0,
          akgEntityCount: raw.metadata.counts?.entities ?? 0,
          akgRelationshipCount: raw.metadata.counts?.relationships ?? raw.relationships?.length ?? 0,
          akgConflictCount: raw.metadata.counts?.conflicts ?? raw.conflicts?.length ?? 0,
          knowledgeBuildId: raw.metadata.rebuild_id ?? null,
          knowledgeGeneratedAt: raw.metadata.generated_at ?? null,
        },
        false,
      )
    : unavailable

  const relationshipsFor = (entityId: string): RelationshipSummary[] =>
    (raw.relationships ?? [])
      .filter((r) => r.from === entityId || r.to === entityId)
      .map((r) => ({
        id: r.id,
        type: r.type,
        from: r.from,
        to: r.to,
        confidence: r.confidence,
        source: 'akg' as const,
        sourceId: r.id,
      }))

  // Conflictos AKG: previamente parseados y descartados antes de llegar a la
  // UI. EMPTY (no CRITICAL/ERROR) cuando no hay conflictos — 0 es un estado
  // valido y saludable, no una fuente caida.
  const rawConflicts = Array.isArray(raw.conflicts) ? raw.conflicts : []
  const conflicts: DataState<ConflictSummary[]> = !Array.isArray(raw.conflicts)
    ? unavailable
    : withFreshness(
        raw.metadata,
        rawConflicts.map((c, i) => ({
          id: c.conflict_id ?? `conflict:${i}`,
          entityId: c.entity_id ?? 'unknown',
          field: c.field ?? 'unknown',
          authoritativeValue: c.authoritative_value ?? null,
          authoritativeSource: c.authoritative_source ?? 'unknown',
          observedValue: c.observed_value ?? null,
          observedSource: c.observed_source ?? 'unknown',
          mode: c.mode ?? 'unknown',
          status: c.status ?? 'unknown',
          detectedAt: c.detected_at ?? raw.metadata?.generated_at ?? '',
          reviewRequired: Boolean(c.review_required),
          source: 'akg' as const,
          sourceId: c.conflict_id ?? `conflict:${i}`,
        })),
        rawConflicts.length === 0,
      )

  return { repositories, products, services, endpoints, health, conflicts, relationshipsFor }
}

// ================================================================ PROXY (async)
// Compatibilidad con la firma anterior (componentes viejos) y acceso directo:
// el fetch de la fuente local se hace via hook (src/api/useOperationalData.ts);
// estas funciones exponen el snapshot actual al hook y permiten tests.

let currentKnowledge: RawSnapshot | null | undefined

export function setKnowledgeSnapshot(raw: RawSnapshot | null | undefined): void {
  currentKnowledge = raw
}

export function getKnowledgeSnapshot(): RawSnapshot | null | undefined {
  return currentKnowledge
}

// Contratos UI — la fuente se actualiza via setKnowledgeSnapshot() tras fetch.
export function getRepositories(): DataState<RepositorySummary[]> {
  return mapKnowledgeSnapshot(currentKnowledge).repositories
}
export function getProducts(): DataState<ProductSummary[]> {
  return mapKnowledgeSnapshot(currentKnowledge).products
}
export function getServices(): DataState<ServiceSummary[]> {
  return mapKnowledgeSnapshot(currentKnowledge).services
}
export function getEndpoints(): DataState<EndpointSummary[]> {
  return mapKnowledgeSnapshot(currentKnowledge).endpoints
}
export function getSystemHealth(): DataState<SystemHealth> {
  return mapKnowledgeSnapshot(currentKnowledge).health
}
export function getConflicts(): DataState<ConflictSummary[]> {
  return mapKnowledgeSnapshot(currentKnowledge).conflicts
}
export function getRelationshipsFor(entityId: string): RelationshipSummary[] {
  return mapKnowledgeSnapshot(currentKnowledge).relationshipsFor(entityId)
}

/** Carga la fuente Knowledge del backend local. Usado por el hook y por tests de integracion. */
export async function fetchKnowledgeFromApi(): Promise<RawSnapshot | null> {
  const res = await fetch('/api/knowledge')
  if (!res.ok) return null
  const payload = await res.json()
  if (payload?.status !== 'READY') return null
  return payload
}