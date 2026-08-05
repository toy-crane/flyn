import { Column, Host, ScrollView } from "@expo/ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";
import { useColors } from "../../theme/app-theme";
import { FormSubmitButton } from "../forms/form-submit-button";

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
  const colors = useColors();

  return (
    <Host style={{ backgroundColor: colors.background, flex: 1 }}>
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
