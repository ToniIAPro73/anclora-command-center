// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EntityDrawer } from './EntityDrawer'
import { setKnowledgeSnapshot } from '../../adapters/knowledgeAdapter'
import { setRepositoriesRuntimeSnapshot } from '../../adapters/repositoryRuntimeAdapter'
import type { RepositoryRuntimeState } from '../../contracts/types'

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
      technologies: [],
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

describe('EntityDrawer', () => {
  beforeEach(() => {
    setKnowledgeSnapshot(rawSnapshot() as never)
  })

  it('renders nothing when entityId is null', () => {
    render(<EntityDrawer entityId={null} language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens a known product: shows label, properties, status, and outgoing/incoming relationships', () => {
    render(<EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Anclora Fiscal')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('fiscal_finance')).toBeInTheDocument()
    // product is the "to" of the relationship -> incoming
    expect(screen.getByText('Incoming')).toBeInTheDocument()
    expect(screen.getByText('fiscal-api')).toBeInTheDocument()
  })

  it('opens a known service: shows outgoing relationship and cross-referenced live AOS runtime state', () => {
    render(<EntityDrawer entityId="service:fiscal-api" language="en" aos={idleAos()} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('Outgoing')).toBeInTheDocument()
    expect(screen.getByText('Anclora Fiscal')).toBeInTheDocument()
    expect(screen.getByText('Live runtime status (AOS)')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('unknown id with no relationships -> not-found empty state, no crash', () => {
    render(<EntityDrawer entityId="product:does-not-exist" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('Entity not found in Knowledge.')).toBeInTheDocument()
  })

  it('entity without relationships shows "No relationships available"', () => {
    setKnowledgeSnapshot({
      ...rawSnapshot(),
      relationships: [],
    } as never)
    render(<EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('No relationships available')).toBeInTheDocument()
  })

  it('unresolved relationship target (missing entity record) still navigable, shows unresolved notice for the stub itself', () => {
    setKnowledgeSnapshot({
      ...rawSnapshot(),
      relationships: [
        { id: 'rel-2', type: 'APPLIES_TO', from: 'contract:FOO', to: 'product:fiscal', confidence: 'confirmed' },
      ],
    } as never)
    render(<EntityDrawer entityId="contract:FOO" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('This entity only exists as a relationship target — Knowledge has no record of its own for it.')).toBeInTheDocument()
    // still shows its one outgoing relationship, resolvable target is clickable
    expect(screen.getByRole('button', { name: 'Anclora Fiscal' })).toBeInTheDocument()
  })

  it('clicking a resolvable relationship target calls onNavigate with its id', () => {
    const onNavigate = vi.fn()
    render(<EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: 'fiscal-api' }))
    expect(onNavigate).toHaveBeenCalledWith('service:fiscal-api')
  })

  it('shows a Back button only when onBack is provided, and calls it', () => {
    const onBack = vi.fn()
    const { rerender } = render(
      <EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />,
    )
    expect(screen.queryByRole('button', { name: /Back/ })).toBeNull()

    rerender(
      <EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onBack={onBack} onNavigate={() => {}} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(<EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={onClose} onNavigate={() => {}} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
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

describe('EntityDrawer (repository Git/CBM section)', () => {
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
    render(<EntityDrawer entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)

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
    render(<EntityDrawer entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(screen.getByText('batch-branch')).toBeInTheDocument()
  })

  it('detached HEAD is shown explicitly, not as an empty branch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ status: 200, json: async () => ({ status: 'READY', repository: runtimeState({ detached: true, branch: null, divergence: 'NO_UPSTREAM', upstream: null, ahead: null, behind: null }) }) })),
    )
    render(<EntityDrawer entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
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
    render(<EntityDrawer entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    await waitFor(() => expect(screen.getByText('Git unavailable: git status fallo: boom')).toBeInTheDocument())
  })

  it('CBM not indexed shows an explicit empty state, not a false freshness value', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ status: 200, json: async () => ({ status: 'READY', repository: runtimeState({ cbm: { available: false } }) }) })),
    )
    render(<EntityDrawer entityId="repo:ToniIAPro73/anclora-fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    await waitFor(() => expect(screen.getByText('Not indexed')).toBeInTheDocument())
  })

  it('non-repository entities never trigger a repository runtime fetch', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<EntityDrawer entityId="product:fiscal" language="en" aos={{ status: 'UNAVAILABLE', reason: 'x' }} onClose={() => {}} onNavigate={() => {}} />)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
