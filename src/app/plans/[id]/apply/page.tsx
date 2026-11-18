import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { plans, subscriptions, type Plan, type SubscriptionId } from "@/data/example";
import PlanApply from "./PlanApply";

export const metadata: Metadata = {
  title: "구독 신청",
};

// 예시 요금제 id를 빌드 때 미리 그린다. 지금 쓰는 요금제 상태(BR10)는 id만으로 정해지므로 정적 셸에 들어간다.
export function generateStaticParams() {
  return plans.map((p) => ({ id: p.id }));
}

// 쿼리 subs(예: ?subs=youtube,netflix)는 요청 때만 알 수 있으므로 Suspense 안에서 읽는다.
// 4개 id 밖의 값과 중복은 무시하고, 예시 구독 서비스 줄 순서로 맞춘다(detail과 같음).
async function PlanApplyWithQuery({
  plan,
  searchParams,
}: { plan: Plan } & Pick<PageProps<"/plans/[id]/apply">, "searchParams">) {
  const { subs } = await searchParams;
  const raw = (Array.isArray(subs) ? subs.join(",") : subs ?? "").split(",");
  const selectedSubs: SubscriptionId[] = subscriptions.filter((s) => raw.includes(s.id)).map((s) => s.id);
  return <PlanApply plan={plan} selectedSubs={selectedSubs} />;
}

export default async function PlanApplyPage(props: PageProps<"/plans/[id]/apply">) {
  const { id } = await props.params;
  const plan = plans.find((p) => p.id === id);
  if (!plan) notFound();

  // 정적 셸(fallback)은 고른 구독 0개인 기본 상태로 그린다.
  return (
    <Suspense fallback={<PlanApply plan={plan} selectedSubs={[]} />}>
      <PlanApplyWithQuery plan={plan} searchParams={props.searchParams} />
    </Suspense>
  );
}
