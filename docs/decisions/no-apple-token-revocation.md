# 계정 삭제와 Apple token 취소

## Decisions

- 계정 삭제는 현재 인증과 명시적 destructive 확인 뒤 서버의 Supabase admin
  client가 Auth 사용자를 hard delete하는 것으로 완료한다.
- Apple refresh token과 `.p8` key를 보관하지 않고 Apple 승인을 자동 취소하지
  않는다.
- Auth 사용자 삭제는 DB cascade로 프로필, 채팅방과 메시지를 제거하며 앱은 로컬
  session과 사용자 cache를 비운다.
- 사용자 소유 Storage 객체가 생기면 Auth 삭제 전에 객체 정리 단계를 추가한다.

## Why

실제 Apple key 없이 token 취소를 필수 단계로 두면 취소가 항상 실패해 사용자가
계정을 삭제할 수 없게 된다. 앱 안에서 계정 삭제를 완료하는 요구를 먼저 지키고,
사용할 수 없는 취소 기계와 secret 저장소는 유지하지 않는다.

## Boundaries

삭제 뒤 Apple ID의 “Apple로 로그인한 앱” 목록에는 flyn이 남을 수 있다. 앱 쪽
개인정보와 인증 사용자는 삭제되지만 사용자가 Apple 설정에서 직접 지울 항목은
남는다.

## Reconsider when

실제 Apple private key와 운영 가능한 재시도 경계를 갖추거나 심사에서 token
취소가 요구되면, 삭제를 막지 않는 best-effort 취소를 우선 평가한다.

## Still-rejected alternatives

- Apple 취소 실패를 이유로 Supabase 계정 삭제 중단하기.
- 사용할 key와 재시도 주체 없이 refresh token 저장·취소 파이프라인 유지하기.

## Evidence worth preserving

이전 취소 구현은 `.p8` key 부재 때문에 항상 실패 경로로 들어가 Apple 사용자의
삭제를 막았다. token 취소를 복원하더라도 hard delete의 성공을 종속시키지 않는다.
