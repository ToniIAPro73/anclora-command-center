import { useEffect, useState } from 'react'
import './App.css'
import { OperationalView } from './modules/operational/OperationalView'
import { EntityDrawer } from './modules/operational/EntityDrawer'
import { GlobalSearch } from './modules/operational/GlobalSearch'
import { useOperationalData } from './api/useOperationalData'
import { DashboardShell } from './shell/DashboardShell'
import type {
  DashboardLanguage,
  DashboardSection,
  DashboardTheme,
} from './shell/dashboard-shell.types'

const ENTITY_QUERY_PARAM = 'entity'

function readEntityFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(ENTITY_QUERY_PARAM)
}

// V1 limitation (Seccion 31): solo la entidad activa (tope de la pila) se
// refleja en la URL para deep-linking al recargar. La pila de "Back" dentro
// del drawer vive solo en memoria — no hay historial multi-nivel en la URL.
function writeEntityToUrl(id: string | null): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (id) url.searchParams.set(ENTITY_QUERY_PARAM, id)
  else url.searchParams.delete(ENTITY_QUERY_PARAM)
  window.history.replaceState(window.history.state, '', url)
}

const shellMessages = {
  es: {
    backToGroup: 'VOLVER A ANCLORA GROUP',
    brandLine: 'Interfaz operacional sobre AOS + Anclora Knowledge + AKG',
    topbarThemeAria: 'Selector de tema',
    topbarLanguageAria: 'Selector de idioma',
    searchLabel: 'Buscar',
    moduleNavigationAria: 'Navegación interna del dashboard',
    themeDark: 'Tema oscuro',
    themeLight: 'Tema claro',
    themeSystem: 'Tema del sistema',
    overviewLabel: 'Overview',
    productsLabel: 'Products',
    repositoriesLabel: 'Repositories',
    servicesLabel: 'Services',
    knowledgeLabel: 'Knowledge',
  },
  en: {
    backToGroup: 'BACK TO ANCLORA GROUP',
    brandLine: 'Operational interface over AOS + Anclora Knowledge + AKG',
    topbarThemeAria: 'Theme switcher',
    topbarLanguageAria: 'Language switcher',
    searchLabel: 'Search',
    moduleNavigationAria: 'Dashboard internal navigation',
    themeDark: 'Dark theme',
    themeLight: 'Light theme',
    themeSystem: 'System theme',
    overviewLabel: 'Overview',
    productsLabel: 'Products',
    repositoriesLabel: 'Repositories',
    servicesLabel: 'Services',
    knowledgeLabel: 'Knowledge',
  },
  de: {
    backToGroup: 'ZURÜCK ZU ANCLORA GROUP',
    brandLine: 'Operative Schnittstelle über AOS + Anclora Knowledge + AKG',
    topbarThemeAria: 'Themenauswahl',
    topbarLanguageAria: 'Sprachauswahl',
    searchLabel: 'Suche',
    moduleNavigationAria: 'Interne Dashboard-Navigation',
    themeDark: 'Dunkles Thema',
    themeLight: 'Helles Thema',
    themeSystem: 'Systemthema',
    overviewLabel: 'Overview',
    productsLabel: 'Produkte',
    repositoriesLabel: 'Repositories',
    servicesLabel: 'Dienste',
    knowledgeLabel: 'Knowledge',
  },
} as const

const SECTION_PATHS: Record<DashboardSection, string> = {
  overview: '/',
  products: '/products',
  repositories: '/repositories',
  services: '/services',
  knowledge: '/knowledge',
}

function resolveSection(pathname: string): DashboardSection {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const match = (Object.entries(SECTION_PATHS) as [DashboardSection, string][]).find(
    ([, path]) => path === normalizedPath,
  )
  return match ? match[0] : 'overview'
}

function App() {
  const [theme, setTheme] = useState<DashboardTheme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-command-center-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })
  const [language, setLanguage] = useState<DashboardLanguage>('es')
  const [section, setSection] = useState<DashboardSection>(() => {
    if (typeof window === 'undefined') return 'overview'
    return resolveSection(window.location.pathname)
  })
  const [entityStack, setEntityStack] = useState<string[]>(() => {
    const fromUrl = readEntityFromUrl()
    return fromUrl ? [fromUrl] : []
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const operational = useOperationalData()

  const activeEntity = entityStack.length > 0 ? entityStack[entityStack.length - 1] : null

  useEffect(() => {
    writeEntityToUrl(activeEntity)
  }, [activeEntity])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function openEntity(id: string) {
    setEntityStack((stack) => (stack[stack.length - 1] === id ? stack : [...stack, id]))
  }
  function closeEntity() {
    setEntityStack([])
  }
  function backEntity() {
    setEntityStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack))
  }

  useEffect(() => {
    const root = document.documentElement
    const resolveTheme = () =>
      theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : theme

    root.dataset.theme = resolveTheme()
    window.localStorage.setItem('anclora-command-center-theme', theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      root.dataset.theme = media.matches ? 'light' : 'dark'
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onPopState = () => {
      setSection(resolveSection(window.location.pathname))
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const t = shellMessages[language]
  const navItems = [
    { id: 'overview' as const, href: SECTION_PATHS.overview, label: t.overviewLabel },
    { id: 'products' as const, href: SECTION_PATHS.products, label: t.productsLabel },
    { id: 'repositories' as const, href: SECTION_PATHS.repositories, label: t.repositoriesLabel },
    { id: 'services' as const, href: SECTION_PATHS.services, label: t.servicesLabel },
    { id: 'knowledge' as const, href: SECTION_PATHS.knowledge, label: t.knowledgeLabel },
  ]

  const handleNavigate = (nextSection: DashboardSection, href: string) => {
    if (typeof window === 'undefined') return

    if (resolveSection(window.location.pathname) !== nextSection) {
      window.history.pushState({}, '', href)
    }

    setSection(nextSection)
  }

  return (
    <DashboardShell
      activeSection={section}
      backToGroupLabel={t.backToGroup}
      brandLine={t.brandLine}
      language={language}
      languageAriaLabel={t.topbarLanguageAria}
      navAriaLabel={t.moduleNavigationAria}
      navItems={navItems}
      onNavigate={handleNavigate}
      onOpenSearch={() => setSearchOpen(true)}
      searchLabel={t.searchLabel}
      setLanguage={setLanguage}
      setTheme={setTheme}
      theme={theme}
      themeAriaLabel={t.topbarThemeAria}
      themeLabels={{
        dark: t.themeDark,
        light: t.themeLight,
        system: t.themeSystem,
      }}
    >
      <OperationalView
        section={section}
        language={language}
        data={{
          loadingInitial: operational.loadingInitial,
          aosLastUpdatedAt: operational.aosLastUpdatedAt,
          aos: operational.aos,
          aosEndpoints: operational.aosEndpoints,
          knowledgeHealth: operational.knowledgeHealth,
          repositories: operational.repositories,
          repositoriesRuntime: operational.repositoriesRuntime,
          products: operational.products,
          services: operational.services,
          endpoints: operational.endpoints,
          endpointMatches: operational.endpointMatches,
          conflicts: operational.conflicts,
          issues: operational.issues,
          globalStatus: operational.globalStatus,
          onRefresh: () => void operational.refresh(),
          onOpenEntity: openEntity,
        }}
      />
      <EntityDrawer
        entityId={activeEntity}
        language={language}
        aos={operational.aos}
        endpointMatches={operational.endpointMatches}
        onClose={closeEntity}
        onBack={entityStack.length > 1 ? backEntity : undefined}
        onNavigate={openEntity}
      />
      {searchOpen && (
        <GlobalSearch
          onClose={() => setSearchOpen(false)}
          onSelect={openEntity}
          language={language}
          products={operational.products}
          repositories={operational.repositories}
          aos={operational.aos}
          endpoints={operational.endpoints}
          endpointMatches={operational.endpointMatches}
        />
      )}
    </DashboardShell>
  )
}

export default App
