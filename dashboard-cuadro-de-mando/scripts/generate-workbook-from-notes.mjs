import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import XLSX from "xlsx";

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
  const workbookPath = path.join(vaultRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");

  return { dashboardRoot, vaultRoot, workbookPath };
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

function createWorkbook(data) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapRows(data.apps, APP_FIELDS)), "apps_master");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(mapRows(data.interactions, INTERACTION_FIELDS)),
    "interacciones",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(mapRows(data.fields, FIELD_FIELDS)),
    "campos_analiticos",
  );
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapRows(data.sources, SOURCE_FIELDS)), "fuentes");
  return workbook;
}

export function generateWorkbookFromNotes({ dashboardRoot: inputDashboardRoot = defaultDashboardRoot } = {}) {
  const { dashboardRoot, workbookPath } = resolvePaths(inputDashboardRoot);
  const data = readDashboardNotes({ dashboardRoot });
  validateDashboardNotes(data);

  const workbook = createWorkbook(data);
  ensureDir(path.dirname(workbookPath));
  XLSX.writeFile(workbook, workbookPath);

  return workbookPath;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateWorkbookFromNotes();
}
