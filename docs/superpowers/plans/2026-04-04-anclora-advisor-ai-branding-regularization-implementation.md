# Anclora Advisor AI Branding Regularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regularizar `anclora-advisor-ai` contra el contrato `ANCLORA_INTERNAL_APP_CONTRACT` como baseline de referencia interna, dejando la bóveda y el repo real preparados estructuralmente para el branding canónico.

**Architecture:** La implementación se divide en dos frentes. En la bóveda se fija el branding objetivo y la evidencia contractual mínima; en el repo real se centraliza la marca, se corrigen metadata/logo/favicon wiring y se añade la prueba de contrato.

**Tech Stack:** Obsidian markdown, Next.js App Router, TypeScript, Tailwind/CSS global, tsx (no test runner framework), ESLint, npm.

---

### Task 1: Regularizar la bóveda para Advisor AI

**Files:**
- Modify: `proyectos/anclora-advisor-ai.md`
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Añadir branding canónico a la nota del proyecto**

En `proyectos/anclora-advisor-ai.md`, añadir sección `## Branding canónico`.

- [ ] **Step 2: Actualizar la evidencia contractual en la matriz**

Modificar las filas de `anclora-advisor-ai` en `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md` para reflejar branding estructural alineado en el repo real.

- [ ] **Step 3: Commit de bóveda**

```bash
git add proyectos/anclora-advisor-ai.md docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: regularize anclora-advisor-ai branding vault"
```

### Task 2: Centralizar la marca en el repo `anclora-advisor-ai`

**Files:**
- Create: `src/lib/advisor-brand.ts`
- Modify: `src/app/layout.tsx`
- Modify: `README.md`

- [ ] **Step 1: Crear el módulo de branding**

Crear `src/lib/advisor-brand.ts`.

- [ ] **Step 2: Actualizar layout.tsx**

Modificar `src/app/layout.tsx` para usar `ADVISOR_BRAND` en metadata (title, description, icons).

- [ ] **Step 3: Actualizar README**

Añadir sección `## Branding canónico` con familia internal, tipografía, placeholders de paleta y prefijo de assets.

- [ ] **Step 4: Commit del núcleo de branding**

```bash
git add src/lib/advisor-brand.ts src/app/layout.tsx README.md
git commit -m "feat: centralize anclora-advisor-ai branding"
```

### Task 3: Añadir prueba mínima de branding

**Files:**
- Create: `tests/unit/test-advisor-brand.ts`

- [ ] **Step 1: Crear test de branding**

Crear `tests/unit/test-advisor-brand.ts` como script tsx con aserciones directas.

- [ ] **Step 2: Ejecutar lint**

```bash
npm run lint
```

- [ ] **Step 3: Ejecutar type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit del test**

```bash
git add tests/unit/test-advisor-brand.ts
git commit -m "test: cover advisor-ai branding contract"
```

### Task 4: Publicar

- [ ] **Step 1: Push del repo advisor-ai**

```bash
git push -u origin claude/standardize-app-branding-h3vjR
```

- [ ] **Step 2: Push de la bóveda**

```bash
git push -u origin claude/standardize-app-branding-h3vjR
```

- [ ] **Step 3: Dejar constancia del residual**

Siguen pendientes por diseño:
- icono final
- paquete de favicon final
- nueva paleta de color definitiva
- auditoría visual completa del producto
