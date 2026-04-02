import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { APP_FIELDS, FIELD_FIELDS, INTERACTION_FIELDS, SOURCE_FIELDS } from "../scripts/lib/dashboard-note-schema.mjs";
import { readDashboardNotes } from "../scripts/lib/read-dashboard-notes.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");

test("readDashboardNotes reads the canonical dashboard note sets", () => {
  const data = readDashboardNotes({ dashboardRoot });

  assert.equal(data.apps.length, 5);
  assert.equal(data.interactions.length, 10);
  assert.equal(data.fields.length, 26);
  assert.equal(data.sources.length, 26);

  assert.deepEqual(Object.keys(data.apps[0]).sort(), [...APP_FIELDS].sort());
  assert.deepEqual(Object.keys(data.interactions[0]).sort(), [...INTERACTION_FIELDS].sort());
  assert.deepEqual(Object.keys(data.fields[0]).sort(), [...FIELD_FIELDS].sort());
  assert.deepEqual(Object.keys(data.sources[0]).sort(), [...SOURCE_FIELDS].sort());

  const app = data.apps.find((item) => item.app_id === "ANX");
  assert.ok(app, "expected ANX app row");
  assert.equal(app.primary_note, "playbooks/anclora-nexus.md");
  assert.equal(typeof app.primary_note, "string");
  assert.match(app.primary_note, /^[^\\/?<>:"|*]+(?:\/[^\\/?<>:"|*]+)+\.md$/);

  const appWithLists = data.apps.find(
    (item) => Array.isArray(item.supporting_notes) && item.supporting_notes.length > 0,
  );
  assert.ok(appWithLists, "expected at least one normalized list field");
  assert.ok(Array.isArray(appWithLists.upstream_dependencies) || Array.isArray(appWithLists.downstream_dependencies));
  assert.deepEqual(
    Object.keys(appWithLists).sort(),
    [...APP_FIELDS].sort(),
    "no extra fields should leak into app rows",
  );
});
