import { Row, TextInput, type TextInputProps } from "@expo/ui";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import {
  accessibilityLabel,
  frame,
  textFieldStyle,
} from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";
import { useColors } from "../../theme/app-theme";

type OwnedTextInputProps =
  | "cursorColor"
  | "modifiers"
  | "placeholderTextColor"
  | "style"
  | "textStyle";

export interface FormInputProps
  extends Omit<TextInputProps, OwnedTextInputProps> {
  invalid?: boolean;
  label: string;
  trailing?: ReactNode;
}

/**
 * 일반 form의 single-line input appearance를 그린다.
 * 값·검증·submit은 호출자가 소유하고 renderer별 native state 계약은 유지한다.
 */
export function FormInput({
  invalid = false,
  label,
  testID,
  trailing,
  ...inputProps
}: FormInputProps) {
  const colors = useColors();

  return (
    <Row
      alignment="center"
      modifiers={[
        frame({ height: 52, maxWidth: Number.POSITIVE_INFINITY }),
        fillMaxWidth(),
      ]}
      spacing={0}
      style={{
        backgroundColor: colors.inputFill,
        borderColor: colors.danger,
        borderRadius: 26,
        borderWidth: invalid ? 1 : 0,
        height: 52,
        paddingRight: trailing ? 16 : 0,
      }}
      testID={testID ? `${testID}-surface` : undefined}
    >
      <TextInput
        {...inputProps}
        modifiers={[
          textFieldStyle("plain"),
          frame({ height: 52, maxWidth: Number.POSITIVE_INFINITY }),
          weight(1),
          accessibilityLabel(label),
        ]}
        style={{ height: 52, paddingHorizontal: 18 }}
        testID={testID}
      />
      {trailing}
    </Row>
  );
}
