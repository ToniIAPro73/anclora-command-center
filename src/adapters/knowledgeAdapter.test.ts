import { describe, expect, it } from 'vitest'
import {
  getEntityDetail,
  listKnowledgeEntities,
  mapKnowledgeSnapshot,
  resolveEntityRef,
  setKnowledgeSnapshot,
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

  it('businessUnitLabel resuelto desde Knowledge (bu:premium → Premium)', () => {
    // BUSINESS_UNIT_IDS_HUMANIZED: el ID canonico se conserva y la label
    // humana sale de las entidades business-units del propio Knowledge.
    const raw = rawSnapshot({
      entities: {
        repositories: [],
        products: [
          {
            id: 'product:fs',
            type: 'product',
            name: 'FileStudio',
            status: { product_status: 'ACTIVE' },
            fields: { business_unit_id: 'bu:premium' },
          },
          {
            id: 'product:zzz',
            type: 'product',
            name: 'Zzz',
            status: { product_status: 'ACTIVE' },
            fields: { business_unit_id: 'bu:no-existe' },
          },
        ],
        services: [],
        endpoints: [],
        standards: [],
        technologies: [],
        'business-units': [
          {
            id: 'bu:premium',
            type: 'BusinessUnit',
            name: 'Premium',
            status: { unit_status: 'active' },
            fields: {},
          },
        ],
      },
    })
    const m = mapKnowledgeSnapshot(raw)
    expect(m.products.status).toBe('READY')
    if (m.products.status !== 'READY') return
    const fs = m.products.data.find((p) => p.id === 'product:fs')
    // ID canonico intacto (RAW_INTERNAL_IDS_PRESERVED) + label resuelta
    expect(fs?.businessUnitId).toBe('bu:premium')
    expect(fs?.businessUnitLabel).toBe('Premium')
    // UNKNOWN_IDS_GRACEFUL: id sin label -> null (la UI muestra el id crudo)
    const zzz = m.products.data.find((p) => p.id === 'product:zzz')
    expect(zzz?.businessUnitId).toBe('bu:no-existe')
    expect(zzz?.businessUnitLabel).toBeNull()
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

// Entity navigation (COMMAND_CENTER_ENTITY_NAVIGATION_AND_SEARCH):
// resolveEntityRef / getEntityDetail / listKnowledgeEntities.
describe('knowledgeAdapter (entity navigation)', () => {
  it('resolveEntityRef: entidad conocida usa el name real de Knowledge, found=true', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    const ref = resolveEntityRef('service:filestudio')
    expect(ref).toEqual({ id: 'service:filestudio', type: 'service', label: 'filestudio', source: 'knowledge', found: true })
    setKnowledgeSnapshot(null)
  })

  it('resolveEntityRef: id sin entidad propia (solo extremo de relacion) → found=false, label=id crudo (nunca inventado)', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    const ref = resolveEntityRef('contract:ANCLORA_BRAND_CONTRACT')
    expect(ref.found).toBe(false)
    expect(ref.label).toBe('contract:ANCLORA_BRAND_CONTRACT')
    expect(ref.type).toBe('Contract')
    setKnowledgeSnapshot(null)
  })

  it('resolveEntityRef sin snapshot → found=false, sin crash', () => {
    setKnowledgeSnapshot(null)
    const ref = resolveEntityRef('product:whatever')
    expect(ref.found).toBe(false)
  })

  it('getEntityDetail: entidad conocida trae properties, status y relaciones con direccion correcta', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    const detail = getEntityDetail('service:filestudio')
    expect(detail).not.toBeNull()
    expect(detail?.found).toBe(true)
    expect(detail?.label).toBe('filestudio')
    expect(detail?.status.service_status).toBe('running')
    expect(detail?.properties.port).toBe(3000)
    expect(detail?.relationships).toHaveLength(1)
    expect(detail?.relationships[0]).toMatchObject({ direction: 'outgoing', type: 'DEPENDS_ON' })
    expect(detail?.relationships[0]?.counterpart).toMatchObject({ id: 'product:command-center', label: 'Command Center', found: true })
    setKnowledgeSnapshot(null)
  })

  it('getEntityDetail: entidad receptora de la relacion la ve como incoming', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    const detail = getEntityDetail('product:command-center')
    expect(detail?.relationships[0]).toMatchObject({ direction: 'incoming', type: 'DEPENDS_ON' })
    expect(detail?.relationships[0]?.counterpart.id).toBe('service:filestudio')
    setKnowledgeSnapshot(null)
  })

  it('getEntityDetail: entidad sin relaciones → relationships=[] (no null, no crash)', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    const detail = getEntityDetail('endpoint:filestudio')
    expect(detail).not.toBeNull()
    expect(detail?.relationships).toEqual([])
    setKnowledgeSnapshot(null)
  })

  it('getEntityDetail: id desconocido sin relaciones → null (fallback grazioso, no fabricar entidad)', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    expect(getEntityDetail('product:does-not-exist')).toBeNull()
    setKnowledgeSnapshot(null)
  })

  it('getEntityDetail: id sin entidad propia pero CON relaciones → sigue siendo navegable (found=false)', () => {
    const raw = rawSnapshot({
      relationships: [
        { id: 'rel-2', type: 'APPLIES_TO', from: 'contract:ANCLORA_BRAND_CONTRACT', to: 'repo:ToniIAPro73/anclora-command-center', confidence: 'confirmed' },
      ],
    })
    setKnowledgeSnapshot(raw as never)
    const detail = getEntityDetail('contract:ANCLORA_BRAND_CONTRACT')
    expect(detail).not.toBeNull()
    expect(detail?.found).toBe(false)
    expect(detail?.relationships).toHaveLength(1)
    expect(detail?.relationships[0]?.direction).toBe('outgoing')
    setKnowledgeSnapshot(null)
  })

  it('getEntityDetail sin snapshot → null', () => {
    setKnowledgeSnapshot(null)
    expect(getEntityDetail('service:filestudio')).toBeNull()
  })

  it('listKnowledgeEntities: enumera todas las entidades de todos los grupos', () => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    const all = listKnowledgeEntities()
    expect(all.length).toBe(4) // 1 repo + 1 product + 1 service + 1 endpoint en el fixture
    expect(all.every((e) => e.found)).toBe(true)
    setKnowledgeSnapshot(null)
  })

  it('listKnowledgeEntities sin snapshot → []', () => {
    setKnowledgeSnapshot(null)
    expect(listKnowledgeEntities()).toEqual([])
  })
})