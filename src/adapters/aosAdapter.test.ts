import { describe, expect, it } from 'vitest'
import { getAosRuntimeStatus, getAosSnapshotAge } from './aosAdapter'

// Tests de integracion contra el snapshot real generado por `npm run sync:aos`
// (ver scripts/sync-aos-status.mjs). AOS Runtime v2 no tiene API estable — el estado
// exacto de los servicios varia segun el entorno, asi que se verifica la forma del
// contrato (DataState valido) en vez de valores puntuales.

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
      }
    }
  })

  it('getAosSnapshotAge returns an ISO-parseable timestamp when a snapshot exists', () => {
    const age = getAosSnapshotAge()
    if (age === null) return
    expect(Number.isNaN(new Date(age).getTime())).toBe(false)
  })
})
