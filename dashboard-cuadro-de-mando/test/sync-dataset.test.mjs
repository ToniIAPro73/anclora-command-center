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
  const originalWorkbook = fs.readFileSync(workbookFile);
  const originalDataset = fs.existsSync(generatedFile) ? fs.readFileSync(generatedFile) : null;

  if (fs.existsSync(generatedFile)) {
    fs.rmSync(generatedFile, { force: true });
  }
  if (fs.existsSync(workbookFile)) {
    fs.rmSync(workbookFile, { force: true });
  }

  try {
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
  } finally {
    if (originalDataset) {
      fs.writeFileSync(generatedFile, originalDataset);
    } else if (fs.existsSync(generatedFile)) {
      fs.rmSync(generatedFile, { force: true });
    }

    fs.writeFileSync(workbookFile, originalWorkbook);
  }
});
