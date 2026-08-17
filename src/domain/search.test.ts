import { describe, expect, it } from 'vitest'
import { buildSearchIndex, rankSearch } from './search'
import type { EntityRef } from '../contracts/types'

const sources = {
  products: [{ id: 'product:fiscal', name: 'Anclora Fiscal', businessUnitLabel: 'Independent Product' }],
  repositories: [{ id: 'repo:anclora-fiscal', name: 'Anclora Fiscal', portfolioStatus: 'ACTIVE' }],
  services: [{ id: 'service:fiscal-api', name: 'fiscal-api', serviceStatus: 'RUNNING' }],
  knowledgeEntities: [
    { id: 'std:aos-adoption-standard', type: 'Standard', label: 'AOS Adoption Standard', source: 'knowledge', found: true },
    { id: 'repo:anclora-fiscal', type: 'Repository', label: 'Anclora Fiscal', source: 'knowledge', found: true }, // dup, must dedupe
    { id: 'contract:FOO', type: 'Contract', label: 'contract:FOO', source: 'knowledge', found: false }, // unresolved, must be excluded
  ] as EntityRef[],
}

describe('search (domain, pure)', () => {
  it('buildSearchIndex dedupes ids already covered by typed sources and drops unresolved refs', () => {
    const index = buildSearchIndex(sources)
    const ids = index.map((r) => r.id)
    expect(ids.filter((id) => id === 'repo:anclora-fiscal')).toHaveLength(1)
    expect(ids).not.toContain('contract:FOO')
    expect(ids).toContain('std:aos-adoption-standard')
  })

  it('rankSearch: empty query -> []', () => {
    const index = buildSearchIndex(sources)
    expect(rankSearch(index, '')).toEqual([])
    expect(rankSearch(index, '   ')).toEqual([])
  })

  it('rankSearch: exact match ranks above prefix/substring', () => {
    const index = buildSearchIndex(sources)
    const results = rankSearch(index, 'Anclora Fiscal')
    expect(results[0]?.label).toBe('Anclora Fiscal')
    expect(results[0]?.score).toBe(100)
  })

  it('rankSearch: prefix match', () => {
    const index = buildSearchIndex(sources)
    const results = rankSearch(index, 'Anclora Fis')
    expect(results.some((r) => r.label === 'Anclora Fiscal' && r.score === 80)).toBe(true)
  })

  it('rankSearch: substring match', () => {
    const index = buildSearchIndex(sources)
    const results = rankSearch(index, 'fiscal')
    // 'fiscal-api' service: substring (label starts differently) -> at least present
    expect(results.some((r) => r.id === 'service:fiscal-api')).toBe(true)
  })

  it('rankSearch: id match (query hits canonical id, not label)', () => {
    const index = buildSearchIndex(sources)
    const results = rankSearch(index, 'std:aos-adoption')
    expect(results.some((r) => r.id === 'std:aos-adoption-standard' && r.score === 40)).toBe(true)
  })

  it('rankSearch: secondary metadata match (business unit)', () => {
    const index = buildSearchIndex(sources)
    const results = rankSearch(index, 'Independent Product')
    expect(results.some((r) => r.id === 'product:fiscal' && r.score === 20)).toBe(true)
  })

  it('rankSearch: zero results for unmatched query', () => {
    const index = buildSearchIndex(sources)
    expect(rankSearch(index, 'zzzznomatch')).toEqual([])
  })

  it('rankSearch: multiple entity types can appear together, sorted by score', () => {
    const index = buildSearchIndex(sources)
    const results = rankSearch(index, 'Anclora Fiscal')
    const types = new Set(results.map((r) => r.entityType))
    expect(types.has('Product')).toBe(true)
    expect(types.has('Repository')).toBe(true)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('buildSearchIndex with empty knowledgeEntities still indexes typed sources (partial source failure tolerance)', () => {
    const index = buildSearchIndex({ ...sources, knowledgeEntities: [] })
    expect(rankSearch(index, 'fiscal-api').some((r) => r.id === 'service:fiscal-api')).toBe(true)
  })
})
