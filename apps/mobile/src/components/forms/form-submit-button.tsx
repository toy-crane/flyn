import { Button, Row, Text } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";

export interface FormSubmitButtonProps {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  pending?: boolean;
}

/** 일반 form의 하단 submit과 그 자리의 native progress를 함께 소유한다. */
export function FormSubmitButton({
  disabled,
  label,
  onPress,
  pending,
}: FormSubmitButtonProps) {
  const locked = Boolean(disabled || pending);

  return (
    <Button disabled={locked} onPress={onPress}>
      <Row
        alignment="center"
        modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
        spacing={8}
        testID="form-submit-content"
      >
        {pending ? <ProgressView testID="form-submit-progress" /> : null}
        <Text>{label}</Text>
      </Row>
    </Button>
  );
}
