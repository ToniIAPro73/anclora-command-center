// ConfirmationDialog — unico dialogo de confirmacion reutilizable para toda
// accion sensible (Seccion 37/74). Envuelve .ac-modal-backdrop/.ac-modal del
// Design System. Gestion de foco: al abrir, foco va al boton de confirmar;
// Escape y click en backdrop cancelan; foco vuelve al elemento disparador al
// cerrar (via onCancel/onConfirm, responsabilidad del caller).
import { useEffect, useRef } from 'react'
import { Button } from './Button'

export interface ConfirmationDialogProps {
  open: boolean
  title: string
  summary: string
  consequence?: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
  error?: string | null
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  open,
  title,
  summary,
  consequence,
  confirmLabel,
  cancelLabel,
  busy,
  error,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      className="ac-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <div className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="ac-modal__header">
          <h2 id="confirm-dialog-title" className="ac-modal__title">
            {title}
          </h2>
          <p className="ac-modal__summary">{summary}</p>
          {consequence && <p className="ac-modal__summary">{consequence}</p>}
        </div>
        {error && (
          <div className="ac-modal__body" role="alert">
            <p className="ac-modal__summary" style={{ color: 'var(--status-danger-text)' }}>
              {error}
            </p>
          </div>
        )}
        <div className="ac-modal__footer">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? '…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
