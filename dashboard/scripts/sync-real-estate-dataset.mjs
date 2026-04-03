import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardRoot = path.resolve(__dirname, "..");

const BAND_BY_SCORE = [
  { min: 75, band: "critical" },
  { min: 55, band: "high" },
  { min: 35, band: "medium" },
  { min: 0, band: "low" },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Missing sheet: ${sheetName}`);
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function toList(value) {
  return String(value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function scoreApp(app, interactions, sources) {
  let score = 0;

  if (app.documented_state === "activo") score += 28;
  if (app.maturity_status.includes("pending")) score += 12;
  if (app.maturity_status === "pending_to_active_transition") score += 8;
  if (app.source_confidence === "high") score += 10;
  if (String(app.main_risks).length > 30) score += 8;
  if (String(app.next_focus).length > 20) score += 8;

  const outgoing = interactions.filter((item) => item.source_app === app.app_id).length;
  const incoming = interactions.filter((item) => item.target_app === app.app_id).length;
  score += (outgoing + incoming) * 4;

  const sourceCount = sources.filter((item) => item.app_name === app.app_name).length;
  score += Math.min(sourceCount * 2, 10);

  if (app.app_name === "Anclora Nexus") score += 15;
  if (app.app_name === "Anclora Private Estates") score += 9;
  if (app.app_name === "Anclora Content Generator AI") score += 7;

  return Math.min(score, 100);
}

function bandForScore(score) {
  return BAND_BY_SCORE.find((item) => score >= item.min)?.band ?? "low";
}

function actionForApp(app) {
  return app.next_focus || app.main_risks || app.state_summary;
}

function buildDependencyMap(apps, interactions) {
  return {
    nodes: apps.map((app) => ({
      id: app.app_id,
      label: app.app_name,
      layer: app.ecosystem_layer,
      band: app.priority_band,
    })),
    links: interactions.map((item) => ({
      source: item.source_app,
      target: item.target_app,
      type: item.interaction_type,
      label: item.what_flows,
    })),
  };
}

function groupCount(items, key) {
  const counts = new Map();
  items.forEach((item) => {
    const value = item[key] || "unknown";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
}

export function syncDataset({ dashboardRoot: inputDashboardRoot = dashboardRoot } = {}) {
  const resolvedDashboardRoot = path.resolve(inputDashboardRoot);
  const resolvedVaultRoot = path.resolve(resolvedDashboardRoot, "..");
  const resolvedWorkbookPath = path.join(
    resolvedVaultRoot,
    "output",
    "spreadsheet",
    "anclora-group-real-estate-dataset.xlsx",
  );
  const resolvedGeneratedDir = path.join(resolvedDashboardRoot, "src", "generated");
  const resolvedOutputPath = path.join(resolvedGeneratedDir, "dataset.json");

  if (!fs.existsSync(resolvedWorkbookPath)) {
    throw new Error(`Workbook not found: ${resolvedWorkbookPath}`);
  }

  ensureDir(resolvedGeneratedDir);

  const workbook = XLSX.readFile(resolvedWorkbookPath);
  const apps = readSheet(workbook, "apps_master");
  const interactions = readSheet(workbook, "interacciones");
  const fieldDictionary = readSheet(workbook, "campos_analiticos");
  const sources = readSheet(workbook, "fuentes").filter((item) => item.app_name);

  const enrichedApps = apps.map((app) => {
    const priority_score = scoreApp(app, interactions, sources);
    const priority_band = bandForScore(priority_score);

    return {
      ...app,
      upstream_list: toList(app.upstream_dependencies),
      downstream_list: toList(app.downstream_dependencies),
      workflow_list: toList(app.key_workflows),
      priority_score,
      priority_band,
      action_now: actionForApp(app),
    };
  });

  const priorityRanking = [...enrichedApps]
    .sort((a, b) => b.priority_score - a.priority_score)
    .map((app, index) => ({
      rank: index + 1,
      app_id: app.app_id,
      app_name: app.app_name,
      priority_score: app.priority_score,
      priority_band: app.priority_band,
      app_type: app.app_type,
      documented_state: app.documented_state,
      action_now: app.action_now,
      main_risks: app.main_risks,
      next_focus: app.next_focus,
    }));

  const actionCards = priorityRanking.slice(0, 4).map((app) => ({
    app_id: app.app_id,
    app_name: app.app_name,
    priority_band: app.priority_band,
    title: app.app_name,
    action_now: app.action_now,
    why_now: app.main_risks,
  }));

  const riskSummary = priorityRanking.map((app) => ({
    app_name: app.app_name,
    priority_band: app.priority_band,
    main_risks: app.main_risks,
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceWorkbook: path.relative(resolvedVaultRoot, resolvedWorkbookPath).replaceAll("\\", "/"),
    apps: enrichedApps,
    interactions,
    fieldDictionary,
    sources,
    derived: {
      priorityRanking,
      actionCards,
      riskSummary,
      layerDistribution: groupCount(enrichedApps, "ecosystem_layer"),
      confidenceSummary: groupCount(enrichedApps, "source_confidence"),
      dependencyMap: buildDependencyMap(enrichedApps, interactions),
    },
  };

  fs.writeFileSync(resolvedOutputPath, JSON.stringify(payload, null, 2));
  process.stdout.write(
    `Dataset synced to ${path.relative(resolvedVaultRoot, resolvedOutputPath).replaceAll("\\", "/")}\n`,
  );

  return resolvedOutputPath;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncDataset();
}
