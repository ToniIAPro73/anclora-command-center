#!/usr/bin/env node
// Snapshot de solo lectura de `aos status` (aos-runtime v2, CLI de texto plano, sin API HTTP).
//
// GAP DOCUMENTADO (ver anclora-infrastructure/audit/command-center-rebuild/03-data-sources.md):
// AOS Runtime v1/v2 no expone una API programatica ni salida --json. Este script invoca el
// CLI real y parsea su salida de texto de ancho fijo. Es deliberadamente minimo: si el formato
// de `aos status` cambia, este script debe actualizarse (no hay contrato estable todavia).
//
// Solo lectura. Este script NUNCA ejecuta `aos up`/`aos down`/`aos restart` ni ninguna
// operacion de escritura (ver Seccion 9 de COMMAND_CENTER_REBUILD: READ > WRITE).

import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const WORKSPACE_ROOT = resolve(REPO_ROOT, '..')
const AOS_BIN = resolve(WORKSPACE_ROOT, 'anclora-infrastructure/aos-runtime/bin/aos')
const OUTPUT_PATH = resolve(REPO_ROOT, 'src/generated/aos-status-snapshot.json')

function parseStatusTable(stdout) {
  const lines = stdout.trim().split('\n')
  if (lines.length < 2) return []
  // Cabecera de ancho fijo: "SERVICE  PORT  PROCESS  HEALTH" — parseo tolerante por whitespace.
  const rows = lines.slice(1)
  return rows
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s{2,}/).map((p) => p.trim())
      const [service, port, processState, health] = parts
      return {
        service: service ?? null,
        port: port ? Number.parseInt(port, 10) || port : null,
        processState: processState ?? 'UNKNOWN',
        health: health && health !== '-' ? health : 'UNKNOWN',
      }
    })
    .filter((row) => row.service)
}

function main() {
  const generatedAt = new Date().toISOString()

  if (!existsSync(AOS_BIN)) {
    const snapshot = {
      generatedAt,
      status: 'UNAVAILABLE',
      reason: `aos CLI no encontrado en ${AOS_BIN}`,
      services: [],
    }
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')
    console.warn(`[sync-aos-status] AOS CLI no disponible — snapshot marcado UNAVAILABLE.`)
    return
  }

  try {
    const stdout = execFileSync(AOS_BIN, ['status'], { encoding: 'utf-8', timeout: 15_000 })
    const services = parseStatusTable(stdout)
    const snapshot = { generatedAt, status: 'READY', reason: null, services }
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')
    console.log(`[sync-aos-status] Snapshot escrito con ${services.length} servicios.`)
  } catch (err) {
    const snapshot = {
      generatedAt,
      status: 'ERROR',
      reason: err instanceof Error ? err.message : String(err),
      services: [],
    }
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')
    console.warn('[sync-aos-status] Fallo al invocar aos status — snapshot marcado ERROR.')
  }
}

main()
