"use server";

import { redirect } from "next/navigation";
import { contract, currentPlanId, plans, subscriptions, type SubscriptionId } from "@/data/example";
import { createClient } from "@/lib/supabase/server";

/** 브라우저가 보내는 값: 요금제 id, 고른 구독, 입력 4개, 동의 2개. 금액은 받지 않는다. */
export type ApplyInput = {
  id: string;
  subs: string[];
  name: string;
  phone: string;
  email: string;
  address: string;
  termsAgreed: boolean;
  refundAgreed: boolean;
};

export type ApplyResult = { ok: false };

const FAIL: ApplyResult = { ok: false };

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const feeOf = (ids: SubscriptionId[]) =>
  subscriptions.filter((s) => ids.includes(s.id)).reduce((sum, s) => sum + s.representativeFee, 0);

/**
 * 구독 신청 저장. 화면의 계산을 믿지 않고 example.ts 값으로 다시 계산·검사한다.
 * 성공하면 완료 화면으로 이동(redirect), 실패하면 { ok: false }.
 */
export async function submitApplication(input: ApplyInput): Promise<ApplyResult> {
  const id = text(input?.id);
  const plan = plans.find((p) => p.id === id);
  const currentPlan = plans.find((p) => p.id === currentPlanId);
  if (!plan || !currentPlan) return FAIL;

  // BR10: 지금 쓰는 요금제는 신청할 수 없다
  if (plan.id === currentPlanId) return FAIL;

  // 고른 구독: 4개 id 밖의 값·중복 제거, 예시 줄 순서
  const rawSubs = Array.isArray(input?.subs) ? input.subs.filter((s) => typeof s === "string") : [];
  const selectedSubs: SubscriptionId[] = subscriptions.filter((s) => rawSubs.includes(s.id)).map((s) => s.id);

  // 필수 입력(F4-3)
  const name = text(input?.name);
  const phone = text(input?.phone);
  const email = text(input?.email);
  const address = text(input?.address);
  if (!name || !phone || !email || !address) return FAIL;

  // 약관 동의(F4-2)
  if (input?.termsAgreed !== true) return FAIL;

  // 지원금 반환(F3-2~F3-4, BR3~BR7): 네 조건이 모두 맞을 때만, 금액은 원 단위 아래 버림
  const refundContract =
    contract !== null &&
    contract.type === "공시지원금" &&
    contract.remainingMonths > 0 &&
    plan.monthlyFee < contract.baseAmount
      ? contract
      : null;
  const refundAmount = refundContract
    ? Math.floor((refundContract.subsidy * refundContract.remainingMonths) / refundContract.totalMonths)
    : 0;
  const refundAgreed = refundContract !== null && input?.refundAgreed === true;
  if (refundContract && !refundAgreed) return FAIL;

  // 금액(F4-1, BR9)
  const currentTotal = currentPlan.monthlyFee + feeOf(selectedSubs);
  const unbundled = selectedSubs.filter((s) => !plan.bundledSubscriptions.includes(s));
  const newTotal = plan.monthlyFee + feeOf(unbundled);

  let savedId: string;
  try {
    const supabase = await createClient();
    if (!supabase) return FAIL;

    // 로그인 화면이 없으므로 세션이 없으면 익명 로그인
    let {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) return FAIL;
      user = data.user;
    }

    const { data, error } = await supabase
      .from("plan_change_applications")
      .insert({
        user_id: user.id,
        current_plan_id: currentPlan.id,
        current_plan_name: currentPlan.name,
        current_monthly_fee: currentPlan.monthlyFee,
        new_plan_id: plan.id,
        new_plan_name: plan.name,
        new_monthly_fee: plan.monthlyFee,
        selected_subscriptions: selectedSubs,
        current_total_fee: currentTotal,
        new_total_fee: newTotal,
        contract_type: contract?.type ?? null,
        subsidy_refund_amount: refundAmount,
        refund_agreed: refundAgreed,
        terms_agreed: true,
        applicant_name: name,
        applicant_phone: phone,
        applicant_email: email,
        applicant_address: address,
      })
      .select("id")
      .single();
    if (error || !data || typeof data.id !== "string") return FAIL;
    savedId = data.id;
  } catch {
    return FAIL;
  }

  // 신청자 정보는 URL에 넣지 않는다. 저장된 id와 기존 subs만.
  const params = new URLSearchParams({ app: savedId });
  if (selectedSubs.length) params.set("subs", selectedSubs.join(","));
  redirect(`/plans/${encodeURIComponent(plan.id)}/complete?${params.toString().replace(/%2C/g, ",")}`);
}
