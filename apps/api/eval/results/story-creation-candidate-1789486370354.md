# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:32:50.354Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 04577db61985ec2d30b49038a0b9b4b24a2c567cfbe7f7bb1501964d1222be30
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

이어서 점심시간에 동료에게 먼저 말을 걸어 취미를 묻고 친해지는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Jordan",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고 필요한 경우 짧게 질문한다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "20대 후반의 동료. 업무 밖의 가벼운 대화를 편하게 이어 가며 상대의 취미에도 관심을 보인다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal blazer, attentive with a calm encouraging expression and relaxed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Jordan"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Jordan과 팀원들 앞에 서서 내 경력을 영어로 소개하고, 앞으로 맡게 될 일을 설명하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 말하되 모르는 표현이 나오면 다른 말로 설명하거나 질문할 수 있다. Jordan이 얼마나 질문하거나 도와줄지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "회사 식당에서 Mia에게 먼저 말을 걸어 업무 이야기는 피하고 취미 이야기를 꺼내려 한다. 내 취미와 관련된 이야기를 먼저 하고 Mia의 취미도 물으며 업무 밖의 대화를 이어 가고 싶다. 영어가 서툴러 표현이 막힐 수 있지만 쉬운 말로 바꾸어 말하거나 되물을 수 있다. Mia가 어떤 취미를 말하고 대화가 어떻게 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 말을 걸고 업무와 다른 취미 이야기를 나눠요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 말 걸기"
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
        "role": "30대 중반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 질문한다."
      },
      {
        "name": "Liam",
        "position": 2,
        "role": "20대 후반의 팀 동료. 점심시간에 편하게 대화하지만 처음에는 상대가 먼저 말을 걸어 주기를 기다린다."
      }
    ],
    "cover": "A woman in her mid-thirties, shoulder-length dark hair, smart casual blazer over a blouse, slightly nervous but welcoming with hands loosely clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 새 팀원들에게 나를 소개한다. 영어가 서툴러 긴장한 상태지만, 지금까지의 경력과 앞으로 맡을 일을 영어로 설명하려 한다. Maya는 팀 리더로서 내가 말하는 내용을 듣고 경력이나 담당 업무에 대해 필요한 질문을 할 수 있다. 소개가 매끄럽게 끝나거나 모두가 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Liam"
        ],
        "details": "회사 식당에서 점심을 먹으며 Liam과 처음으로 편하게 대화한다. 나는 먼저 취미 이야기를 꺼내고, 내가 좋아하는 일을 말한 뒤 Liam의 취미도 물어보며 대화를 이어가려 한다. 첫 회의에서 서로 어떤 인상을 받았는지나 이미 친해졌다고 정하지 않으며, 실제 대화의 흐름에 따라 말을 꺼내는 방식과 Liam의 반응이 달라질 수 있다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심시간 대화"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 시작하기"
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
        "role": "30대 중반의 팀 동료. 새로 온 사람의 소개를 차분히 듣고, 맡은 일과 관련된 질문에는 구체적으로 답한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder length dark hair, smart casual blouse and cardigan, slightly nervous but welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya를 비롯한 팀원들 앞에 선다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태에서 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. Maya가 소개를 어떻게 받아들이거나 어떤 질문을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "사무실에서 복사기를 사용하려는데 양면 복사 설정을 찾지 못한다. 나는 동료 Maya에게 양면으로 복사하는 방법을 영어로 물어보려 한다. Maya가 직접 설명하거나 도와줄지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 사무실 복사기 앞",
    "title": "새 팀에서의 첫날"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신 회의가 끝난 뒤 동료에게 팀의 업무 방식과 사용하는 협업 도구를 묻는 상황은 어때요? 새 팀에서 맡을 일을 이해하려고 질문하는 장면이에요. 이 상황으로 해보고 싶으세요, 아니면 다른 업무 장면을 원하세요?

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
        "name": "Maya",
        "position": 1,
        "role": "30대 중반의 프로젝트 코디네이터. 처음 만난 팀원의 자기소개를 차분히 듣고, 업무를 물으면 실제 절차를 설명한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder length dark hair, light blue blouse and charcoal cardigan, attentive with a calm encouraging expression and slightly tense posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로서 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴고 긴장한 상태에서 내가 해 온 일과 맡을 업무를 설명하는 것이 목표다. Maya는 새 팀 동료로 회의에 함께 있으며, 내 소개에 어떻게 반응하고 어떤 질문을 할지는 실제 대화에서 정한다. 자기소개가 매끄럽게 끝나거나 팀이 나를 이해했다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "사무실에서 복사기를 사용하려는데 양면 복사 방법을 모르겠다. 나는 동료 Maya에게 양면으로 복사하는 방법을 영어로 물어보고, 필요한 설정이나 순서를 이해하려 한다. 복사기가 바로 작동하거나 Maya의 설명을 한 번에 이해한다고 미리 정하지 않으며, 실제 대화에서 질문과 설명이 이어지는 방식으로 진행한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 사무실 복사기 앞",
    "title": "새 회사에서 말하기"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고 경력과 맡을 일을 구체적으로 물어본다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, charcoal blazer over a light blue shirt, attentive and encouraging with a composed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 이전 경력과 새 팀에서 맡을 업무를 간단히 설명하려 한다. Maya가 어떤 추가 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 상대 운전자. 사고 직후 긴장했지만 감정을 가라앉히고 필요한 정보를 차분히 확인한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed with one hand raised to pause the conversation, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 막 발생한 뒤 갓길에서 Daniel과 마주한다. 나는 상대 운전자와 서로 연락처와 보험 정보를 교환하려 한다. 사고 상황을 설명하고 필요한 정보를 정확히 확인해야 하며, 감정적으로 다투거나 사고의 책임을 미리 인정하지 않고 대화를 이어가려 한다. Daniel이 어떤 태도를 보이고 정보 교환이 어떻게 진행되는지는 실제 플레이에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 주고받으려 해요",
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

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 이 상황은 싸운 다음 아내와 다시 이야기하며 서로의 입장을 설명하고 육아 분담을 조율하려는 장면으로 연습해 볼까요?

예를 들면, 오늘 저녁 아이를 재운 뒤 아내에게 먼저 말을 걸어 어제 다툰 이유를 풀어 설명하고, 앞으로 육아를 어떻게 나눌지 이야기하는 순간이에요. 어떤 말을 하고 싶은지, 아니면 사과·감정 설명·역할 조율 중 무엇이 가장 중요한지 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련해 어떤 상황에서 영어로 대화해 보고 싶으세요? 예를 들면 비행기 결항, 우산을 빌리기, 비 오는 날 길을 묻기처럼 구체적인 장면을 말해 주세요.

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
        "role": "40대 초반의 편집자. 불편하면 짧게 반응하지만 상대가 사정을 설명하면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. Emma는 옆자리에서 한숨을 쉬고 우리를 바라보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 우리를 바라봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서 이어지는 다른 상황으로, 호텔 아침 식당에서 비행기 옆자리 승객을 다시 만나 서로의 여행이나 관심사를 이야기해 보는 에피소드는 어때요? 첫 비행기 대화가 어떻게 끝났는지와 관계없이 시작할 수 있어요. 지금 에피소드만 유지해도 좋아요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 커피 머신 교환을 요청하는 상황이네요. 직원은 화내지 않고 차분하게 대응하는 것으로 둘게요.

이어서 같은 매장에서 직원에게 새 커피 머신의 사용법이나 관리 방법을 묻는 상황도 해볼까요? 교환이 실제로 이루어졌는지는 정하지 않고, 지금 교환 요청 장면만 연습해도 좋아요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 누수 상황과 교환 요청을 차분히 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 영상을 가지고 매장에 방문해 제품에 문제가 있다는 것을 설명하고 교환을 요청하려 한다. Mia는 화내지 않고 차분하게 상황과 자료를 확인한다. 교환이 실제로 이루어지는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 구입한 가전 매장",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면 중 하나를 골라 영어로 풀어 보는 방식이 좋아요.

예를 들면:
- 집을 구하며 집주인이나 중개인에게 조건을 묻기
- 마트에서 원하는 물건의 위치나 성분 묻기
- 병원이나 약국에서 증상 설명하기
- 직장이나 학교에서 자기소개하기
- 이웃에게 소음이나 생활 규칙에 대해 말하기
- 관공서에서 서류나 체류 문제를 문의하기

가장 먼저 연습하고 싶은 상황은 무엇인가요?

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
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣고 집 상태와 필요한 조치를 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, beige sweater and dark trousers, attentive with a concerned expression and one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새 아파트에 입주한 첫날 저녁이다. 난방이 작동하지 않아 방이 춥고, 나는 집주인 Maya에게 현재 상태와 언제부터 문제가 있었는지 설명하려 한다. 난방을 확인하거나 수리를 요청하고, 필요한 경우 임시로 할 수 있는 방법도 묻고 싶다. Maya가 바로 해결해 주는지, 다른 방법을 제시하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "새 집에 들어왔는데 난방이 작동하지 않아요",
        "title": "난방 문제"
      }
    ],
    "hook": "새 집에 들어왔는데 난방이 작동하지 않아서 집주인에게 연락해요",
    "setting": "해외에서 처음 입주한 아파트",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데 주변 승객의 반응이 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간에 먼저 말을 걸어 보며, 아기를 달래고 있다는 점을 설명하는 장면으로 해볼까요? 무엇을 말하고 싶은지도 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어지는 에피소드로, 같은 비행기에서 승무원에게 아기에게 필요한 도움을 요청하는 상황도 해볼까요? 예를 들면 분유에 쓸 따뜻한 물이나 조용히 이동할 수 있는 공간을 부탁하는 장면이에요. 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 중요하게 여기며 불편해도 화내기보다 표정과 짧은 말로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래기 위해 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하고 상황이 어떻게 풀리는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 집에서 무엇이 고장 났고, 집주인에게 어떤 도움을 요청하고 싶으세요? 예를 들면 온수가 안 나오거나, 난방이 고장 난 상황처럼요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 문제는 사진과 온도 기록을 보여 주면서 이번 주 안에 수리해 달라고 집주인에게 요청하는 상황으로 할게요.

이어서 동네 모임에서 처음 만난 사람들에게 자기소개하고 인사하는 상황도 해 볼까요? 이름과 사는 곳을 말하고, 상대에게도 간단히 물어보는 장면이에요. 지금 정한 난방 수리 에피소드만 만들어도 좋아요.

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
        "role": "40대 후반의 집주인. 수리 요청의 내용을 차분히 확인하고 일정과 비용 문제를 현실적으로 따진다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 가볍게 인사하고 주말 취미를 물으며 자연스럽게 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-up shirt and cardigan, concerned and listening with a measured posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 지내는 집의 난방이 고장 나 실내 온도가 낮아지고 있다. 나는 난방 문제를 설명하고, 고장 난 상태를 보여 주는 사진과 온도 기록을 근거로 제시하려 한다. 이번 주 안에 수리해 달라고 집주인 Daniel에게 부탁한다. Daniel이 언제 수리할 수 있는지, 요청을 어떻게 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 요청해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고, 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물으며 대화를 이어 간다. 두 사람이 얼마나 가까워지거나 대화가 잘 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃과 주말 취미 이야기를 나눠요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외에서 고장 난 난방을 고쳐 달라고 집주인에게 부탁하고 동네 모임에서 새 이웃과 인사해요",
    "setting": "해외 주택과 동네 주민 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 상황도 넣어 볼게요. 매장 체험 코너에서 직원에게 커피 머신의 기본 사용법과 세척 방법을 묻는 에피소드는 어때요? 첫 에피소드의 교환 결과와 관계없이 연습할 수 있어요. 지금 가진 커피 원두나 사용 중인 컵에 맞는 설정도 함께 물어보는 상황으로 할까요?

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
        "details": "첫 에피소드와 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 우유 거품을 만들 때의 순서와 주의할 점을 이해하려 한다. 첫 에피소드에서 커피 머신을 교환했는지, 어떤 제품을 갖고 있는지는 정하지 않는다. Noah가 실제로 얼마나 설명하거나 도와주는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 우유 거품을 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 내는 방법과 필요한 순서를 알고 싶어 한다. 첫 번째 에피소드에서 커피 머신을 교환했는지, 교환 요청이 어떻게 끝났는지는 정하지 않으며, 체험 코너에서 Noah가 어떤 설명과 도움을 줄지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 Noah에게 우유 거품 내는 법을 물어봐요",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 방법을 설명해 달라고 한다. 세척이 제대로 되었는지나 Noah가 어떤 방법을 안내할지는 실제 대화에서 정한다.",
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

첫 팀 회의에서 경력과 앞으로 맡을 일을 영어로 소개하는 순간이네요. 긴장해서 말이 막히더라도 차분히 설명해 보는 장면으로 만들 수 있어요.

이어서 점심시간에 동료에게 먼저 취미를 물으며 친해지는 상황도 해 볼까요? 지금 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람이 말을 이어 갈 수 있도록 기다린다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에는 업무에서 벗어난 가벼운 대화를 좋아하고, 상대가 먼저 꺼낸 취미 이야기에 자신의 관심사도 편하게 나눈다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blazer over a blouse, attentive with a calm encouraging expression and relaxed upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya와 팀원들 앞에 서서 내 경력과 앞으로 맡을 일을 영어로 소개한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 새 팀에서 맡을 업무를 알아듣기 쉽게 말하려 한다. Maya가 얼마나 질문하거나 도와줄지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "회사 식당에서 Ethan과 점심을 먹으며 내가 먼저 업무 이야기가 아닌 취미 이야기를 꺼낸다. 내가 좋아하는 취미와 예전 경험을 간단히 말하고 Ethan에게도 취미를 물으며 대화를 이어 가려 한다. 업무 이야기는 피하고 싶어 하며, Ethan이 어떤 관심사를 말하고 대화가 어떻게 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 회사 식당",
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
        "name": "Maya",
        "position": 1,
        "role": "30대 중반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "20대 후반의 동료. 점심시간에는 편안한 분위기로 대화하지만, 처음에는 상대의 말을 조심스럽게 기다린다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, composed but attentive with a welcoming expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 새로 합류해 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴고 긴장한 상태이며, Maya가 듣고 있다. 내가 어떤 경력을 쌓았는지, 어떤 업무를 맡게 되었는지 설명하고 필요한 부분을 질문받는 장면에서 시작한다. 소개가 얼마나 매끄럽게 전달되거나 Maya가 어떻게 반응할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 점심을 먹으며 Daniel과 대화한다. 나는 먼저 취미 이야기를 꺼내고 Daniel의 취미도 물어보며 서로의 관심사를 이야기하려 한다. 첫 팀 회의에서 일이 어떻게 진행되었거나 Daniel과 이미 친해졌다고 가정하지 않는다. 대화가 얼마나 이어지고 어떤 공통점을 찾게 되는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미를 물어보며 대화를 시작해요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
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
        "name": "Ava",
        "position": 1,
        "role": "30대 후반의 팀 리드. 새 팀원의 경력과 맡을 일을 차분히 확인하고, 긴장한 사람에게 잠시 기다려 준다."
      },
      {
        "name": "Ben",
        "position": 2,
        "role": "30대 초반의 동료. 복사기 사용법을 직접 보여 주며 질문을 구체적으로 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, welcoming but attentive with a calm upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Ava"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Ava가 새 팀원인 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 지금까지의 경력을 영어로 설명하고, 새 팀에서 맡을 업무를 말하려 한다. 영어가 서툴고 긴장한 상태지만 자기소개를 끝까지 해 보려 한다. Ava가 어떻게 반응하거나 질문하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ben"
        ],
        "details": "사무실에서 양면 복사를 해야 하는데 복사기 사용법을 모른다. 나는 Ben에게 다가가 양면 복사를 하고 싶다고 말하며 사용 방법을 묻는다. 복사기의 메뉴나 버튼을 가리키며 필요한 절차를 확인할 수 있지만, Ben이 얼마나 쉽게 설명하거나 직접 도와줄지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 양면 복사 방법을 동료에게 물어요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
    "title": "새 회사의 첫날"
  }
]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 회의가 끝난 뒤 사무실에서 동료에게 업무 자료가 있는 공유 폴더 사용법을 묻는 상황은 어때요? 영어가 서툴러도 필요한 자료를 찾고, 앞으로 맡을 일을 준비하려고 질문하는 장면이에요. 이 상황으로 해볼까요, 아니면 다른 일을 원하시나요?

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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하며, 설명이 अस्पष्ट하면 구체적으로 다시 묻는다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 간단히 설명하고, 상대가 직접 해 보도록 기다린다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, navy blazer over a light blouse, attentive and slightly nervous with hands loosely clasped, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장한 상태이며, Maya 앞에서 이전 경력과 새 팀에서 담당할 업무를 설명한다. Maya가 어떻게 반응하거나 추가로 묻는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "첫 팀 회의가 있는 회사 사무실에서 나는 동료 Ethan에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 복사할 자료를 준비하고 있지만 양면 설정 방법을 모르는 상황이다. Ethan이 어떤 방식으로 설명하거나 도와주는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고, 경력과 맡을 일을 구체적으로 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blouse and blazer, attentive with an encouraging but evaluating expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 이전 경력과 새 팀에서 맡을 업무를 간단하고 분명하게 설명하려 한다. 소개 중 Maya가 경력이나 담당 업무를 더 물을 수 있지만, 내가 얼마나 잘 설명하거나 Maya가 어떻게 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
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
        "role": "40대 초반의 운전자. 사고 직후 당황했지만 차분히 필요한 연락처와 보험 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual jacket over a shirt, tense but composed with one hand raised to pause and the other holding a phone, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 나와 Daniel의 차량이 사고가 난 직후다. 양쪽 모두 우선 안전을 확인한 뒤, 갓길이나 안전한 장소에서 서로의 이름과 연락처, 자동차 보험 정보를 교환하려 한다. 나는 사고 상황을 간단히 설명하고 필요한 정보를 정확히 요청하려 한다. 사고의 과실, 부상 여부, 보험 처리 결과와 상대가 정보를 순순히 제공할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요.",
        "title": "사고 직후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 교환해야 해요",
    "setting": "사고 직후 차량을 안전한 곳에 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답하셨겠어요. 그 상황에서 영어로 어떤 대화를 해보고 싶으세요?

예를 들면,  
- 배우자에게 내 입장을 차분히 설명하고 싶다  
- 서로 육아 분담을 다시 정하고 싶다  
- 어제 다툰 일을 사과하고 대화를 풀고 싶다  
- 상대의 불만을 듣고 오해를 풀고 싶다  

어디에서, 어떤 말을 하려는 상황인지 알려주시면 그 장면부터 구체적으로 만들어 볼게요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하신 걸까요? 비행기, 비 오는 날의 약속, 또는 다른 상황인지 조금만 더 알려 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 짧게 말하고 상대의 설명은 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 계속된다. 옆자리의 Emma는 소리를 지르지는 않지만 한숨을 쉬고 아기와 나를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 옆자리 승객에게 여행지나 읽고 있는 책에 대해 말을 걸고, 서로의 여행 이야기를 나누는 상황은 어때요? 앞선 대화가 어떻게 끝났든 시작할 수 있는 장면이에요. 원하는 이야깃거리가 있으면 함께 넣을게요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 교환을 요청하는 상황이네요. 직원은 화내지 않고, 차분하게 제품 상태와 구매 내역을 확인하는 사람으로 두면 좋겠어요.

이어서 같은 매장에서 커피 머신 사용법을 배우는 체험 코너에 참여해 직원에게 추출 방법과 관리법을 묻는 상황도 해볼까요? 지금 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 제품 상태를 차분히 확인하며 고객의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green retail uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 구매한 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 보여 주며 제품에 문제가 생겼다고 설명하고 교환을 요청하려 한다. Mia는 화내지 않으며 구매 내역과 누수 상태를 차분히 확인한다. 교환이 가능한지, 어떤 절차가 필요한지, 직원이 어떤 대안을 제시하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "주방용품을 판매하는 매장의 고객 서비스 데스크",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활 중 어떤 순간을 연습해 보고 싶으세요?

예를 들면 집을 구하면서 집주인에게 조건을 묻는 상황, 마트에서 원하는 물건을 찾는 상황, 병원 예약을 하는 상황, 직장이나 학교에서 처음 자기소개하는 상황처럼 정할 수 있어요.

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
        "role": "30대 초반의 집주인. 세입자의 설명을 차분히 듣지만 계약 조건과 수리 비용을 꼼꼼하게 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, casual beige sweater and jeans, attentive with a slightly concerned expression while standing upright, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 구한 아파트에 입주한 뒤 욕실의 온수가 나오지 않는다. 나는 집주인 Maya에게 문제를 설명하고 수리를 요청하려 한다. 언제부터 문제가 생겼는지와 온수 사용이 꼭 필요한 이유를 말할 수 있는 상황이다. Maya가 바로 수리해 주는지, 비용이나 책임을 어떻게 판단하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "새 아파트에 입주했는데 욕실에서 온수가 나오지 않아요",
        "title": "온수 문제"
      }
    ],
    "hook": "새 아파트에 입주했는데 욕실에서 온수가 나오지 않아요",
    "setting": "해외에서 처음 생활하는 아파트",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속돼서 곤란한 상황이네요. 먼저 말을 걸 상대는 옆자리 승객으로 하고, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 설명하는 장면으로 해볼까요?

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

좋아요. 옆자리 승객은 화내지 않고 한숨을 쉬며 계속 쳐다보고, 아기를 달래느라 애쓰고 있다는 점과 조금만 이해해 달라는 부탁을 전하는 순간으로 정할게요.

이어서 같은 여행에서 공항 수하물 찾는 곳에서 유모차가 보이지 않아 안내 직원에게 도움을 요청하는 상황도 해볼까요? 지금 정한 비행기 장면만 만들어도 좋아요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬며 시선을 보내지만, 상대가 설명하면 차분히 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하고 상황이 어떻게 풀리는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 말하고 싶으세요?

예를 들면 **온수가 나오지 않거나, 난방이 고장 났거나, 천장에서 물이 새는 상황**처럼 구체적으로 정할 수 있어요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 실내 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요. 집주인이 어떻게 반응할지는 실제 대화에서 알아가면 돼요.

이어서 동네 모임에서 처음 만난 사람들에게 자기소개하고 인사하는 상황도 해볼까요? 이름과 사는 곳을 간단히 말한 뒤, 상대에게도 무엇을 물어볼지는 정해서 넣을 수 있어요. 지금 난방 수리 에피소드만 만들어도 좋아요.

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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 집주인. 수리 요청의 구체적인 근거를 확인하고 가능한 일정을 차분히 조율한다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "40대 초반의 이웃. 처음에는 조심스럽지만 상대의 취미를 들으면 자신의 주말 활동도 이야기한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, casual knit sweater, concerned and listening with folded arms, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 사진과 실내 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하려 한다. Maya가 수리 일정을 받아들이거나 다른 해결책을 제시할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집의 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Ethan에게 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 먼저 말하고, Ethan의 주말 취미도 물으며 대화를 이어가려 한다. Ethan이 어떤 취미를 말하고 대화가 어떻게 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "주말 취미"
      }
    ],
    "hook": "난방이 고장 난 집주인에게 수리를 요청하고 동네 모임에서 새 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 동네 커뮤니티 모임",
    "title": "새 동네에서"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 커피 머신의 사용법을 직원에게 묻고, 원하는 방식으로 커피를 만들 수 있는지 확인하는 상황은 어때요? 첫 제품의 교환 결과와 관계없이 연습할 수 있어요.

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
        "details": "다른 날 같은 매장에서 Noah를 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 방법과 주의할 점을 설명해 달라고 한다. 첫 번째 에피소드에서 교환에 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않는다. 실제 대화에서 Noah가 설명하는 내용과 내가 추가로 묻는 질문은 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 시연 공간",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 첫 번째 에피소드에서 커피 머신을 교환했는지는 정하지 않으며, 교환 결과와 무관하게 체험 코너에 와서 우유 거품 내는 방법을 배우려 한다. Noah가 시범을 보이거나 어떤 설명을 하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 기본적인 청소 절차를 설명해 달라고 한다. 실제로 어떤 방법과 양을 안내받을지는 플레이에서 정한다.",
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

## 3번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.

해외 회사의 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하는 상황이네요. 경력직이지만 영어가 서툴러 긴장한 상태에서, 팀원들 앞에 먼저 자기소개를 시작하는 순간으로 해볼까요?

이어서 점심시간에 동료에게 취미를 물으며 대화를 이어 가는 상황도 넣을 수 있어요. 첫 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 중반의 프로젝트 코디네이터. 처음 만난 사람의 말을 차분히 듣고, 이해하지 못한 표현은 자연스럽게 다시 묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "40대 초반의 팀 리더. 새 팀원의 경력을 관심 있게 듣고 맡은 일을 구체적으로 확인한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark brown hair, smart casual blouse and cardigan, slightly nervous but welcoming with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 팀원들 앞에 자기소개를 한다. 영어가 서툴러 긴장한 상태지만, 이전 경력과 이번에 맡을 일을 간단한 영어로 설명하려 한다. Daniel은 내가 답해야 할 내용을 묻거나 설명을 확인할 수 있다. 자기소개가 잘 전달되거나 업무를 맡게 되는 결과는 정하지 않고 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 동료 Maya와 함께 식사하며 나는 먼저 취미 이야기를 꺼내고 상대의 취미도 물어보려 한다. 업무 이야기는 피하고, 영어가 서툴러도 사진, 운동, 음악처럼 일과 관련 없는 주제로 대화를 이어 가고 싶어 한다. Maya가 어떤 취미를 말하고 대화가 얼마나 이어지는지는 실제 대화에서 정하며, 두 사람이 친해졌다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내고 업무 얘기는 피하려고 해요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 회사 식당",
    "title": "첫 출근의 대화"
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
        "role": "30대 후반의 팀 리드. 회의에서 새 팀원의 경력과 맡을 일을 차분히 확인하고, 설명이 막히면 기다려 준다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "30대 초반의 동료 개발자. 점심시간에는 편안한 대화를 좋아하고, 상대의 취미를 물으며 자기 이야기도 나눈다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blazer over a blouse, attentive and encouraging with a slightly tense but welcoming posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya와 팀원들 앞에 선다. 나는 경력직으로서 지금까지 해 온 일을 영어로 간단히 소개하고, 새 팀에서 맡게 될 일을 설명하려 한다. 영어가 서툴러 긴장하고 있어도 미리 준비한 경력과 담당 업무의 핵심 내용은 말할 수 있다. Maya가 얼마나 자세히 묻거나 어떤 반응을 보이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "회사 식당에서 Ethan과 점심을 먹으며 대화를 시작한다. 나는 먼저 취미 이야기를 꺼내고 내가 좋아하는 활동을 말한 뒤, Ethan의 취미도 물어보며 자연스럽게 친해지려 한다. 첫 팀 회의가 어떻게 끝났는지나 Ethan과 이미 가까워졌는지는 정하지 않는다. 실제 대화에서 Ethan이 어떤 취미를 말하고 대화가 어떻게 이어지는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심 취미 대화"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 시작하기"
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
        "role": "30대 중반의 프로젝트 매니저. 새 팀원의 경력과 맡을 일을 차분히 듣고 구체적인 질문을 한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, slightly nervous but welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 하는 순간이다. 경력직으로 합류한 나는 이전 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있으며, Maya는 새 팀원으로서 내 설명을 듣고 필요한 내용을 물을 수 있다. 경력과 맡을 일을 어떻게 설명하고 Maya가 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 소개하려고 해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "사무실에서 양면 복사를 해야 하는데 복사기 사용법을 모르는 상황이다. 나는 동료 Maya에게 양면으로 복사하는 방법을 영어로 묻고 도움을 요청하려 한다. 복사기의 설정이나 Maya가 설명하는 방식은 실제 대화에서 정하며, 복사가 성공하는지는 미리 정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기에서 양면 복사를 해야 해서 동료에게 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 소개하려고 해요",
    "setting": "해외 회사의 회의실과 사무실 복사기 앞",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 회의가 끝난 뒤 동료에게 맡은 업무의 우선순위와 진행 방식을 묻는 상황은 어때요? 회의에서 소개한 역할을 실제로 시작하기 위해, 업무 자료를 확인하며 질문하는 장면이에요. 지금 정한 첫 팀 회의 자기소개만 만들어도 좋아요.

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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새로운 팀원의 경력과 맡을 일을 차분히 듣고, 모호한 부분은 구체적으로 다시 묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 업무를 편하게 설명하고, 질문을 받으면 직접 해 보도록 안내한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blazer over a blouse, attentive with a reassuring but focused expression and relaxed upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 앞으로 맡을 일을 영어로 소개한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태라, 준비한 내용을 바탕으로 경력과 역할을 간단하고 분명하게 말하려 한다. Maya가 질문하거나 이해하는 방식과 내가 회의에서 어떤 반응을 받는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "사무실에서 나는 동료 Daniel에게 복사기를 양면 복사로 설정하는 방법을 영어로 묻는다. 복사기 앞에서 필요한 기능을 찾지 못해, 양면으로 복사하고 싶다는 목적을 설명하고 사용 방법을 안내받으려 한다. Daniel이 얼마나 자세히 설명하는지와 내가 방법을 이해하고 직접 할 수 있는지는 실제 대화에서 정한다. 첫 회의에서 어떤 반응을 받았는지는 전제로 삼지 않는다.",
        "number": 2,
        "preview": "사무실에서 복사기를 양면으로 설정하는 방법을 동료에게 물어봐요.",
        "title": "복사기 사용법"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 설명이 부족하면 구체적으로 되묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart navy blazer over a light blouse, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 시작하는 순간이다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장하고 있다. 지금까지의 경력을 간단히 설명하고, 앞으로 팀에서 맡을 일을 소개하려 한다. Maya는 팀 리더로서 자기소개를 듣고 필요한 내용을 물을 수 있다. 내가 얼마나 자연스럽게 설명하는지, Maya가 어떻게 반응하는지, 소개가 성공적으로 전달되는지는 실제 대화에서 정한다.",
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
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 필요한 정보를 차분히 확인하려고 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed with one hand raised in a calming gesture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로 갓길에서 사고 직후 상대 운전자 Daniel과 마주한다. 나는 서로의 연락처와 자동차 보험 정보를 교환하려고 하며, 사고 상황을 간단히 확인하면서 필요한 정보를 영어로 요청해야 한다. Daniel이 어떤 태도로 응하거나 어떤 정보를 제공하는지는 실제 대화에서 정한다. 사고의 과실이나 보상 문제까지 결론 내리지 않고, 현장에서 정보를 교환하려는 상황으로 시작한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 주고받아요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 영어로는 **싸운 뒤 아내와 육아 문제를 다시 이야기하는 순간**을 연습해 볼까요?

예를 들면, 아내가 “육아를 나만 맡고 있다”고 말했고, 나는 내 입장도 설명하면서 앞으로 어떻게 나눌지 이야기하려는 장면이에요. 실제로는 어떤 문제로 다퉜는지, 아내에게 무엇을 말하고 싶은지 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으신가요? “비…”로 시작하는 상황을 조금만 더 설명해 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 중요하게 여기며 불편하면 한숨과 시선으로 표현하지만 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and glancing sideways with a restrained sigh, seated upright with tense shoulders, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울리고 있다. 옆자리의 Emma는 소리를 지르거나 화내지는 않지만 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 상황을 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서 이어지는 다른 상황으로, 비행기에서 내린 뒤 공항 대기 구역에서 옆자리 승객을 다시 만나 여행 이야기를 나누는 에피소드는 어때요? 아기 이야기에서 벗어나 내가 먼저 여행 경험을 말하고 상대에게도 질문하는 장면이에요. 지금 정한 비행기 상황만으로 끝내도 좋아요.

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

매장에서 교환을 요청한 뒤, 같은 매장의 사용법 상담 코너에서 커피 머신의 올바른 설치와 관리 방법을 묻는 상황도 해 볼까요? 첫 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 차분하게 고객의 설명과 자료를 확인하고, 화내지 않으며 요청에 대응한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, casual green store uniform, attentive with a calm but concerned expression and holding her hands together, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 산 커피 머신에서 물이 새고 있다. 나는 영수증과 물이 새는 장면을 찍은 영상을 보여 주며 매장 직원 Mia에게 제품 교환을 요청하려 한다. Mia는 화내지 않고 내 설명과 자료를 확인한다. 실제로 교환이 가능한지, 추가 확인이나 다른 절차가 필요한지는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장 직원에게 교환을 요청해요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 판매한 전자제품 매장 고객 서비스 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 자주 겪는 장면부터 골라 볼까요?

예를 들면 집을 구하면서 집주인에게 조건을 묻는 상황, 마트에서 원하는 물건을 찾는 상황, 병원에서 증상을 설명하는 상황, 직장이나 학교에서 처음 자기소개하는 상황이 있어요. 가장 먼저 연습해 보고 싶은 장면은 어떤 건가요?

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
        "role": "30대 초반의 아파트 관리 직원. 입주 절차와 생활 규칙을 차분하게 설명하고 필요한 정보를 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, beige cardigan over a simple blouse, welcoming but slightly concerned, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활을 시작한 뒤 아파트 관리 사무실에 방문한다. 집 안의 온수가 갑자기 나오지 않아 Maya에게 상황을 설명하고 점검이나 수리를 요청하려 한다. 나는 언제부터 문제가 생겼는지와 이미 확인해 본 내용을 말할 수 있고, 오늘 저녁에 샤워해야 해서 가능한 처리 방법과 방문 시간을 묻고 싶다. Maya가 바로 해결해 주거나 어떤 도움을 줄지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "새로 사는 집에서 온수가 나오지 않아 관리 사무실에 도움을 요청해요",
        "title": "온수가 안 나와요"
      }
    ],
    "hook": "새로 사는 집에서 온수가 나오지 않아 관리 사무실에 도움을 요청해요",
    "setting": "해외 아파트의 관리 사무실",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래도 울음이 계속되는 비행기 좌석에서, 옆자리 승객이 한숨을 쉬며 쳐다보는 순간으로 해볼까요? 아기를 달래려고 애쓰고 있다는 점을 설명하면서 조금만 이해해 달라고 말하는 상황이에요.

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 비행기 안에서 승무원에게 아기 분유에 쓸 따뜻한 물을 부탁하는 상황도 해볼까요? 지금 정한 옆자리 승객과의 대화만 연습해도 좋아요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 중요하게 여기며 불편하면 한숨을 쉬고 쳐다보지만 화를 내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and glancing sideways with restrained patience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 계속 한숨을 쉬며 나를 쳐다보지만 화를 내지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하고 대화가 어떻게 풀리는지는 실제 플레이에서 정한다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저를 쳐다봐요",
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

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 해외에서 집주인에게 집 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하고 싶으세요? 예를 들면 물이 새서 수리를 요청하거나, 난방이 작동하지 않아 점검을 부탁하는 상황이에요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

좋아요. 사진과 온도 기록을 보여 주면서 난방 문제를 설명하고, 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임에서는 어떤 순간에 인사하고 싶으세요? 처음 만난 사람에게 자기소개를 하고 대화를 시작하는 장면인지, 아니면 이미 대화 중인 여러 사람에게 자연스럽게 합류하는 장면인지 알려 주세요.

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
        "role": "40대 후반의 집주인. 수리 요청의 내용과 긴급성을 확인한 뒤 가능한 일정을 차분히 이야기한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 가볍게 자기소개를 나누고 상대의 취미에 관심을 보이면 질문한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual knit sweater and dark trousers, concerned and listening with a thoughtful expression, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 문제를 설명하고, 사진과 실내 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이는지, 일정을 제시하는지, 다른 방법을 말하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며 수리를 요청해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고, 주말에 무엇을 하는지 이야기하며 대화를 시작하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물어보려 한다. 대화가 얼마나 이어지거나 서로 공통점을 찾게 되는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외에서 고장 난 난방을 집주인에게 설명하고 수리를 부탁해요",
    "setting": "해외 임대 주택과 현지 동네 주민 모임",
    "title": "새 동네에서 말하기"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 상황도 넣어 볼게요. 매장 체험 코너에서 직원에게 커피 머신의 기본 사용법과 세척 방법을 묻는 에피소드는 어때요? 첫 번째 교환 요청이 어떻게 끝났는지와 관계없이 연습할 수 있어요. 지금 생각한 상황이 있으면 덧붙여 주세요.

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
        "details": "다른 날 같은 매장에서 Noah를 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 부드러운 우유 거품을 만들기 위해 필요한 순서와 주의할 점을 설명해 달라고 한다. 첫 번째 에피소드에서 교환에 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않으며, 이번 대화에서 Noah가 실제로 어떤 도움을 주는지도 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 주의할 점을 듣고, 궁금한 점을 이어서 질문하려 한다. 첫 에피소드에서 커피 머신을 교환했는지는 전제로 삼지 않으며, 실제 대화에서 Noah가 얼마나 자세히 설명하고 내가 어떻게 따라갈지는 플레이에서 정한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "커피 머신을 체험할 수 있는 가전 매장",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 청소 방법을 설명해 달라고 한다. 실제로 어떤 방법을 안내받을지는 플레이에서 정한다.",
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
