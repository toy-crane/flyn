# 03 네이티브 인증과 배포 파이프

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 02 Supabase 경계
- 상태: 대기

## 무엇을 만드는가

로컬에만 있던 뼈대를 실기기와 배포 환경으로 확장한다. 사용자는
TestFlight 내부 배포본에서 Apple 또는 Google 로그인으로 실제 세션을
얻는다(02의 익명 로그인을 교체). 배포본은 호스티드 dev Supabase와
Vercel preview API를 바라보고, production 경로(스토어 빌드·prod
프로젝트·Vercel production)도 환경 변수 체계로 준비된다. 마이그레이션은
로컬 → dev → prod 순서로만 흐른다. CI는 PR마다 린트·테스트를 돌리고,
PostHog 계측이 초기화되어 앱 이벤트가 수신된다.

시작 전 답이 필요한 것: Apple Developer Program 계정 상태, 앱 이름과
번들 ID.

## 완료 기준

- [ ] EAS development build로 실기기/시뮬레이터에서 개발이 가능하다
- [ ] Apple 로그인과 Google 로그인 각각으로 세션을 얻는다
- [ ] EAS preview 빌드가 TestFlight 내부 배포되고 dev Supabase·Vercel
      preview를 바라보고 동작한다
- [ ] 마이그레이션이 dev 프로젝트에 CLI로 적용되어 로컬과 스키마가 같다
- [ ] 신형 publishable/secret 키만 사용하고 legacy 키는 어디에도 없다
- [ ] CI가 PR마다 린트·테스트를 실행하고 결과가 PR에 표시된다
- [ ] PostHog에 배포본에서 발생한 이벤트가 수신된다
