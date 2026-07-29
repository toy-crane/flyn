import { Column, Text, TextInput, type TextInputProps } from "@expo/ui";
import {
  accessibilityLabel,
  font,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useAppTheme } from "../../theme/app-theme";

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
}

/**
 * 일반 form의 label·single-line input·오류를 한 단위로 그린다.
 * 검증과 submit은 소유하지 않고, 앱의 기본 input appearance만 소유한다.
 */
export function FormTextField({
  error,
  label,
  ...inputProps
}: FormTextFieldProps) {
  const app = useAppTheme();

  return (
    <Column alignment="start" spacing={8}>
      <Text
        modifiers={[
          font({ textStyle: "subheadline", weight: "semibold" }),
          foregroundStyle(app.mutedForeground),
        ]}
      >
        {label}
      </Text>

      <TextInput
        {...inputProps}
        cursorColor={app.primary}
        modifiers={[accessibilityLabel(label)]}
        placeholderTextColor={app.placeholder}
        style={{
          backgroundColor: app.surface,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        textStyle={{
          color: app.foreground,
          fontSize: 17,
        }}
      />

      {error ? (
        <Text
          modifiers={[
            font({ textStyle: "footnote" }),
            foregroundStyle(app.danger),
          ]}
        >
          {error}
        </Text>
      ) : null}
    </Column>
  );
}
