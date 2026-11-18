"use client";

// Figma FilterChip: State=default | selected. 높이 40, 패딩 상하 8·좌우 16, radius/full.
// default: bg/surface·border/default, 라벨 body/small-medium text/primary.
// selected: fill/secondary, 라벨 text/on-dark(실제 Regular 400).
type FilterChipProps = {
  label: string;
  state: "default" | "selected";
  onClick?: () => void;
};

export default function FilterChip({ label, state, onClick }: FilterChipProps) {
  const selected = state === "selected";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        selected
          ? "flex h-40 shrink-0 items-center rounded-full border border-transparent bg-fill-secondary px-16 py-8 text-body-small font-regular text-text-on-dark"
          : "flex h-40 shrink-0 items-center rounded-full border border-border-default bg-bg-surface px-16 py-8 text-body-small font-medium text-text-primary"
      }
    >
      {label}
    </button>
  );
}
