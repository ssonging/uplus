-- 요금제 변경 신청 저장 테이블 (화면: /plans/[id]/apply → /plans/[id]/complete)
-- 근거: docs/PRD.md F3-1~F3-4, F4-1~F4-6, docs/DOMAIN.md 6장 "요금제 변경 신청"
-- 실행: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여 넣고 Run. 여러 번 실행해도 되도록 if not exists 를 썼다.

-- 1) 신청 번호용 순번 (완료 화면의 '신청 번호' 예: 2026-1118-0001)
create sequence if not exists public.plan_change_application_no_seq;

-- 2) 테이블
create table if not exists public.plan_change_applications (
  id                      uuid primary key default gen_random_uuid(),
  application_no          text not null unique
                            default (to_char(now() at time zone 'Asia/Seoul', 'YYYY-MMDD') || '-' ||
                                     lpad(nextval('public.plan_change_application_no_seq')::text, 4, '0')),

  -- 누가 (로그인한 고객. PRD 4장: 로그인한 상태로 들어온다)
  user_id                 uuid not null default auth.uid() references auth.users (id) on delete cascade,

  -- 무엇을 바꾸나 (F4-1). 요금제 목록이 아직 예시 데이터라 id·이름·요금을 신청 시점 값으로 함께 남긴다.
  current_plan_id         text not null,
  current_plan_name       text not null,
  current_monthly_fee     integer not null check (current_monthly_fee >= 0),
  new_plan_id             text not null,
  new_plan_name           text not null,
  new_monthly_fee         integer not null check (new_monthly_fee >= 0),

  -- 구독료 비교 (F2-2, F2-3, BR9, BR12): 고른 구독 서비스와 계산 결과
  selected_subscriptions  text[] not null default '{}'
                            check (selected_subscriptions <@ array['youtube', 'netflix', 'disney', 'tving']),
  current_total_fee       integer not null check (current_total_fee >= 0),  -- 지금 요금제 + 구독료
  new_total_fee           integer not null check (new_total_fee >= 0),      -- 새 요금제 전체 금액
  fee_difference          integer generated always as (new_total_fee - current_total_fee) stored,

  -- 약정·지원금 반환 (F3-2~F3-4, F4-4, BR3~BR7)
  contract_type           text check (contract_type in ('공시지원금', '선택약정')),  -- 약정 없으면 null
  subsidy_refund_amount   integer not null default 0 check (subsidy_refund_amount >= 0),
  refund_agreed           boolean not null default false,

  -- 약관·입력 정보 (F4-2, F4-3). 입력 항목은 PRD 열린 질문 3이라 화면 예시(이름·연락처·이메일·주소)를 따른다.
  terms_agreed            boolean not null,
  applicant_name          text not null check (length(btrim(applicant_name)) > 0),
  applicant_phone         text not null check (length(btrim(applicant_phone)) > 0),
  applicant_email         text not null check (length(btrim(applicant_email)) > 0),
  applicant_address       text not null check (length(btrim(applicant_address)) > 0),

  -- 언제 (F4-6 신청 일시). 즉시 적용(BR1)이라 신청 일시 = 적용 일시
  applied_at              timestamptz not null default now(),

  -- 비즈니스 규칙을 DB에서도 막는다
  constraint br10_not_current_plan check (new_plan_id <> current_plan_id),                         -- BR10 지금 요금제 신청 막기
  constraint f42_terms_required    check (terms_agreed),                                            -- F4-2 약관 필수
  constraint br7_refund_needs_agree check (subsidy_refund_amount = 0 or refund_agreed),            -- BR7·F4-4 반환 있으면 동의 필수
  constraint br6_no_refund_selective check (contract_type is distinct from '선택약정' or subsidy_refund_amount = 0)  -- BR6
);

comment on table public.plan_change_applications is '요금제 변경 신청. 화면 문구는 "구독 신청"(사용자 결정)이지만 데이터는 DOMAIN 용어를 따른다.';

create index if not exists plan_change_applications_user_applied_idx
  on public.plan_change_applications (user_id, applied_at desc);

-- 3) 권한: 행 단위 보안(RLS) — 고객은 자기 신청만 저장·조회한다
alter table public.plan_change_applications enable row level security;

-- 저장: 로그인한 고객이 자기 user_id로만 넣을 수 있다
drop policy if exists "customers insert own applications" on public.plan_change_applications;
create policy "customers insert own applications"
  on public.plan_change_applications
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- 조회: 로그인한 고객이 자기 신청만 볼 수 있다 (완료 화면의 신청 내역)
drop policy if exists "customers select own applications" on public.plan_change_applications;
create policy "customers select own applications"
  on public.plan_change_applications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- 수정·삭제 정책은 만들지 않는다 → 고객은 신청을 고치거나 지울 수 없다 (신청 실패·취소 처리는 PRD 범위 밖)
-- 로그인하지 않은 사용자(anon)에게는 아무 정책도 없다 → 저장·조회 모두 막힌다

-- 테이블 수준 권한도 필요한 만큼만 연다
revoke all on public.plan_change_applications from anon;
revoke all on public.plan_change_applications from authenticated;
grant select on public.plan_change_applications to authenticated;
-- 넣기는 고객이 정하는 열만 허용한다. id·신청 번호·신청 일시는 DB가 채우고, 차이는 DB가 계산한다.
grant insert (
  user_id,
  current_plan_id, current_plan_name, current_monthly_fee,
  new_plan_id, new_plan_name, new_monthly_fee,
  selected_subscriptions, current_total_fee, new_total_fee,
  contract_type, subsidy_refund_amount, refund_agreed,
  terms_agreed, applicant_name, applicant_phone, applicant_email, applicant_address
) on public.plan_change_applications to authenticated;
grant usage on sequence public.plan_change_application_no_seq to authenticated;
