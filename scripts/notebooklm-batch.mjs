/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const url = getArg("--url");
const questionsPath = getArg("--questions");
const outPath = getArg("--out");

if (!url || !questionsPath || !outPath) {
  console.error("Usage: node scripts/notebooklm-batch.mjs --url <notebook_url> --questions <json> --out <json>");
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
if (!Array.isArray(questions) || questions.length === 0) {
  console.error("Questions file must be a non-empty array of strings.");
  process.exit(1);
}

// Resolve MCP SDK from the notebooklm-mcp global install
const sdkRoot = "C:\\Users\\antonio.ballesterosa\\tools\\node22\\node_modules\\notebooklm-mcp\\node_modules\\@modelcontextprotocol\\sdk";
const requireFromSdk = createRequire(path.join(sdkRoot, "package.json"));
const { Client } = requireFromSdk("./dist/cjs/client/index.js");
const { StdioClientTransport } = requireFromSdk("./dist/cjs/client/stdio.js");

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const transport = new StdioClientTransport({
  command,
  args: ["-y", "notebooklm-mcp@latest"],
  stderr: "pipe",
  env: {
    HEADLESS: "false",
  },
});

const client = new Client({ name: "codex-batch", version: "1.0.0" });

const run = async () => {
  await client.connect(transport);
  const results = [];
  let sessionId = null;
  for (const question of questions) {
    const response = await client.callTool(
      {
        name: "ask_question",
        arguments: {
          question,
          notebook_url: url,
          ...(sessionId ? { session_id: sessionId } : {}),
        },
      },
      undefined,
      {
        timeout: 180000,
        maxTotalTimeout: 240000,
        resetTimeoutOnProgress: true,
      }
    );
    // response.content is an array of {type, text}
    const text = response?.content?.[0]?.text ?? "";
    try {
      const parsed = JSON.parse(text);
      const nextSessionId = parsed?.data?.session_id;
      if (nextSessionId) {
        sessionId = nextSessionId;
      }
    } catch {
      // Keep going even if the server returned non-JSON text.
    }
    results.push({
      question,
      raw: text,
    });
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  await Promise.race([
    transport.close(),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
};

run().catch((err) => {
  console.error(err?.stack || err);
  try {
    transport.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
