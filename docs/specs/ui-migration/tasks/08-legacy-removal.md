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

in-progress

## Execution

- Base commit: 99c438754d64b100a17c23cfe31c6d396301fcee
- Task checkpoint commit: 8c6878142949cac1679f515dfa51c7f7af495be7
- Verification: `bun run check --force` 3회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 447/447 (43 suites), lint·typecheck 통과. `expo-symbols` 직접 선언을 뗀 뒤 dev build를 재생성해 Build Succeeded·부팅 확인했다.
- Task review: —
- Task correction rounds: 1
- Blocker: task-review — `scripts/theme-contrast.test.ts`가 삭제됐는데 그 **대상은 살아 있다**. 대비 검증은 `uniwind-css-theme.md:23`과 `apple-hig-with-app-theme.md:35` 두 계약이 명시하는 요구이고, 이 테스트가 `bun run check`에서 실제로 돌던 유일한 강제 수단이었다. 죽은 것은 모듈(`PRODUCT_STATE_COLORS`)이지 주제가 아니다 — 앱이 소유하는 색/배경 쌍은 `global.css`로 옮겨 갔고, 지금 위반 상태이며, 알아챌 것이 아무것도 남지 않았다. 사람이 HeroUI 기본값 유지를 결정했으므로 **값은 바꾸지 않는다**. 필요한 것은 현재 비율을 고정하는 가드다 — 그래야 이연된 브랜드 팔레트 작업이 문단이 아니라 실패하는 테스트를 물려받는다. 지금 상태로는 팔레트 작업이 `--muted`만 올리고 `--success`를 2.01:1에 남겨도 아무것도 실패하지 않는다. 더해서 스펙 리스크 항목이 사이트를 2곳으로 과소 집계했다 — 실제 6곳이고, 그중 최악(`chat-conversation.tsx:218`, 본문 텍스트 2.01:1)이 빠져 있다.
