# Apple refresh token을 보관하지 않고, 계정 삭제는 Supabase hard delete만 한다

계정 삭제는 Auth 사용자를 hard delete하는 것으로 끝난다. Apple 쪽 사용자
승인은 취소하지 않고, 그러기 위해 필요한 refresh token도 보관하지 않는다.

**이 기록은 2026-07-27에 정반대 결정을 뒤집은 것이다.** 원래는
`store-apple-revocation-token`이었고, Apple 로그인 때 authorization code를
서버로 보내 refresh token으로 교환·보관했다가 삭제 직전에 취소하는 흐름을
확정했었다. 왜 뒤집었는지가 이 기록의 알맹이다.

## 무엇이 진짜 요구인가

Apple의 [계정 삭제 안내](https://developer.apple.com/kr/support/offering-account-deletion-in-your-app/)에서
두 문장의 무게가 다르다.

- **딱딱한 요구** (App Store Review Guideline 5.1.1(v), 2022-06-30부터):
  계정을 만들 수 있는 앱은 **앱 안에서 계정 삭제를 시작할 수 있어야 한다.**
- **권고**: "Apps that support Sign in with Apple **should** use the Sign in
  with Apple REST API to revoke user tokens."

취소는 `should`다. 우리가 만들었던 것은 그 `should` 하나를 위해 서버 전용
저장소, `.p8` 키 관리, client secret JWT 생성, token 교환·취소 왕복, 그리고
실패 경로까지 딸린 기계였다.

## 뒤집은 이유 — 권고가 요구를 막고 있었다

그 기계는 취소에 실패하면 삭제를 중단시켰다. 그런데 이 저장소에는 실제
`.p8` 키가 없다. 결과적으로 **Apple로 로그인한 사용자는 계정을 아예 지울 수
없었다.** `should`를 지키려다 `must`를 어긴 상태였다.

원래 기록이 중단을 택한 근거는 "먼저 지우면 재시도 수단을 잃는다"였다. 그런데
계정이 사라진 뒤에 재시도할 주체가 없다 — 사용자는 떠났고 우리에겐 나중에
처리할 큐도 없다. 지켜 주는 것이 없는 근거였다.

## 대가 — 무엇을 포기했는지 분명히

사용자의 Apple ID 설정에는 flyn이 "Apple로 로그인한 앱" 목록에 계속 남는다.
사용자가 직접 지울 수는 있지만, 우리가 치워 줄 수단은 없다. 우리 쪽 데이터는
전부 사라지므로 개인정보가 남는 것은 아니고, 남는 것은 Apple 계정의 항목
하나다.

심사에서 이 `should`를 지적받으면 되돌린다. 걷어낸 모양은 git 이력에 그대로
있다(`store-apple-revocation-token`).

## 기각한 중간안

**취소를 최선 노력으로 두기** — 시도하되 실패해도 삭제는 진행하는 안이다.
딱딱한 요구를 막지 않으면서 권고도 가능한 한 지키므로 원리상 가장 낫다.
기각한 이유는 지금 실제 키가 없어 **항상 실패 경로로만 도는 코드**를 유지하게
되기 때문이다. 키를 넣을 시점이 정해지면 이 안으로 되돌리는 것이 자연스럽다.

## 지금 삭제가 하는 일

1. 현재 인증 세션과 명시적 destructive 확인으로 요청 의도를 확인한다.
2. Hono의 서버 전용 Supabase admin client가 Auth 사용자를 hard delete한다.
3. `on delete cascade`로 프로필과 사용자 소유 throwaway 데이터가 삭제된다.
4. 앱은 로컬 세션과 사용자 캐시를 비우고 로그인 화면으로 돌아간다.

Storage 객체가 생기면 2단계 앞에 소유 객체 삭제가 들어가야 한다. 지금은
객체가 없다.
