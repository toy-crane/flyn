# 모델 호출 경계

## Decisions

- 모델은 AI SDK를 통해 Vercel AI Gateway로만 호출한다. provider SDK를 직접
  추가하지 않는다.
- 모바일 스트리밍은 `@ai-sdk/react`의 `useChat`과 `expo/fetch`를 사용한다.
- 프로덕션 채팅 모델 ID는 API 코드에 고정한다. `AI_MODEL` 환경 변수, model
  picker 또는 원격 설정으로 선택하지 않는다.
- 자동 테스트가 가짜 `LanguageModel`을 주입하는 경계는 유지한다.
- Gateway secret은 `AI_GATEWAY_API_KEY` 하나만 사용한다.

## Why

Gateway는 provider 교체를 모델 ID 변경으로 제한하고 provider별 패키지와 key를
앱 구조에 퍼뜨리지 않는다. 모델 변경은 동작·비용·품질을 함께 바꾸므로 코드 리뷰와
배포 이력에 남아야 한다.

## Boundaries

AI SDK API는 버전마다 바뀐다. 구현할 때 기억이나 이 계약의 예전 예제가 아니라
현재 설치 버전의 번들 문서와 타입을 확인한다.

## Reconsider when

Gateway가 필요한 provider·기능·지역 또는 비용 조건을 제공하지 못하거나, 제품이
사용자별 모델 선택을 명시적으로 요구할 때 호출 경계를 다시 결정한다.

## Still-rejected alternatives

- `@ai-sdk/openai` 같은 provider SDK를 나란히 추가하기.
- 운영 환경 변수나 모바일 UI가 모델을 고르게 하기.
