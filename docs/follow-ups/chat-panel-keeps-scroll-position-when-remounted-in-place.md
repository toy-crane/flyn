# 채팅 패널을 자리에서 다시 그리면 목록이 지난 스크롤 위치에 남는다

**Symptom**: 에피소드 화면을 같은 자리에서 새 `key`로 다시 그리면 첫 장면이
화면에 보이지 않는다. 목록에는 장면이 제대로 들어와 있고, 손으로 아래로
스크롤하면 그제야 나타난다.

**Observed evidence**: 2026-08-27 iOS 시뮬레이터(flyn-slot-0)에서 확인했다.
`EpisodeScreen`이 `<CurrentEpisode key={attempt}>`로 다시 그리는 구조일 때,
마무리에서 다시 시작하기를 누르면 빈 화면이 나왔다. 앱 로그의 탐침으로 서버
요청(`messages= 0`)과 응답이 정상이고 `chat.messages`에 화자 part 여섯 개가 다
들어와 있음을 확인했다. `ChatPanel`의 렌더 탐침도 새 마운트에서
`anchorIndex=undefined`, `following=true`, `composerHeight=102`로 홈에서 처음
열 때와 값이 같았다. 같은 상태인데 홈에서 열면 보이고 자리에서 다시 그리면
보이지 않았다.

**Suspected cause**: `KeyboardAwareLegendList`나 `@legendapp/list/keyboard`의
훅이 이전 목록의 위치나 inset을 물려받는 것으로 보인다. React 상태는 같으므로
앱 코드 밖의 동작으로 의심한다. 아직 원인을 확정하지 않았다.

**What was tried**: 한 프레임을 비우고 새로 그려 네이티브 뷰를 먼저 없애 보았고
증상은 그대로였다. 다시 시작을 경로가 소유해 `router.replace("/episode")`로
같은 경로를 새로 여는 방식으로 바꿔서 막았다. 홈에서 처음 열 때와 같은 길을
지나므로 목록도 처음 상태로 시작한다. 자리에서 다시 그리는 경로 자체는 그대로
남아 있다.

**Proposed next step**: `ChatPanel` 하나만 담은 최소 화면에서 `key`를 바꿔
다시 그리며 목록의 `contentOffset`과 `contentInset`을 재고, 이전 인스턴스의
값이 남는지 확인한다. 남는다면 `@legendapp/list`에 재현 사례로 올린다.
