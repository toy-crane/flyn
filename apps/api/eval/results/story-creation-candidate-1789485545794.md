# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:19:05.794Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 815fcd75b98f44a0a0f229204af7f326116303a22b73f6612820a4f5e4f0e05a
답 87개, 실패 0개, 호출 실패 0개

기계 검사는 카드 계약을 확인한다. 대화의 이해도, 답할 지점, 말투와 가독성은 아래 전문으로 따로 검토한다. 문장 수와 서식 유무는 합격 기준이 아니다. 사용자 재미 확인도 별도다.

## 고정 앞 대화: 충분한 제안에 짧게 동의하면 바로 카드
user: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.
assistant: 이어서 회사 식당에서 동료와 점심을 먹으며 취미를 물어보는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

## 고정 앞 대화: 제안 대신 다른 사건을 말하면 그 사건만 추가
user: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.
assistant: 이어서 회사 식당에서 동료와 점심을 먹으며 취미를 물어보는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

## 고정 앞 대화: 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
user: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.
assistant: 이어서 회사 식당에서 동료와 점심을 먹으며 취미를 물어보는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

## 고정 앞 대화: 자연스러운 추가 거절은 이유를 묻지 않고 카드
user: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.
assistant: 이어서 회사 식당에서 동료와 점심을 먹으며 취미를 물어보는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

## 1번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.

이어서 점심시간에 동료에게 취미를 물으며 친해지는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 1번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 회사 식당에서 동료에게 취미 이야기를 제가 먼저 꺼내고 싶어요. 업무 얘기는 피하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 중반의 팀 리드. 회의에서 새 팀원의 경력과 담당 업무를 차분히 듣고 필요한 부분을 물어본다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "20대 후반의 동료. 점심시간에는 편안한 주제로 대화하며 상대가 먼저 말을 꺼내면 자연스럽게 답한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, smart casual blazer over a simple blouse, nervous but composed with hands lightly clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 팀원들 앞에 자기소개를 한다. 영어가 서툴러 긴장한 상태지만, 이전 경력과 이번에 맡을 일을 영어로 설명하려 한다. Maya는 팀 리드로서 내 소개를 듣고 경력이나 담당 업무에 대해 필요한 질문을 할 수 있다. 내가 영어로 얼마나 유창하게 말하는지와 Maya의 반응 및 대화의 결과는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "회사 식당에서 나는 동료 Ethan에게 먼저 말을 걸고 취미 이야기를 꺼내 대화를 시작하려 한다. 업무 이야기는 피하고, 내 취미를 말한 뒤 Ethan의 취미도 물어보며 편안한 개인적인 대화를 이어가고 싶다. Ethan이 어떤 취미를 갖고 있는지, 대화가 얼마나 자연스럽게 이어지는지는 정하지 않는다. 첫 팀 회의에서 어떤 결과가 있었는지와 관계없이 성립하는 상황으로 진행한다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 말을 걸어 동료와 취미 이야기를 나눠요",
        "title": "점심시간의 취미"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 1번째 충분한 제안에 짧게 동의하면 바로 카드
질문: 좋아요



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 막히는 말을 재촉하지 않는다."
      },
      {
        "name": "Lucas",
        "position": 2,
        "role": "20대 후반의 동료 개발자. 점심시간에 가벼운 질문을 주고받으며 상대의 취미에 관심을 보인다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blazer over a blouse, slightly tense but welcoming with hands loosely clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 새 팀에서 맡게 될 업무를 영어로 설명하려 한다. 말이 막히거나 표현을 고쳐 달라고 요청할 수 있지만, Maya가 얼마나 이해하거나 도와주는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Lucas"
        ],
        "details": "회사 식당에서 Lucas와 점심을 먹으며 먼저 취미 이야기를 꺼내려 한다. 나는 내가 좋아하는 취미를 영어로 말하고 Lucas에게도 취미를 물어보며 대화를 이어가려 한다. 첫 팀 회의에서 긴장했거나 어떤 반응을 받았는지는 정하지 않으며, Lucas와 실제로 얼마나 대화가 이어지는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미를 말하고 이야기를 이어가요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서의 첫날"
  }
]
```
검사: 통과

## 1번째 제안 대신 다른 사건을 말하면 그 사건만 추가
질문: 점심 말고 사무실에서 동료에게 복사기 사용법을 묻고 싶어요. 양면 복사를 해야 해요.



```json
[
  {
    "characters": [
      {
        "name": "Alex",
        "position": 1,
        "role": "30대 후반의 팀 동료. 새로운 팀원의 경력과 맡은 일을 차분히 듣고, 말이 막혀도 재촉하지 않는다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 설명할 때 상대가 따라 할 수 있도록 천천히 말한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal cardigan, slightly nervous but attentive with one hand raised as if introducing himself, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Alex를 포함한 팀원들 앞에 선다. 나는 경력직으로 합류했고 영어가 서툴러 긴장한 상태지만, 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. 소개를 얼마나 매끄럽게 할지와 팀원들이 어떻게 반응할지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "해외 회사 사무실에서 복사기를 사용해야 한다. 나는 동료 Mia에게 양면 복사를 하는 방법을 영어로 물어보려 한다. 복사기 앞에서 필요한 기능을 설명하고 사용법을 확인하려는 순간부터 시작하며, Mia가 얼마나 쉽게 설명해 주는지와 복사가 잘 되는지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 주 사무실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료에게 회사 업무 시스템 사용법을 묻는 상황은 어때요? 영어가 서툴러도 필요한 기능을 설명하고 도움을 요청해야 하는 장면이에요. 첫 자기소개 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 사무실에서 동료에게 복사기 양면 복사 방법을 물어볼래요.



```json
[
  {
    "characters": [
      {
        "name": "Alex",
        "position": 1,
        "role": "30대 중반의 팀 리더. 새로 온 경력직 동료의 소개를 차분히 듣고 맡은 업무를 구체적으로 확인한다."
      },
      {
        "name": "Jamie",
        "position": 2,
        "role": "20대 후반의 사무실 동료. 복사기 사용법을 직접 보여 주며 상대가 따라 할 수 있게 설명한다."
      }
    ],
    "cover": "A man in his mid thirties, short dark hair, light blue shirt and charcoal cardigan, slightly nervous but welcoming with one hand raised as if inviting an introduction, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로서 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 말하지만 표현이 막히거나 긴장해서 다시 설명해야 할 수 있다. Alex는 팀 리더로 회의를 진행하며 내 소개를 듣고 경력과 맡을 업무에 관해 물을 수 있다. 나는 경력과 담당 업무를 분명히 전달하고 팀의 질문에 응답하려 한다. Alex가 어떻게 반응하거나 내가 얼마나 잘 설명하는지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Jamie"
        ],
        "details": "첫 팀 회의가 있는 사무실에서 나는 동료 Jamie에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 복사해야 할 자료가 있고 양면으로 복사하고 싶지만 기계 조작법을 모르는 상황이다. 나는 필요한 기능을 설명하고 사용 방법을 물으며, Jamie의 설명을 듣고 이해하지 못한 부분은 다시 확인하려 한다. Jamie가 바로 도와줄 수 있는지, 복사기가 어떤 상태인지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 복사기를 처음 사용하며 동료에게 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 긴장한 채 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실과 팀 회의실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 1번째 자연스러운 추가 거절은 이유를 묻지 않고 카드
질문: 지금은 자기소개만 할게요



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고 필요한 부분을 되묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blazer over a blouse, attentive and encouraging with a slightly tense smile, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 나는 경력직이지만 영어로 말하는 것이 서툴러 긴장한 상태다. 지금까지 해 온 일과 새 팀에서 맡을 업무를 직접 소개하려 한다. 말이 막히거나 Maya가 추가로 질문할지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 자기소개"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실",
    "title": "첫 팀 자기소개"
  }
]
```
검사: 통과

## 1번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 상대 운전자. 사고 직후 당황했지만 차분하게 사실을 확인하며 필요한 정보를 주고받는다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense and cautiously attentive, three-quarter view, body turned, face toward the viewer, mustard background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 나와 Daniel의 차량이 사고를 낸 직후다. 양쪽 모두 안전을 확인한 뒤 갓길에서 대화를 시작한다. 나는 Daniel과 연락처와 보험 정보를 교환하고 사고와 관련된 기본 사실을 확인하려 한다. Daniel이 협조적인지, 사고 책임이나 처리 방향에 대해 어떻게 반응하는지는 정하지 않는다. 사고 현장에서 위험할 수 있는 행동이나 불필요한 언쟁은 피한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받으려 해요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환하려고 해요",
    "setting": "사고 직후 차량을 안전하게 세운 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답하셨겠어요. 그때 상황을 영어로 풀어 보고 싶은 거라면, **싸움이 다시 커지기 전에 아내에게 먼저 말을 꺼내 서로의 입장을 설명하는 순간**으로 연습해 볼까요?

육아에서 어떤 문제로 부딪혔는지, 그리고 대화에서 무엇을 말하고 싶은지 알려 주세요. 예를 들면 육아 분담, 아이 훈육 방식, 서로의 휴식 시간 같은 상황이 있어요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으세요? 비행기, 비즈니스, 여행처럼 시작만 적어 주셔도 괜찮아요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: My baby keeps crying on a plane. The passenger next to me sighs and looks at us but does not shout. I want to explain I am trying and ask for understanding. Make only this one episode.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 편집자. 아기의 울음에 불편함을 느끼지만 고함치지 않고 한숨과 시선으로 반응하며, 설명을 들으면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울고 있어 나는 달래려고 애쓰고 있다. 옆자리 승객 Emma는 고함치지 않지만 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 진정시키려고 노력하고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지나 상황이 어떻게 끝나는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저를 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서 다른 상황도 연습해 볼게요. 비행이 끝난 뒤 공항에서 아기와 이동할 길을 직원에게 묻는 상황은 어때요? 아기 울음 상황의 결과와 관계없이 이어갈 수 있어요. 이 장면을 넣을까요, 아니면 다른 상황을 원하세요?

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

매장에서 영수증과 누수 영상을 보여 주며 커피 머신 교환을 요청하는 순간으로 연습하면 되겠어요. 직원은 화내지 않고 차분히 응대하는 상황으로 둘게요.

이어서 같은 매장에서 직원에게 다른 커피 머신의 사용법이나 관리 방법을 물어보는 상황도 해 볼까요? 지금 교환 요청 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 아니요, 일단 교환 요청만 연습할래요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 차분하게 손님의 설명과 자료를 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 이 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 장면을 찍은 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 내 설명과 자료를 확인한다. 교환이 가능한지와 어떤 절차가 필요한지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 판매하는 매장 안",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활 중 어떤 순간을 연습해 보고 싶으세요?

예를 들면 이사 직후 집주인에게 수리를 요청하기, 마트에서 물건을 찾기, 은행에서 계좌를 만들기, 병원에서 증상을 설명하기, 직장에서 동료와 처음 대화하기 같은 장면이 있어요. 가장 먼저 겪을 것 같은 상황을 골라 주세요.

```json
[]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 초반의 집주인 관리 담당자. 세입자의 설명을 차분히 듣고 필요한 내용을 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, casual beige sweater, attentive with a slightly concerned expression and open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 구한 아파트의 주방 싱크대 아래에서 물이 새기 시작했다. 나는 관리 담당자인 Maya에게 누수가 언제부터 시작됐고 바닥이 젖고 있다는 점을 설명하며 수리를 요청하려 한다. 사진을 보여 줄 수 있지만 사진이 문제를 해결해 주었거나 Maya가 바로 수리해 준다고 정하지 않는다. 나는 집 안의 물건이 더 망가지는 것을 피하고 싶고, 수리 일정과 지금 당장 해야 할 일을 물어보려 한다.",
        "number": 1,
        "preview": "새 집 주방에서 물이 새서 관리 담당자에게 수리를 요청해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "새로 구한 집에서 물이 새서 관리 담당자에게 도움을 요청해요",
    "setting": "해외 아파트 관리 사무실",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속되는 가운데, 옆자리 승객의 시선이 신경 쓰여 먼저 말을 꺼내야 하는 순간으로 해볼까요? 주변에 피해를 주려는 건 아니고, 저도 최선을 다하고 있으니 조금만 이해해 달라고 말하는 상황이에요.

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어 비행기에서 승무원에게 아기에게 먹일 따뜻한 물이나 필요한 도움을 요청하는 상황도 해볼까요? 옆자리 승객과의 대화가 어떻게 끝났는지와 관계없이, 아기를 돌보며 승무원에게 필요한 것을 설명하고 부탁하는 장면이에요. 지금 정한 옆자리 승객 상황만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편하면 짧게 말하지만 상대의 설명은 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft beige cardigan, tired and gently concerned while glancing sideways, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 다른 승객에게 피해를 주려는 것이 아니니 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 상황이 어떻게 풀리는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 말하고 싶으세요? 예를 들면 누수가 생겨 수리 날짜를 묻거나, 난방이 되지 않아 빠른 수리를 요청하는 장면이에요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 문제와 사진, 온도 기록을 보여 주면서 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요.

이어서 동네 모임에서는 어떤 순간에 인사하고 싶으세요? 처음 참석해서 자기소개를 하려는 건지, 옆 사람에게 먼저 말을 걸어 이름과 사는 곳을 묻고 싶은 건지 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 동네 모임에서 처음 만난 이웃과 주말 취미 얘기를 해보고 싶어요. 저는 자전거 타기를 좋아해요. 두 상황은 이것으로 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 후반의 집주인. 수리 요청을 들으면 문제와 일정을 확인하며 현실적인 답을 하려 한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 예의 있게 인사하고 주말 활동에 관심을 보인다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-up shirt and cardigan, concerned while listening and holding a phone at his side, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 온도 기록을 제시하면서 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정을 잡거나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고, 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 친해지는 정도나 Maya의 반응은 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "첫 이웃 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 처음 만난 이웃과 취미 이야기를 해요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 직원에게 커피 머신의 보증 기간과 수리 절차를 묻는 상황을 이어서 넣어 볼까요? 교환 요청의 결과와 관계없이, 제품에 문제가 생겼을 때 어떤 지원을 받을 수 있는지 설명해 달라고 하는 장면이에요. 지금 에피소드만으로도 충분해요.

```json
[]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 같은 매장에서 다른 날 Noah를 만나 우유 거품을 내는 법을 물어보고 싶어요. 아직 교환에 성공했는지는 모르니 그 결과를 정하지 말아줘.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 어떤 도구와 방법을 쓰는지 설명해 달라고 하려 한다. 첫 에피소드에서 커피 머신을 교환했는지, 지금 어떤 제품을 가지고 있는지는 정하지 않는다. Noah가 시범을 보이거나 어떤 방법을 안내할지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 우유 거품을 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 1번째 구체적인 추가
질문: 다른 날 같은 매장에서 Noah에게 우유 거품을 내는 법을 묻는 상황을 하나 더 넣어 줘. 교환 결과와 무관하게 매장 체험 코너에 갈 거예요.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 커피 머신으로 우유 거품을 직접 만들어 보는 방법과 필요한 순서를 알고 싶어 한다. 첫 에피소드에서 교환이 되었는지, 교환 결과가 어땠는지는 정하지 않으며, 매장 체험 코너에 가는 상황은 그 결과와 무관하게 성립한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 Noah에게 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 만들기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 체험 코너",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 1번째 한 화만 수정
질문: 1화 목표만 교환이 아니라 환불로 바꿔줘. 다른 조건과 2화는 그대로 둬.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 환불을 요청한다. 직원은 화내지 않으며 환불 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 환불받고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 1번째 상한과 삭제 뒤 재추가
질문: 에피소드를 하나 더 넣고 싶어요.

에피소드는 최대 5화까지라 더 추가할 수 없어요.

```json
[]
```
검사: 통과

## 1번째 상한과 삭제 뒤 재추가
질문: 5화를 빼 줘.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "3번째 매장 방문에서 원두 3번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 3,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "3번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "4번째 매장 방문에서 원두 4번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 4,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "4번째 방문"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 1번째 상한과 삭제 뒤 재추가
질문: 커피 머신을 청소하는 법을 같은 매장 직원에게 묻는 상황을 한 화 추가해 줘. 세척제를 얼마나 넣어야 할지 모르겠어요.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "3번째 매장 방문에서 원두 3번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 3,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "3번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "4번째 매장 방문에서 원두 4번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 4,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "4번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정 사용량과 청소 방법을 설명해 달라고 한다. Noah가 알려 주는 구체적인 방법은 플레이에서 정한다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
        "title": "청소 방법 묻기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 2번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.

첫 팀 회의에서 경력과 맡을 일을 소개하고, 영어가 서툴러 긴장한 상태에서 질문을 받는 순간으로 연습하면 좋겠어요. 이어서 점심시간에 동료에게 취미를 물으며 친해지는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 2번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 회사 식당에서 동료에게 취미 이야기를 제가 먼저 꺼내고 싶어요. 업무 얘기는 피하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 초반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 소개가 모호하면 구체적으로 되묻는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에는 편안한 사적인 대화를 선호하고, 상대가 먼저 꺼낸 이야기에 자연스럽게 반응한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, light blue shirt and charcoal blazer, attentive with a slightly encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Daniel과 팀원들이 새로 합류한 나를 맞이한다. 나는 경력과 이전에 해 온 일을 영어로 소개하고, 앞으로 맡을 업무를 설명하려 한다. 경력직이지만 영어가 서툴러 긴장하고 있으며, 말이 막히거나 표현이 부족해도 다시 설명해 보려 한다. Daniel이 어떤 질문을 하거나 어떻게 반응하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 점심을 먹으며 대화를 시작한다. 나는 업무 이야기는 피하고, 먼저 취미 이야기를 꺼내 내 취미를 말한 뒤 Maya의 취미도 물어보려 한다. 첫 팀 회의에서 실제로 어떤 일이 있었거나 Maya와 이미 친해졌다고 가정하지 않는다. Maya가 어떤 취미를 말하고 대화가 어떻게 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내 업무 말고 다른 대화를 해요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서의 첫날"
  }
]
```
검사: 통과

## 2번째 충분한 제안에 짧게 동의하면 바로 카드
질문: 좋아요



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리드. 새 팀원의 경력과 맡을 일을 차분히 확인하며, 설명이 막히면 서두르지 않고 듣는다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에 편하게 말을 걸고 자신의 취미도 자연스럽게 나눈다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, light blue blouse and charcoal blazer, nervous but composed with hands lightly clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya를 비롯한 팀원들 앞에 새로 합류한 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장하고 있으며, 이전 경력과 자신이 담당할 업무를 간단하고 분명하게 설명하려 한다. Maya가 어떤 질문을 하거나 얼마나 도와주는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "회사 식당에서 Ethan과 점심을 먹으며 내가 먼저 취미 이야기를 꺼내려 한다. 내 취미를 설명하고 Ethan의 취미도 물으며 업무 밖의 대화를 이어가려 한다. 첫 회의에서 어떤 인상을 남겼는지나 두 사람이 이미 친해졌는지는 정하지 않으며, Ethan이 어떤 반응을 보이고 무엇을 이야기하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "점심시간에 먼저 취미 이야기를 꺼내 동료와 대화를 이어가요.",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 2번째 제안 대신 다른 사건을 말하면 그 사건만 추가
질문: 점심 말고 사무실에서 동료에게 복사기 사용법을 묻고 싶어요. 양면 복사를 해야 해요.



```json
[
  {
    "characters": [
      {
        "name": "Jordan",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람이 말할 시간을 준다."
      },
      {
        "name": "Taylor",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기를 직접 보여 주며 설명하지만, 사용자가 원하는 설정은 먼저 확인한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal cardigan, welcoming but focused with an upright posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Jordan"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 하는 순간이다. 나는 경력직으로 합류했고, 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있으며, Jordan 앞에서 내 경험과 담당 업무를 이해하기 쉽게 말하려 한다. Jordan이 어떤 반응을 보이거나 내가 얼마나 잘 설명하는지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Taylor"
        ],
        "details": "첫 팀 회의와 같은 사무실에서 복사기를 사용해야 하는 순간이다. 나는 양면 복사를 해야 해서 Taylor에게 복사기 사용법을 영어로 묻고, 필요한 설정을 확인하려 한다. Taylor가 실제로 어떤 방식으로 설명하거나 도와주는지는 정하지 않으며, 양면 복사가 성공했는지도 미리 정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 양면 복사를 하려고 동료에게 복사기 사용법을 물어요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 팀 리더에게 맡게 될 업무의 우선순위와 기대하는 결과를 묻는 상황은 어때요? 회의에서 들은 내용을 제대로 이해했는지 확인하고, 처음 무엇부터 시작할지 영어로 질문하는 장면이에요.

```json
[]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 사무실에서 동료에게 복사기 양면 복사 방법을 물어볼래요.



```json
[
  {
    "characters": [
      {
        "name": "Rachel",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고 필요한 내용을 되묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 친절하게 설명하지만 바쁜 업무 중에는 짧게 반응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blazer over a blouse, attentive with a reassuring but focused expression, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Rachel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 팀원들 앞에 영어로 자기소개를 한다. 그동안의 경력과 새로 맡게 될 일을 설명하려 하지만 영어가 서툴러 긴장한 상태다. 나는 준비한 내용을 자연스럽게 말하고, 내가 맡을 업무를 팀원들이 이해할 수 있도록 소개하려 한다. Rachel이 어떤 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "첫 팀 회의가 있는 해외 회사 사무실에서 나는 동료 Daniel에게 복사기의 양면 복사 방법을 묻는다. 복사기의 기본 사용법은 알고 있지만 양면으로 복사하는 방법을 몰라 업무 자료를 준비하려 한다. 영어로 필요한 기능을 설명하고 사용 방법을 물어보려 한다. Daniel이 바로 도와줄 수 있는지, 얼마나 자세히 설명하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의가 열리는 사무실",
    "title": "새 팀에서 영어로 시작하기"
  }
]
```
검사: 통과

## 2번째 자연스러운 추가 거절은 이유를 묻지 않고 카드
질문: 지금은 자기소개만 할게요



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하고, 설명이 막히면 기다려 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blazer over a blouse, slightly nervous but encouraging with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 팀 리더 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 나는 이전 직장에서 해 온 업무와 관련 경험을 간단히 설명하고, 새 팀에서 맡게 될 역할과 기여하고 싶은 일을 말하려 한다. 영어가 서툴러 긴장한 상태라 말이 막히거나 표현을 고쳐 말할 수 있다. Maya가 어떻게 반응하거나 질문하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실",
    "title": "첫 팀 회의"
  }
]
```
검사: 통과

## 2번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 초반의 상대 운전자. 사고 직후 긴장했지만 목소리를 낮춰 사실관계와 보험 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, wearing a gray jacket over a shirt, tense but composed with one hand raised to pause and an alert posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로 갓길에서 접촉 사고 직후 상대 운전자와 마주한다. 나는 다친 사람이 없는지 확인한 뒤 사고 상황을 간단히 설명하고, 서로의 이름과 연락처, 차량 정보와 보험 정보를 교환하려 한다. 사고 사진이나 보험 증서를 확인할 수 있지만 어떤 정보가 실제로 제공되는지, 상대가 협조하는지는 정하지 않는다. 고속도로 주변은 차량 소리가 크고 안전을 위해 대화를 길게 끌지 않으며, 사고 책임을 최종적으로 따지거나 보험 처리가 끝난 상황으로 만들지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받으려 해요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환하려고 해요",
    "setting": "차량이 멈춰 선 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 영어로는 부부 사이에서 육아 방식에 대한 의견 차이를 풀어 가는 장면을 연습해 볼 수 있어요.

예를 들면, **어제 다툰 뒤 다시 대화를 시작해서 서로의 입장을 설명하고, 앞으로 육아를 어떻게 나눌지 이야기하는 순간**이에요. 이 장면이 맞을까요? 아니면 싸우던 중에 감정이 격해진 상황을 연습하고 싶으세요?

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으세요?

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: My baby keeps crying on a plane. The passenger next to me sighs and looks at us but does not shout. I want to explain I am trying and ask for understanding. Make only this one episode.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편할 때도 고함치지 않고 짧게 표현한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울리고 있다. 나는 아기를 달래려고 애쓰고 있지만 울음이 멈추지 않아 곤란하다. 옆자리의 Emma는 고함치지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 내가 최선을 다하고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 어떤 반응을 보이는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 우리를 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 승무원에게 아기를 달랠 수 있도록 따뜻한 물이나 도움을 요청하는 상황을 이어서 넣어 볼까요? 첫 에피소드의 일이 어떻게 끝났는지와 관계없이 연습할 수 있어요. 지금 에피소드에서 옆자리 승객에게 말하는 장면만으로도 괜찮아요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 차분하게 교환을 요청하는 상황이네요. 직원이 화내지 않는 조건도 반영할게요.

이어서 같은 매장의 커피 코너에서 직원에게 원두를 추천받고, 평소 좋아하는 맛을 설명하는 상황도 해볼까요? 지금 교환 요청 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 아니요, 일단 교환 요청만 연습할래요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 차분하게 고객의 설명과 증거 자료를 확인하며 화내지 않고 응대한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green retail uniform, calm and attentive while listening with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 이 매장에서 산 커피 머신을 집에서 사용하자 물이 샌다. 나는 영수증과 누수 장면을 촬영한 영상을 가지고 매장에 와서 이를 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 설명을 듣고 자료를 확인한다. 교환이 가능한지와 직원이 어떤 대응을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요",
    "setting": "문제가 생긴 커피 머신을 들고 찾아간 전자제품 매장",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 법한 장면부터 정해 볼까요?

예를 들면 다음과 같은 상황이 있어요.

- 집을 구하며 집주인이나 중개인에게 조건을 묻기
- 마트에서 원하는 물건의 위치나 성분을 묻기
- 병원이나 약국에서 증상을 설명하기
- 은행이나 통신사에서 계좌와 휴대폰을 개통하기
- 직장이나 학교에서 처음 만난 사람과 이야기하기
- 식당에서 주문이 잘못되어 정정 요청하기

어떤 상황을 가장 먼저 연습해 보고 싶으세요?

```json
[]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 초반의 집주인 대리인. 세입자의 말을 차분히 듣고 계약 조건과 수리 요청을 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, beige blazer over a simple white shirt, attentive with a slightly concerned expression and one hand raised as if asking for details, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 구한 집에 입주한 뒤, 욕실의 온수가 나오지 않는 것을 발견한다. 나는 집주인 대리인 Maya에게 문제를 설명하고 언제 수리가 가능한지, 당장 할 수 있는 임시 방법이 있는지 물어보려 한다. 계약서와 입주 안내 메시지를 가지고 있지만, 수리 비용을 누가 부담하는지는 확정하지 않는다. Maya가 바로 해결책을 제시하거나 요청을 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "새 집에 들어왔는데 욕실에서 따뜻한 물이 나오지 않아요",
        "title": "온수가 안 나와요"
      }
    ],
    "hook": "새 집에 들어왔는데 욕실에서 따뜻한 물이 나오지 않아요",
    "setting": "해외에서 처음 구한 아파트의 거실",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속되고, 옆자리 승객이 한숨을 쉬며 쳐다보는 순간부터 시작해 볼까요? 먼저 말을 걸어 미안하다고 하고, 최선을 다하고 있으니 조금만 이해해 달라고 부탁하는 상황이에요. 옆자리 승객은 화를 내기보다 불편한 표정으로 반응하게 할 수 있어요.

이 장면으로 연습해도 좋고, 승무원에게 도움을 요청하거나 다른 승객에게 양해를 구하는 순간을 원하면 바꿔도 좋아요.

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

아기를 달래느라 계속 애쓰는 상황에서, 옆자리 승객이 한숨을 쉬며 쳐다보고 먼저 말을 꺼내는 장면으로 정할게요. 승객은 화내지 않고 불편한 표정만 보이며, 조금만 이해해 달라는 부탁을 받아들이는지는 실제 대화에서 정하지 않겠습니다.

이어서 같은 비행기에서 승무원에게 아기를 위해 따뜻한 물이나 조용한 자리를 요청하는 상황도 해볼까요? 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 회사원. 조용히 쉬는 시간을 중요하게 여기며 불편해도 화를 내기보다 표정과 짧은 말로 드러낸다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft gray sweater, tired and glancing sideways with restrained discomfort, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화를 내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 나도 최선을 다하고 있으니 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하는지와 부탁을 받아들이는지는 실제 대화에서 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객이 계속 쳐다봐요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인과 수리 문제를 이야기하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 요청하고 싶으세요? 예를 들면 누수가 생겨 수리 일정을 잡아 달라고 말하는 장면처럼요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 고장 상황은 정해졌어요. 사진과 온도 기록을 보여 주면서 이번 주 안에 수리해 달라고 집주인에게 부탁하는 장면으로 할게요.

이제 동네 모임에서 인사하는 상황을 정해 볼게요. 처음 만난 이웃들에게 자신을 소개하고 대화를 시작하려는 장면이 맞나요? 특별히 말하고 싶은 내용이나 먼저 말을 걸고 싶은 사람이 있으면 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 동네 모임에서 처음 만난 이웃과 주말 취미 얘기를 해보고 싶어요. 저는 자전거 타기를 좋아해요. 두 상황은 이것으로 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 후반의 집주인. 집 상태와 수리 비용을 먼저 확인하며 구체적인 자료가 있으면 차분히 듣는다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 밝게 인사하고 상대의 취미를 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-up shirt and dark trousers, concerned and standing with one hand raised as if asking for details, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 온도 기록을 제시하면서 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정이나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "해외의 동네 모임에서 처음 만난 이웃 Mia에게 먼저 인사한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Mia의 주말 취미도 물으며 대화를 이어 가려 한다. 두 사람이 친해지거나 대화가 원활하게 끝나는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 주말 취미를 이야기해요",
        "title": "주말 취미"
      }
    ],
    "hook": "집의 난방이 고장 나 집주인에게 수리를 부탁하고, 동네 모임에서는 처음 만난 이웃에게 말을 걸어요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "새 동네에서 말하기"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 상황도 이어서 넣어 볼게요. 직원에게 커피 머신의 기본 사용법이나 관리 방법을 물어보며, 누수 문제와는 별개로 제품을 제대로 쓰는 방법을 확인하는 에피소드는 어때요? 첫 에피소드의 교환 결과와 관계없이 진행할 수 있어요. 지금 에피소드만 그대로 두고 끝내도 좋아요.

```json
[]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 같은 매장에서 다른 날 Noah를 만나 우유 거품을 내는 법을 물어보고 싶어요. 아직 교환에 성공했는지는 모르니 그 결과를 정하지 말아줘.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "첫 에피소드에서 커피 머신을 교환했는지, 교환 요청이 어떻게 되었는지는 정하지 않는다. 다른 날 같은 매장에서 Noah를 만난다. 나는 우유 거품을 내는 방법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 순서와 주의할 점을 설명해 달라고 한다. Noah가 어떤 방법을 알려 주는지와 내가 이해하는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 만들기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 제품 안내 공간",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 2번째 구체적인 추가
질문: 다른 날 같은 매장에서 Noah에게 우유 거품을 내는 법을 묻는 상황을 하나 더 넣어 줘. 교환 결과와 무관하게 매장 체험 코너에 갈 거예요.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 커피 머신으로 우유 거품을 제대로 만드는 방법과 필요한 순서를 알고 싶어 한다. 첫 에피소드에서 교환이 이루어졌는지는 정하지 않으며, 교환 결과와 무관하게 체험 코너에 방문한 상황이다. Noah가 시범을 보이거나 어떤 방법을 알려 줄지는 플레이에서 정한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
        "title": "우유 거품 배우기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 체험 코너",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 2번째 한 화만 수정
질문: 1화 목표만 교환이 아니라 환불로 바꿔줘. 다른 조건과 2화는 그대로 둬.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 환불을 요청한다. 직원은 화내지 않으며 환불 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 환불받고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 2번째 상한과 삭제 뒤 재추가
질문: 에피소드를 하나 더 넣고 싶어요.

에피소드는 최대 5화까지라 더 넣을 수 없어요.

```json
[]
```
검사: 통과

## 2번째 상한과 삭제 뒤 재추가
질문: 5화를 빼 줘.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "3번째 매장 방문에서 원두 3번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 3,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "3번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "4번째 매장 방문에서 원두 4번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 4,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "4번째 방문"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 2번째 상한과 삭제 뒤 재추가
질문: 커피 머신을 청소하는 법을 같은 매장 직원에게 묻는 상황을 한 화 추가해 줘. 세척제를 얼마나 넣어야 할지 모르겠어요.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "3번째 매장 방문에서 원두 3번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 3,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "3번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "4번째 매장 방문에서 원두 4번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 4,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "4번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량을 확인하려 한다. Noah가 정확한 사용법을 알려 주는지는 정하지 않는다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
        "title": "세척제 사용법"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 3번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.

첫 팀 회의에서 경력과 앞으로 맡을 일을 소개하는 순간이네요. 영어가 서툴러 긴장한 상태에서, 짧고 분명하게 자기소개를 해보는 장면으로 만들면 좋겠어요.

이어서 점심시간에 동료에게 먼저 취미를 물으며 친해지는 상황도 해볼까요? 자기소개 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 3번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 회사 식당에서 동료에게 취미 이야기를 제가 먼저 꺼내고 싶어요. 업무 얘기는 피하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Alex",
        "position": 1,
        "role": "30대 후반의 해외 회사 팀 동료. 회의에서는 새 동료의 경력과 맡을 일을 듣고, 일상적인 대화에서는 상대가 편하게 말할 수 있도록 반응한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, smart casual shirt and cardigan, slightly nervous but attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Alex에게 영어로 경력과 앞으로 맡을 일을 소개한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 새 팀에서 맡게 될 업무를 짧고 분명하게 말하려 한다. Alex가 어떤 질문을 하거나 어떻게 반응할지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 앞으로 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Alex"
        ],
        "details": "회사 식당에서 Alex와 점심을 먹으며 업무 이야기는 피하고, 내가 먼저 취미 이야기를 꺼내 대화를 시작하려 한다. 내 취미를 간단히 말한 뒤 Alex의 취미도 물어보려 하며, 업무와 관련된 질문이나 주제로 넘어가지 않도록 하고 싶어 한다. Alex가 어떤 취미를 말하거나 대화를 얼마나 이어 갈지는 정하지 않는다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내며 동료와 대화해요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개하고 점심에는 동료와 취미 이야기를 나눠요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 3번째 충분한 제안에 짧게 동의하면 바로 카드
질문: 좋아요



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하고, 긴장한 사람이 천천히 말해도 기다려 준다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "30대 초반의 팀 동료. 점심시간에 가벼운 질문으로 대화를 시작하고 상대의 관심사에 자연스럽게 반응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, composed but encouraging with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 경력직이지만 영어가 서툴러 긴장한 나는 지금까지의 경력과 담당하게 될 업무를 설명하려 한다. 말을 더듬거나 표현이 막힐 수 있으며, Maya가 얼마나 기다려 주거나 질문할지는 플레이에서 정한다. 자기소개가 성공적으로 끝났다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "팀 회의가 있는 날 회사 식당에서 Ethan과 점심을 먹으며 대화한다. 나는 먼저 취미 이야기를 꺼내고 내 취미를 말한 뒤 Ethan에게도 취미를 물으며 친해지려 한다. 첫 회의에서 어떤 결과가 있었는지, 이미 친해졌는지는 정하지 않으며, Ethan이 어떤 관심사를 이야기하고 어떻게 반응할지는 플레이에서 정한다.",
        "number": 2,
        "preview": "점심시간에 먼저 취미 이야기를 꺼내 동료와 대화를 이어가요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서의 첫날"
  }
]
```
검사: 통과

## 3번째 제안 대신 다른 사건을 말하면 그 사건만 추가
질문: 점심 말고 사무실에서 동료에게 복사기 사용법을 묻고 싶어요. 양면 복사를 해야 해요.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고 맡은 일을 확인한다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "30대 초반의 동료. 사무실에서 필요한 일을 물어보면 자신의 방식대로 설명해 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blazer, slightly nervous but welcoming, standing upright with hands loosely clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya와 팀원들 앞에 서서 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직으로 합류했지만 영어가 서툴러 긴장하고 있으며, 자신의 이전 경력과 새 팀에서 맡을 업무를 간단하고 분명하게 말하려 한다. Maya가 어떤 반응을 보이거나 질문하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Leo"
        ],
        "details": "첫 팀 회의가 있는 해외 회사 사무실에서 Leo에게 복사기 사용법을 영어로 묻는다. 양면 복사를 해야 하지만 복사기의 설정 방법을 잘 몰라, 필요한 문서를 양면으로 복사하는 방법을 설명해 달라고 부탁하려 한다. Leo가 바로 도와줄지, 복사기가 어떤 방식으로 작동하는지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료에게 업무 자료가 있는 사내 시스템 사용법을 묻는 상황은 어때요? 영어가 서툴지만 맡은 일을 시작하기 위해 필요한 정보를 직접 물어보는 장면이에요. 이 상황으로 해보고 싶으세요, 아니면 다른 업무 장면을 원하세요?

```json
[]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 사무실에서 동료에게 복사기 양면 복사 방법을 물어볼래요.



```json
[
  {
    "characters": [
      {
        "name": "Jordan",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고 필요한 경우 구체적으로 되묻는다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "20대 후반의 팀 동료. 복사기 사용법을 잘 알고 있으며 짧고 실용적으로 설명한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal blazer, slightly nervous but welcoming with one hand raised as if introducing himself, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Jordan"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Jordan이 새 팀원인 나에게 경력과 맡고 싶은 일을 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태에서 이전 경력과 이번 팀에서 맡을 수 있는 일을 영어로 설명하려 한다. Jordan이 어떤 질문을 하거나 어떻게 반응하는지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "사무실에서 업무 자료를 복사해야 하는데 복사기의 양면 복사 방법을 모른다. 나는 Mia에게 다가가 양면으로 복사하는 방법을 영어로 물어보고, 필요한 경우 용지 방향이나 설정도 확인하려 한다. Mia가 바로 도와줄지, 설명을 이해할 수 있을지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의가 열리는 사무실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 3번째 자연스러운 추가 거절은 이유를 묻지 않고 카드
질문: 지금은 자기소개만 할게요



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하며, 설명이 막히면 기다려 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blazer and blouse, nervous but welcoming with her hands lightly clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 처음 팀원들 앞에 선다. 영어가 서툴러 긴장한 상태에서 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. Maya는 내 소개를 듣고 경력과 담당 업무를 확인하려 한다. 소개가 매끄럽게 진행되는지, 내가 질문에 어떻게 답하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 자기소개"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실",
    "title": "첫 팀 회의"
  }
]
```
검사: 통과

## 3번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Michael",
        "position": 1,
        "role": "40대 초반의 운전자. 사고 직후 당황했지만 차분하게 사실을 확인하고 필요한 정보를 주고받으려 한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual jacket over a shirt, tense but controlled, standing upright with one hand slightly raised, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Michael"
        ],
        "details": "고속도로에서 사고가 난 직후 갓길에서 상대 운전자 Michael과 마주한다. 나는 먼저 사고 상황을 차분히 확인하고 서로의 연락처와 보험 정보를 교환하려 한다. 필요한 정보를 영어로 요청하고, 내가 가진 정보도 설명하려 한다. 사고의 책임이 누구에게 있는지, 상대가 협조하는지, 보험 처리가 어떻게 진행되는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받아요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 그 상황에서 어떤 장면을 영어로 연습해 보고 싶으세요?

예를 들면,  
- 아내에게 먼저 말을 꺼내고 서로의 입장을 설명하는 장면  
- 육아 분담이 불공평하다고 느낀 점을 말하는 장면  
- 어제 싸운 뒤 감정을 가라앉히고 다시 대화하는 장면  

어떤 순간을 연습하고 싶은지 말해 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으세요?

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: My baby keeps crying on a plane. The passenger next to me sighs and looks at us but does not shout. I want to explain I am trying and ask for understanding. Make only this one episode.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬거나 쳐다보지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울리고 있다. 나는 아기를 달래려고 애쓰고 있지만 울음이 멈추지 않아 곤란하다. 옆자리의 Emma는 고함치지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 내가 아기를 달래려고 노력하고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선과 한숨이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내에서 이해 구하기"
  }
]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 옆자리 승객과 여행 목적지에 관한 이야기를 나누는 에피소드는 어때요? 아기 이야기나 불편한 상황이 아니라, 먼저 여행 이야기를 꺼내고 상대의 여행 목적도 물어보는 장면이에요. 첫 에피소드의 결과와 관계없이 진행할 수 있어요. 지금 정한 에피소드만으로 끝내도 좋아요.

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 차분하게 교환을 요청하는 상황이네요. 직원은 화내지 않고, 요청 내용을 확인하면서 응대하는 장면으로 해볼게요.

이어서 같은 매장에서 커피 머신 사용법을 직원에게 묻는 상황도 해볼까요? 교환이 이루어졌는지와 관계없이, 매장에 다시 방문해 새로 생긴 궁금한 점을 묻는 장면이에요. 지금 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 아니요, 일단 교환 요청만 연습할래요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 영상을 차분히 확인하며 요청 내용을 묻는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green retail uniform, calm and attentive with both hands lightly held together, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 장면을 찍은 영상을 가지고 매장에 와서 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 차분히 확인하며 필요한 내용을 묻는다. 교환이 가능한지, 어떤 절차가 진행되는지는 실제 대화에서 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 산 매장 고객 서비스 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 자주 겪는 장면부터 골라 볼까요?

예를 들면 현지에서  
- 집주인에게 집 수리를 요청하기  
- 마트나 약국에서 필요한 물건 묻기  
- 병원에서 증상 설명하기  
- 직장이나 학교에서 자기소개하기  
- 이웃이나 동료와 처음 대화하기  

같은 상황을 연습할 수 있어요. 가장 먼저 겪어 보고 싶은 장면이 무엇인가요?

```json
[]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣고 필요한 내용을 구체적으로 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder length dark brown hair, simple beige sweater and dark trousers, attentive with a slightly concerned expression while standing upright, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 구한 아파트에 입주한 지 얼마 되지 않았는데 욕실의 온수가 갑자기 나오지 않는다. 나는 집주인 Maya에게 문제를 설명하고, 언제 수리가 가능한지와 당장 사용할 수 있는 방법이 있는지 물어보려 한다. 사진이나 계약서의 관련 내용을 보여 줄 수 있지만, Maya가 바로 수리해 주거나 대안을 제시하는지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 구한 집에서 온수가 나오지 않아 집주인에게 설명해요",
        "title": "온수 문제"
      }
    ],
    "hook": "새로 구한 집에서 온수가 나오지 않아 집주인에게 연락해요",
    "setting": "해외에서 처음 구한 아파트의 현관",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속되고, 옆자리 승객이 한숨을 쉬며 쳐다보는 순간부터 연습해 볼까요? 먼저 말을 걸어 미안하다고 하고, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 설명하는 상황이에요. 이런 장면이 맞을까요?

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 같은 비행기에서 승무원에게 아기를 달랠 물품이나 도움을 요청하는 상황도 해 볼까요? 옆자리 승객과의 대화가 어떻게 끝났는지와 관계없이, 아기를 돌보면서 승무원에게 필요한 것을 영어로 설명하는 장면이에요. 지금 정한 상황만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편해도 화내지 않고 상대의 설명을 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것과 상황이 쉽지 않다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 해외에서 집주인에게 집 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하고 싶으세요?

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요.

이어서 동네 모임에서 처음 만난 사람에게 먼저 인사하고, 간단히 자기소개하며 대화를 시작하는 상황도 해 볼까요? 첫 번째 수리 요청 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 동네 모임에서 처음 만난 이웃과 주말 취미 얘기를 해보고 싶어요. 저는 자전거 타기를 좋아해요. 두 상황은 이것으로 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 후반의 집주인. 집 상태와 수리 일정을 차분히 확인하며 구체적인 자료가 있으면 메모한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 편하게 말을 걸고 주말 취미 이야기에 관심을 보인다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual knit sweater, concerned and listening with his hands slightly raised, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 Daniel에게 보여 주며 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이거나 언제 처리할지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 Maya에게 먼저 인사하고 대화를 시작한다. 나는 주말에 자전거 타기를 좋아한다고 말하며 내 취미를 이야기하고, Maya의 주말 취미도 물어보려 한다. Maya가 어떤 취미를 말하거나 대화가 얼마나 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "첫 이웃 인사"
      }
    ],
    "hook": "난방이 고장 난 집에서 집주인에게 이번 주 안에 수리해 달라고 부탁해요",
    "setting": "해외 임대주택과 근처 주민 모임 공간",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 커피 머신 사용법을 직접 묻는 상황을 이어서 넣어 볼까요? 교환이 됐는지와 관계없이, 매장 체험 코너에서 직원에게 물을 넣는 위치와 세척 방법을 질문하는 장면이에요. 지금 카드의 문제 해결 결과는 미리 정하지 않아요.

```json
[]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 같은 매장에서 다른 날 Noah를 만나 우유 거품을 내는 법을 물어보고 싶어요. 아직 교환에 성공했는지는 모르니 그 결과를 정하지 말아줘.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "같은 매장에서 다른 날 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신을 사용할 때 어떤 순서로 해야 하는지 설명을 들으려 한다. 첫 번째 에피소드에서 교환에 성공했는지는 정하지 않으며, 그 결과와 관계없이 우유 거품 내는 법을 묻는 상황으로 시작한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 3번째 구체적인 추가
질문: 다른 날 같은 매장에서 Noah에게 우유 거품을 내는 법을 묻는 상황을 하나 더 넣어 줘. 교환 결과와 무관하게 매장 체험 코너에 갈 거예요.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 주의할 점을 설명해 달라고 하려 한다. 첫 번째 에피소드에서 교환이 이루어졌는지, 문제가 해결되었는지와 무관하게 시작한다. Noah가 시범을 보이거나 어떤 방법을 안내할지는 정하지 않는다.",
        "number": 2,
        "preview": "매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 체험 코너",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 3번째 한 화만 수정
질문: 1화 목표만 교환이 아니라 환불로 바꿔줘. 다른 조건과 2화는 그대로 둬.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 전액 환불을 요청한다. 직원은 화내지 않으며 환불 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 환불받고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 3번째 상한과 삭제 뒤 재추가
질문: 에피소드를 하나 더 넣고 싶어요.

에피소드는 최대 5화까지라 더 넣을 수 없어요.

```json
[]
```
검사: 통과

## 3번째 상한과 삭제 뒤 재추가
질문: 5화를 빼 줘.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "3번째 매장 방문에서 원두 3번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 3,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "3번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "4번째 매장 방문에서 원두 4번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 4,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "4번째 방문"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 3번째 상한과 삭제 뒤 재추가
질문: 커피 머신을 청소하는 법을 같은 매장 직원에게 묻는 상황을 한 화 추가해 줘. 세척제를 얼마나 넣어야 할지 모르겠어요.



```json
[
  {
    "characters": [
      {
        "name": "Noah",
        "position": 1,
        "role": "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
    "episodes": [
      {
        "cast": [
          "Noah"
        ],
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
        "title": "물이 새는 기계"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
        "number": 2,
        "preview": "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
        "title": "사용법 묻기"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "3번째 매장 방문에서 원두 3번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 3,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "3번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "4번째 매장 방문에서 원두 4번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.",
        "number": 4,
        "preview": "매장에서 다른 원두의 맛을 물어보고 싶어요",
        "title": "4번째 방문"
      },
      {
        "cast": [
          "Noah"
        ],
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적절한 양과 사용 방법을 설명해 달라고 한다. 이전 에피소드에서 교환이 이루어졌는지는 가정하지 않는다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
        "title": "세척제 사용법"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과
