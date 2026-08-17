// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the generic semantic tone class, never a domain-specific one', () => {
    render(<StatusBadge tone="danger" label="CRITICAL" />)
    const badge = screen.getByText('CRITICAL')
    expect(badge.className).toContain('op-status-badge--danger')
    expect(badge.className).not.toMatch(/aos|running|stopped/)
  })

  it.each(['success', 'warning', 'danger', 'info', 'neutral', 'muted'] as const)(
    'supports tone=%s',
    (tone) => {
      render(<StatusBadge tone={tone} label={tone} />)
      expect(screen.getByText(tone).className).toContain(`op-status-badge--${tone}`)
    },
  )
})
