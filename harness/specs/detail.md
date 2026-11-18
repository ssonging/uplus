# 요금제 상세 (detail)

## 목적
- 목록에서 고른 요금제 1개의 월 요금, 데이터 양, 묶인 구독 서비스를 확인한다.
- 목록에서 고른 구독 서비스로 "지금 요금제 + 구독료"와 이 요금제의 전체 금액 차이를 확인한다.
- 고른 구독 서비스가 이 요금제에 묶여 있으면 기존 인앱 구독을 직접 해지해야 한다는 안내를 본다.
- 지금 쓰는 요금제면 그 사실을 알리고 신청을 막는다. 아니면 '구독 신청'으로 신청 화면에 간다.

## 라우트
- `/plans/[id]`
- `id`: 예시 요금제 목록의 `id`(lite, slim, standard, plus, premium).
- 쿼리 `subs`: 목록에서 고른 구독 서비스 id를 쉼표로 이은 값(예: `?subs=youtube,netflix`). 없거나 비어 있으면 고른 구독 0개.
  - 4개 id(youtube, netflix, disney, tving) 밖의 값과 중복은 무시한다.
- 로그인한 상태로 들어온다(로그인 화면 없음). 지금 요금제는 예시 데이터 `currentPlanId`로 대신한다.

## 구성 요소
화면 구조: Header(본문 밖, 고정) → 본문 스크롤(bg/default, 좌우 spacing/16·상하 spacing/24, 섹션 간격 spacing/24, 높이 691) → BottomCTA(본문 밖, 고정, 높이 97). Figma 10027:636과 같음.

본문 섹션 순서(위에서 아래로):
1. 선택 요금제 → 2. 제공 혜택 → 3. 금액 비교 → 4. 구독 안내(조건부) → 5. 요금 안내 문구

- Header: Type=default, Title='요금제 상세'. 내부 icon/arrowLeft 표시, 오른쪽은 24×24 빈 공간(Figma 10029:470).
- icon/arrowLeft: Header 내부 왼쪽. 24×24, icon/default. 누르면 뒤로(이동 참고).
- 신규: 선택 요금제 박스: 섹션 1(Figma 10029:566). Card/Plan 인스턴스가 아닌 일반 프레임. bg/subtle, 모서리 radius/0, 안쪽 여백 spacing/16, 세로 간격 spacing/8, 외곽선 없음. 위에서 아래로:
  - (지금 쓰는 요금제일 때만) Tag.
  - 요금제 이름: subtitle/bold(font-size/subtitle), text/primary.
  - 월 요금 '월 {월 요금}원': heading/h3(font-size/heading-h3), text/primary.
  - 설명 '부가세 포함': body/small-medium(font-size/body-small), text/secondary.
  - (지금 쓰는 요금제일 때만) 신규: 지금 요금제 안내.
- Tag: 선택 요금제 박스 맨 위. 지금 쓰는 요금제일 때만 보임. 라벨 '지금 요금제'. border/subtle 배경, caption/bold, text/secondary, radius/999, 높이 h-tag(목록 화면 Card/Plan badge와 같은 모양).
- 신규: 지금 요금제 안내: 선택 요금제 박스 맨 아래 한 줄. 지금 쓰는 요금제일 때만 보임. body/small-medium(font-size/body-small), text/primary. 문구 '지금 쓰는 요금제라 신청할 수 없어요.'
- 신규: 섹션 제목: 섹션 2~4의 제목. heading/h4(font-size/heading-h4), text/primary. 제목과 내용 사이 spacing/8(Figma 10029:571, 10029:585).
- List/Row: Type=check, Value=''. 섹션 2 '제공 혜택'(Figma 10029:572 등). 줄 순서:
  - Label='데이터 {데이터 양}'(숫자면 '{n}GB', 아니면 '무제한').
  - 묶인 구독 서비스마다 한 줄씩 Label='{서비스 이름} 구독 포함'(예시 구독 서비스 줄 순서: 유튜브, 넷플릭스, 디즈니플러스, 티빙).
  - 묶인 구독이 없으면 Label='묶인 구독 없음' 한 줄.
- List/Row: Type=default. 섹션 3 '금액 비교'(Figma 10029:586 자리). 6줄:
  - Label='고른 구독 서비스', Value='{고른 서비스 이름을 ", "로 이음}'(0개면 '없음').
  - Label='지금 요금제 + 구독료', Value='월 {지금 요금제 + 구독료}원'.
  - Label='이 요금제 월 요금', Value='월 {월 요금}원'.
  - Label='따로 내는 구독료', Value='월 {고른 구독 중 이 요금제에 묶이지 않은 것의 대표 구독료 합}원'.
  - Label='이 요금제 전체 금액', Value='월 {새 전체 금액}원'.
  - Label='차이', Value=차이 문구(상태 '금액 계산' 참고).
- 신규: 금액 비교 설명: 섹션 3 맨 아래(Figma 10029:592 자리). body/small-medium(font-size/body-small), text/secondary. 2줄.
- List/Row: Type=default. 섹션 4 '구독 안내'(조건부) 1줄. Label='이 요금제에 묶인 구독', Value='{겹치는 서비스 이름을 ", "로 이음}'.
- 신규: 인앱 구독 해지 안내: 섹션 4 맨 아래(Figma 10029:592와 같은 모양). body/small-medium(font-size/body-small), text/secondary. 2줄.
- 신규: 요금 안내 문구: 섹션 5. caption/small(font-size/12), text/secondary. 2줄. 목록 화면 요금 안내 문구와 같은 모양.
- BottomCTA: Layout=double(Figma 10029:478). bg/surface, 위 경계 border/subtle, 안쪽 여백 상 spacing/12·좌우 spacing/16·하 spacing/32, 버튼 간격 spacing/8. 보조 버튼 1 : 주요 버튼 2 비율.
- Button: BottomCTA 왼쪽. Type=Secondary, Size=xl, State=Default, Label='뒤로'(Figma I10029:478;4004:928).
- Button: BottomCTA 오른쪽. Type=Primary, Size=xl, State=Default, Label='구독 신청'(Figma I10029:478;4004:929). 지금 쓰는 요금제일 때만 State=Disabled.

## 상태
- 기본(지금 쓰는 요금제가 아닌 요금제, 예: `/plans/premium`):
  - 선택 요금제 박스에 이름·월 요금·'부가세 포함'. Tag와 지금 요금제 안내는 없다.
  - 제공 혜택에 데이터 양 줄과 묶인 구독 줄(없으면 '묶인 구독 없음').
  - 금액 비교 6줄과 설명 2줄. 쿼리 `subs`가 없으면 '고른 구독 서비스' 값은 '없음', 구독료 값은 '월 0원'.
  - 구독 안내 섹션은 겹치는 구독이 있을 때만 보인다(아래 '인앱 구독 해지 안내').
  - Button '구독 신청' State=Default, 누를 수 있다.
- 지금 쓰는 요금제(BR10, F3-1): `id`가 `currentPlanId`와 같을 때(예시: `/plans/standard`).
  - 선택 요금제 박스 맨 위에 Tag '지금 요금제', 맨 아래에 안내 문구 '지금 쓰는 요금제라 신청할 수 없어요.'를 보인다.
  - Button '구독 신청'은 State=Disabled이고 실제로 비활성(disabled)이다. 눌러도 이동하지 않는다. 라벨은 '구독 신청' 그대로.
  - 금액 비교 섹션(3)과 구독 안내 섹션(4)은 보이지 않는다(목록 화면에서 지금 요금제 카드에 금액 차이 줄을 보이지 않는 것과 같게).
  - 제공 혜택·요금 안내 문구·'뒤로'는 그대로 보인다.
- 인앱 구독 해지 안내(F3-5, BR8, BR11): 지금 쓰는 요금제가 아니고, 쿼리 `subs`로 받은 구독 서비스 중 이 요금제의 `bundledSubscriptions`에 들어 있는 것이 1개 이상일 때.
  - 섹션 4 '구독 안내'를 금액 비교 아래에 보인다: List/Row '이 요금제에 묶인 구독' = 겹치는 서비스 이름, 그 아래 해지 안내 2줄.
  - 겹치는 것이 0개면 섹션 4 전체를 숨긴다(BR11: 포함될 때만 안내).
  - 안내만 한다. 해지 버튼·동의 체크는 없고 '구독 신청'은 막지 않는다(PRD 9장: 해지 대행 범위 밖).
- 금액 계산(F2-3, BR9): 목록 화면과 같은 식.
  - 지금 요금제 + 구독료 = 지금 요금제 월 요금 + 고른 구독 서비스 대표 구독료 합.
  - 따로 내는 구독료 = 고른 구독 중 이 요금제에 묶이지 않은 것의 대표 구독료 합.
  - 새 전체 금액 = 이 요금제 월 요금 + 따로 내는 구독료.
  - 차이 = 새 전체 금액 − 지금 요금제 + 구독료. 음수면 '지금보다 월 {차이 절댓값}원 덜 내요', 양수면 '지금보다 월 {차이}원 더 내요', 0이면 '지금과 같아요'. 세 경우 모두 같은 모양·같은 색(text/primary, List/Row Value 기본)으로 보인다(F2-4).
- 로딩·에러: 예시 데이터를 화면 안에서 쓰므로 정의하지 않는다(PRD 범위 밖: 변경 신청 실패 처리).
- 없는 `id`: 정의하지 않는다(예시 데이터의 id로만 들어온다고 가정).

## 이동
- 들어오는 곳: 요금제 목록 Card/Plan 안 '요금제 보기' → `/plans/[id]?subs=...` / 구독 신청 화면의 뒤로(apply 명세에서 정함).
- 나가는 곳:
  - Button '뒤로', Header icon/arrowLeft → `/plans`. 받은 `subs`가 있으면 같은 쿼리를 붙여(`/plans?subs=youtube,netflix`) 목록이 선택을 되살리게 한다.
  - Button '구독 신청'(지금 쓰는 요금제가 아닐 때만) → `/plans/[id]/apply`. 받은 `subs`가 있으면 같은 쿼리를 붙인다(신청 화면의 변경 내용 확인 F4-1에 필요).
  - 지금 쓰는 요금제일 때 '구독 신청'은 비활성이라 나가는 곳이 없다.

## 문구
기본 상태(지금 쓰는 요금제가 아닌 요금제, 쿼리 `subs` 유무와 상관없이)에서 그대로 나오는 고정 문구:
- "요금제 상세"
- "부가세 포함"
- "제공 혜택"
- "금액 비교"
- "고른 구독 서비스"
- "지금 요금제 + 구독료"
- "이 요금제 월 요금"
- "따로 내는 구독료"
- "이 요금제 전체 금액"
- "차이"
- "구독료는 고른 구독 서비스의 대표 구독료로 계산해요."
- "이 요금제에 묶인 구독은 따로 내는 구독료에서 빼요."
- "모든 요금은 부가세 포함 금액입니다."
- "요금제와 구독료는 예시 데이터입니다."
- "뒤로"
- "구독 신청"

다른 상태의 문구:
- 지금 쓰는 요금제: "지금 요금제"
- 지금 쓰는 요금제: "지금 쓰는 요금제라 신청할 수 없어요."
- 인앱 구독 해지 안내: "구독 안내"
- 인앱 구독 해지 안내: "이 요금제에 묶인 구독"
- 인앱 구독 해지 안내: "인앱에서 따로 결제하고 있다면 기존 구독을 직접 해지해 주세요."
- 인앱 구독 해지 안내: "해지하지 않으면 구독료가 두 번 나갈 수 있어요."

값이 들어가는 문구(틀):
- 월 요금: "월 {월 요금}원"
- 데이터 줄: "데이터 {데이터 양}"
- 묶인 구독 줄: "{서비스 이름} 구독 포함"
- 묶인 구독 없음 줄: "묶인 구독 없음"
- 고른 구독 서비스 값: "{이름}, {이름}" / 0개면 "없음"
- 금액 값: "월 {금액}원"
- 차이(덜 낼 때): "지금보다 월 {차이}원 덜 내요"
- 차이(더 낼 때): "지금보다 월 {차이}원 더 내요"
- 차이(같을 때): "지금과 같아요"
- 이 요금제에 묶인 구독 값: "{이름}, {이름}"

## 예시 데이터
모두 **예시**다. 실제 값은 미정(PRD 열린 질문 2, DOMAIN 열린 질문 1~2)이며 화면 작업 때 확인받는다. 고객 개인 정보(이름·번호 등)는 넣지 않는다. 목록 화면과 같은 `src/data/example.ts`를 쓰고 새 필드를 만들지 않는다.

- 요금제 목록 (예시): `plans` — 필드 `id`, `name`, `monthlyFee`(원), `dataAmount`(GB 숫자 또는 '무제한'), `bundledSubscriptions`(구독 서비스 id 배열). 이 화면은 라우트 `id`와 같은 요금제 1개를 쓴다.
- 지금 요금제 (예시): `currentPlanId`(예시 값 'standard'). 지금 쓰는 요금제 상태 판정과 '지금 요금제 + 구독료' 계산에 쓴다.
- 구독 서비스·대표 구독료 (예시): `subscriptions` — 필드 `id`(youtube, netflix, disney, tving), `name`, `representativeFee`(원). 이 4개뿐(BR12).
- 고른 구독 서비스: 예시 데이터가 아니라 쿼리 `subs`로 받는다.
- 상태 확인용 예시 조합(예시 값 기준):
  - 기본: `/plans/premium`(묶인 구독 유튜브·디즈니플러스), `/plans/lite`(묶인 구독 없음).
  - 지금 쓰는 요금제: `/plans/standard`.
  - 인앱 구독 해지 안내: `/plans/plus?subs=netflix`(넷플릭스 겹침), `/plans/premium?subs=youtube,netflix`(유튜브 겹침).

## 토큰
색(semantic):
- bg/default: 화면·본문 스크롤 배경
- bg/surface: Header, BottomCTA 배경
- bg/subtle: 선택 요금제 박스 배경(Figma 10029:566)
- text/primary: Header 제목, 요금제 이름·월 요금, 섹션 제목, List/Row check Label, List/Row default Value, 지금 요금제 안내, Button Secondary 라벨
- text/secondary: '부가세 포함', List/Row default Label, 금액 비교 설명, 인앱 구독 해지 안내, 요금 안내 문구, Tag 라벨
- text/accent: List/Row check Value(빈 문자열이라 보이지 않음, 컴포넌트 바인딩 유지)
- text/on-dark: Button Primary 라벨
- icon/default: icon/arrowLeft
- icon/accent: List/Row check 불릿
- border/subtle: List/Row 구분선, BottomCTA 위 경계, Tag 배경
- border/default: Button Secondary 외곽선
- surface/default: Button Secondary 배경
- fill/primary: Button Primary Default 배경
- fill/disabled: Button Primary Disabled 배경(지금 쓰는 요금제 상태). 라벨 색·굵기는 Figma Button State=Disabled 변형 값을 그대로 쓴다.

간격:
- spacing/0, spacing/4(List/Row 좌우, Header 상하), spacing/8(선택 요금제 박스 내부, 섹션 제목-내용·줄 사이, Header 내부, BottomCTA 버튼 사이), spacing/12(List/Row 상하·내부, BottomCTA 위 여백), spacing/16(본문 좌우, 선택 요금제 박스 안쪽 여백, Header·BottomCTA 좌우, Button xl 상하), spacing/24(본문 상하, 섹션 사이, Button xl 좌우), spacing/32(BottomCTA 아래 여백)
- 치수: spacing/56(Header 높이), spacing/24(icon/arrowLeft·Header 오른쪽 빈 공간), spacing/6(List/Row check 불릿)

모서리:
- radius/0(선택 요금제 박스), radius/8(Button), radius/999(Tag)

글자 크기:
- font-size/subtitle(Header default 제목, 요금제 이름), font-size/heading-h3(선택 요금제 월 요금), font-size/heading-h4(섹션 제목), font-size/body(Button 라벨), font-size/body-small(설명, List/Row, 금액 비교 설명, 인앱 구독 해지 안내, 지금 요금제 안내), font-size/caption(Tag), font-size/12(요금 안내 문구)

예외 클래스(승인됨, harness/exceptions.json):
- h-button-xl: BottomCTA 안 Button Size=xl 높이 52
- h-tag: Tag 높이 26

## 근거
PRD 요구사항(harness/prd-map.json detail 몫):
- F1-3(월 요금·데이터 양·묶인 구독 보기): 신규: 선택 요금제 박스(이름, '월 {월 요금}원')와 List/Row Type=check '제공 혜택'(데이터 양 줄, '{서비스} 구독 포함' 줄 / '묶인 구독 없음'). Figma 제공 혜택 줄('월 30회 이용', '기본 기능 제공', '이용 기록 확인')은 횟수 기반 예시라 PRD를 따라 데이터 양·묶인 구독으로 바꿨다. List/Row 변형(Type=check, Value='')은 Figma 10029:572 그대로. 월 요금 비교는 목록 화면이 맡고, 상세는 금액 비교 섹션에 이 요금제 월 요금을 보인다.
- F1-4(지금 요금제 구분, BR10): 상태 '지금 쓰는 요금제' — 선택 요금제 박스 맨 위 Tag '지금 요금제'(목록 화면 Card/Plan badge와 같은 라벨·모양).
- F2-3(전체 금액 차이 보기): List/Row Type=default '금액 비교' 6줄(차이 줄 포함), 상태 '금액 계산'. 계산식은 목록 화면 명세(list.md 상태 '금액 차이 줄 계산')와 같다.
- F2-4(요금 차이·혜택 투명하게): 금액 비교에 계산에 쓰는 값(고른 구독 서비스, 지금 요금제 + 구독료, 이 요금제 월 요금, 따로 내는 구독료, 전체 금액)을 모두 보이고, 덜 내요·더 내요·같아요를 같은 모양으로 보인다. 신규: 금액 비교 설명 2줄로 계산 방법을, 신규: 요금 안내 문구로 '예시 데이터'임을 알린다(PRD 8장).
- F3-1(지금 쓰는 요금제 신청 막기, BR10): 상태 '지금 쓰는 요금제' — 신규: 지금 요금제 안내 '지금 쓰는 요금제라 신청할 수 없어요.' + BottomCTA Button '구독 신청' State=Disabled(실제 disabled).
- F3-5(인앱 구독 해지 안내, BR8·BR11): 상태 '인앱 구독 해지 안내' — 섹션 4 '구독 안내'(신규: 섹션 제목 + List/Row Type=default '이 요금제에 묶인 구독' + 신규: 인앱 구독 해지 안내 2줄). 고른 구독이 이 요금제에 묶여 있을 때만 보인다(BR11). Figma '구독 안내' 섹션(10029:584)의 모양(제목 + List/Row default + 안내 문구)을 그대로 쓰고 내용만 PRD로 바꿨다.

배치·컴포넌트(Figma 10027:636):
- Header Type=default, Title='요금제 상세', icon/arrowLeft: 10029:470.
- 본문 스크롤 10029:476(높이 691), 본문 콘텐츠 10029:477(좌우 16·상하 24·간격 24).
- 선택 요금제 10029:566(bg/subtle, 패딩 16, 간격 8, 모서리 없음; 이름 subtitle/bold, 월 요금 heading/h3, 설명 body/small-medium).
- 제공 혜택 10029:570(제목 heading/h4, 간격 8, List/Row check ×3).
- 구독 안내 10029:584(제목 heading/h4, List/Row default ×2, 안내 문구 10029:592).
- BottomCTA Layout=double 10029:478(Button Secondary xl '뒤로' 1 : Button Primary xl '구독 신청' 2).
- screens.md '요금제 상세' 섹션: 구성(선택 요금제는 Card/Plan이 아닌 일반 프레임), 이동('뒤로' → 목록, '구독 신청' → 구독 신청).

PRD와 Figma가 달라 PRD를 따른 곳:
- Figma 예시 값('스탠다드 / 월 9,900원', '월 30회 이용' 등 횟수 기반)은 쓰지 않고 예시 데이터의 요금제(월 요금·데이터 양·묶인 구독)로 바꿨다(F1-3).
- 선택 요금제 설명 '부가세 포함 · 매월 정기 구독'에서 '매월 정기 구독'을 뺐다. 이 화면의 요금제는 앱 정기 구독이 아니라 통신 요금제다(DOMAIN 1장). '부가세 포함'은 Figma 그대로.
- Figma '구독 안내' 내용('이용 기간 / 신청일부터 1개월', '갱신 주기 / 매월 자동 갱신', '이용 횟수는 매월 새로 제공되며, 남은 횟수는 다음 달로 이월되지 않습니다.')은 PRD에 없는 횟수·갱신 개념이라 쓰지 않았다. 같은 모양을 금액 비교(F2-3·F2-4, 섹션 제목 '금액 비교')와 인앱 구독 해지 안내(F3-5, 섹션 제목 '구독 안내' 유지)에 썼다.
- Figma에 없는 지금 요금제 Tag·안내 문구·버튼 비활성(F1-4, F3-1), 요금 안내 문구(PRD 8장 예시 표시)를 추가했다.

용어:
- 화면 문구는 사용자 결정에 따라 "구독" 계열을 쓴다(BottomCTA '구독 신청', 섹션 '구독 안내'). DOMAIN.md 용어 통일("요금제 변경 신청")은 따르지 않는다.

미정 — 가정:
- 미정 — 가정: 고른 구독 서비스는 목록에서 쿼리 `subs`(쉼표 구분 id)로 받는다(list.md 이동과 같음). 모르는 id·중복은 무시한다. '뒤로'와 '구독 신청'에도 같은 쿼리를 그대로 붙인다.
- 미정 — 가정: 지금 쓰는 요금제 안내는 새 화면·팝업 없이 선택 요금제 박스 안 한 줄 문구로 둔다. 문구 '지금 쓰는 요금제라 신청할 수 없어요.'는 자료에 없어 만든 것이다.
- 미정 — 가정: 지금 쓰는 요금제 상태에서는 금액 비교·구독 안내 섹션을 숨긴다(신청 대상이 아니고, 목록에서도 지금 요금제 카드에 금액 차이를 보이지 않음).
- 미정 — 가정: 인앱 구독 해지 안내는 안내 문구만 보이고 확인 체크·동의는 받지 않으며 신청을 막지 않는다(PRD F3-5는 "안내한다"만 요구). 문구 2줄은 자료에 없어 만든 것이다.
- 미정 — 가정: 금액 비교 6줄 구성, 줄 이름('고른 구독 서비스', '이 요금제 월 요금', '따로 내는 구독료', '이 요금제 전체 금액', '차이')과 설명 2줄은 자료에 없어 F2-3·F2-4를 만족하는 가장 단순한 형태로 정했다. 차이 문구는 목록 화면과 같다.
- 미정 — 가정: 제공 혜택 줄 라벨('데이터 {데이터 양}', '{서비스} 구독 포함', '묶인 구독 없음')은 자료에 없어 정했다.
- 미정 — 가정: 예시 데이터 표시 문구는 이 화면에 데이터 사용량이 없으므로 '요금제와 구독료는 예시 데이터입니다.'로 둔다(목록은 '요금제, 구독료, 데이터 사용량은 예시 데이터입니다.').
- 미정 — 가정: 없는 `id`, 로딩·에러 상태는 정의하지 않는다.
- 미정 — 가정: Button State=Disabled의 라벨 색은 design.md가 "텍스트까지 동일하게 통일되어 있지 않다"고 하므로 Figma 변형 값을 그대로 따른다.
