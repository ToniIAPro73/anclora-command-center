// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { EntityModal } from './EntityModal'
import { setKnowledgeSnapshot } from '../../adapters/knowledgeAdapter'
import { setRepositoriesRuntimeSnapshot } from '../../adapters/repositoryRuntimeAdapter'
import type { RepositoryRuntimeState } from '../../contracts/types'


// COMMAND_CENTER_ADAPTIVE_DETAIL_MODALS — Seccion 48: the modal shell must
// carry the deterministic size modifier for each entity (Repository -> wide,
// simple Technology -> compact, Product -> medium, rich Endpoint -> wide).
function modalSizeClassFor(entityId: string, extra?: Parameters<typeof EntityModal>[0]) {
  const { container } = render(
    <EntityModal entityId={entityId} language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} {...extra} />,
  )
  return container.querySelector('[role="dialog"]')?.className ?? ''
}

function rawSnapshot() {
  return {
    schema_version: '1.0',
    metadata: { generated_at: new Date().toISOString(), rebuild_id: 'test' },
    entities: {
      repositories: [
        {
          id: 'repo:ToniIAPro73/anclora-fiscal',
          type: 'Repository',
          name: 'Anclora Fiscal',
          status: { portfolio_status: 'ACTIVE' },
          fields: { census_id: 'anclora-fiscal' },
        },
      ],
      products: [
        {
          id: 'product:fiscal',
          type: 'Product',
          name: 'Anclora Fiscal',
          status: { product_status: 'ACTIVE' },
          fields: { domain: 'fiscal_finance' },
        },
      ],
      services: [
        {
          id: 'service:fiscal-api',
          type: 'Service',
          name: 'fiscal-api',
          status: { service_status: 'RUNNING' },
          fields: { port: 4001 },
        },
      ],
      endpoints: [],
      standards: [],
      technologies: [
        {
          id: 'tech:docker',
          type: 'Technology',
          name: 'Docker',
          status: { tech_status: 'active' },
          fields: { category: 'tool' },
        },
      ],
      'business-units': [],
    },
    relationships: [
      { id: 'rel-1', type: 'DEPENDS_ON', from: 'service:fiscal-api', to: 'product:fiscal', confidence: 'confirmed' },
    ],
    conflicts: [],
  }
}

function idleAos() {
  return { status: 'READY' as const, data: [{ service: 'fiscal-api', port: 4001, processState: 'running', state: 'running', health: 'ok', pid: 1, managed: 'aos' as const, localUrl: null, publicUrl: null }] }
}

describe('EntityModal', () => {
  beforeEach(() => {
    setKnowledgeSnapshot(rawSnapshot() as never)
  })

  it('renders nothing when entityId is null', () => {
    render(<EntityModal entityId={null} language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens a known product: shows label, properties, status, and outgoing/incoming relationships', () => {
    render(<EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Anclora Fiscal')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('fiscal_finance')).toBeInTheDocument()
    // product is the "to" of the relationship -> incoming
    expect(screen.getByText('Incoming')).toBeInTheDocument()
    expect(screen.getByText('fiscal-api')).toBeInTheDocument()
  })

  it('opens a known service: shows outgoing relationship and cross-referenced live AOS runtime state', () => {
    render(<EntityModal entityId="service:fiscal-api" language="en" aos={idleAos()} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('Outgoing')).toBeInTheDocument()
    expect(screen.getByText('Anclora Fiscal')).toBeInTheDocument()
    expect(screen.getByText('Live runtime status (AOS)')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('unknown id with no relationships -> not-found empty state, no crash', () => {
    render(<EntityModal entityId="product:does-not-exist" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('Entity not found in Knowledge.')).toBeInTheDocument()
  })

  it('entity without relationships shows "No relationships available"', () => {
    setKnowledgeSnapshot({
      ...rawSnapshot(),
      relationships: [],
    } as never)
    render(<EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('No relationships available')).toBeInTheDocument()
  })

  it('unresolved relationship target (missing entity record) still navigable, shows unresolved notice for the stub itself', () => {
    setKnowledgeSnapshot({
      ...rawSnapshot(),
      relationships: [
        { id: 'rel-2', type: 'APPLIES_TO', from: 'contract:FOO', to: 'product:fiscal', confidence: 'confirmed' },
      ],
    } as never)
    render(<EntityModal entityId="contract:FOO" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('This entity only exists as a relationship target — Knowledge has no record of its own for it.')).toBeInTheDocument()
    // still shows its one outgoing relationship, resolvable target is clickable
    expect(screen.getByRole('button', { name: 'Anclora Fiscal' })).toBeInTheDocument()
  })

  it('clicking a resolvable relationship target calls onNavigate with its id', () => {
    const onNavigate = vi.fn()
    render(<EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: 'fiscal-api' }))
    expect(onNavigate).toHaveBeenCalledWith('service:fiscal-api')
  })

  it('shows a Back button only when onBack is provided, and calls it', () => {
    const onBack = vi.fn()
    const { rerender } = render(
      <EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />,
    )
    expect(screen.queryByRole('button', { name: /Back/ })).toBeNull()

    rerender(
      <EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onBack={onBack} onNavigate={() => {}} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(<EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={onClose} onNavigate={() => {}} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Repository opens wide (ac-modal--wide), Technology opens compact, Product medium', () => {
    // stub the live runtime probe so the repository render never fetches
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ status: 200, json: async () => ({ status: 'READY', repository: runtimeState() }) })),
    )
    expect(modalSizeClassFor('repo:ToniIAPro73/anclora-fiscal')).toContain('ac-modal--wide')
    vi.unstubAllGlobals()
    expect(modalSizeClassFor('tech:docker')).toContain('ac-modal--compact')
    expect(modalSizeClassFor('product:fiscal')).toContain('ac-modal--medium')
  })

  it('modal shell is centered DS modal, never the right-side drawer', () => {
    const cls = modalSizeClassFor('product:fiscal')
    expect(cls).toContain('ac-modal')
    expect(cls).toContain('ac-modal--detail')
    expect(cls).not.toContain('ac-drawer')
  })
})

function runtimeState(overrides: Partial<RepositoryRuntimeState> = {}): RepositoryRuntimeState {
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
    clean: false,
    modifiedCount: 2,
    addedCount: 0,
    deletedCount: 0,
    renamedCount: 0,
    untrackedCount: 1,
    upstream: 'origin/main',
    ahead: 1,
    behind: 2,
    divergence: 'DIVERGED',
    lastCommit: { hash: 'b'.repeat(40), shortHash: 'bbbbbbb', subject: 'fix: something', authorName: 'Toni', date: new Date().toISOString() },
    cbm: { available: true, freshness: 'FRESH', indexedHead: 'aaaaaaaaaaaa', workingTree: 'clean' },
    ...overrides,
  }
}

describe('EntityModal (repository Git/CBM section)', () => {
  beforeEach(() => {
    setKnowledgeSnapshot(rawSnapshot() as never)
    setRepositoriesRuntimeSnapshot(null)
  })
  afterEach(() => {
    setRepositoriesRuntimeSnapshot(null)
    vi.unstubAllGlobals()
  })

  it('shows Git branch/HEAD/working-tree/ahead-behind/last-commit and CBM freshness once the live probe resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ status: 200, json: async () => ({ status: 'READY', repository: runtimeState() }) })),
    )
    render(<EntityModal entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)

    await waitFor(() => expect(screen.getByText(/bbbbbbb/)).toBeInTheDocument())
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(screen.getByText('DIRTY')).toBeInTheDocument()
    expect(screen.getByText('2 modified · 0 added · 0 deleted · 0 renamed · 1 untracked')).toBeInTheDocument()
    expect(screen.getByText('Diverged — 1 ahead, 2 behind')).toBeInTheDocument()
    expect(screen.getByText('Remote comparison based on local refs — no git fetch is executed.')).toBeInTheDocument()
    expect(screen.getByText('fix: something', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('FRESH')).toBeInTheDocument()
  })

  it('paints the batch-loaded runtime immediately, before the live fetch resolves', () => {
    setRepositoriesRuntimeSnapshot([runtimeState({ branch: 'batch-branch' })])
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))) // never resolves
    render(<EntityModal entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('batch-branch')).toBeInTheDocument()
  })

  it('detached HEAD is shown explicitly, not as an empty branch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ status: 200, json: async () => ({ status: 'READY', repository: runtimeState({ detached: true, branch: null, divergence: 'NO_UPSTREAM', upstream: null, ahead: null, behind: null }) }) })),
    )
    render(<EntityModal entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    await waitFor(() => expect(screen.getByText('Detached HEAD')).toBeInTheDocument())
  })

  it('unavailable repository: shows the Git-unavailable empty state, not a crash', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        status: 502,
        json: async () => ({
          status: 'ERROR',
          repository: { repositoryId: 'anclora-fiscal', knowledgeId: 'repo:ToniIAPro73/anclora-fiscal', available: false, observedAt: new Date().toISOString(), errors: ['git status fallo: boom'], branch: null, detached: false, head: null, shortHead: null, clean: null, modifiedCount: 0, addedCount: 0, deletedCount: 0, renamedCount: 0, untrackedCount: 0, upstream: null, ahead: null, behind: null, divergence: 'UNKNOWN', lastCommit: null, cbm: { available: false } },
        }),
      })),
    )
    render(<EntityModal entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    await waitFor(() => expect(screen.getByText('Git unavailable: git status fallo: boom')).toBeInTheDocument())
  })

  it('CBM not indexed shows an explicit empty state, not a false freshness value', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ status: 200, json: async () => ({ status: 'READY', repository: runtimeState({ cbm: { available: false } }) }) })),
    )
    render(<EntityModal entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    await waitFor(() => expect(screen.getByText('Not indexed')).toBeInTheDocument())
  })

  it('non-repository entities never trigger a repository runtime fetch', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<EntityModal entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

// COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION
function endpointSnapshot() {
  return {
    schema_version: '1.0',
    metadata: { generated_at: new Date().toISOString(), rebuild_id: 'test' },
    entities: {
      repositories: [],
      products: [],
      services: [
        { id: 'service:fiscal-web', type: 'Service', name: 'fiscal-web', status: { service_status: 'RUNNING' }, fields: { port: 3013 } },
      ],
      endpoints: [
        {
          id: 'endpoint:fiscal.dev.anclora.com',
          type: 'Endpoint',
          name: 'fiscal.dev.anclora.com',
          status: { endpoint_status: 'configured_not_exposed_auth_required' },
          fields: { host: 'fiscal.dev.anclora.com', port: 3013, app_key: 'fiscal-web' },
        },
      ],
      standards: [],
      technologies: [],
      'business-units': [],
    },
    relationships: [
      { id: 'rel-1', type: 'HAS_ENDPOINT', from: 'service:fiscal-web', to: 'endpoint:fiscal.dev.anclora.com', confidence: 'confirmed' },
    ],
    conflicts: [],
  }
}

function aosEndpoint(overrides: Partial<import('../../contracts/types').AosEndpointSummary> = {}): import('../../contracts/types').AosEndpointSummary {
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

describe('EntityModal (endpoint reconciliation)', () => {
  beforeEach(() => {
    setKnowledgeSnapshot(endpointSnapshot() as never)
  })

  it('matched Knowledge Endpoint shows the generic entity view PLUS a Live AOS (status/https/auth/service) section', () => {
    const matched: import('../../contracts/types').EndpointMatch = {
      id: 'endpoint:fiscal.dev.anclora.com',
      aos: aosEndpoint(),
      knowledgeId: 'endpoint:fiscal.dev.anclora.com',
      candidateIds: ['endpoint:fiscal.dev.anclora.com'],
      result: 'MATCHED',
      method: 'exact-domain',
      evidence: 'Matched by exact domain: fiscal.dev.anclora.com',
    }
    render(
      <EntityModal entityId="endpoint:fiscal.dev.anclora.com" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} endpointMatches={[matched]} onClose={() => {}} onNavigate={() => {}} />,
    )
    expect(screen.getByRole('heading', { name: 'fiscal.dev.anclora.com' })).toBeInTheDocument() // entity title
    const liveSection = screen.getByText('Live status (AOS)').closest('.op-entity-section') as HTMLElement
    expect(within(liveSection).getByText('Protected')).toBeInTheDocument()
    expect(within(liveSection).getAllByText('Yes')).toHaveLength(2) // https + authRequired
    expect(within(liveSection).getByRole('button', { name: 'fiscal-web' })).toBeInTheDocument()
  })

  it('clicking the Live AOS service link navigates to the Service entity', () => {
    const matched: import('../../contracts/types').EndpointMatch = {
      id: 'endpoint:fiscal.dev.anclora.com',
      aos: aosEndpoint(),
      knowledgeId: 'endpoint:fiscal.dev.anclora.com',
      candidateIds: ['endpoint:fiscal.dev.anclora.com'],
      result: 'MATCHED',
      method: 'exact-domain',
      evidence: 'x',
    }
    const onNavigate = vi.fn()
    render(
      <EntityModal entityId="endpoint:fiscal.dev.anclora.com" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} endpointMatches={[matched]} onClose={() => {}} onNavigate={onNavigate} />,
    )
    const liveSection = screen.getByText('Live status (AOS)').closest('.op-entity-section') as HTMLElement
    fireEvent.click(within(liveSection).getByRole('button', { name: 'fiscal-web' }))
    expect(onNavigate).toHaveBeenCalledWith('service:fiscal-web')
  })

  it('Knowledge Endpoint with no AOS match shows "no live runtime mapping", never crashes', () => {
    render(
      <EntityModal entityId="endpoint:fiscal.dev.anclora.com" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} endpointMatches={[]} onClose={() => {}} onNavigate={() => {}} />,
    )
    expect(screen.getByText('Semantic only / No live runtime mapping')).toBeInTheDocument()
  })

  it('AOS-only UNMATCHED endpoint (aos-endpoint: synthetic id) opens an operational-only view, not a fake Knowledge entity', () => {
    const unmatched: import('../../contracts/types').EndpointMatch = {
      id: 'aos-endpoint:command-center.dev.anclora.com',
      aos: aosEndpoint({ domain: 'command-center.dev.anclora.com', service: 'command-center' }),
      knowledgeId: null,
      candidateIds: [],
      result: 'UNMATCHED',
      method: 'none',
      evidence: 'No deterministic Knowledge match found',
    }
    render(
      <EntityModal entityId="aos-endpoint:command-center.dev.anclora.com" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} endpointMatches={[unmatched]} onClose={() => {}} onNavigate={() => {}} />,
    )
    expect(screen.getByText('Endpoint (AOS only)')).toBeInTheDocument()
    expect(screen.getByText('This endpoint has no corresponding Knowledge entity — operational view only.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'command-center.dev.anclora.com' })).toBeInTheDocument()
  })

  it('NOT_APPLICABLE (local-only / not_configured) endpoint shows the Local-only badge, no forced semantic match', () => {
    const notApplicable: import('../../contracts/types').EndpointMatch = {
      id: 'aos-endpoint:unconfigured-0',
      aos: aosEndpoint({ domain: null, service: null, configured: false, status: 'not_configured', authProtected: false, backendReachable: null }),
      knowledgeId: null,
      candidateIds: [],
      result: 'NOT_APPLICABLE',
      method: 'none',
      evidence: 'No domain or service identity available from AOS (local-only / not configured)',
    }
    render(
      <EntityModal entityId="aos-endpoint:unconfigured-0" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} endpointMatches={[notApplicable]} onClose={() => {}} onNavigate={() => {}} />,
    )
    expect(screen.getByText('Local only / Not configured')).toBeInTheDocument()
    expect(screen.getByText('No associated service')).toBeInTheDocument()
  })

  it('AMBIGUOUS endpoint shows the ambiguous notice AND a candidate list — never auto-picks one', () => {
    const ambiguous: import('../../contracts/types').EndpointMatch = {
      id: 'aos-endpoint:fiscal.dev.anclora.com',
      aos: aosEndpoint(),
      knowledgeId: null,
      candidateIds: ['endpoint:a', 'endpoint:b'],
      result: 'AMBIGUOUS',
      method: 'exact-domain',
      evidence: '2 Knowledge endpoints share domain fiscal.dev.anclora.com',
    }
    const onNavigate = vi.fn()
    render(
      <EntityModal entityId="aos-endpoint:fiscal.dev.anclora.com" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} endpointMatches={[ambiguous]} onClose={() => {}} onNavigate={onNavigate} />,
    )
    expect(screen.getByText('Ambiguous semantic match — 2 candidate Knowledge entities.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'endpoint:a' }))
    expect(onNavigate).toHaveBeenCalledWith('endpoint:a')
  })
})
