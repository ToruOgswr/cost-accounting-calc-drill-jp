import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("WEEK1〜8の入口を日本語で表示する", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /<title>原価計算｜計算論点ドリル<\/title>/);
  for (let week = 1; week <= 8; week += 1) assert.match(html, new RegExp(`WEEK(?:<!-- -->)?${week}`));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("WEEK専用ページに3分ドリルを表示し、共有集計を表示しない", async () => {
  const response = await render("/week01");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /WEEK(?:<!-- -->)?1/);
  assert.doesNotMatch(html, /直近1時間の正答率|集計データ/);
  assert.match(html, /制限時間は3分/);
  assert.match(html, /3分ドリルを始める/);
});
