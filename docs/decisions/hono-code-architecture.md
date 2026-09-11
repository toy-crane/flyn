# Hono 코드 구조

## 결정

- `apps/api/src/app.ts`가 Hono 앱을 조립하고 Vercel에 기본 내보내기로 제공한다.
  `index.ts`는 같은 `createApp()`을 사용하는 로컬 Bun 진입점이며 Bun의
  idle timeout만 설정한다. 인증, 경로와 오류 처리를 진입점마다 복제하지 않는다.
- 서버 코드는 API 기능을 먼저 나누고 각 기능 안에 Hono sub-app, handler와
  기능 전용 설정을 함께 둔다.
- `app.ts`는 기능 sub-app을 `app.route()`로 조립하고 앱 전체 오류 처리를
  소유한다.
- 둘 이상의 기능 또는 앱 조립 코드가 실제로 함께 쓰는 코드만 `shared`에 둔다.
- 테스트는 `createApp().request()`를 공개 경계로 사용하고 내부 파일 배치를
  계약으로 검사하지 않는다.
- 배포용 기본 내보내기도 HTTP 요청으로 확인한다. 로컬 Bun 설정만 바꾸어
  Vercel 실행에도 적용했다고 판단하지 않는다.

## 경계

- 공개 상태 확인은 `health`, 인증된 에피소드와 물어보기 요청은 `episode`가 맡는다.
- 한 기능은 다른 기능의 내부 파일을 직접 import하지 않는다.
- Hono handler는 경로 선언과 함께 두며 별도 Controller로 분리하지 않는다.
- 실제 코드가 생기기 전에는 `Service`, `Repository`, `Model`, `Types` 폴더와
  빈 책임 폴더를 만들지 않는다.
- 이 결정은 API 경로, 인증 정책, 요청과 응답 형식 또는 데이터 저장 방식을
  정하지 않는다.

## 이유

기능을 먼저 나누면 한 API 동작과 함께 바뀌는 코드를 가까이 두고 소유권을
분명히 할 수 있다. Hono는 큰 앱을 기능별 Hono 인스턴스로 나누고
`app.route()`로 합치는 방식을 권장한다. 경로 handler를 별도 Controller로
떼면 Hono의 경로 매개변수 타입 추론이 복잡해진다. 현재 없는 기술 계층을 미리
만들지 않으면 작은 서버의 탐색 비용과 빈 추상화를 줄일 수 있다.

## 재검토 조건

- 여러 기능이 같은 서버 동작을 반복해 소유해 기능 경계보다 중복 비용이 더
  커질 때
- 하나의 기능이 커져 route 파일만으로 업무 규칙과 외부 연동의 경계를
  이해하기 어려워질 때
- Hono RPC를 도입해 route 조립 방식과 공개 타입 경계를 따로 정해야 할 때
- 다른 서버 앱이 생겨 `apps/api` 바깥에서 서버 기능을 공유해야 할 때

## 계속 제외하는 대안

- 최상위 `controllers`, `services`, `repositories`, `models` 폴더: 하나의 API
  기능이 기술 분류별로 흩어지고 현재 없는 계층까지 만들게 된다. 기술 계층별
  변경이 기능별 변경보다 잦아질 때만 다시 검토한다.
- 모든 서버 코드를 `app.ts`에 유지: 초기에는 단순하지만 기능이 늘면 앱 조립,
  인증, 설정과 handler 소유권이 섞인다. 서버가 현재 두 경로보다 더 작아질 때만
  다시 검토한다.

## 보존할 근거

- Hono 공식 Best Practices는 큰 앱에서 기능별 Hono 인스턴스를 만들고
  `app.route()`로 합치며, 가능한 경우 별도 Controller를 만들지 않도록 권한다.
- [Vercel의 Hono 안내](https://vercel.com/docs/frameworks/backend/hono)는 Hono를
  가져오는 앱 파일의 기본 내보내기를 요구한다. Vercel 빌드는 `index.ts`가 아니라
  `src/app.ts`를 handler로 고른다. 운영 배포 기록은 [API 운영 배포](../api-production.md)에 있다.
