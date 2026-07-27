import { Button, Column, Host, Text } from "@expo/ui";
import {
  controlSize,
  font,
  foregroundStyle,
  multilineTextAlignment,
} from "@expo/ui/swift-ui/modifiers";
import type { ReactNode } from "react";
import { View } from "react-native";
import { colors } from "../../theme/colors";

function Screen({ children }: { children: ReactNode }) {
  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: colors.systemBackground }}
    >
      <Host matchContents>{children}</Host>
    </View>
  );
}

/**
 * 프로필 게이트가 앱 대신 그리는 화면 둘의 공통 모양.
 *
 * **어느 쪽이든 로그아웃이 있어야 한다.** 이 화면들이 뜨면 `<Stack>` 자체가
 * 마운트되지 않아 설정에 닿을 수 없다 — 나갈 문이 없으면 앱이 막다른 길이 된다.
 */
function ProfileProblem({
  actions,
  message,
}: {
  actions: ReactNode;
  message: string;
}) {
  return (
    <Screen>
      <Column alignment="center" spacing={12} style={{ padding: 8 }}>
        <Text
          modifiers={[
            font({ textStyle: "body" }),
            foregroundStyle({ style: "secondary", type: "hierarchical" }),
            multilineTextAlignment("center"),
          ]}
        >
          {message}
        </Text>
        {actions}
      </Column>
    </Screen>
  );
}

/**
 * 프로필 조회가 실패했다 — 네트워크·권한이다. **온보딩으로 가장하지 않는다**:
 * 그러면 이미 이름을 정한 사용자가 다시 입력하게 되고, 저장은 또 같은 이유로
 * 실패한다.
 *
 * 재시도만으로는 부족하다. 이 판정에는 권한 오류도 들어오는데(세션이 서버에서
 * 폐기된 경우 등) 그건 다시 눌러도 영원히 같은 실패다. 로그아웃이 유일한
 * 출구다.
 */
export function ProfileUnavailable({
  onRetry,
  onSignOut,
  retrying,
}: {
  onRetry: () => void;
  onSignOut: () => void;
  retrying: boolean;
}) {
  return (
    <ProfileProblem
      actions={
        <>
          <Button
            disabled={retrying}
            label="다시 시도"
            modifiers={[controlSize("large")]}
            onPress={onRetry}
          />
          <Button label="로그아웃" onPress={onSignOut} variant="text" />
        </>
      }
      message="계정 정보를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요."
    />
  );
}

/**
 * 프로필 행이 없다. 트리거가 사용자 생성과 같은 경계에서 만들었어야 하므로(§2)
 * 이것은 재시도로 낫는 상태가 아니라 데이터 무결성 오류다.
 */
export function ProfileMissing({ onSignOut }: { onSignOut: () => void }) {
  return (
    <ProfileProblem
      actions={
        <Button
          label="로그아웃"
          modifiers={[controlSize("large")]}
          onPress={onSignOut}
        />
      }
      message="계정 정보가 올바르지 않습니다. 로그아웃한 뒤 다시 로그인해 주세요. 문제가 계속되면 문의해 주세요."
    />
  );
}
