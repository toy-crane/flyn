import { Button, Column, Host, ScrollView } from "@expo/ui";
import { foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";
import { Alert } from "react-native";
import { signOut } from "../../lib/auth/sign-out";
import { useAppTheme } from "../../theme/app-theme";
import { FormSubmitButton } from "../forms/form-submit-button";

function confirmSignOut() {
  Alert.alert("로그아웃할까요?", "닉네임과 아이디는 다음에 정할 수 있어요.", [
    { style: "cancel", text: "취소" },
    { onPress: () => signOut(), style: "default", text: "로그아웃" },
  ]);
}

export function OnboardingForm({
  children,
  disabled,
  onSubmit,
  pending,
  submitLabel,
}: {
  children: ReactNode;
  disabled: boolean;
  onSubmit: () => void;
  pending: boolean;
  submitLabel: string;
}) {
  const app = useAppTheme();

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
          {children}
        </ScrollView>

        <Button
          label="로그아웃"
          modifiers={[foregroundStyle(app.primary)]}
          onPress={confirmSignOut}
          variant="text"
        />

        <FormSubmitButton
          disabled={disabled}
          label={submitLabel}
          onPress={onSubmit}
          pending={pending}
        />
      </Column>
    </Host>
  );
}
