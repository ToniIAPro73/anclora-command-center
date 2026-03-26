---
name: obsidian-vault-gardener
description: Audit and tidy an Obsidian vault safely. Use when Codex needs to review note quality, normalize properties, improve links, reduce duplication, or propose low-risk vault cleanup work without breaking existing notes.
---

# Obsidian Vault Gardener

Use this skill when the user wants maintenance rather than net-new writing.

Favor safe, incremental improvements. Do not mass-rename or reorganize the vault unless the user asked for structural changes. Preserve the user's wording and note identity where possible.

## Workflow

1. Inspect before editing:
   - Find inconsistent property keys
   - Find empty stub notes
   - Find duplicate tags, duplicate titles, and obviously broken structure
2. Categorize issues:
   - Retrieval issues: weak titles, missing source, missing note type
   - Link issues: isolated notes, noisy placeholders, redundant duplicates
   - Workflow issues: inbox buildup, project notes without next action
3. Apply the smallest useful fix:
   - Normalize a few properties
   - Add or refine links
   - Merge only when duplication is clear
4. Report residual risk:
   - Call out assumptions
   - Separate confirmed problems from suggested improvements

## Guardrails

- Avoid changing many paths at once in a new or sparse vault.
- Prefer additive edits over destructive refactors.
- If a note has uncertain meaning, leave a short maintenance marker instead of guessing.

## When to read references

- Read [references/review-checklist.md](./references/review-checklist.md) for a lightweight audit checklist.

## Output standard

When reviewing, lead with the highest-impact issues. When editing, keep changes reversible and easy to understand.
