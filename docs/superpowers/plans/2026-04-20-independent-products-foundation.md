# Independent Products Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the first structural layer for `Independent Products` in the vault, separate from `Anclora Group`, and register `anclora-calculadora-fiscal-183` as the initial product.

**Architecture:** This implementation keeps `Anclora Group` governance untouched and introduces a parallel governance note + inventory + contract for `Independent Products`. The first slice is intentionally documentation-first and inventory-first, without changing existing Anclora automation yet.

**Tech Stack:** Obsidian markdown, JSON governance metadata, Git

---

## File structure

### Governance inventory

- Create: `docs/governance/independent-products.json`
  - Canonical machine-readable inventory for products outside `Anclora Group`
  - Holds the first seed entry for `anclora-calculadora-fiscal-183`

### Human-facing note

- Create: `resources/Independent Products.md`
  - Canonical map for the second universe
  - Explains separation from `Anclora Group`
  - Links to the inventory and the contract

### Contract baseline

- Create: `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
  - Defines baseline UX/product rules for public utility and micro-SaaS style products

## Task 1: Create the Independent Products Inventory

**Files:**
- Create: `docs/governance/independent-products.json`
- Test: `docs/governance/independent-products.json`

- [ ] **Step 1: Write the failing JSON parse check**

```powershell
powershell -NoProfile -Command "Get-Content -Raw '.\docs\governance\independent-products.json' | ConvertFrom-Json | Out-Null; 'JSON OK'"
```

Expected: FAIL because the file does not exist yet.

- [ ] **Step 2: Create the inventory file**

Create `docs/governance/independent-products.json` with exactly this content:

```json
{
  "version": 1,
  "generated_for": "independent-products-inventory-v1",
  "generated_for_id": "independent-products-inventory-v1",
  "generated_for_label": "Independent Products",
  "products": [
    {
      "id": "anclora-calculadora-fiscal-183",
      "name": "Anclora Calculadora Fiscal 183",
      "path_wsl": "/home/toni/projects/anclora-calculadora-fiscal-183",
      "path_windows": "\\\\wsl$\\Ubuntu\\home\\toni\\projects\\anclora-calculadora-fiscal-183",
      "portfolio": "independent_products",
      "domain": "fiscal_finance",
      "business_model": "ads",
      "product_archetype": "calculator",
      "auth_model": "public_no_auth",
      "distribution_model": "seo",
      "design_system_role": "custom",
      "status": "active",
      "obsidian_note": "resources/anclora-calculadora-fiscal-183.md",
      "high_impact_paths": {
        "product": [
          "app/",
          "components/",
          "lib/",
          "public/"
        ],
        "content": [
          "content/",
          "data/",
          "docs/"
        ],
        "ads": [
          "app/",
          "components/",
          "public/"
        ]
      }
    }
  ]
}
```

- [ ] **Step 3: Run the JSON parse check again**

Run:

```powershell
powershell -NoProfile -Command "Get-Content -Raw '.\docs\governance\independent-products.json' | ConvertFrom-Json | Out-Null; 'JSON OK'"
```

Expected: `JSON OK`

- [ ] **Step 4: Run a field presence check**

Run:

```powershell
powershell -NoProfile -Command "$inventory = Get-Content -Raw '.\docs\governance\independent-products.json' | ConvertFrom-Json; $required = @('id','name','path_wsl','path_windows','portfolio','domain','business_model','product_archetype','auth_model','distribution_model','design_system_role','status','obsidian_note','high_impact_paths'); $missing = @(); foreach ($product in $inventory.products) { foreach ($field in $required) { if (-not $product.PSObject.Properties.Name.Contains($field)) { $missing += ""$($product.id):$field"" } } }; if ($missing.Count -gt 0) { throw ('Missing product fields: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add docs/governance/independent-products.json
git commit -m "docs: add independent products inventory"
```

## Task 2: Write the Human-Facing Independent Products Note

**Files:**
- Create: `resources/Independent Products.md`
- Test: `resources/Independent Products.md`

- [ ] **Step 1: Write the failing content check**

```powershell
powershell -NoProfile -Command "$note = Get-Content -Raw '.\resources\Independent Products.md'; $patterns = @('Independent Products','Anclora Group','independent-products.json','INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md','anclora-calculadora-fiscal-183','fiscal_finance','public_no_auth','ads'); $missing = $patterns | Where-Object { $note -notmatch [regex]::Escape($_) }; if ($missing.Count -gt 0) { throw ('Missing note markers: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: FAIL because the file does not exist yet.

- [ ] **Step 2: Create the note**

Create `resources/Independent Products.md` with exactly this content:

```markdown
---
tipo: recurso
fuente: interna
estado: activo
fecha: 2026-04-20
tags:
  - independent-products
  - portfolio
  - governance
related:
  - "[[Mapa de repos del ecosistema Anclora]]"
  - "[[INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT]]"
---

# Independent Products

`Independent Products` es un universo paralelo dentro de la bóveda para productos públicos, ligeros y monetizados fuera de `Anclora Group`.

## Regla de separación

- `Anclora Group` mantiene su posicionamiento premium y su sistema de marca propio.
- `Independent Products` no forma parte del ecosistema de marca de Anclora.
- Estos productos pueden reutilizar criterio interno de producto, pero no deben heredar branding, iconografía ni contratos visuales de Anclora por defecto.

## Fuente de verdad

- inventario canónico: `docs/governance/independent-products.json`
- contrato base: `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`

## Primer producto registrado

### `anclora-calculadora-fiscal-183`

- `domain`: `fiscal_finance`
- `business_model`: `ads`
- `product_archetype`: `calculator`
- `auth_model`: `public_no_auth`
- `distribution_model`: `seo`

## Criterio operativo

Este universo está pensado para:

- micro-SaaS sencillas
- calculators
- public tools
- productos SEO
- lead-gen tools
- apps monetizadas con Ads, afiliación o captación

## Regla de crecimiento

Si aparecen más productos de esta familia:

1. se añaden primero a `independent-products.json`
2. se documentan después aquí
3. si comparten reglas de UX/UI, se amplía `INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
```

- [ ] **Step 3: Run the content check again**

Run:

```powershell
powershell -NoProfile -Command "$note = Get-Content -Raw '.\resources\Independent Products.md'; $patterns = @('Independent Products','Anclora Group','independent-products.json','INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md','anclora-calculadora-fiscal-183','fiscal_finance','public_no_auth','ads'); $missing = $patterns | Where-Object { $note -notmatch [regex]::Escape($_) }; if ($missing.Count -gt 0) { throw ('Missing note markers: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add "resources/Independent Products.md"
git commit -m "docs: add independent products map note"
```

## Task 3: Create the Independent Utility Contract

**Files:**
- Create: `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
- Test: `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`

- [ ] **Step 1: Write the failing content check**

```powershell
powershell -NoProfile -Command "$contract = Get-Content -Raw '.\docs\standards\INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md'; $patterns = @('Independent Public Utility App Contract','no Anclora branding by default','mobile-first','result readability','ad placements','public_no_auth','seo'); $missing = $patterns | Where-Object { $contract -notmatch [regex]::Escape($_) }; if ($missing.Count -gt 0) { throw ('Missing contract markers: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: FAIL because the file does not exist yet.

- [ ] **Step 2: Create the contract**

Create `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md` with exactly this content:

```markdown
# Independent Public Utility App Contract

## Objetivo

Definir la base UX/UI y de producto para apps públicas ligeras fuera de `Anclora Group`, especialmente calculators, utilities y micro-productos orientados a SEO, Ads o captación.

## Regla de marca

- no Anclora branding by default
- no iconografía Anclora por defecto
- no gramática premium de Anclora por defecto

## Tipo de producto

Este contrato aplica a productos que suelen ser:

- públicos
- rápidos de entender
- `public_no_auth`
- orientados a `seo`
- monetizados con Ads, afiliación o captación

## Reglas obligatorias

### 1. Claridad inmediata

- El primer viewport debe explicar qué hace la herramienta y qué dato obtiene el usuario.
- La acción principal debe estar visible sin exploración compleja.

### 2. Input/output legible

- Los formularios deben ser simples y directos.
- Los resultados deben ser estables, escaneables y fáciles de interpretar.
- `result readability` es requisito contractual, no mejora opcional.

### 3. Móvil primero

- `mobile-first` por defecto.
- La app no puede depender de tablas frágiles, grids complejos o paneles laterales para funcionar.

### 4. Monetización compatible con confianza

- `ad placements` permitidos, pero no pueden romper la tarea principal.
- La publicidad no puede empujar el resultado principal fuera de la zona visible inmediata si eso daña la utilidad del producto.

### 5. SEO útil

- Los bloques SEO deben aportar contexto real.
- FAQ, explicaciones y notas deben reforzar la utilidad, no actuar solo como relleno.

### 6. Performance

- La rapidez percibida es parte del contrato.
- No introducir librerías, efectos o bloques pesados que degraden innecesariamente el tiempo de carga.

## Gate de aceptación

Una app no cumple este contrato si:

- parece una landing de marca en vez de una utilidad real
- oculta la acción principal o el resultado
- prioriza Ads por encima de la tarea principal
- rompe la experiencia móvil
- usa branding de Anclora sin ser parte de `Anclora Group`
```

- [ ] **Step 3: Run the content check again**

Run:

```powershell
powershell -NoProfile -Command "$contract = Get-Content -Raw '.\docs\standards\INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md'; $patterns = @('Independent Public Utility App Contract','no Anclora branding by default','mobile-first','result readability','ad placements','public_no_auth','seo'); $missing = $patterns | Where-Object { $contract -notmatch [regex]::Escape($_) }; if ($missing.Count -gt 0) { throw ('Missing contract markers: ' + ($missing -join ', ')) }; 'OK'"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md
git commit -m "docs: add independent utility app contract"
```

## Task 4: Final Review and Handoff

**Files:**
- Verify: `docs/governance/independent-products.json`
- Verify: `resources/Independent Products.md`
- Verify: `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`

- [ ] **Step 1: Run final diff review**

Run:

```powershell
git diff -- docs/governance/independent-products.json "resources/Independent Products.md" docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md
```

Expected: only the new Independent Products inventory, note, and contract appear

- [ ] **Step 2: Run final status check**

Run:

```powershell
git status --short
```

Expected: clean working tree or only unrelated pre-existing changes outside this plan

- [ ] **Step 3: Write handoff note**

Add this note to the final implementation summary:

```text
Next plan should decide whether Independent Products stays fully separate from anclora-design-system or whether a neutral shared public-utility layer should be extracted later.
```

- [ ] **Step 4: Commit any final touch-ups**

```bash
git add .
git commit -m "chore: finalize independent products foundation"
```
