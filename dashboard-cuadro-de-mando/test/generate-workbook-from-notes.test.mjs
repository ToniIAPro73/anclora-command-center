import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import XLSX from "xlsx";

import { readDashboardNotes } from "../scripts/lib/read-dashboard-notes.mjs";
import { validateDashboardNotes } from "../scripts/generate-workbook-from-notes.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const workbookPath = path.join(dashboardRoot, "..", "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");

test("generate-workbook-from-notes writes the canonical workbook sheets", () => {
  if (fs.existsSync(workbookPath)) {
    fs.rmSync(workbookPath, { force: true });
  }

  execFileSync("node", ["./scripts/generate-workbook-from-notes.mjs"], {
    cwd: dashboardRoot,
    stdio: "pipe",
  });

  assert.equal(fs.existsSync(workbookPath), true, "debe generar el workbook derivado");

  const workbook = XLSX.readFile(workbookPath);
  assert.deepEqual(workbook.SheetNames, [
    "apps_master",
    "interacciones",
    "campos_analiticos",
    "fuentes",
  ]);

  const apps = XLSX.utils.sheet_to_json(workbook.Sheets.apps_master, { defval: "" });
  const interactions = XLSX.utils.sheet_to_json(workbook.Sheets.interacciones, { defval: "" });
  const fields = XLSX.utils.sheet_to_json(workbook.Sheets.campos_analiticos, { defval: "" });
  const sources = XLSX.utils.sheet_to_json(workbook.Sheets.fuentes, { defval: "" });

  assert.equal(apps.length, 5);
  assert.equal(interactions.length, 10);
  assert.equal(fields.length, 26);
  assert.equal(sources.length, 26);
  assert.equal(apps[0].supporting_notes.includes(" | "), true, "las listas deben serializarse con separador pipe");
});

test("validateDashboardNotes rejects duplicate app ids", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.apps = [...data.apps, { ...data.apps[0] }];

  assert.throws(() => validateDashboardNotes(data), /Duplicate app_id/);
});

test("validateDashboardNotes rejects unknown interaction apps", () => {
  const data = readDashboardNotes({ dashboardRoot });
  data.interactions = [{ ...data.interactions[0], target_app: "ZZZ" }];

  assert.throws(() => validateDashboardNotes(data), /Unknown target_app/);
});
