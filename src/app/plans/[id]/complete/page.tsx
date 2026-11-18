import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentPlanId, plans, subscriptions, type Plan, type SubscriptionId } from "@/data/example";
import { createClient } from "@/lib/supabase/server";
import PlanComplete, { type SavedApplication } from "./PlanComplete";

export const metadata: Metadata = {
  title: "신청 완료",
};

// 예시 요금제 id를 빌드 때 미리 그린다. 지금 쓰는 요금제 상태(BR10)는 id만으로 정해지므로 정적 셸에 들어간다.
export function generateStaticParams() {
  return plans.map((p) => ({ id: p.id }));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toSubs = (raw: string[]): SubscriptionId[] =>
  subscriptions.filter((s) => raw.includes(s.id)).map((s) => s.id);

/** 신청 일시 'M월 D일 HH:mm' (Asia/Seoul) */
function formatAppliedAt(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")}월 ${get("day")}일 ${get("hour")}:${get("minute")}`;
}

/** 저장된 신청 읽기(RLS: 자기 신청만). 못 읽으면 null → 예시 값. 신청자 정보 열은 읽지 않는다. */
async function loadApplication(appId: string, plan: Plan): Promise<SavedApplication | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("plan_change_applications")
      .select("application_no, applied_at, new_plan_id, new_plan_name, new_monthly_fee, selected_subscriptions, fee_difference")
      .eq("id", appId)
      .maybeSingle();
    if (error || !data || data.new_plan_id !== plan.id) return null;
    const appliedAt = formatAppliedAt(String(data.applied_at));
    if (!appliedAt) return null;
    return {
      applicationNumber: String(data.application_no),
      appliedAt,
      planName: String(data.new_plan_name),
      monthlyFee: Number(data.new_monthly_fee),
      selectedSubs: toSubs(Array.isArray(data.selected_subscriptions) ? data.selected_subscriptions : []),
      feeDifference: Number(data.fee_difference),
    };
  } catch {
    return null;
  }
}

// 쿼리 subs(예: ?subs=youtube,netflix)·app(저장된 신청 id)은 요청 때만 알 수 있으므로 Suspense 안에서 읽는다.
// 4개 id 밖의 값과 중복은 무시하고, 예시 구독 서비스 줄 순서로 맞춘다(detail·apply와 같음).
async function PlanCompleteWithQuery({
  plan,
  searchParams,
}: { plan: Plan } & Pick<PageProps<"/plans/[id]/complete">, "searchParams">) {
  const { subs, app } = await searchParams;
  const raw = (Array.isArray(subs) ? subs.join(",") : subs ?? "").split(",");
  const selectedSubs = toSubs(raw);

  // app이 있을 때만 DB를 읽는다(기본 상태·빌드 때는 부르지 않는다). 지금 쓰는 요금제(BR10)는 완료를 보이지 않으므로 읽지 않는다.
  const appId = typeof app === "string" ? app : undefined;
  const saved =
    appId && UUID.test(appId) && plan.id !== currentPlanId ? await loadApplication(appId, plan) : null;

  return <PlanComplete plan={plan} selectedSubs={selectedSubs} saved={saved} />;
}

export default async function PlanCompletePage(props: PageProps<"/plans/[id]/complete">) {
  const { id } = await props.params;
  const plan = plans.find((p) => p.id === id);
  if (!plan) notFound();

  // 정적 셸(fallback)은 고른 구독 0개인 기본 상태로 그린다.
  return (
    <Suspense fallback={<PlanComplete plan={plan} selectedSubs={[]} />}>
      <PlanCompleteWithQuery plan={plan} searchParams={props.searchParams} />
    </Suspense>
  );
}
