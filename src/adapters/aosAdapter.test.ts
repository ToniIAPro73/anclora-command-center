import { describe, expect, it, vi } from 'vitest'
import {
  getAosRuntimeStatus,
  getAosSnapshotAge,
  getAosSchemaVersion,
} from './aosAdapter'

// Tests de integracion contra el snapshot REAL generado por `npm run sync:aos`
// (scripts/sync-aos-status.mjs). Desde AOS_OPERATIONAL_INTERFACE el snapshot
// contiene el contrato machine-readable de `aos status --json` (schemaVersion
// 1.0); el estado exacto de los servicios varia segun el entorno, asi que se
// verifica la forma del contrato (DataState + campos del vocabulario cerrado)
// en vez de valores puntuales.

describe('aosAdapter', () => {
  it('getAosRuntimeStatus returns a valid DataState variant', () => {
    const state = getAosRuntimeStatus()
    expect(['READY', 'EMPTY', 'ERROR', 'UNAVAILABLE']).toContain(state.status)

    if (state.status === 'READY') {
      expect(state.data.length).toBeGreaterThan(0)
      for (const svc of state.data) {
        expect(typeof svc.service).toBe('string')
        expect(typeof svc.processState).toBe('string')
        expect(typeof svc.health).toBe('string')
        // vocabulario cerrado del contrato AOS v1.0
        expect(['running', 'stopped', 'starting', 'stale_pid', 'unknown']).toContain(
          svc.processState,
        )
        expect(['ok', 'failed', 'not_configured', 'unknown']).toContain(svc.health)
        // nullability: pid/urls pueden ser null pero nunca strings falsos
        if (svc.pid !== null) expect(typeof svc.pid).toBe('number')
        if (svc.localUrl !== null) expect(typeof svc.localUrl).toBe('string')
        if (svc.publicUrl !== null) expect(typeof svc.publicUrl).toBe('string')
        expect(['aos', 'external', null]).toContain(svc.managed)
      }
    }
  })

  it('snapshot exposes a supported schema version when READY', () => {
    const schemaVersion = getAosSchemaVersion()
    const state = getAosRuntimeStatus()
    if (state.status === 'READY') {
      expect(schemaVersion).toBe('1.0')
    } else {
      // UNAVAILABLE/ERROR pueden no tener version (snapshot vacio)
      expect([null, '1.0']).toContain(schemaVersion)
    }
  })

  it('getAosSnapshotAge returns an ISO-parseable timestamp when a snapshot exists', () => {
    const age = getAosSnapshotAge()
    if (age === null) return
    expect(Number.isNaN(new Date(age).getTime())).toBe(false)
  })

  it('returns ERROR instead of throwing when a READY snapshot has a malformed `services` field', async () => {
    vi.resetModules()
    vi.doMock('../generated/aos-status-snapshot.json', () => ({
      default: {
        generatedAt: '2026-08-17T00:00:00.000Z',
        status: 'READY',
        reason: null,
        schemaVersion: '1.0',
        services: null,
      },
    }))
    const { getAosRuntimeStatus: getStatusWithMalformedSnapshot } = await import('./aosAdapter')
    const state = getStatusWithMalformedSnapshot()
    expect(state.status).toBe('ERROR')
    vi.doUnmock('../generated/aos-status-snapshot.json')
    vi.resetModules()
  })
})