# Uniwind와 앱 색의 단일 원본

## Decisions

- className 스타일링은 Uniwind의 무료 MIT 범위를 사용한다.
- 앱 light/dark 색 역할의 단일 원본은 `apps/mobile/src/global.css`의 `--app-*`
  변수다. `@theme`가 이를 시맨틱 Tailwind 이름에 연결한다.
- RN은 `bg-background`, `text-foreground` 같은 시맨틱 `className`으로 색을
  소비한다. 값 이름의 raw 팔레트와 색상용 `dark:` 분기를 쓰지 않는다.
- Navigation, System UI, color prop과 `@expo/ui`는 `useCSSVariable()`로 같은 값을
  읽는다. JavaScript bridge는 변수 이름만 알고 light/dark 값을 복제하지 않는다.
- `Host` 안에서는 Uniwind `className`을 쓰지 않는다. native 기본색이 충분하면
  지정하지 않는다. `seedColor`에는 `--app-primary`를 전달해 native control의
  tint를 연결하고, 제품 상태나 앱 소유 canvas에 필요한 색만 CSS 값을 받는다.
- `Host` wrapper의 background는 RN과 맞닿은 앱 소유 canvas에만 쓴다. native
  `Form`·`List`·sheet의 system background나 material을 앱 배경으로 바꾸는
  bridge로 쓰지 않는다.
- 시스템 appearance가 light/dark를 고르며 앱 안에 theme selector를 만들지
  않는다.

## Why

CSS 한 곳이 값을 소유하면 RN, Navigation과 Expo UI가 이름만 같은 별도 팔레트로
갈라지지 않는다. Uniwind는 현재 필요한 정적 style과 시맨틱 className을 무료
범위에서 제공한다.

## Boundaries

- Apple·Google vendor surface는 브랜드 규격의 색을 유지한다.
- 앱 테마는 색 역할만 소유하며 크기·간격·타이포 토큰을 만들지 않는다.
- CSS 값은 `PlatformColor`가 아니므로 iOS 릴리스별 미세 조정과 Increase Contrast
  자동 대응을 얻지 못한다. 기본 light/dark 대비는 직접 검증한다.
- explicit 앱 색을 작은 일반 텍스트로 쓰면 실제로 놓이는 모든 배경에서 4.5:1
  이상이어야 한다. 아이콘·큰 텍스트의 별도 기준을 일반 텍스트에 대신 쓰지 않는다.
- Uniwind의 layout·spacing·typography는 RN surface에서 계속 사용할 수 있다.

## Reconsider when

Uniwind 무료 범위에서 실제 성능·애니메이션 병목이 재현되면 Pro를 평가한다.
치명적인 호환성 문제가 생기면 같은 className 모델인 NativeWind로 이동한다.
사용자 선택 appearance가 제품 요구가 되면 mode 소유권을 다시 결정한다.

## Still-rejected alternatives

- raw Tailwind 색, 화면별 `dark:` 색과 TypeScript light/dark 팔레트 병행.
- `PlatformColor` 또는 renderer별 토큰을 앱 테마 원본으로 두기.
- CSS와 별개인 React theme context나 `ThemeProvider`에 같은 값을 복제하기.
- `presentationBackground(app.background)`와
  `scrollContentBackground('hidden')`으로 native grouped surface를 RN 배경과
  맞추기.
- 사용하지 않는 warning·brand·elevation·gradient 역할을 미리 만들기.

## Evidence worth preserving

설치된 Expo UI는 RN `ColorValue`를 foreground·background·tint와 `Host.seedColor`에
전달할 수 있다. renderer별 제품 의미 값을 따로 둘 기술적 이유가 없다. iOS의
native surface 값은 제품 의미 토큰의 복사본이 아니므로 CSS에 넣지 않는다. CSS
변수 변경 시 대비를 자동 판정하는 테스트는 없으므로 실제 light/dark 확인이
필요하다.
