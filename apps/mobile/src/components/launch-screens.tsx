import { Spinner, Typography } from "heroui-native";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";

/**
 * 세션을 복원하는 동안, 그리고 복원조차 못 할 때 나오는 두 화면.
 *
 * HeroUI가 그리는 브랜드 층이다(docs/decisions/self-contained-native-ui-boundaries.md의
 * 배정표). 앱을 켜고 처음 보이는 표면이라 이 마이그레이션의 첫 검증 화면이기도
 * 하다.
 */

const PROGRESS_REVEAL_DELAY_MS = 200;

function LaunchScreen({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      {children}
    </View>
  );
}

export function LaunchChecking() {
  const [waiting, setWaiting] = useState(false);

  // 판정이 한순간에 끝나면 스피너는 정보가 아니라 번쩍임이다. 실제 대기가
  // 생겼을 때만 마운트한다(docs/decisions/native-motion.md). 등장 모션은
  // 라이브러리가 소유하므로 여기서 겹쳐 그리지 않는다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setWaiting(true);
    }, PROGRESS_REVEAL_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <LaunchScreen>
      {waiting ? <Spinner accessibilityLabel="세션 확인 중" /> : null}
    </LaunchScreen>
  );
}

/**
 * `다시 시도` 버튼을 두지 않는다. `failed`는 오직 `!supabaseConfigured`에서만
 * 나오고(use-auth.ts), 그 값은 빌드 타임에 인라인되는 `process.env`라
 * (supabase.ts) 런타임에 바뀔 수 없다. 세션 복원 실패는 `signedOut`으로 떨어져
 * 로그인 화면이 이미 탈출구다. 버튼을 두면 복구 가능한 상태라고 거짓말하게
 * 된다 — 실제로 필요한 것은 재빌드다.
 */
export function LaunchFailed({ reason }: { reason: string }) {
  return (
    <LaunchScreen>
      {/* Paragraph는 iOS Dynamic Type ramp(body)를 함께 건다 — 본문 문구는
          시스템 글자 크기를 따라야 한다. */}
      <Typography.Paragraph align="center" color="muted">
        {reason}
      </Typography.Paragraph>
    </LaunchScreen>
  );
}
