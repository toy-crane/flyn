# 새 회차 id가 일시 part로만 오면 잃을 수 있다

## 증상

새 대화의 회차 id를 앱이 받는 길이 하나뿐이다. 첫 사용자 메시지에 대한 응답
스트림의 `data-story-play-started` 일시 part다. 그 part를 놓치면 두 가지가 일어난다.

- 다음 턴이 회차 없이 나가서 서버가 회차를 하나 더 만든다. 메시지 한 건짜리
  회차가 대화 기록에 낱장으로 쌓인다.
- 그 화를 끝내고 다음 화로 넘어가면 회차가 빈 문자열로 실려, 다음 화면이
  불러오기 실패로 열린다. 다시 시도해도 같은 값으로 물으므로 빠져나오지 못한다.

## 관찰한 근거

직접 재현하지는 못했다. 코드를 읽어 확인한 경로다.

- `apps/api/src/features/episode/route.ts`의 `POST /`가 회차를 만든 뒤
  `data-story-play-started`를 `transient: true`로 쓴다. 일시 part는 메시지에 남지 않아
  스트림을 다시 이어도 replay되지 않는다.
- `apps/mobile/src/features/episode/state/use-episode-run.ts`의 `onData`가 그
  part를 받아 ref에 담는다. 받지 못하면 ref는 계속 비어 있다.
- `apps/mobile/app/episode/index.tsx`의 `startNextEpisode`가
  `storyPlayId ?? ""`로 넘긴다.

창은 좁다. `data-story-play-started`는 모델 글자보다 먼저 나가므로, 응답이 시작한 지
몇 밀리초 안에 연결이 끊겨야 놓친다. 앱을 그 순간에 배경으로 보내는 경우가
해당한다.

## 해 본 것

없다. 발견한 자리에 남긴다.

## 다음으로 제안하는 것

회차 id를 앱이 만들어 요청에 실어 보내는 쪽이 이 부류를 통째로 없앤다.
`episode_messages.id`가 이미 앱이 만든 값이므로 같은 결의 선택이다.
`story_plays`의 insert grant에 `id`를 더하고, 서버는 앱이 준 id로 회차를 만든다.
다시 보낸 요청이 같은 id를 들고 오면 이미 있는 회차를 그대로 쓴다.

그전까지 값싼 보완은 `storyPlayId`가 비었을 때 다음 화로 넘어가지 않고 시작 실패
알림창을 띄우는 것이다. 막다른 화면 대신 되돌아갈 자리를 준다.

## 관련

- [스토리 재플레이 명세](../specs/story-replay/spec.md)의 "동시 시작" 항목이
  회차를 첫 메시지에 만드는 이유를 적어 두었다.
