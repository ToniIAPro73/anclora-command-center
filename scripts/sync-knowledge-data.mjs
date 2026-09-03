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
//
// Patron tolerante (igual que sync-aos-status.mjs): si el artefacto no existe — p.ej. en
// un entorno de build aislado, donde SOLO se clona este repositorio y no existe
// el workspace con anclora-infrastructure — se escribe un snapshot VACIO marcado
// como tal y el script termina con exit 0. El adapter devuelve EMPTY/UNAVAILABLE a la UI
// en lugar de romper el deploy. En desarrollo/local el artefacto real se copia tal cual.

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

function emptySnapshot(generatedAt, reason) {
  return {
    schema_version: 'unavailable',
    metadata: {
      generated_at: generatedAt,
      rebuild_id: null,
      counts: { entities: 0, relationships: 0, conflicts: 0 },
      unavailable_reason: reason,
    },
    entities: {
      repositories: [],
      products: [],
      services: [],
      endpoints: [],
      standards: [],
      technologies: [],
      'business-units': [],
    },
    relationships: [],
    conflicts: [],
  }
}

function main() {
  const generatedAt = new Date().toISOString()

  if (!existsSync(KNOWLEDGE_MODEL_PATH)) {
    // Entorno sin workspace (CI/build aislado): no fallar el build, escribir
    // snapshot vacio explícitamente marcado. La UI muestra EMPTY/UNAVAILABLE.
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(emptySnapshot(generatedAt, `No se encontro ${KNOWLEDGE_MODEL_PATH}`), null, 2) + '\n',
      'utf-8',
    )
    console.warn(
      `[sync-knowledge-data] Artefacto Knowledge no disponible en ${KNOWLEDGE_MODEL_PATH} — ` +
        'snapshot vacio escrito (UNAVAILABLE). En local: ejecuta el build de ' +
        'anclora-infrastructure/knowledge antes de esta sincronizacion.',
    )
    return
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
