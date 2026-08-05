# 모델 호출 경계

## Decisions

- 모델은 AI SDK를 통해 Vercel AI Gateway로만 호출한다. provider SDK를 직접
  추가하지 않는다.
- 모바일 스트리밍은 `@ai-sdk/react`의 `useChat`과 `expo/fetch`를 사용한다.
- **역할마다 모델 ID를 API 코드에 고정한다.** 현재 역할은 롤플레잉 응답, 문장
  판정, 에피소드 생성 셋이고 큰 모델이 필요한 것은 롤플레잉뿐이다. `AI_MODEL`
  환경 변수, model picker 또는 원격 설정으로 선택하지 않는다.
- **역할이 다르면 호출을 나눈다.** 한 번의 호출로 롤플레잉 응답과 문장 판정을
  함께 시키지 않는다.
- 한 요청 안에서 여러 모델을 부를 때 모바일은 한 번만 요청하고 서버가 병렬로
  호출한다. 곁가지 결과는 `createUIMessageStream`으로 같은 스트림에 data part로
  얹어 보낸다.
- 자동 테스트가 가짜 `LanguageModel`을 주입하는 경계는 유지한다.
- Gateway secret은 `AI_GATEWAY_API_KEY` 하나만 사용한다.

## Why

Gateway는 provider 교체를 모델 ID 변경으로 제한하고 provider별 패키지와 key를
앱 구조에 퍼뜨리지 않는다. 모델 변경은 동작·비용·품질을 함께 바꾸므로 코드 리뷰와
배포 이력에 남아야 한다.

역할을 나누는 이유는 비용만이 아니다. 롤플레잉은 캐릭터와 상황 맥락을 유지해야
하고 문장 판정은 문장 하나만 보면 된다. 합치면 큰 모델로 판정까지 하게 되고,
프롬프트에 판정 지시가 끼어들어 캐릭터 유지가 흔들리며, 한쪽이 실패할 때 둘 다
잃는다. 나누면 병렬로 돌 수 있고 실패가 격리된다.

## Boundaries

- AI SDK API는 버전마다 바뀐다. 구현할 때 기억이나 이 계약의 예전 예제가 아니라
  현재 설치 버전의 번들 문서(`node_modules/ai/docs`)와 타입을 확인한다.
- 이 계약은 어떤 역할에 어떤 모델을 쓰는지 정하지 않는다. 역할의 목록과 각
  호출이 무엇을 내놓는지는 해당 작업 단위 문서가 소유한다.

## Reconsider when

Gateway가 필요한 provider·기능·지역 또는 비용 조건을 제공하지 못하거나, 제품이
사용자별 모델 선택을 명시적으로 요구할 때 호출 경계를 다시 결정한다.

## Still-rejected alternatives

- `@ai-sdk/openai` 같은 provider SDK를 나란히 추가하기.
- 운영 환경 변수나 모바일 UI가 모델을 고르게 하기.
- 역할이 다른 일을 한 번의 모델 호출에 몰아 시키기.
- 곁가지 결과를 별도 엔드포인트로 다시 받아오게 하기.

## Evidence worth preserving

설치된 `ai` 7.0.40은 `createUIMessageStream`·`createUIMessageStreamResponse`와
`DataUIPart`·`isDataUIPart`·`ChatOnDataCallback`을 제공하고, `@ai-sdk/react`
4.0.43은 이 타입들을 `ai`에서 그대로 가져다 쓴다. 같은 `id`로 다시 쓰면 기존
data part가 갱신되므로 진행 상태를 단계적으로 보낼 수 있다.
