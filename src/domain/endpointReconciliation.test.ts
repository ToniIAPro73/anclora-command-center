import { describe, expect, it } from 'vitest'
import {
  buildDataQualityReport,
  classifyEndpointStatus,
  detectDuplicateKnowledgeDomains,
  knowledgeOnlyEndpoints,
  normalizeDomain,
  reconcileEndpoints,
} from './endpointReconciliation'
import type { AosEndpointSummary } from '../contracts/types'
import type { KnowledgeEndpointCandidate } from './endpointReconciliation'

function aosEp(overrides: Partial<AosEndpointSummary>): AosEndpointSummary {
  return {
    domain: 'fiscal.dev.anclora.com',
    service: 'fiscal-web',
    configured: true,
    authRequired: true,
    reachable: true,
    https: true,
    authProtected: true,
    backendReachable: true,
    status: 'auth_protected',
    ...overrides,
  }
}

function kEp(overrides: Partial<KnowledgeEndpointCandidate>): KnowledgeEndpointCandidate {
  return { id: 'endpoint:fiscal.dev.anclora.com', host: 'fiscal.dev.anclora.com', appKey: 'fiscal-web', ...overrides }
}

describe('normalizeDomain', () => {
  it('lowercases, trims, strips scheme and trailing slash', () => {
    expect(normalizeDomain('  Fiscal.Dev.Anclora.COM  ')).toBe('fiscal.dev.anclora.com')
    expect(normalizeDomain('https://fiscal.dev.anclora.com/')).toBe('fiscal.dev.anclora.com')
    expect(normalizeDomain('http://fiscal.dev.anclora.com')).toBe('fiscal.dev.anclora.com')
  })
  it('null/empty -> null', () => {
    expect(normalizeDomain(null)).toBeNull()
    expect(normalizeDomain('')).toBeNull()
    expect(normalizeDomain('   ')).toBeNull()
  })
  it('never collapses distinct subdomains (no fuzzy equivalence)', () => {
    expect(normalizeDomain('www.fiscal.dev.anclora.com')).not.toBe(normalizeDomain('fiscal.dev.anclora.com'))
  })
})

describe('reconcileEndpoints', () => {
  it('exact domain match, case/scheme normalized', () => {
    const [m] = reconcileEndpoints([aosEp({ domain: 'https://fiscal.dev.anclora.com/' })], [kEp({})])
    expect(m.result).toBe('MATCHED')
    expect(m.method).toBe('exact-domain')
    expect(m.knowledgeId).toBe('endpoint:fiscal.dev.anclora.com')
    expect(m.id).toBe('endpoint:fiscal.dev.anclora.com')
    expect(m.evidence).toContain('fiscal.dev.anclora.com')
  })

  it('unique service match when no domain (AOS domain null, service present)', () => {
    const [m] = reconcileEndpoints(
      [aosEp({ domain: null, service: 'fiscal-web' })],
      [kEp({ host: null, appKey: 'fiscal-web' })],
    )
    expect(m.result).toBe('MATCHED')
    expect(m.method).toBe('unique-service')
    expect(m.evidence).toContain('fiscal-web')
  })

  it('no match at all -> UNMATCHED, stable synthetic operational id', () => {
    const [m] = reconcileEndpoints([aosEp({ domain: 'command-center.dev.anclora.com', service: 'command-center' })], [])
    expect(m.result).toBe('UNMATCHED')
    expect(m.knowledgeId).toBeNull()
    expect(m.id).toBe('aos-endpoint:command-center.dev.anclora.com')
  })

  it('no domain and no service (not_configured/local-only) -> NOT_APPLICABLE, never UNMATCHED', () => {
    const [m] = reconcileEndpoints([aosEp({ domain: null, service: null, configured: false, status: 'not_configured' })], [])
    expect(m.result).toBe('NOT_APPLICABLE')
  })

  it('ambiguous domain: two Knowledge endpoints share the same normalized domain -> AMBIGUOUS, never auto-picks one', () => {
    const [m] = reconcileEndpoints(
      [aosEp({})],
      [kEp({ id: 'endpoint:a' }), kEp({ id: 'endpoint:b' })],
    )
    expect(m.result).toBe('AMBIGUOUS')
    expect(m.knowledgeId).toBeNull()
    expect(m.candidateIds.sort()).toEqual(['endpoint:a', 'endpoint:b'])
  })

  it('ambiguous service: two Knowledge endpoints share the same service, no domain to disambiguate', () => {
    const [m] = reconcileEndpoints(
      [aosEp({ domain: null, service: 'shared-svc' })],
      [kEp({ id: 'endpoint:a', host: null, appKey: 'shared-svc' }), kEp({ id: 'endpoint:b', host: null, appKey: 'shared-svc' })],
    )
    expect(m.result).toBe('AMBIGUOUS')
    expect(m.method).toBe('unique-service')
  })

  it('domain match takes precedence over service match when both would resolve differently', () => {
    // AOS domain matches endpoint:a exactly; service would point at endpoint:b — domain wins, stops at first unambiguous match.
    const [m] = reconcileEndpoints(
      [aosEp({ domain: 'fiscal.dev.anclora.com', service: 'other-svc' })],
      [kEp({ id: 'endpoint:a', host: 'fiscal.dev.anclora.com', appKey: null }), kEp({ id: 'endpoint:b', host: null, appKey: 'other-svc' })],
    )
    expect(m.knowledgeId).toBe('endpoint:a')
    expect(m.method).toBe('exact-domain')
  })

  it('NO FUZZY GUESSING: api.dev.anclora.com never matches fiscal.dev.anclora.com just because service/product names overlap', () => {
    const [m] = reconcileEndpoints(
      [aosEp({ domain: 'api.dev.anclora.com', service: 'fiscal-api' })],
      [kEp({ host: 'fiscal.dev.anclora.com', appKey: 'fiscal-web' })],
    )
    expect(m.result).toBe('UNMATCHED')
    expect(m.knowledgeId).toBeNull()
  })

  it('multiple AOS endpoints reconciled independently in one pass', () => {
    const matches = reconcileEndpoints(
      [aosEp({ domain: 'fiscal.dev.anclora.com', service: 'fiscal-web' }), aosEp({ domain: 'talent.dev.anclora.com', service: 'talent' })],
      [kEp({ id: 'endpoint:fiscal.dev.anclora.com', host: 'fiscal.dev.anclora.com', appKey: 'fiscal-web' }), kEp({ id: 'endpoint:talent.dev.anclora.com', host: 'talent.dev.anclora.com', appKey: 'talent' })],
    )
    expect(matches).toHaveLength(2)
    expect(matches.every((m) => m.result === 'MATCHED')).toBe(true)
  })
})

describe('detectDuplicateKnowledgeDomains', () => {
  it('flags Knowledge entities sharing a normalized domain, ignores singles', () => {
    const dup = detectDuplicateKnowledgeDomains([
      kEp({ id: 'endpoint:a', host: 'FISCAL.dev.anclora.com' }),
      kEp({ id: 'endpoint:b', host: 'fiscal.dev.anclora.com/' }),
      kEp({ id: 'endpoint:c', host: 'talent.dev.anclora.com' }),
    ])
    expect(dup).toEqual([{ domain: 'fiscal.dev.anclora.com', ids: ['endpoint:a', 'endpoint:b'] }])
  })
})

describe('knowledgeOnlyEndpoints', () => {
  it('Knowledge endpoint with no AOS runtime counterpart at all', () => {
    const matches = reconcileEndpoints([aosEp({ domain: 'talent.dev.anclora.com', service: 'talent' })], [
      kEp({ id: 'endpoint:talent.dev.anclora.com', host: 'talent.dev.anclora.com', appKey: 'talent' }),
      kEp({ id: 'endpoint:orphan.dev.anclora.com', host: 'orphan.dev.anclora.com', appKey: 'orphan' }),
    ])
    const orphans = knowledgeOnlyEndpoints(matches, [
      kEp({ id: 'endpoint:talent.dev.anclora.com', host: 'talent.dev.anclora.com', appKey: 'talent' }),
      kEp({ id: 'endpoint:orphan.dev.anclora.com', host: 'orphan.dev.anclora.com', appKey: 'orphan' }),
    ])
    expect(orphans.map((o) => o.id)).toEqual(['endpoint:orphan.dev.anclora.com'])
  })
})

describe('classifyEndpointStatus', () => {
  it('auth_protected -> protected', () => {
    expect(classifyEndpointStatus(aosEp({ status: 'auth_protected' }))).toBe('protected')
  })
  it('not_configured (or configured=false) -> local-only, regardless of other fields', () => {
    expect(classifyEndpointStatus(aosEp({ status: 'not_configured', configured: false }))).toBe('local-only')
  })
  it('exposed + authRequired=false + backendReachable=true -> app-authenticated (code-server case), by field combination not by name', () => {
    expect(classifyEndpointStatus(aosEp({ status: 'exposed', authRequired: false, authProtected: false, backendReachable: true, service: 'anything' }))).toBe(
      'app-authenticated',
    )
  })
  it('exposed without that exact combination -> exposed', () => {
    expect(classifyEndpointStatus(aosEp({ status: 'exposed', authRequired: true, backendReachable: true }))).toBe('exposed')
  })
  it('unreachable -> unreachable', () => {
    expect(classifyEndpointStatus(aosEp({ status: 'unreachable' }))).toBe('unreachable')
  })
})

describe('buildDataQualityReport', () => {
  it('measures matched/unmatched/ambiguous/notApplicable/knowledgeOnly/duplicateDomains without forcing zero mismatches', () => {
    const aos = [
      aosEp({ domain: 'fiscal.dev.anclora.com', service: 'fiscal-web' }), // matched
      aosEp({ domain: 'command-center.dev.anclora.com', service: 'command-center' }), // unmatched
      aosEp({ domain: null, service: null, configured: false, status: 'not_configured' }), // not applicable
    ]
    const knowledge = [
      kEp({ id: 'endpoint:fiscal.dev.anclora.com', host: 'fiscal.dev.anclora.com', appKey: 'fiscal-web' }),
      kEp({ id: 'endpoint:orphan.dev.anclora.com', host: 'orphan.dev.anclora.com', appKey: 'orphan' }), // knowledge-only
    ]
    const matches = reconcileEndpoints(aos, knowledge)
    const report = buildDataQualityReport(matches, knowledge)
    expect(report).toEqual({
      totalAosEndpoints: 3,
      matched: 1,
      unmatched: 1,
      ambiguous: 0,
      notApplicable: 1,
      knowledgeOnly: 1,
      duplicateDomains: [],
    })
  })
})
