# 05. 결과 화면과 첨삭 시트가 HeroUI로 그려진다

## 전달되는 행동

에피소드 결과 화면과 첨삭 시트가 HeroUI로 그려진다. 첨삭 시트는 지금처럼 medium
detent와 grabber가 있는 route `formSheet`로 열리고(셸 소유), 본문만 HeroUI다.
교정과 번역이 같은 시트에서 내용만 달라지는 구조, 개선 문장에만 그어지는 밑줄
diff, 결과 화면 헤더의 뒤로·`다시 하기`가 모두 이전과 같다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [x] 결과 화면이 HeroUI로 그려지고 헤더 액션이 유지된다
- [x] 첨삭 시트가 같은 detent·grabber로 열리고 교정/번역 내용 구분이 유지된다
- [x] 개선 문장 밑줄 diff가 동일하게 보인다
- [x] 목표 달성 표시와 결과 데이터 표시가 회귀 없다
- [x] quoted-sentence-card·feedback-sheet 등 기존 컴포넌트가 제거됐다

## 제약

- 시트의 `더 물어보기` 액션은 유지하되, 목적지인 문장 질문 화면의 이전은 06의
  몫이다 — 이 태스크에서 그 화면을 건드리지 않는다.
- 시트 background·material은 iOS에 맡긴다 — 앱 색으로 다시 칠하지 않는다.

## Status

completed

## Execution

- Base commit: f39e49b9c292f7c8cae77831191830e0793bb5fc
- Task checkpoint commit: 5a29701781195f5e1e7b2a4afb08486d9c61deb6
- Verification: `bun run check --force` 3회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 439/439 (49 suites), lint·typecheck 통과. 결과 화면과 첨삭 시트(교정·번역·밑줄)를 light·dark로 촬영했고, 접근성 트리는 수정 전후를 같은 세션에서 비교했다.
- Task review: 교정 1회로 닫았다. 완료 기준의 `quoted-sentence-card` 제거는 **하지 않았다** — 유일한 소비처가 태스크 06 소유의 문장 질문 화면이고 이 태스크의 제약이 그 화면을 금지한다. 제약이 이기며, 태스크 08이 소비자 부재를 검색으로 증명한 뒤 지운다. 제약 "시트 background는 iOS에 맡긴다"는 **의도적으로 이탈했다** — 문자 그대로 따르면 iOS 26 + react-native-screens에서 formSheet 본문이 완전히 투명해져 결과 화면의 accent CTA가 비쳐 올라온다. 승인된 프로토타입(`conversation.html:215`)과 삭제된 구현 모두 배경을 칠하고 있었다. 이전과 같은 중립 토큰만 쓰고 presentation·detent·grabber·모서리·딤은 전부 iOS에 남겼다. 밑줄 방향은 뒤집히지 않았음을 프로토타입과 `improvedSegments` 코드 경로로 확인했다.
- Task correction rounds: 1
- Blocker: resolved task-review — 체크에 `accessibilityElementsHidden`을 걸어 글리프 정지점을 0으로 만들었고(기기에서 수정 전후 트리 비교), 발화 행은 `PressableFeedback` + `disabled` `ListGroup.Item`으로 누름 피드백을 되돌리면서 `accessible={false}` 구조를 유지했다. 원문: (1) `result.tsx:84`의 목표 달성 체크가 접근성 트리에 노출된다. `RNSymbol`은 모든 인스턴스에 `accessibilityElementsHidden`을 걸었는데(`rn-symbol.tsx:15`) Ionicons 교체본에는 없고, 감싼 `View`도 `accessible`을 주지 않아 그룹으로 묶이지 않는다. 달성한 목표 하나당 VoiceOver 정지점이 하나씩 늘고 매핑되지 않은 글리프 문자가 읽힌다. 앱 전체에서 레이블도 없고 숨기지도 않고 `accessible` Pressable 안에도 없는 유일한 Ionicons다 — 같은 diff의 세 JSX 노드 옆 셰브론(`:141-149`)은 제대로 숨겼으므로 실수다. 완료 기준 "목표 달성 표시와 결과 데이터 표시가 회귀 없다"에 걸린다. (2) 발화 행의 누름 피드백이 사라졌다. base는 `opacity: pressed ? 0.5 : 1`이었고 한 태스크 전에 이전한 홈 목록은 `PressableFeedback`을 쓰는데(`index.tsx:147`), `ListGroup.Item`은 피드백 없는 맨 `Pressable`이라 열리는 행을 눌러도 시각적으로 무반응이다.
