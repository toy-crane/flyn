# 지원 플랫폼

## Decisions

제품 타깃은 iOS 하나다. Android와 web 폴백, `Platform.OS` 분기,
`.android.tsx`·`.ios.tsx` 쌍을 미리 만들지 않고 iOS 경로만 구현한다. 벤더 예제가
플랫폼 분리를 전제로 해도 이 저장소에서는 필요한 iOS 부분만 적용한다.

## Why

React Native 저장소라는 이유만으로 사용하지 않는 플랫폼의 구현과 검증 비용을
지불하지 않는다. iOS 네이티브 관용을 직접 쓰는 편이 현재 제품의 범위와 일치한다.

## Reconsider when

Android 제품 요구가 생기면 같은 RN 코드에서 별도 플랫폼 결정을 내린다. web 제품
요구가 생기면 모노레포의 별도 web 앱을 포함해 경계를 다시 설계한다.

## Still-rejected alternatives

- 미래 가능성만으로 빈 fallback이나 플랫폼 분기 추가하기.
- iOS 전용 API를 쓰지 않기 위해 공통분모 UI로 낮추기.
