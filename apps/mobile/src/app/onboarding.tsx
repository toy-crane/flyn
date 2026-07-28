import { Button } from "@expo/ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { LaunchChecking } from "../components/launch";
import { DisplayNameForm } from "../components/profile/display-name-form";
import { fetchNameCandidate } from "../lib/auth/name-candidate";
import { signOut } from "../lib/auth/sign-out";
import { useSaveDisplayName } from "../lib/use-profile";
import { useUserId } from "../lib/user-id";
import { colors } from "../theme/colors";

/**
 * 표시 이름이 없으면 앱보다 먼저 오는 화면. 저장이 성공하면 캐시의
 * `display_name`이 채워지고 `_layout`의 가드가 앱으로 넘긴다 — 여기서 직접
 * 이동하지 않는다.
 *
 * 뒤로 가서 앱에 들어갈 수 없다. 가드가 이 화면만 마운트하므로 스택에
 * 돌아갈 곳 자체가 없다.
 */
export default function OnboardingScreen() {
  const userId = useUserId();
  const save = useSaveDisplayName(userId);

  // 이 화면만 마운트되므로 뒤로 갈 곳도, 설정에 닿을 길도 없다. 저장이 계속
  // 실패하는 사용자에게 나갈 문이 없으면 앱이 막다른 길이 된다 —
  // ProfileMissing에 로그아웃을 둔 것과 같은 이유다.
  const confirmSignOut = useCallback(() => {
    Alert.alert("로그아웃할까요?", "이름은 다음에 정할 수 있어요.", [
      { style: "cancel", text: "취소" },
      { onPress: () => signOut(), style: "default", text: "로그아웃" },
    ]);
  }, []);
  // null은 "아직 모른다", ""는 "후보가 없다"(이메일 OTP)로 서로 다르다.
  const [candidate, setCandidate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchNameCandidate().then((name) => {
      if (!cancelled) {
        setCandidate(name);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 후보를 얻은 뒤에 폼을 그린다. 폼은 initialValue를 마운트 때 한 번만 읽어,
  // 나중에 도착한 후보가 입력칸에 들어갈 자리가 없다.
  if (candidate === null) {
    return <LaunchChecking />;
  }

  return (
    <DisplayNameForm
      description="다른 사람에게 보이지 않는, 앱에서 나를 부르는 이름이에요. 나중에 설정에서 바꿀 수 있어요."
      failure={
        save.isError
          ? "이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : undefined
      }
      initialValue={candidate}
      onSubmit={save.mutate}
      pending={save.isPending}
      secondaryAction={
        <Button
          label="로그아웃"
          // 틴트가 없으면 SwiftUI가 라벨 색으로 그려 버튼이 아니라 문구처럼
          // 보인다 — 로그인의 `이메일로 계속하기`와 같은 색을 준다.
          modifiers={[foregroundStyle(colors.systemBlue)]}
          onPress={confirmSignOut}
          variant="text"
        />
      }
      submitLabel="시작하기"
    />
  );
}
