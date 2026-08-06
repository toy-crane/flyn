# 08. 이전 스타일 시스템이 저장소에서 사라진다

## 전달되는 행동

사용자 눈에는 아무것도 달라지지 않는다. 저장소에서는 두 시스템의 공존이 끝난다
— `theme/` TS 토큰 모듈과 `forms/` 입력 세트, 표면 태스크들이 남긴 잔존물이
삭제되고, 토큰 원본이 CSS `@theme` 하나임이 최종 확인된다.

## Blockers

- **02·03·04·05·06·07** — 각 표면의 마지막 소비자가 사라져야 공유 모듈을 지울
  수 있다. 하나라도 남아 있으면 `theme/`·`forms/` 삭제가 그 화면을 깨뜨린다.

## 완료 기준

- [ ] `theme/` 디렉토리가 삭제되고, navigation bridge만 CSS 토큰을 원본으로
      하는 새 형태로 남는다
- [ ] `forms/` 입력 세트와 잔존 대체 컴포넌트가 삭제됐다
- [ ] `@expo/ui` import가 Settings 화면(과 그 전용 컴포넌트)에만 남는다
- [ ] `StyleSheet`·inline style 사용이 계약이 허용한 지점(Reanimated animated
      style 등)뿐이다
- [ ] jest 전체·typecheck가 통과하고, 대표 화면 agent-device 스모크가 회귀
      없다
- [ ] CLAUDE.md·GLOSSARY·결정 문서에 낡은 참조가 남지 않았다

## 제약

- 각 모듈 삭제 전에 소비자 부재를 검색으로 증명한다 — 컴파일 성공만으로
  대신하지 않는다.
- 이 태스크에서 새 표현 변경을 시작하지 않는다 — 발견한 개선거리는 스펙 밖
  후속으로 남긴다.

## Status

pending

## Execution

- Base commit: —
- Task checkpoint commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Blocker: —

## Run completion

- Cumulative status: pending
- Cumulative base commit: —
- Cumulative candidate commit: —
- Cumulative reviewed commit: —
- Cumulative verification: —
- Cumulative review: —
- Cumulative correction rounds: 0
- Cumulative blocker: —
