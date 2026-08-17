// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Drawer } from './Drawer'

function setup(overrides: Partial<React.ComponentProps<typeof Drawer>> = {}) {
  const onClose = vi.fn()
  render(
    <Drawer open title="Anclora Fiscal" onClose={onClose} {...overrides}>
      <p>body content</p>
    </Drawer>,
  )
  return { onClose }
}

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    render(
      <Drawer open={false} title="x" onClose={() => {}}>
        <p>x</p>
      </Drawer>,
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
})
