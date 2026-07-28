# 결정

이 저장소가 **지금** 서 있는 위치. 한 줄에 하나, 주제별로 묶는다. 논거는 각
기록이 들고 있으니, 뒤집으려면 그 기록을 읽고 새 기록을 쓴다.

기본값(반증이 나오면 기록 없이 뒤집는 것)은 여기 오지 않는다 —
[테크 스택 스펙의 "가정"](../specs/tech-stack/spec.md)에 있다.

## 저장소·툴체인

- [turborepo-with-bun](turborepo-with-bun.md) — 모노레포는 Turborepo + bun이고,
  설치는 hoisted로 고정한다. 생성 타입은 `packages/supabase` 한 곳에서만 만들고,
  CLI가 읽는 `supabase/`는 루트에 남긴다.
- [agent-device-for-simulator-checks](agent-device-for-simulator-checks.md) —
  시뮬레이터 검증은 agent-device로 하고, 좌표를 찍는 내장 도구를 쓰지 않는다.

## 모바일 UI

- [ios-only](ios-only.md) — 타깃은 iOS 전용이고 Android·web 폴백을 만들지 않는다.
- [apple-hig-not-a-design-system](apple-hig-not-a-design-system.md) — 커스텀
  디자인 시스템을 만들지 않고 Apple HIG를 따른다.
- [expo-ui-by-default](expo-ui-by-default.md) — 새 화면은 universal `@expo/ui`로
  만들고, 경계가 막는다는 근거가 있는 화면만 RN으로 내려간다.
- [uniwind-for-styling](uniwind-for-styling.md) — 스타일링은 Uniwind 무료 범위로
  충분하고, `Host` 바깥에서만 쓴다.
- [ios-semantic-colors](ios-semantic-colors.md) — 색은 iOS 시맨틱 색만 쓰고
  `dark:` 변형을 색에 쓰지 않는다.

## API·AI

- [hono-on-vercel](hono-on-vercel.md) — API는 Vercel 위의 Hono다.
- [ai-gateway-for-model-calls](ai-gateway-for-model-calls.md) — 모델 호출은 AI
  SDK로 하되 반드시 Vercel AI Gateway를 경유한다.

## 인증

- [native-social-login](native-social-login.md) — 소셜 로그인은 Apple + Google
  네이티브 플로우를 세트로 쓰고, 추가 소셜은 채택하지 않는다.
- [email-otp-code](email-otp-code.md) — 세 번째 수단은 이메일 6자리 코드이며
  매직링크는 기각한다.
- [no-apple-token-revocation](no-apple-token-revocation.md) — Apple refresh
  token을 보관하지 않는다. 계정 삭제는 Supabase hard delete만 하고 Apple 승인은
  취소하지 않는다.
- [auth-verification](../auth-verification.md) — 소셜 로그인은 자동화가 원천
  불가하므로, 자동 검증은 전부 이메일 OTP 경로로 한다. *(이 한 줄만 기록
  폴더 바깥을 가리킨다 — 같은 문서가 근거이자 실행 절차라 쪼개지 않았다.)*

## 데이터

- [private-auth-profiles](private-auth-profiles.md) — 프로필은 인증 사용자와
  1:1인 비공개 계정 정보이고, `display_name is null`만 첫 온보딩을 뜻한다.
- [hybrid-data-access](hybrid-data-access.md) — 일반 CRUD는 앱이 Supabase에 직접
  가고 RLS가 보안 경계다. AI·서버 전용 로직만 Hono를 거친다.
