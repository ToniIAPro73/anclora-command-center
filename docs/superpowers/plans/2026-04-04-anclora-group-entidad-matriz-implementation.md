# Anclora Group Entidad Matriz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regularizar `anclora-group` como `Entidad Matriz`, actualizar la gobernanza y la nota canónica en la bóveda, y adaptar el repo real `anclora-group` al nuevo sistema de branding sin depender de activos gráficos finales aún no entregados.

**Architecture:** El trabajo se divide en tres frentes coordinados. Primero, la gobernanza de la bóveda incorpora `Entidad Matriz` como familia explícita con contratos universales y branding propio. Segundo, la nota [Anclora Group](c:/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora/resources/anclora-group.md) se reescribe como nodo corporativo canónico. Tercero, el repo [anclora-group](c:/Users/antonio.ballesterosa/Desktop/Proyectos/anclora-group) se adapta en tipografía, tokens, brand assets y favicon wiring para cumplir los contratos `ANCLORA_BRANDING_*`.

**Tech Stack:** Obsidian markdown, Next.js App Router, CSS global, assets en `public/brand`, tests Node/TSX, git.

---

## File Structure

### Vault governance and canonical knowledge

- Modify: `docs/governance/APPLICATION_FAMILY_MAP.md`
  - Añadir `Entidad Matriz` como familia formal.
  - Registrar `anclora-group` con contratos universales y branding propio.
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
  - Añadir fila resumida y bloques detallados para `anclora-group`.
  - Reflejar que aplica `Universal` y branding contractual, no `Internal`.
- Modify: `docs/governance/CONTRACT_HIERARCHY.md`
  - Ajustar la jerarquía para que `Entidad Matriz` quede situada entre universales y branding específico.
- Modify: `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
  - Sincronizar definición de `Entidad Matriz` con el mapa contractual.
- Modify: `resources/anclora-group.md`
  - Reescribir la nota canónica como alta correcta desde el principio.
- Modify: `resources/anclora-group-chatgpt-project/04-anclora-group-standards-governance-and-source-priority.md`
  - Alinear lenguaje operativo y prioridad de contratos.

### anclora-group repo

- Modify: `../anclora-group/src/app/globals.css`
  - Introducir o normalizar tokens `Group` según `ANCLORA_BRANDING_COLOR_TOKENS.md`.
  - Revisar tipografía `Georgia`.
- Modify: `../anclora-group/src/app/layout.tsx`
  - Revisar metadata, favicon wiring e icon references.
- Modify: `../anclora-group/src/components/group/GroupWorkspaceShell.tsx`
  - Ajustar uso de brand assets y textos de posicionamiento si contradicen `Entidad Matriz`.
- Modify: `../anclora-group/src/components/group/GroupInternalAccessPage.tsx`
  - Ajustar branding surface y referencias de assets.
- Modify: `../anclora-group/src/lib/group-access.ts`
  - Verificar naming y surfaces derivadas del portal corporativo.
- Create or Modify: `../anclora-group/public/brand/*`
  - Estructura de nombres compatible con contratos de branding y favicon spec.
- Modify: `../anclora-group/README.md`
  - Declarar `anclora-group` como portal corporativo / entidad matriz y listar contratos aplicables.
- Create or Modify: `../anclora-group/docs/standards/*`
  - Sincronizar contratos mínimos aplicables al repo.

### Verification

- Test: `../anclora-group/tests/**/*.test.ts`
  - Añadir o ampliar pruebas de metadata/branding cuando compense.
- Run:
  - `npm run lint`
  - `npm run test`
  - `npm run build`

---

### Task 1: Update Governance Family Model

**Files:**
- Modify: `docs/governance/APPLICATION_FAMILY_MAP.md`
- Modify: `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- Modify: `docs/governance/CONTRACT_HIERARCHY.md`

- [ ] **Step 1: Write the target classification in the plan notes before editing**

```md
Entidad Matriz
- App registrada: `anclora-group`
- Contratos universales: `UI_MOTION_CONTRACT.md`, `MODAL_CONTRACT.md`, `LOCALIZATION_CONTRACT.md`
- Branding aplicable: `ANCLORA_BRANDING_MASTER_CONTRACT.md`, `ANCLORA_BRANDING_ICON_SYSTEM.md`, `ANCLORA_BRANDING_COLOR_TOKENS.md`, `ANCLORA_BRANDING_TYPOGRAPHY.md`, `ANCLORA_BRANDING_FAVICON_SPEC.md`
- No aplica contrato de familia `Internal`, `Premium`, `Ultra Premium` ni `Portfolio`
```

- [ ] **Step 2: Edit `APPLICATION_FAMILY_MAP.md`**

```md
### Entidad Matriz

Contratos aplicables:
- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`
- `ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `ANCLORA_BRANDING_ICON_SYSTEM.md`
- `ANCLORA_BRANDING_COLOR_TOKENS.md`
- `ANCLORA_BRANDING_TYPOGRAPHY.md`
- `ANCLORA_BRANDING_FAVICON_SPEC.md`

Aplicaciones:
- `anclora-group`
```

Y en la tabla canónica:

```md
| `anclora-group` | Entidad Matriz | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `N/A` | Sí |
```

- [ ] **Step 3: Edit `ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`**

```md
### Entidad Matriz

Aplica a superficies corporativas únicas del ecosistema que actúan como empresa matriz, portal de acceso o lobby institucional.

Caso actual:
- `anclora-group`

Regla:
- mantiene contratos UX/UI universales
- no hereda contrato de familia `Internal`, `Premium`, `Ultra Premium` ni `Portfolio`
- su diferenciación principal vive en la capa `ANCLORA_BRANDING_*`
```

- [ ] **Step 4: Edit `CONTRACT_HIERARCHY.md`**

```md
3. Familias contractuales del ecosistema
- Entidad Matriz
- Internal
- Premium
- Ultra Premium
- Portfolio / Showcase

4. Contratos de branding
- `ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `ANCLORA_BRANDING_ICON_SYSTEM.md`
- `ANCLORA_BRANDING_COLOR_TOKENS.md`
- `ANCLORA_BRANDING_TYPOGRAPHY.md`
- `ANCLORA_BRANDING_FAVICON_SPEC.md`
```

- [ ] **Step 5: Verify the vault docs contain the new family**

Run: `rg -n "Entidad Matriz|anclora-group" docs/governance docs/standards`

Expected: `Entidad Matriz` appears in the three updated docs and `anclora-group` no longer appears under `Internal`.

- [ ] **Step 6: Commit**

```bash
git add docs/governance/APPLICATION_FAMILY_MAP.md docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md docs/governance/CONTRACT_HIERARCHY.md
git commit -m "docs: classify anclora-group as entidad matriz"
```

---

### Task 2: Update Contract Compliance Matrix

**Files:**
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Add the summarized row**

```md
| `anclora-group` | Entidad Matriz | PARTIAL | PARTIAL | PARTIAL | N/A | PARTIAL | Gobernanza en regularización; branding contractual nuevo pendiente de verificación real del repo | PARTIAL | Falta pass completo de branding contractual y cierre de assets finales | 2026-04-04 |
```

- [ ] **Step 2: Add a dedicated family evidence block**

```md
### Entidad Matriz

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-group` | Portal corporativo activo; nueva familia contractual definida en bóveda; branding contractual recién actualizado | Desalineación entre repo real y contratos `ANCLORA_BRANDING_*` | Auditar repo real y adaptar tokens, tipografía, favicon wiring y naming de brand assets |
```

- [ ] **Step 3: Add detailed contract rows if needed**

```md
### Family · Entidad Matriz

| Aplicación | E1 | E2 | E3 |
| --- | --- | --- | --- |
| `anclora-group` | PARTIAL | PARTIAL | PARTIAL |
```

Use `E1` = clasificación, `E2` = nota canónica, `E3` = repo real alineado.

- [ ] **Step 4: Verify matrix coherence**

Run: `rg -n "anclora-group|Entidad Matriz" docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

Expected: the app appears in the summary and in a dedicated family block, with no stray `Internal` classification.

- [ ] **Step 5: Commit**

```bash
git add docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: add entidad matriz compliance tracking"
```

---

### Task 3: Rewrite the Canonical Vault Note

**Files:**
- Modify: `resources/anclora-group.md`
- Modify: `resources/anclora-group-chatgpt-project/04-anclora-group-standards-governance-and-source-priority.md`

- [ ] **Step 1: Replace frontmatter in `resources/anclora-group.md`**

```yaml
---
title: Anclora Group
aliases: [Anclora Group]
repo: https://github.com/ToniIAPro73/anclora-group.git
type: corporate-parent
estado: activo
familia_contractual: Entidad Matriz
branding_categoria: Única
verticals: [Real Estate, AI, Health]
arquitecto_jefe: "[[personas/Toni|Toni]]"
territorio_foco: Suroeste de Mallorca
tags: [resource, anclora, entidad-matriz, corporate-parent]
related:
  - "[[APPLICATION_FAMILY_MAP]]"
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[Anclora Command Center]]"
  - "[[Anclora Private Estates]]"
  - "[[Anclora Nexus]]"
  - "[[Anclora Synergi]]"
  - "[[Anclora Data Lab]]"
  - "[[Anclora Content Generator AI]]"
  - "[[Anclora Talent]]"
  - "[[Anclora Advisor AI]]"
  - "[[Anclora Impulso]]"
---
```

- [ ] **Step 2: Rewrite the opening sections**

```md
## Qué es

`anclora-group` es la empresa matriz y el portal corporativo del ecosistema Anclora. No es una app interna más: es la superficie institucional desde la que se ordenan accesos, verticales, marca, repositorios y relaciones entre productos.

## Clasificación canónica

- Familia contractual: `Entidad Matriz`
- Contratos UX/UI aplicables: `UI_MOTION`, `MODAL`, `LOCALIZATION`
- Branding aplicable: `ANCLORA_BRANDING_*`
- Categoría de identidad: `Única`
```

- [ ] **Step 3: Add sections that distinguish corporate parent from product surfaces**

```md
## Qué gobierna

- identidad corporativa de `Anclora Group`
- acceso al ecosistema
- relación entre verticales y aplicaciones
- memoria canónica de marca, estándares y gobierno

## Qué no es

- no es una app `Internal`
- no es un producto premium orientado a cliente final
- no sustituye a superficies especializadas como [[Anclora Command Center]] o [[Anclora Private Estates]]
```

- [ ] **Step 4: Update the ChatGPT project governance note**

```md
`anclora-group` debe tratarse como `Entidad Matriz`: mantiene contratos universales de UX/UI, pero su identidad visual se gobierna como caso único mediante `ANCLORA_BRANDING_*`.
```

- [ ] **Step 5: Verify the note reads correctly in isolation**

Run: `Get-Content -Raw resources/anclora-group.md`

Expected: the note explicitly states `Entidad Matriz`, branding `Única`, and the distinction between corporate parent and app family.

- [ ] **Step 6: Commit**

```bash
git add resources/anclora-group.md resources/anclora-group-chatgpt-project/04-anclora-group-standards-governance-and-source-priority.md
git commit -m "docs: rewrite anclora-group as entidad matriz"
```

---

### Task 4: Audit the Real Repo Against Branding Contracts

**Files:**
- Read: `../anclora-group/src/app/globals.css`
- Read: `../anclora-group/src/app/layout.tsx`
- Read: `../anclora-group/src/components/group/GroupWorkspaceShell.tsx`
- Read: `../anclora-group/src/components/group/GroupInternalAccessPage.tsx`
- Read: `../anclora-group/src/lib/group-access.ts`
- Read: `../anclora-group/public/brand/*`
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Capture the current audit baseline**

Run: `rg -n "Georgia|logo-anclora-group|favicon|group-silver|group-copy|group-muted" ..\\anclora-group\\src ..\\anclora-group\\public`

Expected: find the real files where typography, logo, favicon and tokens are wired.

- [ ] **Step 2: Compare the repo against the contracts**

Use this checklist while reading:

```md
- typography = Georgia for `anclora-group`
- palette aligns with `ANCLORA_BRANDING_COLOR_TOKENS`
- icon and logo naming live in `public/brand`
- favicon wiring exists in `src/app/layout.tsx`
- no premium/internal typography leaks into the parent portal
```

- [ ] **Step 3: Record any gaps before editing**

Append to the matrix notes something like:

```md
Gaps detectados en `anclora-group`:
- [ ] tokens CSS no alineados
- [ ] favicon wiring incompleto
- [ ] asset naming legacy
- [ ] copy que lo presenta como app interna
```

- [ ] **Step 4: Commit the audit-only checkpoint if useful**

```bash
git add docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: record anclora-group branding audit baseline"
```

Only do this commit if the audit notes are substantial and independent.

---

### Task 5: Adapt Global Tokens and Typography in the anclora-group Repo

**Files:**
- Modify: `../anclora-group/src/app/globals.css`

- [ ] **Step 1: Write or update the Group token block**

Use a token block aligned with `ANCLORA_BRANDING_COLOR_TOKENS.md`, for example:

```css
:root {
  --group-background: #0F1520;
  --group-surface: #151C28;
  --group-card: #1A2230;
  --group-elevated: #202A38;
  --group-hover: #263040;
  --group-accent: #A8AEB8;
  --group-accent-hover: #BCC2CC;
  --group-accent-dim: #8A909A;
  --group-accent-soft: rgba(168, 174, 184, 0.12);
  --group-accent-border: rgba(168, 174, 184, 0.25);
  --group-copy: #ECF0F5;
  --group-secondary-copy: #B0BEC5;
  --group-muted: #728694;
}
```

- [ ] **Step 2: Keep Georgia as the primary font**

```css
html,
body {
  font-family: Georgia, "Times New Roman", serif;
}
```

Remove or avoid any `Inter`, `DM Sans`, `Cardo`, `Fraunces` declarations for the portal shell unless they are explicitly scoped to embedded child-brand surfaces.

- [ ] **Step 3: Align labels and caps**

```css
.group-brand-name,
.group-eyebrow {
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-weight: 700;
}
```

Keep uppercase labels in the `Georgia` family unless the contract says otherwise.

- [ ] **Step 4: Run focused verification**

Run: `rg -n "font-family|group-accent|group-silver|group-muted" ..\\anclora-group\\src\\app\\globals.css`

Expected: a single coherent Group token model and Georgia as the body/UI font.

- [ ] **Step 5: Commit**

```bash
git -C ..\\anclora-group add src/app/globals.css
git -C ..\\anclora-group commit -m "style: align anclora-group branding tokens"
```

---

### Task 6: Fix Metadata, Favicon Wiring, and Brand Asset Naming

**Files:**
- Modify: `../anclora-group/src/app/layout.tsx`
- Modify: `../anclora-group/public/brand/*`
- Modify: `../anclora-group/README.md`

- [ ] **Step 1: Update `layout.tsx` metadata**

Use a metadata block of this shape:

```ts
export const metadata = {
  title: 'Anclora Group',
  description: 'Entidad matriz y portal corporativo del ecosistema Anclora',
  icons: {
    icon: '/brand/favicon-anclora-group.svg',
    apple: '/brand/apple-touch-icon.png',
    shortcut: '/brand/favicon.ico',
  },
}
```

Adjust paths to the actual files present or to the placeholders prepared for the final asset drop.

- [ ] **Step 2: Normalize asset naming under `public/brand/`**

Preferred set:

```text
public/brand/
  logo-anclora-group.webp
  favicon.ico
  favicon-32.png
  favicon-512.png
  apple-touch-icon.png
  favicon-anclora-group.svg
```

If the user has not yet supplied the final PNG package, keep the existing SVG plus placeholders or TODO notes in `README.md`, but wire the app to the canonical names.

- [ ] **Step 3: Update the repo README**

Add a section like:

```md
## Contratos aplicables

- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`
- `ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `ANCLORA_BRANDING_ICON_SYSTEM.md`
- `ANCLORA_BRANDING_COLOR_TOKENS.md`
- `ANCLORA_BRANDING_TYPOGRAPHY.md`
- `ANCLORA_BRANDING_FAVICON_SPEC.md`
```

- [ ] **Step 4: Run a focused grep**

Run: `rg -n "logo-anclora-group|favicon|apple-touch-icon|Anclora Group" ..\\anclora-group\\src ..\\anclora-group\\public ..\\anclora-group\\README.md`

Expected: metadata and assets point to a coherent canonical naming scheme.

- [ ] **Step 5: Commit**

```bash
git -C ..\\anclora-group add src/app/layout.tsx public/brand README.md
git -C ..\\anclora-group commit -m "chore: normalize anclora-group brand assets"
```

---

### Task 7: Align Surface Copy and Portal Positioning

**Files:**
- Modify: `../anclora-group/src/components/group/GroupWorkspaceShell.tsx`
- Modify: `../anclora-group/src/components/group/GroupInternalAccessPage.tsx`
- Modify: `../anclora-group/src/lib/group-access.ts`

- [ ] **Step 1: Replace “internal app” framing with “corporate portal” framing**

Examples:

```tsx
<p className="group-brand-line">Portal corporativo del ecosistema Anclora</p>
```

and

```tsx
<p className="group-brand-line">Acceso corporativo por rol a superficies del ecosistema</p>
```

- [ ] **Step 2: Keep child apps clearly subordinate**

Use copy that distinguishes parent portal from child products:

```tsx
<small>{app.visibility === 'internal' ? 'Superficie interna del ecosistema' : 'Superficie externa del ecosistema'}</small>
```

- [ ] **Step 3: Verify role/access copy in `group-access.ts`**

Make sure route metadata does not present `anclora-group` itself as one more product card. The parent portal should frame access, not compete with child brands.

- [ ] **Step 4: Run the app locally and inspect**

Run:

```bash
cd ..\anclora-group
npm run lint
npm run test
npm run build
```

Expected:
- `lint` passes
- tests pass
- production build passes

- [ ] **Step 5: Commit**

```bash
git -C ..\\anclora-group add src/components/group/GroupWorkspaceShell.tsx src/components/group/GroupInternalAccessPage.tsx src/lib/group-access.ts
git -C ..\\anclora-group commit -m "feat: position anclora-group as corporate portal"
```

---

### Task 8: Close the Loop in the Vault

**Files:**
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- Modify: `resources/anclora-group.md`
- Optional: `docs/superpowers/plans/2026-04-04-anclora-group-entidad-matriz-implementation.md`

- [ ] **Step 1: Record the implementation result**

Add a closing note in the matrix row:

```md
Cobertura auditada: gobernanza y nota canónica actualizadas; repo `anclora-group` adaptado en tipografía, tokens, metadata y brand wiring; pendiente únicamente la sustitución de assets finales si el usuario aporta nuevos archivos.
```

- [ ] **Step 2: Add a short “Estado de branding” block to `resources/anclora-group.md`**

```md
## Estado de branding

- estructura contractual: alineada
- tipografía: alineada a `Georgia`
- tokens base: alineados a `ANCLORA_BRANDING_COLOR_TOKENS`
- favicon package final: pendiente de sustitución por assets definitivos del usuario si aplica
```

- [ ] **Step 3: Final verification sweep**

Run:

```bash
git status --short
rg -n "anclora-group" docs/governance resources/anclora-group.md
```

Expected:
- only intended files changed
- `anclora-group` appears as `Entidad Matriz`
- no remaining `Internal` classification for `anclora-group`

- [ ] **Step 4: Commit**

```bash
git add docs/governance/CONTRACT_COMPLIANCE_MATRIX.md resources/anclora-group.md
git commit -m "docs: close anclora-group entidad matriz rollout"
```

---

## Self-Review

- **Spec coverage:** cubre las tres capas pedidas por la spec: gobernanza, nota canónica y repo real.
- **Placeholder scan:** no quedan `TODO` o “revisar luego” sin salida; donde faltan assets finales del usuario, el plan indica explícitamente dejar la integración preparada.
- **Type consistency:** la categoría usada es siempre `Entidad Matriz`; la app es siempre `anclora-group`; el branding se referencia siempre como `ANCLORA_BRANDING_*`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-04-anclora-group-entidad-matriz-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
