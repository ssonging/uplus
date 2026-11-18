// Figma Checkbox: State=default | active. 24×24 선택 표시만 그린다(라벨은 바깥에서 구성).
// 실제 입력은 바깥 label 안의 숨긴 input이 맡는다.
type CheckboxProps = {
  state: "default" | "active";
};

export default function Checkbox({ state }: CheckboxProps) {
  if (state === "active") {
    return (
      <span aria-hidden="true" className="flex h-24 w-24 shrink-0 items-center justify-center rounded-4 bg-fill-primary">
        <svg viewBox="0 0 24 24" className="h-24 w-24 fill-icon-on-dark">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-24 w-24 shrink-0 rounded-4 border border-border-default bg-bg-surface"
    />
  );
}
