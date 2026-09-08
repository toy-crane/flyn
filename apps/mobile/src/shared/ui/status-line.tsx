import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon, type IconName, type IconTone } from "./icon";
import { LoadingSpinner } from "./loading-spinner";
import { type ProgressRole, useProgressMetrics } from "./progress-metrics";

const TEXT_STYLE = {
  control: "text-base leading-6",
  screen: "text-sm leading-5",
  supporting: "text-xs leading-4",
};
const TEXT_TONE = {
  danger: "text-danger-soft-foreground",
  muted: "text-muted",
  success: "text-success-soft-foreground",
};

/** 표시 간격은 눈에 보이는 슬롯 사이로 잰다. 재시도는 44px 터치 영역을 따로 지킨다. */
export function StatusLine({
  label,
  loading = false,
  icon,
  sizeRole = "supporting",
  tone = "muted",
  retry,
  testID,
}: {
  label: string;
  loading?: boolean;
  icon?: IconName;
  sizeRole?: ProgressRole;
  tone?: keyof typeof TEXT_TONE;
  retry?: { label: string; onPress: () => void; testID?: string };
  testID?: string;
}) {
  const { fontScale, gap, indicator, lineHeight } =
    useProgressMetrics(sizeRole);
  const touchSize = Math.max(44, indicator, lineHeight);
  const rowHeight = retry ? touchSize : lineHeight;
  const baseSize = sizeRole === "supporting" ? 14 : 20;
  const iconTone: IconTone = tone;
  let mark: ReactNode = null;
  if (icon) {
    mark = (
      <View
        style={{
          alignItems: "center",
          height: indicator,
          justifyContent: "center",
          width: indicator,
        }}
      >
        <View style={{ transform: [{ scale: indicator / baseSize }] }}>
          <Icon
            name={icon}
            size={sizeRole === "supporting" ? "xs" : "md"}
            tone={iconTone}
          />
        </View>
      </View>
    );
  }
  if (loading) {
    mark = <LoadingSpinner sizeRole={sizeRole} />;
  }

  return (
    <View
      accessibilityLabel={retry ? undefined : label}
      accessibilityLiveRegion="polite"
      accessibilityRole={loading && !retry ? "progressbar" : undefined}
      accessibilityState={{ busy: loading }}
      accessible={!retry}
      key={fontScale}
      style={{
        alignItems: "flex-start",
        flexDirection: "row",
        minHeight: rowHeight,
      }}
      testID={testID}
    >
      {!retry && mark ? (
        <View
          style={{ marginRight: gap, paddingTop: (lineHeight - indicator) / 2 }}
        >
          {mark}
        </View>
      ) : null}
      <Text
        className={`shrink ${TEXT_STYLE[sizeRole]} ${TEXT_TONE[tone]}`}
        style={{ paddingTop: (rowHeight - lineHeight) / 2 }}
      >
        {label}
      </Text>
      {retry ? (
        <Pressable
          accessibilityLabel={retry.label}
          accessibilityRole="button"
          accessibilityState={{ busy: loading, disabled: loading }}
          disabled={loading}
          onPress={retry.onPress}
          style={{
            alignItems: "center",
            height: touchSize,
            justifyContent: "center",
            marginLeft: gap - (touchSize - indicator) / 2,
            width: touchSize,
          }}
          testID={retry.testID}
        >
          {mark}
        </Pressable>
      ) : null}
    </View>
  );
}
