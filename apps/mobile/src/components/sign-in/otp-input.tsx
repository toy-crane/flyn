import { Typography } from "heroui-native";
import { type Ref, useCallback, useImperativeHandle, useRef } from "react";
import {
  TextInput,
  type TextInput as TextInputInstance,
  View,
} from "react-native";
import Reanimated, { Keyframe, ReduceMotion } from "react-native-reanimated";
import { CODE_LENGTH, normalizeCode } from "../../lib/otp-code";

/**
 * 6칸으로 보이지만 입력을 받는 것은 그 위에 겹친 **투명한 단일 `TextInput`**
 * 하나다. 칸은 순수한 표시 레이어다.
 *
 * HeroUI `InputOTP` 대신 남은 커스텀이다 — 라이브러리 primitive가 밑단
 * `TextInput`에 `maxLength`를 박아 두고 `textInputProps`에서 그 키를 빼기 때문에
 * 장식이 섞인 붙여넣기가 네이티브 단계에서 잘린다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 판정 근거).
 * 색·모서리·간격은 전부 HeroUI 토큰을 그대로 소비한다.
 *
 * 필드를 하나로 두는 이유는 `textContentType="oneTimeCode"` 자동완성이다 —
 * 칸마다 필드를 두면 키보드 위 코드 제안이 깨진다.
 *
 * 투명하게 만드는 방법도 정해져 있다. `opacity: 0`이나 크기 0이 아니라
 * **`color: "transparent"`** 다 — iOS는 보이지 않는 필드에 코드를 제안하지 않으므로
 * 필드는 칸 줄 전체 넓이를 그대로 유지하고 글리프와 캐럿만 감춘다.
 */

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, i) => i);

/**
 * 직접 입력한 칸에만 주는 짧은 피드백. AutoFill·붙여넣기는 최종 값을 즉시
 * 보여야 하므로 그때는 걸지 않는다(docs/decisions/native-motion.md).
 */
const DIGIT_ENTERING = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.96 }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
})
  .duration(140)
  .reduceMotion(ReduceMotion.System);

function slotBorder(active: boolean, invalid: boolean): string {
  if (invalid) {
    return "border-danger";
  }

  return active ? "border-accent" : "border-transparent";
}

export interface OtpInputRef {
  focus: () => void;
}

export interface OtpInputProps {
  disabled?: boolean;
  invalid?: boolean;
  onChangeText: (next: string) => void;
  ref?: Ref<OtpInputRef>;
  value: string;
}

export function OtpInput({
  disabled,
  invalid,
  onChangeText,
  ref,
  value,
}: OtpInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  // 한 번에 두 자 이상 들어오면 사람이 친 것이 아니다.
  const bulk = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
    }),
    []
  );

  // maxLength를 걸지 않는 이유는 otp-code.ts의 주석에 있다 — 앞에서 자르면
  // 스크럽할 원문이 사라진다. HeroUI InputOTP가 탈락한 지점도 여기다.
  const handleChangeText = useCallback(
    (next: string) => {
      const normalized = normalizeCode(next);

      bulk.current = normalized.length - value.length > 1;
      onChangeText(normalized);
    },
    [onChangeText, value.length]
  );

  const cursor = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <View className="relative">
      <View
        accessibilityElementsHidden
        className="flex-row gap-2"
        importantForAccessibility="no-hide-descendants"
        // 칸이 탭을 가져가면 키보드가 뜨지 않는다.
        pointerEvents="none"
        testID="otp-slots"
      >
        {SLOTS.map((slot) => {
          const digit = value[slot];

          return (
            <View
              className={`h-12 flex-1 items-center justify-center rounded-field border-2 bg-field ${slotBorder(
                slot === cursor,
                Boolean(invalid)
              )}`}
              key={slot}
              testID={`otp-slot-${slot}`}
            >
              {digit ? (
                <Reanimated.View
                  entering={bulk.current ? undefined : DIGIT_ENTERING}
                  key={`${slot}-${digit}`}
                  testID={`otp-digit-${slot}`}
                >
                  <Typography className="text-lg" weight="semibold">
                    {digit}
                  </Typography>
                </Reanimated.View>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* 반드시 마지막 형제여야 한다 — RN은 뒤 형제가 위에 그려지고 먼저 히트테스트된다. */}
      <TextInput
        accessibilityLabel="인증 코드 6자리"
        accessibilityState={{ disabled }}
        autoComplete="one-time-code"
        autoFocus
        caretHidden
        // 칸 줄 전체를 덮되 글리프와 캐럿만 감춘다.
        className="absolute inset-0 text-transparent"
        editable={!disabled}
        keyboardType="number-pad"
        onChangeText={handleChangeText}
        ref={inputRef}
        selectionColor="transparent"
        textContentType="oneTimeCode"
        value={value}
      />
    </View>
  );
}
