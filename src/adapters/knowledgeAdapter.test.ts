import { describe, expect, it } from 'vitest'
import {
  mapKnowledgeSnapshot,
} from './knowledgeAdapter'
import type {
  DataState,
  RepositorySummary,
  ProductSummary,
  ServiceSummary,
  SystemHealth,
} from '../contracts/types'

// Tests del MAPPER PURO (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT):
// dado el payload del endpoint local /api/knowledge (o equivalente), devuelve
// los contratos UI. Sin fetch, sin dependencia de snapshots estaticos.
// Fixtures minimos tipados; se verifica la FORMA del contrato (DataState +
// normalizacion), no valores puntuales del dataset.

function rawSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: '1.0',
    metadata: {
      generated_at: new Date().toISOString(),
      rebuild_id: 'test-build-001',
      counts: { entities: 184, relationships: 586, conflicts: 0 },
    },
    entities: {
      repositories: [
        {
          id: 'repo:ToniIAPro73/anclora-command-center',
          type: 'repository',
          name: 'anclora-command-center',
          status: { repository_status: 'ACTIVE', portfolio_status: 'HOLD' },
          fields: { github_owner: 'ToniIAPro73', github_visibility: 'private', source_of_truth_local: false },
        },
      ],
      products: [
        { id: 'product:command-center', type: 'product', name: 'Command Center', status: { product_status: 'ACTIVE' }, fields: {} },
      ],
      services: [
        { id: 'service:filestudio', type: 'service', name: 'filestudio', status: { service_status: 'running' }, fields: { port: 3000 } },
      ],
      endpoints: [
        { id: 'endpoint:filestudio', type: 'endpoint', name: 'filestudio', status: { endpoint_status: 'ok' }, fields: { host: '127.0.0.1', port: 3000 } },
      ],
      standards: [],
      technologies: [],
      'business-units': [],
    },
    relationships: [
      { id: 'rel-1', type: 'DEPENDS_ON', from: 'service:filestudio', to: 'product:command-center', confidence: 'confirmed' },
    ],
    conflicts: [],
    ...overrides,
  }
}

describe('knowledgeAdapter (mapper puro)', () => {
  it('null payload → UNAVAILABLE (no se presenta como ecosistema vacio)', () => {
    const m = mapKnowledgeSnapshot(null)
    expect(m.repositories.status).toBe('UNAVAILABLE')
    expect(m.products.status).toBe('UNAVAILABLE')
    expect(m.services.status).toBe('UNAVAILABLE')
    expect(m.endpoints.status).toBe('UNAVAILABLE')
    expect(m.health.status).toBe('UNAVAILABLE')
  })

  it('undefined payload → UNAVAILABLE', () => {
    const m = mapKnowledgeSnapshot(undefined)
    expect(m.repositories.status).toBe('UNAVAILABLE')
  })

  it('snapshot valido → READY con contratos normalizados', () => {
    const m = mapKnowledgeSnapshot(rawSnapshot())

    expect(m.repositories.status).toBe('READY')
    if (m.repositories.status === 'READY') {
      const cc = m.repositories.data.find((r) => r.id === 'repo:ToniIAPro73/anclora-command-center')
      expect(cc).toBeDefined()
      expect(cc?.portfolioStatus).toBe('HOLD')
      expect(cc?.sourceOfTruthLocal).toBe(false)
      for (const repo of m.repositories.data) {
        expect(repo.source).toBe('knowledge')
        expect(repo.sourceId).toBe(repo.id)
      }
    }

    expect(m.products.status).toBe('READY')
    if (m.products.status === 'READY') {
      expect(m.products.data[0]?.source).toBe('knowledge')
    }

    expect(m.services.status).toBe('READY')
    if (m.services.status === 'READY') {
      for (const svc of m.services.data) expect(svc.source).toBe('aos')
    }

    expect(m.endpoints.status).toBe('READY')
    if (m.endpoints.status === 'READY') {
      for (const ep of m.endpoints.data) expect(ep.source).toBe('aos')
    }

    expect(m.health.status === 'READY' || m.health.status === 'STALE').toBe(true)
    if (m.health.status === 'READY' || m.health.status === 'STALE') {
      expect(m.health.data.akgConflictCount).toBe(0)
      expect(m.health.data.knowledgeBuildId).toBe('test-build-001')
      expect(m.health.data.ecosystemRepoCount).toBeGreaterThan(0)
    }
  })

  it('entidades vacias REALES (arrays []) → EMPTY, no UNAVAILABLE (distinguir zero data)', () => {
    const m = mapKnowledgeSnapshot(rawSnapshot({ entities: {
      repositories: [], products: [], services: [], endpoints: [], standards: [], technologies: [], 'business-units': [],
    } }))
    expect(m.repositories.status).toBe('EMPTY')
    expect(m.products.status).toBe('EMPTY')
    expect(m.services.status).toBe('EMPTY')
  })

  it('metadata ausente → health UNAVAILABLE (no inventar counts)', () => {
    const m = mapKnowledgeSnapshot(rawSnapshot({ metadata: undefined }))
    expect(m.health.status).toBe('UNAVAILABLE')
  })

  it('metadata antigua (STALE) → health STALE con data', () => {
    const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
    const m = mapKnowledgeSnapshot(rawSnapshot({ metadata: { generated_at: oldDate, rebuild_id: 'old', counts: { entities: 5, relationships: 5, conflicts: 0 } } }))
    expect(m.health.status).toBe('STALE')
    if (m.health.status === 'STALE') {
      expect(m.health.data.akgEntityCount).toBe(5)
      expect(m.health.asOf).toBe(oldDate)
    }
  })

  it('relationshipsFor devuelve solo las que tocan el id dado', () => {
    const m = mapKnowledgeSnapshot(rawSnapshot())
    const rels = m.relationshipsFor('service:filestudio')
    expect(rels.length).toBeGreaterThan(0)
    for (const rel of rels) {
      expect(rel.from === 'service:filestudio' || rel.to === 'service:filestudio').toBe(true)
      expect(rel.source).toBe('akg')
    }
    expect(m.relationshipsFor('product:does-not-exist')).toEqual([])
  })
})

// Smoke de los proxies sync (getters alimentados por setKnowledgeSnapshot)
describe('knowledgeAdapter (proxies sync)', () => {
  it('getRepositories con snapshot seteado devuelve READY', async () => {
    const { setKnowledgeSnapshot, getRepositories } = await import('./knowledgeAdapter')
    setKnowledgeSnapshot(rawSnapshot() as never)
    const state = getRepositories() as DataState<RepositorySummary[]>
    expect(state.status).toBe('READY')
    setKnowledgeSnapshot(null)
  })

  it('getSystemHealth tras snapshot seteado expone counts', async () => {
    const { setKnowledgeSnapshot, getSystemHealth } = await import('./knowledgeAdapter')
    setKnowledgeSnapshot(rawSnapshot() as never)
    const state = getSystemHealth() as DataState<SystemHealth>
    expect(state.status === 'READY' || state.status === 'STALE').toBe(true)
    if (state.status === 'READY' || state.status === 'STALE') {
      expect(state.data.knowledgeBuildId).toBe('test-build-001')
    }
    setKnowledgeSnapshot(null)
  })

  it('getProducts/getServices con snapshot seteado', async () => {
    const { setKnowledgeSnapshot, getProducts, getServices } = await import('./knowledgeAdapter')
    setKnowledgeSnapshot(rawSnapshot() as never)
    expect((getProducts() as DataState<ProductSummary[]>).status).toBe('READY')
    expect((getServices() as DataState<ServiceSummary[]>).status).toBe('READY')
    setKnowledgeSnapshot(null)
  })
})