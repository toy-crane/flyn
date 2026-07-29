import { Column, Host, ScrollView, Text, useNativeState } from "@expo/ui";
import { font, foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { useCallback, useState } from "react";
import { isEmailSubmittable } from "../../lib/otp-code";
import { useAppTheme } from "../../theme/app-theme";
import { FormSubmitButton } from "../forms/form-submit-button";
import { FormTextField } from "../forms/form-text-field";

/**
 * 이메일 입력만 하는 native form. 상단의 안내·입력과 하단 submit 사이를
 * native ScrollView가 채우므로 키보드가 열려도 CTA는 키보드 위에 남는다.
 */
export function EmailForm({
  failure,
  onSubmit,
  pending,
}: {
  failure?: string;
  onSubmit: (email: string) => void;
  pending?: boolean;
}) {
  const app = useAppTheme();
  const email = useNativeState("");
  // 버튼 잠금을 판단하려면 렌더가 필요해서 React 상태에 한 번 더 비춘다.
  // **이 미러는 잠금 판단에만 쓴다.** 한 프레임 늦어도 잠금은 곧 따라잡지만,
  // 제출값을 여기서 읽으면 마지막 글자가 빠진 주소가 나간다.
  const [typed, setTyped] = useState("");

  const handleTextChange = useCallback(
    (next: string) => {
      email.value = next;
      setTyped(next);
    },
    [email]
  );

  const submit = useCallback(() => {
    // 진실은 네이티브 상태다. 값은 네이티브 쪽에서 동기로 갱신되어 React 렌더보다
    // 앞서므로, 미러를 읽으면 방금 친 글자를 놓친다 — 시뮬레이터에서
    // verify@example.test가 verify@example.tes로 발송됐다.
    const address = email.value.trim();

    if (isEmailSubmittable(address) && !pending) {
      onSubmit(address);
    }
  }, [email, onSubmit, pending]);

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
              코드를 받을 이메일 주소를 입력해 주세요.
            </Text>

            <FormTextField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              autoFocus
              error={failure}
              keyboardType="email-address"
              label="이메일 주소"
              onChangeText={handleTextChange}
              onSubmitEditing={submit}
              placeholder="name@example.com"
              returnKeyType="next"
              value={email}
            />
          </Column>
        </ScrollView>

        <FormSubmitButton
          disabled={!isEmailSubmittable(typed)}
          label="코드 받기"
          onPress={submit}
          pending={pending}
        />
      </Column>
    </Host>
  );
}
