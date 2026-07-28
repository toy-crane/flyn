import { FieldGroup, Host, Icon, ListItem, Row, Text } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { deleteAccount } from "../../lib/account";
import { signOut } from "../../lib/auth/sign-out";
import { useProfile } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";
import { useAppTheme } from "../../theme/app-theme";

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
 * 프로필과 계정 수명 주기를 한곳에 모은 화면. iOS 네이티브 Form 관용으로
 * 만든다 — universal `FieldGroup`이 iOS에서 SwiftUI `Form`이고,
 * `FieldGroup.Section`이 `Section`이다.
 *
 * 제품 도메인이 아직 없으므로 지금 유효한 계정 표면만 담는다. 빈 일반 설정
 * 항목을 미리 만들지 않는다.
 */
export default function SettingsScreen() {
  const app = useAppTheme();
  const userId = useUserId();
  const profile = useProfile(userId);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const openDisplayName = useCallback(() => {
    router.push("/settings/display-name");
  }, [router]);

  // 알릴 실패가 없다. auth-js는 요청이 실패해도 로컬 세션을 지우고 SIGNED_OUT을
  // 쏘므로, 어느 경우든 _layout의 가드가 sign-in으로 보낸다 — 여기서 얼럿을
  // 띄우면 방금 도착한 로그인 화면 위에 거짓말이 겹친다(sign-out.ts 참고).
  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  const confirmSignOut = useCallback(() => {
    Alert.alert("로그아웃할까요?", undefined, [
      { style: "cancel", text: "취소" },
      { onPress: handleSignOut, style: "default", text: "로그아웃" },
    ]);
  }, [handleSignOut]);

  // 성공하면 로컬 세션이 사라져 가드가 sign-in으로 보낸다. 실패는 서버가
  // 지우지 못했다는 뜻이라 이유를 그대로 전한다.
  //
  // 해제를 finally에 둔다. 언마운트에 기대면, 로컬 정리가 어긋나 가드가 안
  // 뒤집히는 순간 오버레이가 영영 남는다 — 실제로 그 경로가 있었다.
  const handleDelete = useCallback(async () => {
    setDeleting(true);

    try {
      const result = await deleteAccount();

      if (result) {
        Alert.alert("계정을 삭제하지 못했습니다", result.error);
      }
    } finally {
      setDeleting(false);
    }
  }, []);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      "계정을 삭제할까요?",
      "계정과 모든 데이터가 영구히 삭제됩니다. 되돌릴 수 없습니다.",
      [
        { style: "cancel", text: "취소" },
        { onPress: handleDelete, style: "destructive", text: "삭제" },
      ]
    );
  }, [handleDelete]);

  return (
    <View className="flex-1" style={{ backgroundColor: app.background }}>
      <Host
        seedColor={app.primary}
        style={{ backgroundColor: app.background, flex: 1 }}
        // Form은 남은 공간을 채워야 한다. 없으면 내용 높이만큼만 잡혀 스크롤이
        // 생기지 않는다.
        useViewportSizeMeasurement
      >
        <FieldGroup>
          <FieldGroup.Section title="프로필">
            {/* SwiftUI가 chevron을 그려 주는 것은 NavigationLink일 때다. 여기는
                Button이라 직접 그린다 — 없으면 push되는 행인데도 눌리는 것으로
                읽히지 않는다. */}
            <ListItem
              onPress={openDisplayName}
              trailing={
                <Row spacing={6}>
                  <Value>{profile.data?.display_name ?? ""}</Value>
                  <Icon
                    modifiers={[
                      foregroundStyle({
                        style: "tertiary",
                        type: "hierarchical",
                      }),
                    ]}
                    name="chevron.right"
                    size={13}
                  />
                </Row>
              }
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

            {/* 계정 생성이 있는 앱은 앱 안에서 전체 삭제를 시작할 수 있어야 한다.
              destructive 역할은 얼럿 버튼이 들고, 행 자체는 붉은 글자로 되돌릴
              수 없는 일임을 알린다. */}
            <ListItem onPress={confirmDelete}>
              <Text modifiers={[foregroundStyle(app.danger)]}>계정 삭제</Text>
            </ListItem>
          </FieldGroup.Section>
        </FieldGroup>
      </Host>

      {/* 서버가 지우는 동안 화면이 멀쩡해 보이면 사용자가 다시 누른다. */}
      {deleting ? (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: app.overlay }}
        >
          <Host matchContents seedColor={app.primary}>
            <ProgressView />
          </Host>
        </View>
      ) : null}
    </View>
  );
}
