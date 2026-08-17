// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Modal } from './Modal'

function setup(overrides: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn()
  render(
    <Modal open title="Anclora Fiscal" onClose={onClose} {...overrides}>
      <p>body content</p>
    </Modal>,
  )
  return { onClose }
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title="x" onClose={() => {}}>
        <p>x</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('has dialog semantics and moves focus to the close button on open', async () => {
    setup()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus())
  })

  it('calls onClose on Escape', () => {
    const { onClose } = setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on backdrop click, not on content click', () => {
    const { onClose } = setup()
    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders eyebrow and footer when provided', () => {
    setup({ eyebrow: 'Repository', footer: <button type="button">Back</button> })
    expect(screen.getByText('Repository')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders children content', () => {
    setup()
    expect(screen.getByText('body content')).toBeInTheDocument()
  })

  it('defaults to the medium size modifier on the DS modal shell', () => {
    setup()
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ac-modal')
    expect(dialog.className).toContain('ac-modal--detail')
    expect(dialog.className).toContain('ac-modal--medium')
  })

  it('applies the requested adaptive size modifier', () => {
    const { rerender } = render(
      <Modal open title="x" onClose={() => {}}>
        <p>x</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog').className).toContain('ac-modal--medium')
    for (const size of ['compact', 'wide', 'large'] as const) {
      rerender(
        <Modal open size={size} title="x" onClose={() => {}}>
          <p>x</p>
        </Modal>,
      )
      expect(screen.getByRole('dialog').className).toContain(`ac-modal--${size}`)
    }
  })

  it('never uses the right-side drawer shell', () => {
    setup()
    expect(screen.getByRole('dialog').className).not.toContain('ac-drawer')
  })

  it('provides a scrollable body region inside the modal', () => {
    setup()
    const dialog = screen.getByRole('dialog')
    const body = dialog.querySelector('.ac-modal__body')
    expect(body).not.toBeNull()
    expect(body!.className).toContain('op-modal__scroll')
  })
})