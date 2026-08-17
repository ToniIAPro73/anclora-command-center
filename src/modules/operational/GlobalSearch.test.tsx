// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalSearch } from './GlobalSearch'
import { setKnowledgeSnapshot } from '../../adapters/knowledgeAdapter'
import type { DataState, ProductSummary, RepositorySummary, AosServiceRuntimeSummary, EndpointSummary, EndpointMatch, AosEndpointSummary } from '../../contracts/types'

function rawSnapshot() {
  return {
    schema_version: '1.0',
    metadata: { generated_at: new Date().toISOString(), rebuild_id: 'test' },
    entities: {
      repositories: [],
      products: [],
      services: [],
      endpoints: [],
      standards: [
        { id: 'std:aos-adoption-standard', type: 'Standard', name: 'AOS Adoption Standard', status: {}, fields: {} },
      ],
      technologies: [],
      'business-units': [],
    },
    relationships: [],
    conflicts: [],
  }
}

const products: DataState<ProductSummary[]> = {
  status: 'READY',
  data: [{ id: 'product:fiscal', name: 'Anclora Fiscal', businessUnitId: null, businessUnitLabel: 'Independent', repoId: null, productStatus: 'ACTIVE', domain: null, source: 'knowledge', sourceId: 'product:fiscal' }],
}
const repositories: DataState<RepositorySummary[]> = {
  status: 'READY',
  data: [{ id: 'repo:anclora-fiscal', name: 'Anclora Fiscal', githubOwner: null, githubVisibility: 'public', repositoryStatus: 'active', portfolioStatus: 'ACTIVE', defaultBranch: 'main', productId: null, targetRole: null, sourceOfTruthLocal: null, censusId: 'anclora-fiscal', source: 'knowledge', sourceId: 'repo:anclora-fiscal' }],
}
const aosService: AosServiceRuntimeSummary = { service: 'fiscal-api', port: 4001, processState: 'running', state: 'running', health: 'ok', pid: 1, managed: 'aos', localUrl: null, publicUrl: null }
const aos: DataState<AosServiceRuntimeSummary[]> = { status: 'READY', data: [aosService] }

const aosEp: AosEndpointSummary = {
  domain: 'fiscal.dev.anclora.com',
  service: 'fiscal-web',
  configured: true,
  authRequired: true,
  reachable: true,
  https: true,
  authProtected: true,
  backendReachable: true,
  status: 'auth_protected',
}
const endpoints: DataState<EndpointSummary[]> = {
  status: 'READY',
  data: [{ id: 'endpoint:fiscal.dev.anclora.com', host: 'fiscal.dev.anclora.com', port: 3013, endpointStatus: 'configured_not_exposed_auth_required', appKey: 'fiscal-web', source: 'aos', sourceId: 'endpoint:fiscal.dev.anclora.com' }],
}
const endpointMatches: EndpointMatch[] = [
  { id: 'endpoint:fiscal.dev.anclora.com', aos: aosEp, knowledgeId: 'endpoint:fiscal.dev.anclora.com', candidateIds: ['endpoint:fiscal.dev.anclora.com'], result: 'MATCHED', method: 'exact-domain', evidence: 'x' },
]

function setup(
  overrides: Partial<{
    products: DataState<ProductSummary[]>
    repositories: DataState<RepositorySummary[]>
    aos: DataState<AosServiceRuntimeSummary[]>
    endpoints: DataState<EndpointSummary[]>
    endpointMatches: EndpointMatch[]
  }> = {},
) {
  const onClose = vi.fn()
  const onSelect = vi.fn()
  render(
    <GlobalSearch
      onClose={onClose}
      onSelect={onSelect}
      language="en"
      products={overrides.products ?? products}
      repositories={overrides.repositories ?? repositories}
      aos={overrides.aos ?? aos}
      endpoints={overrides.endpoints ?? endpoints}
      endpointMatches={overrides.endpointMatches ?? endpointMatches}
    />,
  )
  return { onClose, onSelect }
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    setKnowledgeSnapshot(rawSnapshot() as never)
  })

  it('autofocuses the search input on mount', () => {
    setup()
    expect(screen.getByRole('combobox')).toHaveFocus()
  })

  it('shows no results list before typing', () => {
    setup()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('exact match finds a product and a repository (multiple entity types)', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Anclora Fiscal' } })
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Repository')).toBeInTheDocument()
  })

  it('service search works from live AOS data', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fiscal-api' } })
    expect(screen.getByRole('option', { name: /fiscal-api/ })).toBeInTheDocument()
  })

  it('knowledge entity (standard) is searchable', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AOS Adoption' } })
    expect(screen.getByRole('option', { name: /AOS Adoption Standard/ })).toBeInTheDocument()
  })

  it('zero results state', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzznomatch' } })
    expect(screen.getByText('No matching entities.')).toBeInTheDocument()
  })

  it('Enter navigates to the highlighted result and closes', () => {
    const { onSelect, onClose } = setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Anclora Fiscal' } })
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ArrowDown moves selection to the next result before Enter', () => {
    const { onSelect } = setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Anclora Fiscal' } })
    const first = screen.getAllByRole('option')[0].id
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(screen.getAllByRole('option')[1]?.id.replace('search-option-', '') ?? first.replace('search-option-', ''))
  })

  it('clicking a result activates it', () => {
    const { onSelect } = setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Anclora Fiscal' } })
    const option = screen.getAllByRole('option')[0]
    fireEvent.click(option)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('Escape closes the palette', () => {
    const { onClose } = setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('degrades gracefully when Knowledge-backed sources are unavailable: service search (AOS-only) still works', () => {
    setup({
      products: { status: 'UNAVAILABLE', reason: 'down' },
      repositories: { status: 'UNAVAILABLE', reason: 'down' },
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fiscal-api' } })
    expect(screen.getByRole('option', { name: /fiscal-api/ })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Anclora Fiscal' } })
    expect(screen.getByText('No matching entities.')).toBeInTheDocument()
  })

  it('never sends the query into anything resembling a shell command (data-only)', () => {
    const { onSelect } = setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '$(rm -rf /); Anclora Fiscal' } })
    // malicious-looking query is treated purely as a search string: no crash,
    // no special handling, and it simply fails to match (substring search).
    expect(screen.getByText('No matching entities.')).toBeInTheDocument()
    expect(onSelect).not.toHaveBeenCalled()
  })

  // COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION
  it('a MATCHED endpoint appears exactly once (deduplicated, uses the Knowledge id)', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fiscal.dev.anclora.com' } })
    const options = screen.getAllByRole('option', { name: /fiscal\.dev\.anclora\.com/ })
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveAttribute('id', 'search-option-endpoint:fiscal.dev.anclora.com')
  })

  it('endpoint result secondary shows domain, status and service — never the raw id as primary text', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fiscal.dev.anclora.com' } })
    const option = screen.getByRole('option', { name: /fiscal\.dev\.anclora\.com/ })
    expect(option).not.toHaveTextContent('endpoint:fiscal.dev.anclora.com')
    expect(option).toHaveTextContent('protected')
    expect(option).toHaveTextContent('fiscal-web')
  })

  it('an AOS-only unmatched endpoint is searchable via its operational id', () => {
    setup({
      endpointMatches: [
        {
          id: 'aos-endpoint:command-center.dev.anclora.com',
          aos: { ...aosEp, domain: 'command-center.dev.anclora.com', service: 'command-center' },
          knowledgeId: null,
          candidateIds: [],
          result: 'UNMATCHED',
          method: 'none',
          evidence: 'x',
        },
      ],
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'command-center.dev.anclora.com' } })
    expect(screen.getByRole('option', { name: /command-center\.dev\.anclora\.com/ })).toBeInTheDocument()
  })

  it('a Knowledge-only endpoint (no AOS runtime counterpart) is still searchable', () => {
    setup({
      endpointMatches: [],
      endpoints: {
        status: 'READY',
        data: [{ id: 'endpoint:orphan.dev.anclora.com', host: 'orphan.dev.anclora.com', port: null, endpointStatus: 'unknown', appKey: 'orphan', source: 'aos', sourceId: 'endpoint:orphan.dev.anclora.com' }],
      },
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'orphan.dev.anclora.com' } })
    expect(screen.getByRole('option', { name: /orphan\.dev\.anclora\.com/ })).toBeInTheDocument()
  })

  it('endpoint service search (query matches the service, not the domain)', () => {
    setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fiscal-web' } })
    expect(screen.getByRole('option', { name: /fiscal\.dev\.anclora\.com/ })).toBeInTheDocument()
  })

  it('Ctrl+K -> type -> Enter opens the matched endpoint (dedicated palette navigation, no service action exposed)', () => {
    const { onSelect } = setup()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fiscal.dev.anclora.com' } })
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('endpoint:fiscal.dev.anclora.com')
  })

  it('NOT_APPLICABLE (local-only) endpoints are omitted from search — nothing useful to find', () => {
    setup({
      endpointMatches: [
        {
          id: 'aos-endpoint:unconfigured-0',
          aos: { domain: null, service: null, configured: false, authRequired: false, reachable: false, https: false, authProtected: false, backendReachable: null, status: 'not_configured' },
          knowledgeId: null,
          candidateIds: [],
          result: 'NOT_APPLICABLE',
          method: 'none',
          evidence: 'x',
        },
      ],
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'unconfigured' } })
    expect(screen.getByText('No matching entities.')).toBeInTheDocument()
  })
})
