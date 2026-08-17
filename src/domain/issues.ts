// Attention Engine — Seccion 24. Funcion pura: dado el estado AOS/Knowledge
// ya normalizado por los adapters (DataState<T>), deriva la lista de
// OperationalIssue[] con evidencia. Sin fetch, sin React, sin side effects.
//
// Reglas deterministas y defendibles (Seccion 26/27):
//   - core service caido/unhealthy         -> critical
//   - AOS no disponible                    -> critical
//   - Knowledge no disponible              -> critical
//   - endpoint configurado con backend caido -> warning
//   - servicio managed=aos en estado unhealthy -> warning
//   - conflictos AKG > 0                   -> warning
//   - Knowledge material stale             -> warning
//
// Guardas anti falso-positivo (Seccion 27):
//   - servicio on-demand parado (state=stopped) NUNCA genera issue.
//   - servicio managed=external NUNCA genera issue accionable.
//   - endpoint auth_protected/401 (sin backend caido) NUNCA genera issue.

import type {
  AosEndpointSummary,
  AosServiceRuntimeSummary,
  ConflictSummary,
  DataState,
  SystemHealth,
} from '../contracts/types'
import type { OperationalIssue } from './types'

// Unico servicio confirmado CORE_REQUIRED (Seccion 23): Command Center es su
// propia consola operacional — si no esta arriba, la consola misma no puede
// fiarse. No se asume ningun otro servicio critico sin evidencia adicional.
export const CORE_REQUIRED_SERVICE_IDS = ['command-center']

function dataOf<T>(state: DataState<T>): T | null {
  return state.status === 'READY' || state.status === 'STALE' ? state.data : null
}

export function deriveIssues(sources: {
  aos: DataState<AosServiceRuntimeSummary[]>
  aosEndpoints: DataState<AosEndpointSummary[]>
  knowledgeHealth: DataState<SystemHealth>
  conflicts: DataState<ConflictSummary[]>
}): OperationalIssue[] {
  const issues: OperationalIssue[] = []
  const { aos, aosEndpoints, knowledgeHealth, conflicts } = sources

  // -- AOS availability --------------------------------------------------
  if (aos.status === 'ERROR' || aos.status === 'UNAVAILABLE') {
    issues.push({
      id: 'issue:aos-unavailable',
      severity: 'critical',
      category: 'aos-unavailable',
      title: 'AOS unavailable',
      summary: 'Command Center cannot reach the AOS runtime — service and endpoint truth is unknown.',
      source: 'aos',
      entityId: null,
      evidence: [aos.status === 'ERROR' ? `AOS status: ERROR — ${aos.message}` : `AOS status: UNAVAILABLE — ${aos.reason}`],
      suggestedAction: 'Check the AOS runtime process and `aos status --json` on the host.',
    })
  }

  const services = dataOf(aos)
  if (services) {
    for (const id of CORE_REQUIRED_SERVICE_IDS) {
      const svc = services.find((s) => s.service === id)
      if (!svc) {
        issues.push({
          id: `issue:core-service-down:${id}`,
          severity: 'critical',
          category: 'core-service-down',
          title: `Core service missing: ${id}`,
          summary: `${id} is CORE_REQUIRED but is absent from the live AOS status.`,
          source: 'aos',
          entityId: id,
          evidence: [`AOS status services[] has no entry for "${id}"`],
        })
        continue
      }
      if (svc.state !== 'running' || svc.health === 'failed') {
        issues.push({
          id: `issue:core-service-down:${id}`,
          severity: 'critical',
          category: 'core-service-down',
          title: `Core service not healthy: ${id}`,
          summary: `${id} is CORE_REQUIRED. Expected RUNNING/healthy, observed ${svc.state.toUpperCase()}.`,
          source: 'aos',
          entityId: id,
          evidence: [`state=${svc.state}`, `health=${svc.health}`, `pid=${svc.pid ?? 'null'}`],
          suggestedAction: `Start ${id} via AOS (\`aos up ${id}\`) or the Services view.`,
        })
      }
    }

    // Servicios managed=aos NO core reportando unhealthy (distinto de stopped
    // — stopped es un estado normal para on-demand, ver guarda anti falso-positivo).
    for (const svc of services) {
      if (svc.managed !== 'aos') continue
      if (CORE_REQUIRED_SERVICE_IDS.includes(svc.service)) continue
      if (svc.state === 'unhealthy') {
        issues.push({
          id: `issue:service-unhealthy:${svc.service}`,
          severity: 'warning',
          category: 'service-unhealthy',
          title: `Service unhealthy: ${svc.service}`,
          summary: `${svc.service} is running but reporting an unhealthy state.`,
          source: 'aos',
          entityId: svc.service,
          evidence: [`state=${svc.state}`, `health=${svc.health}`],
          suggestedAction: `Restart ${svc.service} via the Services view.`,
        })
      }
    }
  }

  // -- Endpoint reachability ----------------------------------------------
  const endpoints = dataOf(aosEndpoints)
  if (endpoints) {
    for (const ep of endpoints) {
      // Guarda: no alertar por 401/auth_protected en si mismo, ni por
      // endpoints no configurados intencionalmente (local-only).
      if (!ep.configured) continue
      if (ep.backendReachable === false) {
        issues.push({
          id: `issue:endpoint-unreachable:${ep.domain ?? ep.service ?? 'unknown'}`,
          severity: 'warning',
          category: 'endpoint-unreachable',
          title: `Endpoint backend unreachable: ${ep.domain ?? ep.service}`,
          summary: `Endpoint is configured but its backend service is not responding.`,
          source: 'aos',
          entityId: ep.service,
          evidence: [`domain=${ep.domain ?? 'null'}`, `status=${ep.status}`, `backendReachable=false`],
          suggestedAction: ep.service ? `Check the ${ep.service} service in the Services view.` : undefined,
        })
      }
    }
  }

  // -- Knowledge availability ----------------------------------------------
  if (knowledgeHealth.status === 'ERROR' || knowledgeHealth.status === 'UNAVAILABLE') {
    issues.push({
      id: 'issue:knowledge-unavailable',
      severity: 'critical',
      category: 'knowledge-unavailable',
      title: 'Knowledge unavailable',
      summary: 'Command Center cannot read the Knowledge/AKG model — ecosystem semantics are unknown.',
      source: 'knowledge',
      entityId: null,
      evidence: [
        knowledgeHealth.status === 'ERROR'
          ? `Knowledge status: ERROR — ${knowledgeHealth.message}`
          : `Knowledge status: UNAVAILABLE — ${knowledgeHealth.reason}`,
      ],
    })
  }
  if (knowledgeHealth.status === 'STALE') {
    issues.push({
      id: 'issue:knowledge-stale',
      severity: 'warning',
      category: 'knowledge-stale',
      title: 'Knowledge is stale',
      summary: `The Knowledge snapshot was generated on ${knowledgeHealth.asOf} and exceeds the freshness threshold.`,
      source: 'knowledge',
      entityId: null,
      evidence: [`generated_at=${knowledgeHealth.asOf}`],
      suggestedAction: 'Rebuild the Knowledge model in anclora-infrastructure.',
    })
  }

  // -- Knowledge conflicts ---------------------------------------------------
  const conflictList = dataOf(conflicts)
  if (conflictList && conflictList.length > 0) {
    issues.push({
      id: 'issue:knowledge-conflicts',
      severity: conflictList.some((c) => c.reviewRequired) ? 'critical' : 'warning',
      category: 'knowledge-conflicts',
      title: `${conflictList.length} Knowledge conflict${conflictList.length === 1 ? '' : 's'} detected`,
      summary: 'One or more entity fields disagree between authoritative and observed sources.',
      source: 'knowledge',
      entityId: null,
      evidence: conflictList
        .slice(0, 5)
        .map((c) => `${c.entityId}.${c.field}: authoritative(${c.authoritativeSource})=${JSON.stringify(c.authoritativeValue)} vs observed(${c.observedSource})=${JSON.stringify(c.observedValue)}`),
      suggestedAction: 'Review conflicts in the Knowledge view.',
    })
  }

  return issues
}
