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
  /** Slug usado por el server-side repository registry (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY). null si Knowledge no lo expone. */
  censusId: string | null
}

// ================================================================ REPOSITORY RUNTIME
// Estado Git en vivo (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY).
// SOLO LECTURA — nunca expone un path de filesystem al navegador; repositoryId
// es el census_id validado server-side. Ver server/server.mjs.

export type RepositoryDivergence = 'SYNCED' | 'AHEAD' | 'BEHIND' | 'DIVERGED' | 'NO_UPSTREAM' | 'UNKNOWN'

export interface RepositoryLastCommit {
  hash: string
  shortHash: string
  subject: string
  authorName: string
  date: string | null
}

export interface RepositoryCbmState {
  available: boolean
  freshness?: string
  indexedHead?: string | null
  headCommit?: string | null
  workingTree?: string
}

export interface RepositoryRuntimeState {
  repositoryId: string
  knowledgeId: string
  available: boolean
  observedAt: string
  errors: string[]
  branch: string | null
  detached: boolean
  head: string | null
  shortHead: string | null
  clean: boolean | null
  modifiedCount: number
  addedCount: number
  deletedCount: number
  renamedCount: number
  untrackedCount: number
  upstream: string | null
  ahead: number | null
  behind: number | null
  divergence: RepositoryDivergence
  lastCommit: RepositoryLastCommit | null
  cbm: RepositoryCbmState
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
  /** fields.app_key del snapshot — usado por la reconciliacion AOS<->Knowledge (COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION). */
  appKey: string | null
}

// ================================================================ ENDPOINT RECONCILIATION
// AOS endpoint (runtime) <-> Knowledge Endpoint (semantico). Deterministico,
// nunca fuzzy. Ver src/domain/endpointReconciliation.ts.

export type EndpointMatchResult = 'MATCHED' | 'UNMATCHED' | 'AMBIGUOUS' | 'NOT_APPLICABLE'
export type EndpointMatchMethod = 'exact-domain' | 'unique-service' | 'none'
export type EndpointStatusClass =
  | 'protected'
  | 'app-authenticated'
  | 'local-only'
  | 'unreachable'
  | 'exposed'
  | 'configured'
  | 'unknown'

export interface EndpointMatch {
  /** Id de navegacion: el id Knowledge canonico si hay match unico, si no un id operacional sintetico "aos-endpoint:<domain-or-service>". */
  id: string
  aos: AosEndpointSummary
  knowledgeId: string | null
  /** Todos los candidatos Knowledge considerados (>1 solo si AMBIGUOUS). */
  candidateIds: string[]
  result: EndpointMatchResult
  method: EndpointMatchMethod
  evidence: string
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
