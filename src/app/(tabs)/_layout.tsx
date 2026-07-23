import { NativeTabs } from "expo-router/unstable-native-tabs";

/**
 * The three tab roots. Trigger names must match the route names exactly,
 * parentheses included. Tabs stay static — toggling them remounts the
 * navigator and loses state.
 */
export default function TabsLayout() {
  return (
    <NativeTabs tintColor="#3182f6">
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(library)">
        <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="local_library" />
        <NativeTabs.Trigger.Label>서재</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(profile)">
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
        <NativeTabs.Trigger.Label>프로필</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
