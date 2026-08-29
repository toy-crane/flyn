# 로그인한 사용자가 플레이하지 않고 자기 스토리 진행을 기록할 수 있다

**Symptom**: 로그인만 한 사람이 앱을 한 번도 열지 않고 결말을 기록해 스토리를
진행시킬 수 있다. 결말 종류와 결과 문장도 자기가 정한다. 각 에피소드에 반복하면
영어를 한 문장도 쓰지 않고 스토리가 끝난 상태가 된다. "한 번 난 결말은 무를 수 없다"는
제품 장치가 이 경로로 우회된다.

**Observed evidence**: 로컬 스택의 현재 pgTAP은 앱을 열지 않은 로그인 계정이
`finish_episode`를 직접 불러 첫 화를 끝낼 수 있음을 고정한다. 함수는 플레이가
없어도 `episode_plays` 행을 만들면서 닫고, `GET /ai/episode/home`은 다음 화를
이어 갈 대상으로 돌려준다.

```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/finish_episode" \
  -H "apikey: $PUBLISHABLE_KEY" -H "authorization: Bearer $MY_TOKEN" \
  -H "content-type: application/json" \
  -d '{"episode_id":"<현재 스토리의 첫 에피소드 UUID>","kind":"성공","outcome":"플레이하지 않고 적은 결말."}'
```

토큰은 `POST /auth/v1/otp`와 `POST /auth/v1/verify`로 자기 이메일에 온 코드를 써서
받았다. 앱을 뜯지 않았다.

**Suspected cause**: 세 가지가 겹친 결과로 본다. `supabase/config.toml`이 `public`
스키마를 Data API에 노출하므로 그 안의 함수는 `/rest/v1/rpc/<이름>`으로 닿는다.
`supabase/schemas/50-functions.sql`이 `finish_episode`의 EXECUTE를 `authenticated`
전체에 준다. `apps/mobile/src/shared/supabase/client.ts`가 읽는
`EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 앱 번들에
들어가는 공개 값이다. 그래서 데이터베이스는 Hono 서버가 부른 것과 그 사람이 직접
부른 것을 구별할 수 없다. [AI 서버 경계](../decisions/ai-server-boundary.md)에 따라
`apps/api`는 실제 secret key를 갖지 않으므로 서버만 아는 값으로 구별할 수단도 없다.

**What was tried**: 함수 자체는 남의 계정을 건드리지 못하게 막아 두었다.
`auth.uid()`로 부른 사람을 확인하고 그 계정에만 쓰며, 요청에 다른 아이디를 실어도
무시한다. 지금 플레이할 에피소드가 아닌 ID로 앞 화를 건너뛰는 것도 막는다. 그래서
피해는 자기 계정 안에 갇힌다. 남의 진행을 읽거나 고치거나 지우는 경로는 없고, 이
부분은
`supabase/tests/episode_plays_test.sql`과 `supabase/tests/episode_progress_test.sql`이
고정한다. 자기 계정을 스스로 꾸미는
경로는 그대로 열려 있다.

**Proposed next step**: 받아들일지 막을지를 먼저 정한다. 받아들인다면 이 신뢰
경계를 결정 계약에 적어 다음 세션이 같은 질문을 다시 열지 않게 한다. 막는다면
서버만 아는 값을 함수가 확인하게 해야 하는데, `apps/api`가 그 값을 어디에 두고
어떻게 받을지가 [AI 서버 경계](../decisions/ai-server-boundary.md)를 다시 여는
질문이므로 그 결정부터 거친다.
