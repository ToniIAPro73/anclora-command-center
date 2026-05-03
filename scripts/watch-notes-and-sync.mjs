import path from "node:path";
import { fileURLToPath } from "node:url";

import chokidar from "chokidar";

import { generateWorkbookFromNotes } from "./generate-workbook-from-notes.mjs";
import { syncDataset } from "./sync-real-estate-dataset.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDashboardRoot = path.resolve(__dirname, "..");
const watchDelayMs = 250;

function parseArgs(argv) {
  const result = {
    dashboardRoot: defaultDashboardRoot,
    once: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dashboard-root") {
      result.dashboardRoot = argv[index + 1]
        ? path.resolve(argv[index + 1])
        : defaultDashboardRoot;
      index += 1;
      continue;
    }

    if (arg.startsWith("--dashboard-root=")) {
      result.dashboardRoot = path.resolve(arg.slice("--dashboard-root=".length));
      continue;
    }

    if (arg === "--once") {
      result.once = true;
    }
  }

  return result;
}

function resolveWatchTargets(dashboardRoot) {
  const vaultRoot = path.resolve(dashboardRoot, "..");
  const dashboardNotesRoot = path.join(vaultRoot, "resources", "dashboard-real-estate");

  return [
    path.join(dashboardNotesRoot, "apps"),
    path.join(dashboardNotesRoot, "interacciones"),
    path.join(dashboardNotesRoot, "campos"),
    path.join(dashboardNotesRoot, "fuentes"),
    path.join(dashboardNotesRoot, "indice-dashboard-real-estate.md"),
  ];
}

function writeLine(message) {
  process.stdout.write(`${message}\n`);
}

function writeError(message) {
  process.stderr.write(`${message}\n`);
}

async function runDashboardSync(dashboardRoot, reason) {
  const prefix = reason ? ` (${reason})` : "";
  writeLine(`Refreshing canonical dashboard notes${prefix}...`);
  await generateWorkbookFromNotes({ dashboardRoot });
  await syncDataset({ dashboardRoot });
  writeLine("Dashboard notes refreshed");
}

async function main() {
  const { dashboardRoot, once } = parseArgs(process.argv.slice(2));
  if (once) {
    await runDashboardSync(dashboardRoot, "once");
    return;
  }

  const watchTargets = resolveWatchTargets(dashboardRoot);
  let refreshInFlight = false;
  let refreshAgain = false;
  let active = true;
  let watcher;

  const runRefresh = async (reason) => {
    if (!active) return;

    if (refreshInFlight) {
      refreshAgain = true;
      return;
    }

    refreshInFlight = true;
    try {
      do {
        refreshAgain = false;
        await runDashboardSync(dashboardRoot, reason);
        reason = "queued change";
      } while (refreshAgain && active);
    } finally {
      refreshInFlight = false;
    }
  };

  const stop = async () => {
    active = false;
    if (watcher) {
      await watcher.close();
    }
  };

  const handleSignal = async () => {
    await stop();
    process.exit(0);
  };

  process.once("SIGINT", handleSignal);
  process.once("SIGTERM", handleSignal);

  writeLine(
    `Watching canonical dashboard notes under ${path
      .relative(defaultDashboardRoot, path.resolve(dashboardRoot, ".."))
      .replaceAll("\\", "/")}`,
  );

  try {
    watcher = chokidar.watch(watchTargets, {
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: watchDelayMs,
        pollInterval: 50,
      },
    });

    const scheduleRefresh = () => {
      void runRefresh("file change").catch((error) => {
        writeError(
          `Dashboard note sync failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`,
        );
      });
    };

    watcher
      .on("add", scheduleRefresh)
      .on("change", scheduleRefresh)
      .on("unlink", scheduleRefresh)
      .on("addDir", scheduleRefresh)
      .on("unlinkDir", scheduleRefresh)
      .on("error", (error) => {
        writeError(`Watcher error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
      });

    await new Promise((resolve) => watcher.once("ready", resolve));
    await runDashboardSync(dashboardRoot, "startup");
  } catch (error) {
    writeError(
      `Initial dashboard note sync failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`,
    );
    process.exitCode = 1;
    await stop();
  }
}

await main();
