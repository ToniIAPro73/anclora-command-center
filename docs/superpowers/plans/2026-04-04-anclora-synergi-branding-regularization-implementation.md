# Anclora Synergi Branding Regularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regularizar `anclora-synergi` contra los contratos `ANCLORA_BRANDING_*`, dejando la bóveda y el repo real preparados estructuralmente para el branding premium canónico.

**Architecture:** La implementación se divide en dos frentes: bóveda y repo real. En la bóveda se fija el branding objetivo y la evidencia contractual mínima; en el repo se centraliza la marca, se sustituye la tipografía por `DM Sans`, se corrigen metadata/logo/favicon wiring y se ajustan los tokens base a púrpura + cobre sin rediseñar la app completa.

**Tech Stack:** Obsidian markdown, Next.js App Router, TypeScript, CSS global, Node test runner (`tsx --test`), ESLint.

---

### Task 1: Regularizar la bóveda para Synergi

**Files:**
- Modify: `research/anclora/anclora-synergi.md`
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Añadir branding canónico a la nota de research**

Actualizar `research/anclora/anclora-synergi.md` con una sección `Branding canónico` equivalente a la usada en `anclora-data-lab`, incluyendo:

```md
## Branding canónico

- Familia visual: `Premium`
- Accent objetivo: `#8C5AB4` púrpura
- Tipografía objetivo: `DM Sans`
- Borde de icono: cobre
- Interior de icono: navy púrpura `#1C162A`
- Assets finales: pendientes de sustitución cuando el usuario los entregue
- Alcance de esta fase: dejar la app preparada estructuralmente para recibir esos activos sin rehacer el wiring
```

- [ ] **Step 2: Ajustar la evidencia contractual**

Modificar las filas de `anclora-synergi` en `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md` para que la evidencia refleje:

- branding estructural premium alineado en el repo real
- assets finales todavía pendientes
- auditoría visual completa todavía pendiente

Texto esperado en resumen por aplicación:

```md
Branding premium estructural alineado en el repo real: DM Sans, wiring centralizado de marca, metadata y paleta púrpura/cobre; assets finales pendientes
```

- [ ] **Step 3: Verificar el diff de la bóveda**

Run:

```powershell
git diff -- research\anclora\anclora-synergi.md docs\governance\CONTRACT_COMPLIANCE_MATRIX.md
```

Expected: solo cambios de branding canónico y evidencia contractual para `anclora-synergi`.

- [ ] **Step 4: Commit de bóveda**

```bash
git add research/anclora/anclora-synergi.md docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: regularize anclora-synergi branding vault"
```

### Task 2: Centralizar el branding en el repo `anclora-synergi`

**Files:**
- Create: `src/lib/synergi-brand.ts`
- Modify: `src/app/layout.tsx`
- Modify: `README.md`

- [ ] **Step 1: Crear el módulo de branding**

Crear `src/lib/synergi-brand.ts` con una fuente única de verdad:

```ts
export const SYNERGI_BRAND = {
  name: 'Anclora Synergi',
  description: 'Independent partner portal for the curated Anclora ecosystem.',
  logoPath: '/brand/logo-anclora-synergi.png',
  faviconPath: '/favicon.ico',
  premiumAccent: '#8C5AB4',
  premiumCopper: '#C07860',
  premiumInterior: '#1C162A',
  premiumTypography: 'DM Sans',
} as const
```

- [ ] **Step 2: Sustituir las fuentes en el layout**

Modificar `src/app/layout.tsx` para:

- eliminar `Cardo` e `Inter`
- usar `DM_Sans` desde `next/font/google`
- leer `title`, `description` e `icons` desde `SYNERGI_BRAND`

Patrón esperado:

```ts
import { DM_Sans } from 'next/font/google'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
})
```

- [ ] **Step 3: Documentar branding canónico en el README**

Añadir a `README.md` una sección `Branding canónico` con:

- familia premium
- accent `#8C5AB4`
- borde cobre
- interior `#1C162A`
- tipografía `DM Sans`
- prefijo esperado de favicon `synergi_`
- nota de que los assets finales siguen pendientes

- [ ] **Step 4: Verificar el módulo y layout**

Run:

```powershell
git diff -- src\lib\synergi-brand.ts src\app\layout.tsx README.md
```

Expected: el layout ya no depende de `Cardo`/`Inter` y la metadata sale del módulo de branding.

- [ ] **Step 5: Commit del núcleo de branding**

```bash
git add src/lib/synergi-brand.ts src/app/layout.tsx README.md
git commit -m "feat: centralize anclora-synergi branding"
```

### Task 3: Rewiring de logo y metadata visible

**Files:**
- Modify: `src/components/**` (solo donde hoy se usa el logo o naming duro)
- Test: `tests/**/*.test.ts`

- [ ] **Step 1: Localizar referencias duras**

Run:

```powershell
rg -n "logo-anclora-synergi|Anclora Synergi" src
```

Expected: lista de componentes que aún consumen el logo o el nombre en duro.

- [ ] **Step 2: Sustituir referencias por `SYNERGI_BRAND`**

En cada componente relevante, reemplazar:

- `src="/brand/logo-anclora-synergi.png"` por `SYNERGI_BRAND.logoPath`
- `alt="Anclora Synergi"` por `SYNERGI_BRAND.name`
- títulos o labels de marca repetidos por `SYNERGI_BRAND.name` cuando corresponda

Límite de alcance:

- shell principal
- login
- entry pública
- backoffice / partner admissions

- [ ] **Step 3: Verificar que no quedan referencias duras críticas**

Run:

```powershell
rg -n "logo-anclora-synergi|Cardo|font-cardo" src
```

Expected: sin referencias activas a `Cardo`; referencias al logo solo donde sean deliberadas y alineadas al módulo de branding.

- [ ] **Step 4: Commit del rewiring visible**

```bash
git add src
git commit -m "feat: wire synergi surfaces to canonical brand"
```

### Task 4: Ajustar tokens base a premium púrpura + cobre

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Reemplazar la base tipográfica**

En `src/app/globals.css`, sustituir:

```css
--font-display: var(--font-cardo), serif;
--font-body: var(--font-inter), sans-serif;
```

por una única base premium:

```css
--font-body: var(--font-dm-sans), system-ui, -apple-system, sans-serif;
```

y asegurar que `body` usa `var(--font-body)`.

- [ ] **Step 2: Alinear la paleta a branding premium**

Reformular los tokens principales para que respondan al contrato:

- accent principal: `#8C5AB4`
- cobre de grupo: `#C07860`
- interior/base: `#1C162A`

Prioridad:

- variables raíz
- botones principales
- toggles
- borders y chips
- estados activos destacados

Sin rehacer todas las clases; solo recolocar la base visual.

- [ ] **Step 3: Eliminar señales visuales ultra premium**

Retirar del CSS cualquier dependencia conceptual de `Cardo` o de registros que hagan parecer la app ultra premium en lugar de premium.

- [ ] **Step 4: Verificar el CSS**

Run:

```powershell
rg -n "font-cardo|font-inter|Cardo|Inter" src\app\globals.css src\app\layout.tsx
```

Expected: sin dependencias activas a esos stacks anteriores.

- [ ] **Step 5: Commit de tokens**

```bash
git add src/app/globals.css
git commit -m "feat: align synergi premium color and type tokens"
```

### Task 5: Añadir prueba mínima de branding y verificar

**Files:**
- Create: `tests/synergi-brand.test.ts`
- Modify: `tests` existentes solo si hace falta ajustar expectativas textuales mínimas

- [ ] **Step 1: Escribir la prueba de branding**

Crear `tests/synergi-brand.test.ts`:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { SYNERGI_BRAND } from '@/lib/synergi-brand'

test('synergi brand constants stay aligned with the premium contract', () => {
  assert.equal(SYNERGI_BRAND.name, 'Anclora Synergi')
  assert.equal(SYNERGI_BRAND.logoPath, '/brand/logo-anclora-synergi.png')
  assert.equal(SYNERGI_BRAND.faviconPath, '/favicon.ico')
  assert.equal(SYNERGI_BRAND.premiumAccent, '#8C5AB4')
  assert.equal(SYNERGI_BRAND.premiumCopper, '#C07860')
  assert.equal(SYNERGI_BRAND.premiumInterior, '#1C162A')
  assert.equal(SYNERGI_BRAND.premiumTypography, 'DM Sans')
})
```

- [ ] **Step 2: Ejecutar lint**

Run:

```powershell
npm run lint
```

Expected: exit code 0.

- [ ] **Step 3: Ejecutar tests**

Run:

```powershell
npm run test
```

Expected: PASS, incluyendo el nuevo test de branding.

- [ ] **Step 4: Ejecutar build**

Run:

```powershell
npm run build
```

Expected: build completa sin errores.

- [ ] **Step 5: Commit de verificación**

```bash
git add tests
git commit -m "test: cover synergi branding contract"
```

### Task 6: Publicar y dejar ambos repos limpios

**Files:**
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md` ya cubierto en la bóveda
- Modify: repo `anclora-synergi` ya cubierto en tareas previas

- [ ] **Step 1: Push de la bóveda**

Run:

```bash
git push origin main
```

Expected: commits de regularización de `anclora-synergi` publicados en `Boveda-Anclora`.

- [ ] **Step 2: Push del repo `anclora-synergi`**

Run:

```bash
git push origin main
```

Expected: commits de branding estructural publicados en el repo de la app.

- [ ] **Step 3: Verificar limpieza final**

Run:

```powershell
git status --short
```

Expected: salida vacía tanto en `Boveda-Anclora` como en `anclora-synergi`.

- [ ] **Step 4: Dejar constancia del residual**

Confirmar en el cierre que siguen pendientes, por diseño:

- logo final
- paquete de favicon final
- auditoría visual completa del backoffice

