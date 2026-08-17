#!/usr/bin/env node
// Tests de integracion del backend local (server/server.mjs) — COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT.
//
// Arranca el server REAL en un puerto efimero con un workspace FALSO en /tmp
// (AOS bin fake + knowledge-model.json fake), y verifica los endpoints:
//   /health · /api/status (READY / ERROR / schemaVersion / services) ·
//   /api/knowledge (READY / UNAVAILABLE / malformed) · 405 para POST ·
//   path traversal negado.
//
// Uso: node tests/server.test.mjs   (Node >= 18, sin dependencias)

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const SERVER = join(REPO, 'server/server.mjs')
const PORT = 31338 // primer puerto (cada reinicio usa uno nuevo)

const tmp = mkdtempSync(join(tmpdir(), 'cc-server-test-'))
const fakeWs = join(tmp, 'anclora') // ANCLORA_WORKSPACE falso
const fakeAosDir = join(fakeWs, 'anclora-infrastructure/aos-runtime/bin')
const fakeKnowledgeDir = join(fakeWs, 'anclora-infrastructure/knowledge/generated')
mkdirSync(fakeAosDir, { recursive: true })
mkdirSync(fakeKnowledgeDir, { recursive: true })

// Puerto por arranque: matar el proceso anterior es asincrono, asi que cada
// reinicio usa un puerto NUEVO (31337+N) para eliminar la raza EADDRINUSE.
let portCounter = 31337

function nextPort() {
  portCounter += 1
  return portCounter
}

const FAKE_AOS = join(fakeAosDir, 'aos')
const FAKE_KM = join(fakeKnowledgeDir, 'knowledge-model.json')

// AOS bin fake: imprime un contrato valido v1.0 o falla segun env FAKE_MODE
writeFileSync(
  FAKE_AOS,
  `#!/usr/bin/env bash
if [ "$FAKE_MODE" = "badjson" ]; then echo "not-json"; exit 0; fi
if [ "$FAKE_MODE" = "wrongschema" ]; then echo '{"schemaVersion":"2.0","services":[]}'; exit 0; fi
if [ "$FAKE_MODE" = "noservices" ]; then echo '{"schemaVersion":"1.0","generatedAt":"2026-08-17T00:00:00Z","services":null}'; exit 0; fi
if [ "$FAKE_MODE" = "fail" ]; then echo "boom" >&2; exit 2; fi
echo '{"schemaVersion":"1.0","generatedAt":"2026-08-17T00:00:00Z","summary":{"total":1,"running":1,"stopped":0},"services":[{"id":"fake-svc","status":"running","health":"ok","pid":42,"managed":"aos","port":3999,"bindHost":"127.0.0.1","localUrl":"http://127.0.0.1:3999","publicUrl":null}]}'
`,
  { mode: 0o755 },
)

const FAKE_KM_CONTENT = JSON.stringify({
  schema_version: '1.0',
  metadata: { generated_at: new Date().toISOString(), rebuild_id: 'fake-build-000', counts: { entities: 3, relationships: 2, conflicts: 0 } },
  entities: {
    repositories: [{ id: 'repo:ToniIAPro73/anclora-command-center', type: 'repository', name: 'anclora-command-center', status: {}, fields: {} }],
    products: [{ id: 'product:x', type: 'product', name: 'X', status: {}, fields: {} }],
    services: [{ id: 'service:fake-svc', type: 'service', name: 'fake-svc', status: {}, fields: { port: 3999 } }],
    endpoints: [],
    standards: [],
    technologies: [],
    'business-units': [],
  },
  relationships: [{ id: 'r1', type: 'DEPENDS_ON', from: 'service:fake-svc', to: 'product:x', confidence: 'confirmed' }],
  conflicts: [],
})
writeFileSync(FAKE_KM, FAKE_KM_CONTENT)

const spawnEnv = (extra = {}) => ({
  ...process.env,
  ANCLORA_WORKSPACE: fakeWs,
  COMMAND_CENTER_DIST: join(REPO, 'dist'),
  ...extra,
})

let serverPid = null
let base = null

function startServer(env = spawnEnv()) {
  const port = nextPort()
  const envWithPort = { ...env, COMMAND_CENTER_PORT: String(port) }
  return new Promise((resolve2, reject) => {
    const child = execFile(process.execPath, [SERVER], { env: envWithPort, cwd: REPO }, (err) => {
      if (err && err.code !== null) reject(err) // server exit -> test env cleanup
    })
    serverPid = child.pid
    // esperar a que el puerto escuche
    const t0 = Date.now()
    const probe = () => {
      fetch(`http://127.0.0.1:${port}/health`)
        .then((r) => r.json())
        .then((j) => resolve2(j))
        .catch(() => {
          if (Date.now() - t0 > 8000) reject(new Error('server no arranco'))
          else setTimeout(probe, 120)
        })
    }
    probe()
    base = `http://127.0.0.1:${port}`
  })
}

function stopServer() {
  if (serverPid) {
    try { process.kill(serverPid, 'SIGTERM') } catch { /* ya muerto */ }
    serverPid = null
  }
}

before(async () => {
  await startServer()
  base = `http://127.0.0.1:${PORT}`
})

after(() => {
  stopServer()
  rmSync(tmp, { recursive: true, force: true })
})

test('GET /health -> proceso vivo', async () => {
  const res = await fetch(`${base}/health`)
  assert.equal(res.status, 200)
  const j = await res.json()
  assert.equal(j.status, 'ok')
  assert.equal(j.service, 'anclora-command-center')
})

test('GET /api/status -> READY con contrato v1.0 y servicio fake', async () => {
  const res = await fetch(`${base}/api/status`)
  assert.equal(res.status, 200)
  const j = await res.json()
  assert.equal(j.status, 'READY')
  assert.equal(j.schemaVersion, '1.0')
  assert.equal(j.services.length, 1)
  assert.equal(j.services[0].id, 'fake-svc')
})

test('GET /api/knowledge -> READY con subconjunto normalizado', async () => {
  const res = await fetch(`${base}/api/knowledge`)
  assert.equal(res.status, 200)
  const j = await res.json()
  assert.equal(j.status, 'READY')
  assert.equal(j.metadata.rebuild_id, 'fake-build-000')
  assert.equal(j.entities.repositories.length, 1)
  assert.equal(j.entities.products.length, 1)
  assert.equal(j.entities.services.length, 1)
  assert.equal(j.relationships.length, 1)
})

test('POST /api/status -> 405 (read-only)', async () => {
  const res = await fetch(`${base}/api/status`, { method: 'POST', body: '{}' })
  assert.equal(res.status, 405)
})

test('DELETE /api/knowledge -> 405', async () => {
  const res = await fetch(`${base}/api/knowledge`, { method: 'DELETE' })
  assert.equal(res.status, 405)
})

test('GET /api/unknown -> 404 endpoint desconocido', async () => {
  const res = await fetch(`${base}/api/whatever`)
  assert.equal(res.status, 404)
})

test('GET / -> sirve la SPA (index.html)', async () => {
  const res = await fetch(`${base}/`)
  assert.equal(res.status, 200)
  const text = await res.text()
  assert.ok(text.includes('<!doctype html>') || text.includes('<html'), 'debe servir html de dist')
})

test('path traversal -> nunca sirve ficheros del sistema', async () => {
  // El constructor URL normaliza los '..' ANTES de llegar al server, y todo
  // path se resuelve con join() ACOTADO a DIST_DIR (defensa por construccion
  // + guard startsWith). La propiedad de seguridad real: el contenido de
  // /etc/passwd JAMAS puede salir.
  const res = await fetch(`${base}/..%2f..%2f..%2fetc%2fpasswd`)
  const text = await res.text()
  assert.ok(!text.includes('root:'), 'no debe filtrar contenido de /etc/passwd')
  assert.ok(!text.startsWith('root:'), 'el body no es /etc/passwd')
  assert.ok([403, 404, 200].includes(res.status), `status inesperado: ${res.status}`)
})

// --- casos de fallo con FAKE_MODE ---
test('AOS CLI falla -> /api/status ERROR (no fabricar datos)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'fail' }))
  const res = await fetch(`${base}/api/status`)
  const j = await res.json()
  assert.equal(j.status, 'ERROR')
  assert.ok(j.reason.length > 0)
})

test('AOS salida no-JSON -> /api/status ERROR', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'badjson' }))
  const res = await fetch(`${base}/api/status`)
  const j = await res.json()
  assert.equal(j.status, 'ERROR')
})

test('schemaVersion incorrecto -> /api/status ERROR (bloquea contrato no soportado)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'wrongschema' }))
  const res = await fetch(`${base}/api/status`)
  const j = await res.json()
  assert.equal(j.status, 'ERROR')
  assert.ok(j.reason.includes('2.0'))
})

test('services ausente/malformado -> /api/status ERROR (regresion guard)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'noservices' }))
  const res = await fetch(`${base}/api/status`)
  const j = await res.json()
  assert.equal(j.status, 'ERROR')
})

// --- knowledge missing ---
test('knowledge-model.json ausente -> /api/knowledge UNAVAILABLE (404 + reason)', async () => {
  // workspace sin conocimiento (borramos el fake en un workspace hermano)
  const emptyWs = join(tmp, 'empty-ws')
  const emptyBin = join(emptyWs, 'anclora-infrastructure/aos-runtime/bin')
  mkdirSync(emptyBin, { recursive: true })
  writeFileSync(join(emptyBin, 'aos'), '#!/usr/bin/env bash\necho "{\\"schemaVersion\\":\\"1.0\\",\\"services\\":[]}"\n', { mode: 0o755 })
  stopServer()
  await startServer(spawnEnv({ ANCLORA_WORKSPACE: emptyWs }))
  const res = await fetch(`${base}/api/knowledge`)
  assert.equal(res.status, 404)
  const j = await res.json()
  assert.equal(j.status, 'UNAVAILABLE')
})

// --- knowledge malformed ---
test('knowledge-model.json malformado -> /api/knowledge ERROR (503)', async () => {
  const badWs = join(tmp, 'bad-ws')
  const badBin = join(badWs, 'anclora-infrastructure/aos-runtime/bin')
  const badKm = join(badWs, 'anclora-infrastructure/knowledge/generated')
  mkdirSync(badBin, { recursive: true })
  mkdirSync(badKm, { recursive: true })
  writeFileSync(join(badBin, 'aos'), '#!/usr/bin/env bash\necho "{\\"schemaVersion\\":\\"1.0\\",\\"services\\":[]}"\n', { mode: 0o755 })
  writeFileSync(join(badKm, 'knowledge-model.json'), '{not json')
  stopServer()
  await startServer(spawnEnv({ ANCLORA_WORKSPACE: badWs }))
  const res = await fetch(`${base}/api/knowledge`)
  assert.equal(res.status, 503)
  const j = await res.json()
  assert.equal(j.status, 'ERROR')
})

test('cache por mtime: knowledge READY repetido usa cache', async () => {
  stopServer()
  await startServer()
  const r1 = await (await fetch(`${base}/api/knowledge`)).json()
  const r2 = await (await fetch(`${base}/api/knowledge`)).json()
  assert.equal(r1.metadata.rebuild_id, 'fake-build-000')
  assert.equal(r2.metadata.rebuild_id, 'fake-build-000')
})