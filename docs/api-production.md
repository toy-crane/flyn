# API 운영 배포

## 프로젝트

- Vercel 팀: ODD (`odd-inc`)
- 프로젝트: `flyn-api` (`prj_nPla0LdaA37WCfo0uai0kuMBkgLC`)
- Dashboard: https://vercel.com/odd-inc/flyn-api
- 운영 API: https://flyn-api.vercel.app
- Root Directory: `apps/api`. 모노레포의 공유 패키지를 함께 사용한다.
- Framework: Hono. Node.js 24.x, 함수 리전은 서울(`icn1`)로 배포한다.
- Git 자동 배포는 연결하지 않았다. 저장소 루트에서 CLI로 배포한다.

```sh
vercel link --yes --project flyn-api --scope odd-inc
vercel deploy --prod --yes --scope odd-inc --regions icn1
```

현재 CLI의 `link --repo`는 Git에 연결된 프로젝트를 찾지 못했다.
이 worktree는 API 프로젝트 하나만 명시적으로 연결한다. `.vercel`은 Git에서 제외한다.
다른 웹 프로젝트를 배포할 때 이 연결을 그대로 사용하지 않는다.

## 운영 환경 변수

- `SUPABASE_URL`: 운영 `flyn` 프로젝트 주소
- `SUPABASE_JWKS_URL`: 같은 프로젝트의 `/auth/v1/.well-known/jwks.json`
- `SUPABASE_PUBLISHABLE_KEY`: 같은 프로젝트의 공개 키
- `AI_GATEWAY_MODEL`: `openai/gpt-5.6-luna`

Supabase secret key는 API에 등록하지 않는다. AI Gateway는 Vercel의 OIDC 인증을
사용하므로 `AI_GATEWAY_API_KEY`를 등록하지 않았다. 새 결제와 자동 충전은 설정하지 않았다.
모델은 2026-09-09 AI Gateway 모델 목록에서 제공 여부를 확인했다.

## 검증 범위

- 2026-09-09 배포 `dpl_4FWFVhHf1K2u2baCkB4yE8pAjKKw`가 READY 상태로 운영 주소에 연결됐다.
- 일반 인터넷 요청에서 `GET /health`는 200과 `{"status":"ok"}`, 인증 없는
  `POST /ai/episode`는 401과 `{"error":"Unauthorized."}`를 반환했다.
- API 로컬 테스트 111개, 타입 검사와 코드 검사를 통과했다.
- 실제 로그인과 AI 대화 검증은 운영 인증 설정 후 별도로 진행한다.

## 배포 호환 설정

- Node.js와 Web API 타입을 명시한다. Bun의 간접 타입 의존성만으로는 Vercel 타입 검사를 통과하지 못했다.
- API 패키지는 `type: module`을 사용하고 실행 시 참조하는 상대 import에는 `.js` 확장자를 쓴다.
- Vercel이 선택하는 `src/app.ts`는 Hono 앱을 기본 내보내기로 제공한다.
  로컬 Bun 실행은 기존 `src/index.ts`와 idle timeout 설정을 유지한다.
- 빌드 성공만으로 배포 완료를 판단하지 않는다. 운영 주소의 실제 HTTP 응답도 확인한다.
