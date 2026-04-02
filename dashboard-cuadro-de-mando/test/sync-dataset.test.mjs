import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const vaultRoot = path.resolve(dashboardRoot, "..");
const workbookFile = path.join(vaultRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");
const generatedFile = path.join(dashboardRoot, "src", "generated", "dataset.json");

test("sync-dataset genera dataset.json con derivados operativos", () => {
  if (fs.existsSync(workbookFile)) {
    fs.rmSync(workbookFile, { force: true });
  }
  if (fs.existsSync(generatedFile)) {
    fs.rmSync(generatedFile, { force: true });
  }

  execSync("npm run sync:data", {
    cwd: dashboardRoot,
    stdio: "pipe",
  });

  assert.equal(fs.existsSync(workbookFile), true, "debe regenerar el workbook canonico antes del dataset");
  assert.equal(fs.existsSync(generatedFile), true, "debe generar src/generated/dataset.json");

  const dataset = JSON.parse(fs.readFileSync(generatedFile, "utf8"));
  const anx = dataset.apps.find((app) => app.app_id === "ANX");
  const ape = dataset.apps.find((app) => app.app_id === "APE");

  assert.equal(dataset.apps.length, 5, "debe incluir las 5 apps de Real Estate");
  assert.equal(dataset.interactions.length, 10, "debe preservar el set actual de interacciones");
  assert.equal(dataset.fieldDictionary.length, 26, "debe conservar el diccionario de campos");
  assert.equal(dataset.sources.length, 26, "debe conservar la capa de fuentes");
  assert.ok(anx, "debe incluir la app ANX enriquecida");
  assert.ok(ape, "debe incluir la app APE enriquecida");
  assert.ok(dataset.derived.priorityRanking.length > 0, "debe calcular ranking de prioridades");
  assert.ok(dataset.derived.actionCards.length > 0, "debe calcular tarjetas de accion");
  assert.equal(dataset.derived.dependencyMap.nodes.length, 5, "debe exponer un nodo por app");
  assert.equal(dataset.derived.dependencyMap.links.length, 10, "debe exponer un enlace por interaccion");
  assert.equal(
    dataset.derived.priorityRanking[0].app_name,
    "Anclora Nexus",
    "Nexus debe aparecer como prioridad principal del dataset actual",
  );
  assert.deepEqual(dataset.derived.priorityRanking[0], {
    rank: 1,
    app_id: "ANX",
    app_name: "Anclora Nexus",
    priority_score: 100,
    priority_band: "critical",
    app_type: "pipeline-crm-platform",
    documented_state: "activo",
    action_now: "Consolidar etapas reales del pipeline y una vista clara de siguiente mejor accion",
    main_risks: "Convertirse en contenedor ambiguo si no se simplifican los flujos prioritarios",
    next_focus: "Consolidar etapas reales del pipeline y una vista clara de siguiente mejor accion",
  });
  assert.deepEqual(dataset.derived.actionCards[0], {
    app_id: "ANX",
    app_name: "Anclora Nexus",
    priority_band: "critical",
    title: "Anclora Nexus",
    action_now: "Consolidar etapas reales del pipeline y una vista clara de siguiente mejor accion",
    why_now: "Convertirse en contenedor ambiguo si no se simplifican los flujos prioritarios",
  });
  assert.deepEqual(dataset.derived.dependencyMap.links.find((link) => link.source === "ANX" && link.target === "ASY"), {
    source: "ANX",
    target: "ASY",
    type: "partner_handoff",
    label: "Nexus transfiere oportunidad madura a relacion/partnership",
  });
  assert.deepEqual(anx.upstream_list, ["Anclora Private Estates", "Anclora Content Generator AI", "Anclora Data Lab"]);
  assert.deepEqual(anx.workflow_list, ["Lead intake", "cualificacion", "activacion comercial", "seguimiento", "cierre"]);
  assert.equal(anx.priority_score, 100);
  assert.equal(anx.priority_band, "critical");
  assert.equal(anx.action_now, anx.next_focus);
  assert.deepEqual(ape.upstream_list, ["Anclora Group", "Anclora Data Lab", "Anclora Nexus", "Anclora Synergi"]);
  assert.equal(ape.priority_score, 87);
  assert.equal(ape.priority_band, "critical");
});

test("sync-dataset json step preserves the existing workbook", () => {
  execSync("npm run generate:workbook", {
    cwd: dashboardRoot,
    stdio: "pipe",
  });

  const before = fs.statSync(workbookFile);

  if (fs.existsSync(generatedFile)) {
    fs.rmSync(generatedFile, { force: true });
  }

  execSync("node ./scripts/sync-dataset.mjs", {
    cwd: dashboardRoot,
    stdio: "pipe",
  });

  const after = fs.statSync(workbookFile);
  const dataset = JSON.parse(fs.readFileSync(generatedFile, "utf8"));

  assert.equal(after.mtimeMs, before.mtimeMs, "el paso JSON no debe regenerar el workbook");
  assert.equal(dataset.sourceWorkbook, "output/spreadsheet/anclora-group-real-estate-dataset.xlsx");
  assert.equal(dataset.apps.length, 5);
  assert.equal(dataset.derived.priorityRanking[0].app_id, "ANX");
});
