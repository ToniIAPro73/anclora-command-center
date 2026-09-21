// Button — envoltorio React fino sobre la clase canonica del Design System
// (.ac-button, ver @anclora/design-system/components/button.css). Sin CSS local.

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'compact'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Maps to the canonical .ac-button--icon square shape (design-system
      0.6.0+). Composes with any size — e.g. size="compact" icon gives the
      36px square, the default/sm/lg sizes give 44/38/50px squares. When
      true, children should be a single icon element; an aria-label (or
      aria-labelledby) is required since the icon itself is never an
      accessible name — see the DS's own button.css contract. */
  icon?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon = false, className, children, ...rest },
  ref,
) {
  const classes = [
    'ac-button',
    `ac-button--${variant}`,
    `ac-button--${size}`,
    icon && 'ac-button--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" ref={ref} className={classes} {...rest}>
      {children}
    </button>
  )
})
