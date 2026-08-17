// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfirmationDialog } from './ConfirmationDialog'

function setup(overrides: Partial<React.ComponentProps<typeof ConfirmationDialog>> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmationDialog
      open
      title="Stop fake-svc"
      summary="You are about to stop fake-svc."
      confirmLabel="Stop"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmationDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmationDialog
        open={false}
        title="x"
        summary="x"
        confirmLabel="x"
        cancelLabel="x"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('has dialog semantics and moves focus to the confirm button on open', async () => {
    setup()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Stop' })).toHaveFocus())
  })

  it('calls onConfirm when the confirm button is clicked', () => {
    const { onConfirm } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when the cancel button is clicked', () => {
    const { onCancel } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel on Escape', () => {
    const { onCancel } = setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not cancel on Escape while busy', () => {
    const { onCancel } = setup({ busy: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('disables both buttons while busy', () => {
    setup({ busy: true })
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '…' })).toBeDisabled()
  })

  it('shows the error message when provided', () => {
    setup({ error: 'Action failed: boom' })
    expect(screen.getByRole('alert')).toHaveTextContent('Action failed: boom')
  })
})
