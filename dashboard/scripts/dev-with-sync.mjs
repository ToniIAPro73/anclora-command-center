import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const vaultRoot = path.resolve(dashboardRoot, '..')

const syncCommand = ['node', ['./scripts/sync-vault-data.mjs']]
const viteCommand =
  process.platform === 'win32'
    ? ['npm.cmd', ['run', 'dev:vite', '--', '--host', '127.0.0.1']]
    : ['npm', ['run', 'dev:vite', '--', '--host', '127.0.0.1']]

const watchedPaths = [
  path.join(vaultRoot, 'Anclora Command Center.md'),
  path.join(vaultRoot, 'resources'),
  path.join(vaultRoot, 'personas'),
  path.join(vaultRoot, 'playbooks'),
  path.join(vaultRoot, 'ideas'),
  path.join(vaultRoot, 'templates', 'partner-synergi.md'),
]

function runSync() {
  return new Promise((resolve, reject) => {
    const child = spawn(syncCommand[0], syncCommand[1], {
      cwd: dashboardRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Sync exited with code ${code}`))
    })
  })
}

async function start() {
  await runSync()

  const vite = spawn(viteCommand[0], viteCommand[1], {
    cwd: dashboardRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  vite.on('error', (error) => {
    process.stderr.write(`Vite failed to start: ${error.message}\n`)
  })

  let timer = null
  const scheduleSync = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      runSync().catch((error) => {
        process.stderr.write(`${error.message}\n`)
      })
    }, 250)
  }

  const watchers = watchedPaths
    .filter((target) => fs.existsSync(target))
    .map((target) => {
      const stats = fs.statSync(target)
      if (stats.isDirectory()) {
        return fs.watch(target, (_eventType, filename) => {
          if (!filename) return
          scheduleSync()
        })
      }

      fs.watchFile(target, { interval: 500 }, () => {
        scheduleSync()
      })

      return {
        close() {
          fs.unwatchFile(target)
        },
      }
    })

  const close = () => {
    watchers.forEach((watcher) => watcher.close())
    vite.kill()
    process.exit(0)
  }

  process.on('SIGINT', close)
  process.on('SIGTERM', close)
}

start().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
})
