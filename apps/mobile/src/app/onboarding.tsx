import { useEffect, useState } from "react";
import { LaunchChecking } from "../components/launch";
import { DisplayNameForm } from "../components/profile/display-name-form";
import { fetchNameCandidate } from "../lib/auth/name-candidate";
import { useSaveDisplayName } from "../lib/use-profile";
import { useUserId } from "../lib/user-id";

/**
 * 표시 이름이 없으면 앱보다 먼저 오는 화면(§3). 저장이 성공하면 캐시의
 * `display_name`이 채워지고 `_layout`의 가드가 앱으로 넘긴다 — 여기서
 * 직접 이동하지 않는다.
 *
 * 뒤로 가서 앱에 들어갈 수 없다. 가드가 이 화면만 마운트하므로 스택에
 * 돌아갈 곳 자체가 없다.
 */
export default function OnboardingScreen() {
  const userId = useUserId();
  const save = useSaveDisplayName(userId);
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
      submitLabel="시작하기"
    />
  );
}
