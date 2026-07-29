import { Column, Host, ScrollView, Text, useNativeState } from "@expo/ui";
import { font, foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { type ReactNode, useCallback, useState } from "react";
import {
  DISPLAY_NAME_MAX,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../../lib/display-name";
import { useAppTheme } from "../../theme/app-theme";
import { FormSubmitButton } from "../forms/form-submit-button";
import { FormTextField } from "../forms/form-text-field";

/**
 * 온보딩과 설정의 편집이 **같은 화면을 쓴다**. 검증·저장 규칙이 갈리지 않게
 * 하는 가장 확실한 방법은 규칙을 공유하는 게 아니라 화면을 공유하는 것이다.
 *
 * universal `@expo/ui`로 만든다 — RN 경계가 필요한 것이 하나도 없다.
 *
 * background와 interactive tint는 `Host`에 CSS 앱 테마를 전달하고, 나머지
 * 텍스트와 control 상태는 SwiftUI의 기본 계층 표현을 유지한다.
 *
 * **`initialValue`는 마운트 때 한 번만 읽는다.** 온보딩은 provider가 준 이름
 * 후보를, 편집은 지금 저장된 이름을 미리 채우는데, 둘 다 사용자가 고치는 중에
 * 밖에서 값이 바뀌어 입력을 덮어써서는 안 된다. 후보를 늦게 얻는 쪽(온보딩)은
 * 얻은 뒤에 이 폼을 그린다.
 */
export function DisplayNameForm({
  description,
  failure,
  initialValue,
  onSubmit,
  pending,
  secondaryAction,
  submitLabel,
}: {
  description: string;
  failure?: string;
  initialValue: string;
  onSubmit: (name: string) => void;
  pending?: boolean;
  /** 제출 말고 이 화면에서 할 수 있는 다른 일. 온보딩의 탈출구가 여기 온다. */
  secondaryAction?: ReactNode;
  submitLabel: string;
}) {
  const app = useAppTheme();
  const name = useNativeState(initialValue);
  // 버튼 잠금을 판단하려면 렌더가 필요해서 React 상태에 한 번 더 비춘다.
  // **이 미러는 잠금 판단에만 쓴다** — 제출값을 여기서 읽으면 네이티브 쪽이
  // 앞서 있는 만큼 마지막 글자가 빠진다.
  const [typed, setTyped] = useState(initialValue);

  const handleChangeText = useCallback(
    (next: string) => {
      name.value = next;
      setTyped(next);
    },
    [name]
  );

  const submit = useCallback(
    (text: string) => {
      const trimmed = normalizeDisplayName(text);

      if (isDisplayNameSubmittable(trimmed) && !pending) {
        onSubmit(trimmed);
      }
    },
    [onSubmit, pending]
  );

  // 버튼에서는 네이티브 상태가 진실이다. 리턴 키는 현재 값을 함께 준다.
  const handlePress = useCallback(() => submit(name.value), [name, submit]);

  return (
    <Host
      seedColor={app.primary}
      style={{ backgroundColor: app.background, flex: 1 }}
    >
      <Column
        alignment="start"
        modifiers={[
          frame({
            alignment: "topLeading",
            maxHeight: Number.POSITIVE_INFINITY,
            maxWidth: Number.POSITIVE_INFINITY,
          }),
        ]}
        spacing={12}
        style={{
          paddingBottom: 12,
          paddingHorizontal: 20,
          paddingTop: 24,
        }}
      >
        <ScrollView
          modifiers={[
            frame({
              alignment: "topLeading",
              maxHeight: Number.POSITIVE_INFINITY,
              maxWidth: Number.POSITIVE_INFINITY,
            }),
          ]}
          showsIndicators={false}
        >
          <Column alignment="start" spacing={16}>
            <Text
              modifiers={[
                font({ textStyle: "subheadline" }),
                foregroundStyle({
                  style: "secondary",
                  type: "hierarchical",
                }),
              ]}
            >
              {description}
            </Text>

            <FormTextField
              autoComplete="nickname"
              autoFocus
              error={failure}
              label="표시 이름"
              maxLength={DISPLAY_NAME_MAX}
              onChangeText={handleChangeText}
              onSubmitEditing={submit}
              placeholder="이름을 입력해 주세요"
              returnKeyType="done"
              value={name}
            />
          </Column>
        </ScrollView>

        {secondaryAction}

        <FormSubmitButton
          disabled={!isDisplayNameSubmittable(typed)}
          label={submitLabel}
          onPress={handlePress}
          pending={pending}
        />
      </Column>
    </Host>
  );
}
