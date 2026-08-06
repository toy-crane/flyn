# 네이티브 셸과 HeroUI 브랜드 층의 경계

## Decisions

- 앱의 시각 체계는 두 층이다. 시스템이 소유하는 **네이티브 셸**(Expo Router
  native stack/tabs, `@expo/ui` form·sheet·alert)과 HeroUI Native가 소유하는
  **브랜드 콘텐츠 층**. 콘텐츠 화면을 플랫폼 모조로 만들지 않고 HeroUI 디자인
  시스템을 그대로 드러낸다.
- renderer 배정은 surface 단위다.
  - 앱 셸 — Expo Router native stack/tabs. navigation, toolbar, formSheet,
    back gesture와 그 위 시스템 표현(Liquid Glass 등)을 시스템이 소유한다.
  - 시스템이 의미를 온전히 표현하는 화면(현재 Settings의 grouped `Form` 하나) —
    `@expo/ui`. 플랫폼 표현을 유지한다. 폼 요소가 필요하다는 이유만으로 이 층을
    고르지 않으며, native toolbar가 있는 시트라도 본문은 HeroUI다.
  - 그 외 RN이 그리는 모든 화면 — HeroUI Native가 기본 renderer다. 필요한
    표현이 없으면 HeroUI primitive·토큰 위에 커스텀을 만들고, 대응물이 전혀
    없는 능력만 raw RN으로 만든다.
- 한 surface에는 하나의 주 renderer만 쓴다. 개별 control 때문에 renderer 경계를
  반복해서 넘지 않는다.
- 시스템 컴포넌트·navigation·gesture 관용은 Apple HIG를 따른다. native
  `Form`·`List`·sheet·navigation·alert의 표면·재질·간격·글자 위계는 플랫폼이
  소유하며 앱 토큰으로 다시 칠하지 않는다.
- native toolbar와 control action에는 시스템 symbol을 우선한다. SF Symbols를
  의미 이름으로 native API에 전달하고 크기·굵기·tint·hit target은 시스템에
  맡긴다. 브랜드 층 안의 아이콘·상태 표현은 HeroUI 관용을 따른다.
- Apple·Google처럼 외부 브랜드가 규격을 소유한 표면은 HeroUI 컴포넌트로
  렌더링하되 브랜드 지침이 외형(로고, 문구, 최소 크기, 대비)을 소유한다. 앱
  accent로 다시 칠하지 않는다.
- 시스템 폰트와 native stack header, back gesture를 유지한다.
- 앱이 소유하는 foreground/background 조합은 접근성 대비를 검증한다.

## Why

이전 계약의 목표는 "플랫폼이 준 것처럼 보이는 앱"이었고, 콘텐츠 화면도 얇은
스타일 파운데이션 위에 직접 만들었다. 그 결과 native 표면과 직접 만든 표면의
시각 sync를 사람이 계속 맞춰야 했고, 이 유지비가 native 모사의 이익을 넘었다.
유지되는 디자인 시스템이 브랜드 층을 소유하고 시스템이 셸을 소유하면 sync를
맞출 표면 자체가 사라진다. 두 층이 다르게 보이는 것은 결함이 아니라 경계다.

## Boundaries

- `@expo/ui` 표면과 navigation chrome에 HeroUI 토큰을 강제하지 않는다. 색 연결은
  스타일 파운데이션 계약의 bridge 규칙만 따른다.
- HeroUI 컴포넌트를 시스템 컴포넌트처럼 보이게 재스타일하지 않는다. 시스템
  표현이 필요한 화면은 `@expo/ui`로 만든다.
- 브랜드 mark와 제품 고유 그림은 custom asset을 쓸 수 있고 SF Symbol을 억지로
  끼워 맞추지 않는다. 시스템 symbol에는 접근성 label을 함께 둔다.
- 앱 안에 appearance 선택기를 만들지 않고 시스템 light/dark를 따른다.

## Reconsider when

HeroUI의 시각 언어가 제품 브랜드와 충돌해 대규모 재정의가 필요해지거나, 셸까지
브랜드가 소유해야 하는 요구(커스텀 navigation 등)가 생기면 층 경계를 다시
결정한다.

## Still-rejected alternatives

- 콘텐츠 화면을 플랫폼 모조로 직접 만들기 — 직전 계약. sync 유지비로 기각.
- 자체 팔레트·컴포넌트 세트를 처음부터 만들기 — HeroUI 채택으로 대체.
- HeroUI 토큰으로 native 표면까지 픽셀 단위 통일하기.
- 색까지 전부 OS에 위임해 브랜드 표현을 포기하기.
