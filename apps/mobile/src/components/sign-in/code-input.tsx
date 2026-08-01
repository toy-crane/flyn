import { type Ref, useCallback, useImperativeHandle, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInput as TextInputInstance,
  View,
} from "react-native";
import Reanimated, { Keyframe, ReduceMotion } from "react-native-reanimated";
import { CODE_LENGTH, normalizeCode } from "../../lib/otp-code";

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, i) => i);
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

function borderClassName(invalid: boolean | undefined, active: boolean) {
  if (invalid) {
    return "border-danger";
  }

  return active ? "border-primary" : "border-transparent";
}

/**
 * 6칸으로 보이지만 입력을 받는 것은 그 위에 겹친 **투명한 단일 `TextInput`**
 * 하나다. 칸은 순수한 표시 레이어다.
 *
 * 필드를 하나로 두는 이유는 `textContentType="oneTimeCode"` 자동완성이다 —
 * 칸마다 필드를 두면 키보드 위 코드 제안이 깨진다. 처음에는 "6칸이면 자동완성이
 * 깨진다"고 봤으나 양자택일이 아니었다.
 *
 * 투명하게 만드는 방법도 정해져 있다. `opacity: 0`이나 크기 0이 아니라
 * **`color: "transparent"`** 다 — iOS는 보이지 않는 필드에 코드를 제안하지 않으므로
 * 필드는 칸 줄 전체 넓이를 그대로 유지하고 글리프와 캐럿만 감춘다.
 */
export interface CodeInputRef {
  focus: () => void;
}

export interface CodeInputProps {
  disabled?: boolean;
  invalid?: boolean;
  onChangeText: (next: string) => void;
  ref?: Ref<CodeInputRef>;
  value: string;
}

export function CodeInput({
  disabled,
  invalid,
  onChangeText,
  ref,
  value,
}: CodeInputProps) {
  const inputRef = useRef<TextInputInstance>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
    }),
    []
  );

  // maxLength를 걸지 않는 이유는 otp-code.ts의 주석에 있다 — 앞에서 자르면
  // 스크럽할 원문이 사라진다.
  const handleChangeText = useCallback(
    (next: string) => onChangeText(normalizeCode(next)),
    [onChangeText]
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
        testID="code-input-boxes"
      >
        {SLOTS.map((slot) => {
          const digit = value[slot];

          return (
            <View
              className={`h-14 flex-1 items-center justify-center rounded-xl border-2 bg-surface ${borderClassName(
                invalid,
                slot === cursor
              )}`}
              key={slot}
              style={{
                borderCurve: "continuous",
              }}
            >
              {digit ? (
                <Reanimated.View
                  entering={DIGIT_ENTERING}
                  key={`${slot}-${digit}`}
                  testID={`code-digit-${slot}`}
                >
                  <Text
                    className="text-2xl text-foreground"
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {digit}
                  </Text>
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
        editable={!disabled}
        keyboardType="number-pad"
        onChangeText={handleChangeText}
        ref={inputRef}
        selectionColor="transparent"
        style={[StyleSheet.absoluteFill, { color: "transparent" }]}
        textContentType="oneTimeCode"
        value={value}
      />
    </View>
  );
}
