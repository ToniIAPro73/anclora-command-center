import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const generatedFile = path.join(dashboardRoot, "src", "generated", "dataset.json");

test("sync-dataset genera dataset.json con derivados operativos", () => {
  if (fs.existsSync(generatedFile)) {
    fs.rmSync(generatedFile, { force: true });
  }

  execFileSync("node", ["./scripts/sync-dataset.mjs"], {
    cwd: dashboardRoot,
    stdio: "pipe",
  });

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
