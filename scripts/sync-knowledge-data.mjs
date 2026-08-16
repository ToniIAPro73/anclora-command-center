#!/usr/bin/env node
// Copia un subconjunto normalizado de anclora-infrastructure/knowledge/generated/knowledge-model.json
// a src/generated/knowledge-snapshot.json para consumo por src/adapters/knowledgeAdapter.ts.
//
// Esto es una implementacion inicial minima por filesystem local (ver
// .anclora/AOS_ADOPTION.md, EX-CC-002 y anclora-infrastructure/audit/command-center-rebuild/03-data-sources.md
// para el gap documentado). Command Center NUNCA escribe en Knowledge/AKG: solo lee el
// artefacto ya generado por `anclora-infrastructure/knowledge/scripts/build_knowledge.py`.
//
// No incluye datos de products/repos "canonicos" reescritos localmente: es una copia de
// solo lectura del dataset ya normalizado, tomada tal cual, sin reinterpretar campos.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const WORKSPACE_ROOT = resolve(REPO_ROOT, '..')
const KNOWLEDGE_MODEL_PATH = resolve(
  WORKSPACE_ROOT,
  'anclora-infrastructure/knowledge/generated/knowledge-model.json',
)
const OUTPUT_PATH = resolve(REPO_ROOT, 'src/generated/knowledge-snapshot.json')

function main() {
  if (!existsSync(KNOWLEDGE_MODEL_PATH)) {
    console.error(
      `[sync-knowledge-data] No se encontro ${KNOWLEDGE_MODEL_PATH}. ` +
        'Ejecuta el build de anclora-infrastructure/knowledge antes de esta sincronizacion. ' +
        'Este script no genera datos: solo copia el artefacto ya construido.',
    )
    process.exit(1)
  }

  const raw = JSON.parse(readFileSync(KNOWLEDGE_MODEL_PATH, 'utf-8'))

  const snapshot = {
    schema_version: raw.schema_version,
    metadata: raw.metadata,
    entities: {
      repositories: raw.entities?.repositories ?? [],
      products: raw.entities?.products ?? [],
      services: raw.entities?.services ?? [],
      endpoints: raw.entities?.endpoints ?? [],
      standards: raw.entities?.standards ?? [],
      technologies: raw.entities?.technologies ?? [],
      'business-units': raw.entities?.['business-units'] ?? [],
    },
    relationships: raw.relationships ?? [],
    conflicts: raw.conflicts ?? [],
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')

  const counts = Object.fromEntries(
    Object.entries(snapshot.entities).map(([k, v]) => [k, v.length]),
  )
  console.log(
    `[sync-knowledge-data] Snapshot escrito en ${OUTPUT_PATH} ` +
      `(build_id=${snapshot.metadata?.rebuild_id ?? 'unknown'}, ` +
      `relationships=${snapshot.relationships.length}, conflicts=${snapshot.conflicts.length}) ` +
      JSON.stringify(counts),
  )
}

main()
