// Modal — thin React wrapper over the canonical DS modal shell
// (.ac-modal-backdrop/.ac-modal, see @anclora/design-system/components/modal.css).
// App-shell composition only: fixed overlay positioning (.op-overlay), the
// header title-row and the adaptive --detail scroll region. All generic modal
// geometry (centering, sizing classes, viewport safety, scroll architecture,
// motion) lives in the Design System — zero duplicated modal CSS here.
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import './overlay.css'
import './Modal.css'

export type ModalSize = 'compact' | 'medium' | 'wide' | 'large'

export interface ModalProps {
  open: boolean
  title: string
  eyebrow?: string
  size?: ModalSize
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}

export function Modal({ open, title, eyebrow, size = 'medium', onClose, footer, children }: ModalProps) {
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
      className="ac-modal-backdrop op-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`ac-modal ac-modal--detail ac-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-modal-title"
      >
        <div className="ac-modal__header">
          {eyebrow && <p className="ac-modal__meta">{eyebrow}</p>}
          <div className="op-modal__title-row">
            <h2 id="entity-modal-title" className="ac-modal__title">
              {title}
            </h2>
            <Button ref={closeRef} variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
        <div className="ac-modal__body op-modal__scroll">{children}</div>
        {footer && <div className="ac-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
