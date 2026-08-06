# 01. HeroUI 기반 위에서 launch 화면이 뜬다

## 전달되는 행동

앱이 Uniwind(Tailwind v4)와 HeroUI Native 위에서 빌드되고, 앱을 켠 직후의 두
화면 — 세션 복원 대기와 설정 오류 — 이 HeroUI `Spinner`·`Text`로 그려진다.
복원이 빠르면 이전처럼 아무것도 번쩍이지 않고, 오류 화면에는 이전처럼 재시도
버튼이 없다. 나머지 모든 화면은 이전 구현 그대로 동작한다 — 이 태스크가 두
시스템의 공존 상태를 시작한다.

## Blockers

None.

## 완료 기준

- [x] 새 의존성(heroui-native·uniwind·tailwindcss·gesture-handler·expo-blur·
      `@gorhom/bottom-sheet`·screens·tailwind-variants·merge)으로 dev build가
      재생성되어 정상 부팅한다
- [x] `global.css`의 CSS `@theme`이 토큰 원본이고, metro에서
      `withUniwindConfig`가 가장 바깥 래퍼이며, 모노레포 호이스팅 `@source`
      경로가 동작한다
- [x] 루트가 `GestureHandlerRootView` + `HeroUINativeProvider`로 감싸진 뒤에도
      기존 화면 전부가 회귀 없이 동작한다(jest 전체 + 대표 화면 agent-device)
- [x] 세션 복원 대기 화면이 HeroUI `Spinner`로 뜨고, 실제 대기가 생길 때만
      나타나는 지연·번쩍임 금지 규칙이 유지된다
- [x] 설정 오류 화면이 HeroUI `Text`로 사유를 보여주고 재시도 버튼이 없다
- [x] 기존 `launch.tsx`·`hosted-loading-indicator`가 제거됐다
- [x] 시스템 light/dark 전환을 따라 HeroUI 테마가 바뀐다
- [x] React Navigation theme가 CSS 토큰과 같은 의미 값을 bridge로 받는다
- [x] HeroUI `Text`의 Dynamic Type 반응을 확인하고 결과를 스펙 리스크에
      기록했다

## 제약

- 스파이크로 검증된 구성(버전·`@source "../../node_modules/heroui-native/lib"`)
  을 그대로 쓴다 — [spec.md](../spec.md) 기록 참조.
- 아직 이전되지 않은 화면의 `theme/` 소비는 건드리지 않는다. 공존은 이 태스크의
  결함이 아니라 설계다.
- gesture-handler는 native 모듈이므로 `bun run ios`로 dev build를 다시 만든다.

## Status

completed

## Execution

- Base commit: bc9a5dea80f41d22a6aa62db493d99d7d13d5f65
- Task checkpoint commit: 1edf88576a9d40b5efc2fabeec9a17740d7c6cea
- Verification: `bun run check --force` — 8/8 tasks, 0 cached, jest 425/425 (53 suites), lint·typecheck 통과. dev build는 `expo run:ios`로 재생성돼 Build Succeeded, Metro 번들 성공.
- Task review: 블로킹 없음. 리뷰어가 설치된 소스로 세 판단을 검증했다 — 삭제된 구조 가드 3개는 폐기된 2026-08-05 결정을 강제하던 것이고 살아 있는 appearance 가드는 그대로 옮겨졌다, `Text`는 `Typography`의 deprecated 별칭으로 같은 객체다, `withUniwindConfig`가 Metro 캐시를 `os.tmpdir()`로 덮어쓰는 것이 사실이라 워크트리 격리 수정이 맞다. 스피너 색 블로커는 교정 1회로 해소했다. 주의: launch 대기 화면 스크린샷은 교정 이전(파란 스피너) 것이라 색 증거는 렌더 색 테스트와 계산된 대비(light 4.43:1 · dark 7.72:1)이고 시각 확인이 아니다.
- Task correction rounds: 1
- Blocker: resolved task-review — 대기 스피너가 CSS `@theme`의 `muted` 토큰을 `useThemeColor`로 받아 중립 회색으로 그려진다. 회귀 테스트가 실제 페인트된 색을 읽어 accent 부재를 확인한다.
