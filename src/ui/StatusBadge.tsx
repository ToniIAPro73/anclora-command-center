// StatusBadge — semantica generica (success|warning|danger|info|neutral|muted),
// nunca vocabulario de dominio en el nombre de clase (ver principio Seccion 15).
import './status-badge.css'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'muted'

export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  return <span className={`op-status-badge op-status-badge--${tone}`}>{label}</span>
}
