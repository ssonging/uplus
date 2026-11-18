# 구독 신청 (apply)

## 목적
- 상세에서 고른 요금제로 바꾸기 전에 변경 내용(지금 요금제, 새 요금제, 금액 차이)을 확인한다.
- 공시지원금 고객이 약정 기간 안에 기준 금액 미만 요금제로 바꾸면 지원금 반환 금액을 보고 동의한다.
- 신청자 정보를 입력하고 약관에 동의한 뒤 신청한다. 필수 항목이 비면 같은 화면에서 오류를 보여 준다.
- 신청하면 새 요금제가 바로 적용되고, 그달 요금·데이터는 날짜만큼 나눠 계산된다는 것을 안다.
- 지금 쓰는 요금제면 그 사실을 알리고 신청을 막는다.

## 라우트
- `/plans/[id]/apply`
- `id`: 예시 요금제 목록의 `id`(lite, slim, standard, plus, premium).
- 쿼리 `subs`: 상세에서 받은 고른 구독 서비스 id를 쉼표로 이은 값(예: `?subs=youtube,netflix`). 없거나 비어 있으면 고른 구독 0개. 4개 id(youtube, netflix, disney, tving) 밖의 값과 중복은 무시한다(detail.md와 같음).
- 로그인한 상태로 들어온다(로그인 화면 없음). 지금 요금제는 `currentPlanId`, 약정 정보는 예시 데이터 `contract`로 대신한다.
- 입력한 신청자 정보는 URL 쿼리에 넣지 않는다.

## 구성 요소
화면 구조: Header(본문 밖, 고정) → 본문 스크롤(bg/default, 좌우 spacing/16·상하 spacing/24, 섹션 간격 spacing/24, 높이 691) → BottomCTA(본문 밖, 고정, 높이 97). Figma 10027:665와 같음.

본문 섹션 순서(위에서 아래로):
1. 신청 내용 → 2. 지원금 반환 안내(조건부) → 3. 신청자 정보 → 4. 약관 동의 → 5. 신청 안내 문구 → 6. 요금 안내 문구

- Header: Type=default, Title='구독 신청'. 내부 icon/arrowLeft 표시, 오른쪽은 24×24 빈 공간(Figma 10029:483).
- icon/arrowLeft: Header 내부 왼쪽. 24×24, icon/default. 누르면 상세로(이동 참고).
- 신규: 섹션 제목: 섹션 1~4의 제목. heading/h4(font-size/heading-h4), text/primary(Figma 10029:594, 10029:610). 제목과 내용 사이: 섹션 1·2는 spacing/8(Figma 10029:593), 섹션 3·4는 spacing/12(Figma 10029:609).
- 신규: 신청 내용 박스: 섹션 1(Figma 10029:595). bg/subtle, 모서리 radius/0, 안쪽 여백 spacing/12, 줄 간격 spacing/0, 외곽선 없음. 안에 List/Row.
- List/Row: Type=default. 신청 내용 박스 안(Figma 10029:596 등). 줄 순서:
  - Label='지금 요금제', Value='{지금 요금제 이름} 월 {월 요금}원'.
  - Label='새 요금제', Value='{이 요금제 이름} 월 {월 요금}원'.
  - Label='고른 구독 서비스', Value='{고른 서비스 이름을 ", "로 이음}'(0개면 '없음').
  - Label='지금 요금제 + 구독료', Value='월 {지금 요금제 + 구독료}원'.
  - Label='새 요금제 전체 금액', Value='월 {새 전체 금액}원'.
  - Label='차이', Value=차이 문구(상태 '금액 계산' 참고).
  - Label='적용 시점', Value='신청하면 바로 적용'(Figma '이용 시작' 줄 10029:606 자리).
- 신규: 지금 요금제 안내: 신청 내용 박스 바로 아래 한 줄(섹션 1 안, 박스와 간격 spacing/8). 지금 쓰는 요금제일 때만 보임. body/small-medium(font-size/body-small), text/primary. 문구 '지금 쓰는 요금제라 신청할 수 없어요.'(detail.md와 같은 문구·모양).
- 신규: 지원금 반환 박스: 섹션 2. 신청 내용 박스와 같은 모양(bg/subtle, radius/0, 안쪽 여백 spacing/12, 줄 간격 spacing/0). 상태 '지원금 반환 안내'일 때만 보임.
- List/Row: Type=default. 지원금 반환 박스 안. 줄 순서:
  - Label='지원금', Value='{지원금}원'.
  - Label='기준 금액', Value='월 {기준 금액}원'.
  - Label='전체 약정 기간', Value='{전체 약정 기간}개월'.
  - Label='남은 약정 기간', Value='{남은 약정 기간}개월'.
  - Label='반환 금액', Value='{반환 금액}원'.
- 신규: 지원금 반환 설명: 지원금 반환 박스 아래(간격 spacing/8). body/small-medium(font-size/body-small), text/secondary. 2줄.
- 신규: 동의 체크 줄: Checkbox + 라벨(body/small-medium, font-size/body-small, text/primary), 간격 spacing/8, 세로 가운데 정렬. 줄 전체를 눌러도 Checkbox가 바뀐다(list.md 구독 서비스 줄과 같은 방식). 섹션 2(지원금 반환 동의)와 섹션 4(약관 동의)에 쓴다.
- Checkbox: 동의 체크 줄 안. State=default(동의 안 함) | active(동의함). 기본은 State=default. 24×24(Figma 4004:828).
- 신규: 동의 오류 문구: 동의 체크 줄 바로 아래(간격 spacing/4). body/small-medium(font-size/body-small), text/error. 상태 '필수 동의 누락'일 때만 보임.
- 신규: 입력 영역: 섹션 3의 항목 하나(Figma 10029:611). 라벨(body/small-medium, font-size/body-small, text/primary) + Input, 간격 spacing/4. 항목 사이 spacing/12(Figma 10029:609). 항목 순서: 이름 → 연락처 → 이메일 → 주소.
- Input: 입력 영역 안(Figma 10029:613, 10029:620). 4개(이름, 연락처, 이메일, 주소). 기본 State=default, errorMessage=false, 값은 빈 문자열 + placeholder.
  - State=default: 빈 값, 포커스 없음. placeholder 색 text/placeholder, 아래 외곽선 border/default.
  - State=focus: 입력 중. 아래 외곽선 border/focus.
  - State=filled: 값이 있음. 값 색 text/primary, 아래 외곽선 border/default.
  - State=caution: 필수 항목이 비어 신청을 눌렀을 때. 아래 외곽선 border/error, 필드 아래(간격 spacing/12) 메시지 줄 = 20×20 오류 아이콘(icon/error) + '필수 입력 정보입니다.'(body/small-medium, text/error), 아이콘-문구 간격 spacing/4(Figma 4004:812).
  - 필드: 높이 h-input, 모서리 radius/0, 아래 외곽선만, 왼쪽 여백 spacing/2·위아래 spacing/12, 글자 body(font-size/body), 안쪽 글자 묶음 좌우 spacing/2(Figma 4004:789).
  - 입력 종류(구현 참고): 이름 text, 연락처 tel, 이메일 email, 주소 text. 형식 검사는 하지 않는다.
- 신규: 신청 안내 문구: 섹션 5(Figma 10029:625 자리). body/small-medium(font-size/body-small), text/secondary. 3줄.
- 신규: 요금 안내 문구: 섹션 6. caption/small(font-size/12), text/secondary. 2줄. detail.md 요금 안내 문구와 같은 모양.
- BottomCTA: Layout=double(Figma 10029:491). bg/surface, 위 경계 border/subtle, 안쪽 여백 상 spacing/12·좌우 spacing/16·하 spacing/32, 버튼 간격 spacing/8. 보조 버튼 1 : 주요 버튼 2 비율.
- Button: BottomCTA 왼쪽. Type=Secondary, Size=xl, State=Default, Label='취소'(Figma I10029:491;4004:928).
- Button: BottomCTA 오른쪽. Type=Primary, Size=xl, State=Default, Label='신청'(Figma I10029:491;4004:929). 지금 쓰는 요금제일 때만 State=Disabled.

## 상태
- 기본(지금 쓰는 요금제가 아닌 요금제, 지원금 반환 없음, 입력 전. 예: `/plans/premium/apply`):
  - 신청 내용 7줄. 쿼리 `subs`가 없으면 '고른 구독 서비스' 값은 '없음'.
  - 지원금 반환 안내 섹션은 없다.
  - Input 4개 모두 State=default(빈 값 + placeholder), 오류 메시지 없음.
  - 약관 Checkbox State=default. 동의 오류 문구 없음.
  - Button '신청' State=Default, 누를 수 있다(누를 때 검사).
- 지금 쓰는 요금제(BR10, F3-1): `id`가 `currentPlanId`와 같을 때(예시: `/plans/standard/apply`, 주소를 직접 연 경우).
  - 신청 내용 박스 아래에 안내 문구 '지금 쓰는 요금제라 신청할 수 없어요.'를 보인다.
  - Button '신청'은 State=Disabled이고 실제로 비활성(disabled)이다. 눌러도 검사·이동하지 않는다. 라벨은 '신청' 그대로.
  - 신청 내용은 '지금 요금제'·'새 요금제'·'적용 시점' 3줄만 보이고 금액 줄('고른 구독 서비스', '지금 요금제 + 구독료', '새 요금제 전체 금액', '차이')은 숨긴다(detail.md에서 금액 비교를 숨기는 것과 같게).
  - 지원금 반환 안내 섹션은 보이지 않는다.
  - 신청자 정보·약관 동의·안내 문구·'취소'는 그대로 보인다.
- 지원금 반환 안내(F3-2, F3-3, F4-4, BR3~BR5, BR7): 아래 네 조건이 모두 맞을 때만.
  - 지금 쓰는 요금제가 아니다.
  - `contract`가 있고 `contract.type`이 '공시지원금'이다.
  - 약정 기간 안이다: `contract.remainingMonths` > 0.
  - 이 요금제 `monthlyFee` < `contract.baseAmount`(기준 금액 미만, 같으면 반환 없음).
  - 이때 섹션 2를 신청 내용 아래에 보인다: 섹션 제목 '지원금 반환 안내', List/Row 5줄, 설명 2줄, 동의 체크 줄 '지원금 반환 금액을 확인했고 동의해요 (필수)'(Checkbox State=default).
  - 반환 금액 = `subsidy` × (`remainingMonths` ÷ `totalMonths`)(BR4). 원 단위 아래는 버린다.
  - 반환 동의는 필수다. 동의하지 않으면 신청할 수 없다(상태 '필수 동의 누락').
- 선택약정 고객(F3-4, BR6): `contract.type`이 '선택약정'이면 요금제와 상관없이 지원금 반환 안내 섹션을 보이지 않고 반환 동의도 받지 않는다.
- 약정 정보 없음 / 약정 기간 끝남 / 기준 금액 이상: 지원금 반환 안내 섹션을 보이지 않는다.
- 입력 중: 포커스한 Input은 State=focus, 값이 있고 포커스가 없으면 State=filled, 빈 값이면 State=default. caution인 Input에 값을 넣으면 그 Input의 오류를 지우고 focus/filled로 바뀐다.
- 동의 체크: 체크 줄을 누르면 Checkbox State=default ↔ active. active가 되면 그 줄의 동의 오류 문구를 지운다.
- 필수 항목 미입력(F4-3, flow '필수 항목 미입력 → 오류 메시지 표시 → 정보 입력'): '신청'을 눌렀을 때 Input 4개 중 값이 비었거나 공백뿐인 것이 있으면.
  - 빈 Input마다 State=caution + 메시지 '필수 입력 정보입니다.'.
  - 이동하지 않고 같은 화면에 남는다. 첫 번째 오류 항목(본문 위에서부터)으로 포커스를 옮긴다.
- 필수 동의 누락(F4-2, F4-4): '신청'을 눌렀을 때 약관 동의 Checkbox(또는 보이는 경우 지원금 반환 동의 Checkbox)가 State=default면.
  - 해당 동의 체크 줄 아래에 '필수 동의 항목입니다.'(text/error)를 보인다.
  - 이동하지 않는다. 입력 오류와 동의 오류는 한 번에 모두 보인다.
- 신청 가능: 지금 쓰는 요금제가 아니고, Input 4개가 모두 차 있고, 필수 Checkbox가 모두 active일 때 '신청'을 누르면 신청 완료로 간다(이동 참고).
- 금액 계산(F4-1, BR9): detail.md 상태 '금액 계산'과 같은 식.
  - 지금 요금제 + 구독료 = 지금 요금제 월 요금 + 고른 구독 서비스 대표 구독료 합.
  - 새 전체 금액 = 이 요금제 월 요금 + 고른 구독 중 이 요금제에 묶이지 않은 것의 대표 구독료 합.
  - 차이 = 새 전체 금액 − 지금 요금제 + 구독료. 음수면 '지금보다 월 {차이 절댓값}원 덜 내요', 양수면 '지금보다 월 {차이}원 더 내요', 0이면 '지금과 같아요'. 세 경우 모두 같은 모양·같은 색(List/Row Value 기본, text/primary).
- 로딩·에러: 예시 데이터를 화면 안에서 쓰므로 정의하지 않는다. 신청 실패 처리는 PRD 범위 밖이다.
- 없는 `id`: 정의하지 않는다(예시 데이터의 id로만 들어온다고 가정).

## 이동
- 들어오는 곳: 요금제 상세의 Button '구독 신청' → `/plans/[id]/apply?subs=...`(지금 쓰는 요금제가 아닐 때만, detail.md 이동).
- 나가는 곳:
  - Button '취소', Header icon/arrowLeft → `/plans/[id]`(요금제 상세). 받은 `subs`가 있으면 같은 쿼리를 붙인다(`/plans/premium?subs=youtube`). 입력값은 버린다.
  - Button '신청'(상태 '신청 가능'일 때만) → `/plans/[id]/complete`. 받은 `subs`가 있으면 같은 쿼리를 붙인다. 입력한 신청자 정보는 URL에 넣지 않는다(완료 화면에 넘기는 방법은 complete 명세에서 정함).
  - 필수 항목 미입력·필수 동의 누락이면 '신청'을 눌러도 이동하지 않고 같은 화면에 남는다.
  - 지금 쓰는 요금제일 때 '신청'은 비활성이라 나가는 곳이 없다.

## 문구
기본 상태(지금 쓰는 요금제가 아닌 요금제, 지원금 반환 없음, 입력 전, 쿼리 `subs` 유무와 상관없이)에서 그대로 나오는 고정 문구:
- "구독 신청"
- "신청 내용"
- "지금 요금제"
- "새 요금제"
- "고른 구독 서비스"
- "지금 요금제 + 구독료"
- "새 요금제 전체 금액"
- "차이"
- "적용 시점"
- "신청하면 바로 적용"
- "신청자 정보"
- "이름"
- "연락처"
- "이메일"
- "주소"
- "약관 동의"
- "구독 신청 약관에 동의해요 (필수)"
- "신청 내용을 확인해 주세요."
- "신청하면 새 요금제가 바로 적용돼요."
- "이번 달 요금과 데이터는 지금 요금제와 새 요금제를 쓴 날짜만큼 나눠 계산해요."
- "모든 요금은 부가세 포함 금액입니다."
- "요금제, 구독료, 약정 정보는 예시 데이터입니다."
- "취소"
- "신청"

입력 전 placeholder(Input 안 안내값, 화면 글자가 아니라 placeholder 속성):
- 입력 전 placeholder: "이름을 입력해 주세요"
- 입력 전 placeholder: "연락처를 입력해 주세요"
- 입력 전 placeholder: "이메일을 입력해 주세요"
- 입력 전 placeholder: "주소를 입력해 주세요"

다른 상태의 문구:
- 지금 쓰는 요금제: "지금 쓰는 요금제라 신청할 수 없어요."
- 지원금 반환 안내: "지원금 반환 안내"
- 지원금 반환 안내: "지원금"
- 지원금 반환 안내: "기준 금액"
- 지원금 반환 안내: "전체 약정 기간"
- 지원금 반환 안내: "남은 약정 기간"
- 지원금 반환 안내: "반환 금액"
- 지원금 반환 안내: "기준 금액보다 낮은 요금제로 바꾸면 받은 지원금 일부를 돌려줘야 해요."
- 지원금 반환 안내: "반환 금액 = 지원금 × (남은 약정 기간 ÷ 전체 약정 기간)"
- 지원금 반환 안내: "지원금 반환 금액을 확인했고 동의해요 (필수)"
- 필수 항목 미입력: "필수 입력 정보입니다."
- 필수 동의 누락: "필수 동의 항목입니다."

값이 들어가는 문구(틀):
- 지금 요금제·새 요금제 값: "{요금제 이름} 월 {월 요금}원"
- 고른 구독 서비스 값: "{이름}, {이름}" / 0개면 "없음"
- 금액 값: "월 {금액}원"
- 차이(덜 낼 때): "지금보다 월 {차이}원 덜 내요"
- 차이(더 낼 때): "지금보다 월 {차이}원 더 내요"
- 차이(같을 때): "지금과 같아요"
- 지원금·반환 금액 값: "{금액}원"
- 기준 금액 값: "월 {기준 금액}원"
- 약정 기간 값: "{n}개월"

## 예시 데이터
모두 **예시**다. 실제 값은 미정(PRD 열린 질문 2~3, DOMAIN 열린 질문 1~4)이며 화면 작업 때 확인받는다. 고객 개인 정보(이름·연락처·이메일·주소 등)는 예시 값으로도 넣지 않는다. Input은 빈 값 + placeholder로 둔다(Figma 표시값은 쓰지 않음).

- 요금제 목록 (예시): `plans` — 기존 필드 `id`, `name`, `monthlyFee`(원), `dataAmount`, `bundledSubscriptions`. 이 화면은 라우트 `id`와 같은 요금제 1개를 쓴다.
- 지금 요금제 (예시): 기존 `currentPlanId`(예시 값 'standard').
- 구독 서비스·대표 구독료 (예시): 기존 `subscriptions` — `id`, `name`, `representativeFee`(원).
- 고른 구독 서비스: 예시 데이터가 아니라 쿼리 `subs`로 받는다.
- **약정 정보 (예시) — `src/data/example.ts`에 아직 없음, 구현 단계에서 추가:** `contract`(없으면 `null`, DOMAIN 6장 "약정 정보 0..1").
  - `type`: '공시지원금' | '선택약정' (약정 유형)
  - `subsidy`: 지원금 금액(원)
  - `totalMonths`: 전체 약정 기간(개월)
  - `remainingMonths`: 남은 약정 기간(개월)
  - `baseAmount`: 기준 금액(원, 월 요금 기준, BR5)
  - 예시 값: `{ type: '공시지원금', subsidy: 300000, totalMonths: 6, remainingMonths: 3, baseAmount: 55000 }` (모두 예시).
- 신청 입력 항목 (예시): 이름, 연락처, 이메일, 주소. 모두 필수, 기본값 빈 문자열. 저장 필드 이름(구현 참고): `name`, `phone`, `email`, `address`.
- 약관 (예시): 필수 1개 '구독 신청 약관에 동의해요 (필수)'. 약관 본문은 없다.
- 상태 확인용 예시 조합(예시 값 기준):
  - 기본(반환 없음): `/plans/premium/apply`, `/plans/plus/apply?subs=netflix`.
  - 지금 쓰는 요금제: `/plans/standard/apply`.
  - 지원금 반환 안내: `/plans/lite/apply`, `/plans/slim/apply`(월 요금 < 기준 금액 55,000원 → 반환 금액 300,000 × 3 ÷ 6 = 150,000원).
  - 선택약정: `contract.type`을 '선택약정'으로 바꾸면 `/plans/lite/apply`에도 반환 안내가 없다.

## 토큰
색(semantic):
- bg/default: 화면·본문 스크롤 배경
- bg/surface: Header, BottomCTA 배경
- bg/subtle: 신청 내용 박스·지원금 반환 박스 배경(Figma 10029:595)
- text/primary: Header 제목, 섹션 제목, List/Row Value, 입력 영역 라벨, Input filled 값, 동의 체크 줄 라벨, 지금 요금제 안내, Button Secondary 라벨
- text/secondary: List/Row Label, 지원금 반환 설명, 신청 안내 문구, 요금 안내 문구
- text/placeholder: Input default·focus·caution placeholder
- text/error: Input caution 메시지, 동의 오류 문구
- text/on-dark: Button Primary 라벨
- icon/default: icon/arrowLeft
- icon/error: Input caution 메시지 아이콘
- border/default: Input default·filled 아래 외곽선, Button Secondary 외곽선
- border/focus: Input focus 아래 외곽선
- border/error: Input caution 아래 외곽선
- border/subtle: List/Row 구분선, BottomCTA 위 경계
- surface/default: Button Secondary 배경
- fill/primary: Button Primary Default 배경, Checkbox active
- fill/disabled: Button Primary Disabled 배경(지금 쓰는 요금제 상태). 라벨 색·굵기는 Figma Button State=Disabled 변형 값을 그대로 쓴다.
- Checkbox default·active 도형 색: Figma Checkbox 변형(4004:829, 4004:831)의 바인딩을 그대로 쓴다(기존 Checkbox 컴포넌트 재사용).

간격:
- spacing/0(박스 줄 간격, Input 오른쪽 여백), spacing/2(Input 필드 왼쪽·글자 묶음 좌우), spacing/4(입력 라벨-Input, Input 메시지 아이콘-문구, 동의 체크 줄-오류 문구, List/Row 좌우, Header 상하), spacing/8(섹션 1·2 제목-내용, 박스-안내/설명, Checkbox-라벨, Header 내부, BottomCTA 버튼 사이), spacing/10(Input 필드 내부 간격), spacing/12(박스 안쪽 여백, 섹션 3·4 제목-내용·항목 사이, Input 필드 상하·필드-메시지, List/Row 상하·내부, BottomCTA 위 여백), spacing/16(본문 좌우, Header·BottomCTA 좌우, Button xl 상하), spacing/24(본문 상하, 섹션 사이, Button xl 좌우), spacing/32(BottomCTA 아래 여백)
- 치수: spacing/56(Header 높이), spacing/24(icon/arrowLeft·Header 오른쪽 빈 공간·Checkbox), spacing/20(Input caution 메시지 아이콘)

모서리:
- radius/0(신청 내용·지원금 반환 박스, Input 필드), radius/8(Button)

글자 크기:
- font-size/subtitle(Header default 제목), font-size/heading-h4(섹션 제목), font-size/body(Input 값·placeholder, Button 라벨), font-size/body-small(List/Row, 입력 라벨, Input 메시지, 동의 체크 줄, 동의 오류 문구, 지원금 반환 설명, 신청 안내 문구, 지금 요금제 안내), font-size/12(요금 안내 문구)

예외 클래스(승인됨, harness/exceptions.json):
- h-button-xl: BottomCTA 안 Button Size=xl 높이 52
- h-input: Input 필드 높이 58

- border-selected: Input 필드 아래 외곽선 1.5px (사용자 승인 2026-11-18, exceptions.json의 용도 설명보다 넓게 씀)

## 근거
PRD 요구사항(harness/prd-map.json apply 몫):
- F3-1(지금 쓰는 요금제 신청 막기, BR10): 상태 '지금 쓰는 요금제' — 신규: 지금 요금제 안내 '지금 쓰는 요금제라 신청할 수 없어요.' + BottomCTA Button '신청' State=Disabled(실제 disabled). 상세에서는 이미 막지만 주소를 직접 열 수 있어 이 화면에서도 막는다. 문구·모양은 detail.md와 같다.
- F3-2(공시지원금 고객 + 약정 기간 안 + 기준 금액 미만이면 반환 금액 보이고 동의 받기, BR3·BR5·BR7): 상태 '지원금 반환 안내' — 섹션 2(신규: 섹션 제목 '지원금 반환 안내' + 신규: 지원금 반환 박스 + List/Row Type=default 5줄 + 신규: 지원금 반환 설명 + 신규: 동의 체크 줄/Checkbox). 네 조건이 모두 맞을 때만 보인다.
- F3-3(반환 금액 식, BR4): List/Row '반환 금액' 값 = `subsidy` × (`remainingMonths` ÷ `totalMonths`). 계산에 쓰는 값(지원금, 전체·남은 약정 기간, 기준 금액)과 식 문구를 같이 보여 투명하게 한다(F2-4 원칙).
- F3-4(선택약정 고객에게 반환 안내 안 함, BR6): 상태 '선택약정 고객' — 섹션 2를 보이지 않고 반환 동의도 받지 않는다.
- F4-1(신청 전 변경 내용 확인): 신규: 신청 내용 박스 + List/Row Type=default('지금 요금제', '새 요금제', '고른 구독 서비스', '지금 요금제 + 구독료', '새 요금제 전체 금액', '차이', '적용 시점'). 상태 '금액 계산'은 detail.md와 같은 식. 고른 구독은 쿼리 `subs`로 받는다.
- F4-2(약관 동의): 섹션 4 '약관 동의' — 신규: 동의 체크 줄 + Checkbox State=default|active, 필수 1개. 상태 '필수 동의 누락'.
- F4-3(필요한 정보 입력, 항목은 예시): 섹션 3 '신청자 정보' — 신규: 입력 영역 + Input 4개(이름·연락처·이메일·주소), State=default|focus|filled|caution. 상태 '입력 중', '필수 항목 미입력'(Input State=caution + '필수 입력 정보입니다.'). screens.md '구독 신청' 상태·에러, flow.png('이름 / 연락처 / 주소 입력' → '약관 동의 체크' → '입력 완료 여부 확인' → 미입력이면 '오류 메시지 표시' 후 입력으로 복귀).
- F4-4(지원금 반환이 생기면 반환 동의): 섹션 2의 동의 체크 줄 '지원금 반환 금액을 확인했고 동의해요 (필수)'. 상태 '필수 동의 누락' — 동의하지 않으면 '신청'을 눌러도 이동하지 않는다(BR7 "동의하면 변경을 진행").
- F4-5(즉시 적용, 그달 요금·데이터 날짜만큼 나눠 계산, BR1·BR2): List/Row '적용 시점' = '신청하면 바로 적용' + 신규: 신청 안내 문구 '신청하면 새 요금제가 바로 적용돼요.' / '이번 달 요금과 데이터는 지금 요금제와 새 요금제를 쓴 날짜만큼 나눠 계산해요.'

배치·컴포넌트(Figma 10027:665):
- Header Type=default, Title='구독 신청', icon/arrowLeft: 10029:483.
- 본문 스크롤 10029:489(높이 691), 본문 콘텐츠 10029:490(좌우 16·상하 24·간격 24).
- 신청 내용 10029:593(제목 heading/h4, 간격 8), 박스 10029:595(bg/subtle, 패딩 12, 간격 0, List/Row default).
- 신청자 정보 10029:609(제목 heading/h4, 간격 12), 입력 영역 10029:611·10029:618(라벨 body/small-medium text/primary + Input, 간격 4).
- Input 필드 아래 외곽선 1.5px(Figma 4004:789·4004:805·4004:813)은 승인 예외 `border-selected`로 쓴다(사용자 승인 2026-11-18, exceptions.json의 용도 설명 "Card/Plan · OptionItem"보다 넓게 씀).
- Input 변형 4004:787(default 4004:788, focus 4004:796, filled 4004:804, caution 4004:812 — 메시지 '필수 입력 정보입니다.'), Checkbox 4004:828(default 4004:829, active 4004:831).
- 안내 문구 10029:625(body/small-medium, text/secondary, 본문 맨 아래).
- BottomCTA Layout=double 10029:491(Button Secondary xl '취소' 1 : Button Primary xl '신청' 2).
- screens.md '구독 신청': 정보 입력·약관 동의·검증·오류 표시는 별도 화면 없이 이 화면 안에서 처리, 연락처·주소 Input과 약관 Checkbox는 기존 컴포넌트 재사용.

PRD와 Figma가 달라 PRD를 따른 곳:
- Figma 신청 내용('요금제 / 스탠다드', '월 요금 / 9,900원 (부가세 포함)', '제공 혜택 / 월 30회 이용', 보조 문구 '기본 기능 + 이용 기록')은 횟수 기반 예시라 쓰지 않았다. 같은 박스·List/Row 모양에 F4-1 변경 내용(지금 요금제, 새 요금제, 금액 차이)을 넣었다. 보조 문구 줄은 없앴다.
- Figma '이용 시작 / 신청 완료 후 바로 이용'은 '적용 시점 / 신청하면 바로 적용'으로 바꿨다(F4-5, BR1).
- Figma 안내 문구 2번째 줄 '구독은 신청일부터 매월 자동 갱신됩니다.'는 PRD에 없는 정기 구독 갱신 개념이라 빼고, F4-5 안내 2줄로 바꿨다. 첫 줄 '신청 내용을 확인해 주세요.'는 Figma 그대로.
- Figma Input 표시값(예시 이름·이메일, State=filled)은 고객 정보라 쓰지 않고 빈 값 + placeholder(State=default)로 바꿨다.
- Figma에 없는 연락처·주소 Input(flow.png), 약관 동의 Checkbox(F4-2), 지원금 반환 안내·동의(F3-2~F3-4, F4-4), 지금 요금제 안내·버튼 비활성(F3-1), 요금 안내 문구(PRD 8장 예시 표시)를 추가했다.

용어:
- 화면 문구는 사용자 결정에 따라 "구독" 계열을 쓴다(Header '구독 신청', 약관 '구독 신청 약관에 동의해요 (필수)'). DOMAIN.md 용어 통일("요금제 변경 신청")은 따르지 않는다. 신청 내용 줄 이름('새 요금제' 등)은 요금제 대상이라 그대로 '요금제'로 부른다.

미정 — 가정:
- 미정 — 가정: '취소'와 Header 뒤로의 목적지(screens.md "미정")는 요금제 상세(`/plans/[id]`, 같은 `subs` 쿼리)로 둔다. 입력값은 저장하지 않는다.
- 미정 — 가정: 신청 완료로 갈 때 `subs` 쿼리만 붙이고 신청자 정보는 URL에 넣지 않는다. 완료 화면이 신청 내역을 받는 방법은 complete 명세에서 정한다.
- 미정 — 가정(PRD 열린 질문 3): 입력 항목은 이름·연락처·이메일·주소 4개(Figma 이름·이메일 + flow 연락처·주소), 모두 필수, 빈 값/공백만 검사하고 형식 검사는 하지 않는다. screens.md는 이메일 필수 여부를 정하지 않았으나 가장 단순하게 모두 필수로 둔다.
- 미정 — 가정: placeholder 문구 4개('…을/를 입력해 주세요')와 입력 영역 순서(이름 → 연락처 → 이메일 → 주소)는 자료에 없어 정했다.
- 미정 — 가정: 약관은 필수 1개('구독 신청 약관에 동의해요 (필수)'), 약관 본문 보기·전체 동의·선택 약관은 없다. 문구는 자료에 없어 만들었다.
- 미정 — 가정: 검사는 '신청'을 누를 때 한 번에 하고, 오류를 모두 보인 뒤 첫 오류 항목으로 포커스를 옮긴다. '신청' 버튼은 입력 전에도 State=Default(지금 쓰는 요금제만 Disabled).
- 미정 — 가정: Checkbox에는 오류 변형이 없어(design.md 4장) 동의 누락은 줄 아래 text/error 문구 '필수 동의 항목입니다.'로 보인다(screens.md "약관 오류 표현은 미정"). 문구는 자료에 없어 만들었다.
- 미정 — 가정: Input caution 메시지 '필수 입력 정보입니다.'는 Figma Input caution(4004:819) 문구를 그대로 쓴다.
- 미정 — 가정: 약정 정보 필드(`contract`: `type`, `subsidy`, `totalMonths`, `remainingMonths`, `baseAmount`)와 예시 값은 DOMAIN 6장 약정 정보 속성에 맞춰 정했다. example.ts에 없어 구현 단계에서 추가한다.
- 미정 — 가정: "약정 기간 안"은 `remainingMonths` > 0, "기준 금액 미만"은 `monthlyFee` < `baseAmount`(같으면 반환 없음), 반환 금액은 원 단위 아래 버림으로 둔다.
- 미정 — 가정: 지원금 반환 안내 위치는 신청 내용 바로 아래(섹션 2). 설명 2줄 문구는 자료에 없어 만들었다.
- 미정 — 가정: 지금 쓰는 요금제 상태에서는 신청 내용의 금액 줄과 지원금 반환 안내를 숨기고, 입력·약관 영역은 그대로 두되 '신청'만 비활성으로 막는다.
- 미정 — 가정: 인앱 구독 해지 안내(F3-5)는 상세 화면 몫이라 이 화면에서 다시 보이지 않는다.
- 미정 — 가정: 예시 표시 문구는 '요금제, 구독료, 약정 정보는 예시 데이터입니다.'로 둔다(detail.md는 '요금제와 구독료는 예시 데이터입니다.').
- 미정 — 가정: 로딩·에러·없는 `id`·신청 실패는 정의하지 않는다(PRD 9장 범위 밖).
