// G3 판정: 토큰 밖 값 · 금액 숫자 · 토큰 동기화 · 라우트 · lint · build · BR10을 센다.
// 결과는 harness/reports/<화면>.json 에 쓴다. 모두 통과하면 종료 코드 0.
// 사용법: node scripts/judge.mjs <list|detail|apply|complete>   (마지막 확인: --all)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  ROOT,
  ROUTES_FILE,
  SCREEN_NAMES,
  abs,
  checkTokens,
  countScreenSections,
  isAmountScanned,
  isScannedSrc,
  loadAllowed,
  pageRoutes,
  read,
  scanAmounts,
  scanText,
  walk,
} from "./lib/harness.mjs";

const arg = process.argv[2];
const ALL = arg === "--all";
if (!ALL && !SCREEN_NAMES.includes(arg)) {
  console.error(`사용법: node scripts/judge.mjs <${SCREEN_NAMES.join("|")}|--all>`);
  process.exit(2);
}
const reportName = ALL ? "all" : arg;
const checks = [];
const add = (id, name, problems, extra = {}) =>
  checks.push({ id, name, passed: problems.length === 0 && !extra.failed, count: problems.length, problems, ...extra });
const tail = (s, n = 40) => (s || "").split(/\r?\n/).filter(Boolean).slice(-n).join("\n");

// G3-1 토큰 밖 값
const allowed = loadAllowed();
const srcFiles = walk("src");
{
  const p = allowed ? [] : [{ rule: "G2", text: "harness/allowed.json 없음 — node scripts/gen-tokens.mjs 먼저" }];
  for (const f of srcFiles.filter(isScannedSrc)) p.push(...scanText(read(f), f, allowed));
  add("G3-1", "토큰 밖 값 = 0", p);
}

// G3-2 화면 코드의 금액 숫자
{
  const p = [];
  for (const f of srcFiles.filter(isAmountScanned)) p.push(...scanAmounts(read(f), f));
  add("G3-2", "화면 코드의 금액 숫자 = 0 (예시 데이터는 src/data/example.ts)", p);
}

// G3-3 토큰 생성 파일 동기화 (G2 재확인)
{
  const t = checkTokens();
  add("G3-3", "토큰 생성 파일 손수정 없음", t.passed ? [] : t.files.filter((f) => f.missing || f.diffLines));
}

// G3-4 라우트
const routes = existsSync(abs(ROUTES_FILE)) ? JSON.parse(read(ROUTES_FILE)).screens : [];
const pages = pageRoutes();
{
  const p = [];
  if (!routes.length) p.push(`${ROUTES_FILE} 없음`);
  const known = new Set(routes.map((r) => r.route));
  for (const pg of pages) {
    if (known.has(pg.route)) continue;
    if (pg.route === "/" && /redirect\(\s*["']\/plans["']\s*\)/.test(read(pg.file)) && !/<[A-Za-z]/.test(read(pg.file))) continue;
    p.push(`routes.json에 없는 라우트 ${pg.route} (${pg.file})`);
  }
  const have = new Set(pages.map((x) => x.route));
  const targets = ALL ? routes : routes.filter((r) => r.name === arg);
  for (const r of targets) if (!have.has(r.route)) p.push(`${r.name} 라우트 ${r.route} 없음`);
  if (ALL) {
    const n = pages.filter((x) => known.has(x.route)).length;
    const expected = countScreenSections();
    if (n !== expected) p.push(`라우트 수 ${n} ≠ screens.md 화면 수 ${expected}`);
  }
  add("G3-4", ALL ? "라우트 수 = 화면 수 = 4" : "대상 라우트 있음 · routes.json 밖 라우트 0", p);
}

// G3-5 lint, G3-6 build
function npm(script) {
  const r = spawnSync(`npm run ${script}`, { cwd: ROOT, shell: true, encoding: "utf8" });
  return { ok: r.status === 0, out: tail((r.stdout || "") + "\n" + (r.stderr || "")) };
}
const lint = npm("lint");
add("G3-5", "lint 통과", lint.ok ? [] : [lint.out]);
const build = npm("build");
add("G3-6", "build 통과", build.ok ? [] : [build.out]);

// G3-7 BR10, G3-8 명세 문구 — build 결과로 서버를 띄워 서버 렌더링 HTML을 센다.
const strip = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
const squash = (s) => s.replace(/\s+/g, "");
/** data-cta="apply"가 붙은 신청 버튼(또는 링크) */
function findCta(html) {
  const m = html.match(/<(button|a)\b([^>]*\bdata-cta="apply"[^>]*)>/);
  if (!m) return null;
  const attrs = " " + m[2];
  return { tag: m[1], disabled: m[1] === "button" && /\sdisabled(?=[\s=>/]|$)/.test(attrs) };
}
const specCopy = (name) => {
  const f = `harness/specs/${name}.md`;
  if (!existsSync(abs(f))) return null;
  const text = read(f).replace(/\r\n/g, "\n");
  const m = text.match(/^## 문구\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  return m ? [...m[1].matchAll(/^- "(.+)"\s*$/gm)].map((x) => x[1]) : [];
};

async function withServer(fn) {
  const port = 3100 + Math.floor(Math.random() * 500);
  const server = spawn(process.execPath, [abs("node_modules/next/dist/bin/next"), "start", "-p", String(port)], { cwd: ROOT, stdio: "ignore" });
  const stop = () => {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    else server.kill();
  };
  try {
    const base = `http://localhost:${port}`;
    for (let i = 0; i < 60; i++) {
      try {
        await fetch(base, { redirect: "manual" });
        return await fn(async (url) => {
          const res = await fetch(base + url);
          return { status: res.status, html: await res.text() };
        });
      } catch (e) {
        if (e?.cause?.code !== "ECONNREFUSED" && !/fetch failed/.test(String(e))) throw e;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw new Error("next start가 30초 안에 뜨지 않음");
  } finally {
    stop();
  }
}

const have = new Set(pages.map((x) => x.route));
const routeOf = (name) => routes.find((r) => r.name === name);
const br10Targets = [
  { name: "detail", notice: true },
  { name: "apply", notice: false },
].filter((t) => routeOf(t.name) && have.has(routeOf(t.name).route));
const copyTargets = (ALL ? routes : routes.filter((r) => r.name === arg)).filter((r) => have.has(r.route));

const br10P = [];
const copyP = [];
let br10Skipped = false;
if (!br10Targets.length) {
  if (ALL) br10P.push("상세·신청 라우트가 없어 BR10을 확인할 수 없음");
  else br10Skipped = true;
}
if (!copyTargets.length) copyP.push("확인할 라우트가 없음");

if (build.ok && (br10Targets.length || copyTargets.length)) {
  let data = null;
  try {
    data = await import(pathToFileURL(abs("src/data/example.ts")).href);
  } catch (e) {
    br10P.push(`src/data/example.ts를 읽지 못함: ${e.message}`);
    copyP.push("src/data/example.ts를 읽지 못함");
  }
  const current = data?.currentPlanId;
  const other = (data?.plans || []).find((x) => x.id !== current)?.id;
  if (data && (!current || !other)) br10P.push("example.ts에 currentPlanId와, 그와 다른 요금제가 있는 plans가 필요");
  if (current && other) {
    try {
      await withServer(async (get) => {
        for (const t of br10Targets) {
          for (const [id, expectDisabled] of [
            [current, true],
            [other, false],
          ]) {
            const url = routeOf(t.name).route.replace("[id]", encodeURIComponent(id));
            const { status, html } = await get(url);
            if (status !== 200) {
              br10P.push(`${url} 응답 ${status}`);
              continue;
            }
            const cta = findCta(html);
            if (!cta) br10P.push(`${url}에 data-cta="apply" 신청 버튼 없음`);
            else if (cta.disabled !== expectDisabled)
              br10P.push(`${url} 신청 버튼 disabled=${cta.disabled} (기대 ${expectDisabled}${expectDisabled && cta.tag === "a" ? ", <a>는 막을 수 없음 — <button disabled>로" : ""})`);
            if (t.notice && expectDisabled && !strip(html).includes("지금 쓰는 요금제")) br10P.push(`${url}에 '지금 쓰는 요금제' 안내 없음`);
          }
        }
        for (const r of copyTargets) {
          const lines = specCopy(r.name);
          if (!lines) {
            copyP.push(`harness/specs/${r.name}.md 없음`);
            continue;
          }
          const url = r.route.replace("[id]", encodeURIComponent(other));
          const { status, html } = await get(url);
          if (status !== 200) {
            copyP.push(`${url} 응답 ${status}`);
            continue;
          }
          const text = squash(strip(html));
          for (const line of lines) if (!text.includes(squash(line))) copyP.push(`${url}에 명세 문구 없음: "${line}"`);
        }
      });
    } catch (e) {
      br10P.push(String(e.message || e));
      copyP.push(String(e.message || e));
    }
  }
} else if (!build.ok) {
  if (br10Targets.length) br10P.push("build 실패로 확인 불가");
  if (copyTargets.length) copyP.push("build 실패로 확인 불가");
}
add("G3-7", "BR10: 지금 쓰는 요금제면 신청 버튼 disabled", br10P, { skipped: br10Skipped });
add("G3-8", "명세 ## 문구가 화면 HTML에 모두 있음", copyP);

const passed = checks.every((c) => c.passed);
const report = { gate: "G3", screen: reportName, passed, at: new Date().toISOString(), checks };
mkdirSync(abs("harness/reports"), { recursive: true });
writeFileSync(abs(`harness/reports/${reportName}.json`), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ passed, report: `harness/reports/${reportName}.json`, failed: checks.filter((c) => !c.passed).map((c) => `${c.id} ${c.name} (${c.count})`) }, null, 2));
process.exit(passed ? 0 : 1);
