import type { ReactNode } from "react";

// Figma BottomCTA. Layout=single(주요 버튼 1개, 폭 가득) | double(보조 버튼 1 : 주요 버튼 2).
// bg/surface, 위 경계 border/subtle 1, 패딩 상 12·좌우 16·하 32, 버튼 간격 8. 원본 높이 97.
// 버튼 라벨은 안에 넣는 Button의 Label로 바꾼다. 본문 스크롤 밖, 화면 바닥에 둔다.
type BottomCTAProps =
  | {
      layout: "single";
      primary: ReactNode;
    }
  | {
      layout: "double";
      secondary: ReactNode;
      primary: ReactNode;
    };

export default function BottomCTA(props: BottomCTAProps) {
  if (props.layout === "single") {
    return (
      <div className="flex w-full shrink-0 gap-8 border-t border-border-subtle bg-bg-surface px-16 pt-12 pb-32">
        <div className="flex flex-1">{props.primary}</div>
      </div>
    );
  }
  return (
    <div className="flex w-full shrink-0 gap-8 border-t border-border-subtle bg-bg-surface px-16 pt-12 pb-32">
      <div className="flex flex-1">{props.secondary}</div>
      <div className="flex flex-2">{props.primary}</div>
    </div>
  );
}
