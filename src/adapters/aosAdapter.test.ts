import { describe, expect, it } from 'vitest'
import {
  mapAosRuntimeStatus,
  setAosSnapshot,
  getAosRuntimeStatus,
  getAosSchemaVersion,
  getAosSnapshotAge,
} from './aosAdapter'

// Tests del MAPPER PURO (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT):
// dado el payload del endpoint local /api/status (contrato AOS v1.0 en vivo),
// devuelve el DataState UI. Se verifica la FORMA del contrato (vocabulario
// cerrado + nullability) en vez de valores puntuales del entorno.

function rawStatus(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: new Date().toISOString(),
    status: 'READY',
    reason: null,
    schemaVersion: '1.0',
    services: [
      {
        id: 'filestudio',
        status: 'running',
        health: 'ok',
        pid: 1234,
        managed: 'aos',
        port: 3000,
        bindHost: '127.0.0.1',
        localUrl: 'http://127.0.0.1:3000',
        publicUrl: null,
      },
    ],
    ...overrides,
  }
}

describe('aosAdapter (mapper puro)', () => {
  it('contrato READY valido → READY con vocabulario cerrado', () => {
    const state = mapAosRuntimeStatus(rawStatus() as never)
    expect(state.status).toBe('READY')
    if (state.status !== 'READY') return
    expect(state.data.length).toBeGreaterThan(0)
    for (const svc of state.data) {
      expect(typeof svc.service).toBe('string')
      expect(['running', 'stopped', 'starting', 'stale_pid', 'unknown']).toContain(svc.processState)
      expect(['ok', 'failed', 'not_configured', 'unknown']).toContain(svc.health)
      if (svc.pid !== null) expect(typeof svc.pid).toBe('number')
      if (svc.localUrl !== null) expect(typeof svc.localUrl).toBe('string')
      if (svc.publicUrl !== null) expect(typeof svc.publicUrl).toBe('string')
      expect(['aos', 'external', null]).toContain(svc.managed)
    }
  })

  it('payload null → UNAVAILABLE', () => {
    expect(mapAosRuntimeStatus(null).status).toBe('UNAVAILABLE')
    expect(mapAosRuntimeStatus(undefined).status).toBe('UNAVAILABLE')
  })

  it('status UNAVAILABLE (aos CLI ausente) → UNAVAILABLE con reason', () => {
    const state = mapAosRuntimeStatus({ status: 'UNAVAILABLE', reason: 'aos CLI no encontrado', schemaVersion: null, services: [] } as never)
    expect(state.status).toBe('UNAVAILABLE')
    if (state.status === 'UNAVAILABLE') expect(state.reason).toContain('CLI')
  })

  it('status ERROR (aos CLI fallo) → ERROR con message', () => {
    const state = mapAosRuntimeStatus({ status: 'ERROR', reason: 'exit code 2', schemaVersion: null, services: [] } as never)
    expect(state.status).toBe('ERROR')
    if (state.status === 'ERROR') expect(state.message).toContain('exit code 2')
  })

  it('schemaVersion no soportado → ERROR (no leer contrato futuro como actual)', () => {
    const state = mapAosRuntimeStatus(rawStatus({ schemaVersion: '2.0' }) as never)
    expect(state.status).toBe('ERROR')
    if (state.status === 'ERROR') expect(state.message).toContain('2.0')
  })

  it('services malformado (null) → ERROR, no throw', () => {
    const state = mapAosRuntimeStatus(rawStatus({ services: null }) as never)
    expect(state.status).toBe('ERROR')
  })

  it('services vacio ([] real) → EMPTY, no UNAVAILABLE', () => {
    const state = mapAosRuntimeStatus(rawStatus({ services: [] }) as never)
    expect(state.status).toBe('EMPTY')
  })

  it('json no valido (no object) → ERROR (contrato malformado)', () => {
    // un payload que no es objeto no puede ser un contrato valido: el backend
    // solo envia JSON estructurado o null; algo no-objeto es malformado.
    expect(mapAosRuntimeStatus('not-json' as never).status).toBe('ERROR')
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
})