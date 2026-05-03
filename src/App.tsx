import { useEffect, useState } from 'react'
import datasetData from './generated/dataset.json'
import vaultData from './generated/vault-data.json'
import './App.css'
import { ExecutiveView, type ExecutiveDashboardData } from './modules/executive/ExecutiveView'
import { RealEstateView, type RealEstateDataset } from './modules/real-estate/RealEstateView'
import { DashboardShell } from './shell/DashboardShell'
import type {
  DashboardLanguage,
  DashboardSection,
  DashboardTheme,
} from './shell/dashboard-shell.types'

const executiveData = vaultData as ExecutiveDashboardData
const realEstateData = datasetData as RealEstateDataset

const shellMessages = {
  es: {
    backToGroup: 'VOLVER A ANCLORA GROUP',
    brandLine: 'Control operativo del ecosistema',
    topbarThemeAria: 'Selector de tema',
    topbarLanguageAria: 'Selector de idioma',
    moduleNavigationAria: 'Navegación interna del dashboard',
    themeDark: 'Tema oscuro',
    themeLight: 'Tema claro',
    themeSystem: 'Tema del sistema',
    executiveLabel: 'Executive',
    realEstateLabel: 'Real Estate',
  },
  en: {
    backToGroup: 'BACK TO ANCLORA GROUP',
    brandLine: 'Operational control for the ecosystem',
    topbarThemeAria: 'Theme switcher',
    topbarLanguageAria: 'Language switcher',
    moduleNavigationAria: 'Dashboard internal navigation',
    themeDark: 'Dark theme',
    themeLight: 'Light theme',
    themeSystem: 'System theme',
    executiveLabel: 'Executive',
    realEstateLabel: 'Real Estate',
  },
  de: {
    backToGroup: 'ZURÜCK ZU ANCLORA GROUP',
    brandLine: 'Operative Kontrolle des Ökosystems',
    topbarThemeAria: 'Themenauswahl',
    topbarLanguageAria: 'Sprachauswahl',
    moduleNavigationAria: 'Interne Dashboard-Navigation',
    themeDark: 'Dunkles Thema',
    themeLight: 'Helles Thema',
    themeSystem: 'Systemthema',
    executiveLabel: 'Executive',
    realEstateLabel: 'Real Estate',
  },
} as const

function resolveSection(pathname: string): DashboardSection {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  return normalizedPath === '/real-estate' ? 'real-estate' : 'executive'
}

function App() {
  const [theme, setTheme] = useState<DashboardTheme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const storedTheme = window.localStorage.getItem('anclora-command-center-theme')
    return storedTheme === 'light' || storedTheme === 'system' ? storedTheme : 'dark'
  })
  const [language, setLanguage] = useState<DashboardLanguage>('es')
  const [section, setSection] = useState<DashboardSection>(() => {
    if (typeof window === 'undefined') return 'executive'
    return resolveSection(window.location.pathname)
  })

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
    { id: 'executive' as const, href: '/', label: t.executiveLabel },
    { id: 'real-estate' as const, href: '/real-estate', label: t.realEstateLabel },
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
      {section === 'real-estate' ? (
        <RealEstateView data={realEstateData} language={language} />
      ) : (
        <ExecutiveView data={executiveData} language={language} />
      )}
    </DashboardShell>
  )
}

export default App
