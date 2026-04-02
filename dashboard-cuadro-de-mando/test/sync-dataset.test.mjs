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

  assert.equal(dataset.apps.length, 5, "debe incluir las 5 apps de Real Estate");
  assert.ok(dataset.derived.priorityRanking.length > 0, "debe calcular ranking de prioridades");
  assert.ok(dataset.derived.actionCards.length > 0, "debe calcular tarjetas de accion");
  assert.ok(dataset.derived.dependencyMap.nodes.length > 0, "debe exponer nodos de dependencias");
  assert.equal(
    dataset.derived.priorityRanking[0].app_name,
    "Anclora Nexus",
    "Nexus debe aparecer como prioridad principal del dataset actual",
  );
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
});
