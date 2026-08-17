// Adapter: unica frontera entre el contrato machine-readable de AOS y los contratos UI.
//
// COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT (2026-08-17): la fuente deja de ser un
// snapshot estatico (src/generated/) y pasa a ser el endpoint local `/api/status`
// servido por server/server.mjs, que ejecuta `aos status --json` EN VIVO sobre el
// runtime real (schemaVersion 1.0). HUMAN_CLI_PARSER=0 se mantiene: jamas se
// parsea salida humana del CLI.
//
// Misma estructura que knowledgeAdapter: MAPPER PURO (mapAosRuntimeStatus) +
// proxy async alimentado por el hook useOperationalData.
//
// Solo lectura: no expone ninguna operacion de escritura (up/down/restart).

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

/**
 * MAPPER PURO — dado el payload de /api/status (contrato AOS v1.0 en vivo),
 * devuelve el DataState UI. Sin side effects.
 */
export function mapAosRuntimeStatus(raw: RawAosSnapshot | null | undefined): DataState<AosServiceRuntimeSummary[]> {
  if (!raw) {
    return { status: 'UNAVAILABLE', reason: 'AOS no disponible (el backend local no pudo ejecutar aos status --json)' }
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
    return { status: 'ERROR', message: 'Contrato AOS malformado: `services` no es un array' }
  }
  if (raw.services.length === 0) {
    return { status: 'EMPTY' }
  }
  return { status: 'READY', data: raw.services.map(toUiService) }
}

// ================================================================ PROXY (async)
let currentAos: RawAosSnapshot | null | undefined

export function setAosSnapshot(raw: RawAosSnapshot | null | undefined): void {
  currentAos = raw
}

export function getAosSnapshot(): RawAosSnapshot | null | undefined {
  return currentAos
}

export function getAosRuntimeStatus(): DataState<AosServiceRuntimeSummary[]> {
  return mapAosRuntimeStatus(currentAos)
}

export function getAosSnapshotAge(): string | null {
  return currentAos?.generatedAt ?? null
}

export function getAosSchemaVersion(): string | null {
  return currentAos?.schemaVersion ?? null
}

/** Carga el estado AOS en vivo del backend local. Usado por el hook y tests. */
export async function fetchAosStatusFromApi(): Promise<RawAosSnapshot | null> {
  const res = await fetch('/api/status')
  if (!res.ok) return null
  const payload = await res.json()
  if (payload == null || typeof payload !== 'object') return null
  return payload as RawAosSnapshot
}