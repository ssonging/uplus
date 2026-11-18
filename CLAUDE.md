@AGENTS.md

# 화면 구현 하네스

요금제 선택 모바일 웹(390×844)의 화면 4개를 한 번에 한 화면씩 만든다.
메인 대화는 오케스트레이터다. 앱 코드를 직접 쓰거나 고치지 않는다.
에이전트를 부르고, 게이트를 돌리고, 상태를 적고, 커밋만 한다.

## 근거 (읽기 전용)
- docs/, reference/는 읽기만 한다.
- 우선순위: PRD.md > screens.md.txt > Figma 화면 링크 > flow.png. Make 링크는 쓰지 않는다.
- 문구·기능은 PRD를, 배치·컴포넌트는 Figma를 따른다.
- 규칙 SSOT는 docs/tokens.json.txt 하나다.
- 용어 예외(사용자 결정): 화면 문구는 "구독 신청" 등 "구독" 계열을 쓴다.
  DOMAIN.md의 용어 통일("요금제 변경 신청")은 따르지 않는다.

## 화면 (Figma 파일 OHWp8k8rDctlZgjvVcink2)
| 화면 | 이름 | 경로 | Figma 노드 |
|---|---|---|---|
| 요금제 목록 | list | /plans | 10027:596 |
| 요금제 상세 | detail | /plans/[id] | 10027:636 |
| 구독 신청 | apply | /plans/[id]/apply | 10027:665 |
| 신청 완료 | complete | /plans/[id]/complete | 10027:701 |

## 부르는 말
- "<화면> 화면 구현해줘" → 그 화면을 ①부터 끝까지
- "이어서 해줘" → harness/state.json과 마지막 커밋을 읽고 멈춘 단계부터
- "검증만 해줘" → ④만
- "토큰 다시 만들어줘" → ②만

## 파이프라인 (한 화면)
단계를 시작할 때와 끝낼 때마다 harness/state.json을 고친다. 게이트를 통과하면 커밋한다: `harness(<화면>): <단계>`
1. ① 명세: screen-spec 호출 → harness/specs/<화면>.md (첫 실행이면 routes.json도)
   → G1 `node scripts/gate-spec.mjs <화면>`
   (G1-5 "토큰 없음"이 있으면 멈추고 사용자에게 묻는다. G1-6은 prd-map.json의 F번호가 명세 근거에 다 있는지 센다)
2. ② 토큰 (첫 실행이거나 tokens.json.txt가 바뀌었을 때만): `node scripts/gen-tokens.mjs`
   → G2 `node scripts/gate-tokens.mjs`
3. ③ 구현: screen-builder 호출. G0 훅이 항상 켜져 있다.
4. ④ 판정: `node scripts/judge.mjs <화면>` → screen-judge가 보고서를 읽고 실패 위치를 요약
   → 실패하면 ③으로(실패 위치를 넘긴다). 3번 실패하면 멈추고 사용자에게 알린다.
5. H 승인: Figma 프레임 캡처와 구현 화면 캡처(390×844)를 나란히 보여 주고
   "승인" 또는 "반려: 사유"를 받는다.
   승인하면 커밋하고 다음 화면으로. 반려 사유가 명세 문제면 ①, 구현 문제면 ③.
- 4화면이 모두 승인되면 마지막으로 `node scripts/judge.mjs --all` (라우트 수 = 4).

## 역할과 편집 폴더
| 담당 | 편집 폴더 |
|---|---|
| screen-spec | harness/specs/ |
| screen-builder | src/ (src/app/tokens.css 제외) |
| screen-judge | 없음 (읽기 전용) |
| 메인 대화 | harness/state.json, git 커밋 |

## 금지
- 토큰 밖 값: `#` 색상값, rgb()/hsl()/oklch(), Tailwind 대괄호 값, style={{}}, 허용 목록 밖 숫자 클래스
- 토큰에 없는 값이 필요하면 멈추고 묻는다. 토큰을 추가하거나 임의 값으로 대신하지 않는다.
- 생성 파일(src/app/tokens.css, harness/allowed.json)은 손으로 고치지 않는다.
- 사람만 고치는 규칙 파일: harness/exceptions.json(승인한 토큰 밖 치수 4개), harness/prd-map.json(화면별 PRD F번호).
  바꿔야 하면 멈추고 사용자에게 요청한다.
- 예시 데이터는 src/data/example.ts에만 두고, 화면에는 "예시"라고 표시한다.
- BR10: 지금 쓰는 요금제면 신청 버튼을 disabled로 하고 "지금 쓰는 요금제" 안내를 보여 준다.
- 푸시는 사용자가 말할 때만 한다.
- .claude/agents/subs-watch.md와 .claude/skills/uplus-report-ppt/는 하네스와 상관없다. 고치지 않는다.
