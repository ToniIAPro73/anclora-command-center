import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

import {
  APP_FIELDS,
  DASHBOARD_REAL_ESTATE_DIR,
  ENTITY_DIRECTORIES,
  FIELD_FIELDS,
  INTERACTION_FIELDS,
  LIST_FIELDS,
  SOURCE_FIELDS,
} from "./dashboard-note-schema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDashboardRoot = path.resolve(__dirname, "..", "..");

function toRelativePosixPath(filePath, rootDir) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

function parseInlineList(value) {
  return value
    .slice(1, -1)
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function parsePermissiveFrontmatter(src) {
  const result = {};
  const lines = src.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue = ""] = match;
    const value = rawValue.trim();

    if (!value) {
      const items = [];
      while (index + 1 < lines.length) {
        const nextLine = lines[index + 1];
        const itemMatch = nextLine.match(/^\s*-\s+(.*)$/);
        if (!itemMatch) {
          break;
        }
        items.push(itemMatch[1].trim().replace(/^["']|["']$/g, ""));
        index += 1;
      }
      result[key] = items;
      continue;
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = parseInlineList(value);
      continue;
    }

    result[key] = value.replace(/^["']|["']$/g, "");
  }

  return result;
}

function normalizeListValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value == null) {
    return [];
  }

  return String(value)
    .split(/\s*\|\s*|\s*,\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readMarkdownNote(filePath, rootDir, expectedFields) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw, {
    engines: {
      yaml: {
        parse: parsePermissiveFrontmatter,
      },
    },
  });
  const frontmatter = parsed.data;
  const relativePath = toRelativePosixPath(filePath, rootDir);
  const row = {};

  for (const field of expectedFields) {
    if (!(field in frontmatter)) {
      throw new Error(`Missing required field "${field}" in ${relativePath}`);
    }
    if (LIST_FIELDS.has(field)) {
      row[field] = normalizeListValue(frontmatter[field]);
    } else if (frontmatter[field] == null) {
      row[field] = "";
    } else {
      row[field] = String(frontmatter[field]).trim();
    }
  }

  return row;
}

function readMarkdownDirectory(directoryPath, rootDir, expectedFields) {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Missing canonical dashboard directory: ${directoryPath}`);
  }

  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort((left, right) => left.localeCompare(right))
    .map((filePath) => readMarkdownNote(filePath, rootDir, expectedFields));
}

export function readDashboardNotes({ dashboardRoot = defaultDashboardRoot } = {}) {
  const vaultRoot = path.resolve(dashboardRoot, "..");
  const baseDir = path.join(vaultRoot, "resources", DASHBOARD_REAL_ESTATE_DIR);

  return {
    apps: readMarkdownDirectory(path.join(baseDir, ENTITY_DIRECTORIES.apps), vaultRoot, APP_FIELDS),
    interactions: readMarkdownDirectory(
      path.join(baseDir, ENTITY_DIRECTORIES.interactions),
      vaultRoot,
      INTERACTION_FIELDS,
    ),
    fields: readMarkdownDirectory(path.join(baseDir, ENTITY_DIRECTORIES.fields), vaultRoot, FIELD_FIELDS),
    sources: readMarkdownDirectory(path.join(baseDir, ENTITY_DIRECTORIES.sources), vaultRoot, SOURCE_FIELDS),
  };
}
