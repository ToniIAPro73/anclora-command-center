import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { readDashboardNotes } from "../scripts/lib/read-dashboard-notes.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");

test("readDashboardNotes reads the canonical dashboard note sets", () => {
  const data = readDashboardNotes({ dashboardRoot });

  assert.equal(data.apps.length, 5);
  assert.equal(data.interactions.length, 10);
  assert.equal(data.fields.length, 26);
  assert.equal(data.sources.length, 26);

  const appWithLists = data.apps.find(
    (item) => Array.isArray(item.supporting_notes) && item.supporting_notes.length > 0,
  );
  assert.ok(appWithLists, "expected at least one normalized list field");
  assert.ok(
    Array.isArray(appWithLists.upstream_dependencies) || Array.isArray(appWithLists.downstream_dependencies),
    "expected canonical list fields to normalize to arrays",
  );
});
