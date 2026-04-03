import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

import { generateWorkbookFromNotes } from "./generate-workbook-from-notes.mjs";
import { syncDataset } from "./sync-real-estate-dataset.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const vaultRoot = path.resolve(dashboardRoot, "..");
const resourcesRoot = path.join(vaultRoot, "resources", "dashboard-real-estate");

function waitForText(stream, expectedText, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for "${expectedText}"`));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      stream.off("data", onData);
    }

    function onData(chunk) {
      buffer += chunk.toString("utf8");
      if (buffer.includes(expectedText)) {
        cleanup();
        resolve(buffer);
      }
    }

    stream.on("data", onData);
  });
}

function copyDashboardNotesFixture(tempRoot) {
  const tempVaultRoot = path.join(tempRoot, "vault");
  const tempDashboardRoot = path.join(tempVaultRoot, "dashboard");
  const tempResourcesRoot = path.join(tempVaultRoot, "resources", "dashboard-real-estate");

  fs.mkdirSync(tempDashboardRoot, { recursive: true });
  fs.mkdirSync(path.dirname(tempResourcesRoot), { recursive: true });
  fs.cpSync(resourcesRoot, tempResourcesRoot, { recursive: true });

  return { tempVaultRoot, tempDashboardRoot, tempResourcesRoot };
}

async function stopWatcherProcess(watcher) {
  if (!watcher) return;
  if (watcher.exitCode === null && watcher.signalCode === null) {
    watcher.kill("SIGINT");
  }
  await Promise.race([
    new Promise((resolve) => watcher.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  if (watcher.exitCode === null && watcher.signalCode === null) {
    watcher.kill("SIGKILL");
    await new Promise((resolve) => watcher.once("exit", resolve));
  }
}

test("watch-notes-and-sync reruns the pipeline when a canonical note changes", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dashboard-watch-"));
  const { tempVaultRoot, tempDashboardRoot, tempResourcesRoot } = copyDashboardNotesFixture(tempRoot);
  const watchedNote = path.join(tempResourcesRoot, "apps", "dashboard-real-estate-anx-anclora-nexus.md");
  const tempWorkbookFile = path.join(tempVaultRoot, "output", "spreadsheet", "anclora-group-real-estate-dataset.xlsx");
  const tempGeneratedFile = path.join(tempDashboardRoot, "src", "generated", "dataset.json");
  let watcher;

  try {
    fs.rmSync(path.dirname(tempWorkbookFile), { recursive: true, force: true });
    fs.rmSync(path.dirname(tempGeneratedFile), { recursive: true, force: true });

    await generateWorkbookFromNotes({ dashboardRoot: tempDashboardRoot });
    await syncDataset({ dashboardRoot: tempDashboardRoot });

    watcher = spawn(
      "node",
      ["./scripts/watch-notes-and-sync.mjs", "--dashboard-root", tempDashboardRoot],
      {
        cwd: dashboardRoot,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stderr = "";
    watcher.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    await waitForText(watcher.stdout, "Watching canonical dashboard notes", 5000);
    await waitForText(watcher.stdout, "Dashboard notes refreshed", 5000);

    const workbookBefore = fs.statSync(tempWorkbookFile);
    const datasetBefore = fs.statSync(tempGeneratedFile);

    const noteText = fs.readFileSync(watchedNote, "utf8");
    fs.writeFileSync(watchedNote, noteText.replace("Anclora Nexus", "Anclora Nexus Updated"));

    await waitForText(watcher.stdout, "Dashboard notes refreshed", 5000);

    const workbookAfter = fs.statSync(tempWorkbookFile);
    const datasetAfter = fs.statSync(tempGeneratedFile);

    assert.ok(workbookAfter.mtimeMs > workbookBefore.mtimeMs);
    assert.ok(datasetAfter.mtimeMs > datasetBefore.mtimeMs);
    assert.equal(stderr, "");
  } finally {
    await stopWatcherProcess(watcher);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
