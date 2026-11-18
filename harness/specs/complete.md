# 신청 완료 (complete)

## 목적
- 구독 신청이 끝났다는 것을 알리고, 새 요금제가 바로 적용됐다는 것을 안다.
- 신청 내역(신청 번호, 요금제, 월 요금, 고른 구독 서비스, 금액 차이, 신청 일시)을 확인한다.
- '완료'로 흐름을 끝낸다(별도 종료 화면 없음).

## 라우트
- `/plans/[id]/complete`
- `id`: 예시 요금제 목록의 `id`(lite, slim, standard, plus, premium). 신청한 새 요금제.
- 쿼리 `subs`: 신청 화면에서 받은 고른 구독 서비스 id를 쉼표로 이은 값(예: `?subs=youtube,netflix`). 없거나 비어 있으면 고른 구독 0개. 4개 id(youtube, netflix, disney, tving) 밖의 값과 중복은 무시한다(detail.md·apply.md와 같음).
- 신청자 정보(이름·연락처·이메일·주소)는 URL로 받지 않고 이 화면에서 쓰지도 않는다(apply.md 이동).
- 로그인한 상태로 들어온다(로그인 화면 없음). 지금 요금제(바꾸기 전 요금제)는 `currentPlanId`로 대신한다.

## 구성 요소
화면 구조: Header(본문 밖, 고정) → 본문 스크롤(bg/default, 좌우 spacing/16·상하 spacing/24, 섹션 간격 spacing/24, 높이 691) → BottomCTA(본문 밖, 고정, 높이 97). Figma 10027:701과 같음.

본문 섹션 순서(위에서 아래로):
1. 구독 신청 완료 안내 → 2. 신청 내역 → 3. 요금 안내 문구

- Header: Type=default, Title='신청 완료'. 내부 icon/arrowLeft 표시, 오른쪽은 24×24 빈 공간(Figma 10029:496). 기존 Header 컴포넌트 재사용.
- icon/arrowLeft: Header 내부 왼쪽. 24×24, icon/default. 누르면 목록으로(이동 참고).
- 신규: 구독 신청 완료 안내: 섹션 1(Figma 10029:626). 세로 가운데 정렬, 안쪽 여백 spacing/16, 세로 간격 spacing/16, 배경 없음(본문 bg/default 그대로). 위에서 아래로 icon/doneMark → 완료 제목 → 완료 설명.
- icon/doneMark: 완료 안내 맨 위 가운데(Figma 10029:627, 컴포넌트 4004:842). 64×64(spacing/64), 원형(radius/full), 배경 fill/primary, 안의 체크 icon/on-dark. 변형·속성 없음. 구현은 기존 아이콘(Checkbox·IconArrowLeft)처럼 SVG 하나(viewBox 0 0 64 64)로 그려 원 안 체크 위치는 SVG 좌표로 둔다(바깥 크기 클래스만 토큰 사용).
- 신규: 완료 제목: '구독 신청이 완료됐어요'(Figma 10029:630). heading/h4(font-size/heading-h4, Bold), text/primary, 가운데 정렬, 폭 가득.
- 신규: 완료 설명: '새 요금제가 바로 적용됐어요.'(Figma 10029:631 자리). body/small-medium(font-size/body-small), text/secondary, 가운데 정렬, 폭 가득. 1줄.
- 신규: 섹션 제목: 섹션 2 제목 '신청 내역'(Figma 10029:633). heading/h4(font-size/heading-h4), text/primary. 제목과 박스 사이 spacing/12(Figma 10029:632).
- 신규: 신청 내역 박스: 섹션 2(Figma 10029:634). bg/subtle, 모서리 radius/0, 안쪽 여백 spacing/12, 줄 간격 spacing/0, 외곽선 없음. apply.md 신청 내용 박스와 같은 모양. 안에 List/Row.
- List/Row: Type=default. 신청 내역 박스 안(Figma 10029:635 등). 줄 순서:
  - Label='신청 번호', Value='{신청 번호}'(예시 데이터).
  - Label='요금제', Value='{이 요금제 이름}'.
  - Label='월 요금', Value='월 {이 요금제 월 요금}원'.
  - Label='고른 구독 서비스', Value='{고른 서비스 이름을 ", "로 이음}'(0개면 '없음').
  - Label='차이', Value=차이 문구(상태 '금액 계산' 참고).
  - Label='신청 일시', Value='{신청 일시}'(예시 데이터).
  - Figma '신청자' 줄(10029:647)은 두지 않는다(근거 참고).
- 신규: 요금 안내 문구: 섹션 3. caption/small(font-size/12), text/secondary. 2줄. detail.md·apply.md 요금 안내 문구와 같은 모양.
- BottomCTA: Layout=single(Figma 10029:504). bg/surface, 위 경계 border/subtle, 안쪽 여백 상 spacing/12·좌우 spacing/16·하 spacing/32. 주요 버튼 1개가 폭 가득. 기존 BottomCTA 컴포넌트는 double만 있으므로 single 변형을 더한다(구현 참고).
- Button: BottomCTA 안. Type=Primary, Size=xl, State=Default, Label='완료'(Figma I10029:504;4004:926). 높이 h-button-xl.

## 상태
- 기본(지금 쓰는 요금제가 아닌 요금제, 예: `/plans/premium/complete`, `/plans/plus/complete?subs=netflix`):
  - icon/doneMark, 완료 제목 '구독 신청이 완료됐어요', 완료 설명 '새 요금제가 바로 적용됐어요.'를 보인다.
  - 신청 내역 6줄. 쿼리 `subs`가 없으면 '고른 구독 서비스' 값은 '없음'.
  - 요금 안내 문구 2줄.
  - Button '완료' State=Default.
- 금액 계산(F4-6, BR9): apply.md·detail.md 상태 '금액 계산'과 같은 식. 바꾸기 전 요금제는 `currentPlanId`.
  - 지금 요금제 + 구독료 = 지금 요금제(`currentPlanId`) 월 요금 + 고른 구독 서비스 대표 구독료 합.
  - 새 전체 금액 = 이 요금제 월 요금 + 고른 구독 중 이 요금제에 묶이지 않은 것의 대표 구독료 합.
  - 차이 = 새 전체 금액 − 지금 요금제 + 구독료. 음수면 '지금보다 월 {차이 절댓값}원 덜 내요', 양수면 '지금보다 월 {차이}원 더 내요', 0이면 '지금과 같아요'. 세 경우 모두 같은 모양·같은 색(List/Row Value 기본, text/primary).
- 지금 쓰는 요금제(주소를 직접 연 경우, `id`가 `currentPlanId`와 같을 때, 예시 `/plans/standard/complete`): 신청 화면에서 '신청'이 비활성이라 정상 흐름으로는 오지 않는다(BR10).
  - icon/doneMark·완료 제목·완료 설명·신청 내역 섹션을 보이지 않는다(완료로 보이지 않게 한다).
  - 대신 섹션 1 자리에 안내 문구 '지금 쓰는 요금제라 신청할 수 없어요.'(body/small-medium, font-size/body-small, text/primary, 가운데 정렬)를 보인다. detail.md·apply.md와 같은 문구.
  - 요금 안내 문구와 Button '완료'(→ 목록)는 그대로 보인다.
- 로딩·에러: 예시 데이터를 화면 안에서 쓰므로 정의하지 않는다. 신청 실패 처리는 PRD 범위 밖이다(PRD 9장).
- 없는 `id`: 정의하지 않는다(예시 데이터의 id로만 들어온다고 가정).

## 이동
- 들어오는 곳: 구독 신청의 Button '신청'(상태 '신청 가능'일 때만) → `/plans/[id]/complete?subs=...`(apply.md 이동). 신청자 정보는 URL에 없다.
- 나가는 곳:
  - Button '완료' → `/plans`(요금제 목록). 쿼리는 붙이지 않는다. 미정 — 가정(근거 참고).
  - Header icon/arrowLeft → `/plans`(요금제 목록). 쿼리는 붙이지 않는다. 신청 화면으로 돌아가지 않는다. 미정 — 가정(근거 참고).
  - 별도 종료 화면은 없다(screens.md '신청 완료' 이동).

## 문구
기본 상태(지금 쓰는 요금제가 아닌 요금제, 쿼리 `subs` 유무와 상관없이)에서 그대로 나오는 고정 문구:
- "신청 완료"
- "구독 신청이 완료됐어요"
- "새 요금제가 바로 적용됐어요."
- "신청 내역"
- "신청 번호"
- "요금제"
- "월 요금"
- "고른 구독 서비스"
- "차이"
- "신청 일시"
- "모든 요금은 부가세 포함 금액입니다."
- "신청 번호, 신청 일시, 요금제, 구독료는 예시 데이터입니다."
- "완료"

다른 상태의 문구:
- 지금 쓰는 요금제: "지금 쓰는 요금제라 신청할 수 없어요."

값이 들어가는 문구(틀):
- 요금제 값: "{요금제 이름}"
- 월 요금 값: "월 {월 요금}원"
- 고른 구독 서비스 값: "{이름}, {이름}" / 0개면 "없음"
- 차이(덜 낼 때): "지금보다 월 {차이}원 덜 내요"
- 차이(더 낼 때): "지금보다 월 {차이}원 더 내요"
- 차이(같을 때): "지금과 같아요"
- 신청 번호 값: "{신청 번호}"(예시)
- 신청 일시 값: "{M}월 {D}일 {HH}:{mm}"(예시)

## 예시 데이터
모두 **예시**다. 실제 값은 미정(PRD 열린 질문 2~3, DOMAIN 열린 질문)이며 화면 작업 때 확인받는다. 고객 개인 정보(이름·연락처·이메일·주소 등)는 예시 값으로도 넣지 않고 화면에 보이지 않는다. 화면의 요금 안내 문구 '신청 번호, 신청 일시, 요금제, 구독료는 예시 데이터입니다.'로 예시임을 표시한다.

- 요금제 목록 (예시): 기존 `plans` — `id`, `name`, `monthlyFee`(원), `bundledSubscriptions`. 이 화면은 라우트 `id`와 같은 요금제 1개를 쓴다.
- 지금 요금제 (예시): 기존 `currentPlanId`(예시 값 'standard'). 바꾸기 전 요금제로 차이 계산과 '지금 쓰는 요금제' 상태 판정에 쓴다. 신청 결과를 저장하지 않으므로 완료 뒤에도 바뀌지 않는다.
- 구독 서비스·대표 구독료 (예시): 기존 `subscriptions` — `id`, `name`, `representativeFee`(원).
- 고른 구독 서비스: 예시 데이터가 아니라 쿼리 `subs`로 받는다.
- **신청 결과 (예시) — `src/data/example.ts`에 아직 없음, 구현 단계에서 추가:** `applicationResult`
  - `applicationNumber`: 신청 번호(문자열). 예시 값 '2026-1118-0001'(예시).
  - `appliedAt`: 신청 일시(표시용 문자열 'M월 D일 HH:mm'). 예시 값 '11월 18일 14:02'(예시).
  - 저장소가 연결되지 않아 모든 신청에 같은 예시 값을 보인다. 신청자 필드는 두지 않는다.
- 상태 확인용 예시 조합(예시 값 기준, 지금 요금제 5G 스탠다드 월 55,000원):
  - 기본: `/plans/premium/complete`(차이 '지금보다 월 30,000원 더 내요'), `/plans/lite/complete`(차이 '지금보다 월 16,000원 덜 내요'), `/plans/plus/complete?subs=netflix`.
  - 지금 쓰는 요금제(직접 연 경우): `/plans/standard/complete`.

## 토큰
색(semantic):
- bg/default: 화면·본문 스크롤 배경, 완료 안내 영역(배경 없음 → 본문 배경)
- bg/surface: Header, BottomCTA 배경
- bg/subtle: 신청 내역 박스 배경(Figma 10029:634)
- text/primary: Header 제목, 완료 제목, 섹션 제목, List/Row Value, 지금 요금제 안내
- text/secondary: 완료 설명, List/Row Label, 요금 안내 문구
- text/on-dark: Button Primary 라벨
- icon/default: icon/arrowLeft
- icon/on-dark: icon/doneMark 안 체크
- fill/primary: icon/doneMark 원 배경, Button Primary Default 배경
- border/subtle: List/Row 구분선, BottomCTA 위 경계

간격:
- spacing/0(본문 스크롤·신청 내역 박스 줄 간격), spacing/4(List/Row 좌우, Header 상하), spacing/8(Header 내부), spacing/12(신청 내역 제목-박스, 박스 안쪽 여백, List/Row 상하·내부, BottomCTA 위 여백), spacing/16(본문 좌우, 완료 안내 안쪽 여백·세로 간격, Header·BottomCTA 좌우, Button xl 상하), spacing/24(본문 상하, 섹션 사이, Button xl 좌우), spacing/32(BottomCTA 아래 여백)
- 치수: spacing/56(Header 높이), spacing/24(icon/arrowLeft·Header 오른쪽 빈 공간), spacing/64(icon/doneMark 64×64)

모서리:
- radius/full(icon/doneMark 원), radius/0(신청 내역 박스), radius/8(Button)

글자 크기:
- font-size/subtitle(Header default 제목), font-size/heading-h4(완료 제목, 섹션 제목), font-size/body(Button 라벨), font-size/body-small(완료 설명, List/Row, 지금 요금제 안내), font-size/12(요금 안내 문구)

예외 클래스(승인됨, harness/exceptions.json):
- h-button-xl: BottomCTA 안 Button Size=xl 높이 52

## 근거
PRD 요구사항(harness/prd-map.json complete 몫):
- F4-6(신청이 끝나면 완료와 신청 내역을 보여 준다): 완료는 신규: 구독 신청 완료 안내(icon/doneMark + 완료 제목 '구독 신청이 완료됐어요' + 완료 설명 '새 요금제가 바로 적용됐어요.'), 신청 내역은 신규: 섹션 제목 '신청 내역' + 신규: 신청 내역 박스 + List/Row Type=default 6줄('신청 번호', '요금제', '월 요금', '고른 구독 서비스', '차이', '신청 일시'). 상태 '기본'과 '금액 계산'으로 담는다. 요금제·월 요금·차이는 라우트 `id`와 쿼리 `subs`로 계산(apply.md와 같은 식, BR9), 신청 번호·신청 일시는 예시 데이터 `applicationResult`.
- F4-5 연계(BR1): 완료 설명을 '새 요금제가 바로 적용됐어요.'로 두어 신청 화면의 즉시 적용 안내('신청하면 새 요금제가 바로 적용돼요.')와 맞춘다. F4-5 자체는 apply 몫이다.
- BR10 연계: 상태 '지금 쓰는 요금제'(직접 연 경우) — 완료·신청 내역을 숨기고 '지금 쓰는 요금제라 신청할 수 없어요.'를 보인다. 이 화면에는 신청 버튼이 없어 비활성 대상은 없다.

배치·컴포넌트(Figma 10027:701):
- Header Type=default, Title='신청 완료', icon/arrowLeft: 10029:496.
- 본문 스크롤 10029:502(높이 691), 본문 콘텐츠 10029:503(좌우 16·상하 24·간격 24).
- 구독 신청 완료 안내 10029:626(패딩 16, 간격 16, 가운데 정렬): icon/doneMark 10029:627(컴포넌트 4004:842, 64×64, fill/primary, radius/full), 제목 10029:630(heading/h4, text/primary), 설명 10029:631(body/small-medium, text/secondary).
- 신청 내역 10029:632(제목 10029:633 heading/h4, 간격 12), 박스 10029:634(bg/subtle, 패딩 12, 간격 0), List/Row default 10029:635·10029:638·10029:641·10029:644.
- BottomCTA Layout=single 10029:504(Button Primary xl '완료', I10029:504;4004:926).
- icon/doneMark 안 체크(4004:843)는 30×30·위치 17로 토큰에 없는 치수지만 아이콘 내부 도형이므로 SVG 좌표로 그린다(기존 Checkbox·IconArrowLeft와 같은 방식). 바깥 크기는 spacing/64. 그래서 "토큰 없음" 줄을 두지 않았다.
- screens.md '신청 완료': 구성(Header default '신청 완료', icon/doneMark, 완료 안내 2줄, List/Row 신청 내역, BottomCTA single '완료'), 이동(별도 종료 화면 없음).

PRD와 Figma가 달라 PRD를 따른 곳:
- Figma 완료 설명 '신청한 구독을 바로 이용할 수 있어요.'는 앱 구독 이용 개념이라, F4-5(새 요금제 즉시 적용, BR1)에 맞춰 '새 요금제가 바로 적용됐어요.'로 바꿨다. 제목 '구독 신청이 완료됐어요'는 Figma 그대로("구독" 계열 용어 예외).
- Figma 신청 내역 값('스탠다드', '9,900원' 등 횟수 기반 예시 요금제)은 쓰지 않고 라우트 `id`의 예시 요금제 이름·월 요금으로 바꿨다. 월 요금 값은 다른 화면과 같게 '월 {월 요금}원'으로 쓴다.
- Figma에 없는 '고른 구독 서비스'·'차이' 줄을 더했다(F4-6 "신청 내역", apply.md 신청 내용과 같은 계산, BR9).
- Figma '신청자 / 김민수' 줄(10029:647)은 고객 개인 정보이고 신청자 정보를 URL로 넘기지 않으므로(apply.md) 뺐다.
- Figma에 없는 요금 안내 문구(PRD 8장 예시 표시)와 '지금 쓰는 요금제' 상태(BR10)를 더했다.

용어:
- 화면 문구는 사용자 결정에 따라 "구독" 계열을 쓴다(완료 제목 '구독 신청이 완료됐어요'). DOMAIN.md 용어 통일("요금제 변경 신청")은 따르지 않는다. 신청 내역 줄 이름('요금제')과 완료 설명의 '새 요금제'는 대상이 요금제라 그대로 둔다.

미정 — 가정:
- 미정 — 가정: '완료' 버튼 목적지(screens.md "미정")는 가장 단순하게 요금제 목록 `/plans`(쿼리 없음)로 둔다.
- 미정 — 가정: Header 뒤로 목적지(screens.md "미정")도 `/plans`(쿼리 없음)로 둔다. 신청 화면으로 돌아가 다시 신청하지 않게 한다.
- 미정 — 가정: 신청 번호·신청 일시는 저장소가 없어 예시 데이터 `applicationResult`(`applicationNumber`, `appliedAt`)의 고정 값을 보인다. 실제 신청마다 바뀌지 않는다.
- 미정 — 가정: 신청자 줄은 두지 않는다(고객 정보를 예시 값으로도 넣지 않음, URL로 받지 않음).
- 미정 — 가정: 신청 내역 6줄 구성과 순서, 줄 이름('고른 구독 서비스', '차이')은 Figma 5줄에서 신청자를 빼고 apply.md 신청 내용 줄을 더해 정했다.
- 미정 — 가정: 신청 결과를 저장하지 않으므로 완료 뒤에도 `currentPlanId`는 'standard' 그대로다. 목록으로 돌아가면 지금 요금제 표시는 바뀌지 않는다.
- 미정 — 가정: 지금 쓰는 요금제 id로 직접 연 경우 완료를 보이지 않고 안내 문구만 보인다. 정상 흐름에서는 생기지 않는다.
- 미정 — 가정: 예시 표시 문구는 '신청 번호, 신청 일시, 요금제, 구독료는 예시 데이터입니다.'로 둔다(apply.md는 '요금제, 구독료, 약정 정보는 예시 데이터입니다.').
- 미정 — 가정: 로딩·에러·없는 `id`·신청 실패는 정의하지 않는다(PRD 9장 범위 밖).
