import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import IconDoneMark from "@/components/IconDoneMark";
import ListRow from "@/components/ListRow";
import {
  applicationResult,
  currentPlanId,
  plans,
  subscriptions,
  type Plan,
  type SubscriptionId,
} from "@/data/example";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const monthly = (n: number) => `월 ${won(n)}`;

/** 구독 서비스 id → 이름(예시 구독 서비스 줄 순서) */
const namesOf = (ids: SubscriptionId[]) => subscriptions.filter((s) => ids.includes(s.id)).map((s) => s.name);
const feeOf = (ids: SubscriptionId[]) =>
  subscriptions.filter((s) => ids.includes(s.id)).reduce((sum, s) => sum + s.representativeFee, 0);

function diffText(diff: number) {
  if (diff < 0) return `지금보다 ${monthly(-diff)} 덜 내요`;
  if (diff > 0) return `지금보다 ${monthly(diff)} 더 내요`;
  return "지금과 같아요";
}

const LIST_HREF = "/plans";

/** DB에서 읽은 신청(신청자 정보는 담지 않는다) */
export type SavedApplication = {
  applicationNumber: string;
  /** 'M월 D일 HH:mm' (Asia/Seoul) */
  appliedAt: string;
  planName: string;
  monthlyFee: number;
  selectedSubs: SubscriptionId[];
  /** 새 요금제 전체 금액 - 지금 요금제 + 구독료 */
  feeDifference: number;
};

type PlanCompleteProps = {
  plan: Plan;
  /** 쿼리 subs로 받은 고른 구독 서비스(모르는 id·중복 제거, 예시 줄 순서) */
  selectedSubs: SubscriptionId[];
  /** 쿼리 app으로 읽은 저장된 신청. 없으면 예시 값(applicationResult)과 화면 계산을 쓴다. */
  saved?: SavedApplication | null;
};

export default function PlanComplete({ plan, selectedSubs, saved = null }: PlanCompleteProps) {
  const isCurrent = plan.id === currentPlanId;
  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? plan;

  // 금액 계산(F4-6, BR9): apply·detail과 같은 식. 바꾸기 전 요금제는 currentPlanId.
  const currentTotal = currentPlan.monthlyFee + feeOf(selectedSubs);
  const unbundled = selectedSubs.filter((id) => !plan.bundledSubscriptions.includes(id));
  const newTotal = plan.monthlyFee + feeOf(unbundled);

  // 저장된 신청이 있으면 그 값을, 없으면 예시 값을 보인다.
  const applicationNumber = saved ? saved.applicationNumber : applicationResult.applicationNumber;
  const appliedAt = saved ? saved.appliedAt : applicationResult.appliedAt;
  const planName = saved ? saved.planName : plan.name;
  const monthlyFee = saved ? saved.monthlyFee : plan.monthlyFee;
  const difference = saved ? saved.feeDifference : newTotal - currentTotal;
  const selectedNames = namesOf(saved ? saved.selectedSubs : selectedSubs);

  return (
    <div className="flex h-full flex-col bg-bg-default">
      <Header type="default" title="신청 완료" backHref={LIST_HREF} />

      <main className="flex-1 overflow-y-auto bg-bg-default">
        <div className="flex flex-col gap-24 px-16 py-24">
          {isCurrent ? (
            // 지금 쓰는 요금제(직접 연 경우, BR10): 완료로 보이지 않게 안내만
            <section className="flex flex-col items-center gap-16 p-16">
              <p className="w-full text-center text-body-small font-medium text-text-primary">
                지금 쓰는 요금제라 신청할 수 없어요.
              </p>
            </section>
          ) : (
            <>
              {/* 1. 구독 신청 완료 안내 */}
              <section className="flex flex-col items-center gap-16 p-16">
                <IconDoneMark />
                <h2 className="w-full text-center text-heading-h4 font-bold text-text-primary">
                  구독 신청이 완료됐어요
                </h2>
                <p className="w-full text-center text-body-small font-medium text-text-secondary">
                  새 요금제가 바로 적용됐어요.
                </p>
              </section>

              {/* 2. 신청 내역 */}
              <section className="flex flex-col gap-12">
                <h2 className="text-heading-h4 font-bold text-text-primary">신청 내역</h2>
                <div className="flex flex-col gap-0 divide-y divide-border-subtle rounded-0 bg-bg-subtle p-12">
                  <ListRow type="default" label="신청 번호" value={applicationNumber} />
                  <ListRow type="default" label="요금제" value={planName} />
                  <ListRow type="default" label="월 요금" value={monthly(monthlyFee)} />
                  <ListRow
                    type="default"
                    label="고른 구독 서비스"
                    value={selectedNames.length ? selectedNames.join(", ") : "없음"}
                  />
                  <ListRow type="default" label="차이" value={diffText(difference)} />
                  <ListRow type="default" label="신청 일시" value={appliedAt} />
                </div>
              </section>
            </>
          )}

          {/* 3. 요금 안내 문구 */}
          <section className="flex flex-col">
            <p className="text-12 font-medium text-text-secondary">모든 요금은 부가세 포함 금액입니다.</p>
            <p className="text-12 font-medium text-text-secondary">
              신청 번호, 신청 일시, 요금제, 구독료는 예시 데이터입니다.
            </p>
          </section>
        </div>
      </main>

      <BottomCTA
        layout="single"
        primary={
          <Button type="Primary" size="xl" href={LIST_HREF}>
            완료
          </Button>
        }
      />
    </div>
  );
}
