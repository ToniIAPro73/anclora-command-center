import { describe, expect, it } from 'vitest'
import {
  getEndpoints,
  getProducts,
  getRelationshipsFor,
  getRepositories,
  getServices,
  getSystemHealth,
} from './knowledgeAdapter'

// Tests de integracion contra el snapshot real generado por `npm run sync:knowledge`
// (ver scripts/sync-knowledge-data.mjs). No mockean el JSON: verifican invariantes
// estructurales estables del contrato UI, no valores puntuales del dataset.

describe('knowledgeAdapter', () => {
  it('getRepositories returns READY with normalized RepositorySummary contract', () => {
    const state = getRepositories()
    expect(state.status).toBe('READY')
    if (state.status !== 'READY') return
    expect(state.data.length).toBeGreaterThan(0)
    const commandCenter = state.data.find((r) => r.id === 'repo:ToniIAPro73/anclora-command-center')
    expect(commandCenter).toBeDefined()
    expect(commandCenter?.portfolioStatus).toBe('HOLD')
    expect(commandCenter?.sourceOfTruthLocal).toBe(false)
    for (const repo of state.data) {
      expect(repo.source).toBe('knowledge')
      expect(repo.sourceId).toBe(repo.id)
    }
  })

  it('getProducts returns READY and includes command-center', () => {
    const state = getProducts()
    expect(state.status).toBe('READY')
    if (state.status !== 'READY') return
    const cc = state.data.find((p) => p.id === 'product:command-center')
    expect(cc).toBeDefined()
    expect(cc?.source).toBe('knowledge')
  })

  it('getServices normalizes AOS-managed services with source=aos', () => {
    const state = getServices()
    expect(state.status).toBe('READY')
    if (state.status !== 'READY') return
    for (const svc of state.data) {
      expect(svc.source).toBe('aos')
    }
    // Command Center no debe tener ningun Service mientras no este en manifest.yaml.
    const ccService = state.data.find((s) => s.repoId === 'repo:ToniIAPro73/anclora-command-center')
    expect(ccService).toBeUndefined()
  })

  it('getEndpoints normalizes endpoint entities with source=aos', () => {
    const state = getEndpoints()
    expect(state.status).toBe('READY')
    if (state.status !== 'READY') return
    for (const ep of state.data) {
      expect(ep.source).toBe('aos')
    }
  })

  it('getSystemHealth exposes counts consistent with the underlying snapshot', () => {
    const state = getSystemHealth()
    expect(state.status === 'READY' || state.status === 'STALE').toBe(true)
    if (state.status !== 'READY' && state.status !== 'STALE') return
    expect(state.data.akgConflictCount).toBe(0)
    expect(state.data.knowledgeBuildId).not.toBeNull()
    expect(state.data.ecosystemRepoCount).toBeGreaterThan(0)
  })

  it('getRelationshipsFor returns only relationships touching the given entity id', () => {
    const rels = getRelationshipsFor('product:command-center')
    for (const rel of rels) {
      expect(rel.from === 'product:command-center' || rel.to === 'product:command-center').toBe(true)
      expect(rel.source).toBe('akg')
    }
  })

  it('getRelationshipsFor returns an empty array for an unknown entity id (UNKNOWN is valid, not inferred)', () => {
    const rels = getRelationshipsFor('product:does-not-exist')
    expect(rels).toEqual([])
  })
})
