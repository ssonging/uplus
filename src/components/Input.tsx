import type { ChangeEvent, Ref } from "react";
import IconError from "@/components/IconError";

// Figma Input(4004:787). State=default | focus | filled | caution (disabled는 아직 쓰지 않음).
// 필드: 높이 58(h-input), radius/0, 아래 외곽선만, 왼쪽 여백 2·오른쪽 0·위아래 12, 내부 간격 10.
// 안쪽 글자 묶음 좌우 2, 글자 font-size/body(실제 Regular 400), 값 text/primary, placeholder text/placeholder.
// 아래 외곽선 색: default·filled border/default, focus border/focus, caution border/error.
// caution: 필드 아래 12 간격에 20×20 icon/error + 메시지(body/small-medium, text/error), 간격 4.
//
// 아래 외곽선 1.5px(Figma 4004:789·4004:805·4004:813): 승인 예외 border-selected(네 변 1.5px)에
// 나머지 세 변을 0으로 지워 아래 변만 남긴다(선 두께 0 클래스는 사용자 승인 2026-11-18).
export type InputState = "default" | "focus" | "filled" | "caution";

type InputProps = {
  id: string;
  name: string;
  type: "text" | "tel" | "email";
  state: InputState;
  value: string;
  placeholder: string;
  /** caution일 때 보이는 메시지 */
  message?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
};

const FIELD_BASE =
  "flex h-input w-full items-center gap-10 rounded-0 border-selected border-x-0 border-t-0 pl-2 pr-0 py-12";

export default function Input({
  id,
  name,
  type,
  state,
  value,
  placeholder,
  message,
  onChange,
  onFocus,
  onBlur,
  ref,
}: InputProps) {
  let lineColor = "border-b-border-default";
  if (state === "focus") lineColor = "border-b-border-focus";
  if (state === "caution") lineColor = "border-b-border-error";
  const messageId = `${id}-message`;
  const showMessage = state === "caution" && Boolean(message);

  return (
    <div className="flex w-full flex-col gap-12">
      <div className={`${FIELD_BASE} ${lineColor}`}>
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={state === "caution" ? true : undefined}
          aria-describedby={showMessage ? messageId : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="min-w-0 flex-1 px-2 outline-none text-body font-regular text-text-primary placeholder:text-text-placeholder"
        />
      </div>
      {showMessage ? (
        <p id={messageId} className="flex items-center gap-4 text-body-small font-medium text-text-error">
          <IconError />
          {message}
        </p>
      ) : null}
    </div>
  );
}
