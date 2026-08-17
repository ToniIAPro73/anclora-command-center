// Tipos del dominio "Attention Engine" — Seccion 20/24. Puros, sin React,
// sin fetch. Consumidos por operationalStatus.ts / issues.ts y renderizados
// por la UI via los contratos existentes (DataState<T>).

export type GlobalOperationalStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN'

export type IssueSeverity = 'critical' | 'warning' | 'info'

export type IssueCategory =
  | 'core-service-down'
  | 'service-unhealthy'
  | 'endpoint-unreachable'
  | 'aos-unavailable'
  | 'knowledge-unavailable'
  | 'knowledge-conflicts'
  | 'knowledge-stale'

export interface OperationalIssue {
  id: string
  severity: IssueSeverity
  category: IssueCategory
  title: string
  summary: string
  source: 'aos' | 'knowledge'
  entityId: string | null
  evidence: string[]
  suggestedAction?: string
}
