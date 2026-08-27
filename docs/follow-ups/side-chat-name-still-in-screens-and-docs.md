# 화면과 문서가 확정된 용어 대신 Side chat 이름을 쓴다

**Symptom**: 용어를 잠깐 물어보기로 확정했는데, 앱 화면 문구와 접근성 이름, README의 이름 표, 결정 계약은 여전히 Side chat이라는 이름을 쓴다.

**Observed evidence**: `GLOSSARY.md`가 잠깐 물어보기를 확정하고 Side chat을 피할 표현으로 둔다. 그런데 `apps/mobile/src/features/chat/ui/chat-labels.ts` 등 chat 기능 코드가 `Ask in side chat`, `Side chat 닫기` 같은 화면 문구를 만들고, `README.md`의 접근성 이름 표(400행 부근)와 `docs/decisions/mobile-side-chat.md` 제목과 본문이 같은 이름을 쓴다.

**Suspected cause**: 템플릿의 Side chat 기능이 아직 플린의 잠깐 물어보기로 개편되지 않았다. 두 기능은 이름만 다른 것이 아니라 시작점도 다르다. 템플릿은 AI 답변에서 구절을 선택해 열고, 플린은 교정이나 입력창에서 연다.

**What was tried**: 이번 세션은 `GLOSSARY.md`와 `PRODUCT.md`의 용어만 확정했다. 이름의 기준은 잡혔지만, 이름만 먼저 바꾸면 옛 동작에 새 이름이 붙으므로 화면 문구, 코드 식별자, 결정 계약은 바꾸지 않았다.

**Proposed next step**: 잠깐 물어보기 기능을 구체화할 때 이 개편에 화면 문구와 접근성 이름 교체를 포함하고, `docs/decisions/mobile-side-chat.md`와 `README.md`의 이름 표를 새 용어와 새 동작 기준으로 함께 갱신한다.
