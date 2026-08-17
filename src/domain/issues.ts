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
  EndpointMatch,
  RepositoryRuntimeState,
  SystemHealth,
} from '../contracts/types'
import type { OperationalIssue } from './types'
import { detectDuplicateKnowledgeDomains, type KnowledgeEndpointCandidate } from './endpointReconciliation'

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
  repositoriesRuntime?: DataState<RepositoryRuntimeState[]>
  endpointMatches?: EndpointMatch[]
  knowledgeEndpoints?: KnowledgeEndpointCandidate[]
}): OperationalIssue[] {
  const issues: OperationalIssue[] = []
  const { aos, aosEndpoints, knowledgeHealth, conflicts, repositoriesRuntime, endpointMatches, knowledgeEndpoints } = sources

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
  // COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION (Seccion 25): un endpoint cuyo
  // backend esta "unreachable" porque el servicio subyacente esta STOPPED
  // a proposito (on-demand, mismo criterio que la guarda de servicios de
  // arriba) NO es un issue — es el mismo estado normal visto desde el
  // endpoint. Antes de este fix, cualquier app on-demand parada generaba
  // ruido aqui (verificado en vivo: 10/13 endpoints reales disparaban esto).
  const endpoints = dataOf(aosEndpoints)
  if (endpoints) {
    for (const ep of endpoints) {
      // Guarda: no alertar por 401/auth_protected en si mismo, ni por
      // endpoints no configurados intencionalmente (local-only).
      if (!ep.configured) continue
      if (ep.backendReachable === false) {
        const backingService = ep.service && services ? services.find((s) => s.service === ep.service) : undefined
        if (backingService && backingService.state === 'stopped') continue
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

  // -- Repository runtime (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY) --
  // Deliberadamente NO se genera issue por dirty/ahead/behind/detached — son
  // estados normales durante trabajo activo (Seccion 18: "no alert fatigue").
  // Solo DIVERGED (requiere reconciliacion manual real) y UNAVAILABLE (el
  // comando git realmente fallo, repo roto/inaccesible) son accionables.
  const repos = dataOf(repositoriesRuntime ?? { status: 'EMPTY' })
  if (repos) {
    for (const repo of repos) {
      if (!repo.available) {
        issues.push({
          id: `issue:repository-unavailable:${repo.repositoryId}`,
          severity: 'warning',
          category: 'repository-unavailable',
          title: `Repository unavailable: ${repo.repositoryId}`,
          summary: `Command Center could not read live Git state for ${repo.repositoryId}.`,
          source: 'knowledge',
          entityId: repo.knowledgeId,
          evidence: repo.errors.length > 0 ? repo.errors : ['git status failed'],
          suggestedAction: 'Check the repository on disk (missing, corrupted, or permission issue).',
        })
        continue
      }
      if (repo.divergence === 'DIVERGED') {
        issues.push({
          id: `issue:repository-diverged:${repo.repositoryId}`,
          severity: 'warning',
          category: 'repository-diverged',
          title: `Repository diverged: ${repo.repositoryId}`,
          summary: `${repo.repositoryId} has local and remote commits that disagree — manual reconciliation needed.`,
          source: 'knowledge',
          entityId: repo.knowledgeId,
          evidence: [`ahead=${repo.ahead ?? 0}`, `behind=${repo.behind ?? 0}`, `branch=${repo.branch ?? 'unknown'}`],
          suggestedAction: 'Review the divergence in the Repositories view before merging or rebasing.',
        })
      }
    }
  }

  // -- Endpoint reconciliation (COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION) --
  // Solo AMBIGUOUS (bloquea navegacion/integridad de datos) y dominios
  // duplicados en Knowledge (data-quality gap) son accionables. UNMATCHED
  // y NOT_APPLICABLE son estados normales (endpoint solo-AOS, local-only) —
  // nunca issues.
  if (endpointMatches) {
    for (const m of endpointMatches) {
      if (m.result !== 'AMBIGUOUS') continue
      issues.push({
        id: `issue:endpoint-ambiguous-match:${m.id}`,
        severity: 'warning',
        category: 'endpoint-ambiguous-match',
        title: `Ambiguous semantic match: ${m.aos.domain ?? m.aos.service ?? 'endpoint'}`,
        summary: 'Multiple Knowledge Endpoint entities match this AOS endpoint — no automatic choice was made.',
        source: 'aos',
        entityId: m.aos.service,
        evidence: [m.evidence, `candidates=${m.candidateIds.join(', ')}`],
        suggestedAction: 'Review the Knowledge Endpoint entities for a duplicate or missing distinguishing field.',
      })
    }
  }
  if (knowledgeEndpoints) {
    for (const dup of detectDuplicateKnowledgeDomains(knowledgeEndpoints)) {
      issues.push({
        id: `issue:endpoint-duplicate-domain:${dup.domain}`,
        severity: 'warning',
        category: 'endpoint-duplicate-domain',
        title: `Duplicate domain in Knowledge: ${dup.domain}`,
        summary: `${dup.ids.length} Knowledge Endpoint entities declare the same domain.`,
        source: 'knowledge',
        entityId: null,
        evidence: [`domain=${dup.domain}`, `entities=${dup.ids.join(', ')}`],
        suggestedAction: 'Deduplicate the Endpoint entities in Knowledge.',
      })
    }
  }

  return issues
}
