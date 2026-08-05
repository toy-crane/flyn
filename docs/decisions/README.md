# 결정 계약

현재 사람이 승인한 결정만 주제별로 한 파일씩 둔다. 같은 주제가 바뀌면 파일을
새로 만들지 않고 현재 계약을 고치며, 과거는 Git에서 확인한다.

- [turborepo-with-bun](turborepo-with-bun.md) — Read when 모노레포 구조, Bun 설치 방식, Supabase 생성 타입 위치를 바꿀 때.
- [worktree-isolated-mobile-runtime](worktree-isolated-mobile-runtime.md) — Read when 병렬 워크트리의 포트, Metro 캐시, 시뮬레이터, 로컬 Supabase를 다룰 때.
- [agent-device-for-simulator-checks](agent-device-for-simulator-checks.md) — Read when iOS 시뮬레이터를 조작하거나 화면 검증 증거를 남길 때.
- [supported-platforms](ios-only.md) — Read when 플랫폼 분기, Android, web 또는 플랫폼별 구현을 제안할 때.
- [native-conventions-with-style-foundation](apple-hig-with-app-theme.md) — Read when 앱 전반의 시각 체계, 시스템 컴포넌트, 디자인 토큰 범위를 바꿀 때.
- [self-contained-native-ui-boundaries](self-contained-native-ui-boundaries.md) — Read when 화면의 React Native와 `@expo/ui` 경계를 선택하거나 재사용 UI를 만들 때.
- [native-style-foundation](uniwind-css-theme.md) — Read when StyleSheet, Uniwind, 앱 색·간격·타이포, light/dark, Navigation 또는 `@expo/ui` 테마 연결을 바꿀 때.
- [native-motion](native-motion.md) — Read when 화면 전환, 상태 피드백, Reanimated 또는 Reduce Motion 동작을 추가할 때.
- [settings-edits-use-native-form-sheet](settings-edits-use-native-form.md) — Read when 설정의 닉네임·아이디 편집 화면이나 native form sheet를 바꿀 때.
- [danggeun-voice-for-copy](danggeun-voice-for-copy.md) — Read when 사용자에게 보이는 한국어 문구를 쓰거나 검토할 때.
- [hono-on-vercel](hono-on-vercel.md) — Read when API 런타임, 배포 표면 또는 모바일 API 계약을 바꿀 때.
- [ai-gateway-for-model-calls](ai-gateway-for-model-calls.md) — Read when AI SDK, 역할별 모델, Gateway 또는 한 요청의 여러 모델 호출을 다룰 때.
- [streaming-conversation-experience](ai-chat-experience.md) — Read when 스트리밍 대화 화면의 생성 상태, 스크롤, 키보드 또는 새로고침 동작을 바꿀 때.
- [ai-chat-reliability](ai-chat-reliability.md) — Read when 모델 호출 재시도, timeout, 출력 상한 또는 운영 로그를 바꿀 때.
- [sign-in-methods](sign-in-methods.md) — Read when 로그인 provider, 이메일 OTP, 매직링크 또는 인증 자동화를 바꿀 때.
- [social-sign-in-presentation](social-sign-in-presentation.md) — Read when root sign-in의 provider 버튼, 이메일 위계 또는 pending 표현을 바꿀 때.
- [no-apple-token-revocation](no-apple-token-revocation.md) — Read when 계정 삭제, Apple token 취소 또는 사용자 데이터 정리를 바꿀 때.
- [profile-identity](profile-identity.md) — Read when 프로필 스키마, 공개 닉네임·아이디, 온보딩 판정 또는 프로필 권한을 바꿀 때.
- [hybrid-data-access](hybrid-data-access.md) — Read when 모바일 직접 CRUD, RLS, Hono 경계 또는 AI가 만든 기록의 쓰기 권한을 바꿀 때.
