// Figma icon/doneMark: 64×64(spacing/64), radius/full, fill/primary 원 안에 icon/on-dark 체크. 변형·등록 속성 없음.
// 안쪽 체크(Figma 30×30, 위치 17)는 viewBox 0 0 64 64 좌표로 그린다(icon/check 24 도형을 1.25배, 17 이동).
export default function IconDoneMark() {
  return (
    <span aria-hidden="true" className="flex h-64 w-64 shrink-0 rounded-full bg-fill-primary">
      <svg viewBox="0 0 64 64" className="h-64 w-64 fill-icon-on-dark">
        <path d="M28.25 37.21 23.04 32l-1.775 1.7625L28.25 40.75l15-15-1.7625-1.7625z" />
      </svg>
    </span>
  );
}
