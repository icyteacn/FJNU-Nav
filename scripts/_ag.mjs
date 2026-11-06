import { chromium } from "playwright-core";
import http from "http";
import fs from "fs";
import path from "path";
const ROOT = "dist";
const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
const srv = http.createServer((q, r) => {
  let p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (q.url === "/" || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(ROOT, "index.html");
  r.setHeader("Content-Type", MIME[path.extname(p)] || "application/octet-stream");
  r.end(fs.readFileSync(p));
}).listen(59994);
const b = await chromium.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
const pg = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await pg.addInitScript(() => { sessionStorage.setItem("fjnu_welcome_seen", "1"); localStorage.setItem("fjnu_tour_done_v2", "1"); });
await pg.goto("http://127.0.0.1:59994/#/app/orientationSchedule", { waitUntil: "networkidle" });
await pg.waitForTimeout(2200);
// 找 11/7 事件卡片并滚到它
const found = await pg.evaluate(() => {
  const els = [...document.querySelectorAll("*")].filter(e => e.children.length === 0 && /海丝|分会场|校运会/.test(e.textContent));
  if (els[0]) { els[0].scrollIntoView({ block: "center" }); return els.length + "|" + els[0].textContent.slice(0, 40); }
  return "none";
});
console.log("found:", found);
await pg.waitForTimeout(400);
await pg.screenshot({ path: "C:/Users/Administrator/_work/audit-fjnu/agenda-nov7.png" });
await b.close(); srv.close();
