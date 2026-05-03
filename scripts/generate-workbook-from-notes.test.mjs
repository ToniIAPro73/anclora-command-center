import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import ExcelJS from "exceljs";

import {
  APP_FIELDS,
  FIELD_FIELDS,
  INTERACTION_FIELDS,
  SOURCE_FIELDS,
} from "./lib/dashboard-note-schema.mjs";
import { readDashboardNotes } from "./lib/read-dashboard-notes.mjs";
import {
  generateWorkbookFromNotes,
  validateDashboardNotes,
} from "./generate-workbook-from-notes.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const vaultRoot = path.resolve(dashboardRoot, "..");
const workbookPath = path.join(vaultRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");
const workbookSheets = [
  ["apps_master", APP_FIELDS],
  ["interacciones", INTERACTION_FIELDS],
  ["campos_analiticos", FIELD_FIELDS],
  ["fuentes", SOURCE_FIELDS],
];

async function readWorkbookRows(filePath, sheetName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet(sheetName);
  return sheet.getSheetValues().slice(1).map((row) => (Array.isArray(row) ? row.slice(1) : row));
}

test("generate-workbook-from-notes writes the canonical workbook sheets", async () => {
  const hadOriginalWorkbook = fs.existsSync(workbookPath);
  const originalWorkbook = hadOriginalWorkbook ? fs.readFileSync(workbookPath) : null;

  if (fs.existsSync(workbookPath)) {
    fs.rmSync(workbookPath, { force: true });
  }

  try {
    const generatedPath = await generateWorkbookFromNotes({ dashboardRoot });
    assert.equal(generatedPath, workbookPath);
    assert.equal(fs.existsSync(workbookPath), true);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(workbookPath);
    assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), [
      "apps_master",
      "interacciones",
      "campos_analiticos",
      "fuentes",
    ]);

    for (const [sheetName, expectedHeaders] of workbookSheets) {
      const rows = await readWorkbookRows(workbookPath, sheetName);
      assert.deepEqual(rows[0], expectedHeaders, `headers for ${sheetName} must preserve sync contract`);
    }

    const appsRows = await readWorkbookRows(workbookPath, "apps_master");
    const interactionRows = await readWorkbookRows(workbookPath, "interacciones");
    const sourceRows = await readWorkbookRows(workbookPath, "fuentes");
    const apps = appsRows.slice(1).map((row) => Object.fromEntries(APP_FIELDS.map((field, index) => [field, row[index] ?? ""])));
    const interactions = interactionRows
      .slice(1)
      .map((row) => Object.fromEntries(INTERACTION_FIELDS.map((field, index) => [field, row[index] ?? ""])));
    const sources = sourceRows.slice(1).map((row) => Object.fromEntries(SOURCE_FIELDS.map((field, index) => [field, row[index] ?? ""])));

    assert.equal(apps.length, 5);
    assert.equal(interactions.length, 10);
    assert.equal(sources.length, 26);

    const anx = apps.find((item) => item.app_id === "ANX");
    const ape = apps.find((item) => item.app_id === "APE");
    assert.ok(anx);
    assert.ok(ape);
    assert.equal(anx.main_inputs, "Leads inbound | oportunidades internas | activos de contenido | senales premium | actores/partners");
    assert.equal(anx.downstream_dependencies, "Anclora Synergi | Command Center | aprendizaje de sistema");
    assert.equal(anx.key_workflows, "Lead intake | cualificacion | activacion comercial | seguimiento | cierre");
    assert.equal(anx.documented_state, "activo");
    assert.equal(anx.source_confidence, "high");
    assert.equal(
      anx.supporting_notes,
      "resources/anclora-group.md | sistemas/Arquitectura de Integración Anclora.md | sistemas/Plan de Activación Comercial - Content Generator, Nexus y Automatizaciones.md | Anclora Command Center.md",
    );
    assert.equal(ape.app_name, "Anclora Private Estates");

    assert.deepEqual(interactions.find((item) => item.source_app === "ANX" && item.target_app === "ASY"), {
      source_app: "ANX",
      target_app: "ASY",
      interaction_type: "partner_handoff",
      what_flows: "Nexus transfiere oportunidad madura a relacion/partnership",
      business_reason: "Synergi toma el relevo para continuidad privada y onboarding",
    });

    assert.deepEqual(sources.find((item) => item.app_name === "Anclora Data Lab"), {
      app_name: "Anclora Data Lab",
      source_note: "playbooks/flujo-comercial-inteligente.md",
      source_type: "playbook",
      evidence_summary: "La usa como input territorial e inteligencia para el flujo comercial",
    });
  } finally {
    if (originalWorkbook) {
      fs.writeFileSync(workbookPath, originalWorkbook);
    } else if (fs.existsSync(workbookPath)) {
      fs.rmSync(workbookPath, { force: true });
    }
  }
});

test("validateDashboardNotes rejects missing app ids", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.apps = [{ ...data.apps[0], app_id: "" }, ...data.apps.slice(1)];

  assert.throws(() => validateDashboardNotes(data), /Missing app_id/);
});

test("validateDashboardNotes rejects duplicate app ids", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.apps = [...data.apps, { ...data.apps[0] }];

  assert.throws(() => validateDashboardNotes(data), /Duplicate app_id/);
});

test("validateDashboardNotes rejects unknown source apps", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.interactions = [{ ...data.interactions[0], source_app: "ZZZ" }];

  assert.throws(() => validateDashboardNotes(data), /Unknown source_app/);
});

test("validateDashboardNotes rejects unknown target apps", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.interactions = [{ ...data.interactions[0], target_app: "ZZZ" }];

  assert.throws(() => validateDashboardNotes(data), /Unknown target_app/);
});

test("generateWorkbookFromNotes uses the provided dashboardRoot for output", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dashboard-notes-sot-"));
  const tempDashboardRoot = path.join(tempRoot, "dashboard");
  const tempResourcesDir = path.join(tempRoot, "resources");
  const sourceResources = path.join(vaultRoot, "resources", "dashboard-real-estate");
  const targetResources = path.join(tempResourcesDir, "dashboard-real-estate");
  const expectedWorkbookPath = path.join(tempRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");
  const hadDefaultWorkbook = fs.existsSync(workbookPath);

  try {
    fs.mkdirSync(tempDashboardRoot, { recursive: true });
    fs.mkdirSync(tempResourcesDir, { recursive: true });
    fs.cpSync(sourceResources, targetResources, { recursive: true });

    const generatedPath = await generateWorkbookFromNotes({ dashboardRoot: tempDashboardRoot });

    assert.equal(generatedPath, expectedWorkbookPath);
    assert.equal(fs.existsSync(expectedWorkbookPath), true);
    assert.equal(fs.existsSync(workbookPath), hadDefaultWorkbook);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
