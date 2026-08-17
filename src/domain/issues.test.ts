import { describe, expect, it } from 'vitest'
import { deriveIssues } from './issues'
import { computeGlobalStatus } from './operationalStatus'
import type { AosEndpointSummary, AosServiceRuntimeSummary, ConflictSummary, DataState, SystemHealth } from '../contracts/types'

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
