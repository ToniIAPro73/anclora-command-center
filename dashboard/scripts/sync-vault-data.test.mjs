import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const generatedFile = path.join(dashboardRoot, 'src', 'generated', 'vault-data.json')

test('sync-vault-data maps partner estado into status in generated payload', () => {
  execFileSync('node', ['./scripts/sync-vault-data.mjs'], {
    cwd: dashboardRoot,
    stdio: 'pipe',
  })

  const payload = JSON.parse(fs.readFileSync(generatedFile, 'utf8'))
  const javier = payload.partners.find((partner) => partner.title === 'Javier Ortega')

  assert.ok(javier, 'expected Javier Ortega in generated partners list')
  assert.equal(javier.status, 'prospecto')
  assert.ok(
    payload.partners.every((partner) => typeof partner.status === 'string' && partner.status.length > 0),
    'expected every generated partner to include a non-empty status',
  )
})
