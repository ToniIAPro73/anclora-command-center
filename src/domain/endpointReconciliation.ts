// Endpoint reconciliation — COMMAND_CENTER_ENDPOINT_CROSS_NAVIGATION.
// Pure, deterministic, no React, no fetch. Reconciles the AOS live endpoint
// list (runtime truth) against Knowledge Endpoint entities (semantic
// identity). Never fuzzy: exact domain first, then exact unique service
// relation. Anything else stays UNMATCHED/AMBIGUOUS — never guessed.

import type {
  AosEndpointSummary,
  EndpointMatch,
  EndpointMatchMethod,
  EndpointMatchResult,
  EndpointStatusClass,
} from '../contracts/types'

export interface KnowledgeEndpointCandidate {
  id: string
  host: string | null
  appKey: string | null
}

/** Normaliza solo sintaxis segura (Seccion 7): minuscula, trim, sin scheme, sin slash final. Nunca colapsa subdominios ni asume www. */
export function normalizeDomain(raw: string | null | undefined): string | null {
  if (!raw) return null
  let v = raw.trim().toLowerCase()
  if (!v) return null
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
  v = v.replace(/\/+$/, '')
  return v || null
}

/** Detecta multiples entidades Knowledge Endpoint con el mismo dominio normalizado — data-quality gap, nunca se elige una en silencio. */
export function detectDuplicateKnowledgeDomains(
  knowledgeEndpoints: KnowledgeEndpointCandidate[],
): { domain: string; ids: string[] }[] {
  const byDomain = new Map<string, string[]>()
  for (const k of knowledgeEndpoints) {
    const d = normalizeDomain(k.host)
    if (!d) continue
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d)!.push(k.id)
  }
  return [...byDomain.entries()].filter(([, ids]) => ids.length > 1).map(([domain, ids]) => ({ domain, ids }))
}

/**
 * Reconcilia cada endpoint AOS con Knowledge. Precedencia (Seccion 6):
 *   A. dominio exacto normalizado, unico            -> MATCHED (exact-domain)
 *   B. relacion de servicio exacta y unica           -> MATCHED (unique-service)
 *   C. multiples candidatos en A o B                 -> AMBIGUOUS
 *   D. sin dominio ni servicio (not_configured puro) -> NOT_APPLICABLE
 *   E. cualquier otro caso                           -> UNMATCHED
 * Nunca fuzzy string match, nunca adivina por nombre de producto/repo.
 */
export function reconcileEndpoints(
  aosEndpoints: AosEndpointSummary[],
  knowledgeEndpoints: KnowledgeEndpointCandidate[],
): EndpointMatch[] {
  const byDomain = new Map<string, KnowledgeEndpointCandidate[]>()
  const byAppKey = new Map<string, KnowledgeEndpointCandidate[]>()
  for (const k of knowledgeEndpoints) {
    const d = normalizeDomain(k.host)
    if (d) {
      if (!byDomain.has(d)) byDomain.set(d, [])
      byDomain.get(d)!.push(k)
    }
    if (k.appKey) {
      if (!byAppKey.has(k.appKey)) byAppKey.set(k.appKey, [])
      byAppKey.get(k.appKey)!.push(k)
    }
  }

  return aosEndpoints.map((aos, index) => {
    const domain = normalizeDomain(aos.domain)
    const fallbackId = `aos-endpoint:${domain ?? aos.service ?? `unconfigured-${index}`}`

    const build = (
      result: EndpointMatchResult,
      method: EndpointMatchMethod,
      candidates: KnowledgeEndpointCandidate[],
      evidence: string,
    ): EndpointMatch => ({
      id: result === 'MATCHED' ? candidates[0].id : fallbackId,
      aos,
      knowledgeId: result === 'MATCHED' ? candidates[0].id : null,
      candidateIds: candidates.map((c) => c.id),
      result,
      method,
      evidence,
    })

    if (domain) {
      const candidates = byDomain.get(domain) ?? []
      if (candidates.length === 1) return build('MATCHED', 'exact-domain', candidates, `Matched by exact domain: ${domain}`)
      if (candidates.length > 1) {
        return build('AMBIGUOUS', 'exact-domain', candidates, `${candidates.length} Knowledge endpoints share domain ${domain}`)
      }
    }

    if (aos.service) {
      const candidates = byAppKey.get(aos.service) ?? []
      if (candidates.length === 1) return build('MATCHED', 'unique-service', candidates, `Matched by unique service relation: service=${aos.service}`)
      if (candidates.length > 1) {
        return build('AMBIGUOUS', 'unique-service', candidates, `${candidates.length} Knowledge endpoints share service relation ${aos.service}`)
      }
    }

    if (!domain && !aos.service) {
      return build('NOT_APPLICABLE', 'none', [], 'No domain or service identity available from AOS (local-only / not configured)')
    }
    return build('UNMATCHED', 'none', [], 'No deterministic Knowledge match found')
  })
}

/** Knowledge Endpoint entities sin ninguna contraparte AOS en vivo (Seccion 28). */
export function knowledgeOnlyEndpoints(
  matches: EndpointMatch[],
  knowledgeEndpoints: KnowledgeEndpointCandidate[],
): KnowledgeEndpointCandidate[] {
  const matched = new Set(matches.flatMap((m) => m.candidateIds))
  return knowledgeEndpoints.filter((k) => !matched.has(k.id))
}

/** Seccion 24: mapeo de estado AOS -> clasificacion generica, sin inventar "required". */
export function classifyEndpointStatus(aos: AosEndpointSummary): EndpointStatusClass {
  if (!aos.configured || aos.status === 'not_configured') return 'local-only'
  if (aos.status === 'auth_protected') return 'protected'
  if (aos.status === 'exposed' && aos.authRequired === false && aos.backendReachable === true) return 'app-authenticated'
  if (aos.status === 'exposed') return 'exposed'
  if (aos.status === 'unreachable') return 'unreachable'
  if (aos.status === 'configured') return 'configured'
  return 'unknown'
}

/**
 * Entradas de busqueda para endpoints (Seccion 21/22): una por cada AOS
 * endpoint (MATCHED usa el id Knowledge, el resto un id operacional
 * sintetico) mas los Knowledge Endpoint sin contraparte AOS — sin duplicados.
 * NOT_APPLICABLE (local-only puro, sin dominio/servicio) se omite: no aporta
 * nada buscable.
 */
export function buildEndpointSearchEntries(
  matches: EndpointMatch[],
  knowledgeEndpoints: KnowledgeEndpointCandidate[],
): { id: string; entityType: 'Endpoint'; label: string; secondary: string | null; source: 'aos' | 'knowledge' }[] {
  const entries: { id: string; entityType: 'Endpoint'; label: string; secondary: string | null; source: 'aos' | 'knowledge' }[] = []
  for (const m of matches) {
    if (m.result === 'NOT_APPLICABLE') continue
    const label = m.aos.domain ?? m.aos.service ?? m.id
    const secondary = [m.aos.domain, classifyEndpointStatus(m.aos), m.aos.service].filter(Boolean).join(' · ') || null
    entries.push({ id: m.id, entityType: 'Endpoint', label, secondary, source: m.knowledgeId ? 'knowledge' : 'aos' })
  }
  for (const k of knowledgeOnlyEndpoints(matches, knowledgeEndpoints)) {
    entries.push({ id: k.id, entityType: 'Endpoint', label: k.host ?? k.id, secondary: 'Semantic only', source: 'knowledge' })
  }
  return entries
}

export interface DataQualityReport {
  totalAosEndpoints: number
  matched: number
  unmatched: number
  ambiguous: number
  notApplicable: number
  knowledgeOnly: number
  duplicateDomains: { domain: string; ids: string[] }[]
}

export function buildDataQualityReport(
  matches: EndpointMatch[],
  knowledgeEndpoints: KnowledgeEndpointCandidate[],
): DataQualityReport {
  return {
    totalAosEndpoints: matches.length,
    matched: matches.filter((m) => m.result === 'MATCHED').length,
    unmatched: matches.filter((m) => m.result === 'UNMATCHED').length,
    ambiguous: matches.filter((m) => m.result === 'AMBIGUOUS').length,
    notApplicable: matches.filter((m) => m.result === 'NOT_APPLICABLE').length,
    knowledgeOnly: knowledgeOnlyEndpoints(matches, knowledgeEndpoints).length,
    duplicateDomains: detectDuplicateKnowledgeDomains(knowledgeEndpoints),
  }
}
