// useOperationalData — carga las fuentes operacionales reales del backend local
// (server/server.mjs) y alimenta los adapters (aosAdapter/knowledgeAdapter).
//
// COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT:
//   - /api/status    -> aos status --json EN VIVO (refresh manual / polling moderado)
//   - /api/knowledge -> knowledge-model.json derivado (cache backend por mtime)
//
// Estrategia de refresh (minima razonable):
//   - AOS status: al montar + manual refresh (boton) + poll suave cada 30s.
//   - Knowledge: al montar (cache backend por mtime; cambia muy poco).
//
// La UI distingue READY/EMPTY/STALE/ERROR/UNAVAILABLE via DataStateView:
// un fallo de fuente jamas se presenta como ecosistema vacio.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchAosStatusFromApi,
  getAosRuntimeStatus,
  setAosSnapshot,
} from '../adapters/aosAdapter'
import {
  fetchKnowledgeFromApi,
  getEndpoints,
  getProducts,
  getRepositories,
  getRelationshipsFor,
  getServices,
  getSystemHealth,
  setKnowledgeSnapshot,
} from '../adapters/knowledgeAdapter'
import type { DataState } from '../contracts/types'
import type {
  EndpointSummary,
  ProductSummary,
  RelationshipSummary,
  RepositorySummary,
  ServiceSummary,
  SystemHealth,
} from '../contracts/types'

export interface OperationalDataState {
  loadingInitial: boolean
  aosLastUpdatedAt: Date | null
  aos: DataState<import('../contracts/types').AosServiceRuntimeSummary[]>
  knowledgeHealth: DataState<SystemHealth>
  repositories: DataState<RepositorySummary[]>
  products: DataState<ProductSummary[]>
  services: DataState<ServiceSummary[]>
  endpoints: DataState<EndpointSummary[]>
  relationshipsFor: (entityId: string) => RelationshipSummary[]
  refresh: (opts?: { forceKnowledge?: boolean }) => Promise<void>
}

const AOS_POLL_MS = 30_000

export function useOperationalData(): OperationalDataState {
  const [tick, setTick] = useState(0)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [aosLastUpdatedAt, setAosLastUpdatedAt] = useState<Date | null>(null)
  const knowledgeLoadedRef = useRef(false)

  const refresh = useCallback(async (opts?: { forceKnowledge?: boolean }) => {
    if (opts?.forceKnowledge || !knowledgeLoadedRef.current) {
      const k = await fetchKnowledgeFromApi()
      setKnowledgeSnapshot(k)
      knowledgeLoadedRef.current = true
    }
    const aos = await fetchAosStatusFromApi()
    setAosSnapshot(aos)
    setAosLastUpdatedAt(new Date())
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let alive = true

    const load = async () => {
      await refresh()
      if (alive) setLoadingInitial(false)
    }
    void load()

    const interval = setInterval(() => {
      if (alive) void refresh()
    }, AOS_POLL_MS)

    return () => {
      alive = false
      clearInterval(interval)
    }
  }, [refresh])

  void tick // fuerza re-render cuando el snapshot cambia

  return {
    loadingInitial,
    aosLastUpdatedAt,
    aos: getAosRuntimeStatus(),
    knowledgeHealth: getSystemHealth(),
    repositories: getRepositories(),
    products: getProducts(),
    services: getServices(),
    endpoints: getEndpoints(),
    relationshipsFor: getRelationshipsFor,
    refresh,
  }
}