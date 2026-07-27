import { FieldGroup, Host, ListItem, Text } from "@expo/ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { signOut } from "../../lib/auth/sign-out";
import { useProfile } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";
import { colors } from "../../theme/colors";

/** 값 표시는 두 행이 같은 모양이어야 한다 — 하나는 누를 수 있을 뿐이다. */
function Value({ children }: { children: string }) {
  return (
    <Text
      modifiers={[
        foregroundStyle({ style: "secondary", type: "hierarchical" }),
      ]}
    >
      {children}
    </Text>
  );
}

/**
 * 프로필과 계정 수명 주기를 한곳에 모은 화면(§4). iOS 네이티브 Form 관용으로
 * 만든다 — universal `FieldGroup`이 iOS에서 SwiftUI `Form`이고,
 * `FieldGroup.Section`이 `Section`이다.
 *
 * 제품 도메인이 아직 없으므로 지금 유효한 계정 표면만 담는다. 빈 일반 설정
 * 항목을 미리 만들지 않는다.
 */
export default function SettingsScreen() {
  const userId = useUserId();
  const profile = useProfile(userId);
  const router = useRouter();

  const openDisplayName = useCallback(() => {
    router.push("/settings/display-name");
  }, [router]);

  // 성공하면 _layout의 가드가 sign-in으로 보낸다. 실패는 아무 일도 안 일어난
  // 것처럼 보이므로 반드시 알린다.
  const handleSignOut = useCallback(async () => {
    const result = await signOut();

    if (result) {
      Alert.alert("로그아웃하지 못했습니다", result.error);
    }
  }, []);

  const confirmSignOut = useCallback(() => {
    Alert.alert("로그아웃할까요?", undefined, [
      { style: "cancel", text: "취소" },
      { onPress: handleSignOut, style: "default", text: "로그아웃" },
    ]);
  }, [handleSignOut]);

  return (
    <Host
      style={{ backgroundColor: colors.systemBackground, flex: 1 }}
      // Form은 남은 공간을 채워야 한다. 없으면 내용 높이만큼만 잡혀 스크롤이
      // 생기지 않는다.
      useViewportSizeMeasurement
    >
      <FieldGroup>
        <FieldGroup.Section title="프로필">
          <ListItem
            onPress={openDisplayName}
            trailing={<Value>{profile.data?.display_name ?? ""}</Value>}
          >
            표시 이름
          </ListItem>

          {/* 이메일은 읽기 전용이다 — 원본은 auth.users이고 앱에는 update 열
              권한이 없다. onPress를 주지 않아 눌리지 않는 것이 곧 그 표현이다. */}
          <ListItem trailing={<Value>{profile.data?.email ?? ""}</Value>}>
            이메일
          </ListItem>
        </FieldGroup.Section>

        <FieldGroup.Section title="계정">
          <ListItem onPress={confirmSignOut}>로그아웃</ListItem>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
