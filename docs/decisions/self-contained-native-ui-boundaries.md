# 화면 경계: Expo UI, HeroUI와 커스텀 확장

## Decisions

- 라우팅, 서버 상태, mutation, 검증과 화면 상태는 React가 소유한다.
- 시스템 폼과 짧은 시스템 상태 화면의 renderer는 universal `@expo/ui`다.
  레이아웃과 control은 완결된 `Host` subtree 하나에 모으고, control마다 RN과
  경계를 왕복하지 않는다. universal에 없는 표현만 `@expo/ui/swift-ui`로
  내려간다. RN wrapper·overlay와 `Host`를 형제로 두는 구조는 가능하다.
- 그 외 RN이 그리는 모든 화면의 기본 renderer는 HeroUI Native다. 필요한 표현이
  HeroUI에 없으면 HeroUI primitive(`Surface`, `PressableFeedback`, `Text` 등)와
  토큰 위에 커스텀 컴포넌트를 만든다. 대응물이 전혀 없는 능력(가상 목록,
  streaming 렌더링)만 전용 라이브러리나 raw RN으로 만들고, 그때도 Uniwind
  토큰을 소비한다.
- 재사용 UI는 TSX React 컴포넌트다. custom native module은 `@expo/ui`와 HeroUI가
  모두 표현하지 못하는 native capability에만 검토한다.
- 한 surface에는 하나의 주 renderer만 두고, 같은 화면에서 `@expo/ui` 폼과
  HeroUI 컴포넌트를 control 단위로 섞지 않는다.

## Boundaries

| surface | renderer |
| --- | --- |
| Settings·프로필 편집 시트·온보딩·launch progress | universal `@expo/ui` — 시스템 폼과 시스템 상태 |
| root sign-in·이메일 입력 | HeroUI. Apple·Google 버튼도 HeroUI `Button` 기반으로 만들되 브랜드 지침이 외형을 소유한다 |
| 이메일 OTP code | HeroUI `InputOTP`. iOS SMS AutoFill·붙여넣기·hit testing 검증을 통과하지 못하면 HeroUI 토큰 위 커스텀으로 대체한다 |
| 홈(에피소드 목록)·에피소드 생성·결과·피드백 시트 | HeroUI — `Card`, `BottomSheet`, `Dialog`, `Spinner`, `Toast` 등 |
| 에피소드 대화·문장 질문 | HeroUI 조합 + 커스텀 확장 — 가상 목록(`@legendapp/list`), streaming markdown, composer만 커스텀이고 버튼·시트·상태 피드백은 HeroUI |

## Why

renderer 경계가 surface 단위로 완결돼야 layout·focus·gesture 소유권이 분명하다.
`@expo/ui`는 시스템이 의미를 아는 폼과 상태에 native 관용을 주고, HeroUI는
나머지 화면에 유지되는 브랜드 컴포넌트를 준다. 커스텀을 "HeroUI 위 확장"으로
한정하면 라이브러리가 소유하는 상호작용·접근성·테마를 잃지 않으면서 진짜 필요한
능력만 직접 만든다.

## Reconsider when

Expo SDK나 HeroUI 릴리스가 기존 제약(아래 spike 근거, InputOTP 검증)을 바꾸거나
새 surface가 표의 어느 행에도 맞지 않으면 그 surface만 다시 판정한다.

## Still-rejected alternatives

- 콘텐츠 화면 컴포넌트를 맨땅 RN으로 자작하기 — 직전 계약. sync 유지비로 기각.
- `@expo/ui`를 통째로 기각하고 시스템 폼까지 HeroUI로 통일하기.
- 한 화면에서 renderer를 control 단위로 섞거나 control마다 `Host`를 다시 열기.
- 재사용을 이유로 Expo UI 위에 별도 Swift 모듈 만들기.

## Evidence worth preserving

- `@expo/ui` OTP spike: `frame`을 건 SwiftUI `TextField`와 `ZStack`의 투명
  필드는 focus hit testing에 실패했다. OTP를 `@expo/ui`로 만들지 않는 근거로
  남는다. HeroUI `InputOTP`는 RN 쪽이라 이 제약과 무관하지만 iOS SMS AutoFill과
  붙여넣기는 채택 전 검증 대상이다.
- root sign-in을 SwiftUI로 감싸면 vendor button 때문에 경계를 반복해서 열어야
  했다. HeroUI 채택으로 sign-in 전체가 한 renderer 안에서 완결된다.
- HeroUI Native v1.0.x는 39종 컴포넌트를 제공한다. 목록은 설치된
  `heroui-native` 스킬의 `list_components.mjs`로 확인한다.
