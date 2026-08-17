// GlobalSearch — Ctrl+K command palette (COMMAND_CENTER_ENTITY_NAVIGATION_AND_SEARCH,
// Seccion 17-24, 33). Navigation/search ONLY — never exposes service actions,
// Git actions or shell commands (Seccion 21).
//
// DESIGN SYSTEM DECISION (Seccion 33): kept local. A grouped multi-type
// command palette wired to this app's specific entity model is not yet a
// proven pattern across >=2 Anclora apps — generalizing it now would be
// speculative. It reuses generic DS primitives only (ac-modal-backdrop for
// the overlay, ac-button, ac-status-badge, semantic tokens for the input) —
// zero new bespoke chrome beyond layout.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DashboardLanguage } from '../../shell/dashboard-shell.types'
import type {
  AosServiceRuntimeSummary,
  DataState,
  EndpointMatch,
  EndpointSummary,
  ProductSummary,
  RepositorySummary,
  SearchResult,
} from '../../contracts/types'
import { listKnowledgeEntities } from '../../adapters/knowledgeAdapter'
import { buildEndpointSearchEntries } from '../../domain/endpointReconciliation'
import { buildSearchIndex, rankSearch } from '../../domain/search'
import './global-search.css'

interface Copy {
  title: string
  placeholder: string
  noResults: string
  hint: string
}

const COPY: Record<DashboardLanguage, Copy> = {
  es: { title: 'Buscar', placeholder: 'Buscar productos, repositorios, servicios, Knowledge…', noResults: 'Sin resultados.', hint: 'Ctrl+K para abrir · Esc para cerrar' },
  en: { title: 'Search', placeholder: 'Search products, repositories, services, Knowledge…', noResults: 'No matching entities.', hint: 'Ctrl+K to open · Esc to close' },
  de: { title: 'Suche', placeholder: 'Produkte, Repositories, Dienste, Knowledge durchsuchen…', noResults: 'Keine Treffer.', hint: 'Strg+K zum Öffnen · Esc zum Schließen' },
}

// Montado solo cuando esta abierto (el padre controla open/close con
// `{searchOpen && <GlobalSearch .../>}`) — asi el estado local (query,
// activeIndex) arranca limpio en cada apertura sin setState en un effect.
export function GlobalSearch({
  onClose,
  onSelect,
  language,
  products,
  repositories,
  aos,
  endpoints,
  endpointMatches,
}: {
  onClose: () => void
  onSelect: (id: string) => void
  language: DashboardLanguage
  products: DataState<ProductSummary[]>
  repositories: DataState<RepositorySummary[]>
  aos: DataState<AosServiceRuntimeSummary[]>
  endpoints: DataState<EndpointSummary[]>
  endpointMatches: EndpointMatch[]
}) {
  const t = COPY[language]
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Degrada por fuente (Seccion 24/25): si Knowledge no esta READY/STALE,
  // Products/Repositories quedan fuera del indice pero Services (AOS, fuente
  // independiente) sigue funcionando — nunca se desactiva toda la busqueda
  // porque una fuente cayo.
  const index = useMemo(() => {
    const productList = products.status === 'READY' || products.status === 'STALE' ? products.data : []
    const repoList = repositories.status === 'READY' || repositories.status === 'STALE' ? repositories.data : []
    const serviceList =
      aos.status === 'READY' || aos.status === 'STALE'
        ? aos.data.map((s) => ({ id: `service:${s.service}`, name: s.service, serviceStatus: s.state }))
        : []
    const knowledgeEndpointList = endpoints.status === 'READY' || endpoints.status === 'STALE' ? endpoints.data : []
    const endpointEntries = buildEndpointSearchEntries(
      endpointMatches,
      knowledgeEndpointList.map((e) => ({ id: e.id, host: e.host, appKey: e.appKey })),
    )
    // Endpoint ya cubierto por buildEndpointSearchEntries — se excluye el
    // tipo generico 'Endpoint' de listKnowledgeEntities() para no duplicar
    // (Seccion 21: un endpoint MATCHED aparece una sola vez).
    return buildSearchIndex({
      products: productList.map((p) => ({ id: p.id, name: p.name, businessUnitLabel: p.businessUnitLabel })),
      repositories: repoList.map((r) => ({ id: r.id, name: r.name, portfolioStatus: r.portfolioStatus })),
      services: serviceList,
      endpoints: endpointEntries,
      knowledgeEntities: listKnowledgeEntities().filter((e) => e.type !== 'Endpoint'),
    })
  }, [products, repositories, aos, endpoints, endpointMatches])

  const results: SearchResult[] = useMemo(() => rankSearch(index, query), [index, query])

  const grouped: { type: string; items: SearchResult[] }[] = []
  for (const r of results) {
    const group = grouped.find((g) => g.type === r.entityType)
    if (group) group.items.push(r)
    else grouped.push({ type: r.entityType, items: [r] })
  }

  function activate(id: string) {
    onSelect(id)
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = results[activeIndex]
      if (target) activate(target.id)
    }
  }

  const activeId = results[activeIndex]?.id

  return (
    <div
      className="ac-modal-backdrop op-overlay op-search-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="op-search-panel" role="dialog" aria-modal="true" aria-label={t.title}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="global-search-listbox"
          aria-activedescendant={activeId ? `search-option-${activeId}` : undefined}
          aria-autocomplete="list"
          aria-label={t.title}
          className="op-search-input"
          placeholder={t.placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
        />
        <p className="op-search-hint">{t.hint}</p>
        {query.trim() && (
          <ul id="global-search-listbox" role="listbox" className="op-search-results" aria-label={t.title}>
            {results.length === 0 ? (
              <li className="op-search-empty" role="presentation">
                {t.noResults}
              </li>
            ) : (
              grouped.map((group) => (
                <li key={group.type} role="presentation" className="op-search-group">
                  <p className="op-search-group__label">{group.type}</p>
                  <ul role="presentation">
                    {group.items.map((item) => (
                      <li key={item.id} role="presentation">
                        <button
                          id={`search-option-${item.id}`}
                          role="option"
                          aria-selected={item.id === activeId}
                          type="button"
                          className={`op-search-result${item.id === activeId ? ' is-active' : ''}`}
                          onMouseEnter={() => setActiveIndex(results.findIndex((r) => r.id === item.id))}
                          onClick={() => activate(item.id)}
                        >
                          <span className="op-search-result__label">{item.label}</span>
                          {item.secondary && <span className="op-search-result__secondary">{item.secondary}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
