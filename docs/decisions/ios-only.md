# 타깃은 iOS 전용 — Android·web 폴백을 만들지 않는다

React Native 위에 있지만 **Android는 목표가 아니고 web도 목표가 아니다.**
이것이 명시적 결정인 이유는, RN 코드베이스를 보는 사람이 기본적으로 크로스
플랫폼을 가정하기 때문이다. 그 가정 위에서 `Platform.OS` 분기나 `.android.tsx`
폴백을 "빠뜨린 것"으로 보고 채워 넣기 쉽다.

- 벤더 문서가 플랫폼 분기(`.ios.tsx` 분리, `Platform.OS` 검사)를 요구해도 이
  저장소에서는 해당 없다. 분기 대신 iOS 경로 하나만 만든다.
- iOS 전용이므로 iOS 네이티브 표현으로 곧장 내려가는 선택이 가능하다 —
  [expo-ui-by-default](expo-ui-by-default.md)와 [ios-semantic-colors](ios-semantic-colors.md)가
  이 결정 위에 서 있다.

전환 비용은 낮다. 코드가 RN이라 Android가 필요해지면 별도 결정으로 다룬다.
웹이 필요해지면 모노레포에 Next.js 앱을 추가하는 별도 결정으로 다룬다. 지금
폴백을 미리 만들어 두는 것은 그 낮은 비용을 앞당겨 지불하는 것일 뿐이다.
