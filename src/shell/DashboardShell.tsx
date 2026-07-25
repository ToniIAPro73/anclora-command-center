import type { DashboardLanguage, DashboardShellProps, DashboardTheme } from './dashboard-shell.types'

const themeIcons: Record<DashboardTheme, () => React.ReactNode> = {
  dark: MoonIcon,
  light: SunIcon,
  system: ScreenIcon,
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.5 3.5a8 8 0 1 0 5 14.2A8.5 8.5 0 0 1 15.5 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16h-11A2.5 2.5 0 0 1 4 13.5v-7ZM9 20h6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function CommandCenterPlaceholderLogo() {
  return (
    // PLACEHOLDER marca — pendiente logo corporativo
    <svg
      className="topbar__brand-logo topbar__brand-mark"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logo provisional Anclora Command Center"
    >
      <circle cx="32" cy="32" r="27" fill="var(--card)" stroke="var(--brand-copper)" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="21" fill="var(--brand-inner)" stroke="var(--accent-border)" />
      <path
        d="M18 27c4-3.4 8-3.4 12 0s8 3.4 12 0 8-3.4 12 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
      <path
        d="M18 34c4-3.4 8-3.4 12 0s8 3.4 12 0 8-3.4 12 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
      <path
        d="M18 41c4-3.4 8-3.4 12 0s8 3.4 12 0 8-3.4 12 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
    </svg>
  )
}

function LanguageToggle({
  language,
  label,
  onChange,
}: {
  language: DashboardLanguage
  label: string
  onChange: (language: DashboardLanguage) => void
}) {
  return (
    <div className="topbar__toggle-group" aria-label={label}>
      {(['es', 'en', 'de'] as const).map((item) => (
        <button
          key={item}
          type="button"
          className={item === language ? 'is-active' : ''}
          onClick={() => onChange(item)}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function DashboardShell({
  activeSection,
  backToGroupLabel,
  brandLine,
  children,
  language,
  languageAriaLabel,
  navAriaLabel,
  navItems,
  onNavigate,
  setLanguage,
  setTheme,
  theme,
  themeAriaLabel,
  themeLabels,
}: DashboardShellProps) {
  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a
          className="topbar__backlink"
          href="https://anclora-group.vercel.app/workspace"
          target="_blank"
          rel="noreferrer"
        >
          {backToGroupLabel}
        </a>

        <div className="topbar__brand">
          <CommandCenterPlaceholderLogo />
          <div>
            <p className="topbar__brand-name">ANCLORA COMMAND CENTER</p>
            <p className="topbar__brand-line">{brandLine}</p>
          </div>
        </div>

        <div className="topbar__controls">
          <div className="topbar__toggle-group" aria-label={themeAriaLabel}>
            {(['dark', 'light', 'system'] as const).map((item) => {
              const Icon = themeIcons[item]
              return (
                <button
                  key={item}
                  type="button"
                  className={item === theme ? 'is-active' : ''}
                  onClick={() => setTheme(item)}
                  aria-label={themeLabels[item]}
                  title={themeLabels[item]}
                >
                  <Icon />
                </button>
              )
            })}
          </div>

          <LanguageToggle
            language={language}
            label={languageAriaLabel}
            onChange={setLanguage}
          />
        </div>

        <nav className="topbar__nav" aria-label={navAriaLabel}>
          {navItems.map((item) => (
            <a
              key={item.id}
              className={item.id === activeSection ? 'is-active' : ''}
              href={item.href}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.id, item.href)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {children}
    </main>
  )
}
