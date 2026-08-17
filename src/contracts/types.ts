// Contratos UI estables para Command Center.
//
// Estos tipos son deliberadamente pequenos e independientes del schema interno de Knowledge/AKG
// (no exponen entities/relationships crudos a los componentes React). Un adapter
// (src/adapters/*) es responsable de mapear el JSON fuente a estos contratos.

export type SourceSystem = 'aos' | 'knowledge' | 'akg' | 'github' | 'governance' | 'vault'

export interface SourceMetadata {
  source: SourceSystem
  sourceId: string
}

/** Estado de disponibilidad de un dato derivado de una fuente externa. Ver Seccion 17. */
export type DataState<T> =
  | { status: 'LOADING' }
  | { status: 'READY'; data: T }
  | { status: 'EMPTY' }
  | { status: 'STALE'; data: T; asOf: string }
  | { status: 'ERROR'; message: string }
  | { status: 'UNAVAILABLE'; reason: string }

export interface RepositorySummary extends SourceMetadata {
  id: string
  name: string
  githubOwner: string | null
  githubVisibility: string
  repositoryStatus: string
  portfolioStatus: string
  defaultBranch: string
  productId: string | null
  targetRole: string | null
  sourceOfTruthLocal: boolean | null
}

export interface ProductSummary extends SourceMetadata {
  id: string
  name: string
  businessUnitId: string | null
  businessUnitLabel: string | null
  repoId: string | null
  productStatus: string
  domain: string | null
}

export interface ServiceSummary extends SourceMetadata {
  id: string
  name: string
  port: number | null
  bindHost: string | null
  serviceStatus: string
  repoId: string | null
  productId: string | null
  publicHost: string | null
}

export interface EndpointSummary extends SourceMetadata {
  id: string
  host: string
  port: number | null
  endpointStatus: string
}

export interface KnowledgeEntitySummary extends SourceMetadata {
  id: string
  type: string
  name: string
}

export interface RelationshipSummary extends SourceMetadata {
  id: string
  type: string
  from: string
  to: string
  confidence: string
}

// Contrato UI del runtime AOS: mapeo plano del contrato machine-readable de
// `aos status --json` (schemaVersion 1.0 y 1.1). El adapter (aosAdapter.ts) es
// la unica frontera: traduce el JSON de AOS a esta forma, la UI nunca ve el CLI.
// Vocabulario (cerrado, del contrato AOS):
//   processState: running | stopped | starting | stale_pid | unknown
//   state:        running | stopped | unhealthy | starting | not_configured | unknown
//   health:       ok | failed | not_configured | unknown
export interface AosServiceRuntimeSummary {
  service: string
  port: number | null
  processState: string
  state: string
  health: string
  pid: number | null
  managed: 'aos' | 'external' | null
  localUrl: string | null
  publicUrl: string | null
}

// Endpoint publico reconciliado (contrato AOS v1.1): deseado (dev-endpoints.yaml)
// + observado (DNS/HTTPS/auth/backend). Sin credenciales en el contrato.
export interface AosEndpointSummary {
  domain: string | null
  service: string | null
  configured: boolean
  authRequired: boolean
  reachable: boolean
  https: boolean
  authProtected: boolean
  backendReachable: boolean | null
  status: string
}

/** Registro de conflicto AKG (anclora_knowledge/conflicts.py:ConflictRecord). */
export interface ConflictSummary extends SourceMetadata {
  id: string
  entityId: string
  field: string
  authoritativeValue: unknown
  authoritativeSource: string
  observedValue: unknown
  observedSource: string
  mode: string
  status: string
  detectedAt: string
  reviewRequired: boolean
}

// ================================================================ ENTITY NAVIGATION
// Contratos para drill-down/relaciones (COMMAND_CENTER_ENTITY_NAVIGATION_AND_SEARCH).
// Derivados de Knowledge en el momento de consulta — nunca duplican el
// snapshot como estado local independiente.

/** Referencia liviana a una entidad, resoluble o no (relationship target sin registro propio). */
export interface EntityRef {
  id: string
  type: string
  label: string
  source: SourceSystem
  /** false cuando el id solo existe como extremo de relacion, sin entidad propia en Knowledge. */
  found: boolean
}

export interface RelationshipView {
  id: string
  type: string
  direction: 'incoming' | 'outgoing'
  counterpart: EntityRef
}

export interface EntityDetail {
  id: string
  type: string
  label: string
  source: SourceSystem
  found: boolean
  /** Campos status.* del snapshot (p.ej. product_status), ya como texto. */
  status: Record<string, string>
  /** Campos fields.* del snapshot, filtrados a valores simples mostrables. */
  properties: Record<string, string | number | boolean | null>
  relationships: RelationshipView[]
}

export interface SearchResult {
  id: string
  entityType: string
  label: string
  secondary: string | null
  source: SourceSystem
  score: number
}

export interface SystemHealth {
  ecosystemRepoCount: number
  productCount: number
  serviceCount: number
  akgEntityCount: number
  akgRelationshipCount: number
  akgConflictCount: number
  knowledgeBuildId: string | null
  knowledgeGeneratedAt: string | null
}
