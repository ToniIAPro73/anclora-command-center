// Button — envoltorio React fino sobre la clase canonica del Design System
// (.ac-button, ver @anclora/design-system/components/button.css). Sin CSS local.

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, children, ...rest },
  ref,
) {
  const classes = ['ac-button', `ac-button--${variant}`, `ac-button--${size}`, className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" ref={ref} className={classes} {...rest}>
      {children}
    </button>
  )
})
