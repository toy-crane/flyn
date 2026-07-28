# 모델 호출은 AI SDK로 하되 반드시 Vercel AI Gateway를 경유한다

AI 기능은 AI SDK로 구현하고, 모델 호출은 프로바이더 SDK를 직접 부르지 않고
**Vercel AI Gateway**를 통한다.

- 프로바이더 교체가 **모델 문자열 변경 수준**이 된다. 어느 모델이 이 제품에
  맞는지 모르는 단계에서 교체 비용을 미리 0에 가깝게 만드는 것이 요점이다.
- 토큰 마진 없이 원가로 과금된다.
- Gateway 프로바이더는 `ai` 패키지에 내장돼 있어 **별도 프로바이더 패키지가
  필요 없다.** `@ai-sdk/openai` 같은 것을 추가하려 한다면 이 결정을 우회하는
  중이다.

모바일 스트리밍은 `@ai-sdk/react`의 `useChat` + `expo/fetch`(Expo 52+ 공식
지원)로 받는다.

## 버전 — 기억으로 쓰지 말 것

이 결정은 원래 "AI SDK(v5)"로 적혔으나 **현재 최신은 v7이다**(`ai@7.0.37`,
2026-07-25 정정). 결정 자체(Gateway 경유 · `useChat` + `expo/fetch`)는 유효하고
버전만 어긋나 있었다. v7에서는 `toUIMessageStreamResponse()`가 deprecated이고
`convertToModelMessages()`가 async가 됐다.

구현은 나중에 다시 설계한다. 그때 이 버전 메모를 현재 사실로 간주하지 말고
**실제로 설치한 버전의 번들 문서(`node_modules/ai/docs/`)를 볼 것.**
