import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dashboardRoot = path.resolve(__dirname, '..')
const vaultRoot = path.resolve(dashboardRoot, '..')
const generatedDir = path.join(dashboardRoot, 'src', 'generated')
const outputFile = path.join(generatedDir, 'vault-data.json')

const fileMap = {
  commandCenter: path.join(vaultRoot, 'Anclora Command Center.md'),
  group: path.join(vaultRoot, 'resources', 'anclora-group.md'),
  stakeholders: path.join(vaultRoot, 'resources', 'mapa-stakeholders.md'),
  partnerTemplate: path.join(vaultRoot, 'templates', 'partner-synergi.md'),
  ideasJorge: path.join(vaultRoot, 'ideas', 'propuesta-colaboracion-jorge.md'),
  ideasLinkedIn: path.join(vaultRoot, 'ideas', 'post-linkedin-autoridad.md'),
  partners: [
    path.join(vaultRoot, 'personas', 'Lucia Serrano.md'),
    path.join(vaultRoot, 'personas', 'Javier Ortega.md'),
    path.join(vaultRoot, 'personas', 'Marta Vidal.md'),
    path.join(vaultRoot, 'personas', 'jorge-cifre.md'),
  ],
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
}

function parseInlineValue(raw) {
  const value = raw.trim()
  if (value === '') return ''
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.replace(/^['"]|['"]$/g, ''))
  }
  return value
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) {
    return { data: {}, body: text }
  }

  const endIndex = text.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return { data: {}, body: text }
  }

  const raw = text.slice(4, endIndex)
  const body = text.slice(endIndex + 5)
  const data = {}
  const lines = raw.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (rawValue === '') {
      const values = []
      let nextIndex = index + 1

      while (nextIndex < lines.length && /^\s+-\s+/.test(lines[nextIndex])) {
        values.push(lines[nextIndex].replace(/^\s+-\s+/, '').replace(/^['"]|['"]$/g, ''))
        nextIndex += 1
      }

      data[key] = values.length > 0 ? values : ''
      index = nextIndex - 1
      continue
    }

    data[key] = parseInlineValue(rawValue)
  }

  return { data, body }
}

function splitSections(body) {
  const sections = new Map()
  const lines = body.split('\n')
  let current = 'intro'
  let buffer = []

  const flush = () => {
    sections.set(current, buffer.join('\n').trim())
    buffer = []
  }

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      flush()
      current = heading[1].trim()
      continue
    }
    buffer.push(line)
  }

  flush()
  return sections
}

function extractWikilinks(text) {
  return Array.from(text.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)).map((match) => ({
    target: match[1],
    label: match[2] || match[1],
  }))
}

function parseBullets(sectionText) {
  return sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
}

function parsePartnerRadar(sectionText) {
  return parseBullets(sectionText).map((line) => {
    const match = line.match(/^\[\[([^\]]+)\]\]:\s*`([^`]+)`\s*\|\s*(.+)$/)
    if (!match) return { label: line }
    return {
      name: match[1],
      influence: match[2],
      summary: match[3],
    }
  })
}

function parseLabelValueBullets(sectionText) {
  return parseBullets(sectionText).map((line) => {
    const [label, ...rest] = line.split(':')
    return {
      label: label.trim(),
      value: rest.join(':').trim(),
      links: extractWikilinks(line),
    }
  })
}

function parseMarkdownTable(sectionText) {
  const lines = sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))

  if (lines.length < 3) return []

  const headers = lines[0]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)

  return lines.slice(2).map((line) => {
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean)

    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })
}

function parseActivity(sectionText) {
  return parseBullets(sectionText).map((line) => {
    const match = line.match(/^`([^`]+)`:\s*último push el \*\*([^*]+)\*\*$/)
    if (!match) return { label: line }
    return { repo: match[1], pushedAt: match[2] }
  })
}

function parseCoverage(sectionText) {
  const bullet = parseBullets(sectionText).find((line) => line.includes('% de zona SW analizada'))
  if (!bullet) return null
  const match = bullet.match(/`([^`]+)`/)
  return {
    label: bullet.replace(/`[^`]+`/, '').trim(),
    value: match ? match[1] : '',
  }
}

function parseAlerts(sectionText) {
  const heading = sectionText.indexOf('### Alertas Nexus')
  if (heading === -1) return []
  return parseBullets(sectionText.slice(heading))
}

function parseAbstract(block) {
  const lines = block.split('\n')
  const textLines = []
  let collect = false

  for (const line of lines) {
    if (line.startsWith('> [!abstract]')) {
      collect = true
      continue
    }
    if (collect && line.startsWith('> ')) {
      textLines.push(line.replace(/^>\s?/, '').trim())
      continue
    }
    if (collect) break
  }

  return textLines.join(' ').trim()
}

function parsePartnerNote(filePath) {
  const text = readText(filePath)
  const { data, body } = parseFrontmatter(text)
  const sections = splitSections(body)
  const executive = sections.get('📋 Perfil Ejecutivo') ?? ''
  const relationship = sections.get('🤝 Relación con Anclora Synergi') ?? ''
  const opportunities = sections.get('🚀 Oportunidades y Sinergias') ?? ''
  const notes = sections.get('💡 Notas de Contexto Personal') ?? ''

  return {
    title: data.title,
    status: data.status,
    influenceLevel: data.influence_level,
    company: data.company,
    role: data.role,
    location: data.location,
    contactChannel: data.contact_channel,
    trustLevel: data.trust_level,
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: parseAbstract(executive),
    executiveBullets: parseBullets(executive),
    ecosystemValue: parseBullets(relationship).filter((line) => line.startsWith('¿Qué')),
    nextAction: parseBullets(opportunities).find((line) => line.startsWith('Siguiente Acción'))?.replace(/^Siguiente Acción:\s*/, '') ?? '',
    projectLinks: extractWikilinks(opportunities).map((link) => link.label),
    personalNotes: notes.trim(),
  }
}

function parseCommandCenter(filePath) {
  const text = readText(filePath)
  const { data, body } = parseFrontmatter(text)
  const sections = splitSections(body)

  return {
    meta: data,
    body,
    intro: sections.get('intro') ?? '',
    executivePulse: parseBullets(sections.get('⚡ Pulso Ejecutivo') ?? ''),
    partnerRadar: parsePartnerRadar(sections.get('💎 Radar de Partners') ?? ''),
    stack: parseLabelValueBullets(sections.get('🌍 eXp Global + Stack Operativo') ?? ''),
    route: parseBullets(sections.get('🧭 Ruta Operativa') ?? ''),
    projects: parseMarkdownTable(sections.get('🏗️ Proyectos y Aplicaciones Activas') ?? ''),
    activity: parseActivity(sections.get('🐙 Actividad de Desarrollo') ?? ''),
    synergies: parseBullets(sections.get('📈 Sinergias y Playbooks') ?? ''),
    decisions: parseBullets(sections.get('🎯 Próximas Decisiones') ?? ''),
    communicationAssets: parseBullets(sections.get('📬 Activos de Comunicación') ?? ''),
    swObjective: parseBullets(sections.get('📍 Objetivo SW Mallorca') ?? ''),
    monitorCoverage: parseCoverage(sections.get('📡 Monitor de Prospección SW') ?? ''),
    monitorAlerts: parseAlerts(sections.get('📡 Monitor de Prospección SW') ?? ''),
    quickActions: parseBullets(sections.get('🛠️ Acciones Rápidas') ?? ''),
  }
}

function parseResource(filePath) {
  const text = readText(filePath)
  const { data, body } = parseFrontmatter(text)
  return {
    meta: data,
    body,
    links: extractWikilinks(body),
  }
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true })
}

function sync() {
  ensureDir(generatedDir)

  const commandCenter = parseCommandCenter(fileMap.commandCenter)
  const group = parseResource(fileMap.group)
  const stakeholders = parseResource(fileMap.stakeholders)
  const partnerTemplate = parseResource(fileMap.partnerTemplate)
  const ideas = [parseResource(fileMap.ideasJorge), parseResource(fileMap.ideasLinkedIn)]
  const partners = fileMap.partners.filter((filePath) => fs.existsSync(filePath)).map(parsePartnerNote)

  const payload = {
    generatedAt: new Date().toISOString(),
    vaultRoot,
    commandCenter,
    group,
    stakeholders,
    partnerTemplate,
    ideas,
    partners,
  }

  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2))
  process.stdout.write(`Vault data synced to ${path.relative(vaultRoot, outputFile)}\n`)
}

sync()
