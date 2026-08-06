# 화면 경계: Expo UI, HeroUI와 커스텀 확장

## Decisions

- 라우팅, 서버 상태, mutation, 검증과 화면 상태는 React가 소유한다.
- `@expo/ui`는 grouped `Form`처럼 시스템이 의미를 온전히 표현하는 화면이 한
  `Host` subtree로 완결될 때만 쓴다. 현재 그 화면은 Settings 하나다. 폼 요소가
  필요하다는 이유만으로 이 층을 고르지 않는다. universal에 없는 표현만
  `@expo/ui/swift-ui`로 내려가고, control마다 RN과 경계를 왕복하지 않는다.
- 시트 프레젠테이션(`formSheet`), `Stack.Toolbar`, sheet material 같은 chrome은
  셸이 소유하며 본문 renderer와 독립이다. native toolbar가 있는 시트라도 본문이
  시스템 표현으로 완결되지 않으면 HeroUI로 만든다.
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
| Settings(grouped `Form` 화면) | universal `@expo/ui` — 시스템이 의미를 온전히 표현하는 현재 유일한 화면 |
| 프로필 편집 시트(닉네임·아이디) | 셸 `formSheet`·native toolbar 유지, 본문은 HeroUI — `TextField`, `Description`·`FieldError`, `Chip` 추천, `Spinner` 가용성 신호 |
| launch(세션 복원 대기·설정 오류) | HeroUI — `Spinner`와 `Text`. 지연 표시 등 모션 규칙은 native-motion 계약을 따른다 |
| root sign-in·이메일 입력 | HeroUI. Apple·Google 버튼도 HeroUI `Button` 기반으로 만들되 브랜드 지침이 외형을 소유한다 |
| 온보딩(닉네임·아이디) | HeroUI — sign-in과 같은 하단 CTA 전진 흐름이자 첫 브랜드 표면. 설정 편집과는 검증·정규화 순수 함수만 공유한다 |
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
