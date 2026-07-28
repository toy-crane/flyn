import { useRouter } from "expo-router";
import { useCallback } from "react";
import { DisplayNameForm } from "../../components/profile/display-name-form";
import { useProfile, useSaveDisplayName } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

/**
 * 설정에서 표시 이름을 고치는 화면. 온보딩과 같은 폼을 쓰므로 검증·저장
 * 규칙이 갈릴 자리가 없다.
 *
 * 온보딩과 다른 점은 끝나는 방식뿐이다 — 여기서는 가드가 바뀌지 않으므로
 * 저장이 성공하면 직접 되돌아간다.
 */
export default function DisplayNameScreen() {
  const userId = useUserId();
  const profile = useProfile(userId);
  const save = useSaveDisplayName(userId);
  const router = useRouter();

  const handleSubmit = useCallback(
    (name: string) => {
      save.mutate(name, {
        onSuccess: () => {
          router.back();
        },
      });
    },
    [router, save]
  );

  return (
    <DisplayNameForm
      description="앱에서 나를 부르는 이름이에요."
      failure={
        save.isError
          ? "이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : undefined
      }
      initialValue={profile.data?.display_name ?? ""}
      onSubmit={handleSubmit}
      pending={save.isPending}
      submitLabel="저장"
    />
  );
}
