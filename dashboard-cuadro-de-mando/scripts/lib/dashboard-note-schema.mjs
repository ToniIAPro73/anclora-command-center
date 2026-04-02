export const DASHBOARD_REAL_ESTATE_DIR = "dashboard-real-estate";

export const ENTITY_DIRECTORIES = {
  apps: "apps",
  interactions: "interacciones",
  fields: "campos",
  sources: "fuentes",
};

export const APP_FIELDS = [
  "app_id",
  "app_name",
  "scope_status",
  "ecosystem_role",
  "app_type",
  "maturity_status",
  "validation_status",
  "ecosystem_layer",
  "real_estate_focus",
  "primary_users",
  "primary_goal",
  "business_value",
  "main_inputs",
  "main_outputs",
  "upstream_dependencies",
  "downstream_dependencies",
  "key_workflows",
  "documented_state",
  "state_summary",
  "main_risks",
  "next_focus",
  "territory_focus",
  "repo_url",
  "primary_note",
  "supporting_notes",
  "source_confidence",
];

export const INTERACTION_FIELDS = [
  "source_app",
  "target_app",
  "interaction_type",
  "what_flows",
  "business_reason",
];

export const FIELD_FIELDS = ["field_name", "data_type", "definition", "reading_rule"];

export const SOURCE_FIELDS = ["app_name", "source_note", "source_type", "evidence_summary"];

export const LIST_FIELDS = new Set([
  "main_inputs",
  "main_outputs",
  "upstream_dependencies",
  "downstream_dependencies",
  "key_workflows",
  "supporting_notes",
]);
