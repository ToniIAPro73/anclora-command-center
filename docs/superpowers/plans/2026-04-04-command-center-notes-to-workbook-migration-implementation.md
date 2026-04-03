# Command Center Notes To Workbook Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover a `dashboard/` el pipeline restante `notas -> workbook` para que `anclora-command-center` no dependa operativamente de `dashboard-cuadro-de-mando/`.

**Architecture:** Se trasladará el tooling de lectura, validación, generación de workbook y watcher desde `dashboard-cuadro-de-mando/` a `dashboard/`, manteniendo la misma fuente de verdad y el mismo workbook. Después se adaptarán scripts y tests y se validará el flujo end-to-end.

**Tech Stack:** Node.js scripts, ExcelJS, gray-matter, chokidar, React/Vite

---

### Task 1: Mover las librerías base del pipeline a `dashboard/scripts/lib`

**Files:**
- Create: `dashboard/scripts/lib/dashboard-note-schema.mjs`
- Create: `dashboard/scripts/lib/read-dashboard-notes.mjs`
- Reference: `dashboard-cuadro-de-mando/scripts/lib/dashboard-note-schema.mjs`
- Reference: `dashboard-cuadro-de-mando/scripts/lib/read-dashboard-notes.mjs`

- [ ] Copiar el esquema y lector de notas al nuevo destino
- [ ] Ajustar rutas por defecto para que resuelvan desde `dashboard/`
- [ ] Verificar que la lectura apunta a `resources/dashboard-real-estate/`

### Task 2: Mover la generación de workbook al dashboard principal

**Files:**
- Create: `dashboard/scripts/generate-workbook-from-notes.mjs`
- Modify: `dashboard/package.json`
- Reference: `dashboard-cuadro-de-mando/scripts/generate-workbook-from-notes.mjs`

- [ ] Crear el script en `dashboard/scripts/`
- [ ] Cambiar cualquier dependencia residual de `xlsx` a `exceljs`
- [ ] Añadir `generate:workbook` a `dashboard/package.json`
- [ ] Añadir `sync:notes` como wrapper de regeneración completa

### Task 3: Mover el watcher de notas al dashboard principal

**Files:**
- Create: `dashboard/scripts/watch-notes-and-sync.mjs`
- Modify: `dashboard/package.json`
- Reference: `dashboard-cuadro-de-mando/scripts/watch-notes-and-sync.mjs`

- [ ] Crear el watcher en `dashboard/scripts/`
- [ ] Hacer que ejecute `generate-workbook-from-notes` seguido de `sync-real-estate-dataset`
- [ ] Añadir `watch:notes` a `dashboard/package.json`

### Task 4: Trasladar los tests del pipeline

**Files:**
- Create: `dashboard/scripts/read-dashboard-notes.test.mjs`
- Create: `dashboard/scripts/generate-workbook-from-notes.test.mjs`
- Create: `dashboard/scripts/watch-notes-and-sync.smoke.test.mjs`
- Reference: `dashboard-cuadro-de-mando/test/*.mjs`

- [ ] Trasladar los tests al nuevo árbol
- [ ] Ajustar imports y rutas
- [ ] Asegurar que los tests no dependan de `dashboard-cuadro-de-mando/`

### Task 5: Documentar y verificar el flujo final

**Files:**
- Modify: `dashboard/README.md`

- [ ] Documentar los nuevos scripts operativos
- [ ] Ejecutar:
  - `node --test .\\scripts\\read-dashboard-notes.test.mjs`
  - `node --test .\\scripts\\generate-workbook-from-notes.test.mjs`
  - `node --test .\\scripts\\watch-notes-and-sync.smoke.test.mjs`
  - `node --test .\\scripts\\sync-real-estate-dataset.test.mjs`
  - `npm run build`
- [ ] Hacer una prueba manual controlada: tocar una nota canónica, regenerar y confirmar que el cambio llega a `/real-estate`

### Task 6: Dejar `dashboard-cuadro-de-mando/` listo para retirada

**Files:**
- No code required initially; evidence task

- [ ] Confirmar que ningún script operativo de `dashboard/` depende ya de `dashboard-cuadro-de-mando/`
- [ ] Confirmar que la retirada de la carpeta ya no rompería el flujo del dashboard principal
