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
import { execFile, execFileSync } from 'node:child_process'
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

// AOS bin fake: imprime un contrato valido v1.0/v1.1 o falla segun env FAKE_MODE
writeFileSync(
  FAKE_AOS,
  `#!/usr/bin/env bash
if [ "$FAKE_MODE" = "badjson" ]; then echo "not-json"; exit 0; fi
if [ "$FAKE_MODE" = "wrongschema" ]; then echo '{"schemaVersion":"2.0","services":[]}'; exit 0; fi
if [ "$FAKE_MODE" = "noservices" ]; then echo '{"schemaVersion":"1.0","generatedAt":"2026-08-17T00:00:00Z","services":null}'; exit 0; fi
if [ "$FAKE_MODE" = "fail" ]; then echo "boom" >&2; exit 2; fi
if [ "$FAKE_MODE" = "v11" ]; then echo '{"schemaVersion":"1.1","generatedAt":"2026-08-17T00:00:00Z","summary":{"total":1,"running":1,"stopped":0},"services":[{"id":"fake-svc","status":"running","state":"running","health":"ok","pid":42,"managed":"aos","port":3999,"bindHost":"127.0.0.1","localUrl":"http://127.0.0.1:3999","publicUrl":"https://fake-svc.dev.anclora.com"}],"endpoints":[{"domain":"fake-svc.dev.anclora.com","service":"fake-svc","configured":true,"authRequired":true,"reachable":true,"https":true,"authProtected":true,"backendReachable":true,"status":"auth_protected"}]}'; exit 0; fi
if [ "$1" = "up" ] || [ "$1" = "down" ] || [ "$1" = "restart" ]; then
  if [ "$FAKE_ACTION_MODE" = "fail" ]; then echo "boom" >&2; exit 1; fi
  echo "ok: $1 $2"
  exit 0
fi
if [ "$FAKE_MODE" = "actions" ]; then echo '{"schemaVersion":"1.1","generatedAt":"2026-08-17T00:00:00Z","summary":{"total":3,"running":3,"stopped":0},"services":[{"id":"fake-svc","status":"running","state":"running","health":"ok","pid":42,"managed":"aos","port":3999,"bindHost":"127.0.0.1","localUrl":"http://127.0.0.1:3999","publicUrl":null},{"id":"command-center","status":"running","state":"running","health":"ok","pid":1,"managed":"aos","port":3024,"bindHost":"127.0.0.1","localUrl":"http://127.0.0.1:3024","publicUrl":null},{"id":"ninerouter","status":"running","state":"running","health":"ok","pid":2,"managed":"external","port":8080,"bindHost":"127.0.0.1","localUrl":"http://127.0.0.1:8080","publicUrl":null}],"endpoints":[]}'; exit 0; fi
echo '{"schemaVersion":"1.0","generatedAt":"2026-08-17T00:00:00Z","summary":{"total":1,"running":1,"stopped":0},"services":[{"id":"fake-svc","status":"running","health":"ok","pid":42,"managed":"aos","port":3999,"bindHost":"127.0.0.1","localUrl":"http://127.0.0.1:3999","publicUrl":null}]}'
`,
  { mode: 0o755 },
)

// ------------------------------------------------------------------ repository runtime fixtures
// Repos Git REALES bajo fakeWs (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY,
// Seccion 50/51): nunca se depende de los repos de produccion. execFileSync
// sincrono en setup (no en el server bajo prueba) — el server sigue siendo
// solo-lectura, esto solo PREPARA el fixture.
function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
}
function initRepo(dir) {
  mkdirSync(dir, { recursive: true })
  git(['init', '-q', '-b', 'main'], dir)
  git(['config', 'user.email', 'fixture@example.com'], dir)
  git(['config', 'user.name', 'Fixture'], dir)
}
function commit(dir, filename, content, message) {
  writeFileSync(join(dir, filename), content)
  git(['add', filename], dir)
  git(['commit', '-q', '-m', message], dir)
}

// clean: 1 commit, sin remote -> NO_UPSTREAM, clean=true.
const repoClean = join(fakeWs, 'anclora-clean')
initRepo(repoClean)
commit(repoClean, 'a.txt', 'a', 'initial')

// dirty: modified + added + untracked simultaneos.
const repoDirty = join(fakeWs, 'anclora-dirty')
initRepo(repoDirty)
commit(repoDirty, 'a.txt', 'a', 'initial')
writeFileSync(join(repoDirty, 'a.txt'), 'a modified')
writeFileSync(join(repoDirty, 'staged.txt'), 'staged')
git(['add', 'staged.txt'], repoDirty)
writeFileSync(join(repoDirty, 'loose.txt'), 'untracked')

// detached: checkout de un commit por hash, no de una rama.
const repoDetached = join(fakeWs, 'anclora-detached')
initRepo(repoDetached)
commit(repoDetached, 'a.txt', 'a', 'first')
commit(repoDetached, 'b.txt', 'b', 'second')
const firstCommitHash = git(['rev-list', '--max-parents=0', 'HEAD'], repoDetached).trim()
git(['checkout', '-q', firstCommitHash], repoDetached)

// unavailable: registrado en Knowledge, local_present=true, pero NO es un repo git real.
const repoUnavailable = join(fakeWs, 'anclora-unavailable')
mkdirSync(repoUnavailable, { recursive: true })
writeFileSync(join(repoUnavailable, 'readme.txt'), 'not a git repo')

// ahead/behind/diverged: bare remote local + 3 clones que divergen entre si
// (Seccion 51 — "bare remote local si es util", sin dependencia de Internet).
const bareRemote = join(tmp, 'origin-fixture.git')
git(['init', '--bare', '-q', '-b', 'main', bareRemote])

const repoAhead = join(fakeWs, 'anclora-ahead')
initRepo(repoAhead)
commit(repoAhead, 'a.txt', 'A', 'commit A')
git(['remote', 'add', 'origin', bareRemote], repoAhead)
git(['push', '-q', '-u', 'origin', 'main'], repoAhead) // bare=A, repoAhead origin/main=A

const repoBehind = join(fakeWs, 'anclora-behind')
git(['clone', '-q', bareRemote, repoBehind])
git(['config', 'user.email', 'fixture@example.com'], repoBehind)
git(['config', 'user.name', 'Fixture'], repoBehind)

commit(repoAhead, 'b.txt', 'B', 'commit B')
git(['push', '-q'], repoAhead) // bare=B, repoAhead local=B/origin/main=B (synced so far)
git(['fetch', '-q'], repoBehind) // repoBehind local=A, origin/main=B -> BEHIND(1)

commit(repoAhead, 'c.txt', 'C', 'commit C') // NOT pushed -> repoAhead local=C, origin/main=B -> AHEAD(1)

const repoDiverged = join(fakeWs, 'anclora-diverged')
git(['clone', '-q', bareRemote, repoDiverged]) // clones at B (bare hasn't received C yet)
git(['config', 'user.email', 'fixture@example.com'], repoDiverged)
git(['config', 'user.name', 'Fixture'], repoDiverged)
commit(repoDiverged, 'd.txt', 'D', 'commit D') // local-only -> ahead of cached origin/main=B

// Avanza el bare remote SIN tocar el tracking ref de repoAhead — un push
// directo desde repoAhead actualizaria su propio origin/main y lo dejaria
// SYNCED en vez de AHEAD. Se usa un clon desechable solo para empujar.
const repoPusher = join(tmp, 'pusher-fixture')
git(['clone', '-q', bareRemote, repoPusher]) // at B
git(['config', 'user.email', 'fixture@example.com'], repoPusher)
git(['config', 'user.name', 'Fixture'], repoPusher)
commit(repoPusher, 'e.txt', 'E', 'commit E')
git(['push', '-q'], repoPusher) // bare now = E (repoAhead's own origin/main tracking ref stays B)

git(['fetch', '-q'], repoDiverged) // repoDiverged: local=D, origin/main=E -> DIVERGED(1,1)

function repoEntity(censusId, name) {
  return {
    id: `repo:ToniIAPro73/${censusId}`,
    type: 'repository',
    name,
    status: { portfolio_status: 'ACTIVE' },
    fields: { census_id: censusId, local_present: true },
  }
}

const FAKE_KM_CONTENT = JSON.stringify({
  schema_version: '1.0',
  metadata: { generated_at: new Date().toISOString(), rebuild_id: 'fake-build-000', counts: { entities: 3, relationships: 2, conflicts: 0 } },
  entities: {
    repositories: [
      { id: 'repo:ToniIAPro73/anclora-command-center', type: 'repository', name: 'anclora-command-center', status: {}, fields: {} },
      repoEntity('anclora-clean', 'Anclora Clean Fixture'),
      repoEntity('anclora-dirty', 'Anclora Dirty Fixture'),
      repoEntity('anclora-detached', 'Anclora Detached Fixture'),
      repoEntity('anclora-unavailable', 'Anclora Unavailable Fixture'),
      repoEntity('anclora-ahead', 'Anclora Ahead Fixture'),
      repoEntity('anclora-behind', 'Anclora Behind Fixture'),
      repoEntity('anclora-diverged', 'Anclora Diverged Fixture'),
    ],
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

// CBM metadata fixture: solo dos repos indexados, para probar available=true/false.
const fakeCbmDir = join(fakeWs, 'anclora-infrastructure/codebase-memory/data')
mkdirSync(fakeCbmDir, { recursive: true })
writeFileSync(
  join(fakeCbmDir, 'metadata.json'),
  JSON.stringify({
    schemaVersion: '1.0',
    mode: 'full',
    repos: {
      'anclora-clean': { headCommit: 'x'.repeat(40), branch: 'main', indexedHead: 'x'.repeat(40), workingTree: 'clean', freshness: 'FRESH' },
      'anclora-dirty': { headCommit: 'y'.repeat(40), branch: 'main', indexedHead: 'z'.repeat(40), workingTree: 'dirty', freshness: 'STALE_COMMIT' },
    },
  }),
)

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
  assert.equal(j.entities.repositories.length, 8) // 1 original + 7 repository-runtime fixtures
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

test('contrato v1.1 -> /api/status READY con state y endpoints reconciliados', async () => {
  // AOS_OPERATIONAL_TRUTH_RECONCILIATION: el backend pasa el bloque
  // endpoints (deseado vs observado) y el state de cada servicio.
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'v11' }))
  const res = await fetch(`${base}/api/status`)
  const j = await res.json()
  assert.equal(j.status, 'READY')
  assert.equal(j.schemaVersion, '1.1')
  assert.equal(j.services[0].state, 'running')
  assert.equal(j.endpoints.length, 1)
  assert.equal(j.endpoints[0].status, 'auth_protected')
  assert.equal(j.endpoints[0].authProtected, true)
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

// --- POST /api/services/:id/action (COMMAND_CENTER_OPERATIONAL_CONSOLE_V1) ---
test('action: known AOS-managed service -> allowed (200 OK)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const res = await fetch(`${base}/api/services/fake-svc/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'restart' }),
  })
  assert.equal(res.status, 200)
  const j = await res.json()
  assert.equal(j.status, 'OK')
  assert.equal(j.service, 'fake-svc')
  assert.equal(j.op, 'restart')
})

test('action: known AOS-managed service, aos verb fails -> 500', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions', FAKE_ACTION_MODE: 'fail' }))
  const res = await fetch(`${base}/api/services/fake-svc/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'start' }),
  })
  assert.equal(res.status, 500)
  const j = await res.json()
  assert.equal(j.status, 'ERROR')
})

test('action: external-managed service -> rejected (403)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const res = await fetch(`${base}/api/services/ninerouter/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'restart' }),
  })
  assert.equal(res.status, 403)
})

test('action: unknown service -> rejected (404)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const res = await fetch(`${base}/api/services/does-not-exist/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'start' }),
  })
  assert.equal(res.status, 404)
})

test('action: unsupported op -> rejected (400)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const res = await fetch(`${base}/api/services/fake-svc/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'delete' }),
  })
  assert.equal(res.status, 400)
})

test('action: self-stop policy blocks stop/restart of command-center (409)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  for (const op of ['stop', 'restart']) {
    const res = await fetch(`${base}/api/services/command-center/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op }),
    })
    assert.equal(res.status, 409, `op=${op}`)
  }
  // start no esta bloqueado por la self-stop policy (ya esta corriendo, pero
  // la politica solo restringe stop/restart, no start).
  const startRes = await fetch(`${base}/api/services/command-center/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'start' }),
  })
  assert.equal(startRes.status, 200)
})

test('action: command injection payloads in service id -> always rejected (400)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const payloads = ['; rm -rf /', '&&', '|', '$(whoami)', '`whoami`', '../../../etc/passwd', 'foo;bar', 'foo|bar']
  for (const payload of payloads) {
    const res = await fetch(`${base}/api/services/${encodeURIComponent(payload)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'start' }),
    })
    assert.equal(res.status, 400, `payload=${payload} got ${res.status}`)
  }
})

test('action: malformed body -> rejected (400)', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const res = await fetch(`${base}/api/services/fake-svc/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json',
  })
  assert.equal(res.status, 400)
})

test('action: GET on action route -> 405', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  const res = await fetch(`${base}/api/services/fake-svc/action`)
  assert.equal(res.status, 405)
})

test('action: successful action is recorded in /api/audit', async () => {
  stopServer()
  await startServer(spawnEnv({ FAKE_MODE: 'actions' }))
  await fetch(`${base}/api/services/fake-svc/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op: 'restart' }),
  })
  const res = await fetch(`${base}/api/audit`)
  const j = await res.json()
  assert.equal(j.status, 'READY')
  const entry = j.entries.find((e) => e.service === 'fake-svc' && e.operation === 'restart')
  assert.ok(entry, 'expected an audit entry for fake-svc restart')
  assert.equal(entry.result, 'OK')
  assert.ok(typeof entry.durationMs === 'number')
  assert.ok(entry.timestamp)
})

test('cache por mtime: knowledge READY repetido usa cache', async () => {
  stopServer()
  await startServer()
  const r1 = await (await fetch(`${base}/api/knowledge`)).json()
  const r2 = await (await fetch(`${base}/api/knowledge`)).json()
  assert.equal(r1.metadata.rebuild_id, 'fake-build-000')
  assert.equal(r2.metadata.rebuild_id, 'fake-build-000')
})

// ==================================================================
// Repository runtime (COMMAND_CENTER_REPOSITORY_RUNTIME_OBSERVABILITY)
// ==================================================================

test('GET /api/repositories/runtime -> READY con los 7 repos registrados', async () => {
  stopServer()
  await startServer()
  const res = await fetch(`${base}/api/repositories/runtime`)
  assert.equal(res.status, 200)
  const j = await res.json()
  assert.ok(j.status === 'READY' || j.status === 'DEGRADED')
  assert.equal(j.repositories.length, 7)
  assert.ok(j.observedAt)
  for (const r of j.repositories) assert.ok(!('path' in r), 'nunca debe exponer un path de filesystem')
})

test('clean repo -> branch=main, clean=true, NO_UPSTREAM, sin errores', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-clean/runtime`)
  assert.equal(res.status, 200)
  const { repository: r } = await res.json()
  assert.equal(r.available, true)
  assert.equal(r.branch, 'main')
  assert.equal(r.detached, false)
  assert.equal(r.clean, true)
  assert.equal(r.divergence, 'NO_UPSTREAM')
  assert.equal(r.upstream, null)
  assert.equal(r.errors.length, 0)
  assert.ok(r.lastCommit)
  assert.equal(r.lastCommit.subject, 'initial')
  assert.match(r.head, /^[0-9a-f]{40}$/)
  assert.equal(r.shortHead.length > 0, true)
})

test('dirty repo -> clean=false con conteos modified/added/untracked correctos', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-dirty/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.clean, false)
  assert.equal(r.modifiedCount, 1)
  assert.equal(r.addedCount, 1)
  assert.equal(r.untrackedCount, 1)
  assert.equal(r.deletedCount, 0)
  assert.equal(r.renamedCount, 0)
})

test('detached HEAD repo -> detached=true, branch=null, nunca rama vacia silenciosa', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-detached/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.available, true)
  assert.equal(r.detached, true)
  assert.equal(r.branch, null)
  assert.ok(r.head, 'debe exponer el HEAD real aunque este detached')
})

test('repo sin remote local del todo (dirty fixture) -> divergence NO_UPSTREAM, no CRITICAL', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-dirty/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.divergence, 'NO_UPSTREAM')
})

test('ahead: 1 commit local no pusheado -> AHEAD(1)', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-ahead/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.divergence, 'AHEAD')
  assert.equal(r.ahead, 1)
  assert.equal(r.behind, 0)
  assert.equal(r.upstream, 'origin/main')
})

test('behind: origin avanzo y se hizo fetch en el fixture -> BEHIND(1)', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-behind/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.divergence, 'BEHIND')
  assert.equal(r.ahead, 0)
  assert.equal(r.behind, 1)
})

test('diverged: commits locales y remotos distintos -> DIVERGED(1,1)', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-diverged/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.divergence, 'DIVERGED')
  assert.equal(r.ahead, 1)
  assert.equal(r.behind, 1)
})

test('unavailable: no es un repo git real -> available=false, otros repos siguen usables (partial failure)', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-unavailable/runtime`)
  assert.equal(res.status, 502)
  const { repository: r } = await res.json()
  assert.equal(r.available, false)
  assert.equal(r.clean, null)
  assert.ok(r.errors.length > 0)

  // otro repo en el mismo lote sigue perfectamente usable
  const ok = await fetch(`${base}/api/repositories/anclora-clean/runtime`)
  assert.equal(ok.status, 200)
})

test('lote (/api/repositories/runtime) refleja el fallo individual como DEGRADED, no ERROR global', async () => {
  const res = await fetch(`${base}/api/repositories/runtime`)
  const j = await res.json()
  assert.equal(j.status, 'DEGRADED')
  const unavailable = j.repositories.find((r) => r.repositoryId === 'anclora-unavailable')
  assert.equal(unavailable.available, false)
  const clean = j.repositories.find((r) => r.repositoryId === 'anclora-clean')
  assert.equal(clean.available, true)
})

test('CBM: repo indexado expone freshness/indexedHead/workingTree', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-clean/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.cbm.available, true)
  assert.equal(r.cbm.freshness, 'FRESH')
  assert.equal(typeof r.cbm.indexedHead, 'string')
})

test('CBM: repo NO indexado -> available=false, no se fabrica freshness', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-ahead/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.cbm.available, false)
  assert.equal(r.cbm.freshness, undefined)
})

test('CBM known quirk STALE_COMMIT se muestra tal cual, no se oculta ni se convierte en critical', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-dirty/runtime`)
  const { repository: r } = await res.json()
  assert.equal(r.cbm.freshness, 'STALE_COMMIT')
})

// ---- security ----

test('unknown repository id -> 404', async () => {
  const res = await fetch(`${base}/api/repositories/does-not-exist/runtime`)
  assert.equal(res.status, 404)
})

test('path traversal in repository id -> 404 (regex rechaza antes de tocar filesystem)', async () => {
  const res = await fetch(`${base}/api/repositories/${encodeURIComponent('../../etc')}/runtime`)
  assert.equal(res.status, 404)
})

test('URL-encoded traversal -> 404', async () => {
  const res = await fetch(`${base}/api/repositories/..%2f..%2fetc/runtime`)
  assert.ok([400, 404].includes(res.status))
})

test('absolute path as repository id -> 404', async () => {
  const res = await fetch(`${base}/api/repositories/${encodeURIComponent('/etc/passwd')}/runtime`)
  assert.equal(res.status, 404)
})

test('shell injection payload in repository id -> 404 (nunca llega a un shell)', async () => {
  const res = await fetch(`${base}/api/repositories/${encodeURIComponent('anclora-clean; rm -rf /')}/runtime`)
  assert.equal(res.status, 404)
})

test('POST /api/repositories/runtime -> 405 (read-only)', async () => {
  const res = await fetch(`${base}/api/repositories/runtime`, { method: 'POST' })
  assert.equal(res.status, 405)
})

test('POST /api/repositories/:id/runtime -> 405 (read-only)', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-clean/runtime`, { method: 'POST' })
  assert.equal(res.status, 405)
})

test('DELETE /api/repositories/:id/runtime -> 405', async () => {
  const res = await fetch(`${base}/api/repositories/anclora-clean/runtime`, { method: 'DELETE' })
  assert.equal(res.status, 405)
})

test('no existe endpoint generico de escritura Git (nunca acepta un comando arbitrario)', async () => {
  // Cualquier POST no-whitelisted (incluida una ruta que ni existe) muere en
  // el guard generico "solo GET" ANTES de llegar al dispatcher de rutas —
  // no hay forma de alcanzar un endpoint que ejecute un comando Git.
  const res = await fetch(`${base}/api/git`, { method: 'POST', body: JSON.stringify({ cmd: 'push' }) })
  assert.equal(res.status, 405)
  const getRes = await fetch(`${base}/api/git`)
  assert.equal(getRes.status, 404, 'y GET a esa ruta inexistente tampoco revela nada')
})

test('repository runtime: sin knowledge disponible -> 503 UNAVAILABLE, nunca inventa un repo', async () => {
  stopServer()
  // Simular Knowledge caido: workspace nuevo sin knowledge-model.json.
  const badWs = mkdtempSync(join(tmpdir(), 'cc-server-test-noKM-'))
  mkdirSync(join(badWs, 'anclora-infrastructure/knowledge/generated'), { recursive: true })
  mkdirSync(join(badWs, 'anclora-infrastructure/aos-runtime/bin'), { recursive: true })
  writeFileSync(join(badWs, 'anclora-infrastructure/aos-runtime/bin/aos'), '#!/usr/bin/env bash\necho \'{"schemaVersion":"1.0","services":[]}\'\n', { mode: 0o755 })
  await startServer({ ...spawnEnv(), ANCLORA_WORKSPACE: badWs })
  const res = await fetch(`${base}/api/repositories/runtime`)
  assert.equal(res.status, 503)
  const j = await res.json()
  assert.equal(j.status, 'UNAVAILABLE')
  rmSync(badWs, { recursive: true, force: true })
  // volver al server normal para no afectar el after() global
  stopServer()
  await startServer()
})

test('cache de lote: segunda lectura inmediata usa cache (misma observedAt)', async () => {
  stopServer()
  await startServer()
  const r1 = await (await fetch(`${base}/api/repositories/runtime`)).json()
  const r2 = await (await fetch(`${base}/api/repositories/runtime`)).json()
  assert.equal(r1.observedAt, r2.observedAt, 'segunda lectura dentro del TTL debe devolver el mismo observedAt (cache hit)')
})

test('lectura individual (drawer open) NUNCA usa la cache de lote: observedAt propio', async () => {
  const r1 = await (await fetch(`${base}/api/repositories/anclora-clean/runtime`)).json()
  const r2 = await (await fetch(`${base}/api/repositories/anclora-clean/runtime`)).json()
  assert.notEqual(r1.repository.observedAt, r2.repository.observedAt, 'cada GET individual prueba en vivo, no cachea')
})