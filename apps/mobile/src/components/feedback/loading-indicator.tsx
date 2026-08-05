import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { useColors } from "../../theme/app-theme";

type LoadingIndicatorProps = Omit<ActivityIndicatorProps, "color">;

/** RN surface에 독립적으로 나타나는 수동형 progress. */
export function LoadingIndicator(props: LoadingIndicatorProps) {
  const colors = useColors();

  return <ActivityIndicator {...props} color={colors.loadingIndicator} />;
}
