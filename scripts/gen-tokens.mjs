// ② 토큰 적용: docs/tokens.json.txt → src/app/tokens.css + harness/allowed.json
// 사용법: node scripts/gen-tokens.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ALLOWED_FILE, THEME_FILE, abs, buildTheme } from "./lib/harness.mjs";

const { css, allowedJson, allowed } = buildTheme();
for (const [file, body] of [
  [THEME_FILE, css],
  [ALLOWED_FILE, allowedJson],
]) {
  mkdirSync(path.dirname(abs(file)), { recursive: true });
  writeFileSync(abs(file), body);
}
console.log(
  JSON.stringify(
    {
      wrote: [THEME_FILE, ALLOWED_FILE],
      counts: {
        colors: allowed.colors.length,
        spacing: allowed.spacing.length,
        radius: allowed.radius.length,
        text: allowed.text.length,
        fontWeight: allowed.fontWeight.length,
      },
    },
    null,
    2,
  ),
);
