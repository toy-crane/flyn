import { Column, FieldGroup, Host, ListItem, Row, Text } from "@expo/ui";
import {
  font,
  foregroundStyle,
  frame,
  listRowBackground,
  listRowInsets,
  listRowSeparator,
  multilineTextAlignment,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { ProfileAvatar } from "../../components/profile/profile-avatar";
import { NativeSymbol } from "../../components/symbols/native-symbol";
import { deleteAccount } from "../../lib/account";
import { signOut } from "../../lib/auth/sign-out";
import { useProfile } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

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

function ProfileHeader({
  displayName,
  username,
}: {
  displayName: string;
  username: string;
}) {
  return (
    <Column
      alignment="center"
      modifiers={[
        // containerRelativeFrame은 iOS 17부터라 16에서는 no-op이다. SwiftUI의
        // maxWidth .infinity에 대응하는 frame은 전체 지원 범위에서 동작한다.
        frame({ maxWidth: Number.POSITIVE_INFINITY }),
        listRowBackground("clear"),
        listRowInsets({ bottom: 20, leading: 0, top: 20, trailing: 0 }),
        listRowSeparator("hidden"),
      ]}
      spacing={14}
      testID="settings-profile-header"
    >
      <ProfileAvatar
        colorKey={username}
        displayName={displayName}
        testID="settings-profile-avatar"
      />

      <Column alignment="center" spacing={2}>
        <Text
          modifiers={[
            font({ textStyle: "title", weight: "bold" }),
            multilineTextAlignment("center"),
          ]}
        >
          {displayName}
        </Text>
        <Text
          modifiers={[
            foregroundStyle({
              style: "secondary",
              type: "hierarchical",
            }),
            font({ textStyle: "callout" }),
            multilineTextAlignment("center"),
          ]}
        >
          {`@${username}`}
        </Text>
      </Column>
    </Column>
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
  // native `Host`에 넘기는 값은 앱 semantic 토큰의 resolved 값이다 — 원본은
  // `global.css`의 CSS `@theme` 하나이고 여기가 bridge다
  // (docs/decisions/uniwind-css-theme.md).
  const [danger, neutral] = useThemeColor(["danger", "muted"]);
  const router = useRouter();
  const userId = useUserId();
  const profile = useProfile(userId);
  const [deleting, setDeleting] = useState(false);
  const displayName = profile.data?.display_name ?? "";
  const email = profile.data?.email ?? "";
  const username = profile.data?.username ?? "";

  const openNickname = useCallback(() => {
    router.push("/settings/display-name");
  }, [router]);
  const openUsername = useCallback(() => {
    router.push("/settings/username");
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
        Alert.alert("계정을 삭제하지 못했어요", result.error);
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
    <View className="flex-1">
      {/* `Host`는 uniwind가 감싸는 컴포넌트가 아니라 className을 받지 못한다. */}
      <Host
        style={{ flex: 1 }}
        // Form은 남은 공간을 채워야 한다. 없으면 내용 높이만큼만 잡혀 스크롤이
        // 생기지 않는다.
        useViewportSizeMeasurement
      >
        <FieldGroup>
          <ProfileHeader displayName={displayName} username={username} />

          <FieldGroup.Section title="프로필">
            {/* SwiftUI가 chevron을 그려 주는 것은 NavigationLink일 때다. 여기는
                Button이라 직접 그린다 — 없으면 push되는 행인데도 눌리는 것으로
                읽히지 않는다. Evan Bacon의 chat-template처럼 iOS SF Symbol의
                chevron.right를 medium 굵기와 muted 색으로 둔다. */}
            <ListItem
              onPress={openNickname}
              trailing={
                <Row alignment="center" spacing={6}>
                  <Value>{displayName}</Value>
                  <NativeSymbol symbol="disclosure" />
                </Row>
              }
            >
              닉네임
            </ListItem>

            <ListItem
              onPress={openUsername}
              trailing={
                <Row alignment="center" spacing={6}>
                  <Value>{username}</Value>
                  <NativeSymbol symbol="disclosure" />
                </Row>
              }
            >
              아이디
            </ListItem>

            {/* 이메일은 읽기 전용이다 — 원본은 auth.users이고 앱에는 update 열
              권한이 없다. onPress를 주지 않아 눌리지 않는 것이 곧 그 표현이다. */}
            <ListItem trailing={<Value>{email}</Value>}>이메일</ListItem>
          </FieldGroup.Section>

          <FieldGroup.Section title="계정">
            <ListItem onPress={confirmSignOut}>로그아웃</ListItem>

            {/* 계정 생성이 있는 앱은 앱 안에서 전체 삭제를 시작할 수 있어야 한다.
              destructive 역할은 얼럿 버튼이 들고, 행 자체는 붉은 글자로 되돌릴
              수 없는 일임을 알린다. */}
            <ListItem onPress={confirmDelete}>
              <Text modifiers={[foregroundStyle(danger)]}>계정 삭제</Text>
            </ListItem>
          </FieldGroup.Section>
        </FieldGroup>
      </Host>

      {/* 서버가 지우는 동안 화면이 멀쩡해 보이면 사용자가 다시 누른다. */}
      {deleting ? (
        <View className="absolute inset-0 items-center justify-center bg-backdrop">
          {/* 스스로 나타나는 수동형 진행이라 중립 회색이다
              (docs/specs/neutral-loading-indicators/spec.md). */}
          <Spinner
            accessibilityLabel="계정 삭제 중"
            color={neutral}
            testID="settings-delete-loading-indicator"
          />
        </View>
      ) : null}
    </View>
  );
}
