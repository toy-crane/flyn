# 스토리 만들기 검증 실패 수정

기준은 `27ad93f` 이후 수정분이다. 사용자가 검증 중 발견한 문제의 수정도 승인했다.
인터뷰는 문장 수나 서식을 지정하지 않고 판단 목적을 설명하는 원칙을 유지한다.

## 인터뷰

- 수정 전 `story-creation-candidate-1789232195624.md`는 60개 중 2개 실패다.
- 중간 후보 `story-creation-candidate-1789233139530.md`는 60개 중 3개 실패다.
  이전 결말을 가정하는 제안, 상한 안내 누락, 요청한 두 화 중 첫 화만 카드로 내는
  답을 확인하고 수정했다.
- 최종 `story-creation-candidate-1789233235086.md`는 3회 60개 모두 기계 검사 통과,
  호출 실패 0개다. 사고는 상대 운전자 한 명으로 바로 카드가 나왔다. 두 상황은
  아직 덜 정한 화부터 확인하고, 첫 화를 정한 뒤 둘째 화를 묻는다.
- 장면을 정하는 정보와 플레이에서 나올 반응을 구분했다. 충분한 상황에 성격이나
  결말을 더 물어 카드를 미루지 않는다. 추가 제안도 같은 장소나 재회의 계기를
  사용하며 교환 성공, 아기의 울음이 멎는 일 등을 먼저 사실로 정하지 않는다.
- 의미 검토는 완전 통과가 아니다. 최종 3회 육아 답 끝에 `ેણ`이 섞였고,
  3회 짧은 비행기 입력의 카드 역할 설명이 `들어요`로 끝났다. 2회 추가 제안의
  `교환이나 환불 절차를 확인한 뒤`도 요청하지 않은 절차 확인을 전제할 여지가 있다.
  기계 검사는 이런 말투와 의미를 모두 잡지 못한다. 길이·문단 수로 대신 판정하지 않는다.

## 대본과 기억

- `story-play-candidate-1789233432315.md`와 목표 안내 분리 후의
  `story-play-candidate-1789233780531.md`는 각각 대본 3회 기계 검사 통과다.
- 마지막 기록은 영수증·영상·두 화를 유지하고 2화 도입에서 교환 성공을 전제하지 않는다.
  성공 기억을 넣으면 3회 모두 기종을 다시 설명할 필요가 없다고 답했다. 실패 기억을
  넣으면 3회 모두 기종이나 사진을 요청했다. 교환을 수리로 바꿔 기억하지 않았다.
- 이는 고정 기억 비교다. 서로 다른 결말로 실제 두 회차를 플레이한 증거는 아니다.
  첫 답의 차이만으로 재미를 통과시키지 않는다. 소개·완주 문구의 말투도 일부 흔들린다.
- iOS 실제 생성 중 situation에 내부 stage 목록이 붙은 사례를 발견했다.
  [실패 화면](../../../../docs/specs/story-creation-refinement/evidence/flyn-ios-visible-goal-invalid.png).
  situation은 화면 목표, stage는 모델의 진행 지침이라는 역할을 설명하고, 기존 한 줄
  목표 계약에 어긋나는 출력은 저장 전에 거절한다. 출력이 잘못되면 기존 생성 실패
  경로로 간다. 이미 저장한 테스트 스토리는 자동 수정하거나 삭제하지 않았다.

## 교정 재판정

모델은 API와 같은 `openai/gpt-5.6-luna`다. 원문은 다음과 같다.

```text
Yes, it is between the minimum and maximum lines. I see that the rubber seal is loose. I have unplugged the machine. Can I put the seal back and test the tank?
```

재구성한 문맥은 `Daniel: Is the water between the minimum and maximum lines? Please check the tank seal.`이다.
수정 전 세 번 중 한 번은 원문과 fixed가 같지만 교정 항목을 붙여 실패했다.
수정 뒤 일반 호출 세 번은 모두 첫 호출에서 natural이었다. 최초 화면의 전체 문맥은 아니다.

복구 경로는 별도로 오류를 주입했다. `wrapLanguageModel`의 첫 응답만 아래 객체로
바꿨고, 두 번째 호출은 실제 모델이 판단했다. 문맥은 빈 배열, 요청 제한은 30초다.
이는 모델의 자연 발생 오류율 측정이 아니라 재판정 동작 시험이다.

```json
{
  "status": "corrected",
  "fixed": "Yes, it is between the minimum and maximum lines. I see that the rubber seal is loose. I have unplugged the machine. Can I put the seal back and test the tank?",
  "entries": [{"original":"between minimum","fixed":"between the minimum","pattern":"article-the","why":"범위를 가리켜요."}],
  "review": {"situation":"기기 상태를 설명할 때","meaning":"물 높이와 고무 패킹 상태를 설명해요.","example":"The seal is loose.","exampleMeaning":"패킹이 헐거워요."}
}
```

중간 구현은 재판정 안내를 마지막 user에 넣어 세 번 모두 안내를 번역했다.
최종 구현은 안내를 system에 넣고 원문을 마지막 user로 다시 보낸다.
세 번 모두 총 두 호출 뒤 아래 같은 응답을 반환했다. 각 회의 응답 전문은 동일했다.

```json
{"entries":[],"fixed":"Yes, it is between the minimum and maximum lines. I see that the rubber seal is loose. I have unplugged the machine. Can I put the seal back and test the tank?","review":null,"status":"natural"}
```

검사 실패만 한 번 재판정하며 같은 취소 신호를 쓴다. 두 번째 실패나 네트워크 오류를
natural로 바꾸지 않는다. 저장 범위는 원래 메시지의 표현 결과뿐이다.

## 화면과 자동 검사

- 자체 slot 5의 API 3951, Metro 8132, iOS `flyn-slot-5`, Android `flyn_dev_2`를 사용했다.
  이메일 코드로 로그인했고 기기 초기화나 기존 데이터 삭제는 하지 않았다.
- iOS에서 사고 카드가 나온 뒤 글자 크기를 large에서 최대 접근성 크기로 변경했다.
  카드의 두 버튼과 아래 안내가 잘리지 않았다. 카드 내부만 다시 만들어 인터뷰를 유지한다.
  [수정 화면](../../../../docs/specs/story-creation-refinement/evidence/flyn-ios-font-change-fixed.png).
- Android font_scale=2.0에서 카드의 `1화`가 한 줄이고 더하기 아이콘·버튼·본문을 읽을 수
  있었다. 다크 모드로 전환해 입력 안내도 회색으로 보였다.
  [카드](../../../../docs/specs/story-creation-refinement/evidence/flyn-android-font-dark-fixed.png),
  [진행 문구](../../../../docs/specs/story-creation-refinement/evidence/flyn-android-progress-fixed.png).
- 두 기기에서 한 화 생성, 상세, 대화, 표현 판정, 종료와 `마지막 이야기까지 함께했어요`를
  확인했다. iOS의 최초 테스트 스토리에는 발견 당시 잘못된 목표가 남아 있다.
- 목표 검사와 교정 재판정의 최종 수정 뒤 iOS에서 `카페 와이파이`를 새로 생성했다.
  [새 목표 안내](../../../../docs/specs/story-creation-refinement/evidence/flyn-ios-visible-goal-fixed.png)는
  내부 무대 없이 표시됐다. 비밀번호를 묻자 Mia가 네트워크 이름과 비밀번호로 답했고
  원문은 natural로 표시됐다. Android의 생성은 목표 검사 추가 전이며, 새 검사가 있는
  최종 생성 경로를 Android에서 다시 실행한 것으로 보지 않는다.
  이어서 연결 완료를 말한 뒤 성공과 한 화 완주도 확인했다.
- 교정 재판정의 복구와 교정 필요성의 판단 품질은 별개다. 실제 플레이에서
  `I am connected now. Thank you for your help!`를
  `I’m connected to the Wi-Fi now. Thank you for your help!`로 바꾼 응답을 관찰했다.
  필요한 오류 수정인지와 취향 차이인지의 판정은 이번 복구 시험으로 통과시키지 않는다.
- API 241개, 모바일 88개 묶음 625개 테스트 통과. 두 패키지 타입 검사와 check 통과.
  모바일 테스트에는 기존 act 경고가 있지만 실패한 테스트는 없었다.
- Codex OpenAI 읽기 전용 리뷰가 `27ad93f` 대비 전체 코드 변경과 마지막 교정 수정까지
  확인했다. 추가로 수정할 코드 결함은 없었다. 기기 재실행은 리뷰가 아니라 본 실행이 했다.

## 남은 기준

인터뷰 의미 검토, 실제 서로 다른 결말에서 2화 비교, 사용자 재미 확인, 같은 카드의
재시도 성공과 표지만 실패하는 실제 화면은 아직 완료로 판정하지 않는다.
승인된 prototype.html은 내용을 읽었지만 로컬 파일의 브라우저 열기가 보안 정책으로
차단됐다. 우회하지 않았으며 시안의 실제 렌더링 비교는 완료하지 못했다.
이 기록은 수정된 경로의 증거이며 스펙 전체 완료 선언이 아니다.

## PR #96 리뷰 반영

리뷰는 기준 커밋 `98e248d`가 rebase와 squash 뒤 새 체크아웃에서 사라지는 문제와,
이전 버전의 기억 규칙에 현재 규칙 일부가 섞이는 문제를 지적했다.
기준을 main 이력의 `2bbac0382e27205092b05240b2f7dddb87a14e49`로 고정하고
기억 프롬프트는 그 커밋의 함수를 읽도록 바꿨다. 앱의 프롬프트와 동작은 바꾸지 않았다.

`story-creation-baseline-1789252449461.md`는 실제 호출 실패 없이 검사 8개가 실패했고,
`story-play-baseline-1789252446345.md`는 누수 영상 누락을 잡았다. 이는 이전 프롬프트의
예상된 미통과이며 기준 커밋 조회 실패가 아니다. 기준이 HEAD의 조상인지와 기억 규칙의
분리를 검사하는 테스트를 추가했다. 최신 main 동기화 후 API 299개, 모바일 657개 테스트와
타입·코드 검사가 통과했다.
