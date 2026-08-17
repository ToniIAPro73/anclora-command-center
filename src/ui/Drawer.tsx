// Drawer — thin React wrapper over the canonical DS drawer shell
// (.ac-drawer-backdrop/.ac-drawer, see @anclora/design-system/components/drawer.css).
// Mirrors ConfirmationDialog's focus/Escape handling. No local drawer CSS —
// the fixed-position overlay class is app-shell composition (position/z-index
// only), not a duplicated primitive.
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import './Drawer.css'

export interface DrawerProps {
  open: boolean
  title: string
  eyebrow?: string
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}

export function Drawer({ open, title, eyebrow, onClose, footer, children }: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="ac-drawer-backdrop op-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ac-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="ac-drawer__header">
          {eyebrow && <p className="op-drawer__eyebrow">{eyebrow}</p>}
          <div className="op-drawer__title-row">
            <h2 id="drawer-title" className="ac-drawer__title">
              {title}
            </h2>
            <Button ref={closeRef} variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
        <div className="ac-drawer__body op-drawer__scroll">{children}</div>
        {footer && <div className="ac-drawer__footer">{footer}</div>}
      </div>
    </div>
  )
}
