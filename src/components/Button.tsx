import Link from "next/link";
import type { ReactNode } from "react";

// Figma Button. 지금은 Type=Secondary, Size=sm, State=Default만 쓴다.
// Secondary Default: surface/default 배경·border/default 1, radius/8, 라벨 font-size/body(실제 Regular 400).
// sm 원본 높이 40 + 외곽선 = 42 → 줄높이 24 + 상하 8 + 외곽선 1×2.
type ButtonProps = {
  type: "Secondary";
  size: "sm";
  href: string;
  children: ReactNode;
};

export default function Button({ href, children }: ButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center justify-center rounded-8 border border-border-default bg-surface-default px-24 py-8 text-body font-regular text-text-primary"
    >
      {children}
    </Link>
  );
}
