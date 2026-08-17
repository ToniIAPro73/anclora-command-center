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
// COMMAND_CENTER_OPERATIONAL_CONSOLE_V1: expone ademas postServiceAction(),
// la UNICA operacion de escritura del adapter — start/stop/restart de un
// servicio AOS-managed via POST /api/services/:id/action. Validacion real
// (allowlist, self-stop, injection) vive en el backend (server/server.mjs);
// este adapter solo hace el fetch y mapea la respuesta.

import type { AosEndpointSummary, AosServiceRuntimeSummary, DataState } from '../contracts/types'

interface RawAosService {
  id: string
  status: string
  state?: string
  health: string
  pid: number | null
  managed: 'aos' | 'external' | null
  port: number | null
  bindHost: string | null
  localUrl: string | null
  publicUrl: string | null
}

interface RawAosEndpoint {
  domain: string | null
  service: string | null
  configured: boolean
  authRequired: boolean
  reachable: boolean
  https: boolean
  authProtected: boolean
  backendReachable: boolean | null
  status: string
}

interface RawAosSnapshot {
  generatedAt: string
  status: 'READY' | 'ERROR' | 'UNAVAILABLE'
  reason: string | null
  schemaVersion: string | null
  services: RawAosService[]
  endpoints?: RawAosEndpoint[]
}

// Versiones del contrato AOS que este adapter sabe consumir.
// 1.0 = vocabulario de proceso/health; 1.1 = + service.state + endpoints[].
const SUPPORTED_SCHEMA_VERSIONS = ['1.0', '1.1']

function toUiService(svc: RawAosService): AosServiceRuntimeSummary {
  return {
    service: svc.id,
    port: svc.port,
    processState: svc.status,
    state: svc.state ?? svc.status,
    health: svc.health,
    pid: svc.pid,
    managed: svc.managed,
    localUrl: svc.localUrl,
    publicUrl: svc.publicUrl,
  }
}

function toUiEndpoint(ep: RawAosEndpoint): AosEndpointSummary {
  return {
    domain: ep.domain ?? null,
    service: ep.service ?? null,
    configured: Boolean(ep.configured),
    authRequired: Boolean(ep.authRequired),
    reachable: Boolean(ep.reachable),
    https: Boolean(ep.https),
    authProtected: Boolean(ep.authProtected),
    backendReachable: ep.backendReachable ?? null,
    status: ep.status,
  }
}

/**
 * MAPPER PURO — dado el payload de /api/status (contrato AOS v1.x en vivo),
 * devuelve el DataState UI (servicios runtime + endpoints reconciliados).
 * Sin side effects.
 */
export function mapAosRuntimeStatus(raw: RawAosSnapshot | null | undefined): {
  services: DataState<AosServiceRuntimeSummary[]>
  endpoints: DataState<AosEndpointSummary[]>
} {
  if (!raw) {
    const unavailable: DataState<never> = { status: 'UNAVAILABLE', reason: 'AOS no disponible (el backend local no pudo ejecutar aos status --json)' }
    return { services: unavailable, endpoints: unavailable }
  }
  if (raw.status === 'UNAVAILABLE') {
    const unavailable: DataState<never> = { status: 'UNAVAILABLE', reason: raw.reason ?? 'AOS CLI no disponible en este entorno' }
    return { services: unavailable, endpoints: unavailable }
  }
  if (raw.status === 'ERROR') {
    const error: DataState<never> = { status: 'ERROR', message: raw.reason ?? 'Fallo al consultar aos status --json' }
    return { services: error, endpoints: error }
  }
  if (raw.schemaVersion !== null && !SUPPORTED_SCHEMA_VERSIONS.includes(raw.schemaVersion)) {
    const error: DataState<never> = {
      status: 'ERROR',
      message: `Schema AOS no soportado: ${raw.schemaVersion} (soportados: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')})`,
    }
    return { services: error, endpoints: error }
  }
  if (!Array.isArray(raw.services)) {
    const error: DataState<never> = { status: 'ERROR', message: 'Contrato AOS malformado: `services` no es un array' }
    return { services: error, endpoints: error }
  }
  if (raw.services.length === 0) {
    return { services: { status: 'EMPTY' }, endpoints: { status: 'EMPTY' } }
  }
  // endpoints es aditivo en 1.1: tolerar ausencia (contrato 1.0) sin romper.
  const endpointsReady: DataState<AosEndpointSummary[]> = Array.isArray(raw.endpoints)
    ? { status: 'READY', data: raw.endpoints.map(toUiEndpoint) }
    : { status: 'EMPTY' }
  return {
    services: { status: 'READY', data: raw.services.map(toUiService) },
    endpoints: endpointsReady,
  }
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
  return mapAosRuntimeStatus(currentAos).services
}

export function getAosEndpointsStatus(): DataState<AosEndpointSummary[]> {
  return mapAosRuntimeStatus(currentAos).endpoints
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

// ================================================================ ACTIONS (write)
export type ServiceActionOp = 'start' | 'stop' | 'restart'

export interface ServiceActionResult {
  ok: boolean
  status: number
  service: string
  op: ServiceActionOp
  reason?: string
}

/**
 * Unica operacion de escritura: POST /api/services/:id/action { op }.
 * El backend valida allowlist/managed/self-stop — este adapter solo
 * traduce la respuesta HTTP a un resultado tipado, nunca asume exito.
 */
export async function postServiceAction(serviceId: string, op: ServiceActionOp): Promise<ServiceActionResult> {
  const res = await fetch(`/api/services/${encodeURIComponent(serviceId)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op }),
  })
  let reason: string | undefined
  try {
    const payload = await res.json()
    reason = payload?.reason
  } catch {
    /* respuesta no-JSON: se mantiene reason undefined */
  }
  return { ok: res.ok, status: res.status, service: serviceId, op, reason }
}