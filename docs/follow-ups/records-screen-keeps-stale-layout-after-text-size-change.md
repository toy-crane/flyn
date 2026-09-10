# 글자 크기를 바꾸고 대화 기록을 열면 배치가 어긋난 채로 남는다

**Symptom**: 앱이 떠 있는 동안 iOS 글자 크기를 큰 접근성 크기에서 기본으로
되돌린 뒤 대화 기록을 열면, 스토리 표지가 제목과 떨어진 자리에 홀로 놓이고
소개 문단이 빈 공간 가운데에 뜬다. 회차 카드는 아예 보이지 않는다. 스크롤해도
바뀌지 않고, 앱을 껐다 켜면 정상으로 돌아온다.

**Observed evidence**: 2026-09-10에 iOS Simulator(`flyn-slot-3`)에서 봤다.
`xcrun simctl ui <udid> content_size accessibility-extra-extra-extra-large`로
키웠다가 `content_size large`로 되돌린 다음 스토리 탭에서 `우리 동네 카페`를
열었다. 접근성 트리에는 `뒤로 가기`와 `새 대화`만 남고 회차 카드 버튼이 없었다.
`xcrun simctl terminate` 뒤 다시 열자 같은 화면이 제대로 그려졌다.

**Suspected cause**: `apps/mobile/src/screens/stories/story-records-screen.tsx`가
쓰는 `useScreenContentHeight`는 `onLayout`으로 잰 높이를 상태에 담아 두고
`minHeight`로 되돌려준다. 글자 크기가 바뀌어도 새 `onLayout`이 오지 않으면 이전
높이가 그대로 남는다. 같은 훅을 쓰는 스토리 탭에서는 이 증상을 보지 못했다.

**What was tried**: 아무것도 바꾸지 않았다. 표현 노트 작업의 확인 도중에 본
것이고, 그 작업이 만진 화면이 아니다. 훅은 `features/story/ui/use-story-content-height.ts`에서
`shared/ui/use-screen-content-height.ts`로 자리만 옮겼고 내용은 그대로다.

**Proposed next step**: 글자 크기를 바꾼 뒤 이 화면과 스토리 탭, 스토리 상세를
차례로 열어 어느 화면에서 재현되는지 먼저 가른다. 재현되면 `fontScale`이 바뀔 때
잰 높이를 버리는지부터 본다.
