// 예시 데이터 — 모든 값은 예시다(실제 값은 미정). 고객 개인 정보는 넣지 않는다.
// 판정 스크립트가 node로 바로 읽으므로 다른 파일의 값을 import하지 않는다.

export type SubscriptionId = "youtube" | "netflix" | "disney" | "tving";

/** 데이터 양: GB 숫자 또는 '무제한' */
export type DataAmount = number | "무제한";

export type Plan = {
  id: string;
  name: string;
  /** 월 요금(원) */
  monthlyFee: number;
  dataAmount: DataAmount;
  bundledSubscriptions: SubscriptionId[];
};

export type Subscription = {
  id: SubscriptionId;
  name: string;
  /** 대표 구독료(원) */
  representativeFee: number;
};

export type DataFilter = {
  id: string;
  label: string;
  /** null = 기준 없음('전체') */
  minData: DataAmount | null;
};

export type DataUsage = {
  /** GB */
  usedThisMonth: number;
  /** GB */
  remaining: number;
  /** 'M월 D일' */
  resetDate: string;
  /** GB */
  usedLastMonth: number;
};

/** 요금제 목록 (예시) */
export const plans: Plan[] = [
  { id: "lite", name: "5G 라이트", monthlyFee: 39000, dataAmount: 8, bundledSubscriptions: [] },
  { id: "slim", name: "5G 슬림", monthlyFee: 47000, dataAmount: 15, bundledSubscriptions: ["youtube"] },
  { id: "standard", name: "5G 스탠다드", monthlyFee: 55000, dataAmount: 50, bundledSubscriptions: [] },
  { id: "plus", name: "5G 플러스", monthlyFee: 69000, dataAmount: 100, bundledSubscriptions: ["netflix"] },
  { id: "premium", name: "5G 프리미어", monthlyFee: 85000, dataAmount: "무제한", bundledSubscriptions: ["youtube", "disney"] },
];

/** 지금 쓰는 요금제 (예시) */
export const currentPlanId: string = "standard";

/** 데이터 사용량 (예시) */
export const dataUsage: DataUsage = {
  usedThisMonth: 12.4,
  remaining: 37.6,
  resetDate: "12월 1일",
  usedLastMonth: 41.2,
};

/** 구독 서비스·대표 구독료 (예시). 이 4개뿐(BR12), 화면 줄 순서와 같다. */
export const subscriptions: Subscription[] = [
  { id: "youtube", name: "유튜브", representativeFee: 14900 },
  { id: "netflix", name: "넷플릭스", representativeFee: 13500 },
  { id: "disney", name: "디즈니플러스", representativeFee: 9900 },
  { id: "tving", name: "티빙", representativeFee: 13900 },
];

/** 데이터 양 필터 기준값 (예시). 첫 항목 '전체'가 기본 선택. */
export const filters: DataFilter[] = [
  { id: "all", label: "전체", minData: null },
  { id: "10gb", label: "10GB 이상", minData: 10 },
  { id: "50gb", label: "50GB 이상", minData: 50 },
  { id: "unlimited", label: "무제한", minData: "무제한" },
];
