// Adapter: unica frontera entre el snapshot JSON de Anclora Knowledge/AKG y los contratos UI.
//
// Ningun componente React debe importar `src/generated/knowledge-snapshot.json` directamente
// ni recorrer su estructura interna (entities/fields/relationships crudos). Todo pasa por aqui.
//
// Fuente: src/generated/knowledge-snapshot.json, copiado en build/dev time desde
// anclora-infrastructure/knowledge/generated/knowledge-model.json por
// scripts/sync-knowledge-data.mjs. Ver Seccion 8 de COMMAND_CENTER_REBUILD: implementacion
// inicial minima por filesystem, encapsulada aqui para poder sustituirse despues por una API
// sin tocar los componentes.

import snapshot from '../generated/knowledge-snapshot.json'
import type {
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
  conflicts: unknown[]
}

const raw = snapshot as unknown as RawSnapshot

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

function withFreshness<T>(data: T, isEmpty: boolean): DataState<T> {
  if (isEmpty) return { status: 'EMPTY' }

  const generatedAt = raw.metadata?.generated_at
  if (generatedAt) {
    const ageMs = Date.now() - new Date(generatedAt).getTime()
    if (Number.isFinite(ageMs) && ageMs > STALE_AFTER_MS) {
      return { status: 'STALE', data, asOf: generatedAt }
    }
  }
  return { status: 'READY', data }
}

export function getRepositories(): DataState<RepositorySummary[]> {
  if (!raw?.entities?.repositories) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de Knowledge no disponible (sin sincronizar)' }
  }
  const items: RepositorySummary[] = raw.entities.repositories.map((r) => ({
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
    source: 'knowledge',
    sourceId: r.id,
  }))
  return withFreshness(items, items.length === 0)
}

export function getProducts(): DataState<ProductSummary[]> {
  if (!raw?.entities?.products) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de Knowledge no disponible (sin sincronizar)' }
  }
  const items: ProductSummary[] = raw.entities.products.map((p) => ({
    id: p.id,
    name: p.name,
    businessUnitId: field(p, 'business_unit_id'),
    repoId: field(p, 'repo_id'),
    productStatus: statusField(p, 'product_status'),
    domain: field(p, 'domain'),
    source: 'knowledge',
    sourceId: p.id,
  }))
  return withFreshness(items, items.length === 0)
}

export function getServices(): DataState<ServiceSummary[]> {
  if (!raw?.entities?.services) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de Knowledge no disponible (sin sincronizar)' }
  }
  const items: ServiceSummary[] = raw.entities.services.map((s) => ({
    id: s.id,
    name: s.name,
    port: field(s, 'port'),
    bindHost: field(s, 'bind_host'),
    serviceStatus: statusField(s, 'service_status'),
    repoId: field(s, 'repo_id'),
    productId: field(s, 'product_id'),
    publicHost: field(s, 'public_host'),
    source: 'aos',
    sourceId: s.id,
  }))
  return withFreshness(items, items.length === 0)
}

export function getEndpoints(): DataState<EndpointSummary[]> {
  if (!raw?.entities?.endpoints) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de Knowledge no disponible (sin sincronizar)' }
  }
  const items: EndpointSummary[] = raw.entities.endpoints.map((e) => ({
    id: e.id,
    host: field<string>(e, 'host') ?? e.name,
    port: field(e, 'port'),
    endpointStatus: statusField(e, 'endpoint_status'),
    source: 'aos',
    sourceId: e.id,
  }))
  return withFreshness(items, items.length === 0)
}

export function getRelationshipsFor(entityId: string): RelationshipSummary[] {
  return raw.relationships
    .filter((r) => r.from === entityId || r.to === entityId)
    .map((r) => ({
      id: r.id,
      type: r.type,
      from: r.from,
      to: r.to,
      confidence: r.confidence,
      source: 'akg',
      sourceId: r.id,
    }))
}

export function getSystemHealth(): DataState<SystemHealth> {
  if (!raw?.metadata) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de Knowledge no disponible (sin sincronizar)' }
  }
  const health: SystemHealth = {
    ecosystemRepoCount: raw.entities.repositories.length,
    productCount: raw.entities.products.length,
    serviceCount: raw.entities.services.length,
    akgEntityCount: raw.metadata.counts?.entities ?? 0,
    akgRelationshipCount: raw.metadata.counts?.relationships ?? raw.relationships.length,
    akgConflictCount: raw.metadata.counts?.conflicts ?? raw.conflicts.length,
    knowledgeBuildId: raw.metadata.rebuild_id ?? null,
    knowledgeGeneratedAt: raw.metadata.generated_at ?? null,
  }
  return withFreshness(health, false)
}
