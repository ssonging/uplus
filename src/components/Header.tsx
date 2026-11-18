import Link from "next/link";
import IconArrowLeft from "@/components/IconArrowLeft";
import Logo from "@/components/Logo";

// Figma Header. 공통 높이 56, 좌우 패딩 16·상하 4. 본문 스크롤 밖에 둔다.
// root: 왼쪽 제목·Logo, heading/h4, 내부 간격 12.
// default: 뒤로가기(icon/arrowLeft)·중앙 제목, subtitle/default, 내부 간격 8. 오른쪽은 24×24 빈 공간.
type HeaderProps =
  | {
      type: "root";
      title: string;
    }
  | {
      type: "default";
      title: string;
      /** 뒤로가기 아이콘이 가는 곳 */
      backHref: string;
    };

export default function Header(props: HeaderProps) {
  if (props.type === "default") {
    return (
      <header className="flex h-56 w-full shrink-0 items-center gap-8 bg-bg-surface px-16 py-4">
        <Link href={props.backHref} aria-label="뒤로" className="flex h-24 w-24 shrink-0 text-icon-default">
          <IconArrowLeft />
        </Link>
        <h1 className="flex-1 text-center text-subtitle font-semibold text-text-primary">{props.title}</h1>
        <span className="h-24 w-24 shrink-0" aria-hidden="true" />
      </header>
    );
  }
  return (
    <header className="flex h-56 w-full shrink-0 items-center gap-12 bg-bg-surface px-16 py-4">
      <h1 className="text-heading-h4 font-bold text-text-primary">{props.title}</h1>
      <Logo />
    </header>
  );
}
