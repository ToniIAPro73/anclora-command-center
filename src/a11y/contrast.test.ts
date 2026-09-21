import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { blendOver, contrastRatio, parseCssColor } from './contrast'

// Since the Wave 2 / Pilot 2 design-system migration, this app's own
// index.css only defines its PRODUCT layer (surfaces, accent, product text
// hierarchy) — structural semantic roles (--focus-ring,
// --status-*-text/surface, --border, --line-*) now come from
// @anclora/design-system's tokens/semantic.css. Resolving tokens from
// index.css alone (as this test previously did) would fail on those roles
// even though the app renders them correctly, because the real cascade is
// DS tokens first, index.css layered on top — mirror that order here
// instead of narrowing the assertions.
const appCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
const dsCoreCss = readFileSync(
  new URL('../../node_modules/@anclora/design-system/src/tokens/core.css', import.meta.url),
  'utf8',
)
const dsSemanticCss = readFileSync(
  new URL('../../node_modules/@anclora/design-system/src/tokens/semantic.css', import.meta.url),
  'utf8',
)

function parseTokenBlock(css: string, selector: string): Record<string, string> {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`No se encontró el bloque ${selector} en el CSS dado`)
  return Object.fromEntries(
    [...match[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((entry) => [entry[1], entry[2].trim()]),
  )
}

// DS dark tokens use the combined ":root,\n[data-theme=\"dark\"]" selector —
// match on the attribute form, which is present in both.
// core.css primitives (e.g. --group-border, --group-border-light) live in a
// single plain :root block, not per-theme — semantic.css's --border: var(
// --group-border) etc. reference them directly.
const dsCoreTokens = parseTokenBlock(dsCoreCss, ':root')
const dsDarkTokens = parseTokenBlock(dsSemanticCss, '[data-theme="dark"]')
const dsLightTokens = parseTokenBlock(dsSemanticCss, '[data-theme="light"]')
const appRootTokens = parseTokenBlock(appCss, ':root')
const appLightTokens = parseTokenBlock(appCss, "html[data-theme='light']")

// DS semantic tokens (e.g. --focus-ring, --text-link in the light theme)
// are defined as color-mix(in srgb, COLOR PCT%, COLOR2 PCT%) formulas, not
// literal colors. Evaluate that specific shape (the only one the DS's
// tokens actually use) into a literal rgb() this file's own parseCssColor
// can read — named "white"/"black" operands included, since the DS's
// formulas use those directly.
const NAMED_COLORS: Record<string, string> = { white: '#ffffff', black: '#000000', transparent: 'rgba(0, 0, 0, 0)' }

function resolveColorMix(value: string): string {
  const match = value.match(
    /^color-mix\(in srgb,\s*([^,]+?)\s+(\d+(?:\.\d+)?)%,\s*([^,)]+?)(?:\s+(\d+(?:\.\d+)?)%)?\)$/,
  )
  if (!match) return value
  const [, colorA, pctA, colorB, pctB] = match
  const a = parseCssColor(NAMED_COLORS[colorA.trim()] ?? colorA.trim())
  const b = parseCssColor(NAMED_COLORS[colorB.trim()] ?? colorB.trim())
  const weightA = Number(pctA)
  const weightB = pctB === undefined ? 100 - weightA : Number(pctB)
  const total = weightA + weightB
  // CSS color-mix() keeps the interpolated RGB channels separate from the
  // resulting alpha. This matters for `text 50%, transparent`: it becomes
  // the text colour at 50% alpha, not a premultiplied half-dark RGB value.
  const mix = (x: number, y: number) => {
    if (b.a === 0) return x
    if (a.a === 0) return y
    return Math.round((x * weightA + y * weightB) / total)
  }
  const alpha = (a.a * weightA + b.a * weightB) / total
  return alpha === 1
    ? `rgb(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)})`
    : `rgba(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)}, ${alpha})`
}

function resolveToken(tokens: Record<string, string>, name: string): string {
  let value = tokens[name]
  if (!value) throw new Error(`Token ausente: ${name}`)
  for (let i = 0; i < 5 && value.includes('var('); i += 1) {
    value = value.replace(/var\((--[\w-]+)\)/g, (_, tokenName: string) => tokens[tokenName] ?? '')
  }
  if (value.includes('var(')) throw new Error(`Token no resoluble: ${name}=${value}`)
  if (value.startsWith('color-mix(')) value = resolveColorMix(value)
  if (value.startsWith('color-mix(')) throw new Error(`color-mix no resoluble: ${name}=${value}`)
  return value
}

function color(tokens: Record<string, string>, name: string) {
  return parseCssColor(resolveToken(tokens, name))
}

// Real cascade order (matches main.tsx: DS tokens import before ./index.css,
// and within each file the base/:root block precedes the [data-theme='light']
// block) — for each theme, later entries override earlier ones per property,
// exactly like the browser resolving custom properties on <html>:
//   dark:  DS :root/[data-theme=dark]  ->  app :root
//   light: DS :root/[data-theme=dark]  ->  DS [data-theme=light]  ->  app :root  ->  app [data-theme=light]
const themes = [
  { name: 'dark', tokens: { ...dsCoreTokens, ...dsDarkTokens, ...appRootTokens } },
  {
    name: 'light',
    tokens: { ...dsCoreTokens, ...dsDarkTokens, ...dsLightTokens, ...appRootTokens, ...appLightTokens },
  },
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
      // Since the DS migration, --status-*-surface is a translucent DS
      // token (e.g. rgba(82,190,128,0.18)), not the opaque hex this app
      // used before. contrastRatio() only auto-blends its FOREGROUND
      // argument, not its background one, so a translucent color passed
      // as background silently ignores alpha and gives a meaningless
      // ratio — composite it over the real surface it renders on first,
      // exactly like the "transparencias" test below already does for
      // --accent-soft/--secondary-soft.
      const opaqueSurface = blendOver(color(tokens, surface), color(tokens, '--surface'))
      expect(contrastRatio(color(tokens, text), opaqueSurface), `badge ${tone}`).toBeGreaterThanOrEqual(4.5)
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
    for (const background of ['--surface', '--card']) {
      expect(
        contrastRatio(color(tokens, '--border-control'), color(tokens, background)),
        `borde de control sobre ${background}`,
      ).toBeGreaterThanOrEqual(3)
    }
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
