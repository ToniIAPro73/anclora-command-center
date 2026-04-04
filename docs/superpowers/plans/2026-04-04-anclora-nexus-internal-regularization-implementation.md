# Anclora Nexus Internal Regularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regularizar `anclora-nexus` como app `Internal` con excepción multilenguaje `es/en/de/ru`, mantener `dark` como contrato operativo y alinear su repo real con los contratos UX/UI y branding aplicables.

**Architecture:** El trabajo se divide en dos frentes. En la bóveda se regulariza la nota canónica y el estado de cumplimiento contractual. En el repo real `anclora-nexus`, la intervención se concentra en `frontend/`: metadata, branding assets, tokens `dark`, tipografía y superficies principales, manteniendo `light` fuera de alcance y preservando `sdd/contracts/` como capa local vigente.

**Tech Stack:** Obsidian markdown, Next.js App Router en `frontend/`, Tailwind/CSS tokens, Vitest, ESLint, git.

---

## File Structure

### Vault

- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
  - Registrar la excepción `es/en/de/ru`, `dark` obligatorio y el estado de auditoría real.
- Modify: `docs/standards/ANCLORA_INTERNAL_APPS_GAP_ANALYSIS.md`
  - Reescribir el bloque de Nexus para que el gap ya no sea abstracto.
- Create or Modify: `resources/anclora-nexus.md` or `research/anclora/anclora-nexus.md`
  - Convertirla en nota canónica clara, con contratos, branding y excepciones visibles.
- Optional Modify: `resources/anclora-group-chatgpt-project/*`
  - Solo si se detecta alguna referencia operativa desalineada.

### Repo `anclora-nexus`

- Modify: `../anclora-nexus/README.md`
  - Declarar contrato real de Nexus y sus excepciones.
- Modify: `../anclora-nexus/frontend/src/app/layout.tsx`
  - Revisar metadata, icon wiring y font loading.
- Modify: `../anclora-nexus/frontend/src/app/globals.css` or theme/token file if present
  - Alinear tokens `dark` a branding contract.
- Modify: `../anclora-nexus/frontend/src/components/brand/BrandLogo.tsx`
  - Normalizar la referencia al logo/icono.
- Modify: `../anclora-nexus/frontend/src/lib/i18n.*`
  - Verificar que el contrato `es/en/de/ru` queda explícito y estable.
- Modify: `../anclora-nexus/frontend/src/app/(dashboard)/layout.tsx`
  - Verificar shell y navegación persistente.
- Modify: representative dashboard screens if needed:
  - `../anclora-nexus/frontend/src/app/(dashboard)/dashboard/page.tsx`
  - `../anclora-nexus/frontend/src/app/(dashboard)/leads/page.tsx`
  - `../anclora-nexus/frontend/src/app/(dashboard)/partner-admissions/page.tsx`
- Read: `../anclora-nexus/sdd/contracts/*`
  - Confirmar compatibilidad con branding y shell actuales.

### Verification

- Run in `../anclora-nexus/frontend`:
  - `npm run lint`
  - `npx vitest run`
  - `npm run build`

---

### Task 1: Regularize the Canonical Vault Note

**Files:**
- Modify or Create: `resources/anclora-nexus.md`
- Modify: `docs/standards/ANCLORA_INTERNAL_APPS_GAP_ANALYSIS.md`

- [ ] **Step 1: Locate the canonical note source**

Run: `rg -n "Anclora Nexus|anclora-nexus" resources research`

Expected: identify whether the canonical note should live in `resources/` or be promoted there from `research/`.

- [ ] **Step 2: Write the frontmatter**

Use:

```yaml
---
title: Anclora Nexus
aliases: [Anclora Nexus]
repo: https://github.com/ToniIAPro73/anclora-nexus.git
type: internal-app
estado: activo
familia_contractual: Internal
branding_categoria: Interna
idiomas_activos: [es, en, de, ru]
tema_operativo: dark
tags: [resource, anclora, internal-app, nexus]
related:
  - "[[APPLICATION_FAMILY_MAP]]"
  - "[[ANCLORA_INTERNAL_APP_CONTRACT]]"
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[Anclora Group]]"
  - "[[Anclora Private Estates]]"
  - "[[Anclora Command Center]]"
---
```

- [ ] **Step 3: Write the canonical sections**

Include these sections:

```md
## Qué es

`anclora-nexus` es la capa operativa central del vertical inmobiliario de Anclora para pipeline, relaciones, coordinación comercial y lectura accionable del sistema.

## Clasificación canónica

- familia contractual: `Internal`
- branding: `Interna`
- tema operativo actual: `dark`
- idiomas activos: `es/en/de/ru`
- `light`: posible futuro, no requisito actual
```

Also include:

```md
## Contratos aplicables

- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`
- `ANCLORA_INTERNAL_APP_CONTRACT.md`
- `ANCLORA_BRANDING_*`
- `sdd/contracts/*` como concreción local
```

- [ ] **Step 4: Update the Nexus section in the internal gap analysis**

Replace the generic description with:

```md
### `anclora-nexus`
- excepción controlada de idiomas: `es/en/de/ru`
- `dark` es contrato operativo vigente
- `light` queda fuera de alcance de esta fase
- el foco de regularización es branding `dark`, shell, surfaces e i18n visible
```

- [ ] **Step 5: Verify**

Run: `Get-Content -Raw resources/anclora-nexus.md`

Expected: the note explicitly states `Internal`, `dark` current contract, `light` future only, and `es/en/de/ru`.

- [ ] **Step 6: Commit**

```bash
git add resources/anclora-nexus.md docs/standards/ANCLORA_INTERNAL_APPS_GAP_ANALYSIS.md
git commit -m "docs: regularize anclora-nexus canonical note"
```

---

### Task 2: Update Compliance Matrix for the Nexus Exception

**Files:**
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Update the summarized row**

Use wording like:

```md
| `anclora-nexus` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contrato `dark` operativo y excepción `es/en/de/ru` reconocidos; falta auditoría real del frontend | PARTIAL | Falta validación del branding dark, shell y surfaces principales | 2026-04-04 |
```

- [ ] **Step 2: Update the family evidence block**

```md
| `anclora-nexus` | Contratos sincronizados y excepción multilenguaje documentada | Branding dark y shell aún no validados contra repo real | Auditar `frontend/` y cerrar alineación visual/contractual |
```

- [ ] **Step 3: Verify matrix coherence**

Run: `rg -n "anclora-nexus|es/en/de/ru|dark" docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

Expected: the row and evidence mention the exception and the dark-only contract.

- [ ] **Step 4: Commit**

```bash
git add docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: record anclora-nexus contract exception"
```

---

### Task 3: Audit Frontend Branding Entry Points

**Files:**
- Read: `../anclora-nexus/frontend/src/app/layout.tsx`
- Read: `../anclora-nexus/frontend/src/components/brand/BrandLogo.tsx`
- Read: `../anclora-nexus/frontend/src/lib/i18n*`
- Read: `../anclora-nexus/frontend/src/app/(dashboard)/layout.tsx`
- Read: `../anclora-nexus/sdd/contracts/*`

- [ ] **Step 1: Capture the current entry points**

Run:

```bash
rg -n "logo|favicon|icon|Inter|Playfair|theme|dark|light|locale|language|i18n" ..\anclora-nexus\frontend\src ..\anclora-nexus\sdd\contracts
```

Expected: identify the actual files that govern theme, logo/icon, font loading, and i18n.

- [ ] **Step 2: Record the audit result**

Write an audit note in your scratch context with:

```md
- font stack currently loaded
- logo/icon path currently used
- favicon path currently used
- whether `light` is actually implemented or only possible in theory
- where language switching lives
- which SDD contracts overlap with global branding
```

- [ ] **Step 3: Decide the minimum edit set**

Choose only the files that actually need changes. Typical candidates:

```md
- `frontend/src/app/layout.tsx`
- `frontend/src/components/brand/BrandLogo.tsx`
- `frontend/src/app/globals.css` or equivalent token source
- `frontend/src/lib/i18n.ts`
- dashboard shell/layout
```

- [ ] **Step 4: Commit audit checkpoint if useful**

```bash
git status --short
```

Only commit here if you created a durable audit note in the vault. Otherwise continue.

---

### Task 4: Align Metadata, Icon Wiring, and Font Loading

**Files:**
- Modify: `../anclora-nexus/frontend/src/app/layout.tsx`
- Modify: `../anclora-nexus/frontend/src/components/brand/BrandLogo.tsx`
- Optional Modify: `../anclora-nexus/frontend/public/brand/*`

- [ ] **Step 1: Update metadata**

Target shape:

```ts
export const metadata = {
  title: 'Anclora Nexus',
  description: 'Capa operativa interna de Anclora para pipeline, relaciones y coordinación comercial',
  icons: {
    icon: '/brand/favicon-anclora-nexus.svg',
  },
}
```

Use the actual asset path if it already exists; do not invent final assets.

- [ ] **Step 2: Remove font leakage from other families**

If `layout.tsx` or any font loader imports `Playfair Display`, remove it unless there is a strong local reason tied to legacy content. Nexus should use the `Internal` stack.

Prefer:

```ts
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
```

- [ ] **Step 3: Normalize BrandLogo**

Use a single canonical source:

```tsx
const logoSrc = src || '/brand/logo-anclora-nexus.png'
```

or the existing `.webp` if that is the real canonical asset. Do not keep inconsistent fallbacks across files.

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "playfair|fontsource|favicon|logo-anclora-nexus" ..\anclora-nexus\frontend\src ..\anclora-nexus\frontend\public
```

Expected: no premium/ultra-premium font leakage, and one coherent icon/logo path strategy.

- [ ] **Step 5: Commit**

```bash
git -C ..\anclora-nexus add frontend/src/app/layout.tsx frontend/src/components/brand/BrandLogo.tsx frontend/public/brand
git -C ..\anclora-nexus commit -m "chore: normalize anclora-nexus brand entry points"
```

---

### Task 5: Align Dark Tokens and Shell Semantics

**Files:**
- Modify: `../anclora-nexus/frontend/src/app/globals.css` or token file if present
- Modify: `../anclora-nexus/frontend/src/app/(dashboard)/layout.tsx`
- Optional Modify:
  - `../anclora-nexus/frontend/src/app/(dashboard)/dashboard/page.tsx`
  - `../anclora-nexus/frontend/src/app/(dashboard)/leads/page.tsx`
  - `../anclora-nexus/frontend/src/app/(dashboard)/partner-admissions/page.tsx`

- [ ] **Step 1: Define the target dark palette**

Use the `Internal` contract with the Nexus accent:

```md
- primary font: Inter
- accent hue: gold `#D4AF37`
- dark background family around `#0F1629`, `#141C3A`, `#192350`
- readable light copy and stable surface hierarchy
```

- [ ] **Step 2: Update the base dark tokens**

If tokens are centralized, make the minimal change there. If not, introduce or normalize a block like:

```css
:root {
  --background: #0F1629;
  --surface: #141C3A;
  --card: #192350;
  --elevated: #1E2A5C;
  --accent: #D4AF37;
  --accent-hover: #E0C050;
  --text-primary: #F5F5F0;
  --text-secondary: #C8D0E0;
  --text-muted: #7A88A8;
}
```

- [ ] **Step 3: Keep shell semantics stable**

In dashboard layout/shell, ensure the structure still reflects:

```md
header operativo + navegación persistente + área principal
```

Do not introduce a premium or editorial shell grammar.

- [ ] **Step 4: Check representative screens**

Verify that `dashboard`, `leads`, and `partner-admissions` still read correctly under the updated tokens:

```bash
rg -n "text-gold|bg-gold|text-soft-white|bg-navy|surface-secondary" ..\anclora-nexus\frontend\src\app\(dashboard)
```

Expected: the screens still use the same semantic surface language after the token adjustment.

- [ ] **Step 5: Commit**

```bash
git -C ..\anclora-nexus add frontend/src/app frontend/src/components
git -C ..\anclora-nexus commit -m "style: align anclora-nexus dark branding"
```

---

### Task 6: Validate the Language Contract

**Files:**
- Modify: `../anclora-nexus/frontend/src/lib/i18n*`
- Modify tests if needed:
  - `../anclora-nexus/frontend/tests/**/*`

- [ ] **Step 1: Confirm the active locale list**

Run:

```bash
rg -n "es|en|de|ru|SUPPORTED_LOCALES|locales" ..\anclora-nexus\frontend\src ..\anclora-nexus\frontend\tests
```

Expected: one clear locale source of truth.

- [ ] **Step 2: Make the exception explicit in code if needed**

If the locale list is scattered, centralize it:

```ts
export const SUPPORTED_LOCALES = ['es', 'en', 'de', 'ru'] as const
```

- [ ] **Step 3: Add or adjust a focused test**

Example:

```ts
it('preserves the Nexus supported locale list', () => {
  expect(SUPPORTED_LOCALES).toEqual(['es', 'en', 'de', 'ru'])
})
```

- [ ] **Step 4: Verify**

Run: `npx vitest run`

Expected: tests pass and the locale exception is now explicit instead of implicit.

- [ ] **Step 5: Commit**

```bash
git -C ..\anclora-nexus add frontend/src/lib frontend/tests
git -C ..\anclora-nexus commit -m "test: lock anclora-nexus locale contract"
```

---

### Task 7: Verify, Push, and Close the Loop in the Vault

**Files:**
- Modify if needed: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- Modify if needed: `resources/anclora-nexus.md`

- [ ] **Step 1: Run final verification in the frontend workspace**

Run:

```bash
cd ..\anclora-nexus\frontend
npm run lint
npx vitest run
npm run build
```

Expected:
- `lint` passes
- `vitest` passes
- `build` passes

- [ ] **Step 2: Update the matrix with the final evidence**

Use wording like:

```md
Cobertura auditada: nota canónica y excepción contractual actualizadas; repo `anclora-nexus` alineado en branding dark, metadata, font loading e i18n explícito.
```

- [ ] **Step 3: Final git checks**

Run:

```bash
git status --short
git -C ..\anclora-nexus status --short
```

Expected: only intended files changed before commits; both clean after commit/push.

- [ ] **Step 4: Push**

```bash
git push origin main
git -C ..\anclora-nexus push origin main
```

- [ ] **Step 5: Commit vault closure if needed**

```bash
git add docs/governance/CONTRACT_COMPLIANCE_MATRIX.md resources/anclora-nexus.md
git commit -m "docs: close anclora-nexus regularization"
```

Only if the final evidence changed after verification.

---

## Self-Review

- **Spec coverage:** cubre bóveda, nota canónica, excepción de idiomas, contrato dark y repo real.
- **Placeholder scan:** no quedan `TODO` ni tareas sin ruta concreta.
- **Type consistency:** `anclora-nexus` se mantiene siempre como `Internal`, `dark` como contrato actual, `light` como futuro posible y `es/en/de/ru` como excepción controlada.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-04-anclora-nexus-internal-regularization-implementation.md`.

Execution selected:

1. Subagent-Driven (recommended) - fresh worker per task, reviews between tasks, worksheet/worktree outside the repo
