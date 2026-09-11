import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "cost-accounting-calc-drill-jp";
const prefix = `/${repository}`;
const output = "out";
const workerUrl = new URL(`../dist/server/index.js?export=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl.href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };
const routes = ["/", ...Array.from({ length: 8 }, (_, index) => `/week${String(index + 1).padStart(2, "0")}`)];

rmSync(output, { recursive: true, force: true });
cpSync("dist/client", output, { recursive: true });
writeFileSync(join(output, ".nojekyll"), "");

for (const route of routes) {
  const response = await worker.fetch(new Request(`https://example.invalid${route}`, { headers: { accept: "text/html" } }), env, context);
  if (!response.ok) throw new Error(`Failed to render ${route}: ${response.status}`);
  let html = await response.text();
  html = html
    .replaceAll('"/_next/', `"${prefix}/_next/`)
    .replaceAll('"/favicon.svg', `"${prefix}/favicon.svg`)
    .replaceAll('"/og.jpg', `"${prefix}/og.jpg`)
    .replaceAll('href="/week', `href="${prefix}/week`);
  const directory = route === "/" ? output : join(output, route.slice(1));
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), html);
}
