// Figma Tag: 단독 컴포넌트(변형·속성 없음). 기본 라벨 '추천'.
// 배경 border/subtle, 라벨 caption/bold, radius/999, 높이 h-tag(26).
type TagProps = {
  label?: string;
};

export default function Tag({ label = "추천" }: TagProps) {
  return (
    <span className="inline-flex h-tag items-center self-start rounded-999 bg-border-subtle px-10 text-caption font-bold text-text-secondary">
      {label}
    </span>
  );
}
