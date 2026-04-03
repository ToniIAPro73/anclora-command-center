import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

import { syncDataset } from "./sync-real-estate-dataset.mjs";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

function writeWorkbook(workbookPath) {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([
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
    ]),
    "apps_master",
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([
      {
        source_app: "app-command-center",
        target_app: "app-real-estate",
        interaction_type: "navigates_to",
        what_flows: "User opens the real estate view from the shared shell.",
      },
    ]),
    "interacciones",
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([
      {
        field_name: "priority_band",
        description: "Derived band used by dashboard cards.",
      },
    ]),
    "campos_analiticos",
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([
      {
        app_name: "Command Center",
        source_name: "Manual review",
      },
      {
        app_name: "",
        source_name: "Ignored empty source row",
      },
    ]),
    "fuentes",
  );

  XLSX.writeFile(workbook, workbookPath);
}

test("syncDataset builds the real estate dataset payload from the workbook contract", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "real-estate-sync-"));

  try {
    const dashboardRoot = path.join(tempRoot, "dashboard");
    const workbookDir = path.join(tempRoot, "output", "spreadsheet");
    const workbookPath = path.join(workbookDir, "anclora-group-real-estate-dataset.xlsx");

    fs.mkdirSync(path.join(dashboardRoot, "src", "generated"), { recursive: true });
    fs.mkdirSync(workbookDir, { recursive: true });

    writeWorkbook(workbookPath);

    const outputPath = syncDataset({ dashboardRoot });
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
