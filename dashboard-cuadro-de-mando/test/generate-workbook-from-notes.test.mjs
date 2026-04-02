import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import XLSX from "xlsx";

import {
  APP_FIELDS,
  FIELD_FIELDS,
  INTERACTION_FIELDS,
  SOURCE_FIELDS,
} from "../scripts/lib/dashboard-note-schema.mjs";
import { readDashboardNotes } from "../scripts/lib/read-dashboard-notes.mjs";
import { generateWorkbookFromNotes, validateDashboardNotes } from "../scripts/generate-workbook-from-notes.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const vaultRoot = path.resolve(dashboardRoot, "..");
const workbookPath = path.join(vaultRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");
const workbookSheets = [
  ["apps_master", APP_FIELDS],
  ["interacciones", INTERACTION_FIELDS],
  ["campos_analiticos", FIELD_FIELDS],
  ["fuentes", SOURCE_FIELDS],
];

test("generate-workbook-from-notes writes the canonical workbook sheets", () => {
  const originalWorkbook = fs.readFileSync(workbookPath);

  if (fs.existsSync(workbookPath)) {
    fs.rmSync(workbookPath, { force: true });
  }

  try {
    const generatedPath = generateWorkbookFromNotes({ dashboardRoot });
    assert.equal(generatedPath, workbookPath, "debe derivar el workbook desde el dashboardRoot dado");
    assert.equal(fs.existsSync(workbookPath), true, "debe generar el workbook derivado");

    const workbook = XLSX.readFile(workbookPath);
    assert.deepEqual(workbook.SheetNames, ["apps_master", "interacciones", "campos_analiticos", "fuentes"]);

    for (const [sheetName, expectedHeaders] of workbookSheets) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
      assert.deepEqual(rows[0], expectedHeaders, `headers for ${sheetName} must preserve sync-dataset contract`);
    }

    const apps = XLSX.utils.sheet_to_json(workbook.Sheets.apps_master, { defval: "" });
    assert.equal(apps.length, 5);
    const ape = apps.find((item) => item.app_id === "APE");
    assert.ok(ape, "expected the APE app row");
    assert.equal(ape.app_name, "Anclora Private Estates");
    assert.equal(
      ape.upstream_dependencies,
      "Anclora Group | Anclora Data Lab | Anclora Nexus | Anclora Synergi",
    );
    assert.equal(ape.downstream_dependencies, "Anclora Nexus | Anclora Synergi | Anclora Data Lab");
    assert.equal(ape.key_workflows, "Captacion premium | posicionamiento territorial | coordinacion comercial");
    assert.equal(ape.supporting_notes, "resources/anclora-group.md | sistemas/Arquitectura de Integración Anclora.md | Anclora Command Center.md");
  } finally {
    fs.writeFileSync(workbookPath, originalWorkbook);
  }
});

test("validateDashboardNotes rejects missing app ids", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.apps = [{ ...data.apps[0], app_id: "" }, ...data.apps.slice(1)];

  assert.throws(() => validateDashboardNotes(data), /Missing app_id/);
});

test("validateDashboardNotes rejects unknown source apps", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.interactions = [{ ...data.interactions[0], source_app: "ZZZ" }];

  assert.throws(() => validateDashboardNotes(data), /Unknown source_app/);
});

test("generateWorkbookFromNotes uses the provided dashboardRoot for output", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dashboard-notes-sot-"));
  const tempDashboardRoot = path.join(tempRoot, "dashboard-cuadro-de-mando");
  const tempResourcesDir = path.join(tempRoot, "resources");
  const sourceResources = path.join(vaultRoot, "resources", "dashboard-real-estate");
  const targetResources = path.join(tempResourcesDir, "dashboard-real-estate");
  const expectedWorkbookPath = path.join(tempRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");

  try {
    fs.mkdirSync(tempDashboardRoot, { recursive: true });
    fs.mkdirSync(tempResourcesDir, { recursive: true });
    fs.cpSync(sourceResources, targetResources, { recursive: true });

    const generatedPath = generateWorkbookFromNotes({ dashboardRoot: tempDashboardRoot });

    assert.equal(generatedPath, expectedWorkbookPath);
    assert.equal(fs.existsSync(expectedWorkbookPath), true);
    assert.equal(fs.existsSync(workbookPath), true, "default workbook path should remain available");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
