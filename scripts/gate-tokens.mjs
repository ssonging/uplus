// G2 토큰 게이트: 생성 파일이 지금 원본으로 다시 만든 결과와 같은지 센다. 차이 = 0이면 통과.
// 사용법: node scripts/gate-tokens.mjs
import { checkTokens } from "./lib/harness.mjs";

const r = checkTokens();
console.log(JSON.stringify(r, null, 2));
if (!r.passed) {
  console.error("G2 실패: node scripts/gen-tokens.mjs 로 다시 만든다. 생성 파일은 손으로 고치지 않는다.");
  process.exit(1);
}
