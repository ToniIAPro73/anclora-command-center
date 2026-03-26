---
name: obsidian-cli
description: Interact with an Obsidian vault through the CLI for reading, creating, moving, and auditing notes. Use when Codex needs programmatic vault operations rather than raw file edits.
---

# Obsidian CLI

Use this skill when the vault should be inspected or modified through the Obsidian command line interface instead of direct file manipulation.

This is a support skill for safe vault-aware operations such as moving notes, appending content, reading backlinks, or checking orphaned notes.

## Workflow

1. Check whether the task benefits from vault-aware behavior:
   - link-preserving moves
   - structured searches
   - property-aware edits
   - orphan or unresolved-link audits
2. Prefer the smallest useful CLI action.
3. Validate the result if the command changes structure or metadata.

## Guardrails

* Do not assume the CLI is available unless verified.
* Prefer safe operations over destructive ones.
* Use direct file edits only when the CLI adds no value.

## When to read references

* Read [references/obsidian-cli-reference.md](./references/obsidian-cli-reference.md) for common commands and safety rules.

## Output standard

Use the CLI to make or inspect changes with minimal disruption and report any assumptions about CLI availability.
