# 스타일링은 Uniwind — 무료 범위로 충분하고, `Host` 밖에서만 쓴다

className 기반 스타일링에 Uniwind(Tailwind v4 바인딩)를 쓴다. Uniwind가 맡는
범위는 **레이아웃·간격·타이포**다. 색은 맡지 않는다 —
[ios-semantic-colors](ios-semantic-colors.md)를 보라.

## `Host` 안에서는 무효다

`@expo/ui`의 `Host` 안쪽은 SwiftUI 트리라서 Uniwind `className`이 아무 일도
하지 않는다. Uniwind는 `Host` 바깥에서만 쓰고, 한 화면에서 두 방식을 섞지
않는다. 경계 자체의 근거는 [expo-ui-by-default](expo-ui-by-default.md).

## 무료(MIT) 범위로 충분하다

태스크 01에서 확인했다. 무료는 MIT 라이선스에 프로젝트 제한이 없고 Tailwind
v4 전체를 지원하며, 공식 문서가 프로덕션 준비 상태라고 명시한다.
Pro($99/seat/년부터)가 더하는 것은 C++ 네이티브 엔진, 제로 리렌더 ShadowTree
갱신, Reanimated 4 className 애니메이션, 네이티브 스레드 테마 전환,
`group-active:*` 변형 — **전부 성능·애니메이션 계층**이다. 애니메이션 요구가
실제로 생기면 그때 별도 결정으로 다룬다.

당초 반대 근거 중 하나였던 "Pro는 development build를 요구해 Expo Go를
포기해야 한다"는 소멸했다. 네이티브 로그인을 도입하면서 개발 루프가 이미
dev build로 이동했기 때문이다(근거: [native-social-login](native-social-login.md)).
그 이점이 사라져도 **무료 범위로 충분하다는 결론 자체는 유효하다.**

## 남는 리스크와 탈출 경로

2025년 출시된 신생 라이브러리다. 치명적 문제가 생기면 같은 className 모델인
**NativeWind로 전환**하는 경로가 있다.
