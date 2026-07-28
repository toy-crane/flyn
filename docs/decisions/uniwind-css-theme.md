# 앱 테마의 단일 원본은 Uniwind CSS 변수다

이 기록은 [uniwind-for-styling](uniwind-for-styling.md)과
[shared-ios-semantic-theme](shared-ios-semantic-theme.md)을 대체한다. 앱의
light/dark 시맨틱 색은 `global.css`의 `--app-*` 변수 한 벌이 소유한다.
`@theme`가 이를 Tailwind `--color-*`에 대응시켜 RN은
`bg-background`·`text-foreground` 같은 `className`으로 소비한다.

`className`을 받을 수 없는 Navigation·System UI·서드파티 prop과 `@expo/ui`
경계는 `useCSSVariable()`로 같은 `--app-*` 값을 읽는다. 이 브리지는 변수 이름만
알고 값은 소유하지 않는다. 별도 light/dark TypeScript 팔레트, React theme
context, `Color.ios.*` 기반 앱 테마를 두지 않는다.

시스템 appearance가 `light`와 `dark` variant를 고르며 앱 안에 appearance
선택기를 만들지 않는다. `@expo/ui`에서 네이티브 기본값이 이미 역할을 표현하면
색을 지정하지 않고, 명시가 필요한 background·foreground·tint와 `Host.seedColor`
만 CSS 변수 값을 받는다. `Host` 안에서 Uniwind `className`이 무효라는 경계와
Uniwind 무료 범위를 쓰는 선택은 그대로다.

이 방식은 Evan Bacon의 `chat-template`처럼 CSS를 RN theme의 원본으로 두고
네이티브 API에 필요한 값만 `useCSSVariable()`로 꺼내는 패턴을 따른다. 그의
구체적인 OKLCH 값이나 SwiftUI의 별도 hex 분기는 복사하지 않는다. Flyn은
`@expo/ui`에도 CSS 원본을 전달해 별도 renderer 팔레트를 만들지 않는다.
