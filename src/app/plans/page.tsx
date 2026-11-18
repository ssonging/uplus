import { Suspense } from "react";
import Header from "@/components/Header";
import { subscriptions, type SubscriptionId } from "@/data/example";
import PlanList from "./PlanList";

// 쿼리 subs(예: ?subs=youtube,netflix)로 고른 구독 서비스를 되살린다.
// searchParams는 요청 때만 알 수 있으므로 Suspense 안에서 읽고, 정적 셸(fallback)은 기본 상태로 그린다.
async function PlanListWithQuery({ searchParams }: Pick<PageProps<"/plans">, "searchParams">) {
  const { subs } = await searchParams;
  const raw = (Array.isArray(subs) ? subs.join(",") : subs ?? "").split(",");
  const initialSubs: SubscriptionId[] = subscriptions.filter((s) => raw.includes(s.id)).map((s) => s.id);
  return <PlanList initialSubs={initialSubs} />;
}

export default function PlansPage(props: PageProps<"/plans">) {
  return (
    <div className="flex h-full flex-col bg-bg-default">
      <Header type="root" title="요금제 목록" />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<PlanList initialSubs={[]} />}>
          <PlanListWithQuery searchParams={props.searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
