# Dashboard Real Estate Notes Source of Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Real Estate dashboard so canonical Obsidian notes generate the workbook and then the dashboard dataset automatically.

**Architecture:** Keep `dashboard-cuadro-de-mando/scripts/sync-dataset.mjs` as the workbook-to-JSON layer. Add a note-ingestion layer in `dashboard-cuadro-de-mando/scripts/` that reads canonical markdown notes from `resources/dashboard-real-estate/`, validates them, writes `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`, and watches those note folders during development.

**Tech Stack:** Node.js ESM, `xlsx`, `gray-matter`, `chokidar`, `concurrently`, React/Vite, Node test runner, Obsidian markdown.

---

## File Map

**Create**
- `dashboard-cuadro-de-mando/scripts/lib/dashboard-note-schema.mjs`
- `dashboard-cuadro-de-mando/scripts/lib/read-dashboard-notes.mjs`
- `dashboard-cuadro-de-mando/scripts/generate-workbook-from-notes.mjs`
- `dashboard-cuadro-de-mando/scripts/watch-notes-and-sync.mjs`
- `dashboard-cuadro-de-mando/test/read-dashboard-notes.test.mjs`
- `dashboard-cuadro-de-mando/test/generate-workbook-from-notes.test.mjs`
- `dashboard-cuadro-de-mando/test/watch-notes-and-sync.smoke.test.mjs`
- `resources/dashboard-real-estate/indice-dashboard-real-estate.md`
- `resources/dashboard-real-estate/apps/*.md`
- `resources/dashboard-real-estate/interacciones/*.md`
- `resources/dashboard-real-estate/campos/*.md`
- `resources/dashboard-real-estate/fuentes/*.md`
- `templates/dashboard-real-estate-app.md`
- `templates/dashboard-real-estate-interaccion.md`
- `templates/dashboard-real-estate-campo.md`
- `templates/dashboard-real-estate-fuente.md`

**Modify**
- `dashboard-cuadro-de-mando/package.json`
- `dashboard-cuadro-de-mando/scripts/sync-dataset.mjs`
- `dashboard-cuadro-de-mando/test/sync-dataset.test.mjs`
- `resources/anclora-cuadro-de-mando-real-estate.md`

### Task 1: Create The Canonical Notes Layer

**Files:**
- Create: `resources/dashboard-real-estate/indice-dashboard-real-estate.md`
- Create: `resources/dashboard-real-estate/apps/*.md`
- Create: `resources/dashboard-real-estate/interacciones/*.md`
- Create: `resources/dashboard-real-estate/campos/*.md`
- Create: `resources/dashboard-real-estate/fuentes/*.md`
- Create: `templates/dashboard-real-estate-*.md`
- Modify: `resources/anclora-cuadro-de-mando-real-estate.md`

- [ ] **Step 1: Create the four templates**

```md
---
tipo: recurso
dashboard_dataset: real-estate
dataset_entity: app
app_id:
app_name:
main_inputs: []
main_outputs: []
upstream_dependencies: []
downstream_dependencies: []
key_workflows: []
supporting_notes: []
---
```

```md
---
tipo: recurso
dashboard_dataset: real-estate
dataset_entity: interaction
source_app:
target_app:
interaction_type:
what_flows:
business_reason:
---
```

```md
---
tipo: recurso
dashboard_dataset: real-estate
dataset_entity: field
field_name:
data_type:
definition:
reading_rule:
---
```

```md
---
tipo: recurso
dashboard_dataset: real-estate
dataset_entity: source
app_name:
source_note:
source_type:
evidence_summary:
---
```

- [ ] **Step 2: Create the dataset index**

```md
# Índice del dataset Real Estate

- Fuente de verdad: `resources/dashboard-real-estate/`
- Cobertura esperada: 5 apps, 10 interacciones, 26 campos, 26 fuentes
- Pipeline: `notas canónicas -> xlsx -> json -> dashboard`
```

- [ ] **Step 3: Seed the canonical notes from the current workbook snapshot**

Create:
- 5 app notes mirroring `apps_master`
- 10 interaction notes mirroring `interacciones`
- 26 field notes mirroring `campos_analiticos`
- 26 source notes mirroring `fuentes`

Example app note:

```md
---
tipo: recurso
dashboard_dataset: real-estate
dataset_entity: app
app_id: APE
app_name: Anclora Private Estates
scope_status: in_scope
ecosystem_role: Puerta de entrada premium y matriz comercial del vertical inmobiliario
app_type: luxury-real-estate-platform
maturity_status: active
validation_status: documented_in_vault
ecosystem_layer: commercial-vertical
real_estate_focus: Luxury real estate en SW Mallorca
primary_users: Clientes premium, compradores/vendedores de alto nivel, operador principal del ecosistema
primary_goal: Consolidar el vertical inmobiliario premium como matriz operativa y comercial del ecosistema
business_value: Centraliza propuesta de valor, acceso premium y conexion con datos, pipeline y partnerships
main_inputs: [Insights de Data Lab, pipeline de Nexus, partnerships de Synergi, estrategia territorial]
main_outputs: [Propuesta de valor premium, captacion y contexto comercial para leads y partners]
upstream_dependencies: [Anclora Group, Anclora Data Lab, Anclora Nexus, Anclora Synergi]
downstream_dependencies: [Anclora Nexus, Anclora Synergi, Anclora Data Lab]
key_workflows: [Captacion premium, posicionamiento territorial, coordinacion comercial]
documented_state: activo
state_summary: Proyecto definido como vertical principal; falta mayor consolidacion operativa y comercial
main_risks: Propuesta de valor aun poco precisa; relaciones operativas todavia incompletas
next_focus: Precisar posicionamiento premium y mapear dependencia operativa con Nexus, Synergi y Data Lab
territory_focus: Suroeste de Mallorca
repo_url: https://github.com/ToniIAPro73/Anclora-Private-Estates.git
primary_note: proyectos/anclora-private-estates.md
supporting_notes: [resources/anclora-group.md, sistemas/Arquitectura de Integracion Anclora.md, Anclora Command Center.md]
source_confidence: high
---
```

- [ ] **Step 4: Update the public resource note**

Add to `resources/anclora-cuadro-de-mando-real-estate.md`:

```md
## Fuente de verdad

- Fuente de verdad operativa: `resources/dashboard-real-estate/`
- Workbook derivado: `output/spreadsheet/anclora-group-real-estate-dataset.xlsx`
- Pipeline: `notas canónicas -> xlsx -> json -> dashboard`
```

- [ ] **Step 5: Verify the vault structure**

Run: `rg --files resources/dashboard-real-estate templates`

Expected: index note, 5 app notes, 10 interaction notes, 26 field notes, 26 source notes, 4 templates.

- [ ] **Step 6: Commit**

```bash
git add resources/dashboard-real-estate templates/dashboard-real-estate-*.md resources/anclora-cuadro-de-mando-real-estate.md
git commit -m "docs: add canonical notes layer for dashboard real estate"
```

### Task 2: Parse Canonical Notes

**Files:**
- Create: `dashboard-cuadro-de-mando/scripts/lib/dashboard-note-schema.mjs`
- Create: `dashboard-cuadro-de-mando/scripts/lib/read-dashboard-notes.mjs`
- Create: `dashboard-cuadro-de-mando/test/read-dashboard-notes.test.mjs`
- Modify: `dashboard-cuadro-de-mando/package.json`

- [ ] **Step 1: Add dependencies**

```json
{
  "dependencies": {
    "gray-matter": "^4.0.3",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "chokidar": "^4.0.3",
    "concurrently": "^9.1.2"
  }
}
```

- [ ] **Step 2: Write the failing parser test**

```js
test("readDashboardNotes reads canonical notes", () => {
  const result = readDashboardNotes({ dashboardRoot });
  assert.equal(result.apps.length, 5);
  assert.equal(result.interactions.length, 10);
  assert.equal(result.fields.length, 26);
  assert.equal(result.sources.length, 26);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test test/read-dashboard-notes.test.mjs`

Expected: FAIL because the reader module does not exist yet.

- [ ] **Step 4: Implement the schema module**

```js
export const APP_FIELDS = ["app_id", "app_name", "scope_status", "ecosystem_role", "app_type", "maturity_status", "validation_status", "ecosystem_layer", "real_estate_focus", "primary_users", "primary_goal", "business_value", "main_inputs", "main_outputs", "upstream_dependencies", "downstream_dependencies", "key_workflows", "documented_state", "state_summary", "main_risks", "next_focus", "territory_focus", "repo_url", "primary_note", "supporting_notes", "source_confidence"];
export const INTERACTION_FIELDS = ["source_app", "target_app", "interaction_type", "what_flows", "business_reason"];
export const FIELD_FIELDS = ["field_name", "data_type", "definition", "reading_rule"];
export const SOURCE_FIELDS = ["app_name", "source_note", "source_type", "evidence_summary"];
export const LIST_FIELDS = new Set(["main_inputs", "main_outputs", "upstream_dependencies", "downstream_dependencies", "key_workflows", "supporting_notes"]);
```

- [ ] **Step 5: Implement the reader**

```js
export function readDashboardNotes({ dashboardRoot }) {
  return {
    apps: readEntityDirectory(path.join(baseDir, "apps"), "app", APP_FIELDS),
    interactions: readEntityDirectory(path.join(baseDir, "interacciones"), "interaction", INTERACTION_FIELDS),
    fields: readEntityDirectory(path.join(baseDir, "campos"), "field", FIELD_FIELDS),
    sources: readEntityDirectory(path.join(baseDir, "fuentes"), "source", SOURCE_FIELDS),
  };
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test test/read-dashboard-notes.test.mjs`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/lib/dashboard-note-schema.mjs scripts/lib/read-dashboard-notes.mjs test/read-dashboard-notes.test.mjs
git commit -m "feat: parse canonical dashboard notes"
```

### Task 3: Generate The Workbook From Notes

**Files:**
- Create: `dashboard-cuadro-de-mando/scripts/generate-workbook-from-notes.mjs`
- Create: `dashboard-cuadro-de-mando/test/generate-workbook-from-notes.test.mjs`

- [ ] **Step 1: Write the failing workbook test**

```js
test("generate-workbook-from-notes writes the expected sheets", () => {
  execFileSync("node", ["./scripts/generate-workbook-from-notes.mjs"], { cwd: dashboardRoot, stdio: "pipe" });
  const workbook = XLSX.readFile(workbookPath);
  assert.equal(XLSX.utils.sheet_to_json(workbook.Sheets.apps_master, { defval: "" }).length, 5);
  assert.equal(XLSX.utils.sheet_to_json(workbook.Sheets.interacciones, { defval: "" }).length, 10);
  assert.equal(XLSX.utils.sheet_to_json(workbook.Sheets.campos_analiticos, { defval: "" }).length, 26);
  assert.equal(XLSX.utils.sheet_to_json(workbook.Sheets.fuentes, { defval: "" }).length, 26);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/generate-workbook-from-notes.test.mjs`

Expected: FAIL because the generator script does not exist yet.

- [ ] **Step 3: Implement the generator**

```js
export function generateWorkbook({ dashboardRoot: inputRoot = dashboardRoot } = {}) {
  const data = readDashboardNotes({ dashboardRoot: inputRoot });
  validateGraph(data);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapRows(data.apps, APP_FIELDS)), "apps_master");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapRows(data.interactions, INTERACTION_FIELDS)), "interacciones");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapRows(data.fields, FIELD_FIELDS)), "campos_analiticos");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapRows(data.sources, SOURCE_FIELDS)), "fuentes");
  XLSX.writeFile(workbook, workbookPath);
  return workbookPath;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/generate-workbook-from-notes.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-workbook-from-notes.mjs test/generate-workbook-from-notes.test.mjs
git commit -m "feat: generate dashboard workbook from canonical notes"
```

### Task 4: Wire The Existing Sync Script To The New Pipeline

**Files:**
- Modify: `dashboard-cuadro-de-mando/package.json`
- Modify: `dashboard-cuadro-de-mando/scripts/sync-dataset.mjs`
- Modify: `dashboard-cuadro-de-mando/test/sync-dataset.test.mjs`

- [ ] **Step 1: Write the failing integration test**

```js
test("sync:data regenerates workbook and dataset.json from canonical notes", () => {
  execFileSync("npm", ["run", "sync:data"], { cwd: dashboardRoot, stdio: "pipe", shell: true });
  const dataset = JSON.parse(fs.readFileSync(generatedFile, "utf8"));
  assert.equal(dataset.apps.length, 5);
  assert.equal(dataset.derived.priorityRanking[0].app_name, "Anclora Nexus");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/sync-dataset.test.mjs`

Expected: FAIL until `sync:data` generates the workbook first.

- [ ] **Step 3: Update scripts**

```json
{
  "scripts": {
    "generate:workbook": "node ./scripts/generate-workbook-from-notes.mjs",
    "sync:data:json": "node ./scripts/sync-dataset.mjs",
    "sync:data": "npm run generate:workbook && npm run sync:data:json",
    "dev:vite": "vite",
    "dev:watch-data": "node ./scripts/watch-notes-and-sync.mjs",
    "dev": "concurrently -k -n data,vite -c cyan,magenta \"npm:dev:watch-data\" \"npm:dev:vite\"",
    "build": "npm run sync:data && tsc -b && vite build"
  }
}
```

- [ ] **Step 4: Export the sync function**

```js
export function sync() {
  // existing body
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  sync();
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/sync-dataset.test.mjs`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/sync-dataset.mjs test/sync-dataset.test.mjs
git commit -m "feat: wire dashboard sync through canonical notes generation"
```

### Task 5: Add Watch Mode For Development

**Files:**
- Create: `dashboard-cuadro-de-mando/scripts/watch-notes-and-sync.mjs`
- Create: `dashboard-cuadro-de-mando/test/watch-notes-and-sync.smoke.test.mjs`

- [ ] **Step 1: Write the failing smoke test**

```js
test("watch script declares canonical watch paths", () => {
  const content = fs.readFileSync(file, "utf8");
  assert.match(content, /resources[\\\\/]dashboard-real-estate[\\\\/]apps/);
  assert.match(content, /resources[\\\\/]dashboard-real-estate[\\\\/]interacciones/);
  assert.match(content, /resources[\\\\/]dashboard-real-estate[\\\\/]campos/);
  assert.match(content, /resources[\\\\/]dashboard-real-estate[\\\\/]fuentes/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/watch-notes-and-sync.smoke.test.mjs`

Expected: FAIL because the watch script does not exist yet.

- [ ] **Step 3: Implement the watch script**

```js
const watchPaths = [
  path.join(vaultRoot, "resources", "dashboard-real-estate", "apps"),
  path.join(vaultRoot, "resources", "dashboard-real-estate", "interacciones"),
  path.join(vaultRoot, "resources", "dashboard-real-estate", "campos"),
  path.join(vaultRoot, "resources", "dashboard-real-estate", "fuentes"),
  path.join(vaultRoot, "resources", "dashboard-real-estate", "indice-dashboard-real-estate.md"),
];

await runSync();
chokidar.watch(watchPaths, { ignoreInitial: true }).on("all", () => {
  void runSync();
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/watch-notes-and-sync.smoke.test.mjs`

Expected: PASS

- [ ] **Step 5: Manual verification**

Run: `npm run dev`

Expected: editing a note under `resources/dashboard-real-estate/apps/` refreshes workbook and `dataset.json`, then Vite reloads the dashboard.

- [ ] **Step 6: Commit**

```bash
git add scripts/watch-notes-and-sync.mjs test/watch-notes-and-sync.smoke.test.mjs
git commit -m "feat: watch canonical dashboard notes during development"
```

### Task 6: Regression Lock And Final Verification

**Files:**
- Modify: `dashboard-cuadro-de-mando/test/generate-workbook-from-notes.test.mjs`
- Modify: `dashboard-cuadro-de-mando/test/sync-dataset.test.mjs`
- Modify: `resources/anclora-cuadro-de-mando-real-estate.md`

- [ ] **Step 1: Add regression assertions**

```js
const nexus = apps.find((item) => item.app_name === "Anclora Nexus");
assert.ok(nexus);
assert.equal(nexus.documented_state, "activo");
assert.match(nexus.upstream_dependencies, /Anclora Group/);
assert.equal(dataset.sourceWorkbook, "output/spreadsheet/anclora-group-real-estate-dataset.xlsx");
```

- [ ] **Step 2: Run the full test suite to verify failures**

Run: `npm test`

Expected: FAIL until serializers and note values match the current snapshot semantics.

- [ ] **Step 3: Make the minimal fixes**

```js
export function serializeCell(field, value) {
  return Array.isArray(value) ? value.join(" | ") : String(value ?? "");
}
```

- [ ] **Step 4: Run the final verification**

Run: `npm test`

Expected: PASS

Run: `npm run build`

Expected: PASS and production bundle created.

- [ ] **Step 5: Commit**

```bash
git add test/generate-workbook-from-notes.test.mjs test/sync-dataset.test.mjs scripts/lib/dashboard-note-schema.mjs resources/anclora-cuadro-de-mando-real-estate.md
git commit -m "test: lock dashboard notes pipeline to current real estate snapshot"
```

## Self-Review

- Spec coverage: canonical notes, workbook generation, watcher, compatibility with `sync-dataset.mjs`, and validation are all mapped to tasks above.
- Placeholder scan: no `TODO`, `TBD`, or deferred implementation markers remain.
- Type consistency: entities use `dataset_entity` values `app`, `interaction`, `field`, `source`; sheets remain `apps_master`, `interacciones`, `campos_analiticos`, `fuentes`.
