"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode, type Ref } from "react";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import Header from "@/components/Header";
import Input, { type InputState } from "@/components/Input";
import ListRow from "@/components/ListRow";
import { contract, currentPlanId, plans, subscriptions, type Plan, type SubscriptionId } from "@/data/example";

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

/** 지원금 반환 금액(BR4) = 지원금 × (남은 ÷ 전체), 원 단위 아래 버림 */
function refundOf(subsidy: number, remainingMonths: number, totalMonths: number) {
  return Math.floor((subsidy * remainingMonths) / totalMonths);
}

type FieldKey = "name" | "phone" | "email" | "address";

const FIELDS: { key: FieldKey; label: string; type: "text" | "tel" | "email"; placeholder: string }[] = [
  { key: "name", label: "이름", type: "text", placeholder: "이름을 입력해 주세요" },
  { key: "phone", label: "연락처", type: "tel", placeholder: "연락처를 입력해 주세요" },
  { key: "email", label: "이메일", type: "email", placeholder: "이메일을 입력해 주세요" },
  { key: "address", label: "주소", type: "text", placeholder: "주소를 입력해 주세요" },
];

const fieldId = (key: FieldKey) => "apply-" + key;

const EMPTY_VALUES: Record<FieldKey, string> = { name: "", phone: "", email: "", address: "" };
const NO_ERRORS: Record<FieldKey, boolean> = { name: false, phone: false, email: false, address: false };

const REQUIRED_INPUT = "필수 입력 정보입니다.";
const REQUIRED_AGREE = "필수 동의 항목입니다.";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-heading-h4 font-bold text-text-primary">{children}</h2>;
}

/** 동의 체크 줄: 줄 전체를 눌러도 Checkbox가 바뀐다. 오류 문구는 줄 아래 4 간격. */
function AgreeRow({
  id,
  label,
  checked,
  error,
  onToggle,
  inputRef,
}: {
  id: string;
  label: string;
  checked: boolean;
  error: boolean;
  onToggle: () => void;
  inputRef: Ref<HTMLInputElement>;
}) {
  const errorId = id + "-error";
  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-8">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onToggle}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <Checkbox state={checked ? "active" : "default"} />
        <span className="flex-1 text-body-small font-medium text-text-primary">{label}</span>
      </label>
      {error ? (
        <p id={errorId} className="text-body-small font-medium text-text-error">
          {REQUIRED_AGREE}
        </p>
      ) : null}
    </div>
  );
}

/** 신청 내용·지원금 반환 박스: bg/subtle, radius/0, 안쪽 12, 줄 간격 0, 외곽선 없음 */
function InfoBox({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-0 divide-y divide-border-subtle rounded-0 bg-bg-subtle p-12">{children}</div>;
}

type PlanApplyProps = {
  plan: Plan;
  /** 쿼리 subs로 받은 고른 구독 서비스(모르는 id·중복 제거, 예시 줄 순서) */
  selectedSubs: SubscriptionId[];
};

export default function PlanApply({ plan, selectedSubs }: PlanApplyProps) {
  const router = useRouter();

  const isCurrent = plan.id === currentPlanId;
  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? plan;

  // 금액 계산(F4-1, BR9): detail과 같은 식
  const currentTotal = currentPlan.monthlyFee + feeOf(selectedSubs);
  const unbundled = selectedSubs.filter((id) => !plan.bundledSubscriptions.includes(id));
  const newTotal = plan.monthlyFee + feeOf(unbundled);
  const selectedNames = namesOf(selectedSubs);

  // 지원금 반환 안내(F3-2~F3-4, BR3~BR7): 네 조건이 모두 맞을 때만
  const refundContract =
    !isCurrent &&
    contract !== null &&
    contract.type === "공시지원금" &&
    contract.remainingMonths > 0 &&
    plan.monthlyFee < contract.baseAmount
      ? contract
      : null;
  const showRefund = refundContract !== null;

  const query = selectedSubs.length ? `?subs=${selectedSubs.join(",")}` : "";
  const planPath = `/plans/${encodeURIComponent(plan.id)}`;
  const backHref = planPath + query;
  const completeHref = planPath + "/complete" + query;

  const [values, setValues] = useState<Record<FieldKey, string>>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<FieldKey, boolean>>(NO_ERRORS);
  const [focused, setFocused] = useState<FieldKey | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [refundAgreed, setRefundAgreed] = useState(false);
  const [refundError, setRefundError] = useState(false);

  const inputRefs = useRef<Record<FieldKey, HTMLInputElement | null>>({
    name: null,
    phone: null,
    email: null,
    address: null,
  });
  const termsRef = useRef<HTMLInputElement | null>(null);
  const refundRef = useRef<HTMLInputElement | null>(null);

  const stateOf = (key: FieldKey): InputState => {
    if (errors[key]) return "caution";
    if (focused === key) return "focus";
    return values[key] ? "filled" : "default";
  };

  const changeValue = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (value) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const toggleTerms = () => {
    const next = !termsAgreed;
    setTermsAgreed(next);
    if (next) setTermsError(false);
  };

  const toggleRefund = () => {
    const next = !refundAgreed;
    setRefundAgreed(next);
    if (next) setRefundError(false);
  };

  const submit = () => {
    if (isCurrent) return;
    const nextErrors = { ...NO_ERRORS };
    for (const f of FIELDS) nextErrors[f.key] = values[f.key].trim() === "";
    const nextRefundError = showRefund && !refundAgreed;
    const nextTermsError = !termsAgreed;

    setErrors(nextErrors);
    setRefundError(nextRefundError);
    setTermsError(nextTermsError);

    // 첫 번째 오류 항목(본문 위에서부터): 지원금 반환 동의 → 이름 → 연락처 → 이메일 → 주소 → 약관 동의
    if (nextRefundError) {
      refundRef.current?.focus();
      return;
    }
    const firstField = FIELDS.find((f) => nextErrors[f.key]);
    if (firstField) {
      inputRefs.current[firstField.key]?.focus();
      return;
    }
    if (nextTermsError) {
      termsRef.current?.focus();
      return;
    }
    router.push(completeHref);
  };

  return (
    <div className="flex h-full flex-col bg-bg-default">
      <Header type="default" title="구독 신청" backHref={backHref} />

      <main className="flex-1 overflow-y-auto bg-bg-default">
        <div className="flex flex-col gap-24 px-16 py-24">
          {/* 1. 신청 내용 */}
          <section className="flex flex-col gap-8">
            <SectionTitle>신청 내용</SectionTitle>
            <InfoBox>
              <ListRow type="default" label="지금 요금제" value={`${currentPlan.name} ${monthly(currentPlan.monthlyFee)}`} />
              <ListRow type="default" label="새 요금제" value={`${plan.name} ${monthly(plan.monthlyFee)}`} />
              {isCurrent ? null : (
                <>
                  <ListRow
                    type="default"
                    label="고른 구독 서비스"
                    value={selectedNames.length ? selectedNames.join(", ") : "없음"}
                  />
                  <ListRow type="default" label="지금 요금제 + 구독료" value={monthly(currentTotal)} />
                  <ListRow type="default" label="새 요금제 전체 금액" value={monthly(newTotal)} />
                  <ListRow type="default" label="차이" value={diffText(newTotal - currentTotal)} />
                </>
              )}
              <ListRow type="default" label="적용 시점" value="신청하면 바로 적용" />
            </InfoBox>
            {isCurrent ? (
              <p className="text-body-small font-medium text-text-primary">지금 쓰는 요금제라 신청할 수 없어요.</p>
            ) : null}
          </section>

          {/* 2. 지원금 반환 안내 (조건부) */}
          {refundContract ? (
            <section className="flex flex-col gap-8">
              <SectionTitle>지원금 반환 안내</SectionTitle>
              <InfoBox>
                <ListRow type="default" label="지원금" value={won(refundContract.subsidy)} />
                <ListRow type="default" label="기준 금액" value={monthly(refundContract.baseAmount)} />
                <ListRow type="default" label="전체 약정 기간" value={`${refundContract.totalMonths}개월`} />
                <ListRow type="default" label="남은 약정 기간" value={`${refundContract.remainingMonths}개월`} />
                <ListRow
                  type="default"
                  label="반환 금액"
                  value={won(
                    refundOf(refundContract.subsidy, refundContract.remainingMonths, refundContract.totalMonths),
                  )}
                />
              </InfoBox>
              <div className="flex flex-col">
                <p className="text-body-small font-medium text-text-secondary">
                  기준 금액보다 낮은 요금제로 바꾸면 받은 지원금 일부를 돌려줘야 해요.
                </p>
                <p className="text-body-small font-medium text-text-secondary">
                  반환 금액 = 지원금 × (남은 약정 기간 ÷ 전체 약정 기간)
                </p>
              </div>
              <AgreeRow
                id="agree-refund"
                label="지원금 반환 금액을 확인했고 동의해요 (필수)"
                checked={refundAgreed}
                error={refundError}
                onToggle={toggleRefund}
                inputRef={refundRef}
              />
            </section>
          ) : null}

          {/* 3. 신청자 정보 */}
          <section className="flex flex-col gap-12">
            <SectionTitle>신청자 정보</SectionTitle>
            {FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-4">
                <label htmlFor={fieldId(f.key)} className="text-body-small font-medium text-text-primary">
                  {f.label}
                </label>
                <Input
                  ref={(el) => {
                    inputRefs.current[f.key] = el;
                  }}
                  id={fieldId(f.key)}
                  name={f.key}
                  type={f.type}
                  state={stateOf(f.key)}
                  value={values[f.key]}
                  placeholder={f.placeholder}
                  message={REQUIRED_INPUT}
                  onChange={(v) => changeValue(f.key, v)}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused((prev) => (prev === f.key ? null : prev))}
                />
              </div>
            ))}
          </section>

          {/* 4. 약관 동의 */}
          <section className="flex flex-col gap-12">
            <SectionTitle>약관 동의</SectionTitle>
            <AgreeRow
              id="agree-terms"
              label="구독 신청 약관에 동의해요 (필수)"
              checked={termsAgreed}
              error={termsError}
              onToggle={toggleTerms}
              inputRef={termsRef}
            />
          </section>

          {/* 5. 신청 안내 문구 */}
          <section className="flex flex-col">
            <p className="text-body-small font-medium text-text-secondary">신청 내용을 확인해 주세요.</p>
            <p className="text-body-small font-medium text-text-secondary">신청하면 새 요금제가 바로 적용돼요.</p>
            <p className="text-body-small font-medium text-text-secondary">
              이번 달 요금과 데이터는 지금 요금제와 새 요금제를 쓴 날짜만큼 나눠 계산해요.
            </p>
          </section>

          {/* 6. 요금 안내 문구 */}
          <section className="flex flex-col">
            <p className="text-12 font-medium text-text-secondary">모든 요금은 부가세 포함 금액입니다.</p>
            <p className="text-12 font-medium text-text-secondary">요금제, 구독료, 약정 정보는 예시 데이터입니다.</p>
          </section>
        </div>
      </main>

      <BottomCTA
        layout="double"
        secondary={
          <Button type="Secondary" size="xl" href={backHref}>
            취소
          </Button>
        }
        primary={
          <Button type="Primary" size="xl" state={isCurrent ? "Disabled" : "Default"} cta="apply" onClick={submit}>
            신청
          </Button>
        }
      />
    </div>
  );
}
