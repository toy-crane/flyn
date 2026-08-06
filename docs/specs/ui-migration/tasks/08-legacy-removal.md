# 08. 이전 스타일 시스템이 저장소에서 사라진다

## 전달되는 행동

사용자 눈에는 아무것도 달라지지 않는다. 저장소에서는 두 시스템의 공존이 끝난다
— `theme/` TS 토큰 모듈과 `forms/` 입력 세트, 표면 태스크들이 남긴 잔존물이
삭제되고, 토큰 원본이 CSS `@theme` 하나임이 최종 확인된다.

## Blockers

- **02·03·04·05·06·07** — 각 표면의 마지막 소비자가 사라져야 공유 모듈을 지울
  수 있다. 하나라도 남아 있으면 `theme/`·`forms/` 삭제가 그 화면을 깨뜨린다.

## 완료 기준

- [x] `theme/` 디렉토리가 삭제되고, navigation bridge만 CSS 토큰을 원본으로
      하는 새 형태로 남는다
- [x] `forms/` 입력 세트와 잔존 대체 컴포넌트가 삭제됐다
- [x] `@expo/ui` import가 Settings 화면(과 그 전용 컴포넌트)에만 남는다
- [x] `StyleSheet`·inline style 사용이 계약이 허용한 지점(Reanimated animated
      style 등)뿐이다
- [x] jest 전체·typecheck가 통과하고, 대표 화면 agent-device 스모크가 회귀
      없다
- [x] CLAUDE.md·GLOSSARY·결정 문서에 낡은 참조가 남지 않았다

## 제약

- 각 모듈 삭제 전에 소비자 부재를 검색으로 증명한다 — 컴파일 성공만으로
  대신하지 않는다.
- 이 태스크에서 새 표현 변경을 시작하지 않는다 — 발견한 개선거리는 스펙 밖
  후속으로 남긴다.

## Status

completed

## Execution

- Base commit: 99c438754d64b100a17c23cfe31c6d396301fcee
- Task checkpoint commit: 17cef740df94bdf6c7da771c08d7e2149b0558a2
- Verification: `bun run check --force` 3회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 447/447 (43 suites), lint·typecheck 통과. `expo-symbols` 직접 선언을 뗀 뒤 dev build를 재생성해 Build Succeeded·부팅 확인했다.
- Task review: 교정 1회로 닫았다. 리뷰가 시각 변경 3건을 모두 승인했다 — (a) 프로필 게이트를 `@expo/ui`에서 HeroUI로 이전한 것은 기준 3을 만족시킬 다른 길이 없음이 확인됐다(base에서 Settings 외 소비처는 죽은 `forms/`와 이 화면뿐이고 어떤 표면 태스크도 이 화면을 소유하지 않았다). **선언되지 않은 delta 하나**: 안쪽 `padding: 8`이 빠져 가로 텍스트 inset이 40 → 32가 됐다. (b) 삭제 오버레이의 `Spinner`는 spec이 `loading-indicator` 제거를 지시했으므로 강제됐고 muted는 계약이 이 오버레이를 명시적으로 중립 역할에 넣는다. (c) 헤더 **타이틀** 색은 교정이었다 — 태스크 01의 bridge가 이미 형제 한 줄 타이틀을 `foreground`로 만들어 두 줄 타이틀만 어긋나 있었다. 다만 헤더 **부제**(`secondaryLabel` → `muted`)는 대응 bridge가 없어 순수 표현 교체이고 제약 2가 시작하지 말라고 한 부류다 — 승인하되 사람에게 남긴다. 블로커였던 대비 가드는 `scripts/style-foundation.test.ts`에 복원했다: 앱 소유 쌍 10개 × 2모드, 기준 미달 6개는 현재 값으로 고정하고 나머지는 바닥을 건다. 내가 직접 `--success`를 올려 변이를 넣어 확인했고, 고정값 2개가 깨질 뿐 아니라 파생 효과(`success-foreground` on `success`가 2.62:1로 하락)까지 잡혔다. 값은 바꾸지 않았다 — 사람이 HeroUI 기본값 유지를 결정했다. 작업자가 브리프 밖에서 하나 더 찾아 남겼다: 라이트 `accent` on `background`가 3.38:1인데 `profile-unavailable.tsx:60`이 이를 본문 텍스트로 쓴다 — 가드에는 넣지 않았으니 브랜드 팔레트 작업이 받는다.
- Task correction rounds: 1
- Blocker: resolved task-review — 원문: `scripts/theme-contrast.test.ts`가 삭제됐는데 그 **대상은 살아 있다**. 대비 검증은 `uniwind-css-theme.md:23`과 `apple-hig-with-app-theme.md:35` 두 계약이 명시하는 요구이고, 이 테스트가 `bun run check`에서 실제로 돌던 유일한 강제 수단이었다. 죽은 것은 모듈(`PRODUCT_STATE_COLORS`)이지 주제가 아니다 — 앱이 소유하는 색/배경 쌍은 `global.css`로 옮겨 갔고, 지금 위반 상태이며, 알아챌 것이 아무것도 남지 않았다. 사람이 HeroUI 기본값 유지를 결정했으므로 **값은 바꾸지 않는다**. 필요한 것은 현재 비율을 고정하는 가드다 — 그래야 이연된 브랜드 팔레트 작업이 문단이 아니라 실패하는 테스트를 물려받는다. 지금 상태로는 팔레트 작업이 `--muted`만 올리고 `--success`를 2.01:1에 남겨도 아무것도 실패하지 않는다. 더해서 스펙 리스크 항목이 사이트를 2곳으로 과소 집계했다 — 실제 6곳이고, 그중 최악(`chat-conversation.tsx:218`, 본문 텍스트 2.01:1)이 빠져 있다.
