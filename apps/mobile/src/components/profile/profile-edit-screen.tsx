import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { profileToolbarIcons } from "./profile-toolbar-icons";

/**
 * 편집 시트의 셸과 본문 자리. toolbar·grabber·presentation 같은 chrome은 여전히
 * 셸이 소유하고, 본문만 HeroUI가 그린다
 * (docs/decisions/self-contained-native-ui-boundaries.md).
 */
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
  /*
   * native header는 시트 위에 떠 있고 RN 본문은 그 뒤까지 깔린다. 앞선
   * `@expo/ui` 본문은 SwiftUI가 safe area로 그 높이를 알아서 비켜 줬고, 다른
   * HeroUI 화면은 `ScrollView`의 자동 content inset이 대신 받는다. 스크롤
   * 컨테이너가 없는 이 본문은 셸이 아는 높이를 직접 받아야 필드가 toolbar
   * 아래에서 시작한다.
   */
  const headerHeight = useHeaderHeight();

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          accessibilityLabel="닫기"
          icon={profileToolbarIcons.close}
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
            icon={profileToolbarIcons.save}
            onPress={onSave}
          />
        )}
      </Stack.Toolbar>

      {/*
       * sheet의 background와 material은 iOS가 소유한다 — 본문은 grouped canvas를
       * 만들지도, 자기 색을 칠하지도 않는다
       * (docs/decisions/settings-edits-use-native-form.md). 단일 필드 구성이라
       * 별도 scroll container도 두지 않는다.
       */}
      <View className="flex-1" style={{ paddingTop: headerHeight }}>
        <View className="flex-1 gap-6 px-5 pt-5" testID="profile-edit-body">
          {children}
        </View>
      </View>
    </>
  );
}
