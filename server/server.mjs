#!/usr/bin/env node
// Command Center local backend — ejecucion VPS-native (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT).
//
// Objetivo: servir la SPA (dist/) y exponer SOLO los datos operacionales reales
// que Command Center consume como interfaz operacional interna de AOS:
//   GET /health          -> proceso vivo (healthcheck de AOS/systemd)
//   GET /api/status      -> contrato `aos status --json` (schemaVersion 1.0) ejecutado en vivo
//   GET /api/knowledge   -> knowledge-model.json derivado (Knowledge/AKG) con cache por mtime
//
// Principios:
//   - READ-ONLY: solo GET; cualquier otro metodo -> 405. Sin escrituras al runtime.
//   - Loopback-only (127.0.0.1). Caddy es el unico entrypoint publico.
//   - Sin ejecucion arbitraria: el unico comando permitido es `aos status --json`.
//   - Sin acceso arbitrario a filesystem: rutas fijas desde config/env, nunca del request.
//   - Sin secretos: solo rutas y estado operativo; nunca se lee .env del workspace.
//   - Sin LLM, sin deps externas: Node nativo (node:http / node:fs / node:child_process).
//
// Configuracion (env, con defaults derivados del workspace local):
//   COMMAND_CENTER_PORT       (default 3024)
//   ANCLORA_WORKSPACE         (default <repo>/../..  -> /home/toni/workspace/anclora)
//   COMMAND_CENTER_DIST       (default <repo>/dist)
//
// Los paths del workspace se resuelven desde ANCLORA_WORKSPACE; nunca desde
// rutas absolutas hardcodeadas en la aplicacion.

import { createServer } from 'node:http'
import { execFile } from 'node:child_process'
import { readFile, stat, existsSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const WORKSPACE_ROOT = resolve(REPO_ROOT, '..')
const DEFAULT_WORKSPACE = process.env.ANCLORA_WORKSPACE || WORKSPACE_ROOT

const PORT = Number(process.env.COMMAND_CENTER_PORT || 3024)
const DIST_DIR = resolve(process.env.COMMAND_CENTER_DIST || join(REPO_ROOT, 'dist'))
const AOS_BIN = join(DEFAULT_WORKSPACE, 'anclora-infrastructure/aos-runtime/bin/aos')
const KNOWLEDGE_MODEL = join(
  DEFAULT_WORKSPACE,
  'anclora-infrastructure/knowledge/generated/knowledge-model.json',
)

const MIN_AOS_SCHEMA = '1.0'
const HOST = '127.0.0.1'

// Knowledge cache: se relee solo cuando cambia el mtime (Knowledge cambia poco).
let knowledgeCache = { mtimeMs: 0, payload: null }

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
  })
  res.end(body)
}

function sendMethodNotAllowed(res) {
  res.writeHead(405, { Allow: 'GET', 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Method Not Allowed — Command Center backend es read-only (solo GET)\n')
}

// ------------------------------------------------------------------ endpoints
function runAosStatus(cb) {
  execFile(AOS_BIN, ['status', '--json'], { timeout: 20_000, encoding: 'utf-8' }, (err, stdout) => {
    if (err) {
      const reason = `aos CLI no disponible o fallo al ejecutar: ${AOS_BIN} (${err.message})`
      cb({ status: 'ERROR', reason, schemaVersion: null, services: [] })
      return
    }
    let contract = null
    try {
      contract = JSON.parse(stdout)
    } catch (parseErr) {
      cb({ status: 'ERROR', reason: `Salida de aos status --json no es JSON valido: ${parseErr.message}`, schemaVersion: null, services: [] })
      return
    }
    if (!contract || contract.schemaVersion !== MIN_AOS_SCHEMA) {
      cb({
        status: 'ERROR',
        reason: `Contrato AOS no soportado: schemaVersion=${contract?.schemaVersion ?? 'missing'} (soportado: ${MIN_AOS_SCHEMA})`,
        schemaVersion: contract?.schemaVersion ?? null,
        services: [],
      })
      return
    }
    if (!Array.isArray(contract.services)) {
      cb({ status: 'ERROR', reason: 'Contrato AOS malformado: services no es un array', schemaVersion: contract.schemaVersion, services: [] })
      return
    }
    cb({
      status: 'READY',
      reason: null,
      schemaVersion: contract.schemaVersion,
      generatedAt: contract.generatedAt,
      summary: contract.summary,
      services: contract.services,
    })
  })
}

function loadKnowledgeModel(cb) {
  stat(KNOWLEDGE_MODEL, (statErr, st) => {
    if (statErr) {
      cb({
        status: 'UNAVAILABLE',
        reason: `knowledge-model.json no encontrado en ${KNOWLEDGE_MODEL}. Ejecuta el build de anclora-infrastructure/knowledge.`,
        payload: null,
      })
      return
    }
    if (knowledgeCache.payload && st.mtimeMs === knowledgeCache.mtimeMs) {
      cb({ status: 'READY', reason: null, payload: knowledgeCache.payload, mtimeMs: st.mtimeMs })
      return
    }
    readFile(KNOWLEDGE_MODEL, 'utf-8', (readErr, raw) => {
      if (readErr) {
        cb({ status: 'ERROR', reason: `No se pudo leer knowledge-model.json: ${readErr.message}`, payload: null })
        return
      }
      try {
        const parsed = JSON.parse(raw)
        knowledgeCache = { mtimeMs: st.mtimeMs, payload: parsed }
        cb({ status: 'READY', reason: null, payload: parsed, mtimeMs: st.mtimeMs })
      } catch (parseErr) {
        cb({ status: 'ERROR', reason: `knowledge-model.json no es JSON valido: ${parseErr.message}`, payload: null })
      }
    })
  })
}

// ------------------------------------------------------------------ static SPA
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveStatic(req, res, urlPath) {
  let filePath = resolve(join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath))
  // nunca servir fuera de dist (path traversal) — el resolve anterior ya queda
  // acotado por join normalizado; verificacion extra por seguridad:
  if (!filePath.startsWith(resolve(DIST_DIR))) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  if (!existsSync(filePath)) filePath = join(DIST_DIR, 'index.html') // SPA fallback
  readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }
    const type = CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
    res.end(data)
  })
}

// ------------------------------------------------------------------ server
const server = createServer((req, res) => {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res)
    return
  }
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const path = url.pathname

  if (path === '/health') {
    sendJson(res, 200, { status: 'ok', service: 'anclora-command-center', port: PORT, uptimeSeconds: Math.round(process.uptime()) })
    return
  }
  if (path === '/api/status') {
    runAosStatus((payload) => sendJson(res, 200, payload))
    return
  }
  if (path === '/api/knowledge') {
    loadKnowledgeModel(({ status, reason, payload, mtimeMs }) => {
      if (status !== 'READY') {
        sendJson(res, status === 'UNAVAILABLE' ? 404 : 503, { status, reason })
        return
      }
      // solo el subconjunto normalizado (mismo shape que sync-knowledge-data.mjs),
      // nunca el dataset completo crudo (601KB+ por request innecesario).
      sendJson(res, 200, {
        status: 'READY',
        schema_version: payload.schema_version,
        metadata: payload.metadata,
        entities: {
          repositories: payload.entities?.repositories ?? [],
          products: payload.entities?.products ?? [],
          services: payload.entities?.services ?? [],
          endpoints: payload.entities?.endpoints ?? [],
          standards: payload.entities?.standards ?? [],
          technologies: payload.entities?.technologies ?? [],
          'business-units': payload.entities?.['business-units'] ?? [],
        },
        relationships: payload.relationships ?? [],
        conflicts: payload.conflicts ?? [],
        mtimeMs,
      })
    })
    return
  }
  if (path.startsWith('/api/')) {
    sendJson(res, 404, { status: 'ERROR', reason: `Endpoint desconocido: ${path}` })
    return
  }
  serveStatic(req, res, path)
})

server.on('error', (err) => {
  console.error('[command-center-server] Error fatal:', err.message)
  process.exit(1)
})

server.listen(PORT, HOST, () => {
  console.log(`[command-center-server] Command Center (VPS-native) escuchando en ${HOST}:${PORT}`)
  console.log(`[command-center-server] AOS bin: ${AOS_BIN}`)
  console.log(`[command-center-server] Knowledge model: ${KNOWLEDGE_MODEL}`)
  console.log(`[command-center-server] Dist: ${DIST_DIR}`)
  if (!existsSync(AOS_BIN)) console.warn('[command-center-server] WARN: aos CLI no existe — /api/status devolvera ERROR')
  if (!existsSync(KNOWLEDGE_MODEL)) console.warn('[command-center-server] WARN: knowledge-model.json no existe — /api/knowledge devolvera UNAVAILABLE')
})