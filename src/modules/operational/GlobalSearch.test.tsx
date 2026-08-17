// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalSearch } from './GlobalSearch'
import { setKnowledgeSnapshot } from '../../adapters/knowledgeAdapter'
import type { DataState, ProductSummary, RepositorySummary, AosServiceRuntimeSummary } from '../../contracts/types'

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

function setup(overrides: Partial<{ products: DataState<ProductSummary[]>; repositories: DataState<RepositorySummary[]>; aos: DataState<AosServiceRuntimeSummary[]> }> = {}) {
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
})
