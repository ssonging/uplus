import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import ListRow from "@/components/ListRow";
import Tag from "@/components/Tag";
import { currentPlanId, plans, subscriptions, type DataAmount, type Plan, type SubscriptionId } from "@/data/example";

const won = (n: number) => n.toLocaleString("ko-KR");
const monthly = (n: number) => `월 ${won(n)}원`;
const dataLabel = (d: DataAmount) => (d === "무제한" ? d : `${d}GB`);

/** 구독 서비스 id → 이름(예시 구독 서비스 줄 순서) */
const namesOf = (ids: SubscriptionId[]) => subscriptions.filter((s) => ids.includes(s.id)).map((s) => s.name);
const feeOf = (ids: SubscriptionId[]) =>
  subscriptions.filter((s) => ids.includes(s.id)).reduce((sum, s) => sum + s.representativeFee, 0);

function diffText(diff: number) {
  if (diff < 0) return `지금보다 ${monthly(-diff)} 덜 내요`;
  if (diff > 0) return `지금보다 ${monthly(diff)} 더 내요`;
  return "지금과 같아요";
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-heading-h4 font-bold text-text-primary">{children}</h2>;
}

type PlanDetailProps = {
  plan: Plan;
  /** 쿼리 subs로 받은 고른 구독 서비스(모르는 id·중복 제거, 예시 줄 순서) */
  selectedSubs: SubscriptionId[];
};

export default function PlanDetail({ plan, selectedSubs }: PlanDetailProps) {
  const isCurrent = plan.id === currentPlanId;
  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? plan;

  const currentTotal = currentPlan.monthlyFee + feeOf(selectedSubs);
  const unbundled = selectedSubs.filter((id) => !plan.bundledSubscriptions.includes(id));
  const overlap = selectedSubs.filter((id) => plan.bundledSubscriptions.includes(id));
  const extraFee = feeOf(unbundled);
  const newTotal = plan.monthlyFee + extraFee;
  const selectedNames = namesOf(selectedSubs);
  const bundledNames = namesOf(plan.bundledSubscriptions);

  const query = selectedSubs.length ? `?subs=${selectedSubs.join(",")}` : "";
  const backHref = `/plans${query}`;
  const applyHref = `/plans/${encodeURIComponent(plan.id)}/apply${query}`;

  return (
    <div className="flex h-full flex-col bg-bg-default">
      <Header type="default" title="요금제 상세" backHref={backHref} />

      <main className="flex-1 overflow-y-auto bg-bg-default">
        <div className="flex flex-col gap-24 px-16 py-24">
          {/* 1. 선택 요금제 */}
          <section className="flex flex-col gap-8 rounded-0 bg-bg-subtle p-16">
            {isCurrent ? <Tag label="지금 요금제" /> : null}
            <h2 className="text-subtitle font-bold text-text-primary">{plan.name}</h2>
            <p className="text-heading-h3 font-bold text-text-primary">{monthly(plan.monthlyFee)}</p>
            <p className="text-body-small font-medium text-text-secondary">부가세 포함</p>
            {isCurrent ? (
              <p className="text-body-small font-medium text-text-primary">지금 쓰는 요금제라 신청할 수 없어요.</p>
            ) : null}
          </section>

          {/* 2. 제공 혜택 */}
          <section className="flex flex-col gap-8">
            <SectionTitle>제공 혜택</SectionTitle>
            <div className="flex flex-col divide-y divide-border-subtle">
              <ListRow type="check" label={`데이터 ${dataLabel(plan.dataAmount)}`} value="" />
              {bundledNames.length ? (
                bundledNames.map((name) => <ListRow key={name} type="check" label={`${name} 구독 포함`} value="" />)
              ) : (
                <ListRow type="check" label="묶인 구독 없음" value="" />
              )}
            </div>
          </section>

          {/* 3. 금액 비교 (지금 쓰는 요금제면 숨김) */}
          {isCurrent ? null : (
            <section className="flex flex-col gap-8">
              <SectionTitle>금액 비교</SectionTitle>
              <div className="flex flex-col divide-y divide-border-subtle">
                <ListRow
                  type="default"
                  label="고른 구독 서비스"
                  value={selectedNames.length ? selectedNames.join(", ") : "없음"}
                />
                <ListRow type="default" label="지금 요금제 + 구독료" value={monthly(currentTotal)} />
                <ListRow type="default" label="이 요금제 월 요금" value={monthly(plan.monthlyFee)} />
                <ListRow type="default" label="따로 내는 구독료" value={monthly(extraFee)} />
                <ListRow type="default" label="이 요금제 전체 금액" value={monthly(newTotal)} />
                <ListRow type="default" label="차이" value={diffText(newTotal - currentTotal)} />
              </div>
              <div className="flex flex-col">
                <p className="text-body-small font-medium text-text-secondary">
                  구독료는 고른 구독 서비스의 대표 구독료로 계산해요.
                </p>
                <p className="text-body-small font-medium text-text-secondary">
                  이 요금제에 묶인 구독은 따로 내는 구독료에서 빼요.
                </p>
              </div>
            </section>
          )}

          {/* 4. 구독 안내 (고른 구독이 이 요금제에 묶여 있을 때만) */}
          {!isCurrent && overlap.length ? (
            <section className="flex flex-col gap-8">
              <SectionTitle>구독 안내</SectionTitle>
              <div className="flex flex-col divide-y divide-border-subtle">
                <ListRow type="default" label="이 요금제에 묶인 구독" value={namesOf(overlap).join(", ")} />
              </div>
              <div className="flex flex-col">
                <p className="text-body-small font-medium text-text-secondary">
                  인앱에서 따로 결제하고 있다면 기존 구독을 직접 해지해 주세요.
                </p>
                <p className="text-body-small font-medium text-text-secondary">
                  해지하지 않으면 구독료가 두 번 나갈 수 있어요.
                </p>
              </div>
            </section>
          ) : null}

          {/* 5. 요금 안내 문구 */}
          <section className="flex flex-col">
            <p className="text-12 font-medium text-text-secondary">모든 요금은 부가세 포함 금액입니다.</p>
            <p className="text-12 font-medium text-text-secondary">요금제와 구독료는 예시 데이터입니다.</p>
          </section>
        </div>
      </main>

      <BottomCTA
        layout="double"
        secondary={
          <Button type="Secondary" size="xl" href={backHref}>
            뒤로
          </Button>
        }
        primary={
          isCurrent ? (
            <Button type="Primary" size="xl" state="Disabled" cta="apply">
              구독 신청
            </Button>
          ) : (
            <Button type="Primary" size="xl" state="Default" href={applyHref} cta="apply">
              구독 신청
            </Button>
          )
        }
      />
    </div>
  );
}
