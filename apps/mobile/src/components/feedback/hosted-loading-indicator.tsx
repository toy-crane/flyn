import { Host } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";
import type { ComponentProps } from "react";
import { useColors } from "../../theme/app-theme";

interface HostedLoadingIndicatorProps {
  modifiers?: ComponentProps<typeof ProgressView>["modifiers"];
  testID?: string;
}

/** Expo UI surface에 독립적으로 나타나는 완결된 native progress subtree. */
export function HostedLoadingIndicator({
  modifiers,
  testID,
}: HostedLoadingIndicatorProps) {
  const colors = useColors();

  return (
    <Host matchContents seedColor={colors.loadingIndicator}>
      <ProgressView modifiers={modifiers} testID={testID} />
    </Host>
  );
}
