import { Column, Host } from "@expo/ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});

export function ProfileEditScreen({
  canSave,
  children,
  onDismiss,
  onSave,
  pending,
}: {
  canSave: boolean;
  children: ReactNode;
  onDismiss: () => void;
  onSave: () => void;
  pending: boolean;
}) {
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          accessibilityLabel="닫기"
          icon="xmark"
          onPress={onDismiss}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        {pending ? (
          <Stack.Toolbar.View>
            <ActivityIndicator
              accessibilityLabel="저장 중"
              testID="profile-edit-progress"
            />
          </Stack.Toolbar.View>
        ) : (
          <Stack.Toolbar.Button
            accessibilityLabel="저장"
            disabled={!canSave}
            icon="checkmark"
            onPress={onSave}
          />
        )}
      </Stack.Toolbar>

      <Host style={styles.host} useViewportSizeMeasurement>
        <Column
          modifiers={[
            frame({
              alignment: "top",
              maxHeight: Number.POSITIVE_INFINITY,
              maxWidth: Number.POSITIVE_INFINITY,
            }),
          ]}
        >
          {children}
        </Column>
      </Host>
    </>
  );
}
