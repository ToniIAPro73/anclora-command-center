import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { blendOver, contrastRatio, parseCssColor } from './contrast'

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

function parseTokenBlock(selector: string): Record<string, string> {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`No se encontró el bloque ${selector}`)
  return Object.fromEntries(
    [...match[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((entry) => [entry[1], entry[2].trim()]),
  )
}

const rootTokens = parseTokenBlock(':root')
const lightTokens = parseTokenBlock("html[data-theme='light']")

function resolveToken(tokens: Record<string, string>, name: string): string {
  let value = tokens[name]
  if (!value) throw new Error(`Token ausente: ${name}`)
  for (let i = 0; i < 5 && value.includes('var('); i += 1) {
    value = value.replace(/var\((--[\w-]+)\)/g, (_, tokenName: string) => tokens[tokenName] ?? '')
  }
  if (value.includes('var(')) throw new Error(`Token no resoluble: ${name}=${value}`)
  return value
}

function color(tokens: Record<string, string>, name: string) {
  return parseCssColor(resolveToken(tokens, name))
}

const themes = [
  { name: 'dark', tokens: { ...rootTokens } },
  { name: 'light', tokens: { ...rootTokens, ...lightTokens } },
]

describe('Command Center contrast tokens', () => {
  it.each(themes)('$name mantiene texto AA en superficies sólidas y extremos de gradiente', ({ tokens }) => {
    const textPairs = [
      ['--text-primary', ['--background', '--surface', '--card', '--elevated']],
      ['--text-secondary', ['--background', '--surface', '--card', '--elevated']],
      ['--text-muted', ['--background', '--surface', '--card']],
      ['--text-link', ['--background', '--surface', '--card']],
    ] as const

    for (const [foreground, backgrounds] of textPairs) {
      for (const background of backgrounds) {
        expect(
          contrastRatio(color(tokens, foreground), color(tokens, background)),
          `${foreground} sobre ${background}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }

    // .panel--* y .ac-empty-state usan paradas basadas en card/surface/sidebar.
    for (const background of ['--card', '--surface', '--sidebar']) {
      expect(contrastRatio(color(tokens, '--text-primary'), color(tokens, background))).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(color(tokens, '--text-secondary'), color(tokens, background))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(themes)('$name mantiene badges semánticas AA y borde identificable', ({ tokens }) => {
    const statusTones = [
      ['success', '--status-success-text', '--status-success-surface', '--status-success-border'],
      ['warning', '--status-warning-text', '--status-warning-surface', '--status-warning-border'],
      ['danger', '--status-danger-text', '--status-danger-surface', '--status-danger-border'],
      ['info', '--status-review-text', '--status-review-surface', '--status-review-border'],
    ] as const

    for (const [tone, text, surface, border] of statusTones) {
      expect(contrastRatio(color(tokens, text), color(tokens, surface)), `badge ${tone}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(color(tokens, border), color(tokens, '--surface')), `borde ${tone}`).toBeGreaterThanOrEqual(3)
    }

    // HEALTHY/SUCCESS, warning, error y SOLO LECTURA (muted) quedan cubiertos
    // por sus tonos semánticos, sin depender únicamente del color.
    expect(contrastRatio(color(tokens, '--text-muted'), color(tokens, '--surface'))).toBeGreaterThanOrEqual(4.5)
  })

  it.each(themes)('$name mantiene botones de acento y focus AA', ({ tokens }) => {
    for (const accentStop of ['--accent', '--secondary']) {
      expect(
        contrastRatio(color(tokens, '--text-on-accent'), color(tokens, accentStop)),
        `texto de botón sobre ${accentStop}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrastRatio(color(tokens, '--focus-ring'), color(tokens, '--background'))).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(color(tokens, '--border'), color(tokens, '--surface'))).toBeGreaterThanOrEqual(3)
  })

  it.each(themes)('$name mantiene AA al componer transparencias sobre superficies reales', ({ tokens }) => {
    const surface = color(tokens, '--surface')
    const canvas = color(tokens, '--background')
    const secondarySoft = blendOver(color(tokens, '--secondary-soft'), surface)
    const accentSoft = blendOver(color(tokens, '--accent-soft'), surface)
    const accentGlow = blendOver(color(tokens, '--accent-glow'), canvas)

    expect(contrastRatio(color(tokens, '--secondary'), secondarySoft), 'secondary sobre secondary-soft').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(color(tokens, '--secondary'), accentSoft), 'secondary sobre accent-soft').toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(color(tokens, '--text-primary'), accentGlow), 'texto primario sobre halo').toBeGreaterThanOrEqual(4.5)
  })
})
