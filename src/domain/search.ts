// Global search — Seccion 17/18/19 (COMMAND_CENTER_ENTITY_NAVIGATION_AND_SEARCH).
// Funciones puras: sin React, sin fetch. Opera sobre datos ya cargados
// (contratos UI existentes + EntityRef de Knowledge), nunca dispara un
// rebuild/fetch. Ranking deterministico, sin librerias de fuzzy-search.

import type { EntityRef, SearchResult, SourceSystem } from '../contracts/types'

interface SearchableSource {
  id: string
  entityType: string
  label: string
  secondary: string | null
  source: SourceSystem
}

/**
 * Construye el indice de busqueda a partir de los datos ya cargados
 * (Products/Repositories/Services tipados + entidades Knowledge restantes).
 * `knowledgeEntities` puede incluir products/repositories/services de nuevo
 * (Knowledge los modela tambien) — se deduplica por id, priorizando el
 * contrato tipado (mas secondary util) sobre el EntityRef generico.
 */
export function buildSearchIndex(sources: {
  products: { id: string; name: string; businessUnitLabel: string | null }[]
  repositories: { id: string; name: string; portfolioStatus: string }[]
  services: { id: string; name: string; serviceStatus: string }[]
  knowledgeEntities: EntityRef[]
}): SearchResult[] {
  const seen = new Set<string>()
  const index: SearchableSource[] = []

  for (const p of sources.products) {
    index.push({ id: p.id, entityType: 'Product', label: p.name, secondary: p.businessUnitLabel, source: 'knowledge' })
    seen.add(p.id)
  }
  for (const r of sources.repositories) {
    index.push({ id: r.id, entityType: 'Repository', label: r.name, secondary: r.portfolioStatus, source: 'knowledge' })
    seen.add(r.id)
  }
  for (const s of sources.services) {
    index.push({ id: s.id, entityType: 'Service', label: s.name, secondary: s.serviceStatus, source: 'aos' })
    seen.add(s.id)
  }
  for (const e of sources.knowledgeEntities) {
    if (seen.has(e.id) || !e.found) continue
    index.push({ id: e.id, entityType: e.type, label: e.label, secondary: null, source: e.source })
    seen.add(e.id)
  }

  return index.map((entry) => ({ ...entry, score: 0 }))
}

type MatchTier = 'exact' | 'prefix' | 'substring' | 'id' | 'secondary' | 'none'

function matchTier(entry: SearchableSource, query: string): MatchTier {
  const q = query.toLowerCase()
  const label = entry.label.toLowerCase()
  const id = entry.id.toLowerCase()
  const secondary = entry.secondary?.toLowerCase() ?? ''

  if (label === q) return 'exact'
  if (label.startsWith(q)) return 'prefix'
  if (label.includes(q)) return 'substring'
  if (id.includes(q)) return 'id'
  if (secondary.includes(q)) return 'secondary'
  return 'none'
}

const TIER_SCORE: Record<MatchTier, number> = {
  exact: 100,
  prefix: 80,
  substring: 60,
  id: 40,
  secondary: 20,
  none: 0,
}

/**
 * Ranking deterministico (Seccion 19): exact > prefix > substring > id >
 * secondary. Sin embeddings, sin fuzzy matching. query vacia → [].
 */
export function rankSearch(index: SearchResult[], query: string, limit = 20): SearchResult[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  return index
    .map((entry) => ({ entry, tier: matchTier(entry, trimmed) }))
    .filter(({ tier }) => tier !== 'none')
    .map(({ entry, tier }) => ({ ...entry, score: TIER_SCORE[tier] }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit)
}
