// G1 명세 게이트: routes.json과 harness/specs/<화면>.md를 센다.
// 사용법: node scripts/gate-spec.mjs <list|detail|apply|complete>
import { existsSync } from "node:fs";
import {
  DESIGN_FILE,
  PRD_FILE,
  PRD_MAP_FILE,
  ROUTES_FILE,
  SCREEN_NAMES,
  abs,
  countScreenSections,
  read,
} from "./lib/harness.mjs";

const screen = process.argv[2];
if (!SCREEN_NAMES.includes(screen)) {
  console.error(`사용법: node scripts/gate-spec.mjs <${SCREEN_NAMES.join("|")}>`);
  process.exit(2);
}

const EXPECTED_ROUTES = {
  list: "/plans",
  detail: "/plans/[id]",
  apply: "/plans/[id]/apply",
  complete: "/plans/[id]/complete",
};
const REQUIRED_HEADINGS = ["목적", "라우트", "구성 요소", "상태", "이동", "문구", "예시 데이터", "토큰", "근거"];
const BR10_SCREENS = ["detail", "apply"];

function designComponents() {
  const text = read(DESIGN_FILE);
  const sec = text.slice(text.indexOf("## 4."));
  const names = [];
  for (const m of sec.matchAll(/^### (.+)$/gm)) if (!m[1].includes("아이콘")) names.push(m[1].trim());
  for (const m of sec.matchAll(/^- (Logo|icon\/[A-Za-z]+):/gm)) names.push(m[1]);
  return names;
}

const checks = [];
const add = (id, name, problems) => checks.push({ id, name, passed: problems.length === 0, count: problems.length, problems });

// G1-1 라우트 지도
{
  const p = [];
  const expectedCount = countScreenSections();
  if (!existsSync(abs(ROUTES_FILE))) p.push(`${ROUTES_FILE} 없음`);
  else {
    let routes;
    try {
      routes = JSON.parse(read(ROUTES_FILE));
    } catch (e) {
      p.push(`${ROUTES_FILE} JSON 오류: ${e.message}`);
    }
    if (routes) {
      const screens = routes.screens || [];
      if (screens.length !== expectedCount) p.push(`화면 수 ${screens.length} ≠ screens.md 섹션 수 ${expectedCount}`);
      for (const [name, route] of Object.entries(EXPECTED_ROUTES)) {
        const s = screens.find((x) => x.name === name);
        if (!s) p.push(`${name} 항목 없음`);
        else {
          if (s.route !== route) p.push(`${name} 경로 ${s.route} ≠ ${route}`);
          if (!/^\d+:\d+$/.test(s.figmaNode || "")) p.push(`${name} figmaNode 없음`);
        }
      }
    }
  }
  add("G1-1", "라우트 지도 = 화면 4개", p);
}

// G1-2 ~ G1-5 화면 명세
const specFile = `harness/specs/${screen}.md`;
const spec = existsSync(abs(specFile)) ? read(specFile).replace(/\r\n/g, "\n") : null;
const section = (title) => {
  if (!spec) return "";
  const m = spec.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return m ? m[1] : "";
};

add("G1-2", "명세 파일과 필수 제목", spec ? REQUIRED_HEADINGS.filter((h) => !new RegExp(`^## ${h}\\s*$`, "m").test(spec)).map((h) => `## ${h} 없음`) : [`${specFile} 없음`]);

{
  const allowed = designComponents();
  const p = [];
  if (allowed.length !== 16) p.push(`design.md 컴포넌트 수가 ${allowed.length} (16이어야 함) — 스크립트 확인 필요`);
  const items = [...section("구성 요소").matchAll(/^- ([^:\n]+):/gm)].map((m) => m[1].trim());
  if (spec && items.length === 0) p.push("## 구성 요소에 '- <컴포넌트>:' 항목이 없음");
  for (const it of items) if (!it.startsWith("신규") && !allowed.includes(it)) p.push(`design.md 16개에 없는 컴포넌트: ${it}`);
  add("G1-3", "컴포넌트 = design.md 16개 또는 '신규:'", p);
}

{
  const p = [];
  if (spec && BR10_SCREENS.includes(screen)) {
    const st = section("상태");
    if (!st.includes("지금 쓰는 요금제")) p.push("## 상태에 '지금 쓰는 요금제' 없음");
    if (!/비활성|disabled/.test(st)) p.push("## 상태에 신청 버튼 비활성(disabled) 없음");
  }
  add("G1-4", "BR10: 지금 쓰는 요금제 차단이 명세에 있음", p);
}

{
  const missing = [...section("토큰").matchAll(/^- 토큰 없음:.*$/gm)].map((m) => m[0]);
  add("G1-5", "토큰에 없는 값 = 0 (있으면 사용자에게 질문)", missing);
}

// G1-6 PRD 반영: prd-map.json이 PRD의 F번호를 모두 덮고, 이 화면이 맡은 F번호가 명세 ## 근거에 모두 있음
{
  const p = [];
  const prdIds = [...new Set([...read(PRD_FILE).matchAll(/^\|\s*(F\d+-\d+)\s*\|/gm)].map((m) => m[1]))];
  if (prdIds.length === 0) p.push(`${PRD_FILE}에서 F번호를 찾지 못함`);
  let map = null;
  if (!existsSync(abs(PRD_MAP_FILE))) p.push(`${PRD_MAP_FILE} 없음`);
  else map = JSON.parse(read(PRD_MAP_FILE)).screens || {};
  if (map) {
    const covered = new Set(Object.values(map).flat());
    for (const id of prdIds) if (!covered.has(id)) p.push(`PRD ${id}를 맡은 화면이 없음 (${PRD_MAP_FILE})`);
    for (const id of covered) if (!prdIds.includes(id)) p.push(`${PRD_MAP_FILE}의 ${id}는 PRD에 없음`);
    const basis = section("근거");
    if (spec) for (const id of map[screen] || []) if (!new RegExp(`\\b${id}\\b`).test(basis)) p.push(`## 근거에 ${id} 없음`);
  }
  add("G1-6", "PRD F번호 전부 배정 · 이 화면 몫이 명세 근거에 있음", p);
}

// G1-7 문구: 기본 상태 문구가 `- "문구"` 형식으로 1줄 이상 (G3가 화면 HTML에서 찾는다)
{
  const lines = [...section("문구").matchAll(/^- "(.+)"\s*$/gm)];
  add("G1-7", "기본 상태 문구 `- \"...\"` 1줄 이상", spec && lines.length === 0 ? ['## 문구에 `- "문구"` 줄이 없음'] : []);
}

const passed = checks.every((c) => c.passed);
console.log(JSON.stringify({ gate: "G1", screen, passed, checks }, null, 2));
if (!passed) process.exit(1);
