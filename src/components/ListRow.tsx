// Figma List/Row. 지금은 Type=default(정보 이름과 값을 나란히)만 쓴다.
// 패딩 상하 12·좌우 4, 간격 12. 구분선(border/subtle)은 부모 목록의 divide로 그린다.
type ListRowProps = {
  type?: "default";
  label: string;
  value: string;
};

export default function ListRow({ label, value }: ListRowProps) {
  return (
    <div className="flex items-center justify-between gap-12 px-4 py-12">
      <span className="text-body-small font-medium text-text-secondary">{label}</span>
      <span className="text-right text-body-small font-semibold text-text-primary">{value}</span>
    </div>
  );
}
