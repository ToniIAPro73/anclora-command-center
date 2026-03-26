---
name: defuddle
description: Extract clean markdown from web pages while preserving useful metadata and provenance. Use when Codex needs to ingest web content into the vault without navigation clutter.
---

# Defuddle

Use this skill when the task involves turning messy web content into clean markdown that can be stored in the vault.

This is a support skill for ingestion, clipping, and turning online material into research or resource notes.

## Workflow

1. Decide whether the output is:
   - quick capture
   - research note input
   - stable resource material
2. Preserve provenance:
   - source URL
   - publication date if known
   - author if known
3. Extract only the useful content and keep the note easy to refine later.

## Guardrails

* Do not strip away source context.
* Do not assume extraction is perfect on heavily dynamic pages.
* Prefer lightweight cleanup over heavy rewriting unless the user asked for synthesis.

## When to read references

* Read [references/defuddle-reference.md](./references/defuddle-reference.md) for common usage patterns.

## Output standard

Produce clean markdown or capture-ready content that can be saved into the vault with minimal follow-up editing.
