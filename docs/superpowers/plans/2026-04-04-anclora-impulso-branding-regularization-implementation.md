# Anclora Impulso Branding Regularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regularizar `anclora-impulso` contra los contratos `ANCLORA_BRANDING_*`, dejando la bóveda y el repo real preparados estructuralmente para el branding premium canónico.

**Architecture:** La implementación se divide en dos frentes. En la bóveda se fija el branding objetivo y la evidencia contractual mínima; en el repo real se centraliza la marca, se sustituye la base tipográfica por `DM Sans`, se corrigen metadata/logo/favicon wiring y se recolocan los tokens base hacia premium naranja + cobre sin rediseñar toda la aplicación.

**Tech Stack:** Obsidian markdown, Next.js App Router, TypeScript, Tailwind/CSS global, Jest, ESLint, pnpm.

---

### Task 1: Regularizar la bóveda para Impulso

**Files:**
- Modify: nota o referencia canónica de `anclora-impulso` en la bóveda
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Localizar la referencia canónica de Impulso**

Run:

```powershell
Get-ChildItem research,resources,playbooks -Recurse -Filter *impulso*.md | Select-Object FullName
```

Expected: identificar la nota o referencia canónica que se usará para documentar `Branding canónico`.

- [ ] **Step 2: Añadir branding canónico**

En la nota localizada, añadir una sección:

```md
## Branding canónico

- Familia visual: `Premium`
- Accent objetivo: `#FF6A00` naranja
- Tipografía objetivo: `DM Sans`
- Borde de icono: cobre
- Interior de icono: navy `#1A1C2B`
- Assets finales: pendientes de sustitución cuando el usuario los entregue
- Alcance de esta fase: dejar la app preparada estructuralmente para recibir esos activos sin rehacer el wiring
```

- [ ] **Step 3: Ajustar la evidencia contractual**

Modificar las filas de `anclora-impulso` en `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md` para reflejar:

- branding premium estructural alineado en el repo real
- assets finales todavía pendientes
- auditoría visual completa todavía pendiente

Texto esperado en resumen:

```md
Branding premium estructural alineado en el repo real: DM Sans, wiring centralizado de marca, metadata y paleta naranja/cobre; assets finales pendientes
```

- [ ] **Step 4: Verificar el diff de la bóveda**

Run:

```powershell
git diff -- docs\governance\CONTRACT_COMPLIANCE_MATRIX.md
```

Expected: solo evidencia contractual y, además, el diff de la nota canónica encontrada.

- [ ] **Step 5: Commit de bóveda**

```bash
git add docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: regularize anclora-impulso branding vault"
```

### Task 2: Centralizar la marca en el repo `anclora-impulso`

**Files:**
- Create: `lib/impulso-brand.ts`
- Modify: `app/layout.tsx`
- Modify: `components/brand-logo.tsx`
- Modify: `README.md`

- [ ] **Step 1: Crear el módulo de branding**

Crear `lib/impulso-brand.ts`:

```ts
export const IMPULSO_BRAND = {
  name: 'Anclora Impulso',
  description: 'Aplicación premium de fitness con IA, progreso y seguimiento inteligente.',
  logoPath: '/logo-anclora-impulso.png',
  faviconPath: '/impulso_favicon.ico',
  premiumAccent: '#FF6A00',
  premiumCopper: '#C07860',
  premiumInterior: '#1A1C2B',
  premiumTypography: 'DM Sans',
} as const
```

- [ ] **Step 2: Sustituir `Inter` por `DM Sans` en el layout**

Modificar `app/layout.tsx` para:

- importar `DM_Sans` desde `next/font/google`
- usar `IMPULSO_BRAND` para `title`, `description`, `icons` y `manifest`
- eliminar la dependencia tipográfica a `Inter`

Patrón esperado:

```ts
import { DM_Sans } from 'next/font/google'
import { IMPULSO_BRAND } from '@/lib/impulso-brand'
```

- [ ] **Step 3: Conectar `brand-logo` al módulo canónico**

Modificar `components/brand-logo.tsx` para que:

- `src` salga de `IMPULSO_BRAND.logoPath`
- `alt` salga de `IMPULSO_BRAND.name`

- [ ] **Step 4: Actualizar README**

Corregir `README.md` para que:

- deje de apuntar a `ANCLORA_INTERNAL_APP_CONTRACT.md`
- apunte a `ANCLORA_PREMIUM_APP_CONTRACT.md`
- incluya sección `Branding canónico` con accent naranja, cobre, interior navy, `DM Sans` y prefijo `impulso_`

- [ ] **Step 5: Verificar el núcleo de branding**

Run:

```powershell
git diff -- app\layout.tsx components\brand-logo.tsx lib\impulso-brand.ts README.md
```

Expected: metadata, logos y branding salen ya de una fuente única.

- [ ] **Step 6: Commit del núcleo de branding**

```bash
git add app/layout.tsx components/brand-logo.tsx lib/impulso-brand.ts README.md
git commit -m "feat: centralize anclora-impulso branding"
```

### Task 3: Ajustar tokens base a premium naranja + cobre

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Localizar la base tipográfica actual**

Run:

```powershell
rg -n "font-inter|Inter|font-sans|font-family|--font" app\globals.css app\layout.tsx
```

Expected: identificar dónde se inyecta hoy la tipografía y qué variables gobiernan el shell visual.

- [ ] **Step 2: Reemplazar la base tipográfica**

En `app/globals.css`, asegurar una base premium:

```css
--font-sans: var(--font-dm-sans), system-ui, -apple-system, sans-serif;
```

o el equivalente real del repo, y hacer que `body` o la raíz consuman esa variable.

- [ ] **Step 3: Alinear los tokens principales**

Reformular los tokens principales para responder al contrato:

- accent principal: `#FF6A00`
- cobre de grupo: `#C07860`
- interior/base: `#1A1C2B`

Prioridad:

- background y superficies
- botones principales
- highlights y estados activos
- borders y chips

Sin rediseñar toda la app: solo recolocar la base visual.

- [ ] **Step 4: Verificar el CSS**

Run:

```powershell
rg -n "Inter|font-inter|DM Sans|font-dm-sans|FF6A00|C07860|1A1C2B" app\globals.css app\layout.tsx
```

Expected: presencia clara de `DM Sans` y de la paleta premium canónica; sin dependencia activa a `Inter`.

- [ ] **Step 5: Commit de tokens**

```bash
git add app/globals.css
git commit -m "feat: align impulso premium color and type tokens"
```

### Task 4: Añadir prueba mínima de branding y verificar

**Files:**
- Create: test mínimo de branding en el sistema de tests ya usado por el repo
- Modify: configuración o imports de test solo si hace falta

- [ ] **Step 1: Identificar ubicación de tests no interactivos**

Run:

```powershell
Get-ChildItem -Recurse -Include *.test.ts,*.test.tsx,*.spec.ts,*.spec.tsx | Select-Object FullName
```

Expected: localizar la carpeta de tests para añadir uno nuevo sin romper el patrón existente.

- [ ] **Step 2: Añadir test de branding**

Crear el test con el nombre adecuado del repo, por ejemplo `tests/impulso-brand.test.ts`, con esta base:

```ts
import { IMPULSO_BRAND } from '@/lib/impulso-brand'

describe('impulso branding contract', () => {
  it('stays aligned with premium branding', () => {
    expect(IMPULSO_BRAND.name).toBe('Anclora Impulso')
    expect(IMPULSO_BRAND.logoPath).toBe('/logo-anclora-impulso.png')
    expect(IMPULSO_BRAND.faviconPath).toBe('/impulso_favicon.ico')
    expect(IMPULSO_BRAND.premiumAccent).toBe('#FF6A00')
    expect(IMPULSO_BRAND.premiumCopper).toBe('#C07860')
    expect(IMPULSO_BRAND.premiumInterior).toBe('#1A1C2B')
    expect(IMPULSO_BRAND.premiumTypography).toBe('DM Sans')
  })
})
```

- [ ] **Step 3: Ejecutar lint**

Run:

```powershell
pnpm lint
```

Expected: exit code 0.

- [ ] **Step 4: Ejecutar tests no interactivos**

Run:

```powershell
pnpm test:ci
```

Expected: PASS, incluyendo el nuevo test de branding.

- [ ] **Step 5: Ejecutar build**

Run:

```powershell
pnpm build
```

Expected: build completa sin errores.

- [ ] **Step 6: Commit de verificación**

```bash
git add .
git commit -m "test: cover impulso branding contract"
```

### Task 5: Publicar y dejar ambos repos limpios

**Files:**
- Modify: ya cubiertos en tareas previas

- [ ] **Step 1: Push de la bóveda**

Run:

```bash
git push origin main
```

Expected: commits de regularización de `anclora-impulso` publicados en `Boveda-Anclora`.

- [ ] **Step 2: Push del repo `anclora-impulso`**

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

Expected: salida vacía tanto en `Boveda-Anclora` como en `anclora-impulso`.

- [ ] **Step 4: Dejar constancia del residual**

Confirmar en el cierre que siguen pendientes, por diseño:

- logo final
- paquete de favicon final
- auditoría visual completa del producto

