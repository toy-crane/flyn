# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:40:31.929Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 3f18bdc5175a78ac9af3b1008e6858181bf986a990342fd2f03e468fff531d3b
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

이어서 점심시간에 동료에게 먼저 말을 걸어 취미를 이야기하며 친해지는 상황도 해 볼까요? 지금 정한 첫 팀 회의 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람이 천천히 말할 수 있도록 기다린다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에는 업무에서 벗어난 가벼운 대화를 즐기며, 상대가 먼저 꺼낸 취미 이야기에 자연스럽게 반응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, welcoming but focused with a calm upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 지금까지의 경력과 맡게 될 업무를 팀원들이 이해할 수 있게 말하고 싶다. Maya가 질문하거나 어떤 반응을 보일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹으며 내가 먼저 업무와 관련 없는 취미 이야기를 꺼내려 한다. 업무 이야기는 피하고, 내가 좋아하는 취미를 말한 뒤 Daniel의 취미도 물으며 자연스럽게 대화를 이어가고 싶다. Daniel이 어떤 취미를 말하고 대화가 어떻게 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내며 동료와 대화해요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 점심시간 회사 식당",
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
        "role": "30대 후반의 팀 리더. 새로 온 팀원의 경력과 맡을 일을 차분히 듣고 필요한 경우 구체적으로 되묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 팀 동료. 점심시간에는 편안한 분위기로 대화하지만 낯선 사람에게는 먼저 말을 많이 걸지 않는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with a calm encouraging expression and open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya에게 영어로 자신의 이전 경력과 이번에 맡을 일을 소개한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 짧고 분명하게 말하고 필요한 경우 자신의 역할을 다시 설명하려 한다. Maya가 어떻게 반응하거나 질문하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹으며 취미 이야기를 꺼낸다. 나는 내 취미를 간단히 말하고 Daniel의 취미도 물어보며 자연스럽게 대화를 이어가려 한다. 첫 팀 회의에서 실제로 어떤 대화가 오갔는지와 관계가 어떻게 느껴졌는지는 미리 정하지 않으며, Daniel의 반응과 대화의 흐름은 실제 플레이에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 취미를 물으며 대화를 이어가요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 첫걸음"
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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 알려 주며, 상대가 어려워하면 단계별로 설명한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blazer over a blouse, attentive and encouraging with a composed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원인 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 경력과 담당 업무를 또렷하게 전달하고 필요한 부분은 설명하려 한다. Maya가 어떤 반응을 보이거나 어떤 질문을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "같은 사무실에서 나는 동료 Daniel에게 복사기 사용법을 영어로 물어보려 한다. 문서를 양면으로 복사해야 해서, 복사기를 어떻게 설정하고 시작하는지 설명해 달라고 부탁하려 한다. Daniel이 얼마나 쉽게 설명하거나 내가 바로 복사하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 양면 복사를 하려고 동료에게 복사기 사용법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
    "title": "새 회사의 첫날"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 회의가 끝난 뒤 동료에게 맡은 업무의 진행 방식과 팀의 협업 방법을 묻는 상황은 어떨까요? 영어가 서툴러도 다시 설명해 달라고 하면서 업무를 제대로 이해하려는 장면이에요. 첫 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Claire",
        "position": 1,
        "role": "30대 중반의 팀 동료. 새로 합류한 사람의 경력과 맡은 일을 차분히 듣고, 긴장한 상대에게 천천히 말할 시간을 준다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "20대 후반의 사무실 동료. 복사기 사용법을 직접 보여 주며, 모르는 부분을 물어보면 다시 설명한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder length dark brown hair, light blue blouse and charcoal blazer, slightly nervous but composed with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Claire"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Claire를 포함한 팀원들 앞에 새로 합류한 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 경력과 담당 업무를 설명하고 필요한 말을 이어 가려 한다. Claire가 어떤 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사 사무실에서 복사기를 사용해야 하는 나는 Daniel에게 양면 복사 방법을 물어보려 한다. 복사할 문서를 준비하고 있지만 기기의 양면 복사 설정을 영어로 설명하거나 다시 물어보며 사용법을 이해하려 한다. Daniel이 바로 도와줄 수 있는지, 설명이 어떻게 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "새로 합류한 해외 회사의 회의실과 사무실",
    "title": "새 회사에서 시작하기"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하고, 설명이 막히면 기다렸다가 다시 물어본다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, attentive with a calm encouraging expression and an upright posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 시작하는 순간이다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장하고 있다. 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. Maya는 팀 리더로 회의에서 내 소개를 듣고 필요한 내용을 물을 수 있다. 내가 얼마나 자연스럽게 말하는지, Maya가 어떻게 반응하는지, 소개가 성공적으로 끝나는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
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

## 1번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 운전자. 사고 직후 긴장해 있지만 차분하게 필요한 정보를 확인하려 하며, 책임을 단정하는 말에는 조심스럽게 반응한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed with his hands slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 차량 사고가 난 직후, 나는 상대 운전자 Daniel과 연락처와 보험 정보를 서로 교환하려 한다. 사고에 관한 사실을 간단히 설명하고, 연락처와 보험 회사 및 보험 관련 정보를 확인하려 한다. Daniel이 협조적인지, 사고 책임에 대해 어떤 입장인지, 정보 교환이 어떻게 진행되는지는 실제 대화에서 정한다. 사고의 책임이나 보상 결과를 미리 정하지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받으려 해요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받으려 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 연락"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 그 상황에서 어떤 순간을 영어로 연습해 보고 싶으세요?

예를 들면,  
- 아내에게 육아 분담이 불공평하다고 차분히 말하는 순간  
- 어제 다툰 뒤 먼저 사과하고 다시 이야기하는 순간  
- 아이를 어떻게 돌볼지 서로의 입장을 설명하며 합의하려는 순간  

어디서, 아내와 무엇을 말하고 싶은지 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 뜻인지 조금만 더 말해 주세요. 비 오는 날의 상황인지, 비행기에서의 상황인지 궁금해요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편하면 한숨과 시선으로 드러내지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저와 아기를 쳐다봐요",
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

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서 다른 상황도 하나 넣어 볼게요. 비행기가 착륙한 뒤 공항에서 Emma를 다시 만나, 여행지나 아이와 가기 좋은 장소를 묻는 상황은 어때요? 지금 만든 에피소드만 유지해도 좋아요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

이어서 같은 매장에서 커피 머신 사용법을 직원에게 묻는 상황도 해볼까요? 교환 요청의 결과와 관계없이, 매장에 전시된 다른 모델을 보며 원하는 커피를 만들려면 어떤 기능이 필요한지 질문하는 장면이에요. 지금 누수 제품의 교환 요청 에피소드만 만들어도 좋아요.

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
        "name": "Mina",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 제품 상태와 구매 내역을 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mina"
        ],
        "details": "어제 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 장면을 촬영한 영상을 보여 주며 제품에 문제가 생겼다고 설명하고 교환을 요청하려 한다. Mina는 화내지 않고 내 설명을 듣는다. 교환이 실제로 가능한지, 어떤 절차가 필요한지는 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 구매한 매장 안",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 어떤 장면을 연습해 보고 싶으세요?

예를 들면 새 집에 문제가 생겨 집주인에게 말하기, 병원에서 증상 설명하기, 은행 계좌 만들기, 관공서에서 서류를 처리하기, 마트에서 물건을 환불받기, 이웃이나 직장 동료와 대화하기 같은 상황이 있어요.

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
        "role": "30대 초반의 집주인. 세입자의 설명을 차분히 듣고 집 상태와 계약 내용을 확인한 뒤 가능한 방법을 검토한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, soft beige sweater, attentive with a slightly concerned expression and one hand raised as if asking for details, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 지내는 집의 욕실 수도꼭지에서 물이 계속 새고 있다. 나는 집주인 Maya에게 문제를 설명하고 수리를 요청하려 한다. 물이 새기 시작한 시점과 현재 상태를 말할 수 있고, 집에 더 큰 문제가 생길까 봐 걱정하고 있다. Maya가 바로 수리해 주는지, 비용을 누가 부담하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집 욕실의 수도꼭지에서 물이 계속 새서 집주인에게 연락해 수리를 요청해요.",
        "title": "집 수리 요청"
      }
    ],
    "hook": "집 욕실의 수도꼭지에서 물이 계속 새서 집주인에게 연락해요",
    "setting": "해외에서 빌린 집의 욕실과 거실",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬며 쳐다보는데, 먼저 말을 걸어 양해를 구하는 순간부터 연습해 볼까요?

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어지는 에피소드로, 같은 비행기에서 승무원에게 아기에게 필요한 도움을 요청하는 상황도 해 볼까요? 예를 들어 분유에 쓸 따뜻한 물을 부탁하고, 아기를 달래는 데 도움이 될 만한 것이 있는지 물어보는 장면이에요. 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 중요하게 여기며, 불편하면 짧게 말하지만 상대의 설명은 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 집에서 무엇이 고장 났고, 집주인에게 어떤 도움을 요청하고 싶으세요? 예를 들면 온수가 안 나오거나, 창문이 닫히지 않는 상황처럼요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 이번 주 안에 수리해 달라고 집주인에게 부탁하는 상황으로 정할게요.

이어서 동네 모임에서 처음 만난 사람에게 먼저 인사하고, 사는 곳이나 모임에 온 이유를 간단히 이야기하는 상황도 해 볼까요? 지금 정한 집주인과의 대화만 만들어도 좋아요.

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
        "role": "40대 후반의 집주인. 집의 문제를 차분히 확인하며 수리 일정과 비용을 먼저 따져 본다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃 주민. 처음 만난 사람에게 편하게 말을 걸고 주말 취미 이야기를 즐긴다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater and trousers, concerned and listening with a measured posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 실내 온도 기록을 제시하려 한다. 집주인 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정을 잡거나 요청을 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 대화를 시작한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물어보며 이야기를 이어가려 한다. 두 사람이 얼마나 가까워지거나 어떤 취미 이야기를 나누게 될지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "첫 이웃 인사"
      }
    ],
    "hook": "해외에서 고장 난 난방을 이번 주 안에 고쳐 달라고 집주인에게 부탁해요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "낯선 동네의 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 직원에게 커피 머신의 기본 사용법과 세척 방법을 묻는 상황을 이어서 넣어 볼까요? 첫 번째 교환 요청이 어떻게 끝났는지와 관계없이 연습할 수 있어요. 지금 기계 문제 상황만 유지해도 좋아요.

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
        "details": "다른 날 같은 가전 매장에서 Noah를 만나 우유 거품을 내는 법을 물어본다. 나는 우유 거품을 만드는 방법과 필요한 조작을 설명해 달라고 하려 한다. 첫 번째 에피소드에서 교환에 성공했는지, 어떤 기계를 가지고 있는지는 정하지 않으며 실제 대화에서 상황에 맞는 설명과 반응이 이어진다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 필요한 조작을 설명해 달라고 하려 한다. 이 방문은 첫 에피소드의 교환 결과와 무관하게 이루어지며, 실제로 어떤 설명이나 도움을 받을지는 대화에서 정한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 사용 방법을 설명해 달라고 하려 한다. Noah가 알려 주는 내용과 실제 청소 결과는 플레이에서 정한다.",
        "number": 5,
        "preview": "같은 매장 직원에게 커피 머신을 청소하는 법을 묻고 세척제 양을 확인하고 싶어요",
        "title": "세척제 양 묻기"
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

이어서 점심시간에 새 동료에게 취미를 물으며 친해지는 상황도 해 볼까요? 첫 팀 회의에서 경력과 맡을 일을 소개하는 에피소드만 만들어도 좋아요.

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
        "name": "Maya",
        "position": 1,
        "role": "30대 초반의 팀 동료. 회의에서는 업무 내용을 차분히 듣고, 점심시간에는 상대가 먼저 꺼낸 가벼운 이야기에 자연스럽게 반응한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, light blue blouse and charcoal cardigan, slightly nervous but welcoming with relaxed shoulders, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya와 팀원들이 새로 합류한 나에게 경력과 맡을 일을 소개해 달라고 한다. 나는 경력직이지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 앞으로 맡을 업무를 영어로 설명하려 한다. 소개가 매끄럽게 진행되는지나 Maya의 반응은 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 점심을 먹으며 대화를 시작한다. 나는 업무 이야기는 피하고 취미 이야기를 먼저 꺼내고 싶다. 내가 좋아하는 취미를 말한 뒤 Maya의 취미도 물으며 업무와 관계없는 대화를 이어가려 한다. Maya가 어떤 취미를 말하거나 대화가 어떻게 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내며 동료와 대화해요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 시작하기"
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
        "name": "Olivia",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새로 합류한 사람의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 팀 동료. 회의에서는 필요한 말을 간결하게 하고, 점심시간에는 상대가 먼저 말을 걸면 편하게 대화를 이어 간다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart charcoal blazer over a light shirt, slightly nervous but welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Olivia"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Olivia가 새로 합류한 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 경력직으로서 이전 업무 경험과 새 팀에서 맡을 일을 영어로 설명하려 하지만 영어가 서툴러 긴장한 상태다. 말이 막히거나 표현을 고쳐야 하는 상황에서도 내가 직접 소개를 이어 가며 필요한 내용을 전달하려 한다. Olivia가 얼마나 쉽게 이해하거나 어떤 질문을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹게 된다. 나는 먼저 취미 이야기를 꺼내고, 내가 좋아하는 활동을 말한 뒤 Daniel의 취미도 물으며 대화를 이어 가려 한다. 첫 팀 회의에서 어떤 반응이 있었는지나 두 사람이 이미 친해졌는지는 정하지 않으며, 실제 대화에서 그에 따라 말을 꺼내는 방식과 Daniel의 반응이 달라진다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 회사 식당",
    "title": "새 팀에서 첫 대화"
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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새로 합류한 사람의 경력과 맡을 일을 차분히 확인하고, 설명이 막히면 기다려 준다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 잘 알고 있으며, 질문을 받으면 직접 보여 주면서 설명한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, attentive and slightly encouraging while sitting upright, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 맡게 될 업무를 팀에 설명하려 한다. Maya가 질문하거나 얼마나 이해하는지는 실제 대화에서 정하며, 소개가 순조롭게 끝났다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "사무실에서 나는 Daniel에게 복사기 사용법을 영어로 묻는다. 양면 복사를 해야 해서 복사기의 설정 방법을 설명해 달라고 부탁하려 한다. Daniel이 어떤 방식으로 설명하거나 도와주는지는 실제 대화에서 정하며, 양면 복사가 성공했다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 양면 복사를 하려고 동료에게 복사기 사용법을 물어요.",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 사무실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 자리로 돌아와 동료에게 회사 내부 업무 시스템 사용법을 묻는 상황은 어때요? 영어가 서툴러도 지금 맡은 일을 시작하려면 필요한 도움을 요청하고, 모르는 부분을 다시 확인해야 하는 장면이에요. 첫 팀 회의에서 자기소개하는 에피소드와 이 상황을 함께 만들 수도 있고, 첫 에피소드만 만들어도 좋아요.

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
        "name": "Daniel",
        "position": 1,
        "role": "40대 초반의 팀 리더. 새로 온 팀원의 경력과 담당 업무를 차분히 듣고, 질문이 있으면 구체적으로 되묻는다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 업무를 친절하게 설명하지만, 복사기 사용법을 정확히 확인하려 한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, light blue shirt and charcoal cardigan, attentive with a calm encouraging expression and an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 경력과 담당 업무를 바탕으로 말한다. Daniel은 팀 리더로서 소개를 듣고 필요한 내용을 물을 수 있다. 내가 얼마나 잘 설명하는지, Daniel이 어떻게 반응하는지, 업무를 어떻게 정하게 되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "첫 팀 회의가 끝난 뒤 사무실에서 복사기를 사용해야 하는 나는 동료 Sophie에게 종이를 양면으로 복사하는 방법을 물어보려 한다. 복사기 앞에서 필요한 기능을 영어로 설명하고 사용법을 확인하려 한다. Sophie가 어떤 방식으로 설명하는지, 내가 바로 이해하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 복사기를 쓰다가 동료에게 양면 복사 방법을 물어봐요.",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
    "title": "새 팀에서 시작하기"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and dark blazer, attentive with a reassuring but serious expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 시작하는 순간이다. 나는 경력직으로 지금까지 해 온 일을 간단히 설명하고, 새 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있어 말이 막히거나 표현을 고쳐 말할 수 있다. Maya는 내 소개를 듣고 경력과 담당 업무가 무엇인지 필요한 부분을 되물을 수 있다. 내가 얼마나 잘 설명하는지, Maya가 어떻게 받아들이는지, 실제로 맡을 일이 어떻게 정해지는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 자기소개"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 차분하게 상황을 확인하며 필요한 정보를 주고받는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, casual jacket, tense but composed with one hand slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "고속도로에서 내 차와 Maya의 차가 사고가 난 직후다. 나는 상대 운전자와 사고 상황을 확인하고 연락처와 보험 정보를 서로 교환하려 한다. 사고의 책임이 누구에게 있는지, 상대가 정보를 바로 제공할지는 정하지 않는다. 실제 대화에서 나는 필요한 정보를 영어로 요청하고, Maya의 반응에 따라 사고 처리를 이어 간다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받으려 해요.",
        "title": "사고 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환하려고 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 힘드셨겠어요. 그 상황에서 영어로 어떤 대화를 해보고 싶으세요?

예를 들면, **싸운 다음 아내에게 먼저 말을 걸어 내 생각을 설명하고 육아 분담을 다시 정하는 장면**으로 해볼 수 있어요. 원하는 목표가 사과인지, 서운했던 점 설명인지, 구체적인 역할 나누기인지 알려주세요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련된 어떤 상황에서 영어로 대화해 보고 싶으세요?  
예를 들면 비행기 결항 문의, 우산을 빌리기, 비 오는 날 길을 묻기처럼 구체적인 장면을 말해 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편해도 고함치지 않고 상대의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, seated upright and slightly turned, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 소리를 지르지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 상황을 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 쳐다봐요",
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

같은 비행기에서 승무원에게 아기를 달랠 수 있도록 도움을 요청하는 상황은 어때요? 따뜻한 물이나 조용한 공간처럼 필요한 것을 설명하고 부탁하는 장면이에요. 지금 정한 옆자리 승객 에피소드만 유지해도 좋아요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

이어 같은 매장에서 직원에게 커피 머신의 기본 사용법과 관리 방법을 묻는 상황도 해볼까요? 교환이 되었는지와 관계없이, 매장 체험 코너에서 직접 확인하며 질문하는 장면이에요. 지금 말씀하신 누수와 교환 요청 에피소드만 만들어도 좋아요.

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
        "name": "Daniel",
        "position": 1,
        "role": "30대 초반의 매장 직원. 고객의 설명을 차분히 듣고 영수증과 제품 상태를 확인한다."
      }
    ],
    "cover": "A man in his early thirties, short dark hair, green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, mustard background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "커피 머신을 산 다음 날 물이 새는 것을 발견했다. 나는 영수증과 누수 장면을 찍은 영상을 가지고 매장에 찾아가 제품에 문제가 생겼다고 설명하고 교환을 요청하려 한다. Daniel은 화내지 않고 내 설명과 자료를 확인한다. 교환이 가능한지와 실제 대화의 결과는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
        "title": "누수 난 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 산 매장의 고객 응대 공간",
    "title": "커피 머신 교환 요청"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 자주 겪는 장면부터 골라 구체적으로 연습해 볼까요?

예를 들면 공항에서 입국 심사에 답하기, 집주인에게 집 문제를 설명하기, 마트에서 원하는 물건을 찾기, 병원에서 증상을 설명하기, 직장에서 동료에게 도움을 요청하기 같은 상황이 있어요.

가장 먼저 연습하고 싶은 장면이 무엇인가요?

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
        "role": "30대 후반의 아파트 관리 직원. 입주자의 설명을 차분히 듣고 필요한 정보를 확인한 뒤 처리 방법을 안내한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, neat beige blouse and dark trousers, attentive with a concerned expression and an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 생활을 시작한 뒤 아파트 방의 난방이 갑자기 작동하지 않는다. 나는 아파트 관리 사무실에 찾아가 문제가 언제부터 시작됐는지, 방 안의 다른 시설은 어떤지 설명하고 점검을 요청하려 한다. Maya가 바로 수리 일정을 잡거나 다른 해결책을 제시하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "새로 사는 집의 난방이 작동하지 않아 관리 사무실에 찾아가 설명해요.",
        "title": "집 문제 알리기"
      }
    ],
    "hook": "새로 사는 집의 난방이 작동하지 않아 관리 사무실에 찾아가 설명해요",
    "setting": "해외 아파트의 관리 사무실",
    "title": "해외 생활 첫 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래려고 계속 애쓰고 있지만 울음이 멈추지 않아 주변 시선이 신경 쓰이는 상황이네요. 옆자리 승객이 고함치지는 않고 한숨을 쉬며 쳐다보는데, 먼저 말을 걸어 조금만 이해해 달라고 부탁하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 기내에서 승무원에게 아기를 달래는 데 필요한 도움을 요청하는 상황도 해볼까요? 예를 들면 분유에 쓸 따뜻한 물이나 잠시 이동할 수 있는 곳을 물어보는 장면이에요. 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 승객. 조용히 쉬는 시간을 소중히 여기지만, 상대가 애쓰고 있다는 설명을 들으면 차분히 반응한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired but restrained and glancing toward someone beside her, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화를 내거나 고함치지는 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 진정시키려고 애쓰고 있다는 점을 설명하고, 나도 곤란한 상황이라는 것을 전하며 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주거나 어떤 반응을 보일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저를 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객이 계속 쳐다봐요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인과 수리 얘기하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 요청하고 싶으세요? 예를 들면 물이 새서 수리를 부탁하거나, 난방이 안 돼서 빠른 방문을 요청하는 상황이에요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

두 번째는 동네 모임에서 처음 만난 사람들에게 인사하는 상황이네요. 어떤 모임인지, 그리고 자기소개만 할지 취미나 동네 생활에 관한 짧은 대화까지 이어 가고 싶은지 알려 주세요.

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
        "role": "40대 초반의 집주인. 집의 문제와 수리 요청을 차분히 확인하고 일정에 관해 구체적으로 대화한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게 예의 있게 인사하고 주말 취미에 관심을 보인다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual button-up shirt and cardigan, concerned and listening with a slight frown, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 상태를 보여 줄 수 있는 사진과 온도 기록을 근거로 제시하려 한다. 이번 주 안에 수리해 달라고 집주인 Daniel에게 부탁하려 한다. Daniel이 수리 일정을 잡거나 요청을 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집 난방이 고장 나서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "해외의 동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 간단히 나를 소개하고 주말에 자전거 타기를 좋아한다고 말한 뒤, Maya의 주말 취미도 물으며 대화를 이어 가려 한다. Maya가 어떤 취미를 이야기하거나 대화가 얼마나 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "이웃과 첫인사"
      }
    ],
    "hook": "해외 생활 중 집주인에게 난방 수리를 부탁하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "해외 생활의 두 만남"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 커피 머신을 비교해 보고, 직원에게 집에서 쓰기 편한 모델을 추천해 달라고 묻는 상황은 어때요? 지금 에피소드의 결과와 관계없이 연습할 수 있어요.

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
        "details": "첫 번째 에피소드에서 교환이 성공했는지와 관계없이, 다른 날 같은 가전 매장에서 Noah를 만난다. 나는 우유 거품을 내는 방법을 물어보고, 필요한 순서와 주의할 점을 설명해 달라고 한다. Noah가 어떤 제품이나 방법을 안내할지는 실제 대화에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 커피 머신을 직접 사용해 보며 우유 거품을 만드는 방법과 순서를 이해하려 한다. 첫 에피소드에서 교환이 이루어졌는지와 관계없이 이 장면이 시작되며, Noah가 얼마나 자세히 도와주는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 커피 머신 체험 코너",
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

최대 5화까지라 에피소드를 더 넣을 수 없어요.

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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 청소 방법을 설명해 달라고 하려 한다. 이전 에피소드의 결과는 가정하지 않는다.",
        "number": 5,
        "preview": "커피 머신을 청소하는 법과 세척제 양을 물어보고 싶어요",
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

## 3번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.

이어서 점심시간에 동료에게 취미를 물으며 친해지는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 구성원이 경력과 맡을 일을 설명할 때 차분히 듣고 필요한 내용을 물어본다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "30대 초반의 동료 직원. 업무 밖의 대화에서는 편안하게 반응하지만 상대가 말할 틈도 자연스럽게 살핀다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal trousers, calm but attentive with an encouraging posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya를 포함한 팀원들 앞에 선다. 경력직으로 합류한 나는 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려고 한다. 영어가 서툴러 긴장하고 있으며, 준비한 내용을 더듬더라도 내 경험과 담당 업무를 전달하려 한다. Maya가 어떤 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Leo"
        ],
        "details": "회사 식당에서 Leo와 식사하며 먼저 업무 이야기가 아닌 취미 이야기를 꺼내려 한다. 나는 내 취미나 예전 활동을 간단히 말한 뒤 Leo의 취미도 물으며 편하게 대화를 이어가고 싶다. 업무 주제는 피하고 싶지만, Leo가 어떤 취미를 말하거나 대화를 어디로 이끌지는 정하지 않는다. 두 사람이 친해지는 결과도 미리 정하지 않으며, 실제 대화에서 사용자의 말에 따라 반응과 대화의 흐름을 정한다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 업무 말고 취미 이야기를 꺼내요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 점심시간의 회사 식당",
    "title": "새 팀에서 말하기"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡은 일을 차분히 듣고, 설명이 막히면 구체적으로 다시 물어본다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 팀 동료. 점심시간에는 편안한 분위기로 대화하려 하며, 상대의 취미를 들으면 자신의 이야기도 나눈다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, simple navy blazer over a light blouse, attentive and slightly encouraging with a composed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya에게 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 준비한 경력과 담당 업무 내용을 바탕으로 간단하고 분명하게 말하려 한다. Maya가 어떤 질문을 하거나 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹으며 먼저 취미 이야기를 꺼내고 싶어 한다. 자신의 취미를 말한 뒤 Daniel의 취미도 물으며 업무 밖의 대화를 이어가려 한다. 첫 팀 회의에서 실제로 어떤 인상을 주고 어떤 관계가 되었는지는 미리 정하지 않으며, Daniel의 반응과 대화의 흐름은 실제 대화에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 첫인사"
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
        "name": "Alex",
        "position": 1,
        "role": "30대 중반의 팀 동료. 새로 온 사람의 소개를 차분히 듣고 맡은 일을 구체적으로 확인한다."
      }
    ],
    "cover": "A man in his mid thirties, short dark hair, light blue shirt and charcoal cardigan, attentive with a calm encouraging expression and relaxed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Alex를 포함한 팀원들 앞에 선다. 경력직으로 합류한 나는 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴고 긴장한 상태라 말을 고르며 소개하고, Alex가 내 경력과 담당 업무를 이해할 수 있도록 설명하려 한다. Alex가 어떤 반응을 보이거나 얼마나 질문하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Alex"
        ],
        "details": "사무실에서 복사기를 사용하려는데 양면 복사를 해야 한다. 나는 복사기 사용법을 잘 몰라 Alex에게 영어로 도움을 요청하고, 양면으로 복사하는 방법을 물어보려 한다. 필요한 문서와 복사할 부수는 내가 대화 중 설명할 수 있으며, Alex가 어떤 방식으로 알려 주는지와 복사가 제대로 되는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 회의실과 사무실",
    "title": "새 회사의 첫날"
  }
]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 사무실에서 동료에게 업무 자료를 어디서 확인하고 공유해야 하는지 묻는 상황은 어때요? 새로 맡은 일을 시작하려는데 자료 위치와 팀의 공유 방식을 알아내야 하는 장면이에요. 첫 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Alex",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하고, 설명이 부족하면 구체적으로 다시 묻는다."
      },
      {
        "name": "Jamie",
        "position": 2,
        "role": "20대 후반의 동료. 사무실의 일상적인 업무 방법을 잘 알고 있으며, 질문을 받으면 자신이 아는 만큼 설명한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal blazer, slightly nervous but welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 경력과 업무 내용을 바탕으로 말하고 팀 리더의 질문에도 답하려 한다. Alex가 얼마나 이해하거나 도와줄지는 실제 대화에서 정한다. 자기소개가 순조롭게 끝났는지, 맡은 일이 최종적으로 정해졌는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Jamie"
        ],
        "details": "첫 팀 회의가 있는 해외 회사 사무실에서 복사기 앞에 서서 동료 Jamie에게 양면 복사 방법을 물으려 한다. 나는 복사기의 양면 복사 기능을 어떻게 사용하는지 영어로 묻고, 필요한 경우 내가 하려는 복사 작업을 설명하려 한다. Jamie가 바로 방법을 알려 주는지, 복사기가 실제로 제대로 작동하는지는 실제 대화에서 정한다. 첫 회의에서 자기소개를 잘했거나 맡은 일을 성공적으로 시작했다고 가정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 사무실 복사 공간",
    "title": "새 팀에서 첫날"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 안 되는 부분은 구체적으로 다시 묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 시작하는 상황이다. 나는 경력직으로 합류했으며, 지금까지 해 온 일과 새 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러서 긴장하고 있고, 준비한 내용을 완벽하게 말하지 못하더라도 내 경력과 담당 업무가 무엇인지 전달하려 한다. Maya는 팀 리더로서 자기소개를 듣고 필요한 부분을 물을 수 있다. 실제 대화에서 Maya가 얼마나 이해하고 어떤 반응을 보이는지는 내가 하는 말에 따라 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
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
        "name": "Daniel",
        "position": 1,
        "role": "40대 초반의 운전자. 사고 직후라 긴장했지만 필요한 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, plain gray jacket, tense and alert with raised hands, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로 갓길에 사고 차량을 세운 직후다. 나는 상대 운전자 Daniel과 연락처, 운전면허와 차량 정보, 보험 회사와 보험 증권 정보를 서로 확인하고 교환하려 한다. 사고의 책임이나 과실을 현장에서 확정하지 않으며, 경찰이나 보험사에 신고할지는 정하지 않는다. Daniel이 어떤 정보를 내놓고 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 주고받아요",
        "title": "사고 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 연락처"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 영어로는 싸운 뒤 아내와 다시 이야기하면서, 서로의 입장을 설명하고 육아 분담에 대해 조율하려는 장면을 연습해 볼까요?

아내에게 **사과하고 싶은지**, 아니면 **내가 힘들었던 점을 설명하고 앞으로의 역할을 정하고 싶은지** 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하시려던 건가요? 장소와 누구와 무슨 일을 해결하고 싶은지 편하게 이어서 적어 주세요.

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
        "role": "40대 초반의 승객. 불편하면 한숨을 쉬거나 쳐다보지만 고함치지 않고, 상대의 설명을 들으며 반응한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울리고 있다. 옆자리의 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 어떤 반응을 보이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행 중 환승 공항 안내 데스크에서 직원에게 아기와 함께 갈 수 있는 가족 화장실 위치를 묻는 상황은 어떨까요? 지금 만든 비행기 에피소드만 유지해도 좋아요.

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

이어 매장의 체험 코너에서 다른 커피 머신의 기능과 사용법을 직원에게 물어보는 상황도 해볼까요? 지금 정한 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 누수 영상을 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green store uniform, calm and attentive with an apologetic expression, standing upright with relaxed shoulders, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 이 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 내 설명과 자료를 차분히 확인한다. 교환이 가능한지, 어떤 절차가 필요한지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 산 매장 고객 상담대",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 자주 겪는 장면으로 구체화해 볼게요. 예를 들면:

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 상황
- 마트에서 원하는 물건의 위치나 성분을 묻는 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 직장이나 학교에서 처음 만난 사람에게 자기소개하는 상황
- 공공기관에서 서류나 절차를 문의하는 상황

어떤 장면을 가장 먼저 연습해 보고 싶으세요?

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
        "role": "30대 후반의 약사. 손님의 증상을 차분히 확인하고 복용 중인 약이나 알레르기가 있는지 먼저 묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, pale green cardigan over a white shirt, attentive with a gently concerned expression and an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 생활하던 중 감기 증상이 생겨 약국에 들어온다. 목이 아프고 콧물이 나며 밤에 기침이 있지만, 증상을 영어로 자연스럽게 설명하기 어렵다. 나는 처방전 없이 살 수 있는 약이 있는지 묻고, 졸린 약은 피하고 싶다는 조건을 말하려 한다. Maya는 증상과 복용 중인 약, 알레르기 여부를 확인할 수 있다. 어떤 약을 추천받거나 증상이 해결되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "감기 증상이 생겨 약국에서 약사에게 증상과 원하는 조건을 설명해요",
        "title": "약국에서 감기약"
      }
    ],
    "hook": "감기 증상 때문에 약국에서 약사에게 도움을 요청해요",
    "setting": "해외의 동네 약국",
    "title": "해외 생활 첫 도움"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변의 시선도 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보지만 화를 내지는 않고, 먼저 말을 걸어 조금만 이해해 달라고 부탁하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 같은 비행기에서 승무원에게 아기를 잠깐 안심시킬 수 있는 도움을 요청하는 상황도 해볼까요? 예를 들면 기내에서 아기에게 필요한 물이나 조용한 자리를 부탁하는 장면이에요. 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 승객. 조용히 쉬는 시간을 소중히 여기며 불편해도 화내지 않고 상대의 설명을 들어본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft gray sweater, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 말하거나 요청하고 싶으세요?  
예를 들면 **물이 새서 수리를 부탁하기**, **난방이 안 돼서 빠른 점검을 요청하기** 같은 장면이에요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

이제 동네 모임에서 인사하는 상황을 정해 볼게요. 어디에서 열리는 어떤 모임이고, 누구에게 어떤 말을 건네고 싶으세요?  
예를 들어 처음 만난 사람에게 자기소개를 하고, 모임에 참여하게 된 이유나 관심사를 짧게 말하는 장면이에요.

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
        "role": "40대 초반의 집주인. 집 수리 요청을 받으면 문제와 근거를 확인하며, 구체적인 일정과 상황을 들으면 대응 방법을 생각한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 먼저 가볍게 말을 걸고, 주말에 하는 일을 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual sweater and trousers, concerned with a slightly tense expression and attentive posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 지내는 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 보여 주는 사진과 온도 기록을 가지고 있다. Daniel에게 고장 상황과 불편을 설명하고, 이번 주 안에 수리를 해 달라고 부탁하려 한다. Daniel이 바로 수리 일정을 잡거나 요청을 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya와 대화를 시작한다. 나는 주말 취미로 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 자연스럽게 대화를 이어 가려 한다. Maya가 어떤 반응을 보이고 대화가 어떻게 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말하며 주말 이야기를 꺼내요",
        "title": "첫 인사"
      }
    ],
    "hook": "난방이 고장 난 집에서 집주인에게 수리를 부탁하고 동네 모임에서 이웃에게 먼저 말을 걸어요",
    "setting": "해외의 임대 주택과 주민들이 모이는 동네 모임 공간",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 직원에게 다른 커피 머신의 사용법을 물어보는 상황은 어때요? 교환이 됐는지와 관계없이, 매장에 있는 시연 제품으로 원하는 커피를 만드는 방법과 관리법을 묻는 장면이에요. 지금 생각한 상황에 조건을 덧붙여도 좋아요.

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
        "details": "첫 번째 방문과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, Noah의 설명을 들으며 필요한 방법을 확인하려 한다. 첫 번째 방문에서 커피 머신을 교환했는지, 어떤 결과가 있었는지는 정하지 않는다. 우유 거품을 내는 방법과 Noah의 반응은 실제 대화에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 필요한 순서를 이해하려 한다. 첫 번째 에피소드의 교환 결과와 관계없이 체험 코너에 간 상황이며, 우유 거품을 잘 만들게 되는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
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

## 3번째 상한과 삭제 뒤 재추가
질문: 에피소드를 하나 더 넣고 싶어요.

최대 5화까지라 에피소드를 더 넣을 수 없어요.

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
        "details": "같은 매장의 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 청소 방법을 설명해 달라고 하려 한다. 세척 방법을 안내받을 수 있는지는 실제 대화에서 정한다.",
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
