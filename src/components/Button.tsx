import Link from "next/link";
import type { ReactNode } from "react";

// Figma Button. radius/8, 라벨 font-size/body.
// Secondary Default: surface/default 배경·border/default 1, 라벨 text/primary(실제 Regular 400).
// Primary Default: fill/primary 배경, 라벨 text/on-dark(실제 Regular 400).
// Primary Disabled: fill/disabled 배경, 라벨 body/medium(Medium 500). 실제 <button disabled>로 그린다.
// sm: 원본 높이 40 + 외곽선 = 42 → 줄높이 24 + 상하 8 + 외곽선 1×2. xl: 높이 52(h-button-xl), 좌우 24, 부모 폭을 채운다.
type ButtonProps = {
  type: "Primary" | "Secondary";
  size: "sm" | "xl";
  state?: "Default" | "Disabled";
  /** State=Default일 때 가는 곳 */
  href?: string;
  /** 판정 스크립트가 찾는 신청 버튼 표시(BR10). 신청 버튼에만 'apply'. */
  cta?: "apply";
  children: ReactNode;
};

const BASE = "inline-flex shrink-0 items-center justify-center rounded-8";

export default function Button({ type, size, state = "Default", href, cta, children }: ButtonProps) {
  const sizeClass = size === "xl" ? "h-button-xl w-full px-24" : "px-24 py-8";
  let lookClass = "border border-border-default bg-surface-default text-body font-regular text-text-primary";
  if (type === "Primary") {
    lookClass =
      state === "Disabled"
        ? "bg-fill-disabled text-body font-medium text-text-on-disabled"
        : "bg-fill-primary text-body font-regular text-text-on-dark";
  }
  const className = `${BASE} ${sizeClass} ${lookClass}`;

  if (state === "Disabled" || !href) {
    return (
      <button type="button" disabled={state === "Disabled"} data-cta={cta} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} data-cta={cta} className={className}>
      {children}
    </Link>
  );
}
