# 04 AI 스트리밍 슬라이스

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 03b 배포 파이프
- 상태: 대기

## 무엇을 만드는가

스택의 마지막 이음새인 AI 경로를 관통시킨다. 로그인한 사용자가 앱의
예시 화면에서 메시지를 보내면, JWT 게이트를 통과한 요청이 Hono의
스트리밍 엔드포인트에서 AI Gateway를 거쳐 모델을 호출하고, 응답이
`useChat` + expo/fetch(필요 폴리필 포함)로 토큰 단위 스트리밍 렌더된다.
로컬 API와 배포된 API 양쪽에서 같은 경험이 확인되어야 한다.

기술적 의존은 02까지지만, 배포본 스트리밍 기준을 이 세션 안에서 닫기
위해 03b 뒤에 둔다.

## 완료 기준

- [ ] 비로그인 요청은 AI 엔드포인트에서 거부된다
- [ ] 시뮬레이터에서 로컬 API 기준 토큰 단위 스트리밍이 렌더된다
- [ ] 배포본(TestFlight 빌드 + Vercel API)에서도 스트리밍이 렌더된다
- [ ] AI SDK mock provider 테스트가 모델 호출 없이 스트리밍 프로토콜을
      검증한다
- [ ] AI Gateway 키·모델 지정이 환경 변수 체계로 관리되어 dev/prod에서
      모델 교체가 설정 변경만으로 가능하다
