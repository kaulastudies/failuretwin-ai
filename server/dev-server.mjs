import { createServer as createViteServer } from "vite";
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeWithOpenAI } from "./openai-analysis.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const contents = readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex < 0) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(root, ".env"));
loadEnvFile(path.join(root, ".env.local"));

const vite = await createViteServer({
  root,
  configFile: path.join(root, "vite.config.ts"),
  appType: "custom",
  server: {
    middlewareMode: true,
    hmr: false,
  },
});

const port = Number(process.env.PORT || 5173);

const server = http.createServer(async (req, res) => {
  const requestUrl = req.url || "/";

  if (req.method === "POST" && requestUrl === "/api/analyze") {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const bodyText = Buffer.concat(chunks).toString("utf8");
      const parsed = bodyText ? JSON.parse(bodyText) : {};
      const simulation = parsed?.simulation;

      if (!simulation || typeof simulation !== "object") {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing simulation payload" }));
        return;
      }

      const analysis = await analyzeWithOpenAI(simulation);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(analysis));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown analysis error",
      }));
      return;
    }
  }

  vite.middlewares(req, res, async () => {
    try {
      if (req.method !== "GET" || requestUrl.startsWith("/api/")) {
        res.statusCode = 404;
        res.end();
        return;
      }

      const url = requestUrl;
      const template = readFileSync(path.join(root, "index.html"), "utf8");
      const html = await vite.transformIndexHtml(url, template);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      res.statusCode = 500;
      res.end(error instanceof Error ? error.stack : String(error));
    }
  });
});

server.listen(port, () => {
  console.log(`FailureTwin dev server running at http://localhost:${port}`);
});
