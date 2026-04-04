# Anclora Data Lab Branding Regularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regularizar la parte de bóveda de `anclora-data-lab` contra los contratos de branding premium de Anclora, dejando constancia canónica de que la app debe quedar preparada estructuralmente para recibir los assets finales más adelante sin rehacer wiring.

**Architecture:** Este plan es solo de bóveda. La intención es dejar la nota canónica y el contexto contractual coherentes con la familia `Premium` y con los contratos de branding nuevos. No se audita ni se modifica el repo `anclora-data-lab` en este plan.

**Tech Stack:** Obsidian markdown, contratos de branding Anclora, notas canónicas, git.

---

## File Structure

### Vault

- Read:
  - `docs/governance/APPLICATION_FAMILY_MAP.md`
  - `docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md`
  - `docs/standards/ANCLORA_BRANDING_ICON_SYSTEM.md`
  - `docs/standards/ANCLORA_BRANDING_COLOR_TOKENS.md`
  - `docs/standards/ANCLORA_BRANDING_TYPOGRAPHY.md`
  - `docs/standards/ANCLORA_BRANDING_FAVICON_SPEC.md`
- Modify:
  - `research/anclora/anclora-data-lab.md`
- Modify only if there is evidence final that still needs to be recorded:
  - `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

### Verification

- Run:
  - `Get-Content research\anclora\anclora-data-lab.md`
  - `rg -n "anclora-data-lab|Anclora Data Lab|Premium|DM Sans|#2DA078|#12201C" docs/governance docs/standards research`

---

## Task 1: Confirm Premium Branding Target in the Vault

**Files:**
- Read: `docs/governance/APPLICATION_FAMILY_MAP.md`
- Read: branding contracts
- Modify if useful: `research/anclora/anclora-data-lab.md`

- [ ] **Step 1: Confirm contractual classification**

Run:

```powershell
rg -n "anclora-data-lab|Anclora Data Lab" docs/governance docs/standards research
```

Expected: confirm `Premium` family and branding target.

- [ ] **Step 2: Extract the branding target**

The expected target should be:

```md
- family: Premium
- icon border: copper
- accent: emerald `#2DA078`
- interior: navy green `#12201C`
- typography: `DM Sans`
- favicon package: required but final assets pending
```

- [ ] **Step 3: Update the canonical note if needed**

If `research/anclora/anclora-data-lab.md` does not state the branding target clearly, add a short section:

```md
## Branding canónico

- familia visual: `Premium`
- accent: `#2DA078`
- tipografía: `DM Sans`
- assets finales: pendientes de sustitución cuando el usuario los entregue
```

- [ ] **Step 4: Verify**

Run:

```powershell
Get-Content research\anclora\anclora-data-lab.md
```

Expected: the note reflects premium branding without over-expanding scope.

---

## Task 2: Record Evidence Only If It Exists

**Files:**
- Optional modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`

- [ ] **Step 1: Decide whether evidence final exists**

If and only if a later pass produces final evidence that should be preserved in governance, update the compliance matrix with the minimal delta needed.

- [ ] **Step 2: Otherwise leave the matrix untouched**

Do not force a governance update without an actual new state to record.

---

## Task 3: Close Out

- [ ] **Step 1: Verify git status**

Expected: only the intended vault files are changed.

- [ ] **Step 2: Commit if required**

If the user wants publication at this stage, commit only the vault-side changes.

- [ ] **Step 3: Do not touch external repos**

No repo-side branding work belongs to this plan.

If the final assets do not exist yet, keep placeholder/current paths but make the code ready for:

```md
- logo swap
- favicon package swap
- final palette refinement
```

- [ ] **Step 5: Verify**

Run:

```powershell
rg -n "Georgia|Cardo|Fraunces|DM Sans|accent|brand-" ..\anclora-data-lab
```

Expected: typography and tokens align with premium contracts.

---

## Task 5: Add Focused Branding Tests

**Files:**
- Modify or create tests under `../anclora-data-lab/tests` or repo equivalent

- [ ] **Step 1: Add a small branding contract test**

Example target:

```ts
it('keeps the Data Lab brand source of truth aligned', () => {
  expect(DATA_LAB_BRAND.name).toBe('Anclora Data Lab')
  expect(DATA_LAB_BRAND.theme.mode).toBe('premium')
})
```

- [ ] **Step 2: Add an asset wiring check if feasible**

Only if cheap and stable:

```md
- default logo source
- favicon path
```

- [ ] **Step 3: Verify tests**

Run the focused test command for the repo.

---

## Task 6: Final Verification and Publication

**Files:**
- Modify if needed:
  - `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
  - `research/anclora/anclora-data-lab.md`

- [ ] **Step 1: Run verification**

Run:

```powershell
npm run lint
npx vitest run
npm run build
```

Expected:
- lint passes
- tests pass
- build passes

- [ ] **Step 2: Record final branding evidence in the vault**

If appropriate, update the Data Lab row in `CONTRACT_COMPLIANCE_MATRIX.md` with wording like:

```md
branding premium estructural alineado; tipografía, tokens y wiring listos para sustitución de assets finales
```

- [ ] **Step 3: Commit and push both repos**

Vault commit should only cover evidence updates if they changed.

Repo commit should use a message like:

```bash
feat: align anclora-data-lab premium branding contract
```

---

## Self-Review

- **Spec coverage:** cubre solo branding premium estructural, no expande a contrato premium completo.
- **Placeholder scan:** no hay `TODO` ni decisiones críticas sin concretar.
- **Scope check:** el plan mantiene fuera la creación de assets finales, que vendrán del usuario.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-04-anclora-data-lab-branding-regularization-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
