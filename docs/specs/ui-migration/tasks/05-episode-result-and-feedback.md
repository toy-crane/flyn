# 05. 결과 화면과 첨삭 시트가 HeroUI로 그려진다

## 전달되는 행동

에피소드 결과 화면과 첨삭 시트가 HeroUI로 그려진다. 첨삭 시트는 지금처럼 medium
detent와 grabber가 있는 route `formSheet`로 열리고(셸 소유), 본문만 HeroUI다.
교정과 번역이 같은 시트에서 내용만 달라지는 구조, 개선 문장에만 그어지는 밑줄
diff, 결과 화면 헤더의 뒤로·`다시 하기`가 모두 이전과 같다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [ ] 결과 화면이 HeroUI로 그려지고 헤더 액션이 유지된다
- [ ] 첨삭 시트가 같은 detent·grabber로 열리고 교정/번역 내용 구분이 유지된다
- [ ] 개선 문장 밑줄 diff가 동일하게 보인다
- [ ] 목표 달성 표시와 결과 데이터 표시가 회귀 없다
- [ ] quoted-sentence-card·feedback-sheet 등 기존 컴포넌트가 제거됐다

## 제약

- 시트의 `더 물어보기` 액션은 유지하되, 목적지인 문장 질문 화면의 이전은 06의
  몫이다 — 이 태스크에서 그 화면을 건드리지 않는다.
- 시트 background·material은 iOS에 맡긴다 — 앱 색으로 다시 칠하지 않는다.

## Status

in-progress

## Execution

- Base commit: f39e49b9c292f7c8cae77831191830e0793bb5fc
- Task checkpoint commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Blocker: —
