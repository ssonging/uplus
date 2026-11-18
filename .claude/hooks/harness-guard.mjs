// G0 하네스 가드 (PreToolUse: Write|Edit|MultiEdit|NotebookEdit|Bash)
// 막으면 종료 코드 2 + stderr 메시지. 그 밖에는 0.
//  1) docs/, reference/ 는 누구도 쓰지 않는다.
//  2) 생성 파일(src/app/tokens.css, harness/allowed.json)은 손으로 고치지 않는다.
//  3) 편집 폴더: src/ = screen-builder, harness/specs/ = screen-spec, harness/reports/ = 스크립트만.
//     screen-judge는 아무것도 쓰지 않고, Bash는 판정 스크립트만 실행한다.
//  4) src/에 쓰는 내용에 토큰 밖 값이 있으면 막는다.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
} catch {
  process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const lib = await import(pathToFileURL(path.join(projectDir, "scripts/lib/harness.mjs")).href);
const tool = input.tool_name || "";
const ti = input.tool_input || {};
const agent = input.agent_type || null; // 메인 대화면 없음
const who = agent ?? "메인 대화";

const block = (msg) => {
  process.stderr.write(`[하네스 G0] ${msg}\n`);
  process.exit(2);
};

// ---------- Bash ----------
if (tool === "Bash") {
  if (agent === "screen-judge") {
    const ok = /^\s*node\s+scripts\/(judge|gate-spec|gate-tokens)\.mjs(\s+(--all|list|detail|apply|complete))?\s*$/.test(ti.command || "");
    if (!ok) block(`screen-judge는 읽기 전용이다. 실행할 수 있는 명령: node scripts/judge.mjs|gate-spec.mjs|gate-tokens.mjs <화면>. 받은 명령: ${ti.command}`);
  }
  process.exit(0);
}

// ---------- 파일 쓰기 ----------
const filePath = ti.file_path || ti.notebook_path;
if (!filePath) process.exit(0);
const relPath = path.relative(projectDir, path.resolve(projectDir, filePath)).split(path.sep).join("/");
if (relPath.startsWith("..")) process.exit(0); // 프로젝트 밖

if (agent === "screen-judge") block("screen-judge는 읽기 전용이다. 파일을 쓰지 않는다.");

if (/^(docs|reference)\//.test(relPath)) block(`${relPath}: docs/와 reference/는 읽기 전용이다.`);

if (relPath === lib.THEME_FILE || relPath === lib.ALLOWED_FILE)
  block(`${relPath}: 생성 파일이다. 손으로 고치지 말고 node scripts/gen-tokens.mjs 로 다시 만든다.`);

if (lib.HUMAN_ONLY_FILES.includes(relPath))
  block(`${relPath}: 사용자가 승인한 규칙 파일이라 사람만 고친다. 바꿔야 하면 멈추고 사용자에게 요청한다.`);

const OWNERS = [
  { prefix: "src/", agent: "screen-builder" },
  { prefix: "harness/specs/", agent: "screen-spec" },
  { prefix: "harness/reports/", agent: null, note: "판정 스크립트만 쓴다" },
];
const owner = OWNERS.find((o) => relPath.startsWith(o.prefix));
if (owner && (owner.agent === null || owner.agent !== agent)) {
  block(
    `${relPath}: ${who}는 이 폴더를 고칠 수 없다. ` +
      (owner.agent ? `${owner.prefix}는 ${owner.agent}만 고친다.` : `${owner.prefix}는 ${owner.note}.`) +
      (agent ? "" : " 메인 대화는 직접 구현하지 않고 에이전트를 부른다."),
  );
}
if (agent === "screen-builder" && !relPath.startsWith("src/"))
  block(`${relPath}: screen-builder의 편집 폴더는 src/ 하나다.`);
if (agent === "screen-spec" && !relPath.startsWith("harness/specs/"))
  block(`${relPath}: screen-spec의 편집 폴더는 harness/specs/ 하나다.`);

// ---------- 토큰 밖 값 ----------
if (lib.isScannedSrc(relPath)) {
  const allowed = lib.loadAllowed();
  if (!allowed) block("harness/allowed.json이 없다. ② 토큰 단계(node scripts/gen-tokens.mjs)를 먼저 한다.");
  // 쓰고 난 뒤의 파일 전체를 만들어 검사한다 (Edit도 파일 전체 기준).
  let after = null;
  if (typeof ti.content === "string") after = ti.content;
  else {
    const absPath = path.join(projectDir, relPath);
    let before = "";
    try {
      before = readFileSync(absPath, "utf8");
    } catch {
      before = "";
    }
    const edits = Array.isArray(ti.edits) ? ti.edits : [ti];
    after = before;
    for (const e of edits) {
      if (typeof e.new_string !== "string") continue;
      if (e.replace_all) after = after.split(e.old_string ?? "").join(e.new_string);
      else after = after.replace(e.old_string ?? "", () => e.new_string);
    }
  }
  const hits = lib.scanText(after, relPath, allowed);
  if (hits.length) {
    const list = hits.slice(0, 20).map((h) => `  - ${h.rule} ${h.name}: "${h.text}" (${h.line}번째 줄)`).join("\n");
    block(
      `${relPath}: 토큰 밖 값 ${hits.length}건이라 쓰기를 막았다.\n${list}\n` +
        "토큰 이름 클래스(p-16, rounded-16, text-body, bg-fill-primary)와 승인 예외(" +
        (allowed.exceptions || []).join(", ") +
        ")만 쓴다. 토큰에 없는 값이 필요하면 멈추고 보고한다.",
    );
  }
}
process.exit(0);
