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

- [ ] 새 의존성(heroui-native·uniwind·tailwindcss·gesture-handler·expo-blur·
      `@gorhom/bottom-sheet`·screens·tailwind-variants·merge)으로 dev build가
      재생성되어 정상 부팅한다
- [ ] `global.css`의 CSS `@theme`이 토큰 원본이고, metro에서
      `withUniwindConfig`가 가장 바깥 래퍼이며, 모노레포 호이스팅 `@source`
      경로가 동작한다
- [ ] 루트가 `GestureHandlerRootView` + `HeroUINativeProvider`로 감싸진 뒤에도
      기존 화면 전부가 회귀 없이 동작한다(jest 전체 + 대표 화면 agent-device)
- [ ] 세션 복원 대기 화면이 HeroUI `Spinner`로 뜨고, 실제 대기가 생길 때만
      나타나는 지연·번쩍임 금지 규칙이 유지된다
- [ ] 설정 오류 화면이 HeroUI `Text`로 사유를 보여주고 재시도 버튼이 없다
- [ ] 기존 `launch.tsx`·`hosted-loading-indicator`가 제거됐다
- [ ] 시스템 light/dark 전환을 따라 HeroUI 테마가 바뀐다
- [ ] React Navigation theme가 CSS 토큰과 같은 의미 값을 bridge로 받는다
- [ ] HeroUI `Text`의 Dynamic Type 반응을 확인하고 결과를 스펙 리스크에
      기록했다

## 제약

- 스파이크로 검증된 구성(버전·`@source "../../node_modules/heroui-native/lib"`)
  을 그대로 쓴다 — [spec.md](../spec.md) 기록 참조.
- 아직 이전되지 않은 화면의 `theme/` 소비는 건드리지 않는다. 공존은 이 태스크의
  결함이 아니라 설계다.
- gesture-handler는 native 모듈이므로 `bun run ios`로 dev build를 다시 만든다.

## Status

in-progress

## Execution

- Base commit: bc9a5dea80f41d22a6aa62db493d99d7d13d5f65
- Task checkpoint commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Blocker: —
