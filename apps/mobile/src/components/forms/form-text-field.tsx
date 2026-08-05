import { Column, Icon, Text } from "@expo/ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { useColors } from "../../theme/app-theme";
import { FormInput, type FormInputProps } from "./form-input";

export interface FormTextFieldProps extends Omit<FormInputProps, "label"> {
  error?: string;
  label: string;
}

/**
 * 일반 form의 label·single-line input·오류를 한 단위로 그린다.
 * 검증과 submit은 소유하지 않고, 앱의 기본 input appearance만 소유한다.
 */
export function FormTextField({
  error,
  invalid,
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

      <FormInput
        {...inputProps}
        invalid={Boolean(error) || invalid}
        label={label}
        trailing={
          trailing ??
          (error ? (
            <Icon
              color={colors.danger}
              name="exclamationmark.circle.fill"
              size={20}
            />
          ) : null)
        }
      />

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
