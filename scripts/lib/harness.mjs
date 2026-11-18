// 화면 구현 하네스 공용 모듈: 토큰 읽기, 테마 생성, 토큰 밖 값 검사.
// 규칙 SSOT는 docs/tokens.json.txt 하나다. 줄높이·굵기는 docs/design.md.txt의 텍스트 스타일 표에서 읽는다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const TOKENS_FILE = "docs/tokens.json.txt";
export const DESIGN_FILE = "docs/design.md.txt";
export const SCREENS_FILE = "docs/screens.md.txt";
export const THEME_FILE = "src/app/tokens.css";
export const ALLOWED_FILE = "harness/allowed.json";
export const ROUTES_FILE = "harness/specs/routes.json";
export const EXCEPTIONS_FILE = "harness/exceptions.json"; // 사용자 승인 예외 (사람만 고침)
export const PRD_MAP_FILE = "harness/prd-map.json"; // 화면별 PRD F번호 (사람만 고침)
export const PRD_FILE = "docs/PRD.md";
export const HUMAN_ONLY_FILES = [EXCEPTIONS_FILE, PRD_MAP_FILE];
export const SCREEN_NAMES = ["list", "detail", "apply", "complete"];

export const abs = (rel) => path.join(ROOT, rel);
export const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
export const read = (relPath) => readFileSync(abs(relPath), "utf8");

// ---------- 토큰 → 테마 ----------

function parseTypography(designText) {
  // | heading/h1 | 32 / 44 | Bold 700 | ...
  const rows = [];
  const re = /^\|\s*([a-z0-9-]+\/[a-z0-9-]+)\s*\|\s*(\d+)\s*\/\s*(\d+)\s*\|\s*[A-Za-z]+\s+(\d{3})\s*\|/gm;
  let m;
  while ((m = re.exec(designText))) {
    rows.push({ style: m[1], size: Number(m[2]), lineHeight: Number(m[3]), weight: Number(m[4]) });
  }
  if (rows.length === 0) throw new Error(`${DESIGN_FILE}에서 텍스트 스타일 표를 찾지 못했다`);
  return rows;
}

const WEIGHT_NAMES = { 400: "regular", 500: "medium", 600: "semibold", 700: "bold" };

export function buildTheme() {
  const tokensText = read(TOKENS_FILE);
  const designText = read(DESIGN_FILE);
  const exceptionsText = existsSync(abs(EXCEPTIONS_FILE)) ? read(EXCEPTIONS_FILE) : '{"items":[]}';
  const tokens = JSON.parse(tokensText);
  const exceptions = JSON.parse(exceptionsText).items || [];
  const EXC_PROPS = ["height", "min-height", "width", "min-width", "border-width"];
  for (const x of exceptions) {
    if (!/^[a-z][a-z0-9-]*$/.test(x.class || "")) throw new Error(`${EXCEPTIONS_FILE}: 클래스 이름이 잘못됨 ${x.class}`);
    if (!EXC_PROPS.includes(x.property)) throw new Error(`${EXCEPTIONS_FILE}: ${x.class}의 속성 ${x.property}는 허용되지 않음`);
    if (typeof x.px !== "number" || !(x.px > 0)) throw new Error(`${EXCEPTIONS_FILE}: ${x.class}의 px가 숫자가 아님`);
    if (!x.source) throw new Error(`${EXCEPTIONS_FILE}: ${x.class}에 근거(source)가 없음`);
  }
  const typo = parseTypography(designText);

  const lineHeightBySize = new Map();
  for (const r of typo) {
    const prev = lineHeightBySize.get(r.size);
    if (prev !== undefined && prev !== r.lineHeight) {
      throw new Error(`글자 크기 ${r.size}의 줄높이가 ${prev}와 ${r.lineHeight}로 둘이다 (${DESIGN_FILE})`);
    }
    lineHeightBySize.set(r.size, r.lineHeight);
  }
  const weights = new Set(typo.map((r) => r.weight));
  if (/Regular 400/.test(designText)) weights.add(400);

  const colors = Object.entries(tokens.semantic).map(([name, v]) => ({ key: name.replace(/\//g, "-"), hex: v.hex }));
  const spacing = Object.values(tokens.spacing).map(Number).sort((a, b) => a - b);
  const radius = Object.entries(tokens.radius)
    .map(([name, v]) => ({ key: name.replace(/^radius\//, ""), value: Number(v) }))
    .sort((a, b) => a.value - b.value);
  const text = Object.entries(tokens.typography)
    .filter(([name]) => name.startsWith("font-size/"))
    .map(([name, v]) => {
      const size = Number(v);
      const lh = lineHeightBySize.get(size);
      if (lh === undefined) throw new Error(`글자 크기 ${size}의 줄높이가 ${DESIGN_FILE}에 없다`);
      return { key: name.replace(/^font-size\//, ""), size, lineHeight: lh };
    })
    .sort((a, b) => b.size - a.size);
  const fontFamily = tokens.typography["font-family/family-font"];
  const fontWeight = [...weights].sort().map((w) => {
    if (!WEIGHT_NAMES[w]) throw new Error(`굵기 ${w}의 이름이 정해지지 않았다`);
    return { key: WEIGHT_NAMES[w], value: w };
  });

  const L = [];
  L.push(`/* 생성 파일 — 손으로 고치지 않는다. node scripts/gen-tokens.mjs 로 다시 만든다. */`);
  L.push(`/* 원본: ${TOKENS_FILE} (줄높이·굵기: ${DESIGN_FILE}) */`);
  L.push(`@theme {`);
  L.push(`  --*: initial;`);
  L.push(`  --font-sans: "${fontFamily}", sans-serif;`);
  for (const c of colors) L.push(`  --color-${c.key}: ${c.hex};`);
  for (const s of spacing) L.push(`  --spacing-${s}: ${s}px;`);
  for (const r of radius) L.push(`  --radius-${r.key}: ${r.value}px;`);
  for (const t of text) {
    L.push(`  --text-${t.key}: ${t.size}px;`);
    L.push(`  --text-${t.key}--line-height: ${t.lineHeight}px;`);
  }
  for (const w of fontWeight) L.push(`  --font-weight-${w.key}: ${w.value};`);
  L.push(`}`);
  if (exceptions.length) {
    L.push(``);
    L.push(`/* 사용자 승인 예외 (${EXCEPTIONS_FILE}) — 이 클래스 이름 그대로만 쓴다 */`);
    for (const x of exceptions) L.push(`@utility ${x.class} { ${x.property}: ${x.px}px; } /* ${x.for} */`);
  }
  const css = L.join("\n") + "\n";

  const allowed = {
    note: "생성 파일 — 손으로 고치지 않는다. node scripts/gen-tokens.mjs",
    source: TOKENS_FILE,
    sourceHash: createHash("sha256").update(tokensText + designText + exceptionsText).digest("hex").slice(0, 16),
    exceptions: exceptions.map((x) => x.class),
    colors: colors.map((c) => c.key),
    spacing: spacing.map(String),
    radius: radius.map((r) => r.key),
    text: text.map((t) => t.key),
    fontWeight: fontWeight.map((w) => w.key),
  };
  return { css, allowedJson: JSON.stringify(allowed, null, 2) + "\n", allowed };
}

/** G2: 생성 파일이 원본으로 다시 만든 결과와 같은지. 차이 줄 수 합계 = 0이면 통과. */
export function checkTokens() {
  const { css, allowedJson } = buildTheme();
  const files = [];
  for (const [file, expected] of [
    [THEME_FILE, css],
    [ALLOWED_FILE, allowedJson],
  ]) {
    if (!existsSync(abs(file))) {
      files.push({ file, missing: true, diffLines: null });
      continue;
    }
    const a = read(file).replace(/\r\n/g, "\n").split("\n");
    const b = expected.split("\n");
    let diff = Math.abs(a.length - b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
    files.push({ file, missing: false, diffLines: diff });
  }
  const count = files.reduce((n, f) => n + (f.missing ? 1 : f.diffLines), 0);
  return { id: "G2", name: "토큰 생성 파일 = 원본 재생성 결과", passed: count === 0, count, files };
}

export function loadAllowed() {
  if (!existsSync(abs(ALLOWED_FILE))) return null;
  return JSON.parse(read(ALLOWED_FILE));
}

// ---------- 토큰 밖 값 검사 (G0 훅과 G3 판정이 같이 쓴다) ----------

const SPACING_PREFIX =
  "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|w|h|size|min-w|min-h|max-w|max-h|top|right|bottom|left|start|end|inset|inset-x|inset-y|translate-x|translate-y|scroll-m|scroll-p|basis|indent";
const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black";
const COLOR_PREFIX = "bg|text|border(?:-[trblxyse])?|ring|ring-offset|fill|stroke|outline|divide|from|via|to|accent|caret|decoration|placeholder|shadow";

const B = "(?<![\\w-])"; // 클래스 앞 경계
const E = "(?![\\w./-])"; // 클래스 뒤 경계

export const RULES = [
  { id: "T1", name: "# 색상값", re: /#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z_-])/g },
  { id: "T2", name: "색상 함수", re: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color-mix)\(/g },
  { id: "T3", name: "대괄호 임의 값", re: /[a-z0-9]-\[[^\]\s]+\]|\[(?:--)?[a-z-]+:[^\]\s]+\]/g },
  { id: "T4", name: "인라인 style", re: /\bstyle\s*=\s*\{/g },
  { id: "T7", name: "숫자 크기 속성(width/height/size=)", re: /\b(?:width|height|size|strokeWidth)\s*=\s*\{?\s*["']?\d/g },
  { id: "T8", name: "조합 클래스(p-${...})", re: /[a-z0-9]-\$\{/g },
];

function classRules(allowed) {
  const spacing = new Set(allowed.spacing);
  const radius = new Set(allowed.radius);
  const text = new Set(allowed.text);
  const weight = new Set(allowed.fontWeight);
  return [
    {
      id: "T5",
      name: "허용 목록 밖 간격 클래스",
      re: new RegExp(`${B}-?(?:${SPACING_PREFIX})-(\\d+(?:\\.\\d+)?)${E}`, "g"),
      bad: (m) => !spacing.has(m[1]),
    },
    {
      id: "T5",
      name: "허용 목록 밖 모서리 클래스",
      re: new RegExp(`${B}rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?-([a-z0-9.]+)${E}`, "g"),
      bad: (m) => !radius.has(m[1]),
    },
    {
      id: "T5",
      name: "허용 목록 밖 글자 크기 클래스",
      re: new RegExp(`${B}text-(\\d+|xs|sm|base|lg|xl|[2-9]xl)${E}`, "g"),
      bad: (m) => !text.has(m[1]),
    },
    {
      id: "T5",
      name: "허용 목록 밖 굵기 클래스",
      re: new RegExp(`${B}font-(thin|extralight|light|normal|regular|medium|semibold|bold|extrabold|black)${E}`, "g"),
      bad: (m) => !weight.has(m[1]),
    },
    {
      id: "T5",
      name: "Tailwind 기본 팔레트 색",
      re: new RegExp(`${B}(?:${COLOR_PREFIX})-(?:${PALETTE})(?:-\\d+)?(?:\\/\\d+)?${E}`, "g"),
      bad: () => true,
    },
    {
      id: "T5",
      name: "토큰 밖 선 두께(border-2 등). 1px은 border, 1.5px은 border-selected",
      re: new RegExp(`${B}(?:border|ring|outline|divide)(?:-[trblxyse])?-(\\d+(?:\\.\\d+)?)${E}`, "g"),
      bad: () => true,
    },
    {
      id: "T5",
      name: "Tailwind 기본 그림자·줄높이·자간",
      re: new RegExp(`${B}(?:shadow-(?:2xs|xs|sm|md|lg|xl|2xl|inner)|leading-[a-z0-9]+|tracking-[a-z]+)${E}`, "g"),
      bad: () => true,
    },
  ];
}

const CSS_PX = { id: "T6", name: "CSS 파일의 px 숫자", re: /(?<![\w-])\d*\.?\d+px\b/g };

/** text 안의 토큰 밖 값 목록. file은 확장자 판단용 상대 경로. */
export function scanText(text, file, allowed) {
  const out = [];
  const lines = text.split(/\r?\n/);
  const rules = [...RULES, ...(allowed ? classRules(allowed) : [])];
  if (file.endsWith(".css")) rules.push(CSS_PX);
  lines.forEach((line, i) => {
    for (const r of rules) {
      r.re.lastIndex = 0;
      let m;
      while ((m = r.re.exec(line))) {
        if (r.bad && !r.bad(m)) continue;
        out.push({ rule: r.id, name: r.name, file, line: i + 1, text: m[0] });
      }
    }
  });
  return out;
}

const AMOUNT = /\d[\d,]*\s*원/g;

/** 화면 코드의 금액 숫자 (src/data/ 밖) */
export function scanAmounts(text, file) {
  const out = [];
  text.split(/\r?\n/).forEach((line, i) => {
    AMOUNT.lastIndex = 0;
    let m;
    while ((m = AMOUNT.exec(line))) out.push({ rule: "A1", name: "화면 코드의 금액 숫자", file, line: i + 1, text: m[0] });
  });
  return out;
}

export const SCANNED_EXT = /\.(tsx?|jsx?|mjs|css)$/;
export const isScannedSrc = (relPath) =>
  relPath.startsWith("src/") && SCANNED_EXT.test(relPath) && relPath !== THEME_FILE;
export const isAmountScanned = (relPath) =>
  isScannedSrc(relPath) && !relPath.startsWith("src/data/") && !relPath.endsWith(".css");

export function walk(relDir) {
  const dir = abs(relDir);
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(rel(p)));
    else out.push(rel(p));
  }
  return out;
}

/** src/app/**\/page.tsx → 라우트 경로 */
export function pageRoutes() {
  return walk("src/app")
    .filter((f) => /\/page\.(tsx|ts|jsx|js)$/.test(f))
    .map((f) => {
      const segs = f.replace(/^src\/app\/?/, "").split("/").slice(0, -1);
      const route = "/" + segs.filter((s) => !/^\(.*\)$/.test(s)).join("/");
      return { file: f, route };
    });
}

export function countScreenSections() {
  return (read(SCREENS_FILE).match(/^## /gm) || []).length;
}
