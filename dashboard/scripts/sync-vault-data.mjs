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

const monthMap = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
}

const projectHeadersByLocale = {
  es: ['Nodo', 'Estado documentado', 'Repositorio', 'Siguiente foco'],
  en: ['Node', 'Documented status', 'Repository', 'Next focus'],
  de: ['Knoten', 'Dokumentierter Status', 'Repository', 'Nächster Fokus'],
}

const replacementSets = {
  en: [
    ['Suroeste de Mallorca', 'Southwest Mallorca'],
    ['Noreste de Mallorca', 'Northeast Mallorca'],
    ['suroeste de Mallorca', 'southwest Mallorca'],
    ['noreste de Mallorca', 'northeast Mallorca'],
    ['Foco territorial:', 'Territorial focus:'],
    ['Alianza clave de isla:', 'Key island alliance:'],
    ['para eje', 'for the axis'],
    ['Stack operativo:', 'Operating stack:'],
    ['Prioridad inmediata:', 'Immediate priority:'],
    ['convertir prospección real en confianza comercial y partnerships activos', 'turn real prospecting into commercial trust and active partnerships'],
    ['Comunicación y coordinación', 'Communication and coordination'],
    ['Captación y datos de mercado', 'Lead generation and market data'],
    ['Análisis territorial y señales', 'Territorial analysis and signals'],
    ['Gestión de pipeline y contexto', 'Pipeline and context management'],
    ['Detectar oportunidades con', 'Detect opportunities with'],
    ['Filtrar y priorizar en', 'Filter and prioritize in'],
    ['Coordinar seguimiento en', 'Coordinate follow-up in'],
    ['Convertir insight en autoridad con', 'Turn insight into authority through'],
    ['Activar colaboración y cobertura territorial con', 'Activate collaboration and territorial coverage with'],
    ['Definir mejor propuesta de valor y mapear dependencia con', 'Sharpen the value proposition and map dependencies with'],
    ['Consolidar etapas reales del pipeline y su uso con contenido e inteligencia.', 'Consolidate the real pipeline stages and their use with content and intelligence.'],
    ['Priorizar casos de uso y documentar mejor branding y UI.', 'Prioritize use cases and document branding and UI more clearly.'],
    ['Traducir su madurez técnica en propuesta de valor y activos reutilizables.', 'Turn its technical maturity into a value proposition and reusable assets.'],
    ['Convertir los perfiles de partner en onboarding y workspaces reales.', 'Turn partner profiles into real onboarding flows and workspaces.'],
    ['Definir outputs concretos conectados a captacion y nurturing.', 'Define concrete outputs connected to acquisition and nurturing.'],
    ['Flujo principal:', 'Core flow:'],
    ['Arquitectura de extremo a extremo:', 'End-to-end architecture:'],
    ['Mapa relacional:', 'Relationship map:'],
    ['Borrador comercial activo:', 'Active commercial draft:'],
    ['Autoridad inmobiliaria:', 'Real-estate authority:'],
    ['Funnel de captacion:', 'Acquisition funnel:'],
    ['Research de captacion:', 'Acquisition research:'],
    ['CRM con IA:', 'AI CRM:'],
    ['Nutricion comercial:', 'Commercial nurturing:'],
    ['Reportes automaticos:', 'Automated reporting:'],
    ['Arquitectura implementable:', 'Implementable architecture:'],
    ['Decidir qué partner deja de ser “semilla” y pasa a onboarding real en', 'Decide which partner stops being a “seed” profile and moves into real onboarding in'],
    ['Convertir insights de', 'Turn insights from'],
    ['en un activo comercial medible dentro de', 'into a measurable commercial asset inside'],
    ['Traducir la logica de CRM y nurturing con IA a vistas reales dentro de', 'Translate AI CRM and nurturing logic into real views inside'],
    ['Decidir si `n8n` sera el orquestador oficial de automatizacion de Anclora.', 'Decide whether `n8n` will become Anclora’s official automation orchestrator.'],
    ['Mantener sincronizadas las notas de proyectos con sus README y actividad reciente en GitHub.', 'Keep project notes synchronized with their READMEs and recent GitHub activity.'],
    ['Propuesta de colaboración:', 'Collaboration proposal:'],
    ['Borrador de autoridad para LinkedIn:', 'LinkedIn authority draft:'],
    ['Fuente de captación:', 'Acquisition source:'],
    ['Motor de análisis:', 'Analysis engine:'],
    ['Coordinación operativa:', 'Operational coordination:'],
    ['Playbook principal:', 'Main playbook:'],
    ['% de zona SW analizada en', '% of the SW area analyzed in'],
    ['estimado de cobertura inicial', 'estimated initial coverage'],
    ['Santa Ponsa: movimiento alto por combinación de demanda premium y rotación visible', 'Santa Ponsa: high activity driven by premium demand and visible inventory rotation'],
    ['Port d\'Andratx: oportunidades de alto valor que requieren filtrado fino y seguimiento rápido', 'Port d\'Andratx: high-value opportunities that require fine filtering and fast follow-up'],
    ['Bendinat / Costa d\'en Blanes: zona sensible para detectar activos infravalorados con narrativa de precisión y confianza', 'Bendinat / Costa d\'en Blanes: sensitive area for spotting undervalued assets with a precision-and-trust narrative'],
    ['Crear o actualizar partner usando', 'Create or update a partner using'],
    ['Abrir activo comercial en', 'Open the commercial asset in'],
    ['Revisar propuesta territorial en', 'Review the territorial proposal in'],
    ['Revisar borrador público en', 'Review the public draft in'],
    ['Revisar el flujo comercial en', 'Review the commercial flow in'],
    ['Revisar la arquitectura en', 'Review the architecture in'],
    ['Capturar avances del dia en', 'Capture the day’s progress in'],
    ['family office con potencial de capital patrimonial y validacion premium.', 'family office with potential premium capital and validation.'],
    ['partner de desarrollo y producto con posible coinversion o colaboracion inmobiliaria.', 'development and product partner with potential co-investment or real-estate collaboration.'],
    ['broker de lujo orientada a conversion consultiva y confianza comercial.', 'luxury broker focused on consultative conversion and commercial trust.'],
    ['alianza territorial activa para cobertura NE + SW Mallorca sin competencia interna.', 'active territorial alliance for NE + SW Mallorca coverage without internal competition.'],
    ['Alianza territorial Mallorca', 'Mallorca territorial alliance'],
    ['prospecto', 'prospect'],
    ['activo', 'active'],
    ['clave', 'key'],
    ['alto', 'high'],
    ['Partner territorial NE / Pollensa', 'Territorial partner NE / Pollensa'],
    ['Noreste de Mallorca', 'Northeast Mallorca'],
    ['WhatsApp / llamada', 'WhatsApp / call'],
    ['Inversora patrimonial / Family Office', 'Capital investor / Family office'],
    ['Developer inmobiliario / Partner de producto', 'Real-estate developer / Product partner'],
    ['Broker de lujo / Relationship manager', 'Luxury broker / Relationship manager'],
  ],
  de: [
    ['Suroeste de Mallorca', 'Südwesten Mallorcas'],
    ['Noreste de Mallorca', 'Nordosten Mallorcas'],
    ['suroeste de Mallorca', 'Südwesten Mallorcas'],
    ['noreste de Mallorca', 'Nordosten Mallorcas'],
    ['Foco territorial:', 'Territorialer Fokus:'],
    ['Alianza clave de isla:', 'Zentrale Inselallianz:'],
    ['para eje', 'für die Achse'],
    ['Stack operativo:', 'Operativer Stack:'],
    ['Prioridad inmediata:', 'Unmittelbare Priorität:'],
    ['convertir prospección real en confianza comercial y partnerships activos', 'reale Akquise in geschäftliches Vertrauen und aktive Partnerschaften verwandeln'],
    ['Comunicación y coordinación', 'Kommunikation und Koordination'],
    ['Captación y datos de mercado', 'Akquise und Marktdaten'],
    ['Análisis territorial y señales', 'Gebietsanalyse und Signale'],
    ['Gestión de pipeline y contexto', 'Pipeline- und Kontextmanagement'],
    ['Detectar oportunidades con', 'Chancen erkennen mit'],
    ['Filtrar y priorizar en', 'Filtern und priorisieren in'],
    ['Coordinar seguimiento en', 'Nachverfolgung koordinieren in'],
    ['Convertir insight en autoridad con', 'Erkenntnisse in Autorität verwandeln mit'],
    ['Activar colaboración y cobertura territorial con', 'Zusammenarbeit und territoriale Abdeckung aktivieren mit'],
    ['Definir mejor propuesta de valor y mapear dependencia con', 'Das Wertversprechen schärfen und Abhängigkeiten zu'],
    ['Consolidar etapas reales del pipeline y su uso con contenido e inteligencia.', 'Die realen Pipeline-Phasen und ihre Nutzung mit Inhalten und Intelligence konsolidieren.'],
    ['Priorizar casos de uso y documentar mejor branding y UI.', 'Anwendungsfälle priorisieren und Branding sowie UI besser dokumentieren.'],
    ['Traducir su madurez técnica en propuesta de valor y activos reutilizables.', 'Die technische Reife in ein Wertversprechen und wiederverwendbare Assets übersetzen.'],
    ['Convertir los perfiles de partner en onboarding y workspaces reales.', 'Partnerprofile in echtes Onboarding und reale Workspaces überführen.'],
    ['Definir outputs concretos conectados a captacion y nurturing.', 'Konkrete Outputs definieren, die mit Akquise und Nurturing verbunden sind.'],
    ['Flujo principal:', 'Hauptfluss:'],
    ['Arquitectura de extremo a extremo:', 'Ende-zu-Ende-Architektur:'],
    ['Mapa relacional:', 'Beziehungslandkarte:'],
    ['Borrador comercial activo:', 'Aktiver kommerzieller Entwurf:'],
    ['Autoridad inmobiliaria:', 'Immobilien-Autorität:'],
    ['Funnel de captacion:', 'Akquise-Funnel:'],
    ['Research de captacion:', 'Akquise-Research:'],
    ['CRM con IA:', 'KI-CRM:'],
    ['Nutricion comercial:', 'Vertriebliche Nurturing-Logik:'],
    ['Reportes automaticos:', 'Automatische Berichte:'],
    ['Arquitectura implementable:', 'Implementierbare Architektur:'],
    ['Decidir qué partner deja de ser “semilla” y pasa a onboarding real en', 'Festlegen, welcher Partner kein „Seed“-Profil mehr ist und in echtes Onboarding bei'],
    ['Convertir insights de', 'Erkenntnisse aus'],
    ['en un activo comercial medible dentro de', 'in ein messbares Vertriebs-Asset innerhalb von'],
    ['Traducir la logica de CRM y nurturing con IA a vistas reales dentro de', 'Die Logik von CRM und KI-Nurturing in reale Ansichten innerhalb von'],
    ['Decidir si `n8n` sera el orquestador oficial de automatizacion de Anclora.', 'Entscheiden, ob `n8n` der offizielle Automatisierungs-Orchestrator von Anclora wird.'],
    ['Mantener sincronizadas las notas de proyectos con sus README y actividad reciente en GitHub.', 'Die Projektnotizen mit ihren READMEs und der jüngsten GitHub-Aktivität synchron halten.'],
    ['Propuesta de colaboración:', 'Kooperationsvorschlag:'],
    ['Borrador de autoridad para LinkedIn:', 'LinkedIn-Entwurf für Autoritätsaufbau:'],
    ['Fuente de captación:', 'Akquisequelle:'],
    ['Motor de análisis:', 'Analyse-Engine:'],
    ['Coordinación operativa:', 'Operative Koordination:'],
    ['Playbook principal:', 'Zentrales Playbook:'],
    ['% de zona SW analizada en', '% des SW-Gebiets analysiert in'],
    ['estimado de cobertura inicial', 'geschätzte Anfangsabdeckung'],
    ['Santa Ponsa: movimiento alto por combinación de demanda premium y rotación visible', 'Santa Ponsa: hohe Aktivität durch Premium-Nachfrage und sichtbare Rotation'],
    ['Port d\'Andratx: oportunidades de alto valor que requieren filtrado fino y seguimiento rápido', 'Port d\'Andratx: hochwertige Chancen, die feines Filtern und schnelle Nachverfolgung erfordern'],
    ['Bendinat / Costa d\'en Blanes: zona sensible para detectar activos infravalorados con narrativa de precisión y confianza', 'Bendinat / Costa d\'en Blanes: sensibles Gebiet zum Erkennen unterbewerteter Assets mit Präzisions- und Vertrauensnarrativ'],
    ['Crear o actualizar partner usando', 'Partner erstellen oder aktualisieren mit'],
    ['Abrir activo comercial en', 'Kommerzielles Asset öffnen in'],
    ['Revisar propuesta territorial en', 'Territorialen Vorschlag prüfen in'],
    ['Revisar borrador público en', 'Öffentlichen Entwurf prüfen in'],
    ['Revisar el flujo comercial en', 'Kommerziellen Fluss prüfen in'],
    ['Revisar la arquitectura en', 'Architektur prüfen in'],
    ['Capturar avances del dia en', 'Tagesfortschritt erfassen in'],
    ['family office con potencial de capital patrimonial y validacion premium.', 'Family Office mit Potenzial für Vermögenskapital und Premium-Validierung.'],
    ['partner de desarrollo y producto con posible coinversion o colaboracion inmobiliaria.', 'Entwicklungs- und Produktpartner mit möglicher Co-Investition oder Immobilienkooperation.'],
    ['broker de lujo orientada a conversion consultiva y confianza comercial.', 'Luxusmaklerin mit Fokus auf beratungsorientierte Konversion und geschäftliches Vertrauen.'],
    ['alianza territorial activa para cobertura NE + SW Mallorca sin competencia interna.', 'aktive territoriale Allianz für die Abdeckung von NE + SW Mallorca ohne interne Konkurrenz.'],
    ['Alianza territorial Mallorca', 'Territoriale Allianz Mallorca'],
    ['prospecto', 'potenziell'],
    ['activo', 'aktiv'],
    ['clave', 'zentral'],
    ['alto', 'hoch'],
    ['Partner territorial NE / Pollensa', 'Territorialpartner NE / Pollensa'],
    ['Noreste de Mallorca', 'Nordosten Mallorcas'],
    ['WhatsApp / llamada', 'WhatsApp / Anruf'],
    ['Inversora patrimonial / Family Office', 'Vermögensinvestorin / Family Office'],
    ['Developer inmobiliario / Partner de producto', 'Immobilienentwickler / Produktpartner'],
    ['Broker de lujo / Relationship manager', 'Luxusmakler / Relationship Manager'],
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
    return { repo: match[1], pushedAt: match[2], pushedAtIso: parseSpanishDate(match[2]) }
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

function parseSpanishDate(value) {
  const match = value
    .toLowerCase()
    .match(/(\d{1,2}) de ([a-záéíóú]+) de (\d{4})/)

  if (!match) return null

  const [, day, monthName, year] = match
  const month = monthMap[monthName]
  if (!month) return null
  return `${year}-${month}-${day.padStart(2, '0')}`
}

function formatDateForLocale(isoDate, locale) {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(
    locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'es-ES',
    { dateStyle: 'long' },
  )
}

function replaceAll(text, replacements) {
  return replacements.reduce((current, [from, to]) => current.replaceAll(from, to), text)
}

function translateText(text, locale) {
  if (locale === 'es' || !text) return text
  let translated = replaceAll(text, replacementSets[locale] ?? [])

  if (locale === 'en') {
    translated = translated
      .replace(/Suroeste de Mallorca/g, 'Southwest Mallorca')
      .replace(/Noreste de Mallorca/g, 'Northeast Mallorca')
      .replace(/suroeste de Mallorca/g, 'southwest Mallorca')
      .replace(/noreste de Mallorca/g, 'northeast Mallorca')
  }

  if (locale === 'de') {
    translated = translated
      .replace(/Suroeste de Mallorca/g, 'Südwesten Mallorcas')
      .replace(/Noreste de Mallorca/g, 'Nordosten Mallorcas')
      .replace(/suroeste de Mallorca/g, 'Südwesten Mallorcas')
      .replace(/noreste de Mallorca/g, 'Nordosten Mallorcas')
  }

  return translated
}

function localizeProjectRow(row, locale) {
  const headers = projectHeadersByLocale[locale]
  const entries = Object.entries(row)
  return Object.fromEntries(
    entries.map(([key, value], index) => [
      headers[index] ?? key,
      key === 'Repositorio' ? value : translateText(value, locale),
    ]),
  )
}

function localizeCommandCenter(commandCenter) {
  const locales = ['es', 'en', 'de']

  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      {
        executivePulse: commandCenter.executivePulse.map((item) => translateText(item, locale)),
        partnerRadar: commandCenter.partnerRadar.map((item) => ({
          ...item,
          influence: translateText(item.influence, locale),
          summary: translateText(item.summary, locale),
        })),
        stack: commandCenter.stack.map((item) => ({
          ...item,
          label: translateText(item.label, locale),
          value: translateText(item.value, locale),
        })),
        route: commandCenter.route.map((item) => translateText(item, locale)),
        projects: commandCenter.projects.map((row) => localizeProjectRow(row, locale)),
        activity: commandCenter.activity.map((item) => ({
          repo: item.repo,
          pushedAt: item.pushedAtIso ? formatDateForLocale(item.pushedAtIso, locale) : translateText(item.pushedAt, locale),
        })),
        synergies: commandCenter.synergies.map((item) => translateText(item, locale)),
        decisions: commandCenter.decisions.map((item) => translateText(item, locale)),
        communicationAssets: commandCenter.communicationAssets.map((item) => translateText(item, locale)),
        swObjective: commandCenter.swObjective.map((item) => translateText(item, locale)),
        monitorCoverage: commandCenter.monitorCoverage
          ? {
              label: translateText(commandCenter.monitorCoverage.label, locale),
              value: commandCenter.monitorCoverage.value,
            }
          : null,
        monitorAlerts: commandCenter.monitorAlerts.map((item) => translateText(item, locale)),
        quickActions: commandCenter.quickActions.map((item) => translateText(item, locale)),
      },
    ]),
  )
}

function localizePartner(partner, locale) {
  const localizedCompany =
    partner.company === 'Alianza territorial Mallorca'
      ? locale === 'en'
        ? 'Mallorca territorial alliance'
        : locale === 'de'
          ? 'Territoriale Allianz Mallorca'
          : partner.company
      : translateText(partner.company, locale)

  return {
    ...partner,
    company: localizedCompany,
    status: translateText(partner.status, locale),
    influenceLevel: translateText(partner.influenceLevel, locale),
    role: translateText(partner.role, locale),
    location: translateText(partner.location, locale),
    contactChannel: translateText(partner.contactChannel, locale),
    trustLevel: translateText(partner.trustLevel, locale),
    summary: translateText(partner.summary, locale),
    executiveBullets: partner.executiveBullets.map((item) => translateText(item, locale)),
    nextAction: translateText(partner.nextAction, locale),
    personalNotes: translateText(partner.personalNotes, locale),
  }
}

function localizePartners(partners) {
  const locales = ['es', 'en', 'de']
  return Object.fromEntries(locales.map((locale) => [locale, partners.map((partner) => localizePartner(partner, locale))]))
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
    commandCenterLocales: localizeCommandCenter(commandCenter),
    group,
    stakeholders,
    partnerTemplate,
    ideas,
    partners,
    partnersLocales: localizePartners(partners),
  }

  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2))
  process.stdout.write(`Vault data synced to ${path.relative(vaultRoot, outputFile)}\n`)
}

sync()
