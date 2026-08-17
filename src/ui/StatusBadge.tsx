// StatusBadge — thin React wrapper over the canonical DS class
// (.ac-status-badge, see @anclora/design-system/components/status-badge.css).
// Sin CSS local.

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'muted'

export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  return <span className={`ac-status-badge ac-status-badge--${tone}`}>{label}</span>
}
