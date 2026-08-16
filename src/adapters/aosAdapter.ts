// Adapter: unica frontera entre el snapshot de `aos status` y los contratos UI.
//
// AOS Runtime v2 es un CLI de texto plano sin API HTTP (ver scripts/sync-aos-status.mjs).
// Este adapter es deliberadamente de solo lectura: no expone ninguna operacion de escritura
// (up/down/restart). Ver Seccion 9 de COMMAND_CENTER_REBUILD.

import aosSnapshot from '../generated/aos-status-snapshot.json'
import type { AosServiceRuntimeSummary, DataState } from '../contracts/types'

interface RawAosSnapshot {
  generatedAt: string
  status: 'READY' | 'ERROR' | 'UNAVAILABLE'
  reason: string | null
  services: AosServiceRuntimeSummary[]
}

const raw = aosSnapshot as unknown as RawAosSnapshot

export function getAosRuntimeStatus(): DataState<AosServiceRuntimeSummary[]> {
  if (!raw) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de AOS no disponible (sin sincronizar)' }
  }
  if (raw.status === 'UNAVAILABLE') {
    return { status: 'UNAVAILABLE', reason: raw.reason ?? 'AOS CLI no disponible en este entorno' }
  }
  if (raw.status === 'ERROR') {
    return { status: 'ERROR', message: raw.reason ?? 'Fallo al consultar aos status' }
  }
  if (raw.services.length === 0) {
    return { status: 'EMPTY' }
  }
  return { status: 'READY', data: raw.services }
}

export function getAosSnapshotAge(): string | null {
  return raw?.generatedAt ?? null
}
