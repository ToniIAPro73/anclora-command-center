import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ExcelJS from "exceljs";

import {
  APP_FIELDS,
  FIELD_FIELDS,
  INTERACTION_FIELDS,
  LIST_FIELDS,
  SOURCE_FIELDS,
} from "./lib/dashboard-note-schema.mjs";
import { readDashboardNotes } from "./lib/read-dashboard-notes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDashboardRoot = path.resolve(__dirname, "..");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function serializeCell(field, value) {
  if (!LIST_FIELDS.has(field)) {
    return String(value ?? "");
  }

  if (!Array.isArray(value)) {
    return String(value ?? "");
  }

  return value.map((item) => String(item).trim()).filter(Boolean).join(" | ");
}

function mapRows(rows, fields) {
  return rows.map((row) => {
    const mapped = {};

    for (const field of fields) {
      mapped[field] = serializeCell(field, row[field]);
    }

    return mapped;
  });
}

function resolvePaths(inputDashboardRoot) {
  const dashboardRoot = path.resolve(inputDashboardRoot);
  const vaultRoot = path.resolve(dashboardRoot, "..");
  const workbookPath = path.join(
    vaultRoot,
    "output",
    "spreadsheet",
    "anclora-group-real-estate-dataset.xlsx",
  );

  return { dashboardRoot, workbookPath };
}

export function validateDashboardNotes(data) {
  const appIds = new Set();

  for (const app of data.apps) {
    const appId = String(app.app_id ?? "").trim();
    if (!appId) {
      throw new Error("Missing app_id in apps_master");
    }
    if (appIds.has(appId)) {
      throw new Error(`Duplicate app_id "${appId}" in apps_master`);
    }
    appIds.add(appId);
  }

  for (const interaction of data.interactions) {
    const sourceApp = String(interaction.source_app ?? "").trim();
    const targetApp = String(interaction.target_app ?? "").trim();

    if (!appIds.has(sourceApp)) {
      throw new Error(`Unknown source_app "${sourceApp}" in interacciones`);
    }

    if (!appIds.has(targetApp)) {
      throw new Error(`Unknown target_app "${targetApp}" in interacciones`);
    }
  }
}

function appendSheet(workbook, sheetName, rows, fields) {
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(fields);
  for (const row of mapRows(rows, fields)) {
    sheet.addRow(fields.map((field) => row[field]));
  }
}

function createWorkbook(data) {
  const workbook = new ExcelJS.Workbook();
  appendSheet(workbook, "apps_master", data.apps, APP_FIELDS);
  appendSheet(workbook, "interacciones", data.interactions, INTERACTION_FIELDS);
  appendSheet(workbook, "campos_analiticos", data.fields, FIELD_FIELDS);
  appendSheet(workbook, "fuentes", data.sources, SOURCE_FIELDS);
  return workbook;
}

export async function generateWorkbookFromNotes({
  dashboardRoot: inputDashboardRoot = defaultDashboardRoot,
} = {}) {
  const { dashboardRoot, workbookPath } = resolvePaths(inputDashboardRoot);
  const data = readDashboardNotes({ dashboardRoot });
  validateDashboardNotes(data);

  const workbook = createWorkbook(data);
  ensureDir(path.dirname(workbookPath));
  await workbook.xlsx.writeFile(workbookPath);

  return workbookPath;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateWorkbookFromNotes();
}
