import Logo from "@/components/Logo";

// Figma Header. 지금은 Type=root(왼쪽 제목·Logo, heading/h4, 내부 간격 12)만 쓴다.
type HeaderProps = {
  type: "root";
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-56 w-full shrink-0 items-center gap-12 bg-bg-surface px-16 py-4">
      <h1 className="text-heading-h4 font-bold text-text-primary">{title}</h1>
      <Logo />
    </header>
  );
}
