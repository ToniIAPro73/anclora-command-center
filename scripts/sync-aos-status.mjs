#!/usr/bin/env node
// Snapshot de solo lectura del contrato machine-readable de AOS.
//
// Desde AOS_OPERATIONAL_INTERFACE (2026-08-17): AOS Runtime expone
// `aos status --json` (schemaVersion 1.0, solo JSON en stdout) y este script
// consume EL CONTRATO directamente. Ya NO existe pars de salida humana de
// ancho fijo (el antiguo parseStatusTable fue eliminado: HUMAN_CLI_PARSER=0).
//
// Si el formato humano de `aos status` cambia, este script NO se ve afectado.
// Si el contrato JSON cambia de forma breaking, se actualiza schemaVersion
// en el snapshot y el adapter decide (aosAdapter.ts valida version).
//
// Solo lectura. Este script NUNCA ejecuta `aos up`/`aos down`/`aos restart`.

import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const WORKSPACE_ROOT = resolve(REPO_ROOT, '..')
const AOS_BIN = resolve(WORKSPACE_ROOT, 'anclora-infrastructure/aos-runtime/bin/aos')
const OUTPUT_PATH = resolve(REPO_ROOT, 'src/generated/aos-status-snapshot.json')

// Version minima del contrato AOS que este script sabe consumir.
const MIN_SCHEMA_VERSION = '1.0'

function main() {
  const generatedAt = new Date().toISOString()

  if (!existsSync(AOS_BIN)) {
    const snapshot = {
      generatedAt,
      status: 'UNAVAILABLE',
      reason: `aos CLI no encontrado en ${AOS_BIN}`,
      schemaVersion: null,
      services: [],
    }
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')
    console.warn(`[sync-aos-status] AOS CLI no disponible — snapshot marcado UNAVAILABLE.`)
    return
  }

  try {
    // stdout del CLI = SOLO el payload JSON (contrato v1.0). Sin preprocesamiento.
    const stdout = execFileSync(AOS_BIN, ['status', '--json'], {
      encoding: 'utf-8',
      timeout: 15_000,
    })
    const contract = JSON.parse(stdout)
    if (!contract || contract.schemaVersion !== MIN_SCHEMA_VERSION) {
      throw new Error(
        `contrato AOS no soportado: schemaVersion=${contract?.schemaVersion ?? 'missing'}`
      )
    }
    const snapshot = {
      generatedAt,
      status: 'READY',
      reason: null,
      schemaVersion: contract.schemaVersion,
      generatedByAos: contract.generatedAt,
      summary: contract.summary,
      services: contract.services,
    }
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')
    console.log(
      `[sync-aos-status] Snapshot escrito con ${contract.services.length} servicios (schema ${contract.schemaVersion}).`
    )
  } catch (err) {
    const snapshot = {
      generatedAt,
      status: 'ERROR',
      reason: err instanceof Error ? err.message : String(err),
      schemaVersion: null,
      services: [],
    }
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')
    console.warn('[sync-aos-status] Fallo al invocar aos status --json — snapshot marcado ERROR.')
  }
}

main()