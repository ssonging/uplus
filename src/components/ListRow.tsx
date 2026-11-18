// Figma List/Row. 패딩 상하 12·좌우 4, 간격 12. 구분선(border/subtle)은 부모 목록의 divide로 그린다.
// default: 정보 이름(text/secondary)과 값(text/primary)을 나란히.
// check: 혜택·포함 항목. 불릿 6×6(icon/accent) + Label(text/primary) + Value(text/accent, 필요 없으면 '').
type ListRowProps = {
  type?: "default" | "check";
  label: string;
  value: string;
};

export default function ListRow({ type = "default", label, value }: ListRowProps) {
  if (type === "check") {
    return (
      <div className="flex items-center gap-12 px-4 py-12">
        <span className="h-6 w-6 shrink-0 rounded-full bg-icon-accent" aria-hidden="true" />
        <span className="flex-1 text-body-small font-medium text-text-primary">{label}</span>
        {value ? <span className="text-right text-body-small font-semibold text-text-accent">{value}</span> : null}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-12 px-4 py-12">
      <span className="text-body-small font-medium text-text-secondary">{label}</span>
      <span className="text-right text-body-small font-semibold text-text-primary">{value}</span>
    </div>
  );
}
