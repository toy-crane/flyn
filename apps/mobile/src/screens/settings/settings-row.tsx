import { ListItem, Row, Spacer } from "@expo/ui";
import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";
import { Platform } from "react-native";

/**
 * A single settings row on both platforms.
 *
 * Android's `FieldGroup.Section` already wraps each child in a Material 3
 * `ListItem`, so nesting another `ListItem` creates an extra card behind the
 * content — a white rectangle around the label, with the trailing content lost
 * inside it. iOS sections do not add that interactive wrapper, so a row that
 * does something keeps `ListItem` and the full-width press area it brings.
 *
 * A row without `onPress` shows a value rather than doing something, so it
 * takes the plain layout on both platforms: `ListItem` would make it look
 * pressable.
 */
export function SettingsRow({
  children,
  leading,
  modifiers,
  onPress,
  testID,
  trailing,
}: {
  children: ReactNode;
  /** The iOS symbol in front of the name. Android passes nothing. */
  leading?: ReactNode;
  /*
    Both renderers' modifier arrays have the same shape, and `@expo/ui` types
    the prop with one universal `ModifierConfig` it does not re-export. So the
    SwiftUI name stands in for both, and an Android caller passes Compose
    modifiers through it.
  */
  modifiers?: ModifierConfig[];
  onPress?: () => void;
  testID: string;
  trailing?: ReactNode;
}) {
  if (Platform.OS === "ios" && onPress) {
    return (
      <ListItem
        leading={leading}
        modifiers={modifiers}
        onPress={onPress}
        testID={testID}
        trailing={trailing}
      >
        {children}
      </ListItem>
    );
  }

  return (
    <Row
      alignment="center"
      modifiers={modifiers}
      onPress={onPress}
      spacing={12}
      testID={testID}
    >
      {leading}
      {children}
      <Spacer flexible />
      {trailing}
    </Row>
  );
}
