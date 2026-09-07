# 실기기에서 앱이 로컬 API와 Supabase에 닿지 못한다

**Symptom**: 물리 iPhone에 Development Build를 설치하면 앱은 뜨고 Metro 번들도
받지만 로그인이 되지 않는다. 이메일 코드 요청, 코드 확인, Google과 Apple 로그인이
모두 같은 지점에서 실패한다. 셋 다 `apps/mobile/src/shared/supabase/client.ts:25`가
`EXPO_PUBLIC_SUPABASE_URL`로 만든 클라이언트를 쓰는데, 그 값이 기기에서
`http://127.0.0.1:54331`이라 폰이 자기 자신을 부른다. 실기기 안드로이드도 같은
이유로 닿지 못한다. `apps/mobile/env.ts:47`의 `developmentSessionHost`가 android면
`10.0.2.2`, 아니면 `127.0.0.1`만 돌려주고 `10.0.2.2`는 에뮬레이터 전용 주소이기
때문이다. LAN 주소를 내놓는 경로가 없다. iOS Simulator와 Android Emulator는
정상이다.

**Observed evidence**: 2026-09-05에 `main` worktree에서 확인했다. API를
`apps/api`에서 `BUN_PORT=3921 bun --hot src/index.ts`로 띄우고,
`apps/mobile`에서 `EXPO_NO_DOTENV=1`과 셸 값
`EXPO_PUBLIC_API_URL=http://192.168.45.12:3921`,
`EXPO_PUBLIC_SUPABASE_URL=http://192.168.45.12:54331`을 주어
`expo run:ios --device 00008130-000925C411D8001C --port 8102`를 실행했다. 빌드와
설치는 성공했고 앱은 `192.168.45.12:8102`에서 2990개 모듈을 받았으며 런타임
오류는 없었다. 그런데 `docker logs supabase_kong_flyn`에는 폰에서 온 요청이 한
건도 없고 마지막 인증 요청은 8시간 전 시뮬레이터 것이다. Metro가 서빙 중인
번들을 `curl`로 받아 열어 보니 `.env.local`이 모듈 하나로 들어가 있고
(`__d(...,2164,[],".env.local")`), 그 안의 `EXPO_PUBLIC_SUPABASE_URL`이
`http://127.0.0.1:54331`이다. 참고로 `curl -H "expo-platform: ios"`로 받은 Metro
manifest의 `hostUri`는 요청한 주소를 그대로 되돌려 준다. LAN으로 요청하면
`192.168.45.12:8102`, loopback으로 요청하면 `127.0.0.1:8102`가 나온다.

**Suspected cause**: 개발 번들의 `expo/virtual/env`가 `process.env`를 먼저 펼친
뒤 `.env`, `.env.development`, `.env.local`, `.env.development.local`을 그 위에
덮는다. 그래서 셸로 넘긴 `EXPO_PUBLIC_` 값이 같은 이름의 `.env.local` 값에 진다.
`EXPO_NO_DOTENV=1`은 Expo CLI가 파일을 읽는 것만 막고 Metro가 `.env.local`을
모듈로 묶는 것은 막지 못한다고 본다. `docs/decisions/worktree-development-sessions.md`
62번째 줄이 이 병합을 이미 적어 두었고, 그래서 개발 세션은 URL이 아니라
`EXPO_PUBLIC_DEV_SESSION_API_PORT`와 `EXPO_PUBLIC_DEV_SESSION_SUPABASE_PORT`라는
전용 이름을 쓴다. 그 이름은 `.env.local`에 없어서 병합에서 살아남는다.

**What was tried**: 셸에서 두 URL 변수를 LAN 주소로 덮어썼다. 이름이 `.env.local`과
겹쳐서 런타임에 졌고 아무것도 풀지 못했다. 빌드가 프로비저닝 프로파일을 만들지
못하던 문제는 따로 있었고, 생성된 `apps/mobile/ios/app.xcodeproj/project.pbxproj`에서
`DEVELOPMENT_TEAM` 두 줄을 지워 풀었다. 그래야 Expo CLI가 서명을 직접 설정하는
경로로 들어가 `xcodebuild`에 `-allowProvisioningUpdates`를 넘긴다. 그 폴더는
gitignore 대상이라 저장소에 남은 변경은 없다. 저장소에 남긴 코드 변경은 없다.

**Proposed next step**: 코드를 고치기 전에 결정 계약부터 손댄다.
`docs/decisions/worktree-development-sessions.md` 35번째 줄이 실제 기기를 범위 밖으로
못박고 있으므로, 실기기를 지원 대상에 넣을지를 `shape-idea`로 먼저 합의한다.
넣기로 하면 같은 문서 22번째 줄의 "세션은 포트만 정하고 호스트는 앱이 정한다"를
그대로 두고 호스트를 고르는 방법만 바꾼다. 후보는 `expo-router`의 `getDevServer`가
돌려주는 개발 서버 주소에서 호스트를 뽑는 것이다. `Constants.expoConfig.hostUri`도
같은 값을 주지만 스킴이 없고 터널에서는 포트가 빠진다. 이때 확인할 제약이 둘
있다. 첫째, `scripts/dev/environment.ts:3`이 `apps/mobile/env.ts`의 `parseMobileEnv`를
가져다 Bun에서 실행하므로 `env.ts`에 Expo 모듈을 import하면 세션 스크립트가
깨진다. 호스트를 고르는 부분만 앱 쪽 모듈로 빼고 검증은 지금 자리에 둔다. 둘째,
`scripts/dev/adapters/android.ts:318`이 에뮬레이터에 Metro 포트만 `adb reverse`로
넘기므로 에뮬레이터의 개발 서버 호스트는 `127.0.0.1`이 되는데 API와 Supabase는
`10.0.2.2`가 필요하다. 세 포트를 모두 넘기면 규칙이 하나로 통일된다.
