# 같은 경로로 갈아 낀 스토리 표지가 옛 그림으로 남는다

**Symptom**: `supabase/story-covers/`의 표지 파일을 새 그림으로 덮고 버킷에 다시
올려도, 이미 그 표지를 한 번 받은 앱은 계속 옛 그림을 보여 준다. 스토리 탭의
타일이 바뀌지 않는다.

**Observed evidence**: 2026-08-29 iOS 시뮬레이터(flyn-slot-4)에서 확인했다.
표지 다섯 장을 새 구도로 다시 만들어 `supabase seed buckets --local`로 올리고
`agent-device metro reload`로 번들을 새로 받았는데도 목록의 타일은 이전 반신
초상 그대로였다. `agent-device open --relaunch`로 앱을 다시 띄운 뒤에야 새
그림이 나왔다. 공개 주소는 두 경우 모두 200을 돌려줬다.

**Suspected cause**: React Native의 `Image`가 URL을 키로 캐시한다. 표지의 공개
주소는 `story-covers/<slug>.png`로 고정이라 파일 내용만 바뀌면 앱이 받아 둔
것을 그대로 쓴다. 아바타는 이 문제를 파일 이름으로 푼다.
`apps/mobile/src/features/auth/api/avatar.ts`의 `createAvatarName`이 올릴 때마다
임의의 이름을 만들어, 새 사진이 곧 새 주소가 된다.

**What was tried**: 앱을 다시 띄워 넘어갔다. 표지를 바꾸는 일은 콘텐츠 제작
때만 생기고 이번 작업의 범위가 아니어서 구조는 손대지 않았다.

**Proposed next step**: 표지에도 내용이 바뀌면 이름이 바뀌는 규칙을 준다.
`cover_image_path`에 이름 뒤 해시나 판 번호를 넣고 시드와 함께 바꾸는 방법이
가장 가깝다. 배포한 앱을 쓰는 사람에게는 다시 띄우라고 할 수 없으므로, 표지를
실제로 교체할 일이 생기기 전에 정한다.
