// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders the canonical DS classes for variant/size', () => {
    render(
      <Button variant="destructive" size="sm">
        Stop
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Stop' })
    expect(btn.className).toContain('ac-button')
    expect(btn.className).toContain('ac-button--destructive')
    expect(btn.className).toContain('ac-button--sm')
  })

  it('fires onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects disabled state (no click, aria semantics)', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is keyboard-focusable', () => {
    render(<Button>Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    btn.focus()
    expect(document.activeElement).toBe(btn)
  })
})
