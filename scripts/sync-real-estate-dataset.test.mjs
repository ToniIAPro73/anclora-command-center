import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";

import { syncDataset } from "./sync-real-estate-dataset.mjs";
async function writeWorkbook(workbookPath) {
  const workbook = new ExcelJS.Workbook();

  const appsSheet = workbook.addWorksheet("apps_master");
  appsSheet.columns = [
    { header: "app_id", key: "app_id" },
    { header: "app_name", key: "app_name" },
    { header: "app_type", key: "app_type" },
    { header: "documented_state", key: "documented_state" },
    { header: "maturity_status", key: "maturity_status" },
    { header: "source_confidence", key: "source_confidence" },
    { header: "main_risks", key: "main_risks" },
    { header: "next_focus", key: "next_focus" },
    { header: "state_summary", key: "state_summary" },
    { header: "upstream_dependencies", key: "upstream_dependencies" },
    { header: "downstream_dependencies", key: "downstream_dependencies" },
    { header: "key_workflows", key: "key_workflows" },
    { header: "ecosystem_layer", key: "ecosystem_layer" },
  ];
  appsSheet.addRows([
    {
      app_id: "app-command-center",
      app_name: "Command Center",
      app_type: "dashboard",
      documented_state: "activo",
      maturity_status: "pending_to_active_transition",
      source_confidence: "high",
      main_risks: "Critical dependency on a single manual sync step for high-signal reporting.",
      next_focus: "Validate the unified shell and finalize the premium dashboard migration path.",
      state_summary: "Unified shell operational.",
      upstream_dependencies: "vault | spreadsheet",
      downstream_dependencies: "exec-reporting | real-estate",
      key_workflows: "triage | monitoring",
      ecosystem_layer: "experience",
    },
    {
      app_id: "app-real-estate",
      app_name: "Real Estate",
      app_type: "module",
      documented_state: "documentado",
      maturity_status: "mapped",
      source_confidence: "medium",
      main_risks: "Secondary surface still depends on legacy navigation references.",
      next_focus: "",
      state_summary: "Ready for migration follow-up.",
      upstream_dependencies: "",
      downstream_dependencies: "",
      key_workflows: "portfolio review",
      ecosystem_layer: "operations",
    },
  ]);

  const interactionsSheet = workbook.addWorksheet("interacciones");
  interactionsSheet.columns = [
    { header: "source_app", key: "source_app" },
    { header: "target_app", key: "target_app" },
    { header: "interaction_type", key: "interaction_type" },
    { header: "what_flows", key: "what_flows" },
  ];
  interactionsSheet.addRow({
    source_app: "app-command-center",
    target_app: "app-real-estate",
    interaction_type: "navigates_to",
    what_flows: "User opens the real estate view from the shared shell.",
  });

  const fieldsSheet = workbook.addWorksheet("campos_analiticos");
  fieldsSheet.columns = [
    { header: "field_name", key: "field_name" },
    { header: "description", key: "description" },
  ];
  fieldsSheet.addRow({
    field_name: "priority_band",
    description: "Derived band used by dashboard cards.",
  });

  const sourcesSheet = workbook.addWorksheet("fuentes");
  sourcesSheet.columns = [
    { header: "app_name", key: "app_name" },
    { header: "source_name", key: "source_name" },
  ];
  sourcesSheet.addRows([
    {
      app_name: "Command Center",
      source_name: "Manual review",
    },
    {
      app_name: "",
      source_name: "Ignored empty source row",
    },
  ]);

  await workbook.xlsx.writeFile(workbookPath);
}

test("syncDataset builds the real estate dataset payload from the workbook contract", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "real-estate-sync-"));

  try {
    const dashboardRoot = path.join(tempRoot, "dashboard");
    const workbookDir = path.join(tempRoot, "output", "spreadsheet");
    const workbookPath = path.join(workbookDir, "anclora-group-real-estate-dataset.xlsx");

    fs.mkdirSync(path.join(dashboardRoot, "src", "generated"), { recursive: true });
    fs.mkdirSync(workbookDir, { recursive: true });

    await writeWorkbook(workbookPath);

    const outputPath = await syncDataset({ dashboardRoot });
    const payload = JSON.parse(fs.readFileSync(outputPath, "utf8"));

    assert.equal(outputPath, path.join(dashboardRoot, "src", "generated", "dataset.json"));
    assert.equal(
      payload.sourceWorkbook,
      "output/spreadsheet/anclora-group-real-estate-dataset.xlsx",
    );
    assert.match(payload.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(payload.apps.length, 2);
    assert.equal(payload.interactions.length, 1);
    assert.equal(payload.fieldDictionary.length, 1);
    assert.equal(payload.sources.length, 1);

    const [commandCenter, realEstate] = payload.apps;
    assert.deepEqual(commandCenter.upstream_list, ["vault", "spreadsheet"]);
    assert.deepEqual(commandCenter.downstream_list, ["exec-reporting", "real-estate"]);
    assert.deepEqual(commandCenter.workflow_list, ["triage", "monitoring"]);
    assert.equal(commandCenter.priority_band, "critical");
    assert.equal(
      commandCenter.action_now,
      "Validate the unified shell and finalize the premium dashboard migration path.",
    );

    assert.deepEqual(realEstate.upstream_list, []);
    assert.deepEqual(realEstate.workflow_list, ["portfolio review"]);
    assert.equal(realEstate.action_now, "Secondary surface still depends on legacy navigation references.");

    assert.equal(payload.derived.priorityRanking[0].app_id, "app-command-center");
    assert.equal(payload.derived.priorityRanking[0].rank, 1);
    assert.equal(payload.derived.priorityRanking[1].app_id, "app-real-estate");
    assert.equal(payload.derived.actionCards.length, 2);
    assert.deepEqual(payload.derived.layerDistribution, [
      { label: "experience", value: 1 },
      { label: "operations", value: 1 },
    ]);
    assert.deepEqual(payload.derived.confidenceSummary, [
      { label: "high", value: 1 },
      { label: "medium", value: 1 },
    ]);
    assert.deepEqual(payload.derived.dependencyMap.nodes, [
      {
        id: "app-command-center",
        label: "Command Center",
        layer: "experience",
        band: "critical",
      },
      {
        id: "app-real-estate",
        label: "Real Estate",
        layer: "operations",
        band: "low",
      },
    ]);
    assert.deepEqual(payload.derived.dependencyMap.links, [
      {
        source: "app-command-center",
        target: "app-real-estate",
        type: "navigates_to",
        label: "User opens the real estate view from the shared shell.",
      },
    ]);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
