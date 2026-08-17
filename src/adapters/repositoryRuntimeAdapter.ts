// Adapter: unica frontera hacia el backend local de repository runtime
// (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY). Solo lectura — Git y CBM
// se leen server-side (server/server.mjs); este modulo solo hace fetch +
// normaliza a DataState<T>, igual patron que aosAdapter.ts.

import type { DataState, RepositoryRuntimeState } from '../contracts/types'

interface RawRuntimeBatchResponse {
  status: 'READY' | 'DEGRADED' | 'UNAVAILABLE'
  reason?: string
  observedAt?: string
  repositories?: RepositoryRuntimeState[]
}

interface RawRuntimeSingleResponse {
  status: 'READY' | 'ERROR' | 'UNAVAILABLE'
  reason?: string
  repository?: RepositoryRuntimeState
}

/** GET /api/repositories/runtime — usado por el refresh operacional (Repositories view). */
export async function fetchRepositoriesRuntimeFromApi(): Promise<RepositoryRuntimeState[] | null> {
  const res = await fetch('/api/repositories/runtime')
  if (!res.ok && res.status !== 503) return null
  const payload: RawRuntimeBatchResponse = await res.json()
  if (payload.status === 'UNAVAILABLE' || !Array.isArray(payload.repositories)) return null
  return payload.repositories
}

/**
 * GET /api/repositories/:id/runtime — prueba en vivo de UN repositorio
 * (drawer open, Seccion 25). NUNCA usa la cache de lote del backend.
 * `id` debe ser el censusId — id desconocido -> null (nunca crashea).
 */
export async function fetchRepositoryRuntimeFromApi(censusId: string): Promise<RepositoryRuntimeState | null> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(censusId)}/runtime`)
  if (res.status === 404) return null
  const payload: RawRuntimeSingleResponse = await res.json()
  return payload.repository ?? null
}

let currentRuntime: RepositoryRuntimeState[] | null | undefined

export function setRepositoriesRuntimeSnapshot(list: RepositoryRuntimeState[] | null | undefined): void {
  currentRuntime = list
}

export function getRepositoriesRuntime(): DataState<RepositoryRuntimeState[]> {
  if (!currentRuntime) {
    return { status: 'UNAVAILABLE', reason: 'Repository runtime no disponible (backend local o Knowledge caido).' }
  }
  if (currentRuntime.length === 0) return { status: 'EMPTY' }
  return { status: 'READY', data: currentRuntime }
}

/** Runtime de un repositorio concreto ya cargado en el lote (sin fetch). */
export function getRepositoryRuntimeById(censusId: string): RepositoryRuntimeState | null {
  return currentRuntime?.find((r) => r.repositoryId === censusId) ?? null
}
