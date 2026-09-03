import { describe, expect, it } from 'vitest'
import {
  mapAosRuntimeStatus,
  setAosSnapshot,
  getAosRuntimeStatus,
  getAosEndpointsStatus,
  getAosSchemaVersion,
  getAosSnapshotAge,
  getAosWriteActionsEnabled,
  getAosWriteActionsUiAvailable,
  postServiceAction,
} from './aosAdapter'

// Tests del MAPPER PURO (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT +
// AOS_OPERATIONAL_TRUTH_RECONCILIATION):
// dado el payload del endpoint local /api/status (contrato AOS v1.x en vivo),
// devuelve el DataState UI (servicios runtime + endpoints reconciliados).
// Se verifica la FORMA del contrato (vocabulario cerrado + nullability +
// tolerancia 1.0/1.1) en vez de valores puntuales del entorno.

function rawStatus(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: new Date().toISOString(),
    status: 'READY',
    reason: null,
    schemaVersion: '1.0',
    services: [
      {
        id: 'filestudio',
        status: 'stopped',
        health: 'unknown',
        pid: null,
        managed: 'aos',
        port: 3000,
        bindHost: '127.0.0.1',
        localUrl: 'http://127.0.0.1:3000',
        publicUrl: 'https://filestudio.dev.anclora.com',
      },
    ],
    ...overrides,
  }
}

// Contrato 1.1: service.state + endpoints[] (deseado vs observado).
function rawStatus11(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: new Date().toISOString(),
    status: 'READY',
    reason: null,
    schemaVersion: '1.1',
    services: [
      {
        id: 'command-center',
        status: 'running',
        state: 'running',
        health: 'ok',
        pid: 299751,
        managed: 'aos',
        port: 3024,
        bindHost: '127.0.0.1',
        localUrl: 'http://127.0.0.1:3024',
        publicUrl: 'https://command-center.dev.anclora.com',
      },
      {
        id: 'filestudio',
        status: 'stopped',
        state: 'stopped',
        health: 'unknown',
        pid: null,
        managed: 'aos',
        port: 3000,
        bindHost: '127.0.0.1',
        localUrl: 'http://127.0.0.1:3000',
        publicUrl: 'https://filestudio.dev.anclora.com',
      },
    ],
    endpoints: [
      {
        domain: 'filestudio.dev.anclora.com',
        service: 'filestudio',
        configured: true,
        authRequired: true,
        reachable: true,
        https: true,
        authProtected: true,
        backendReachable: false,
        status: 'auth_protected',
      },
      {
        domain: null,
        service: 'fiscal-api',
        configured: false,
        authRequired: true,
        reachable: false,
        https: false,
        authProtected: false,
        backendReachable: null,
        status: 'not_configured',
      },
    ],
    ...overrides,
  }
}

describe('aosAdapter (mapper puro)', () => {
  it('contrato v1.0 READY valido → READY con vocabulario cerrado', () => {
    const m = mapAosRuntimeStatus(rawStatus() as never)
    expect(m.services.status).toBe('READY')
    if (m.services.status !== 'READY') return
    expect(m.services.data.length).toBeGreaterThan(0)
    for (const svc of m.services.data) {
      expect(typeof svc.service).toBe('string')
      expect(['running', 'stopped', 'starting', 'stale_pid', 'unknown']).toContain(svc.processState)
      expect(['ok', 'failed', 'not_configured', 'unknown']).toContain(svc.health)
      // 1.0 sin state: el adapter degrada a processState (sin romper la UI)
      expect(svc.state).toBe(svc.processState)
      if (svc.pid !== null) expect(typeof svc.pid).toBe('number')
      if (svc.localUrl !== null) expect(typeof svc.localUrl).toBe('string')
      if (svc.publicUrl !== null) expect(typeof svc.publicUrl).toBe('string')
      expect(['aos', 'external', null]).toContain(svc.managed)
    }
    // 1.0 sin endpoints: EMPTY, no error (aditivo tolerado)
    expect(m.endpoints.status).toBe('EMPTY')
  })

  it('contrato v1.1 READY → services con state + endpoints reconciliados', () => {
    const m = mapAosRuntimeStatus(rawStatus11() as never)
    expect(m.services.status).toBe('READY')
    if (m.services.status !== 'READY') return
    const cc = m.services.data.find((s) => s.service === 'command-center')
    expect(cc?.state).toBe('running')
    const fs = m.services.data.find((s) => s.service === 'filestudio')
    expect(fs?.state).toBe('stopped')

    expect(m.endpoints.status).toBe('READY')
    if (m.endpoints.status !== 'READY') return
    expect(m.endpoints.data.length).toBe(2)
    const ep = m.endpoints.data[0]
    expect(ep.domain).toBe('filestudio.dev.anclora.com')
    expect(ep.authProtected).toBe(true)
    expect(ep.status).toBe('auth_protected')
    expect(ep.backendReachable).toBe(false)
    const localOnly = m.endpoints.data[1]
    expect(localOnly.domain).toBeNull()
    expect(localOnly.status).toBe('not_configured')
  })

  it('payload null → UNAVAILABLE (services y endpoints)', () => {
    expect(mapAosRuntimeStatus(null).services.status).toBe('UNAVAILABLE')
    expect(mapAosRuntimeStatus(null).endpoints.status).toBe('UNAVAILABLE')
    expect(mapAosRuntimeStatus(undefined).services.status).toBe('UNAVAILABLE')
  })

  it('status UNAVAILABLE (aos CLI ausente) → UNAVAILABLE con reason', () => {
    const m = mapAosRuntimeStatus({ status: 'UNAVAILABLE', reason: 'aos CLI no encontrado', schemaVersion: null, services: [] } as never)
    expect(m.services.status).toBe('UNAVAILABLE')
    if (m.services.status === 'UNAVAILABLE') expect(m.services.reason).toContain('CLI')
  })

  it('status ERROR (aos CLI fallo) → ERROR con message', () => {
    const m = mapAosRuntimeStatus({ status: 'ERROR', reason: 'exit code 2', schemaVersion: null, services: [] } as never)
    expect(m.services.status).toBe('ERROR')
    if (m.services.status === 'ERROR') expect(m.services.message).toContain('exit code 2')
  })

  it('schemaVersion no soportado → ERROR (no leer contrato futuro como actual)', () => {
    const m = mapAosRuntimeStatus(rawStatus({ schemaVersion: '2.0' }) as never)
    expect(m.services.status).toBe('ERROR')
    if (m.services.status === 'ERROR') expect(m.services.message).toContain('2.0')
  })

  it('schemaVersion null (snapshot UNAVAILABLE/legacy) tolerado sin ERROR', () => {
    const m = mapAosRuntimeStatus(rawStatus({ schemaVersion: null }) as never)
    expect(m.services.status).toBe('READY')
  })

  it('services malformado (null) → ERROR, no throw', () => {
    const m = mapAosRuntimeStatus(rawStatus({ services: null }) as never)
    expect(m.services.status).toBe('ERROR')
  })

  it('services vacio ([] real) → EMPTY, no UNAVAILABLE', () => {
    const m = mapAosRuntimeStatus(rawStatus({ services: [] }) as never)
    expect(m.services.status).toBe('EMPTY')
  })

  it('json no valido (no object) → ERROR (contrato malformado)', () => {
    expect(mapAosRuntimeStatus('not-json' as never).services.status).toBe('ERROR')
  })
})

describe('aosAdapter (proxies sync)', () => {
  it('getAosRuntimeStatus tras setAosSnapshot devuelve READY', () => {
    setAosSnapshot(rawStatus() as never)
    const state = getAosRuntimeStatus()
    expect(state.status).toBe('READY')
    if (state.status === 'READY') {
      expect(getAosSchemaVersion()).toBe('1.0')
      expect(getAosSnapshotAge()).not.toBeNull()
    }
    setAosSnapshot(null)
  })

  it('getAosEndpointsStatus expone los endpoints reconciliados (1.1)', () => {
    setAosSnapshot(rawStatus11() as never)
    const state = getAosEndpointsStatus()
    expect(state.status).toBe('READY')
    if (state.status === 'READY') {
      expect(state.data.some((e) => e.status === 'auth_protected')).toBe(true)
    }
    setAosSnapshot(null)
  })

  it('setAosSnapshot(null) → getAosRuntimeStatus UNAVAILABLE', () => {
    setAosSnapshot(null)
    expect(getAosRuntimeStatus().status).toBe('UNAVAILABLE')
  })

  it('regresion guard services malformado via proxy', () => {
    setAosSnapshot(rawStatus({ services: null }) as never)
    const state = getAosRuntimeStatus() as { status: string; message?: string }
    expect(state.status).toBe('ERROR')
    setAosSnapshot(null)
  })

  it('getAosWriteActionsEnabled refleja el flag del snapshot', () => {
    expect(getAosWriteActionsEnabled()).toBe(false)
    setAosSnapshot(rawStatus({ writeActionsEnabled: true }) as never)
    expect(getAosWriteActionsEnabled()).toBe(true)
    setAosSnapshot(rawStatus({ writeActionsEnabled: false }) as never)
    expect(getAosWriteActionsEnabled()).toBe(false)
    setAosSnapshot(null)
    expect(getAosWriteActionsEnabled()).toBe(false)
  })

  it('la UI solo puede operar si el backend expone un canal seguro explícito', () => {
    setAosSnapshot(rawStatus({ writeActionsEnabled: true }) as never)
    expect(getAosWriteActionsUiAvailable()).toBe(false)
    setAosSnapshot(rawStatus({ writeActionsEnabled: true, writeActionsUiAvailable: true }) as never)
    expect(getAosWriteActionsUiAvailable()).toBe(true)
    setAosSnapshot(null)
  })
})

describe('postServiceAction', () => {
  it('envia POST a /api/services/:id/action sin credenciales de navegador', async () => {
    const originalFetch = globalThis.fetch
    let capturedUrl = ''
    let capturedInit: RequestInit | undefined
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url)
      capturedInit = init
      return {
        ok: true,
        status: 200,
        json: async () => ({ status: 'OK', service: 'fake-svc', op: 'restart' }),
      } as Response
    }) as typeof fetch

    try {
      const res = await postServiceAction('fake-svc', 'restart')
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.service).toBe('fake-svc')
      expect(res.op).toBe('restart')
      expect(capturedUrl).toBe('/api/services/fake-svc/action')
      expect(capturedInit?.method).toBe('POST')
      const headers = capturedInit?.headers as Record<string, string>
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers['Authorization']).toBeUndefined()
      expect(JSON.parse(capturedInit?.body as string)).toEqual({ op: 'restart' })
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('mapea un rechazo del backend sin inventar un éxito', async () => {
    const originalFetch = globalThis.fetch
    let capturedInit: RequestInit | undefined
    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedInit = init
      return {
        ok: false,
        status: 401,
        json: async () => ({ status: 'UNAUTHORIZED', reason: 'Auth required' }),
      } as Response
    }) as typeof fetch

    try {
      const res = await postServiceAction('fake-svc', 'start')
      expect(res.ok).toBe(false)
      expect(res.status).toBe(401)
      expect(res.reason).toBe('Auth required')
      const headers = capturedInit?.headers as Record<string, string>
      expect(headers['Authorization']).toBeUndefined()
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
