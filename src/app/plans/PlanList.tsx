"use client";

import { useState } from "react";
import CardPlan from "@/components/CardPlan";
import Checkbox from "@/components/Checkbox";
import FilterChip from "@/components/FilterChip";
import ListRow from "@/components/ListRow";
import {
  currentPlanId,
  dataUsage,
  filters,
  plans,
  subscriptions,
  type DataAmount,
  type DataFilter,
  type Plan,
  type SubscriptionId,
} from "@/data/example";

const won = (n: number) => n.toLocaleString("ko-KR");
const gb = (n: number) => `${n}GB`;
const dataLabel = (d: DataAmount) => (d === "무제한" ? d : gb(d));

function passesFilter(plan: Plan, filter: DataFilter) {
  if (filter.minData === null) return true;
  if (plan.dataAmount === "무제한") return true;
  if (filter.minData === "무제한") return false;
  return plan.dataAmount >= filter.minData;
}

function feeOf(ids: SubscriptionId[]) {
  return subscriptions.filter((s) => ids.includes(s.id)).reduce((sum, s) => sum + s.representativeFee, 0);
}

function planDesc(plan: Plan) {
  const bundled = subscriptions.filter((s) => plan.bundledSubscriptions.includes(s.id)).map((s) => s.name);
  return bundled.length
    ? `데이터 ${dataLabel(plan.dataAmount)} · ${bundled.join(", ")} 포함`
    : `데이터 ${dataLabel(plan.dataAmount)} · 묶인 구독 없음`;
}

function diffLine(newTotal: number, diff: number) {
  const head = `전체 금액 월 ${won(newTotal)}원 · `;
  if (diff < 0) return `${head}지금보다 월 ${won(-diff)}원 덜 내요`;
  if (diff > 0) return `${head}지금보다 월 ${won(diff)}원 더 내요`;
  return `${head}지금과 같아요`;
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-body font-semibold text-text-primary">{children}</h2>;
}

type PlanListProps = {
  /** 상세에서 '뒤로'로 돌아올 때 쿼리 subs로 되살리는 선택 */
  initialSubs: SubscriptionId[];
};

export default function PlanList({ initialSubs }: PlanListProps) {
  const [filterId, setFilterId] = useState(filters[0].id);
  const [selectedSubs, setSelectedSubs] = useState<SubscriptionId[]>(initialSubs);

  const filter = filters.find((f) => f.id === filterId) ?? filters[0];
  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? plans[0];
  const selectedFee = feeOf(selectedSubs);
  const currentTotal = currentPlan.monthlyFee + selectedFee;

  const visiblePlans = plans
    .filter((p) => passesFilter(p, filter))
    .sort((a, b) => a.monthlyFee - b.monthlyFee);

  const orderedSubs = subscriptions.filter((s) => selectedSubs.includes(s.id)).map((s) => s.id);
  const query = orderedSubs.length ? `?subs=${orderedSubs.join(",")}` : "";

  const toggleSub = (id: SubscriptionId) =>
    setSelectedSubs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="flex flex-col gap-24 px-16 py-24">
      {/* 1. 데이터 사용량 */}
      <section className="flex flex-col gap-12">
        <SectionTitle>내 데이터 사용량</SectionTitle>
        <div className="flex flex-col divide-y divide-border-subtle rounded-16 bg-bg-surface p-20">
          <ListRow type="default" label="이번 달 쓴 양" value={gb(dataUsage.usedThisMonth)} />
          <ListRow type="default" label="남은 양" value={gb(dataUsage.remaining)} />
          <ListRow type="default" label="다시 들어오는 날" value={dataUsage.resetDate} />
          <ListRow type="default" label="지난 달 쓴 양" value={gb(dataUsage.usedLastMonth)} />
        </div>
      </section>

      {/* 2. 데이터 양 필터 */}
      <section className="flex flex-col gap-12">
        <SectionTitle>필요한 데이터 양</SectionTitle>
        <div className="flex gap-4 overflow-x-auto">
          {filters.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              state={f.id === filter.id ? "selected" : "default"}
              onClick={() => setFilterId(f.id)}
            />
          ))}
        </div>
      </section>

      {/* 3. 구독 서비스 선택 */}
      <section className="flex flex-col gap-12">
        <SectionTitle>쓰고 있는 구독 서비스</SectionTitle>
        <div className="flex flex-col gap-12 rounded-16 bg-bg-surface p-20">
          {subscriptions.map((s) => {
            const checked = selectedSubs.includes(s.id);
            return (
              <label key={s.id} className="flex cursor-pointer items-center gap-8">
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleSub(s.id)} />
                <Checkbox state={checked ? "active" : "default"} />
                <span className="flex-1 text-body-small font-medium text-text-primary">{s.name}</span>
                <span className="text-body-small font-medium text-text-secondary">월 {won(s.representativeFee)}원</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* 4. 지금 내는 금액 */}
      <section className="flex flex-col gap-12">
        <SectionTitle>지금 내는 금액</SectionTitle>
        <div className="flex flex-col divide-y divide-border-subtle rounded-16 bg-bg-surface p-20">
          <ListRow type="default" label="지금 요금제" value={`${currentPlan.name} 월 ${won(currentPlan.monthlyFee)}원`} />
          <ListRow type="default" label="고른 구독료" value={`월 ${won(selectedFee)}원`} />
          <ListRow type="default" label="지금 요금제 + 구독료" value={`월 ${won(currentTotal)}원`} />
        </div>
      </section>

      {/* 5. 목록 안내 */}
      <section className="flex flex-col gap-8">
        <h2 className="text-heading-h4 font-bold text-text-primary">나에게 맞는 요금제를 선택하세요</h2>
        <p className="text-body-small font-medium text-text-secondary">요금제별 혜택을 확인한 후 구독할 수 있어요.</p>
      </section>

      {/* 6. 요금제 목록 */}
      <section className="flex flex-col gap-16">
        {visiblePlans.map((p) => {
          const isCurrent = p.id === currentPlanId;
          const unbundled = selectedSubs.filter((id) => !p.bundledSubscriptions.includes(id));
          const newTotal = p.monthlyFee + feeOf(unbundled);
          return (
            <div key={p.id} className="flex flex-col gap-8">
              <CardPlan
                state="default"
                badge={isCurrent}
                badgeLabel="지금 요금제"
                name={p.name}
                desc={planDesc(p)}
                price={`월 ${won(p.monthlyFee)}원`}
                buttonLabel="요금제 보기"
                href={`/plans/${encodeURIComponent(p.id)}${query}`}
              />
              <p className="text-body-small font-medium text-text-secondary">
                {isCurrent ? "지금 쓰는 요금제예요" : diffLine(newTotal, newTotal - currentTotal)}
              </p>
            </div>
          );
        })}
      </section>

      {/* 7. 요금 안내 문구 */}
      <section className="flex flex-col">
        <p className="text-12 font-medium text-text-secondary">모든 요금은 부가세 포함 금액입니다.</p>
        <p className="text-12 font-medium text-text-secondary">요금제, 구독료, 데이터 사용량은 예시 데이터입니다.</p>
      </section>
    </div>
  );
}
