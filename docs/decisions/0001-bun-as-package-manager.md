---
status: accepted
---

# 패키지 매니저로 Bun 채택

Turborepo + Expo + Hono + Supabase 모노레포에서 네 가지 패키지 매니저(npm·yarn·pnpm·bun)가 모두 공식 지원되므로 "지원 여부"는 결정 요인이 아니다. 유일한 제약 지점인 Expo(React Native)의 `node_modules` 레이아웃도 Bun을 포함해 SDK 54부터 isolated 의존성 + 통합 autolinking으로 다뤄진다(현재 최신 SDK 57). 설치·실행 속도를 최우선으로 두고 Bun을 선택했다.

## Considered Options

- **pnpm** — 2026년 기준 Turborepo+Expo 프로덕션의 사실상 표준. 디스크 효율과 엄격한 의존성 위생이 강점이고 isolated 문제 시 `nodeLinker: hoisted` 한 줄로 회피 가능. 가장 검증된 선택지였으나 속도 우선순위에 밀림.
- **npm / yarn** — hoisted가 기본이라 RN 라이브러리 호환성이 가장 무난하지만 설치가 느리고 모노레포 편의성이 약함. yarn classic은 레거시, berry의 PnP는 RN과 충돌.

## Consequences

Bun을 안전하게 쓰기 위한 제약(모두 공식 문서 근거):

- **Lockfile가 EAS의 패키지 매니저 감지를 좌우한다.** `bun.lock`(Bun 1.2+) 하나만 저장소에 있어야 하며, 다른 매니저의 lockfile은 반드시 삭제한다. EAS는 lockfile로 매니저를 판별한다.
- **`trustedDependencies` 필요.** Bun은 보안상 postinstall 등 라이프사이클 스크립트를 자동 실행하지 않는다. postinstall이 필요한 패키지(예: `@sentry/cli`)는 `package.json`의 `trustedDependencies`에 명시해야 하며, 누락 시 EAS Build가 실패한다.
- **EAS의 Bun 버전 고정**은 `eas.json` 빌드 프로파일의 `"bun": "1.x.x"`로 한다.
- **모노레포 + EAS 주의점.** `eas build`/`eas deploy`는 루트가 아니라 대상 패키지 폴더(예: `apps/mobile`)에서 실행한다. `turbo prune`으로 만든 서브셋 lockfile은 Bun 1.3의 Lockfile v3부터 `--frozen-lockfile`과 호환된다.
- **RN 버전 중복 불가.** 모노레포 전체에서 `react-native` 버전을 하나로 dedup해야 한다(어느 매니저를 쓰든 공통).
