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

export interface AosServiceRuntimeSummary {
  service: string
  port: number | string | null
  processState: string
  health: string
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
