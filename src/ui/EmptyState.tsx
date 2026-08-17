// EmptyState — envoltorio sobre .ac-empty-state (Design System).
import type { ReactNode } from 'react'

export function EmptyState({ title, summary, actions }: { title: string; summary?: string; actions?: ReactNode }) {
  return (
    <div className="ac-empty-state" role="status">
      <p className="ac-empty-state__title">{title}</p>
      {summary && <p className="ac-empty-state__summary">{summary}</p>}
      {actions && <div className="ac-empty-state__actions">{actions}</div>}
    </div>
  )
}
