# 요금제 목록 (list)

## 목적
- 고객이 자기 데이터 사용량을 보고, 필요한 데이터 양으로 요금제를 거른다.
- 쓰고 있는 구독 서비스를 골라 "지금 요금제 + 구독료"를 계산하고, 각 요금제의 전체 금액과 차이를 비교한다.
- 지금 쓰는 요금제를 구분해 보여 주고, 고른 요금제의 상세 화면으로 이동한다.

## 라우트
- `/plans`
- 로그인한 상태로 들어온다(로그인 화면 없음). 고객의 지금 요금제·데이터 사용량은 예시 데이터로 대신한다.

## 구성 요소
화면 구조: Header(본문 밖, 고정) → 본문 스크롤(bg/default, 좌우 spacing/16·상하 spacing/24, 섹션 간격 spacing/24). BottomCTA 없음(Figma 10027:596과 같음, 본문 높이 788).

본문 섹션 순서(위에서 아래로):
1. 데이터 사용량 → 2. 데이터 양 필터 → 3. 구독 서비스 선택 → 4. 지금 내는 금액 → 5. 목록 안내 → 6. 요금제 목록 → 7. 하단 안내 문구

- Header: Type=root, Title='요금제 목록'. 내부 Logo 표시(Figma 10029:464).
- Logo: Header root 안. 32×24, brand/primary. 변형·속성 없음.
- 신규: 섹션 제목: 섹션 1~4 위의 제목 텍스트. body/strong(font-size/body), text/primary. 제목과 내용 사이 spacing/12.
- 신규: 데이터 사용량 박스: 섹션 1. bg/surface, radius/16, 안쪽 여백 spacing/20, 외곽선 없음. 안에 List/Row 4줄.
- List/Row: Type=default. 데이터 사용량 박스 안 4줄. Label='이번 달 쓴 양' / '남은 양' / '다시 들어오는 날' / '지난 달 쓴 양', Value=예시 데이터 값.
- FilterChip: 섹션 2 '데이터 양 필터'. 가로 한 줄, 칩 간격 spacing/4(Figma 10029:507 배치 그대로).
  - '전체': State=selected(기본).
  - 데이터 양 칩 3개(라벨은 예시 데이터의 데이터 양 기준값): State=default.
  - 한 번에 1개만 selected(Figma FilterChip 설명 "selected는 한 번에 1개"). 누르면 그 칩이 selected, 나머지 default.
- 신규: 구독 서비스 선택 목록: 섹션 3. bg/surface, radius/16, 안쪽 여백 spacing/20, 외곽선 없음. 세로 4줄, 줄 간격 spacing/12. 한 줄 = Checkbox + 서비스 이름(body/small-medium, text/primary, 간격 spacing/8) + 오른쪽 끝 대표 구독료(body/small-medium, text/secondary). 줄 전체를 눌러도 Checkbox가 바뀐다. 여러 개 고를 수 있다(0~4개).
- Checkbox: 구독 서비스 선택 목록의 각 줄. State=default(안 고름) | active(고름). 기본은 모두 State=default. 줄 순서: 유튜브, 넷플릭스, 디즈니플러스, 티빙.
- 신규: 지금 내는 금액 박스: 섹션 4. bg/surface, radius/16, 안쪽 여백 spacing/20, 외곽선 없음. 안에 List/Row 3줄.
- List/Row: Type=default. 지금 내는 금액 박스 안 3줄.
  - Label='지금 요금제', Value='{지금 요금제 이름} 월 {월 요금}원'.
  - Label='고른 구독료', Value='월 {고른 구독 서비스 대표 구독료 합}원'(0개면 '월 0원').
  - Label='지금 요금제 + 구독료', Value='월 {합계}원'.
- 신규: 목록 안내: 섹션 5(Figma 10029:516). 제목 heading/h4(font-size/heading-h4) text/primary + 설명 body/small-medium(font-size/body-small) text/secondary, 간격 spacing/8.
- Card/Plan: 섹션 6 요금제 목록(Figma 10029:519). State=default, Badge=false, Promo=false, Sale=false. 카드 사이 spacing/16. 필터를 통과한 요금제만, 월 요금이 낮은 순으로 보여 준다.
  - Name='{요금제 이름}'.
  - Desc='데이터 {데이터 양} · {묶인 구독 서비스} 포함'(묶인 구독이 없으면 '데이터 {데이터 양} · 묶인 구독 없음').
  - Price='월 {월 요금}원'.
  - 지금 쓰는 요금제 카드만 Badge=true, 내부 Tag 라벨='지금 요금제'.
- Button: Card/Plan 내부. Type=Secondary, Size=sm, State=Default, Label='요금제 보기'(Figma I10029:520;4004:948).
- Tag: Card/Plan 내부 badge. 지금 쓰는 요금제 카드에만 보임. 라벨 '지금 요금제'. border/subtle 배경, caption/bold, radius/999, 높이 h-tag.
- 신규: 금액 차이 줄: 각 Card/Plan 바로 아래(카드와 간격 spacing/8, 카드 묶음 간격 spacing/16은 유지). body/small-medium, text/secondary. 내용은 '전체 금액 월 {새 전체 금액}원 · {차이 문구}'. 지금 쓰는 요금제 카드에는 이 줄 대신 '지금 쓰는 요금제예요'를 보인다.
- 신규: 요금 안내 문구: 섹션 7(Figma 10029:565). caption/small(font-size/12), text/secondary. 2줄('모든 요금은 …', '요금제, 구독료, …').

## 상태
- 기본:
  - 데이터 사용량 4줄 표시.
  - FilterChip '전체' selected → 예시 요금제 전부를 월 요금 낮은 순으로 표시.
  - 구독 서비스 Checkbox 모두 State=default → '고른 구독료' 월 0원, '지금 요금제 + 구독료' = 지금 요금제 월 요금.
  - 각 카드 아래 금액 차이 줄 표시.
  - 지금 쓰는 요금제 카드는 Badge=true(Tag '지금 요금제')와 '지금 쓰는 요금제예요' 줄로 구분.
- 데이터 양 필터 선택: 고른 칩만 State=selected. 카드 목록은 데이터 양이 그 기준값 이상인 요금제만 남긴다(무제한은 모든 기준을 통과). 정렬은 그대로 월 요금 낮은 순.
- 구독 서비스 선택/해제: 해당 Checkbox State=active/default 전환. 즉시 '고른 구독료', '지금 요금제 + 구독료', 모든 카드의 금액 차이 줄을 다시 계산한다.
- 금액 차이 줄 계산:
  - 지금 요금제 + 구독료 = 지금 요금제 월 요금 + 고른 구독 서비스 대표 구독료 합(BR9).
  - 새 전체 금액 = 새 요금제 월 요금 + (고른 구독 서비스 중 새 요금제에 묶이지 않은 것의 대표 구독료 합).
  - 차이 = 새 전체 금액 − 지금 요금제 + 구독료. 음수면 '덜 내요', 양수면 '더 내요', 0이면 '같아요' 문구. 더 내는 경우도 숨기지 않고 같은 모양으로 보인다(F2-4).
- 지금 쓰는 요금제 카드: 목록에서 숨기지 않는다. Tag '지금 요금제'로 구분하고, 금액 차이 줄 대신 '지금 쓰는 요금제예요'. '요금제 보기'는 누를 수 있다(신청 차단은 detail·apply 화면 상태에서 처리, BR10).
- 빈(필터 결과 0개): 예시 데이터에서는 생기지 않게 둔다. 별도 빈 화면·문구는 만들지 않는다.
- 로딩·에러: 예시 데이터를 화면 안에서 쓰므로 정의하지 않는다(PRD 범위 밖: 변경 신청 실패 처리).

## 이동
- 들어오는 곳: 플로우 시작(로그인 상태) / 요금제 상세의 '뒤로'·헤더 뒤로.
- 나가는 곳: Card/Plan 안 Button '요금제 보기' → `/plans/[id]`(그 카드의 요금제 id).
  - 고른 구독 서비스 목록을 상세 화면에 넘긴다(상세의 금액 차이·인앱 구독 해지 안내에 필요). 가정: 쿼리 `?subs=youtube,netflix` 형식으로 넘기고, 상세에서 '뒤로'로 돌아오면 같은 쿼리로 선택을 되살린다.
- Header Type=root에는 뒤로 버튼이 없다.

## 문구
기본 상태에서 그대로 나오는 고정 문구:
- "요금제 목록"
- "내 데이터 사용량"
- "이번 달 쓴 양"
- "남은 양"
- "다시 들어오는 날"
- "지난 달 쓴 양"
- "필요한 데이터 양"
- "전체"
- "쓰고 있는 구독 서비스"
- "유튜브"
- "넷플릭스"
- "디즈니플러스"
- "티빙"
- "지금 내는 금액"
- "지금 요금제"
- "고른 구독료"
- "지금 요금제 + 구독료"
- "나에게 맞는 요금제를 선택하세요"
- "요금제별 혜택을 확인한 후 구독할 수 있어요."
- "요금제 보기"
- "지금 쓰는 요금제예요"
- "모든 요금은 부가세 포함 금액입니다."
- "요금제, 구독료, 데이터 사용량은 예시 데이터입니다."

값이 들어가는 문구(틀):
- 카드 설명: "데이터 {데이터 양} · {묶인 구독 서비스} 포함"
- 카드 설명(묶인 구독 없음): "데이터 {데이터 양} · 묶인 구독 없음"
- 카드 월 요금: "월 {월 요금}원"
- 대표 구독료: "월 {대표 구독료}원"
- 금액 차이(덜 낼 때): "전체 금액 월 {새 전체 금액}원 · 지금보다 월 {차이}원 덜 내요"
- 금액 차이(더 낼 때): "전체 금액 월 {새 전체 금액}원 · 지금보다 월 {차이}원 더 내요"
- 금액 차이(같을 때): "전체 금액 월 {새 전체 금액}원 · 지금과 같아요"

## 예시 데이터
모두 **예시**다. 실제 값은 미정(PRD 열린 질문 2, DOMAIN 열린 질문 1~2)이며 화면 작업 때 확인받는다. 고객 개인 정보(이름·번호 등)는 넣지 않는다.

- 요금제 목록 (예시): 필드 `id`, `name`, `monthlyFee`(원), `dataAmount`(GB 숫자 또는 '무제한'), `bundledSubscriptions`(구독 서비스 id 배열, 0~4개).
  - 예시 값: 개수 5개 내외. 월 요금·데이터 양이 서로 다르고, 묶인 구독이 없는 요금제와 1~2개 묶인 요금제를 섞는다. 지금 요금제보다 싼 것·비싼 것이 모두 있어야 한다(덜 내요/더 내요 둘 다 보이게).
- 지금 요금제 (예시): 필드 `currentPlanId`(요금제 목록의 id 하나).
- 데이터 사용량 (예시): 필드 `usedThisMonth`(GB), `remaining`(GB), `resetDate`(다시 들어오는 날, 'M월 D일'), `usedLastMonth`(GB).
- 구독 서비스·대표 구독료 (예시): 필드 `id`(youtube, netflix, disney, tving), `name`(유튜브, 넷플릭스, 디즈니플러스, 티빙 — 이 4개뿐, BR12), `representativeFee`(원).
- 데이터 양 필터 기준값 (예시): 필드 `filters`(`label`, `minData`). '전체'(기준 없음) + 데이터 양 기준 3개(예: '10GB 이상', '50GB 이상', '무제한'). 기준값은 예시 요금제 목록에 맞춰 정한다.

## 토큰
색(semantic):
- bg/default: 화면·본문 스크롤 배경
- bg/surface: Header, Card/Plan, 데이터 사용량·구독 서비스·지금 내는 금액 박스, FilterChip default 배경
- text/primary: 제목, 요금제 이름·월 요금, 서비스 이름, FilterChip default 라벨, Button Secondary 라벨
- text/secondary: 설명문, Card/Plan Desc, List/Row Label, 대표 구독료, 금액 차이 줄, 요금 안내 문구, Tag 라벨
- text/on-dark: FilterChip selected 라벨
- fill/secondary: FilterChip selected 배경
- border/default: FilterChip default·Card/Plan default·Button Secondary 외곽선
- surface/default: Button Secondary 배경
- border/subtle: List/Row 구분선, Tag 배경
- fill/primary: Checkbox active
- brand/primary: Logo

간격:
- spacing/0, spacing/4(필터 칩 사이), spacing/8(목록 안내 제목-설명, Card/Plan 내부, 카드-금액 차이 줄, Checkbox-이름), spacing/12(섹션 제목-내용, 구독 줄 사이, Header root 내부, List/Row 내부), spacing/16(본문 좌우, 카드 묶음 사이, FilterChip 좌우 패딩), spacing/20(Card/Plan·박스 안쪽 여백), spacing/24(본문 상하, 섹션 사이, Button sm 좌우 패딩)
- 치수: spacing/56(Header 높이), spacing/40(FilterChip 높이), spacing/24(Checkbox·Logo 높이), spacing/32(Logo 폭)

모서리:
- radius/16(Card/Plan, 박스), radius/8(Button), radius/full(FilterChip), radius/999(Tag)

글자 크기:
- font-size/heading-h4(Header root 제목, 목록 안내 제목), font-size/subtitle(Card/Plan 이름·월 요금), font-size/body(섹션 제목, Button 라벨), font-size/body-small(설명문, List/Row, FilterChip 라벨, 구독 줄, 금액 차이 줄), font-size/caption(Tag), font-size/12(요금 안내 문구)

예외 클래스(승인됨, harness/exceptions.json):
- h-tag: Tag 높이 26

## 근거
PRD 요구사항(harness/prd-map.json list 몫):
- F1-1(데이터 사용량 보기): 신규: 데이터 사용량 박스 + List/Row Type=default 4줄(이번 달 쓴 양·남은 양·다시 들어오는 날·지난 달 쓴 양). DOMAIN 6장 데이터 사용량 속성 그대로. Figma에는 없는 영역이라 PRD를 따라 추가했다.
- F1-2(필요한 데이터 양으로 거르기): FilterChip '전체' + 데이터 양 기준 칩, 상태 '데이터 양 필터 선택'. Figma의 칩 배치(10029:507, 간격 spacing/4, '전체' selected)는 그대로 두고, 라벨 '베이직·스탠다드·프리미엄'(요금제 이름 기준)은 PRD를 따라 데이터 양 기준으로 바꿨다.
  - 미정 — 가정(PRD 열린 질문 4): 데이터 사용량을 필터 참고값으로 쓰는 방법은 정하지 않았다. 가장 단순한 형태로, 사용량은 필터 바로 위에 보여 주기만 하고 필터 기본값·칩 선택에 자동 반영하지 않는다. 기본값은 '전체'.
  - 미정 — 가정: 필터 의미는 "데이터 양이 기준값 이상"(무제한은 모든 기준 통과), 한 번에 1개 선택(Figma FilterChip 설명 근거).
- F1-3(월 요금·데이터 양·묶인 구독 보기, 월 요금 비교): Card/Plan Name/Desc/Price. Desc에 데이터 양·묶인 구독 서비스, Price에 월 요금. Figma 카드의 '월 10회 이용 · 기본 기능 제공' 같은 횟수 기반 내용은 PRD를 따라 데이터 양·묶인 구독으로 바꿨다. Card/Plan 변형(State=default, Badge=false, Promo=false, Sale=false)과 Button(Type=Secondary, Size=sm, State=Default, Label='요금제 보기')은 Figma 그대로.
  - 미정 — 가정: "월 요금 비교"는 별도 정렬·비교 UI 없이 카드를 월 요금 낮은 순으로 늘어놓는 것으로 둔다(DOMAIN 3장 "그중 가장 저렴한 요금제를 찾는다").
- F1-4(지금 요금제 구분, BR10): 지금 쓰는 요금제 카드만 Card/Plan Badge=true + Tag 라벨 '지금 요금제', 금액 차이 줄 대신 '지금 쓰는 요금제예요'. 상태 '지금 쓰는 요금제 카드'. 신청 차단(BR10)은 detail·apply 명세의 상태에서 처리한다.
  - 미정 — 가정: Tag는 등록 속성이 없고 기본 라벨이 '추천'이라, 라벨만 '지금 요금제'로 바꿔 쓴다. design.md는 Card/Plan Badge의 visible 연결이 확인되지 않았다고 하므로 구현에서는 지금 요금제 카드에만 Tag를 그린다.
- F2-1(구독 서비스 4개 직접 고르기, BR12): 신규: 구독 서비스 선택 목록 + Checkbox State=default|active, 유튜브·넷플릭스·디즈니플러스·티빙 4줄, 여러 개 선택. 상태 '구독 서비스 선택/해제'. 여러 개를 고를 수 있어야 하므로 "selected는 한 번에 1개"인 FilterChip이 아니라 Checkbox를 썼다. Figma에는 없는 영역이라 PRD를 따라 추가했다.
- F2-2("지금 요금제 + 구독료" 계산, BR9): 신규: 지금 내는 금액 박스 + List/Row Type=default 3줄('지금 요금제'·'고른 구독료'·'지금 요금제 + 구독료'). 상태 '금액 차이 줄 계산' 첫 식. 대표 구독료는 예시 데이터.
- F2-3(전체 금액 차이 보기): 신규: 금액 차이 줄(각 Card/Plan 아래). 상태 '금액 차이 줄 계산'.
  - 미정 — 가정: PRD의 "새 요금제의 전체 금액"을 "새 요금제 월 요금 + 고른 구독 중 새 요금제에 묶이지 않은 것의 대표 구독료"로 둔다(묶인 구독은 인앱 구독을 해지한다고 보고 빼는 것, BR8·BR11 취지).
  - Card/Plan의 Sale(할인율·원래 가격)·Promo(프로모션 칩)는 할인·프로모션 표시용이라(design.md 4장) 금액 차이에 돌려쓰지 않고 신규 줄로 뺐다.
- F2-4(요금 차이·혜택 투명하게): 금액 차이 줄은 덜 내는 경우·더 내는 경우·같은 경우를 같은 모양·같은 색(text/secondary)으로 보이고, 계산에 쓰는 세 값(지금 요금제, 고른 구독료, 합계)과 서비스별 대표 구독료를 화면에 그대로 보인다. 각 카드 Desc에 묶인 구독 서비스(혜택)를 적는다. 예시 값이라는 사실도 '요금제, 구독료, 데이터 사용량은 예시 데이터입니다.'로 알린다(PRD 8장 "화면에는 '예시'로 표시").

배치·컴포넌트(Figma 10027:596):
- Header Type=root, Title='요금제 목록', Logo: 10029:464.
- 본문 스크롤 10029:468(BottomCTA 없음, 높이 788), 본문 콘텐츠 10029:469(좌우 16·상하 24·간격 24).
- 필터 10029:507, 목록 안내 10029:516('나에게 맞는 요금제를 선택하세요' / '요금제별 혜택을 확인한 후 구독할 수 있어요.'), 요금제 목록 10029:519(간격 16), 요금 안내 10029:565('모든 요금은 부가세 포함 금액입니다.').
- Card/Plan 원본 구조(badge=Tag → Name → Desc → price-row[Price + Button]): 4004:937.

PRD와 Figma가 달라 PRD를 따른 곳:
- Figma 카드의 횟수 기반 예시('베이직 5,900원 / 월 10회 이용' 등)는 쓰지 않고, 데이터 양·묶인 구독 서비스·월 요금으로 바꿨다(F1-3).
- Figma 필터 라벨(베이직·스탠다드·프리미엄)은 데이터 양 기준으로 바꿨다(F1-2).
- Figma에 없는 데이터 사용량(F1-1), 구독 서비스 선택(F2-1), 지금 내는 금액(F2-2), 금액 차이 줄(F2-3), 지금 요금제 Tag(F1-4), 예시 표시 문구(PRD 8장)를 추가했다. 추가 영역은 본문 섹션 규칙(간격 spacing/24)과 Figma의 기존 순서(필터 → 목록 안내 → 목록 → 안내 문구)를 지키며 앞에 넣었다.

용어:
- 화면 문구는 사용자 결정에 따라 "구독" 계열을 쓴다('요금제별 혜택을 확인한 후 구독할 수 있어요.'는 Figma 문구 그대로). DOMAIN.md 용어 통일("요금제 변경 신청")은 따르지 않는다.

기타:
- screens.md '요금제 목록' 섹션: 목적·이동(카드 '요금제 보기' → 상세), 상태(로딩·빈·에러 정의 없음).
- 미정 — 가정: 고른 구독 서비스를 상세로 넘기는 방식(쿼리 `subs`)은 자료에 없어 가장 단순한 형태로 정했다.
- 미정 — 가정: 필터 결과 0개인 빈 상태는 예시 데이터에서 생기지 않게 두고 문구를 만들지 않았다.
