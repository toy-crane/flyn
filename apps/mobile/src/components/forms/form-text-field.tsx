import { Column, Row, Text, TextInput, type TextInputProps } from "@expo/ui";
import {
  accessibilityLabel,
  font,
  foregroundStyle,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";
import { useColors } from "../../theme/app-theme";

type OwnedTextInputProps =
  | "cursorColor"
  | "modifiers"
  | "placeholderTextColor"
  | "style"
  | "textStyle";

export interface FormTextFieldProps
  extends Omit<TextInputProps, OwnedTextInputProps> {
  error?: string;
  label: string;
  trailing?: ReactNode;
}

/**
 * 일반 form의 label·single-line input·오류를 한 단위로 그린다.
 * 검증과 submit은 소유하지 않고, 앱의 기본 input appearance만 소유한다.
 */
export function FormTextField({
  error,
  label,
  trailing,
  ...inputProps
}: FormTextFieldProps) {
  const colors = useColors();

  return (
    <Column alignment="start" spacing={8}>
      <Text
        modifiers={[
          font({ textStyle: "subheadline", weight: "semibold" }),
          foregroundStyle({ style: "secondary", type: "hierarchical" }),
        ]}
      >
        {label}
      </Text>

      <Row
        alignment="center"
        modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
        spacing={10}
      >
        <TextInput
          {...inputProps}
          modifiers={[
            frame({ maxWidth: Number.POSITIVE_INFINITY }),
            accessibilityLabel(label),
          ]}
        />
        {trailing}
      </Row>

      {error ? (
        <Text
          modifiers={[
            font({ textStyle: "footnote" }),
            foregroundStyle(colors.danger),
          ]}
        >
          {error}
        </Text>
      ) : null}
    </Column>
  );
}
