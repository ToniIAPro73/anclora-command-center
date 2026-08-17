// Adapter: unica frontera entre el contrato machine-readable de AOS y los contratos UI.
//
// Desde AOS_OPERATIONAL_INTERFACE (2026-08-17): AOS Runtime expone
// `aos status --json` (schemaVersion 1.0). El snapshot (src/generated/, generado por
// scripts/sync-aos-status.mjs) contiene el contrato estructurado; este adapter lo
// mapea a la forma UI (AosServiceRuntimeSummary). Ya NO existe parsing de salida
// humana del CLI (HUMAN_CLI_PARSER=0).
//
// Solo lectura: no expone ninguna operacion de escritura (up/down/restart).
// Ver Seccion 9 de COMMAND_CENTER_REBUILD y AOS_OPERATIONAL_INTERFACE.

import aosSnapshot from '../generated/aos-status-snapshot.json'
import type { AosServiceRuntimeSummary, DataState } from '../contracts/types'

interface RawAosService {
  id: string
  status: string
  health: string
  pid: number | null
  managed: 'aos' | 'external' | null
  port: number | null
  bindHost: string | null
  localUrl: string | null
  publicUrl: string | null
}

interface RawAosSnapshot {
  generatedAt: string
  status: 'READY' | 'ERROR' | 'UNAVAILABLE'
  reason: string | null
  schemaVersion: string | null
  services: RawAosService[]
}

const raw = aosSnapshot as unknown as RawAosSnapshot

// Versiones del contrato AOS que este adapter sabe consumir.
const SUPPORTED_SCHEMA_VERSIONS = ['1.0']

function toUiService(svc: RawAosService): AosServiceRuntimeSummary {
  return {
    service: svc.id,
    port: svc.port,
    processState: svc.status,
    health: svc.health,
    pid: svc.pid,
    managed: svc.managed,
    localUrl: svc.localUrl,
    publicUrl: svc.publicUrl,
  }
}

export function getAosRuntimeStatus(): DataState<AosServiceRuntimeSummary[]> {
  if (!raw) {
    return { status: 'UNAVAILABLE', reason: 'Snapshot de AOS no disponible (sin sincronizar)' }
  }
  if (raw.status === 'UNAVAILABLE') {
    return { status: 'UNAVAILABLE', reason: raw.reason ?? 'AOS CLI no disponible en este entorno' }
  }
  if (raw.status === 'ERROR') {
    return { status: 'ERROR', message: raw.reason ?? 'Fallo al consultar aos status --json' }
  }
  if (raw.schemaVersion !== null && !SUPPORTED_SCHEMA_VERSIONS.includes(raw.schemaVersion)) {
    return {
      status: 'ERROR',
      message: `Schema AOS no soportado: ${raw.schemaVersion} (soportados: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')})`,
    }
  }
  if (!Array.isArray(raw.services)) {
    return { status: 'ERROR', message: 'Snapshot de AOS malformado: `services` no es un array' }
  }
  if (raw.services.length === 0) {
    return { status: 'EMPTY' }
  }
  return { status: 'READY', data: raw.services.map(toUiService) }
}

export function getAosSnapshotAge(): string | null {
  return raw?.generatedAt ?? null
}

export function getAosSchemaVersion(): string | null {
  return raw?.schemaVersion ?? null
}