# 결정

이 저장소가 **지금** 서 있는 위치. 한 줄에 하나, 주제별로 묶는다. 논거는 각
기록이 들고 있으니, 뒤집으려면 그 기록을 읽고 새 기록을 쓴다.

기본값(반증이 나오면 기록 없이 뒤집는 것)은 여기 오지 않는다.

## 저장소·툴체인

- [turborepo-with-bun](turborepo-with-bun.md) — 모노레포는 Turborepo + bun이고,
  설치는 hoisted로 고정한다. 생성 타입은 `packages/supabase` 한 곳에서만 만들고,
  CLI가 읽는 `supabase/`는 루트에 남긴다.
- [agent-device-for-simulator-checks](agent-device-for-simulator-checks.md) —
  시뮬레이터 검증은 agent-device로 하고, 좌표를 찍는 내장 도구를 쓰지 않는다.
- [worktree-isolated-mobile-runtime](worktree-isolated-mobile-runtime.md) —
  병렬 모바일 개발은 워크트리별 API·Metro 포트, Metro 캐시, iOS 시뮬레이터를
  격리하고 Supabase 하나를 공유한다.

## 모바일 UI

- [ios-only](ios-only.md) — 타깃은 iOS 전용이고 Android·web 폴백을 만들지 않는다.
- [apple-hig-with-app-theme](apple-hig-with-app-theme.md) — 네이티브 컴포넌트와
  상호작용은 Apple HIG를 따르되, 색은 앱이 소유하는 시맨틱 테마로 관리한다.
- [self-contained-native-ui-boundaries](self-contained-native-ui-boundaries.md) —
  화면 로직은 React가 소유하고, 네이티브 UI는 하나의 완결된 `Host` subtree로
  구성하며, 경계가 막는다는 근거가 있는 surface만 RN으로 만든다.
- [uniwind-css-theme](uniwind-css-theme.md) — 앱 테마의 단일 원본은 Uniwind
  CSS 변수이고, RN은 시맨틱 className을, 네이티브 경계는 같은 변수 값을 쓴다.
- [settings-edits-use-native-form](settings-edits-use-native-form.md) — 설정에서
  값을 고치는 화면은 네이티브 `Form`과 네비게이션 바 `완료`를 쓴다. 하단 CTA는
  진행 흐름에만 쓴다.
- [danggeun-voice-for-copy](danggeun-voice-for-copy.md) — 화면 문구는 당근
  SEED의 라이팅 규칙을 따르고, '이웃'과 '당신'은 쓰지 않는다.

## API·AI

- [hono-on-vercel](hono-on-vercel.md) — API는 Vercel 위의 Hono다.
- [ai-gateway-for-model-calls](ai-gateway-for-model-calls.md) — 모델 호출은 AI
  SDK로 하되 반드시 Vercel AI Gateway를 경유한다.

## 인증

- [native-social-login](native-social-login.md) — 소셜 로그인은 Apple + Google
  네이티브 플로우를 세트로 쓰고, 추가 소셜은 채택하지 않는다.
- [social-sign-in-presentation](social-sign-in-presentation.md) — Apple·Google은
  브랜드 버튼 한 세트로 유지하고, 이메일은 보조 경로로, provider pending은
  전체 화면 progress로 표현한다.
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
  1:1이고, 행은 `auth.users` 트리거가 만들며, 이메일의 원본은 Auth다.
- [public-username-in-profile](public-username-in-profile.md) — 프로필에 공개
  고유 username을 두고 한국어로 아이디라 부른다. 사람이 읽는 이름은 닉네임이고,
  온보딩 완료는 둘 다 채워진 상태다.
- [hybrid-data-access](hybrid-data-access.md) — 일반 CRUD는 앱이 Supabase에 직접
  가고 RLS가 보안 경계다. AI·서버 전용 로직만 Hono를 거친다.
- [server-owned-chat-messages](server-owned-chat-messages.md) — 채팅방 CRUD와
  메시지 조회는 앱이 RLS 안에서 직접 하지만, 사용자·AI 메시지 쓰기는 인증된
  Hono 스트리밍 경계만 맡는다.
