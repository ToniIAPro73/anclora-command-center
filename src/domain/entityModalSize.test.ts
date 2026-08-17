// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getEntityModalSize } from './entityModalSize'

function size(overrides: Partial<Parameters<typeof getEntityModalSize>[0]> = {}) {
  return getEntityModalSize({
    type: undefined,
    propertyCount: 0,
    statusCount: 0,
    relationshipCount: 0,
    liveAos: false,
    runtimePresent: false,
    ...overrides,
  })
}

describe('getEntityModalSize — deterministic adaptive sizing', () => {
  it('Repository is always wide (Git/CBM/properties/relationship sets)', () => {
    expect(size({ type: 'Repository', propertyCount: 17, statusCount: 2, relationshipCount: 42 })).toBe('wide')
    // even a sparse repository record stays wide: the runtime block may appear later
    expect(size({ type: 'Repository', propertyCount: 1, statusCount: 1, relationshipCount: 1 })).toBe('wide')
  })

  it('simple Technology is compact — never oversized', () => {
    expect(size({ type: 'Technology', propertyCount: 1, statusCount: 1, relationshipCount: 1 })).toBe('compact')
    expect(size({ type: 'Technology', propertyCount: 0, statusCount: 1, relationshipCount: 0 })).toBe('compact')
  })

  it('Product is medium regardless of modest content', () => {
    expect(size({ type: 'Product', propertyCount: 4, statusCount: 2, relationshipCount: 1 })).toBe('medium')
    expect(size({ type: 'Product', propertyCount: 0, statusCount: 0, relationshipCount: 0 })).toBe('medium')
  })

  it('Service goes wide when live AOS runtime is present, else density-driven', () => {
    expect(size({ type: 'Service', propertyCount: 10, statusCount: 1, relationshipCount: 3, runtimePresent: true })).toBe('wide')
    expect(size({ type: 'Service', propertyCount: 8, statusCount: 1, relationshipCount: 3, runtimePresent: false })).toBe('medium')
    expect(size({ type: 'Service', propertyCount: 14, statusCount: 1, relationshipCount: 2, runtimePresent: false })).toBe('wide')
  })

  it('Endpoint with a live AOS match is wide; without it, density-driven', () => {
    expect(size({ type: 'Endpoint', propertyCount: 5, statusCount: 1, relationshipCount: 2, liveAos: true })).toBe('wide')
    expect(size({ type: 'Endpoint', propertyCount: 5, statusCount: 1, relationshipCount: 2, liveAos: false })).toBe('medium')
    expect(size({ type: 'Endpoint', propertyCount: 10, statusCount: 2, relationshipCount: 4, liveAos: false })).toBe('wide')
  })

  it('Standard compresses when nearly empty and widens when metadata-rich', () => {
    expect(size({ type: 'Standard', propertyCount: 1, statusCount: 1, relationshipCount: 0 })).toBe('compact')
    expect(size({ type: 'Standard', propertyCount: 7, statusCount: 2, relationshipCount: 3 })).toBe('medium')
    expect(size({ type: 'Standard', propertyCount: 10, statusCount: 2, relationshipCount: 3 })).toBe('wide')
  })

  it('BusinessUnit stays compact unless it carries many properties/relationships', () => {
    expect(size({ type: 'BusinessUnit', propertyCount: 2, statusCount: 1, relationshipCount: 1 })).toBe('compact')
    expect(size({ type: 'BusinessUnit', propertyCount: 6, statusCount: 2, relationshipCount: 2 })).toBe('medium')
  })

  it('generic Knowledge default: compact <= 4, wide >= 14, large >= 24', () => {
    expect(size({ propertyCount: 1, statusCount: 1, relationshipCount: 1 })).toBe('compact')
    expect(size({ propertyCount: 5, statusCount: 1, relationshipCount: 2 })).toBe('medium')
    expect(size({ propertyCount: 10, statusCount: 2, relationshipCount: 4 })).toBe('wide')
    expect(size({ propertyCount: 18, statusCount: 2, relationshipCount: 6 })).toBe('large')
  })

  it('operational (AOS-only) endpoints are treated as Endpoint with live AOS', () => {
    expect(size({ type: 'Endpoint', liveAos: true, propertyCount: 0, statusCount: 0, relationshipCount: 0 })).toBe('wide')
  })
})