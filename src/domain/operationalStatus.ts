// Global Operational Status — Seccion 20. Reglas deterministas, centralizadas
// aqui unicamente (no dispersar en componentes). Funcion pura.

import type { AosServiceRuntimeSummary, DataState, SystemHealth } from '../contracts/types'
import type { GlobalOperationalStatus, OperationalIssue } from './types'

export function computeGlobalStatus(sources: {
  aos: DataState<AosServiceRuntimeSummary[]>
  knowledgeHealth: DataState<SystemHealth>
  issues: OperationalIssue[]
}): GlobalOperationalStatus {
  const { aos, knowledgeHealth, issues } = sources

  if (issues.some((i) => i.severity === 'critical')) return 'CRITICAL'

  const aosKnown = aos.status === 'READY' || aos.status === 'STALE' || aos.status === 'EMPTY'
  const knowledgeKnown =
    knowledgeHealth.status === 'READY' || knowledgeHealth.status === 'STALE' || knowledgeHealth.status === 'EMPTY'
  if (!aosKnown && !knowledgeKnown) return 'UNKNOWN'

  if (issues.some((i) => i.severity === 'warning')) return 'DEGRADED'

  return 'HEALTHY'
}
