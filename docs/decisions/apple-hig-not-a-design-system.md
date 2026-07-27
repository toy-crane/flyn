# 커스텀 디자인 시스템을 만들지 않는다 — Apple HIG를 따른다

디자인의 중심은 **Apple HIG(Human Interface Guidelines) 준수**다. 자체 팔레트·
타이포 스케일·컴포넌트 세트를 만들지 않고 iOS 네이티브 룩앤필을 그대로 따른다.
시스템 컴포넌트와 내비게이션 패턴을 우선하고, 그것으로 안 되는 곳만 직접 만든다.

이 결정이 이 저장소 UI 규칙 대부분의 부모다:

- [expo-ui-by-default](expo-ui-by-default.md) — 화면을 네이티브 컴포넌트로 만든다
- [ios-semantic-colors](ios-semantic-colors.md) — 색은 시스템이 정한다
- [uniwind-for-styling](uniwind-for-styling.md) — Uniwind에 레이아웃·간격·타이포만
  남긴 것이 이 때문이다

## SF Symbols는 `expo-image`로 쓴다

심볼이 필요하면 `expo-symbols`가 아니라 **`expo-image`의 `source="sf:…"`** 를
쓴다(Expo 공식 스킬 지침). 이 저장소가 원래 적었던 `expo-symbols` 지정은 이
점에서 낡았다.

## 대가

브랜드 표현의 여지가 좁다. iOS가 준 것처럼 보이는 것이 목표이므로, 눈에 띄는
자체 정체성이 필요해지면 그때 이 결정을 다시 연다. 지금은 제품 도메인조차
정해지지 않아 표현할 브랜드가 없다는 점이 이 선택을 싸게 만든다.
