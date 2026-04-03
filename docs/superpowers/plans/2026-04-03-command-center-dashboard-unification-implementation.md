# Command Center Dashboard Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar `dashboard/` y `dashboard-cuadro-de-mando/` en una sola app premium con dos vistas internas: `Resumen Ejecutivo` y `Real Estate Intelligence`.

**Architecture:** La implementación se hará dentro de `dashboard/`, manteniendo dos pipelines de datos separados y creando una shell común con navegación interna. Primero se moverá el dataset inmobiliario y sus scripts a la app principal; después se integrará la UI analítica como módulo interno y, solo al final, se dejará `dashboard-cuadro-de-mando/` listo para retirada.

**Tech Stack:** React 19, TypeScript, Vite, Node.js scripts, JSON generado, XLSX, ESLint

---

### Task 1: Preparar la app principal para albergar ambos pipelines

**Files:**
- Modify: `dashboard/package.json`
- Modify: `dashboard/package-lock.json`
- Create: `dashboard/scripts/sync-real-estate-dataset.mjs`
- Create: `dashboard/src/generated/.gitkeep`
- Reference: `dashboard-cuadro-de-mando/scripts/sync-dataset.mjs`

- [ ] **Step 1: Añadir el nuevo script de sync y la dependencia `xlsx` al `package.json` de `dashboard/`**

```json
{
  "scripts": {
    "sync:vault": "node ./scripts/sync-vault-data.mjs",
    "sync:real-estate": "node ./scripts/sync-real-estate-dataset.mjs",
    "build": "npm run sync:vault && npm run sync:real-estate && tsc -b && vite build"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "xlsx": "^0.18.5"
  }
}
```

- [ ] **Step 2: Ejecutar lectura del `package.json` y comprobar que la modificación es coherente**

Run: `Get-Content dashboard/package.json`
Expected: aparecen `sync:real-estate` y el `build` encadena ambos syncs antes de `tsc -b && vite build`.

- [ ] **Step 3: Crear `dashboard/scripts/sync-real-estate-dataset.mjs` como wrapper mínimo**

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardRoot = path.resolve(__dirname, "..");
const vaultRoot = path.resolve(dashboardRoot, "..");
const workbookPath = path.join(vaultRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");
const generatedDir = path.join(dashboardRoot, "src", "generated");
const outputPath = path.join(generatedDir, "dataset.json");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Missing sheet: ${sheetName}`);
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function toList(value) {
  return String(value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function syncDataset() {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook not found: ${workbookPath}`);
  }

  ensureDir(generatedDir);

  const workbook = XLSX.readFile(workbookPath);
  const apps = readSheet(workbook, "apps_master");
  const interactions = readSheet(workbook, "interacciones");
  const sources = readSheet(workbook, "fuentes").filter((item) => item.app_name);

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceWorkbook: path.relative(vaultRoot, workbookPath).replaceAll("\\", "/"),
    apps: apps.map((app) => ({
      ...app,
      upstream_list: toList(app.upstream_dependencies),
      downstream_list: toList(app.downstream_dependencies),
      workflow_list: toList(app.key_workflows),
    })),
    interactions,
    sources,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  process.stdout.write(`Dataset synced to ${path.relative(vaultRoot, outputPath).replaceAll("\\", "/")}\n`);
}

syncDataset();
```

- [ ] **Step 4: Instalar dependencias y regenerar `package-lock.json`**

Run: `npm install`
Expected: `dashboard/package-lock.json` incorpora `xlsx` y sus dependencias.

- [ ] **Step 5: Ejecutar el nuevo sync y verificar generación**

Run: `npm run sync:real-estate`
Expected: `Dataset synced to dashboard/src/generated/dataset.json`

- [ ] **Step 6: Commit**

```bash
git add dashboard/package.json dashboard/package-lock.json dashboard/scripts/sync-real-estate-dataset.mjs dashboard/src/generated/dataset.json
git commit -m "feat: prepare dashboard for real estate dataset sync"
```

### Task 2: Introducir una shell común con navegación entre vistas

**Files:**
- Modify: `dashboard/src/App.tsx`
- Create: `dashboard/src/modules/executive/ExecutiveView.tsx`
- Create: `dashboard/src/modules/real-estate/RealEstateView.tsx`
- Create: `dashboard/src/shell/DashboardShell.tsx`
- Create: `dashboard/src/shell/dashboard-shell.types.ts`

- [ ] **Step 1: Crear el contrato mínimo de navegación compartida**

```ts
export type DashboardViewId = "executive" | "real-estate";

export type DashboardNavItem = {
  id: DashboardViewId;
  label: string;
  description: string;
};
```

- [ ] **Step 2: Crear la shell con navegación interna**

```tsx
import type { ReactNode } from "react";
import type { DashboardNavItem, DashboardViewId } from "./dashboard-shell.types";

type DashboardShellProps = {
  brandName: string;
  brandLine: string;
  activeView: DashboardViewId;
  items: DashboardNavItem[];
  controls?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  brandName,
  brandLine,
  activeView,
  items,
  controls,
  children,
}: DashboardShellProps) {
  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <img
            className="topbar__brand-logo"
            src="/brand/logo-anclora-command-center.png"
            alt="Logo Anclora Command Center"
          />
          <div>
            <p className="topbar__brand-name">{brandName}</p>
            <p className="topbar__brand-line">{brandLine}</p>
          </div>
        </div>

        <nav className="topbar__nav" aria-label="Vistas del dashboard">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.id === "executive" ? "/" : "/real-estate"}
              className={item.id === activeView ? "is-active" : ""}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="topbar__controls">{controls}</div>
      </header>

      {children}
    </main>
  );
}
```

- [ ] **Step 3: Extraer la vista ejecutiva actual a `ExecutiveView.tsx` sin cambiar funcionalidad**

```tsx
type ExecutiveViewProps = {
  data: typeof import("../../generated/vault-data.json");
  language: "es" | "en" | "de";
  generatedAt: string;
};

export function ExecutiveView({ data, language, generatedAt }: ExecutiveViewProps) {
  const commandCenter = data.commandCenterLocales[language] ?? data.commandCenter;
  const partners = data.partnersLocales[language] ?? data.partners;
  return <></>;
}
```

Copiar literalmente desde el `dashboard/src/App.tsx` actual:

- el bloque `<header className="hero">...</header>`
- el bloque `<section className="grid grid--top">...</section>`
- el bloque `<section className="grid grid--middle">...</section>`
- el bloque `<section className="grid grid--bottom">...</section>`

El resultado esperado es que `ExecutiveView.tsx` contenga el JSX actual del Command Center sin cambios de comportamiento.

- [ ] **Step 4: Crear `RealEstateView.tsx` como primer módulo funcional con dataset real**

```tsx
import dataset from "../../generated/dataset.json";

export function RealEstateView() {
  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Real Estate Intelligence</p>
          <h1>Cuadro de Mando Real Estate</h1>
          <p className="hero__lede">
            Vista analítica conectada al dataset del vertical inmobiliario.
          </p>
          <div className="hero__meta">
            <span>Fuente: {dataset.sourceWorkbook}</span>
            <span>Apps en alcance: {dataset.apps.length}</span>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Reescribir `App.tsx` para resolver vista por ruta**

```tsx
import { useMemo } from "react";
import vaultData from "./generated/vault-data.json";
import { DashboardShell } from "./shell/DashboardShell";
import { ExecutiveView } from "./modules/executive/ExecutiveView";
import { RealEstateView } from "./modules/real-estate/RealEstateView";

const navItems = [
  { id: "executive", label: "Resumen Ejecutivo", description: "Vista ecosistema" },
  { id: "real-estate", label: "Real Estate Intelligence", description: "Vista analítica" },
] as const;

function resolveView(pathname: string) {
  return pathname.startsWith("/real-estate") ? "real-estate" : "executive";
}

export default function App() {
  const activeView = useMemo(() => resolveView(window.location.pathname), []);

  return (
    <DashboardShell
      brandName="ANCLORA COMMAND CENTER"
      brandLine="Control operativo del ecosistema"
      activeView={activeView}
      items={[...navItems]}
    >
      {activeView === "real-estate" ? (
        <RealEstateView />
      ) : (
        <ExecutiveView
          data={vaultData}
          language="es"
          generatedAt={new Date(vaultData.generatedAt).toLocaleString("es-ES")}
        />
      )}
    </DashboardShell>
  );
}
```

- [ ] **Step 6: Ejecutar build para comprobar que la shell compila**

Run: `npm run build`
Expected: build correcta en `dashboard/dist` sin errores de TypeScript.

- [ ] **Step 7: Commit**

```bash
git add dashboard/src/App.tsx dashboard/src/modules/executive/ExecutiveView.tsx dashboard/src/modules/real-estate/RealEstateView.tsx dashboard/src/shell/DashboardShell.tsx dashboard/src/shell/dashboard-shell.types.ts
git commit -m "feat: add shared shell for command center views"
```

### Task 3: Migrar la vista analítica real desde `dashboard-cuadro-de-mando`

**Files:**
- Modify: `dashboard/src/modules/real-estate/RealEstateView.tsx`
- Modify: `dashboard/src/App.css`
- Reference: `dashboard-cuadro-de-mando/src/App.tsx`
- Reference: `dashboard-cuadro-de-mando/src/App.css`

- [ ] **Step 1: Copiar la lógica de lectura analítica al módulo `RealEstateView.tsx`**

```tsx
import { useMemo, useState } from "react";
import dataset from "../../generated/dataset.json";

type Band = "critical" | "high" | "medium" | "low";

const bandLabels: Record<Band, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const layerLabels: Record<string, string> = {
  "commercial-vertical": "Vertical comercial",
  intelligence: "Inteligencia",
  partnerships: "Partnerships",
  operations: "Operaciones",
  content: "Contenido",
};

export function RealEstateView() {
  const [activeLayer, setActiveLayer] = useState<string>("all");
  const topPriority = dataset.derived.priorityRanking[0];
  const filteredApps = useMemo(
    () =>
      activeLayer === "all"
        ? dataset.apps
        : dataset.apps.filter((app) => app.ecosystem_layer === activeLayer),
    [activeLayer],
  );
  return <></>;
}
```

Copiar literalmente desde `dashboard-cuadro-de-mando/src/App.tsx` al módulo:

- hero con `priority card`
- bloque `grid--top`
- bloque `grid--middle`
- bloque `grid--bottom`

El resultado esperado es que `RealEstateView.tsx` reproduzca la vista analítica actual dentro de la nueva shell.

- [ ] **Step 2: Portar el bloque de ranking y tarjetas operativas**

```tsx
<section className="grid grid--top">
  <section className="panel">
    <p className="panel__eyebrow">Ranking</p>
    <h2 className="panel__title">Board de prioridades</h2>
    <div className="priority-list">
      {dataset.derived.priorityRanking.map((item) => (
        <article className="priority-item" key={item.app_id}>
          <div className="priority-item__rank">{item.rank}</div>
          <div className="priority-item__copy">
            <strong>{item.app_name}</strong>
            <p>{item.action_now}</p>
          </div>
          <div className="priority-item__score">{item.priority_score}</div>
        </article>
      ))}
    </div>
  </section>
</section>
```

- [ ] **Step 3: Portar inventario, dependencias, riesgos y fuentes**

```tsx
<section className="grid grid--middle">
  <section className="panel">
    <p className="panel__eyebrow">Inventario</p>
    <h2 className="panel__title">Apps y foco actual</h2>
  </section>

  <section className="panel">
    <p className="panel__eyebrow">Relaciones</p>
    <h2 className="panel__title">Mapa de dependencias críticas</h2>
  </section>
</section>

<section className="grid grid--bottom">
  <section className="panel">
    <p className="panel__eyebrow">Riesgo</p>
    <h2 className="panel__title">Riesgos principales</h2>
  </section>

  <section className="panel">
    <p className="panel__eyebrow">Trazabilidad</p>
    <h2 className="panel__title">Fuentes y distribución</h2>
  </section>
</section>
```

- [ ] **Step 4: Incorporar a `dashboard/src/App.css` solo las clases necesarias de la vista analítica**

```css
.topbar__nav {
  display: flex;
  gap: 0.75rem;
}

.topbar__nav a {
  border: 1px solid rgba(255, 184, 28, 0.2);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
}

.topbar__nav a.is-active {
  background: rgba(255, 184, 28, 0.12);
  border-color: rgba(255, 184, 28, 0.45);
}
```

- [ ] **Step 5: Ejecutar la app y verificar ambas rutas**

Run: `npm run dev`
Expected:
- `/` muestra `Resumen Ejecutivo`
- `/real-estate` muestra ranking, inventario y dependencias del dataset inmobiliario

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/modules/real-estate/RealEstateView.tsx dashboard/src/App.css
git commit -m "feat: migrate real estate intelligence view into command center"
```

### Task 4: Restaurar controles compartidos de tema e idioma sin duplicación

**Files:**
- Modify: `dashboard/src/App.tsx`
- Modify: `dashboard/src/shell/DashboardShell.tsx`
- Modify: `dashboard/src/modules/executive/ExecutiveView.tsx`
- Modify: `dashboard/src/modules/real-estate/RealEstateView.tsx`

- [ ] **Step 1: Centralizar el estado de tema en `App.tsx`**

```tsx
const [theme, setTheme] = useState<"dark" | "light" | "system">(() => {
  if (typeof window === "undefined") return "dark";
  const storedTheme = window.localStorage.getItem("anclora-command-center-theme");
  return storedTheme === "light" || storedTheme === "system" ? storedTheme : "dark";
});
```

- [ ] **Step 2: Aplicar el tema desde un único `useEffect`**

```tsx
useEffect(() => {
  const root = document.documentElement;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : theme;

  root.dataset.theme = resolved;
  window.localStorage.setItem("anclora-command-center-theme", theme);
}, [theme]);
```

- [ ] **Step 3: Pasar los controles a `DashboardShell`**

```tsx
<DashboardShell
  controls={
    <div className="topbar__toggle-group" aria-label="Selector de tema">
      {(["dark", "light", "system"] as const).map((value) => (
        <button
          key={value}
          type="button"
          className={value === theme ? "is-active" : ""}
          onClick={() => setTheme(value)}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  }
  ...
/>
```

- [ ] **Step 4: Limpiar estados duplicados dentro del módulo inmobiliario**

Run: revisar `dashboard/src/modules/real-estate/RealEstateView.tsx`
Expected: la vista ya no gestiona su propio tema ni reescribe `localStorage`.

- [ ] **Step 5: Ejecutar build y comprobar consistencia**

Run: `npm run build`
Expected: la app compila y ambas vistas usan la misma shell y el mismo tema.

- [ ] **Step 6: Commit**

```bash
git add dashboard/src/App.tsx dashboard/src/shell/DashboardShell.tsx dashboard/src/modules/executive/ExecutiveView.tsx dashboard/src/modules/real-estate/RealEstateView.tsx
git commit -m "refactor: unify shared controls across dashboard views"
```

### Task 5: Añadir verificación mínima y documentación de la nueva arquitectura

**Files:**
- Create: `dashboard/scripts/sync-real-estate-dataset.test.mjs`
- Modify: `dashboard/README.md`
- Modify: `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- Modify: `docs/governance/APPLICATION_FAMILY_MAP.md`

- [ ] **Step 1: Escribir un test mínimo para el nuevo sync inmobiliario**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { syncDataset } from "./sync-real-estate-dataset.mjs";

test("syncDataset genera dataset.json con apps y sourceWorkbook", () => {
  const outputPath = syncDataset();
  const payload = JSON.parse(fs.readFileSync(outputPath, "utf8"));

  assert.ok(payload.sourceWorkbook.includes("anclora-group-real-estate-dataset.xlsx"));
  assert.ok(Array.isArray(payload.apps));
  assert.ok(payload.apps.length > 0);
});
```

- [ ] **Step 2: Ejecutar el test aislado**

Run: `node --test ./scripts/sync-real-estate-dataset.test.mjs`
Expected: `pass 1`

- [ ] **Step 3: Actualizar `dashboard/README.md` para reflejar la unificación**

```md
# Anclora Command Center Dashboard

App premium unificada para lectura ejecutiva del ecosistema y priorización analítica del vertical inmobiliario.

## Vistas

- `Resumen Ejecutivo`
- `Real Estate Intelligence`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run sync:vault`
- `npm run sync:real-estate`
```

- [ ] **Step 4: Actualizar gobernanza para reflejar la consolidación**

Run: revisar `docs/governance/APPLICATION_FAMILY_MAP.md` y `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
Expected: `dashboard/` sigue siendo la app premium canónica y `dashboard-cuadro-de-mando/` queda marcado como superficie en migración o en fase de retirada, no como destino arquitectónico final.

- [ ] **Step 5: Commit**

```bash
git add dashboard/scripts/sync-real-estate-dataset.test.mjs dashboard/README.md docs/governance/APPLICATION_FAMILY_MAP.md docs/governance/CONTRACT_COMPLIANCE_MATRIX.md
git commit -m "docs: record unified command center dashboard architecture"
```

### Task 6: Verificación final y preparación para retirada de `dashboard-cuadro-de-mando`

**Files:**
- Reference: `dashboard/`
- Reference: `dashboard-cuadro-de-mando/`

- [ ] **Step 1: Ejecutar la validación completa de la app principal**

Run: `npm run build`
Expected: build correcta con `vault-data.json` y `dataset.json` generados dentro de `dashboard/`.

- [ ] **Step 2: Verificar paridad mínima de contenido**

Run: comparar manualmente:
- `/` contra el `dashboard/` original
- `/real-estate` contra `dashboard-cuadro-de-mando/`

Expected:
- la vista ejecutiva conserva partners, stack, proyectos y acciones rápidas
- la vista analítica conserva ranking, inventario, dependencias, riesgo y fuentes

- [ ] **Step 3: Confirmar que `dashboard-cuadro-de-mando/` ya no es necesario para operar**

Run: revisar que:
- `dataset.json` se genera en `dashboard/`
- la ruta `/real-estate` cubre el caso de uso
- `npm run dev` y `npm run build` del módulo principal funcionan sin depender de la app secundaria

Expected: la carpeta secundaria puede pasar a fase de retirada controlada.

- [ ] **Step 4: Commit**

```bash
git add dashboard
git commit -m "feat: complete command center dashboard unification"
```
