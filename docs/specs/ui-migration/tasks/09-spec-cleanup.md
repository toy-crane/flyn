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

- [ ] GPT-5.6 등급 근거(Luna·Terra 벤치마크 수치와 1M당 단가)가
      [ai-gateway-for-model-calls](../../../decisions/ai-gateway-for-model-calls.md)의
      `Evidence worth preserving`에 있다
- [ ] 롤플레잉 대화 표현의 HIG 근거 — 컨텍스트 메뉴 단독 금지, info 버튼 용도,
      Writing Tools 밑줄의 의미, 원형 화살표, 목표 표시 밀도 — 가
      [ai-chat-experience](../../../decisions/ai-chat-experience.md)로 옮겨졌다
- [ ] ai-chat-experience가 목표 바·상황 카드·말풍선 곁 표시를 더 이상 "해당 작업
      단위 문서"에 위임하지 않고 직접 소유한다
- [ ] roleplay-episode의 미결 질문 3개(표현 저장, 한글 입력 비율, 진행 중
      에피소드 개수)가 남을 자리를 얻었거나 버리기로 확인됐다
- [ ] `docs/specs/`에 ui-migration 외의 폴더가 없다
- [ ] 결정 계약 인덱스가 파일마다 정확히 한 줄이고 모든 링크가 열린다
- [ ] 저장소 어디에도 삭제된 spec으로 향하는 링크가 남지 않았다

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
