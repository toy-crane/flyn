# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:38:13.806Z
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

이어서 점심시간에 새 동료에게 취미를 물으며 자연스럽게 친해지는 상황도 해볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 프로젝트 동료. 새로운 팀원의 소개를 차분히 듣고, 맡은 일과 경험에 관해 구체적으로 질문한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, attentive with a calm encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya와 팀원들 앞에 선다. 나는 경력직으로 이전 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴고 긴장한 상태이며, 준비한 내용을 바탕으로 말하되 실제로 얼마나 자연스럽게 설명하고 어떤 질문을 받는지는 대화에서 정한다. 자기소개가 성공적으로 끝났다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 회의"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 식사하며 내가 먼저 취미 이야기를 꺼내 대화를 시작하려 한다. 업무 이야기는 피하고, 내 취미와 예전 경험을 간단히 말한 뒤 Maya의 취미도 물어보려 한다. 첫 팀 회의에서 어떤 반응을 받았는지나 두 사람이 이미 친해졌는지는 정하지 않으며, 실제 대화에서 Maya가 어떤 취미와 반응을 보일지는 내가 하는 말에 따라 정한다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내 업무 말고 다른 대화를 해요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 회사 식당",
    "title": "새 팀에서 말하기"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해되지 않는 부분은 구체적으로 다시 묻는다."
      },
      {
        "name": "Jordan",
        "position": 2,
        "role": "20대 후반의 팀 동료. 점심시간에 가벼운 대화를 좋아하고, 상대가 먼저 꺼낸 취미 이야기에 자신의 경험으로 답한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder length dark hair, smart casual blazer, slightly nervous but welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 새 팀원들에게 영어로 자기소개를 한다. 지금까지의 경력과 앞으로 맡을 일을 설명하려 하지만 영어가 서툴러 긴장하고 있다. Maya는 내 소개를 듣고 경력이나 담당 업무에 대해 질문할 수 있다. 내가 얼마나 자연스럽게 말하는지와 팀이 내 설명을 어떻게 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 경력과 앞으로 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Jordan"
        ],
        "details": "회사 식당에서 점심을 먹으며 Jordan과 처음 편하게 대화를 나눈다. 나는 먼저 취미 이야기를 꺼내고 내가 좋아하는 일을 말한 뒤 Jordan의 취미도 물어보려 한다. 첫 팀 회의에서 내 소개가 어떻게 받아들여졌는지나 두 사람이 이미 친해졌다고 정하지 않으며, 실제 대화에서 말의 흐름과 Jordan의 반응을 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내고 물어봐요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 알려 주지만, 바쁜 중에는 설명을 짧게 할 수 있다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blouse and tailored blazer, attentive with a calm but expectant expression and upright posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 영어로 내 경력과 지금 맡게 될 일을 소개하려 한다. 영어가 서툴러 긴장한 상태이며, Maya는 팀 리더로서 내 소개를 듣고 경력과 담당 업무에서 이해가 필요한 부분을 물을 수 있다. 나는 이전 경력과 앞으로 맡을 일을 분명하게 설명하고, 필요한 경우 간단히 다시 말하거나 질문을 확인하려 한다. 팀이 내 소개를 어떻게 받아들이는지와 실제 대화의 결과는 플레이에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "첫 팀 회의가 열리는 해외 회사 사무실에서 동료 Daniel에게 복사기 사용법을 묻는다. 양면 복사를 해야 하지만 복사기의 설정을 어떻게 해야 하는지 확실하지 않다. 나는 양면으로 복사해야 한다는 목적을 설명하고, 필요한 경우 원본을 어떻게 넣는지와 설정을 어떻게 고르는지 물으려 한다. Daniel이 바로 도와줄 수 있는지, 설명을 얼마나 자세히 해 주는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 양면 복사 방법을 물어봐요.",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 출근 날 팀 회의실과 사무실 복사기 앞",
    "title": "새 회사의 첫날"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료에게 사내 업무 시스템 사용법을 묻는 상황은 어때요? 영어가 서툴러도 다시 설명해 달라고 하고, 내가 맡은 일을 시작하는 데 필요한 정보를 얻어 보는 장면이에요. 첫 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Jordan",
        "position": 1,
        "role": "30대 중반의 팀 동료. 회의에서 새로 온 사람의 경력과 담당 업무를 차분히 듣고, 이해가 안 되는 부분은 구체적으로 물어본다."
      }
    ],
    "cover": "A person in their mid thirties with short dark hair, wearing a neat business casual outfit, attentive with a slightly encouraging expression and relaxed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Jordan"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로서 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴러서 긴장한 상태이며, 경력과 담당 업무를 간단하고 분명하게 전달하는 것이 목표다. Jordan은 새 팀 동료로서 내 소개를 듣고 필요한 부분을 물어볼 수 있다. 소개가 잘 전달되거나 Jordan이 특별히 배려해 주는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Jordan"
        ],
        "details": "사무실에서 나는 동료 Jordan에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 어떤 문서를 복사하려는지는 실제 대화에서 설명할 수 있으며, 양면 복사 기능을 찾고 필요한 조작을 이해하는 것이 목표다. Jordan이 직접 알려 주거나 다른 방법을 안내할지는 미리 정하지 않는다. 첫 팀 회의에서 내 소개가 잘 전달되었는지, Jordan과 친해졌는지는 전제로 삼지 않는다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요",
        "title": "양면 복사 묻기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 주 사무실",
    "title": "새 회사의 첫날"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 설명이 부족하면 구체적으로 되묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with a calm encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태다. 이전 직장에서 해 온 일과 이번 팀에서 맡을 업무를 간단하고 분명하게 소개하려 한다. Maya가 어떻게 반응하거나 추가로 묻는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해야 해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해야 해요",
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
        "role": "30대 후반의 상대 운전자. 사고 직후 당황했지만 필요한 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense and cautious with one hand raised to pause, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후, 나는 상대 운전자 Daniel과 마주해 연락처와 보험 정보를 서로 교환하려 한다. 사고 상황을 차분히 설명하고 필요한 정보를 확인해야 하며, 각자의 연락처와 보험 정보가 무엇인지 대화에서 묻고 답한다. 경찰이나 보험사에 신고했는지, 사고 책임이 누구에게 있는지, 정보 교환이 원활하게 끝나는지는 미리 정하지 않고 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
        "title": "사고 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

어제 싸운 뒤, 감정이 조금 가라앉은 상태에서 아내와 다시 대화하는 장면을 연습해 볼까요?

예를 들면 **육아 분담이 불공평하다고 느낀 점을 설명하고, 서로의 입장을 들으며 앞으로의 방법을 이야기하려는 상황**이에요. 영어로는 사과부터 하고 싶은지, 아니면 먼저 내 생각을 차분히 설명하고 싶은지 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황인지 조금만 더 말씀해 주세요. 어디에서 누구와 무슨 일을 영어로 이야기해 보고 싶으세요?

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬거나 짧게 시선을 보내지만, 상대가 설명하면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리의 Emma는 소리를 지르거나 화내지 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주거나 어떤 반응을 보일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 우리를 바라봐요",
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

같은 비행기에서 승무원에게 아기를 돌보는 데 필요한 도움을 요청하는 상황은 어때요? 아기가 계속 울고 있어 분유를 타거나 달래는 데 쓸 따뜻한 물을 부탁하는 순간으로 연습할 수 있어요. 지금 에피소드에 이 장면을 더하지 않고 첫 에피소드만 유지해도 좋아요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

매장에서 영수증과 누수 영상을 보여 주며 커피 머신 교환을 요청하는 상황이네요. 직원은 화내지 않고 차분하게 응대하는 것으로 둘게요.

이어서 같은 매장에서 직원에게 새 커피 머신의 기본 사용법을 묻는 상황도 해볼까요? 교환이 실제로 이루어졌는지는 정하지 않고, 지금 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 제품 상태를 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 산 커피 머신에서 물이 새는 문제가 생겼다. 나는 영수증과 물이 새는 모습을 찍은 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 확인하며 내 설명을 듣는다. 교환이 가능한지, 어떤 절차가 필요한지, 요청이 받아들여지는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 산 매장의 고객 응대 창구",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 수 있는 장면부터 정해 볼까요?

예를 들면 이런 상황이 있어요.

- 집을 구하며 집주인이나 중개인에게 조건을 묻기
- 마트에서 원하는 물건의 위치나 성분을 물어보기
- 병원에서 증상을 설명하고 진료받기
- 은행에서 계좌를 만들거나 카드 문제를 해결하기
- 직장이나 학교에서 처음 만난 사람에게 자기소개하기
- 이웃에게 소음이나 생활 문제를 조심스럽게 말하기

이 중에서 연습하고 싶은 장면이 있나요? 직접 겪을 상황을 말해 주셔도 좋아요.

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
        "role": "30대 초반의 집주인. 생활 규칙과 계약 조건을 차분히 설명하고, 이유를 들으면 요청을 다시 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, casual knit sweater and jeans, attentive with a slightly cautious expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 지낼 집에 입주한 뒤, 나는 집주인 Maya에게 생활에 필요한 몇 가지를 물어보려 한다. 와이파이 사용법과 세탁기 이용 시간, 쓰레기를 버리는 장소를 확인하고, 내가 잘 이해하지 못한 집 규칙은 다시 설명해 달라고 부탁하려 한다. Maya가 친절하게 해결해 주는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "새로 지낼 집에서 생활 규칙과 필요한 사용법을 집주인에게 물어봐요",
        "title": "새 집 규칙"
      }
    ],
    "hook": "새로 지낼 집에서 생활에 필요한 것들을 집주인에게 물어봐요",
    "setting": "해외에서 처음 입주한 주거 건물",
    "title": "해외 생활의 첫날"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변의 시선도 신경 쓰이는 상황이네요. 옆자리 승객이 계속 한숨을 쉬고 쳐다보는데, 먼저 말을 걸어 조금만 이해해 달라고 부탁하는 순간으로 해볼까요? 이 에피소드만 만들어도 좋아요.

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 같은 비행기에서 옆자리 승객과 목적지나 여행 계획을 짧게 이야기하며 대화를 이어 가는 상황도 해볼까요? 지금처럼 아기를 달래는 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬며 쳐다보지만 고함치지 않고, 상대가 설명하면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지는 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 대화가 어떻게 이어지는지는 실제 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인과 수리 이야기를 나누는 상황부터 정해 볼게요. 집에서 무엇이 고장 났고, 집주인에게 어떤 도움이나 조치를 요청하고 싶으세요?

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 문제와 사진, 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임에서는 어떤 순간에 인사하고 싶으세요? 처음 만난 사람에게 자기소개를 하고 대화를 시작하는 장면인지, 아니면 이미 몇 명이 이야기 중인 곳에 들어가 인사하는 장면인지 알려 주세요.

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
        "role": "50대 초반의 집주인. 집 상태와 수리 요청을 차분히 확인하며 구체적인 자료가 있으면 일정을 검토한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게 편안하게 말을 걸고 상대의 취미를 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual knit sweater and dark trousers, concerned with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 상태를 보여 주는 사진과 온도 기록을 가지고 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 언제 수리할 수 있는지, 요청을 받아들일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "해외의 동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물으며 대화를 이어 가려 한다. Maya가 어떤 취미를 말하고 대화가 어떻게 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 시작해요",
        "title": "동네 모임 인사"
      }
    ],
    "hook": "해외에서 고장 난 난방을 수리해 달라고 집주인에게 부탁하고 동네 이웃에게 먼저 인사해요",
    "setting": "난방이 고장 난 해외 임대 주택과 근처 주민 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 직원에게 커피 머신의 기본 사용법과 누수를 피하기 위한 관리 방법을 묻는 상황은 어때요? 첫 교환 요청의 결과와 관계없이, 매장에 방문해 제품 사용에 대해 질문하는 장면으로 이어갈 수 있어요. 지금 에피소드에 더해 이 상황도 넣어 볼까요?

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
        "details": "첫 번째 방문과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 커피 머신으로 우유 거품을 내는 방법을 물어보고, 필요한 순서와 주의할 점을 설명해 달라고 하려 한다. 첫 번째 방문에서 교환이 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않으며, 실제 대화에서 Noah가 제품 상태와 질문에 어떻게 반응하는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 첫 번째 에피소드에서 커피 머신을 교환했는지는 정하지 않으며, 그 결과와 관계없이 매장 체험 코너에 와서 사용법을 배우려 한다. Noah가 얼마나 자세히 알려 주거나 직접 시범을 보일지는 실제 대화에서 정한다.",
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

에피소드는 최대 5화까지라 더 넣을 수 없어요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 청소 순서를 설명해 달라고 한다. 실제로 어떤 방법과 양을 안내받는지는 플레이에서 정한다.",
        "number": 5,
        "preview": "커피 머신을 청소하는 법과 세척제 사용량을 묻고 싶어요",
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

이어서 점심시간에 동료에게 취미를 물으며 친해지는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람이 말할 시간을 준다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "20대 후반의 동료 직원. 업무 밖의 이야기에 관심을 보이며 상대의 취미를 물어본다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, smart casual shirt and blazer, attentive with a calm encouraging expression and relaxed posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Daniel이 새 팀원인 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 경력직이지만 영어가 서툴러 긴장한 상태에서 이전 경력과 맡게 될 업무를 영어로 설명하려 한다. Daniel이 얼마나 질문하거나 도와줄지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 점심을 먹으며 대화를 시작한다. 나는 업무 이야기는 피하고 취미 이야기를 먼저 꺼내고 싶어 한다. 내가 좋아하는 취미를 말한 뒤 Maya에게도 취미를 물으며 대화를 이어가려 한다. Maya가 어떤 취미를 말하고 대화가 어떻게 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내요.",
        "title": "점심시간 취미"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 회사에서의 첫 대화"
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
        "name": "Emily",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고 맡은 업무와 협업 방식을 구체적으로 확인한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료 개발자. 편안한 분위기에서 자신의 취미를 이야기하고 상대의 관심사에도 자연스럽게 질문한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, simple navy blouse and gray blazer, nervous but composed with an encouraging expression, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emily"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원인 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 경력과 담당 업무를 너무 복잡하지 않게 설명하고 팀 리더의 질문에도 답하려 한다. Emily가 얼마나 천천히 말하거나 어떤 질문을 하는지, 내 소개가 어떻게 받아들여지는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 점심을 먹으며 동료 Daniel에게 먼저 취미 이야기를 꺼내고, 내 취미와 예전 경험을 간단히 말한 뒤 Daniel의 취미도 물어보려 한다. 첫 팀 회의에서 실제로 어떤 인상을 주었는지나 두 사람이 이미 친해졌는지는 정하지 않으며, 대화를 자연스럽게 이어 갈 수 있을지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미를 묻고 대화를 이어가요",
        "title": "점심시간 대화"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
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
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고 맡은 일을 구체적으로 확인한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 친절하게 설명하지만 바쁠 때는 짧게 반응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and gray blazer, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원인 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 내가 해 온 일과 새 팀에서 맡을 업무를 분명하게 말하고 싶다. Maya가 질문하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "사무실에서 복사기를 사용해야 하는데 양면 복사 방법을 모르겠다. 나는 Daniel에게 다가가 양면으로 복사하는 방법을 영어로 묻고, 필요한 설정을 설명해 달라고 부탁하려 한다. Daniel이 바로 도와주는지, 다른 방법을 알려 주는지는 실제 대화에서 정한다. 첫 팀 회의에서 어떤 일이 있었는지는 미리 정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 동료에게 양면 복사하는 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 회의실과 사무실",
    "title": "새 회사의 첫날"
  }
]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료에게 현재 진행 중인 프로젝트의 업무 흐름과 협업 방법을 묻는 상황은 어때요? 새 팀에서 맡을 일을 이해하려고 질문하는 장면이에요. 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 중반의 프로젝트 코디네이터. 회의에서 경력과 맡을 일을 소개하는 말을 차분히 들어 주고, 사무실 기기 사용법은 직접 설명해 준다."
      }
    ],
    "cover": "A man in his mid thirties, short dark brown hair, light blue shirt and charcoal cardigan, attentive and slightly encouraging, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 맡을 일을 영어로 소개한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 내가 해 온 일과 새로 맡을 업무를 팀에 이해시키려 한다. Daniel은 팀 동료로 회의에서 내 소개를 듣는다. 실제 소개가 얼마나 잘 전달되고 어떤 반응을 얻는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "사무실에서 나는 동료 Daniel에게 복사기의 양면 복사 방법을 영어로 물어본다. 복사기를 직접 사용해야 하지만 양면 복사 설정을 어떻게 하는지 모르는 상황이다. 나는 필요한 기능을 설명하고 사용 방법을 알려 달라고 부탁하려 한다. Daniel이 어떤 방식으로 설명하고 내가 제대로 사용할 수 있는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요.",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 사무실",
    "title": "새 회사의 첫날"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고 경력과 맡을 일을 구체적으로 물어본다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 해야 한다. 경력직으로 합류한 나는 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있으며, 준비한 내용을 바탕으로 천천히 말하고 필요한 경우 다시 설명하려 한다. Maya가 어떻게 반응하거나 질문하는지, 내가 소개를 얼마나 잘 전달하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 자기소개"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 회의실",
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
        "role": "30대 후반의 상대 운전자. 사고 직후라 긴장해 있지만 필요한 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense and cautiously attentive, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 나와 Daniel의 차량이 사고가 난 직후다. 나는 상대 운전자와 연락처와 자동차 보험 정보를 교환하려고 먼저 말을 건다. 사고의 책임을 미리 정하지 않으며, Daniel이 정보를 바로 제공하는지나 사고 처리가 어떻게 진행되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자에게 연락처와 보험 정보를 요청해요",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자에게 먼저 말을 걸어요",
    "setting": "사고 직후 차량을 세워 둔 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 어떤 장면을 영어로 연습해 보고 싶으세요?

예를 들면, **아이를 재운 뒤 아내와 다시 이야기하면서 서로의 입장을 설명하고 타협점을 찾으려는 상황**으로 해볼 수 있어요. 그때 아내에게 말하고 싶은 핵심은 무엇인가요?

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
        "role": "40대 초반의 승객. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨과 시선으로 드러내지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray sweater, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 고함치지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하고 부탁을 받아들일지는 실제 대화에서 정한다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서, 착륙 후 수하물 찾는 곳에서 옆자리 승객을 다시 만나 짧게 대화하는 상황은 어때요? 아기와 함께 여행하는 이유를 먼저 이야기하고, 상대에게도 여행 목적을 물어보는 장면이에요. 지금 비행기 안의 상황만으로도 충분하니, 원하면 그 에피소드만 추가할게요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며, 어제 산 커피 머신을 교환해 달라고 매장 직원에게 말하는 상황이네요. 직원은 화내지 않고 차분하게 응대하는 것으로 둘게요.

이어서 같은 매장에서 직원에게 새 커피 머신의 사용법이나 관리 방법을 묻는 상황도 해 볼까요? 지금 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품 상태와 구매 내용을 확인하고, 설명을 들은 뒤 가능한 절차를 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, beige store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 산 커피 머신에서 물이 새어 매장에 가져왔다. 나는 영수증과 누수가 나는 모습을 찍은 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 제품 상태와 구매 내용을 확인한다. 교환이 이루어지는지, 다른 절차가 안내되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청해요",
    "setting": "누수 문제가 생긴 커피 머신을 가져간 매장 서비스 창구",
    "title": "새 커피 머신 요청"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 만한 장면부터 하나 정해 볼까요?

예를 들면 **집 근처 마트에서 원하는 물건의 위치를 묻는 상황**, **병원에 예약하고 증상을 설명하는 상황**, **집주인에게 고장 난 시설을 말하는 상황**, **은행에서 계좌를 만드는 상황**처럼요.

가장 먼저 연습해 보고 싶은 장면이 있나요?

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
        "role": "30대 초반의 집주인. 세입자의 설명을 차분히 듣고 수리 방법과 일정을 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, casual knit sweater and jeans, attentive with a slightly concerned expression and relaxed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 빌린 집의 주방 싱크대 아래에서 물이 새기 시작했다. 나는 집주인 Maya에게 누수 상황을 설명하고 수리를 요청하려 한다. 물이 얼마나 새는지, 언제 발견했는지, 주변에 어떤 문제가 생겼는지를 말할 수 있는 상황이다. Maya가 바로 수리해 주는지, 다른 방법을 제안하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "빌린 집 주방에서 물이 새서 집주인에게 수리를 요청해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "해외에서 빌린 집 주방에 물이 새기 시작했어요",
    "setting": "해외에서 빌린 아파트의 주방",
    "title": "해외 생활 첫 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변의 시선도 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간, 먼저 말을 걸어 양해를 구하는 장면으로 해볼까요?

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 비행기 안에서 승무원에게 아기를 달랠 수 있도록 따뜻한 물이나 필요한 도움을 요청하는 상황도 해볼까요? 지금 정한 옆자리 승객과의 대화 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 회사원. 피곤해서 한숨을 쉬지만 화를 내지는 않으며, 상대가 사정을 설명하면 조용히 듣는다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length dark brown hair, soft gray sweater, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 계속 한숨을 쉬며 쳐다보지만 화를 내거나 고함치지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인과 수리 문제를 이야기하는 상황부터 정해 볼게요. 어떤 곳에서 무엇이 고장 났고, 집주인에게 무엇을 요청하고 싶으세요?

예를 들면 욕실의 온수가 안 나와서 수리 일정을 잡아 달라고 하거나, 난방이 고장 나서 빨리 확인해 달라고 요청하는 장면이에요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 집주인에게 사진과 실내 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요.

이어서 동네 모임에서 처음 만난 사람들에게 먼저 인사하고, 어디에서 왔는지나 이 동네에 온 계기를 간단히 이야기하는 상황도 해 볼까요? 지금 정한 집주인과의 대화만 만들어도 좋아요.

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
        "role": "50대 초반의 임대인. 집 상태와 수리 일정에 관한 설명을 차분히 확인하며, 구체적인 자료가 있으면 내용을 살펴본다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게도 편안하게 말을 걸며, 주말에 하는 일을 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual sweater and trousers, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 지내는 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 보여 주는 사진과 실내 온도 기록을 가지고 집주인 Daniel에게 상황을 설명하려 한다. 이번 주 안에 수리해 달라고 부탁하려 하며, Daniel이 수리 요청을 받아들이거나 언제 처리할지는 실제 대화에서 정한다. 사진과 온도 기록의 내용은 내가 직접 설명할 수 있다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 주말에 자전거 타기를 좋아한다고 이야기하고, Maya의 주말 취미도 물으며 대화를 이어 가려 한다. Maya가 어떤 취미를 말하거나 대화가 얼마나 이어질지는 실제 대화에서 정한다. 앞선 집주인과의 대화가 어떻게 끝났는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "동네 모임 인사"
      }
    ],
    "hook": "난방이 고장 난 집주인에게 수리를 부탁하고 동네 모임에서 이웃에게 먼저 인사해요",
    "setting": "해외의 임대 주택과 주민들이 모이는 동네 모임 공간",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 커피 머신 사용법을 배우는 체험 코너에 참여해, 직원에게 원하는 방식으로 커피를 내리는 법을 묻는 상황은 어때요? 첫 에피소드의 교환 결과와 관계없이 연습할 수 있어요.

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 원하는 방식으로 커피를 만들기 위해 필요한 순서와 방법을 설명해 달라고 한다. 첫 에피소드에서 커피 머신을 교환했는지, 어떤 제품을 갖고 있는지는 정하지 않으며 실제 대화에서 확인한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 첫 번째 에피소드에서 교환이 이루어졌는지와 관계없이 이 매장 체험 코너에 간다. 우유 거품을 직접 내는 방법과 주의할 점을 설명해 달라고 하려 하며, Noah가 얼마나 자세히 알려 주는지와 실제 결과는 플레이에서 정한다.",
        "number": 2,
        "preview": "같은 매장 체험 코너에서 Noah에게 우유 거품 내는 법을 물어봐요",
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

에피소드는 최대 5화까지라 더 추가할 수 없어요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 청소 방법을 설명해 달라고 한다. 실제로 어떤 방법을 안내받는지는 대화에서 정한다.",
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

이어지는 상황으로, 점심시간에 동료에게 먼저 취미를 물으며 친해지는 에피소드도 해볼까요? 첫 팀 회의에서 자기소개하는 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 팀장. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "30대 중반의 팀 동료. 업무 밖의 가벼운 대화에는 편하게 반응하지만, 상대가 말할 때는 먼저 이야기를 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length dark brown hair, simple charcoal blazer over a light blouse, calm but attentive with a slightly encouraging expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태에서 지금까지의 경력과 맡을 업무를 영어로 설명하려 한다. Maya가 얼마나 알아듣거나 어떤 질문을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Leo"
        ],
        "details": "회사 식당에서 Leo와 마주친 뒤, 나는 업무 이야기는 피하고 취미에 관한 대화를 먼저 꺼내려 한다. 영어로 내가 좋아하는 취미를 이야기하고 Leo의 취미도 물으며 대화를 이어가려 한다. Leo가 어떤 취미를 말하거나 대화가 어떻게 이어지는지는 실제 대화에서 정한다. 첫 팀 회의에서 어떤 결과가 있었는지는 미리 정하지 않는다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하며, 긴장한 사람이 설명을 이어 갈 수 있도록 기다린다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에 가벼운 대화를 좋아하고, 상대의 취미를 들은 뒤 자신의 관심사도 이야기한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, simple navy blouse and gray blazer, attentive with a calm encouraging expression and relaxed posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원인 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, Maya가 팀 앞에서 소개를 시작할 기회를 준다. 나는 지금까지 해 온 일과 새 팀에서 맡을 업무를 이해하기 쉽게 설명하고, 필요한 경우 표현을 다시 말하거나 확인하려 한다. Maya가 어떤 질문을 하거나 얼마나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 점심을 먹으며 Daniel과 처음으로 편하게 대화하려 한다. 나는 먼저 취미 이야기를 꺼내고, 내가 좋아하는 활동과 예전 경험을 간단히 말한 뒤 Daniel의 취미도 물어보려 한다. 영어가 서툴러도 대화를 이어 가며 서로 관심사를 알아가려는 상황이고, Daniel이 어떤 반응을 보이거나 대화가 얼마나 이어지는지는 실제 대화에서 정한다. 첫 팀 회의에서 어떤 일이 있었는지는 미리 성공이나 실패로 정하지 않는다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내고 물어봐요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회사 식당",
    "title": "새 팀에서 첫 대화"
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
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 팀 동료. 새로 합류한 사람의 경력과 맡은 일을 차분히 듣고, 긴장한 사람이 천천히 말할 수 있도록 기다린다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "20대 후반의 팀 동료. 사무실 기기 사용법을 직접 보여 주며, 필요한 조건을 먼저 확인한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal cardigan, welcoming but attentive with a slightly nervous smile, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Daniel을 비롯한 팀원들 앞에 새로 합류한 나는 긴장한 상태로 지금까지의 경력을 소개하고 앞으로 맡을 일을 설명하려 한다. 영어가 서툴러 말이 막히거나 표현을 고쳐 말할 수 있지만, 경력의 핵심과 맡은 업무를 전달하는 것이 목표다. Daniel이 어떤 질문을 하거나 반응을 보일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 앞으로 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "사무실에서 양면 복사를 해야 하는 나는 Sophie에게 복사기 사용법을 묻는다. 어떤 문서를 몇 부 복사할지와 복사기의 현재 설정은 대화 중 확인할 수 있다. 나는 양면 복사 방법을 영어로 설명해 달라고 요청하고, 필요하면 직접 해 보는 방법을 다시 물으려 한다. Sophie가 바로 도와주거나 다른 방법을 안내할지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 양면 복사를 해야 해서 동료에게 복사기 사용법을 물어요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 사무실 복사 공간",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료가 맡은 업무와 협업 방식에 대해 더 물어보는 상황은 어때요? 회의에서 소개한 경력과 앞으로 맡을 일을 바탕으로, 자신의 경험을 설명하고 동료에게 업무 진행 방식을 물어볼 수 있어요. 마음에 들면 이 상황을 두 번째 에피소드로 넣을게요.

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
        "name": "Olivia",
        "position": 1,
        "role": "30대 초반의 프로젝트 동료. 새로 합류한 사람의 설명을 차분히 듣고, 업무 방식이 궁금하면 구체적으로 질문한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, smart casual blouse and blazer, nervous but composed with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Olivia"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 새 팀원들에게 영어로 자기소개를 한다. 긴장해서 영어가 서툴지만, 이전 경력과 앞으로 맡을 업무를 간단히 설명하려 한다. Olivia는 팀 동료로 회의에 참석해 내 소개를 듣고, 내가 어떤 일을 맡는지 물어볼 수 있다. 경력과 담당 업무를 얼마나 잘 설명하는지, Olivia가 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 앞으로 맡을 일을 영어로 소개해요",
        "title": "첫 팀 회의"
      },
      {
        "cast": [
          "Olivia"
        ],
        "details": "첫 팀 회의가 끝난 뒤 사무실에서 나는 동료 Olivia에게 복사기의 양면 복사 방법을 물어보려 한다. 복사기를 사용해야 하지만 양면으로 복사하는 방법을 몰라, 필요한 조작을 영어로 설명하고 도움을 요청하려 한다. Olivia가 바로 도와줄지, 다른 방법을 알려줄지는 실제 대화에서 정한다. 첫 회의에서 어떤 일이 있었는지와 관계없이 이 상황에서 복사기 사용법을 묻는 장면으로 시작한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 회의 뒤 사무실",
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
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 영어로 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 새 팀에서 맡을 업무를 간단히 설명하고 팀원들에게 인사를 건네려 한다. 소개를 얼마나 잘 전달하는지와 Maya의 반응은 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
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

## 3번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 상대 운전자. 사고 직후 당황했지만 서로의 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed with both hands slightly raised, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후, 나는 Daniel과 갓길에서 대화한다. 서로의 이름과 전화번호를 확인하고 자동차 보험 회사와 보험 정보를 교환하려 한다. 사고 경위와 과실을 섣불리 단정하거나 현장에서 합의하지 않고, 필요한 연락처와 보험 정보에 집중한다. Daniel이 어떤 정보를 제공하고 사고 처리에 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 정보를 교환해야 해요",
        "title": "사고 직후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 그 상황에서 어떤 말을 영어로 해보고 싶으세요?

예를 들면,  
- 어제 다툰 뒤 아내와 다시 차분히 이야기하기  
- 육아 분담이 불공평하다고 느낀 점 설명하기  
- 서로의 입장을 듣고 앞으로 할 일을 정하기  
- 먼저 사과하거나 화해를 시도하기  

이 중 가까운 장면을 골라도 되고, 실제로 벌어진 순간을 그대로 말해 줘도 좋아요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하신 걸까요? 비행기, 비 오는 날의 외출, 우산을 빌리는 상황처럼 조금만 더 자세히 알려 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬고 쳐다보지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 한숨을 쉬고 나와 아기를 쳐다보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 상황이 어떻게 풀리는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
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

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 승무원에게 아기를 달랠 수 있도록 따뜻한 물이나 조용한 자리를 요청하는 상황을 이어서 해볼까요? 첫 번째 에피소드의 결과와 관계없이 연습할 수 있어요. ઉમ?

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

매장에서 커피 머신을 교환해 달라고 요청하는 상황이네요. 영수증과 누수 영상을 보여 주고, 직원은 화내지 않지만 교환 가능 여부는 대화에서 정해지게 하면 좋겠어요.

이어서 같은 매장에서 커피 머신의 사용법을 직원에게 묻는 상황도 해볼까요? 교환이 되었는지와 관계없이, 사용 중 궁금한 점을 설명하고 올바른 사용법을 알아보는 장면이에요. 지금 누수 문제만 연습해도 좋아요.

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
        "name": "Maya",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 영수증과 제품 상태를 확인하며 대응한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 산 커피 머신에서 물이 새어 매장에 가져온 상황이다. 나는 영수증과 누수 영상을 보여 주며 제품에 문제가 있다는 것을 설명하고 교환을 요청하려 한다. Maya는 화내지 않고 내 설명과 자료를 확인한다. 교환이 가능한지, 추가 확인이나 다른 절차가 필요한지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "문제가 생긴 커피 머신을 가져간 전자제품 매장",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면 중 하나를 골라 구체적으로 연습해 볼까요?

예를 들면, **새로 이사한 집에서 집주인에게 난방이나 수도 문제를 설명하고 수리를 요청하는 상황**이 있어요. 어디가 어떻게 불편한지 설명하고, 언제 수리할 수 있는지 물어보는 장면이에요.

이런 상황이 맞을까요, 아니면 장보기·은행·병원·직장·이웃과의 대화처럼 다른 생활 장면을 원하시나요?

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
        "name": "Sophie",
        "position": 1,
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣고 문제의 원인과 필요한 조치를 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, simple beige sweater, attentive and slightly concerned, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Sophie"
        ],
        "details": "해외에서 처음 구한 아파트의 부엌 싱크대 아래에서 물이 새고 있다. 나는 집주인 Sophie에게 누수가 언제부터 시작됐고 주변 바닥이 젖고 있다는 점을 설명하려 한다. 수리를 요청하고, 수리 기사가 언제 올 수 있는지와 그동안 물을 사용해도 되는지도 물어보려 한다. 누수 사진을 보여 줄 수 있지만 실제로 문제가 얼마나 심각한지와 Sophie가 어떤 조치를 할지는 정하지 않는다.",
        "number": 1,
        "preview": "새 집의 싱크대 아래에서 물이 새서 집주인에게 도움을 요청해요",
        "title": "집 누수"
      }
    ],
    "hook": "새로 구한 집의 싱크대 아래에서 물이 새기 시작했어요",
    "setting": "해외에서 처음 구한 아파트의 주방",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬고 쳐다보는데, 먼저 말을 꺼내서 “저도 애쓰고 있으니 조금만 이해해 달라”고 부탁하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 승무원에게 아기를 달랠 수 있도록 따뜻한 물이나 필요한 도움을 요청하는 상황도 해볼까요? 지금 정한 옆자리 승객과의 대화 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 승객. 조용히 쉬는 시간을 소중히 여기며, 불편해도 화내기보다 표정과 짧은 말로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 어떤 반응을 보이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객이 계속 쳐다봐요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 해외에서 집주인에게 집 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하고 싶으세요? 예를 들면 난방이 안 되거나, 욕실에서 물이 새서 수리를 요청하는 장면이에요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

집주인에게 난방 고장을 설명하고, 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요.

이어서 동네 모임에서 처음 만난 사람에게 먼저 인사하고, 어디에 사는지나 모임에 오게 된 계기를 묻는 상황도 해볼까요? 지금 정한 수리 요청 에피소드만 만들어도 좋아요.

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
        "role": "50대 초반의 임대인. 집 상태와 수리 요청을 차분히 확인하며 구체적인 설명을 들으면 필요한 내용을 되묻는다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 예의 있게 인사하고 주말에 하는 일을 편하게 이야기한다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, simple blue shirt and dark trousers, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 실내 온도를 기록한 자료를 가지고 있다. 이 자료를 바탕으로 집주인 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 언제 수리할 수 있는지, 요청을 받아들일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집 난방이 고장 나서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Mia에게 먼저 인사한다. 나는 주말 취미로 자전거 타기를 좋아한다고 말하고, 상대의 주말 취미에 대해서도 이야기하며 대화를 이어가려 한다. Mia가 어떤 취미를 말할지와 대화가 어떻게 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외 생활 중 집주인과 이웃에게 영어로 말을 걸어야 해요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 직원에게 커피 원두를 고르는 법을 묻고, 집에서 쓰는 기계에 맞는 원두를 추천받는 상황은 어때요? 첫 에피소드에서 교환이 됐는지와 관계없이 연습할 수 있어요. 지금 에피소드만으로도 충분하니, 원하면 다른 장면을 말해 주세요.

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피를 만들 때 사용할 수 있는 방법을 설명해 달라고 한다. 첫 에피소드에서 커피 머신을 교환했는지, 어떤 결과가 있었는지는 정하지 않는다. 실제 대화에서 Noah가 알려 주는 방법과 내가 이어 가는 대화는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 필요한 순서를 알고 싶어 한다. 이 방문은 첫 번째 에피소드의 교환 결과와 무관하게 이루어지며, 실제로 Noah가 얼마나 도움을 주는지는 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적절한 양과 청소 방법을 설명해 달라고 하려 한다. 청소 방법이나 세척제 사용량에 대한 안내가 어떻게 될지는 실제 대화에서 정한다.",
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
