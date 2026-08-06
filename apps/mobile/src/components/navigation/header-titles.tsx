import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/app-theme";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  subtitle: {
    marginTop: 2,
  },
});

/**
 * native header의 title 자리에 두 줄을 세운다. 화면이 나르는 결정(생성 스텝의
 * 이전 선택, 대화의 시나리오와 역할)이 본문을 차지하지 않게 하는 자리다.
 */
export function HeaderTitles({
  subtitle,
  title,
}: {
  subtitle: string | null;
  title: string;
}) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        numberOfLines={1}
        style={[typography.body, { color: colors.text, fontWeight: "600" }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          numberOfLines={1}
          style={[
            styles.subtitle,
            typography.caption,
            { color: colors.secondaryText },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
