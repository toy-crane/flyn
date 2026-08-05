import { Row, TextInput, type TextInputProps } from "@expo/ui";
import type { ReactNode } from "react";
import { useColors } from "../../theme/app-theme";
import { getFormInputModifiers } from "./form-input-modifiers";

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
  const modifiers = getFormInputModifiers({
    danger: colors.danger,
    fill: colors.inputFill,
    invalid,
    label,
  });

  return (
    <Row
      alignment="center"
      modifiers={modifiers.surface}
      spacing={0}
      style={{
        borderRadius: 26,
        height: 52,
        paddingRight: trailing ? 16 : 0,
      }}
      testID={testID ? `${testID}-surface` : undefined}
    >
      <TextInput
        {...inputProps}
        modifiers={modifiers.input}
        style={{ height: 52, paddingHorizontal: 18 }}
        testID={testID}
      />
      {trailing}
    </Row>
  );
}
