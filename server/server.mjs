#!/usr/bin/env node
// Command Center local backend — ejecucion VPS-native (COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT).
//
// Objetivo: servir la SPA (dist/) y exponer los datos operacionales reales
// que Command Center consume como interfaz operacional interna de AOS:
//   GET  /health                      -> proceso vivo (healthcheck de AOS/systemd)
//   GET  /api/status                  -> contrato `aos status --json` (schemaVersion 1.x) ejecutado en vivo
//   GET  /api/knowledge               -> knowledge-model.json derivado (Knowledge/AKG) con cache por mtime
//   GET  /api/audit                   -> ultimas operaciones de escritura (en memoria, no persistente)
//   POST /api/services/:id/action     -> UNICA operacion de escritura (COMMAND_CENTER_OPERATIONAL_CONSOLE_V1)
//
// Principios:
//   - CASI READ-ONLY: todo es GET salvo `POST /api/services/:id/action`, que es
//     la unica escritura permitida y esta estrictamente acotada (ver abajo).
//     Cualquier otro metodo/ruta -> 405.
//   - Loopback-only (127.0.0.1). Caddy es el unico entrypoint publico.
//   - Sin ejecucion arbitraria: comandos fijos via execFile (nunca shell),
//     el unico binario es `aos` y los unicos verbos son status/up/down/restart.
//   - service :id SIEMPRE se valida contra el listado EN VIVO de
//     `aos status --json` (managed=aos) antes de ejecutar nada — el id del
//     request nunca se confia ciegamente, y jamas se interpola en un shell.
//   - command-center NUNCA puede pararse/reiniciarse desde su propia UI
//     (self-stop policy, Seccion 38) -> 409.
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

const SUPPORTED_AOS_SCHEMAS = ['1.0', '1.1'] // 1.1 = + service.state + endpoints
const HOST = '127.0.0.1'

// Repository runtime (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY):
// STRICTLY READ-ONLY. repositoryId es SIEMPRE un census_id validado contra el
// registro derivado de knowledge-model.json (entities.repositories con
// local_present=true) — nunca un path del request. Git se ejecuta con
// execFile + argument array (nunca shell), cwd fijo desde el registro.
const CBM_METADATA_PATH = join(DEFAULT_WORKSPACE, 'anclora-infrastructure/codebase-memory/data/metadata.json')
const GIT_TIMEOUT_MS = 8_000
const REPO_RUNTIME_CACHE_TTL_MS = 45_000
const REPO_RUNTIME_CONCURRENCY = 4

// Self-stop policy (Seccion 38): command-center jamas se para/reinicia desde
// su propia UI. Bloqueo explicito, no implicito.
const SELF_SERVICE_ID = 'command-center'
const SERVICE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/
const ALLOWED_OPS = new Set(['start', 'stop', 'restart'])
const OP_TO_AOS_VERB = { start: 'up', stop: 'down', restart: 'restart' }
const MAX_ACTION_BODY_BYTES = 2048

// Knowledge cache: se relee solo cuando cambia el mtime (Knowledge cambia poco).
let knowledgeCache = { mtimeMs: 0, payload: null }

// Audit log en memoria (Seccion 40): timestamp/operation/service/result/duration.
// Sin persistencia, sin secretos, sin PII. Se pierde al reiniciar el proceso
// (aceptable para esta fase — no es un sistema de auditoria de cumplimiento).
const AUDIT_MAX_ENTRIES = 200
const auditLog = []

function recordAudit(entry) {
  auditLog.unshift({ timestamp: new Date().toISOString(), ...entry })
  if (auditLog.length > AUDIT_MAX_ENTRIES) auditLog.length = AUDIT_MAX_ENTRIES
}

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
    if (!contract || !SUPPORTED_AOS_SCHEMAS.includes(contract.schemaVersion)) {
      cb({
        status: 'ERROR',
        reason: `Contrato AOS no soportado: ${contract?.schemaVersion ?? 'missing'} (soportados: ${SUPPORTED_AOS_SCHEMAS.join(', ')})`,
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
      // aditivo en 1.1; tolerar ausencia (contrato 1.0)
      endpoints: Array.isArray(contract.endpoints) ? contract.endpoints : [],
    })
  })
}

// ------------------------------------------------------------------ write action
function readJsonBody(req, cb) {
  let size = 0
  const chunks = []
  req.on('data', (chunk) => {
    size += chunk.length
    if (size > MAX_ACTION_BODY_BYTES) {
      req.destroy()
      cb(new Error('body too large'), null)
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString('utf-8')
      cb(null, raw ? JSON.parse(raw) : {})
    } catch (err) {
      cb(err, null)
    }
  })
  req.on('error', (err) => cb(err, null))
}

function runAosVerb(verb, serviceId, cb) {
  const startedAt = Date.now()
  execFile(AOS_BIN, [verb, serviceId], { timeout: 20_000, encoding: 'utf-8' }, (err, stdout, stderr) => {
    cb({ ok: !err, durationMs: Date.now() - startedAt, message: err ? (stderr || err.message) : stdout })
  })
}

// ------------------------------------------------------------------ repository runtime (read-only)

// Registro server-side de repositorios: SOLO entidades Knowledge con
// local_present=true y census_id valido. El id del request se valida contra
// las claves de este Map — nunca se construye un path desde input del cliente.
function buildRepositoryRegistry(knowledgePayload) {
  const registry = new Map()
  const repos = knowledgePayload?.entities?.repositories
  if (!Array.isArray(repos)) return registry
  for (const r of repos) {
    const censusId = r?.fields?.census_id
    if (typeof censusId !== 'string' || !SERVICE_ID_PATTERN.test(censusId)) continue
    if (r?.fields?.local_present !== true) continue
    registry.set(censusId, { knowledgeId: r.id, path: join(DEFAULT_WORKSPACE, censusId) })
  }
  return registry
}

function execGit(args, cwd, cb) {
  execFile('git', args, { cwd, timeout: GIT_TIMEOUT_MS, encoding: 'utf-8', maxBuffer: 2_000_000 }, cb)
}

// Parsea la primera linea de `git status --porcelain=v1 --branch` — formato
// estable documentado, nunca texto coloreado. Cubre: rama normal (con o sin
// upstream), detached HEAD, unborn branch (sin commits).
function parseBranchHeader(line) {
  const result = { branch: null, detached: false, upstream: null, ahead: null, behind: null, unborn: false }
  if (!line || !line.startsWith('## ')) return result
  const rest = line.slice(3)
  if (rest === 'HEAD (no branch)') {
    result.detached = true
    return result
  }
  const unborn = rest.match(/^No commits yet on (.+)$/)
  if (unborn) {
    result.branch = unborn[1]
    result.unborn = true
    return result
  }
  const bracketMatch = rest.match(/^(.*?)(?: \[(.*)\])?$/)
  const head = bracketMatch ? bracketMatch[1] : rest
  const bracket = bracketMatch ? bracketMatch[2] : null
  const dots = head.indexOf('...')
  if (dots === -1) {
    result.branch = head
    return result
  }
  result.branch = head.slice(0, dots)
  result.upstream = head.slice(dots + 3)
  result.ahead = 0
  result.behind = 0
  if (bracket) {
    const a = bracket.match(/ahead (\d+)/)
    const b = bracket.match(/behind (\d+)/)
    if (a) result.ahead = Number(a[1])
    if (b) result.behind = Number(b[1])
  }
  return result
}

function parseStatusLines(lines) {
  let modified = 0, added = 0, deleted = 0, renamed = 0, untracked = 0
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('??')) {
      untracked++
      continue
    }
    const x = line[0], y = line[1]
    if (x === 'R' || y === 'R') renamed++
    else if (x === 'A' || y === 'A') added++
    else if (x === 'D' || y === 'D') deleted++
    else if (x === 'M' || y === 'M') modified++
  }
  return { modified, added, deleted, renamed, untracked }
}

// Seccion 14: independiente de cualquier presentacion colapsada — deja los
// facets (ahead/behind/dirty) intactos, esto solo deriva la etiqueta de sync.
function classifyDivergence({ upstream, ahead, behind }) {
  if (!upstream) return 'NO_UPSTREAM'
  if (ahead === null || behind === null) return 'UNKNOWN'
  if (ahead > 0 && behind > 0) return 'DIVERGED'
  if (ahead > 0) return 'AHEAD'
  if (behind > 0) return 'BEHIND'
  return 'SYNCED'
}

function parseLastCommit(raw) {
  if (!raw) return null
  const [hash, shortHash, subject, authorName, date] = raw.split('\x1f')
  if (!hash) return null
  return { hash, shortHash: shortHash ?? hash.slice(0, 12), subject: subject ?? '', authorName: authorName ?? '', date: date ?? null }
}

// UNA lectura de estado real por repo: `status --porcelain=v1 --branch`
// (rama + upstream + ahead/behind + working tree, todo en una sola llamada
// estable) + `log -1` (ultimo commit). Nunca `git fetch` — ahead/behind
// refleja SOLO refs remotos ya conocidos localmente (Seccion 15).
function probeRepository(repositoryId, entry, cb) {
  const observedAt = new Date().toISOString()
  execGit(['status', '--porcelain=v1', '--branch'], entry.path, (err, stdout) => {
    if (err) {
      cb({
        repositoryId,
        knowledgeId: entry.knowledgeId,
        available: false,
        observedAt,
        errors: [`git status fallo: ${String(err.message).split('\n')[0]}`],
        branch: null,
        detached: false,
        head: null,
        shortHead: null,
        clean: null,
        modifiedCount: 0,
        addedCount: 0,
        deletedCount: 0,
        renamedCount: 0,
        untrackedCount: 0,
        upstream: null,
        ahead: null,
        behind: null,
        divergence: 'UNKNOWN',
        lastCommit: null,
      })
      return
    }
    const lines = stdout.split('\n')
    const header = parseBranchHeader(lines[0] ?? '')
    const counts = parseStatusLines(lines.slice(1))
    const clean = header.unborn ? null : Object.values(counts).every((n) => n === 0)
    execGit(['log', '-1', '--format=%H%x1f%h%x1f%s%x1f%an%x1f%aI'], entry.path, (logErr, logOut) => {
      const lastCommit = logErr ? null : parseLastCommit(logOut.trim())
      cb({
        repositoryId,
        knowledgeId: entry.knowledgeId,
        available: true,
        observedAt,
        errors: header.unborn ? ['sin commits todavia'] : [],
        branch: header.branch,
        detached: header.detached,
        head: lastCommit?.hash ?? null,
        shortHead: lastCommit?.shortHash ?? null,
        clean,
        modifiedCount: counts.modified,
        addedCount: counts.added,
        deletedCount: counts.deleted,
        renamedCount: counts.renamed,
        untrackedCount: counts.untracked,
        upstream: header.upstream,
        ahead: header.ahead,
        behind: header.behind,
        divergence: classifyDivergence(header),
        lastCommit,
      })
    })
  })
}

// Concurrencia acotada (Seccion 26): sin dependencia — ~14 repos, 4 en vuelo.
function runBounded(items, limit, worker, cb) {
  if (items.length === 0) {
    cb([])
    return
  }
  const results = new Array(items.length)
  let idx = 0, active = 0, done = 0
  function next() {
    while (active < limit && idx < items.length) {
      const i = idx
      idx++
      active++
      worker(items[i], (r) => {
        results[i] = r
        active--
        done++
        if (done === items.length) cb(results)
        else next()
      })
    }
  }
  next()
}

// Cache de lote con TTL (Seccion 25/43): evita spawnear git para ~14 repos
// en cada poll de 30s del cliente. La lectura de un repo individual (drawer
// open) NUNCA usa esta cache — siempre prueba en vivo.
let repoRuntimeBatchCache = { at: 0, data: null, observedAt: null }

function getRepositoriesRuntimeBatch(registry, cb) {
  const now = Date.now()
  if (repoRuntimeBatchCache.data && now - repoRuntimeBatchCache.at < REPO_RUNTIME_CACHE_TTL_MS) {
    cb(repoRuntimeBatchCache.data, repoRuntimeBatchCache.observedAt)
    return
  }
  const entries = [...registry.entries()]
  runBounded(entries, REPO_RUNTIME_CONCURRENCY, ([repositoryId, entry], done) => probeRepository(repositoryId, entry, done), (results) => {
    const observedAt = new Date().toISOString()
    repoRuntimeBatchCache = { at: Date.now(), data: results, observedAt }
    cb(results, observedAt)
  })
}

// CBM (Seccion 29/30): SOLO lectura de data/metadata.json (ya generado por
// cbm.py, nunca se invoca el CLI ni se dispara un build). Cache por mtime,
// igual patron que loadKnowledgeModel. El quirk conocido STALE_COMMIT se
// muestra tal cual (raw), nunca se oculta ni se convierte en critical aqui.
let cbmMetadataCache = { mtimeMs: 0, payload: null }

function loadCbmMetadata(cb) {
  stat(CBM_METADATA_PATH, (statErr, st) => {
    if (statErr) {
      cb(null)
      return
    }
    if (cbmMetadataCache.payload && st.mtimeMs === cbmMetadataCache.mtimeMs) {
      cb(cbmMetadataCache.payload)
      return
    }
    readFile(CBM_METADATA_PATH, 'utf-8', (readErr, raw) => {
      if (readErr) {
        cb(null)
        return
      }
      try {
        const parsed = JSON.parse(raw)
        cbmMetadataCache = { mtimeMs: st.mtimeMs, payload: parsed }
        cb(parsed)
      } catch {
        cb(null)
      }
    })
  })
}

function cbmForRepo(cbmPayload, repositoryId) {
  const entry = cbmPayload?.repos?.[repositoryId]
  if (!entry) return { available: false }
  return {
    available: true,
    freshness: typeof entry.freshness === 'string' ? entry.freshness : 'UNKNOWN',
    indexedHead: typeof entry.indexedHead === 'string' ? entry.indexedHead.slice(0, 12) : null,
    headCommit: typeof entry.headCommit === 'string' ? entry.headCommit.slice(0, 12) : null,
    workingTree: typeof entry.workingTree === 'string' ? entry.workingTree : 'unknown',
  }
}

// POST /api/services/:id/action { op: 'start'|'stop'|'restart' }
// El unico punto de escritura del backend. El :id del request NUNCA se confia:
// se revalida contra el listado EN VIVO de `aos status --json` (managed=aos)
// antes de tocar el runtime. Ningun valor del request llega a un shell —
// execFile con argument array, nunca interpolacion de string.
function handleServiceAction(req, res, serviceId) {
  if (!SERVICE_ID_PATTERN.test(serviceId)) {
    sendJson(res, 400, { status: 'ERROR', reason: `service id invalido: ${JSON.stringify(serviceId)}` })
    return
  }
  readJsonBody(req, (bodyErr, body) => {
    if (bodyErr) {
      sendJson(res, 400, { status: 'ERROR', reason: 'body invalido (JSON esperado)' })
      return
    }
    const op = body && typeof body.op === 'string' ? body.op : null
    if (!op || !ALLOWED_OPS.has(op)) {
      sendJson(res, 400, { status: 'ERROR', reason: `op invalida: ${JSON.stringify(op)} (permitidas: start, stop, restart)` })
      return
    }
    if (serviceId === SELF_SERVICE_ID && (op === 'stop' || op === 'restart')) {
      sendJson(res, 409, {
        status: 'BLOCKED',
        reason: `command-center no puede ${op === 'stop' ? 'pararse' : 'reiniciarse'} desde su propia UI (self-stop policy).`,
      })
      return
    }
    runAosStatus((statusPayload) => {
      if (statusPayload.status !== 'READY') {
        sendJson(res, 503, { status: 'ERROR', reason: 'AOS no disponible: no se puede validar el servicio antes de actuar.' })
        return
      }
      const svc = (statusPayload.services || []).find((s) => s.id === serviceId)
      if (!svc) {
        sendJson(res, 404, { status: 'ERROR', reason: `Servicio desconocido en el runtime AOS: ${serviceId}` })
        return
      }
      if (svc.managed !== 'aos') {
        sendJson(res, 403, { status: 'ERROR', reason: `Servicio managed=${svc.managed ?? 'unknown'}: solo servicios AOS-managed aceptan acciones.` })
        return
      }
      const verb = OP_TO_AOS_VERB[op]
      runAosVerb(verb, serviceId, ({ ok, durationMs, message }) => {
        recordAudit({ operation: op, service: serviceId, result: ok ? 'OK' : 'FAILED', durationMs })
        if (!ok) {
          sendJson(res, 500, { status: 'ERROR', reason: `aos ${verb} ${serviceId} fallo: ${message}` })
          return
        }
        sendJson(res, 200, { status: 'OK', service: serviceId, op, durationMs })
      })
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
const SERVICE_ACTION_ROUTE = /^\/api\/services\/([^/]+)\/action$/
const REPO_RUNTIME_ROUTE = /^\/api\/repositories\/([^/]+)\/runtime$/

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const path = url.pathname

  // Unica ruta que acepta POST — todo lo demas sigue siendo GET-only.
  const actionMatch = path.match(SERVICE_ACTION_ROUTE)
  if (actionMatch) {
    if (req.method !== 'POST') {
      res.writeHead(405, { Allow: 'POST', 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Method Not Allowed\n')
      return
    }
    handleServiceAction(req, res, decodeURIComponent(actionMatch[1]))
    return
  }

  if (req.method !== 'GET') {
    sendMethodNotAllowed(res)
    return
  }

  if (path === '/health') {
    sendJson(res, 200, { status: 'ok', service: 'anclora-command-center', port: PORT, uptimeSeconds: Math.round(process.uptime()) })
    return
  }
  if (path === '/api/status') {
    runAosStatus((payload) => sendJson(res, 200, payload))
    return
  }
  if (path === '/api/audit') {
    sendJson(res, 200, { status: 'READY', entries: auditLog })
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
  if (path === '/api/repositories/runtime') {
    loadKnowledgeModel(({ status, payload }) => {
      if (status !== 'READY') {
        sendJson(res, 503, { status: 'UNAVAILABLE', reason: 'Knowledge no disponible: no se puede resolver el registro de repositorios.' })
        return
      }
      const registry = buildRepositoryRegistry(payload)
      loadCbmMetadata((cbm) => {
        getRepositoriesRuntimeBatch(registry, (results, observedAt) => {
          const repositories = results.map((r) => ({ ...r, cbm: cbmForRepo(cbm, r.repositoryId) }))
          const anyUnavailable = repositories.some((r) => !r.available)
          sendJson(res, 200, {
            status: anyUnavailable ? 'DEGRADED' : 'READY',
            observedAt,
            repositories,
          })
        })
      })
    })
    return
  }
  const repoRuntimeMatch = path.match(REPO_RUNTIME_ROUTE)
  if (repoRuntimeMatch) {
    const repositoryId = decodeURIComponent(repoRuntimeMatch[1])
    if (!SERVICE_ID_PATTERN.test(repositoryId)) {
      sendJson(res, 404, { status: 'ERROR', reason: `repository id invalido: ${JSON.stringify(repositoryId)}` })
      return
    }
    loadKnowledgeModel(({ status, payload }) => {
      if (status !== 'READY') {
        sendJson(res, 503, { status: 'UNAVAILABLE', reason: 'Knowledge no disponible: no se puede resolver el registro de repositorios.' })
        return
      }
      const registry = buildRepositoryRegistry(payload)
      const entry = registry.get(repositoryId)
      if (!entry) {
        sendJson(res, 404, { status: 'ERROR', reason: `Repositorio desconocido: ${repositoryId}` })
        return
      }
      loadCbmMetadata((cbm) => {
        probeRepository(repositoryId, entry, (result) => {
          sendJson(res, result.available ? 200 : 502, {
            status: result.available ? 'READY' : 'ERROR',
            repository: { ...result, cbm: cbmForRepo(cbm, repositoryId) },
          })
        })
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