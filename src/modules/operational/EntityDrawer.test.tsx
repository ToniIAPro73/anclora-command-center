// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntityDrawer } from './EntityDrawer'
import { setKnowledgeSnapshot } from '../../adapters/knowledgeAdapter'

function rawSnapshot() {
  return {
    schema_version: '1.0',
    metadata: { generated_at: new Date().toISOString(), rebuild_id: 'test' },
    entities: {
      repositories: [],
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
