# 04. 첨삭과 번역을 시트로 본다

상태: 완료

## 전달되는 행동

말풍선 옆에 표시가 나타난다. 한글로 썼으면 번역 아이콘, 더 자연스럽게 쓸 여지가
있으면 `info.circle`, 그대로 잘 통했으면 초록 체크다. 앞의 두 표시를 누르면 하단
시트 하나가 열린다.

교정이면 `이렇게 쓰면 더 자연스러워요` → 바뀐 자리에 밑줄이 그어진 개선 문장 →
항목별 이유가 나온다. 번역이면 내가 쓴 한글 → 실제로 전달된 문장 → 표현 노트와
대체 표현이 나온다. 둘은 같은 시트이고 내용만 다르다.

판정이 늦게 도착해 표시가 나중에 채워져도 말풍선은 제자리에 있다.

## 블로커

- **03** — 표시와 시트가 읽는 판정·개선문·이유를 03의 판정 호출이 만들어 남긴다.

## 완료 기준

- [x] 세 표시가 판정 결과대로 갈린다
- [x] 누를 수 있는 두 표시는 원형 버튼, 상태인 체크는 배경 없는 플랫 아이콘이다
- [x] 표시의 터치 영역이 44×44pt다
- [x] 판정이 나중에 채워져도 말풍선 위치가 밀리지 않는다
- [x] 번역과 교정이 같은 시트로 열리고 내용만 다르다
- [x] 밑줄이 시트의 개선 문장에만 있고 말풍선 본문에는 없다
- [x] 시트가 medium detent와 grabber를 쓴다
- [x] 판정이 아직 없는 발화에는 표시가 없다
- [x] 말풍선 본문을 눌러서는 아무 일도 일어나지 않는다

## 제약

- 표시 자리는 44pt 고정 열이다. 비었다가 채워지는 것이 기본 동작이다.
- 커스텀 글리프와 `ellipsis`는 쓰지 않는다. `ellipsis`는 명령 메뉴를 뜻한다.
- 시트는 이미 저장된 판정만 읽는다. 열 때 새로 부르지 않는다.
- 시트에 `더 물어보기`를 아직 두지 않는다. 액션과 목적지는 05가 함께 붙인다.

## 리뷰에서 남은 메모

막은 것은 없다.

- ~~`apps/mobile/src/lib/message-feedback.ts:29` — 번역 표시를 `sourceText !== delivered`로 미루어
  짐작하는데, `apps/api/src/judgment.ts:143`이 다음 턴에 채우는 판정에서는 `sourceText`를
  `message.content`로 되돌린다. 그래서 첫 판정이 실패한 한글 발화는 영영 교정·통과 표시로 남고
  시트에서 `내가 쓴 한글` 블록을 잃는다.~~ **고쳤다** — `de45691`이 원문을
  `episode_messages.source_text`로 옮겨, 판정이 언제 도는지와 무관하게 남게 했다. 표시는 두
  문장을 견주지 않고 원문의 유무로 가른다.
- `apps/mobile/src/components/episode/feedback-sheet.tsx:156` — 번역 시트의 `표현 노트와 대체 표현`은
  `feedback.reasons`만 먹는데 `apps/api/src/judgment.ts:500`이 `clear`면 `reasons: []`로 못박는다.
  기계 번역은 거의 언제나 `clear`라, 흔한 번역 시트는 `내가 쓴 한글` → `이렇게 전달됐어요`만
  보여 준다. 태스크 산문과 승인된 `conversation.html`의 TranslationSheet보다 얇다.
  → **고쳤다** — ee83f98이 번역된 문장에 표현 노트를 내게 했다. `clear` + `reasons`가 이제 정상 출력이다.
- `apps/mobile/src/components/episode/feedback-sheet.test.tsx:17` — `TRANSLATED` 픽스처가
  `verdict: "clear"`에 `reasons`가 찬 행이다. 판정 파이프라인이 만들지 않는 모양이라, 번역 시트가
  노트를 그린다는 그 테스트는 닿을 수 없는 입력 위에서 통과한다.
  → **고쳤다** — 같은 커밋으로 그 픽스처가 실제로 도달 가능한 모양이 됐다.
- `apps/mobile/src/lib/use-episode-conversation.ts:265` — `sentences` 없이 `data-judgment`가 오면
  `withArrivedFeedback`이 던진다(이 변경 전에 배포된 API). `sentences = []` 기본값이면 새 클라이언트가
  옛 서버를 견딘다. 반대 방향은 안전하다.
- `apps/mobile/src/lib/sentence-diff.ts:28` — `lcsLengths`가 시트를 열 때 `(토큰+1)²` 행렬을 동기로
  잡는다. 서버 상한(메시지 4000자, 개선문 20000자)에서 최악이 JS 스레드 위 2천만 칸이다. 실제
  문장에는 사소하지만 원리상 상한이 없다.
- `apps/mobile/src/lib/use-episodes.ts:103`, `apps/mobile/src/app/episodes/[id].tsx:191` —
  `message_feedback` 읽기 실패를 `feedback.data ?? []`가 삼켜, 가져오기 오류와 "아직 판정이 없다"가
  구분되지 않는다. 표시가 통째로 조용히 사라지고 다시 시도할 길이 없다.
- `apps/mobile/src/components/symbols/app-symbols.ts:47` — `translate`는 SF Symbols 6(iOS 18) 이름인데
  `RNSymbol`에 폴백을 주지 않는다. 배포 타깃이 낮으면 번역 표시가 빈 44pt 버튼이 된다. 프로젝트
  최소 iOS와 맞춰 볼 값어치가 있다.

리뷰는 시뮬레이터를 돌리지 못했다(핀으로 박은 모델이 이 기기에서 403). 눈에 보이는 기준은
44×44 스타일 단언, 원형 대 플랫 렌더링, detent 상수로 구조에서 확인했다.
