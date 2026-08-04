import { BottomSheet, Button, Column, Icon, Row, Spacer, Text } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  font,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";

const circleButton = (label: string) => [
  accessibilityLabel(label),
  buttonStyle("glass"),
  buttonBorderShape("circle"),
  frame({ height: 44, width: 44 }),
];

export function ProfileEditSheet({
  canSave,
  children,
  onDismiss,
  onSave,
  pending,
  testID,
  title,
}: {
  canSave: boolean;
  children: ReactNode;
  onDismiss: () => void;
  onSave: () => void;
  pending: boolean;
  testID: string;
  title: string;
}) {
  return (
    <BottomSheet
      isPresented
      onDismiss={onDismiss}
      showDragIndicator
      snapPoints={["full"]}
      testID={testID}
    >
      <Column
        modifiers={[
          frame({
            alignment: "top",
            maxHeight: Number.POSITIVE_INFINITY,
            maxWidth: Number.POSITIVE_INFINITY,
          }),
        ]}
        spacing={12}
        style={{ paddingTop: 12 }}
      >
        <Row
          alignment="center"
          modifiers={[frame({ maxWidth: Number.POSITIVE_INFINITY })]}
          spacing={8}
          style={{ paddingHorizontal: 16 }}
        >
          <Button modifiers={circleButton("닫기")} onPress={onDismiss}>
            <Icon name="xmark" size={17} />
          </Button>
          <Spacer flexible />
          <Text
            modifiers={[font({ textStyle: "headline", weight: "semibold" })]}
          >
            {title}
          </Text>
          <Spacer flexible />
          {pending ? (
            <ProgressView
              modifiers={[frame({ height: 44, width: 44 })]}
              testID="profile-edit-progress"
            />
          ) : (
            <Button
              disabled={!canSave}
              modifiers={circleButton("저장")}
              onPress={onSave}
            >
              <Icon name="checkmark" size={17} />
            </Button>
          )}
        </Row>

        {children}
      </Column>
    </BottomSheet>
  );
}
