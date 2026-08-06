import { Button, Typography } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";

/**
 * 프로필 게이트가 앱 대신 그리는 화면 둘의 공통 모양.
 *
 * launch 화면과 같은 자리에 서는 브랜드 층이라 renderer도 HeroUI다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 배정표). `<Stack>`
 * 자체가 아직 마운트되지 않은 상태에서 뜨므로 셸이 줄 것이 없다.
 *
 * **어느 쪽이든 로그아웃이 있어야 한다.** 이 화면들이 뜨면 설정에 닿을 수 없다
 * — 나갈 문이 없으면 앱이 막다른 길이 된다.
 */
function ProfileProblem({
  actions,
  message,
}: {
  actions: ReactNode;
  message: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
      {/* Paragraph는 iOS Dynamic Type ramp(body)를 함께 건다 — 본문 문구는
          시스템 글자 크기를 따라야 한다. */}
      <Typography.Paragraph align="center" color="muted">
        {message}
      </Typography.Paragraph>
      {actions}
    </View>
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
          <Button isDisabled={retrying} onPress={onRetry} size="lg">
            <Button.Label>다시 시도</Button.Label>
          </Button>
          <Button onPress={onSignOut} variant="ghost">
            <Button.Label className="text-accent">로그아웃</Button.Label>
          </Button>
        </>
      }
      message="계정 정보를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."
    />
  );
}

/**
 * 프로필 행이 없다. 트리거가 사용자 생성과 같은 경계에서 만들었어야 하므로
 * 이것은 재시도로 낫는 상태가 아니라 데이터 무결성 오류다.
 */
export function ProfileMissing({ onSignOut }: { onSignOut: () => void }) {
  return (
    <ProfileProblem
      actions={
        <Button onPress={onSignOut} size="lg">
          <Button.Label>로그아웃</Button.Label>
        </Button>
      }
      message="계정 정보가 올바르지 않아요. 로그아웃한 뒤 다시 로그인해 주세요. 문제가 계속되면 문의해 주세요."
    />
  );
}
