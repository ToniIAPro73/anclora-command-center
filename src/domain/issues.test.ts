import { describe, expect, it } from 'vitest'
import { deriveIssues } from './issues'
import { computeGlobalStatus } from './operationalStatus'
import type {
  AosEndpointSummary,
  AosServiceRuntimeSummary,
  ConflictSummary,
  DataState,
  RepositoryRuntimeState,
  SystemHealth,
} from '../contracts/types'

function repo(overrides: Partial<RepositoryRuntimeState>): RepositoryRuntimeState {
  return {
    repositoryId: 'anclora-fiscal',
    knowledgeId: 'repo:ToniIAPro73/anclora-fiscal',
    available: true,
    observedAt: new Date().toISOString(),
    errors: [],
    branch: 'main',
    detached: false,
    head: 'a'.repeat(40),
    shortHead: 'aaaaaaa',
    clean: true,
    modifiedCount: 0,
    addedCount: 0,
    deletedCount: 0,
    renamedCount: 0,
    untrackedCount: 0,
    upstream: 'origin/main',
    ahead: 0,
    behind: 0,
    divergence: 'SYNCED',
    lastCommit: null,
    cbm: { available: false },
    ...overrides,
  }
}

function svc(overrides: Partial<AosServiceRuntimeSummary>): AosServiceRuntimeSummary {
  return {
    service: 'some-service',
    port: 3000,
    processState: 'running',
    state: 'running',
    health: 'ok',
    pid: 1,
    managed: 'aos',
    localUrl: 'http://127.0.0.1:3000',
    publicUrl: null,
    ...overrides,
  }
}

const READY_HEALTH: DataState<SystemHealth> = {
  status: 'READY',
  data: {
    ecosystemRepoCount: 1,
    productCount: 1,
    serviceCount: 1,
    akgEntityCount: 1,
    akgRelationshipCount: 1,
    akgConflictCount: 0,
    knowledgeBuildId: 'b1',
    knowledgeGeneratedAt: new Date().toISOString(),
  },
}

const EMPTY_ENDPOINTS: DataState<AosEndpointSummary[]> = { status: 'EMPTY' }
const EMPTY_CONFLICTS: DataState<ConflictSummary[]> = { status: 'EMPTY' }

describe('deriveIssues', () => {
  it('healthy: no issues when command-center running and everything ready', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues).toHaveLength(0)
    expect(computeGlobalStatus({ aos: { status: 'READY', data: [] }, knowledgeHealth: READY_HEALTH, issues })).toBe(
      'HEALTHY',
    )
  })

  it('core stopped: command-center missing/stopped -> critical', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center', state: 'stopped', processState: 'stopped' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'core-service-down')?.severity).toBe('critical')
  })

  it('on-demand stopped non-core service is NOT an issue (false positive guard)', () => {
    const issues = deriveIssues({
      aos: {
        status: 'READY',
        data: [svc({ service: 'command-center' }), svc({ service: 'ninerouter', state: 'stopped', processState: 'stopped' })],
      },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues).toHaveLength(0)
  })

  it('external-managed service state is NOT actionable (false positive guard)', () => {
    const issues = deriveIssues({
      aos: {
        status: 'READY',
        data: [svc({ service: 'command-center' }), svc({ service: 'code-server', managed: 'external', state: 'unhealthy' })],
      },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues).toHaveLength(0)
  })

  it('unhealthy service (non-core, managed=aos) -> warning', () => {
    const issues = deriveIssues({
      aos: {
        status: 'READY',
        data: [svc({ service: 'command-center' }), svc({ service: 'fiscal-api', state: 'unhealthy', health: 'failed' })],
      },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'service-unhealthy')?.severity).toBe('warning')
  })

  it('endpoint auth_protected (401) alone is NOT an issue (false positive guard)', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: {
        status: 'READY',
        data: [
          {
            domain: 'fiscal.dev.anclora.com',
            service: 'fiscal-api',
            configured: true,
            authRequired: true,
            reachable: true,
            https: true,
            authProtected: true,
            backendReachable: true,
            status: 'auth_protected',
          },
        ],
      },
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues).toHaveLength(0)
  })

  it('endpoint configured with backend unreachable -> warning', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: {
        status: 'READY',
        data: [
          {
            domain: 'fiscal.dev.anclora.com',
            service: 'fiscal-api',
            configured: true,
            authRequired: true,
            reachable: false,
            https: true,
            authProtected: true,
            backendReachable: false,
            status: 'unreachable',
          },
        ],
      },
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'endpoint-unreachable')?.severity).toBe('warning')
  })

  // COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION: fix real de falso positivo —
  // verificado en vivo que 10/13 endpoints reales disparaban esto antes.
  it('endpoint backend unreachable because the underlying service is intentionally STOPPED (on-demand) -> NOT an issue', () => {
    const issues = deriveIssues({
      aos: {
        status: 'READY',
        data: [svc({ service: 'command-center' }), svc({ service: 'fiscal-web', state: 'stopped', processState: 'stopped' })],
      },
      aosEndpoints: {
        status: 'READY',
        data: [
          {
            domain: 'fiscal.dev.anclora.com',
            service: 'fiscal-web',
            configured: true,
            authRequired: true,
            reachable: true,
            https: true,
            authProtected: true,
            backendReachable: false,
            status: 'auth_protected',
          },
        ],
      },
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'endpoint-unreachable')).toBeUndefined()
  })

  it('endpoint ambiguous match -> warning issue with candidate evidence, no auto-pick', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      endpointMatches: [
        {
          id: 'aos-endpoint:fiscal.dev.anclora.com',
          aos: {
            domain: 'fiscal.dev.anclora.com',
            service: 'fiscal-web',
            configured: true,
            authRequired: true,
            reachable: true,
            https: true,
            authProtected: true,
            backendReachable: true,
            status: 'auth_protected',
          },
          knowledgeId: null,
          candidateIds: ['endpoint:a', 'endpoint:b'],
          result: 'AMBIGUOUS',
          method: 'exact-domain',
          evidence: '2 Knowledge endpoints share domain fiscal.dev.anclora.com',
        },
      ],
    })
    const issue = issues.find((i) => i.category === 'endpoint-ambiguous-match')
    expect(issue?.severity).toBe('warning')
    expect(issue?.evidence.join(' ')).toContain('endpoint:a')
  })

  it('UNMATCHED and NOT_APPLICABLE endpoint matches NEVER generate an issue (no alert fatigue)', () => {
    const base = {
      domain: null,
      service: null,
      configured: false,
      authRequired: false,
      reachable: false,
      https: false,
      authProtected: false,
      backendReachable: null as boolean | null,
      status: 'not_configured',
    }
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      endpointMatches: [
        { id: 'aos-endpoint:unmatched-1', aos: { ...base, domain: 'x.dev.anclora.com', service: 'x', configured: true, status: 'exposed' }, knowledgeId: null, candidateIds: [], result: 'UNMATCHED', method: 'none', evidence: 'no match' },
        { id: 'aos-endpoint:not-applicable-1', aos: base, knowledgeId: null, candidateIds: [], result: 'NOT_APPLICABLE', method: 'none', evidence: 'local-only' },
      ],
    })
    expect(issues.filter((i) => i.category === 'endpoint-ambiguous-match')).toHaveLength(0)
  })

  it('duplicate domain in Knowledge -> warning issue, never silently picks one', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      knowledgeEndpoints: [
        { id: 'endpoint:a', host: 'fiscal.dev.anclora.com', appKey: 'fiscal-web' },
        { id: 'endpoint:b', host: 'fiscal.dev.anclora.com', appKey: null },
      ],
    })
    const issue = issues.find((i) => i.category === 'endpoint-duplicate-domain')
    expect(issue?.severity).toBe('warning')
    expect(issue?.evidence.join(' ')).toContain('endpoint:a')
    expect(issue?.evidence.join(' ')).toContain('endpoint:b')
  })

  it('no duplicate domains in Knowledge -> no issue', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      knowledgeEndpoints: [
        { id: 'endpoint:a', host: 'fiscal.dev.anclora.com', appKey: 'fiscal-web' },
        { id: 'endpoint:b', host: 'talent.dev.anclora.com', appKey: 'talent' },
      ],
    })
    expect(issues.filter((i) => i.category === 'endpoint-duplicate-domain')).toHaveLength(0)
  })

  it('local-only unconfigured endpoint is NOT an issue (false positive guard)', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: {
        status: 'READY',
        data: [
          {
            domain: null,
            service: 'internal-tool',
            configured: false,
            authRequired: false,
            reachable: false,
            https: false,
            authProtected: false,
            backendReachable: null,
            status: 'not_configured',
          },
        ],
      },
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues).toHaveLength(0)
  })

  it('AOS unavailable -> critical', () => {
    const issues = deriveIssues({
      aos: { status: 'UNAVAILABLE', reason: 'aos CLI missing' },
      aosEndpoints: { status: 'UNAVAILABLE', reason: 'aos CLI missing' },
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'aos-unavailable')?.severity).toBe('critical')
    expect(
      computeGlobalStatus({ aos: { status: 'UNAVAILABLE', reason: 'x' }, knowledgeHealth: READY_HEALTH, issues }),
    ).toBe('CRITICAL')
  })

  it('Knowledge unavailable -> critical', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: { status: 'UNAVAILABLE', reason: 'no model' },
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'knowledge-unavailable')?.severity).toBe('critical')
  })

  it('Knowledge stale -> warning', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: { status: 'STALE', data: READY_HEALTH.status === 'READY' ? READY_HEALTH.data : ({} as SystemHealth), asOf: '2020-01-01T00:00:00Z' },
      conflicts: EMPTY_CONFLICTS,
    })
    expect(issues.find((i) => i.category === 'knowledge-stale')?.severity).toBe('warning')
  })

  it('Knowledge conflicts > 0 -> warning (or critical if review_required)', () => {
    const conflict: ConflictSummary = {
      id: 'c1',
      entityId: 'service:x',
      field: 'port',
      authoritativeValue: 3000,
      authoritativeSource: 'aos',
      observedValue: 3001,
      observedSource: 'github',
      mode: 'FLAG_CONFLICT',
      status: 'FLAGGED',
      detectedAt: new Date().toISOString(),
      reviewRequired: false,
      source: 'akg',
      sourceId: 'c1',
    }
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: { status: 'READY', data: [conflict] },
    })
    expect(issues.find((i) => i.category === 'knowledge-conflicts')?.severity).toBe('warning')

    const criticalIssues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: { status: 'READY', data: [{ ...conflict, reviewRequired: true }] },
    })
    expect(criticalIssues.find((i) => i.category === 'knowledge-conflicts')?.severity).toBe('critical')
  })

  // COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY: solo DIVERGED y
  // UNAVAILABLE son accionables. dirty/ahead/behind/detached NUNCA generan
  // issue (Seccion 18: "no alert fatigue").
  it('diverged repository -> warning issue with evidence', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      repositoriesRuntime: { status: 'READY', data: [repo({ divergence: 'DIVERGED', ahead: 2, behind: 3 })] },
    })
    const issue = issues.find((i) => i.category === 'repository-diverged')
    expect(issue?.severity).toBe('warning')
    expect(issue?.evidence).toContain('ahead=2')
    expect(issue?.evidence).toContain('behind=3')
  })

  it('unavailable repository (git failed) -> warning issue', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      repositoriesRuntime: { status: 'READY', data: [repo({ available: false, errors: ['git status fallo: boom'], divergence: 'UNKNOWN' })] },
    })
    const issue = issues.find((i) => i.category === 'repository-unavailable')
    expect(issue?.severity).toBe('warning')
    expect(issue?.evidence).toContain('git status fallo: boom')
  })

  it('dirty/ahead/behind/detached/no-upstream repos NEVER generate an issue (no alert fatigue)', () => {
    const issues = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      repositoriesRuntime: {
        status: 'READY',
        data: [
          repo({ repositoryId: 'r-dirty', clean: false, modifiedCount: 3 }),
          repo({ repositoryId: 'r-ahead', divergence: 'AHEAD', ahead: 4 }),
          repo({ repositoryId: 'r-behind', divergence: 'BEHIND', behind: 2 }),
          repo({ repositoryId: 'r-detached', detached: true, branch: null }),
          repo({ repositoryId: 'r-no-upstream', divergence: 'NO_UPSTREAM', upstream: null, ahead: null, behind: null }),
        ],
      },
    })
    expect(issues.filter((i) => i.category === 'repository-diverged' || i.category === 'repository-unavailable')).toHaveLength(0)
  })

  it('clean synced repository -> no issue, and repositoriesRuntime is optional (backward compatible)', () => {
    const withoutRepos = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
    })
    expect(withoutRepos).toHaveLength(0)

    const withClean = deriveIssues({
      aos: { status: 'READY', data: [svc({ service: 'command-center' })] },
      aosEndpoints: EMPTY_ENDPOINTS,
      knowledgeHealth: READY_HEALTH,
      conflicts: EMPTY_CONFLICTS,
      repositoriesRuntime: { status: 'READY', data: [repo({})] },
    })
    expect(withClean).toHaveLength(0)
  })
})

describe('computeGlobalStatus', () => {
  it('UNKNOWN when both AOS and Knowledge are loading/unresolved with no issues', () => {
    const status = computeGlobalStatus({
      aos: { status: 'LOADING' },
      knowledgeHealth: { status: 'LOADING' },
      issues: [],
    })
    expect(status).toBe('UNKNOWN')
  })
})
