export type DashboardTheme = 'dark' | 'light' | 'system'
export type DashboardLanguage = 'es' | 'en' | 'de'
export type DashboardSection = 'executive' | 'real-estate'

export type DashboardNavItem = {
  id: DashboardSection
  href: string
  label: string
}

export type DashboardShellProps = {
  activeSection: DashboardSection
  backToGroupLabel: string
  brandLine: string
  children: React.ReactNode
  language: DashboardLanguage
  languageAriaLabel: string
  navAriaLabel: string
  navItems: DashboardNavItem[]
  onNavigate: (section: DashboardSection, href: string) => void
  setLanguage: (language: DashboardLanguage) => void
  setTheme: (theme: DashboardTheme) => void
  theme: DashboardTheme
  themeAriaLabel: string
  themeLabels: Record<DashboardTheme, string>
}
