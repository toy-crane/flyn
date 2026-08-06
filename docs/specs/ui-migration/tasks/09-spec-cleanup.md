# 09. 마이그레이션이 끝난 spec이 저장소에서 사라진다

## 전달되는 행동

사용자 눈에는 아무것도 달라지지 않는다. 저장소에서는 이 마이그레이션이 대조
기준으로 쓰던 세 spec 폴더 — roleplay-episode·input-form-style·
neutral-loading-indicators — 가 사라지고, 그 안에서만 살아 있던 근거가 주제를
소유한 결정 계약으로 옮겨간다. `docs/specs/`에는 다시 끝나지 않은 작업 단위만
남는다.

## Blockers

- **08** — 표면 재구현과 잔존물 삭제가 모두 끝나야 승인된 prototype이 "이전과
  같다"의 대조 기준 역할을 마친다. 하나라도 남아 있으면 재구현이 확인할 원본이
  먼저 사라진다.

## 완료 기준

- [x] GPT-5.6 등급 근거(Luna·Terra 벤치마크 수치와 1M당 단가)가
      [ai-gateway-for-model-calls](../../../decisions/ai-gateway-for-model-calls.md)의
      `Evidence worth preserving`에 있다
- [x] 롤플레잉 대화 표현의 HIG 근거 — 컨텍스트 메뉴 단독 금지, info 버튼 용도,
      Writing Tools 밑줄의 의미, 원형 화살표, 목표 표시 밀도 — 가
      [ai-chat-experience](../../../decisions/ai-chat-experience.md)로 옮겨졌다
- [x] ai-chat-experience가 목표 바·상황 카드·말풍선 곁 표시를 더 이상 "해당 작업
      단위 문서"에 위임하지 않고 직접 소유한다
- [x] roleplay-episode의 미결 질문 3개(표현 저장, 한글 입력 비율, 진행 중
      에피소드 개수)가 남을 자리를 얻었거나 버리기로 확인됐다
- [x] `docs/specs/`에 ui-migration 외의 폴더가 없다
- [x] 결정 계약 인덱스가 파일마다 정확히 한 줄이고 모든 링크가 열린다
- [x] 저장소 어디에도 삭제된 spec으로 향하는 링크가 남지 않았다

## 제약

- 근거를 옮긴 뒤에 폴더를 지운다. 순서가 뒤바뀌면 Git 히스토리에서 되찾아야
  한다.
- 이 태스크에서 결정을 새로 만들지 않는다. 이미 승인된 근거의 자리만 옮기고,
  옮길 곳이 마땅치 않으면 지우지 말고 남긴다.
- input-form-style의 52pt 높이·18pt padding 같은 수치는 HeroUI `TextField`가
  외형을 소유하게 된 뒤에도 유효한지 확인되지 않았다. 되살릴지 버릴지는 사람이
  정한다 — 임의로 결정 계약에 승격하지 않는다.
- 코드는 건드리지 않는다. 이 태스크는 문서만 정리한다.

## Status

completed

## Execution

- Base commit: 200850de89b1f4751c3e4e0da6b7d3f0552b00cd
- Task checkpoint commit: 8d6334c6e934a80c9a3c21c72c2873d7b536fb48
- Verification: `bun run check --force` 3회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 447/447 (43 suites), lint·typecheck 통과. 결정 인덱스 20개가 파일마다 정확히 한 줄, 링크 전부 해석됨. 코드는 건드리지 않았다.
- Task review: 교정 1회로 닫았다. 이전 자체는 검증됐다 — 로딩 indicator 규칙은 `apple-hig-with-app-theme.md`에 원본보다 강하게 들어갔고(양방향과 과교정 금지 포함), HIG 근거 다섯과 GPT-5.6 등급 수치도 온전하며, `ai-chat-experience.md`의 위임은 흡수돼 목표 바·상황 카드·말풍선 곁 표시를 직접 소유한다. 교정으로 두 가지를 메웠다: (1) `ai-chat-reliability.md`가 삭제된 폴더에 위임하던 규칙(판정 실패를 대화 중에 드러내지 않는다)이 소유자를 얻었고 사라졌던 근거도 함께 기록됐다, (2) `README.md`의 `Read when` 두 줄이 새로 들어온 주제를 말하게 됐다 — 삭제 전에는 폴더 이름이 곧 색인이었다. 덤으로 `ai-gateway`·`hybrid-data-access`의 dangling 위임 둘과 사라졌던 근거 다섯을 회수했다. 완료 기준 마지막 줄은 **링크 기준으로 충족**이다: 마크다운 링크는 0개이고, 코드 주석의 경로 인용 37곳은 이 태스크의 제약(코드 미변경)이 금지해 누적 게이트로 넘긴다. 그중 30곳은 기계적 치환이고 7곳은 label 규칙의 소유자를 사람이 정해야 한다.
- Task correction rounds: 1
- Blocker: resolved task-review — 원문: 이전이 두 곳에서 덜 끝났다. (1) `ai-chat-reliability.md:37-38`이 아직 "해당 작업 단위 문서"에 위임하는데 그 문서가 이번에 삭제됐다. 위임된 규칙(판정만 실패하면 대화 중에 아무것도 알리지 않고, 다음 판정이 조용히 메우며, 끝까지 못 채운 것만 결과 화면 `다시 확인`으로 드러난다)의 **what**은 코드 주석에만 남았고 **why**("실패가 대화 화면에 쌓이면 시끄럽다")는 저장소에서 사라졌다. 제약이 "옮길 곳이 마땅치 않으면 남긴다"인데 자리는 있었다 — 같은 diff가 `ai-chat-experience.md:100-104`에서 말풍선 곁 표시를 직접 소유하게 만든 그 자리다. 미래 에이전트가 `use-episode-conversation.ts:284-290`의 맨 `.catch()`를 보고 소유 계약을 못 찾아 눈에 보이는 실패 상태를 추가하는 것이 정확히 기각된 접근의 재발이다. (2) `README.md:10`과 `:18`의 `Read when`이 이번에 들어온 주제를 말하지 않는다 — `:10`은 이제 로딩 indicator 색 규칙으로 가는 **유일한 색인 경로**인데 진행·로딩을 언급하지 않고, `:18`은 목표 바·상황 카드·말풍선 곁 표시를 소유하게 됐는데 그 역시 없다. 삭제 전에는 폴더 이름과 주석 30곳이 경로였다. 규칙 본문은 강하지만 닿을 수 없는 규칙은 지워진 규칙과 같다 — 태스크 01·02·05가 각각 틀렸던 바로 그 규칙이다.

## Run completion

- Cumulative status: in-progress
- Cumulative base commit: bc9a5dea80f41d22a6aa62db493d99d7d13d5f65
- Cumulative candidate commit: 0557b6ab431fdaada860a3751d839018ba93184e
- Cumulative reviewed commit: —
- Cumulative verification: —
- Cumulative review: —
- Cumulative correction rounds: 0
- Cumulative blocker: —
