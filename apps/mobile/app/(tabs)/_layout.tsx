import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { appTabs, isTabBarHidden } from "@/core/navigation/app-tabs";

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <NativeTabs
      backBehavior="history"
      hidden={isTabBarHidden(pathname)}
      minimizeBehavior="onScrollDown"
    >
      {appTabs.map((tab) => (
        <NativeTabs.Trigger key={tab.routeName} name={tab.routeName}>
          <NativeTabs.Trigger.Icon md={tab.androidIcon} sf={tab.iosIcon} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
