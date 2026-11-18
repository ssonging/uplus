# monitor: subs-watch 작업 폴더

에이전트 정의: [`.claude/agents/subs-watch.md`](../.claude/agents/subs-watch.md)
상태: 2026-11-18 첫 실행 완료(기준 스냅샷 생성). 예약 작업 `subs-watch-daily` 등록 완료(평일 08:30, 앱의 부하 분산으로 실제 시작은 약 08:40, Auto 모드 저장).

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `sites.json` | 감시할 사이트 3곳 (id·URL·모바일 여부) |
| `partners.json` | 제휴사 별칭 (가정: 초기 목록) |
| `scripts/fetch.mjs` | 헤드리스 브라우저 수집 스크립트 (읽기 전용, Chrome 사용) |
| `scripts/parse.mjs` | 수집 원본 → 스냅샷 정리 (사이트별 JSON·HTML 구조 기준) |
| `scripts/diff.mjs` | 직전 스냅샷과 비교 → 변경 목록 JSON |
| `package.json` | Playwright 의존성 |
| `raw/<날짜>/` | 수집 원본 (txt·links·xhr·png·_fetch-log) |
| `snapshots/<날짜>.json` | 하루 1개, 정리된 상품 목록 (비교 기준) |
| `reports/<날짜>.md` | 일일 변경 리포트 |

## 처음 준비 (실행 전, 사용자 승인 후 1회)

```
cd monitor
npm install
```

2026-11-18에 설치 완료. 이 PC에서는 Chrome으로 실행된다(Edge는 자동 실행 시 바로 닫힘). Chrome도 안 되면 `npx playwright install chromium`이 필요하다.

## 매일 실행 명령

```
node scripts/fetch.mjs udok udok-all tuniverse tuniverse-all tuniverse-event ktsub --out raw/<YYYY-MM-DD>
node scripts/parse.mjs raw/<YYYY-MM-DD>
node scripts/diff.mjs snapshots/<YYYY-MM-DD>.json
```

수집에 약 4~10분 걸린다(2026-11-18 기준). 비교 키는 사이트 상품 ID다.

## 스냅샷 형식 (`snapshots/YYYY-MM-DD.json`)

```json
{
  "date": "2026-11-19",
  "sites": {
    "udok": {
      "status": "ok",
      "url": "https://www.lguplus.com/pogg/main",
      "fetchedAt": "2026-11-19T08:31:00+09:00",
      "products": [
        {
          "key": "udok:티빙베이직",
          "partner": "티빙",
          "name": "티빙 베이직",
          "category": "OTT",
          "price": { "regular": 9500, "sale": 7900, "unit": "월", "text": "월 7,900원" },
          "promotions": [ { "title": "첫 달 100원", "period": "~2026-12-31", "text": "원문 문구" } ],
          "url": "상세 페이지 URL",
          "evidence": "가격을 읽은 원문 한 줄"
        }
      ],
      "events": [ { "title": "이벤트명", "period": "기간", "url": "URL" } ]
    },
    "tuniverse": { "status": "failed", "error": "오류 내용" }
  }
}
```

- 위 값은 형식 예시이며 실제 가격이 아니다.
- 페이지에서 확인되지 않은 값은 `null`로 둔다. 추측해서 채우지 않는다.

## 매일 아침 실행 (정해진 내용, 미등록)

| 항목 | 정한 내용 |
|---|---|
| 방식 | Claude 데스크톱 앱 예약 작업 (이 PC에서 실행) |
| 시각 | 평일(월~금) 08:30 KST |
| 작업 폴더 | `C:\Users\songing\Desktop\UPLUS` |
| 알림 | 리포트 파일 저장 + 예약 작업 결과에 요약 3줄 |
| 조건 | PC가 켜져 있고 앱이 실행 중이어야 함 |

예약 작업에 넣을 지시문(초안):

> subs-watch 에이전트로 오늘 아침 구독 상품 점검을 실행해 줘. monitor/reports/에 오늘 리포트를 저장하고, 완료 확인 체크리스트 결과와 요약 3줄을 마지막에 알려줘.

등록은 사용자가 요청할 때 한다.
