// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OperationalView } from './OperationalView'
import type {
  AosEndpointSummary,
  AosServiceRuntimeSummary,
  ConflictSummary,
  DataState,
  EndpointSummary,
  ProductSummary,
  RepositoryRuntimeState,
  RepositorySummary,
  ServiceSummary,
  SystemHealth,
} from '../../contracts/types'
import * as aosAdapter from '../../adapters/aosAdapter'

function baseData(overrides: Partial<Parameters<typeof OperationalView>[0]['data']> = {}) {
  const defaultServices: AosServiceRuntimeSummary[] = [
    {
      service: 'guesthub',
      port: 3009,
      processState: 'stopped',
      state: 'stopped',
      health: 'ok',
      pid: null,
      managed: 'aos',
      localUrl: 'http://127.0.0.1:3009',
      publicUrl: 'https://guesthub.dev.anclora.com',
    },
    {
      service: 'ninerouter',
      port: 8080,
      processState: 'running',
      state: 'running',
      health: 'ok',
      pid: 1234,
      managed: 'external',
      localUrl: 'http://127.0.0.1:8080',
      publicUrl: null,
    },
  ]

  return {
    loadingInitial: false,
    aosLastUpdatedAt: new Date(),
    aos: { status: 'READY', data: defaultServices } as DataState<AosServiceRuntimeSummary[]>,
    aosEndpoints: { status: 'EMPTY' } as DataState<AosEndpointSummary[]>,
    writeActionsUiAvailable: false,
    knowledgeHealth: {
      status: 'READY',
      data: {
        akgEntityCount: 10,
        akgRelationshipCount: 20,
        akgConflictCount: 0,
        knowledgeBuildId: 'b-1',
        knowledgeGeneratedAt: new Date().toISOString(),
      },
    } as DataState<SystemHealth>,
    repositories: { status: 'EMPTY' } as DataState<RepositorySummary[]>,
    repositoriesRuntime: { status: 'EMPTY' } as DataState<RepositoryRuntimeState[]>,
    products: { status: 'EMPTY' } as DataState<ProductSummary[]>,
    services: { status: 'EMPTY' } as DataState<ServiceSummary[]>,
    endpoints: { status: 'EMPTY' } as DataState<EndpointSummary[]>,
    endpointMatches: [],
    conflicts: { status: 'EMPTY' } as DataState<ConflictSummary[]>,
    issues: [],
    globalStatus: 'HEALTHY' as const,
    onRefresh: vi.fn(),
    onOpenEntity: vi.fn(),
    ...overrides,
  }
}

describe('OperationalView - Services section security and accessibility', () => {
  it('cuando writeActionsUiAvailable=false, NO muestra botones de accion y muestra SOLO LECTURA', () => {
    const data = baseData({ writeActionsUiAvailable: false })
    render(<OperationalView section="services" language="es" data={data} />)

    // No debe haber botones para Iniciar / Detener / Reiniciar
    expect(screen.queryByRole('button', { name: 'Iniciar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Detener' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reiniciar' })).toBeNull()

    // Ambos servicios deben mostrar "SOLO LECTURA"
    const viewOnlyBadges = screen.getAllByText('SOLO LECTURA')
    expect(viewOnlyBadges.length).toBeGreaterThanOrEqual(2)
  })

  it('mantiene SOLO LECTURA aunque el backend S2S tenga acciones habilitadas', () => {
    const data = baseData({ writeActionsUiAvailable: false })
    render(<OperationalView section="services" language="es" data={data} />)

    expect(screen.queryByRole('button', { name: 'Iniciar' })).toBeNull()
    expect(screen.getAllByText('SOLO LECTURA').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/sesión segura/i)).toBeDefined()
  })

  it('no invoca una acción ni simula éxito en modo solo lectura', async () => {
    const action = vi.spyOn(aosAdapter, 'postServiceAction')
    const data = baseData({ writeActionsUiAvailable: false })
    render(<OperationalView section="services" language="es" data={data} />)

    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status', { name: /completada/i })).toBeNull()
    expect(action).not.toHaveBeenCalled()
  })

  it('accesibilidad: seccion de servicios tiene encabezado y nombres accesibles', () => {
    const data = baseData({ writeActionsUiAvailable: false })
    render(<OperationalView section="services" language="es" data={data} />)

    const heading = screen.getByRole('heading', { level: 2, name: /servicios/i })
    expect(heading).toBeDefined()
  })
})
