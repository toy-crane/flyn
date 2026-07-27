# 색은 iOS 시맨틱 색으로만 쓴다 — `dark:` 변형을 색에 쓰지 않는다

색은 Tailwind 팔레트(slate/sky 등)가 아니라 **iOS 시스템 시맨틱 색**을 쓴다.
`expo-router`의 `Color` API를 통한다(`expo-router@57.0.8`에 실재함을 확인:
`build/color/index.d.ts`의 `export declare const Color: ColorType`). 이것은
`PlatformColor`의 타입 안전 래퍼라 라이트/다크는 물론 **접근성 설정(대비 증가
등)까지 OS가 알아서 반영**한다.

`apps/mobile/src/theme/colors.ts` 한 곳에 모으고 전부 거기서 import 한다.

| 쓰임 | 토큰 |
| --- | --- |
| 화면 배경 | `systemBackground` |
| 제목·본문 | `label` |
| 보조 문구 | `secondaryLabel` |
| 비활성 라벨 | `tertiaryLabel` |
| 채운 버튼 | `systemBlue` / 비활성 `systemGray5` |
| 입력 필드 배경 | `secondarySystemBackground` |
| 플레이스홀더 | `placeholderText` |
| 구분선 | `separator` |
| 에러 | `systemRed` |
| 콘텐츠 위를 덮는 막 | `systemFill` |

## 되돌리지 말 것 — `dark:`는 색에 쓰지 않는다

Tailwind/Uniwind 프로젝트에서 `dark:` 변형이 없는 색은 "빠뜨린 것"으로 보이기
쉽다. **시맨틱 색이 스스로 뒤집으므로 `dark:`를 붙이면 그 동작을 덮어쓴다.**
Uniwind의 `dark:`는 색이 아닌 용도에만 남는다.
[uniwind-for-styling](uniwind-for-styling.md)이 Uniwind에 남긴 범위가
레이아웃·간격·타이포뿐인 것이 이 때문이다.

Uniwind와의 공존은 확인됐다: className 스타일이 먼저, `props.style`이 나중에
붙으므로 `style`이 이긴다.

## 아는 한도

- 배경은 `systemGroupedBackground`(연회색)가 아니라 **`systemBackground`**(흰/검)를
  기본으로 둔다. inset grouped 행이 있는 화면이 생기면 그 화면에서 다시 판단한다.
- **jest에서 목이 필요 없다(2026-07-27 확인).** 한때 "`Color`는 모듈 로드 시점에
  `PlatformColor`를 호출한다"고 적었는데 정확하지 않았다 — `Color.ios`는
  **`Proxy`** 이고 프로퍼티 접근마다 부른다(`build/color/index.js`). 그리고
  jest에서 `PlatformColor`는 `PlatformColorValueTypes.ios.js`의 순수 JS
  (`(...names) => ({semantic: names})`)라 던지지 않는다.
- **다만 `expo-router`를 부분 목으로 바꾸는 테스트는 `Color`를 함께 넘겨야 한다.**
  빠뜨리면 `theme/colors.ts`가 로드 시점에 `undefined.ios`로 죽어 **색과 무관한
  테스트가 통째로 넘어간다.** 팩토리에
  `Color: jest.requireActual("expo-router/build/color").Color` 한 줄을 넣는다
  (`requireActual("expo-router")`는 네비게이터까지 끌어오므로 쓰지 않는다).
- **`Host` 안에는 이 토큰이 들어가지 않는다.** `@expo/ui`의 `foregroundStyle`만
  `PlatformColor`와 계층 스타일을 받고, `background`·`tint`는 hex 문자열만 받는다.
  hex를 칠하면 다크 모드가 깨지므로 **SwiftUI 화면은 색을 지정하지 말고 네이티브
  기본값에 맡긴다** — 기본 `Text`가 곧 `label`, 기본 배경이 `systemBackground`다.
