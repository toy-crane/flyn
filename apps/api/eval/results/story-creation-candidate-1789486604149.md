# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:36:44.149Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 3f18bdc5175a78ac9af3b1008e6858181bf986a990342fd2f03e468fff531d3b
답 87개, 실패 1개, 호출 실패 0개

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

이어서 첫 팀 회의가 끝난 뒤, 동료가 맡은 업무를 물어보고 서로의 일하는 방식을 이야기하는 상황도 해볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 초반의 마케팅 동료. 처음에는 차분하게 듣고, 상대가 먼저 꺼낸 관심사에는 자신의 경험을 덧붙이며 대화를 이어 간다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder length dark hair, simple office blouse and cardigan, relaxed but attentive with a slight smile, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 경력직으로 합류한 나는 영어로 지금까지의 경력과 앞으로 맡을 일을 소개하려 한다. 영어가 서툴러 긴장한 상태이며, 내가 어떤 경력을 가졌고 어떤 업무를 맡게 되는지 분명하게 전달하려 한다. Maya를 포함한 팀원들의 반응과 소개가 얼마나 잘 전달되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 점심을 먹으며 나는 업무 이야기는 피하고 취미 이야기를 먼저 꺼내려 한다. 내가 좋아하는 취미를 말하고 Maya의 취미도 물으며 사적인 대화를 이어가려 한다. 첫 팀 회의에서 어떤 인상을 남겼는지나 두 사람이 이미 친해졌는지는 정하지 않으며, 실제 대화에서 관계와 분위기에 따라 대화가 달라진다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "식당의 취미 이야기"
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
        "role": "30대 중반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고 필요한 내용을 구체적으로 묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "20대 후반의 팀 동료. 점심시간에 가벼운 주제로 대화하는 것을 좋아하고 상대의 이야기에 자연스럽게 질문한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 내가 경력과 새로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장하고 있으며, 지금까지 해 온 일과 앞으로 맡을 업무를 간단하고 분명하게 설명하고 싶다. Maya가 질문하거나 설명을 더 요청할 수 있지만, 내가 이해받거나 소개를 성공적으로 마치는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹으며 내가 먼저 취미 이야기를 꺼내려 한다. 내가 좋아하는 취미를 간단히 말하고 Daniel의 취미도 물으며 자연스럽게 대화를 이어가고 싶다. 첫 팀 회의에서 어떤 말을 했는지와 실제 관계가 어떻게 되었는지는 미리 정하지 않으며, Daniel의 반응과 대화의 흐름은 실제 플레이에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심 취미 대화"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해야 해요",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 질문한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용에 익숙하고, 상대가 막히는 부분을 살펴보며 설명한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart charcoal blazer, attentive with a calm encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 경력직이지만 영어가 서툴러 긴장한 상태로 자기소개를 시작한다. 나는 지금까지의 경력과 이번 팀에서 맡을 일을 영어로 설명하려 한다. Maya는 팀 리더로서 내 소개를 듣고 필요한 부분을 질문할 수 있다. 내가 얼마나 자연스럽게 말하는지와 Maya가 어떤 반응을 보이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "사무실에서 복사기를 사용해야 하는 나는 Daniel에게 양면 복사를 하는 방법을 묻는다. 복사할 자료와 복사기는 이미 앞에 있지만, 나는 양면 설정을 어떻게 해야 하는지 몰라 영어로 도움을 요청하려 한다. Daniel이 어떤 방식으로 설명하고 복사가 어떻게 진행되는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 양면 복사 방법을 동료에게 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 회의실과 사무실 복사기 앞",
    "title": "새 회사에서 시작하기"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

점심 대신 첫 팀 회의가 끝난 뒤, 동료에게 현재 진행 중인 프로젝트와 앞으로 맡게 될 업무를 물어보는 상황은 어떠세요? 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람이 말할 시간을 준다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료 직원. 업무 질문을 받으면 자신이 아는 방법을 설명하지만, 서두르지 않고 상대가 이해했는지 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, light blue blouse and charcoal blazer, calm and encouraging with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 경력직이지만 영어가 서툴러 긴장한 나는 이전 경력과 내가 맡게 될 업무를 영어로 설명하려 한다. Maya가 어떤 질문을 하거나 얼마나 이해하는지는 실제 대화에서 정한다. 자기소개가 매끄럽게 끝났다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "첫 팀 회의가 있는 사무실에서 동료 Daniel에게 복사기의 양면 복사 방법을 물어보려 한다. 나는 복사할 문서가 있고, 기계를 직접 사용하기 전에 양면으로 복사하는 방법과 필요한 설정을 영어로 묻고 싶어 한다. Daniel이 바로 도와주는지, 다른 방법을 알려 주는지는 실제 대화에서 정한다. 첫 회의에서 어떤 일이 있었거나 업무가 잘 풀렸다고 가정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 사무실 복사기 앞",
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
        "name": "Alex",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 들어 주며, 설명이 모호하면 부담을 주지 않게 다시 묻는다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, smart casual shirt and blazer, welcoming but attentive with a slightly encouraging smile, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 팀원들 앞에서 이전 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직으로 합류했지만 영어가 서툴러 긴장하고 있으며, 지금까지 해 온 일과 새 팀에서 담당할 업무를 이해하기 쉽게 말하고 싶다. Alex는 회의에서 내 소개를 듣는 팀 리더로서 필요한 경우 업무 내용이나 경력을 다시 물을 수 있다. 내가 얼마나 자연스럽게 설명하는지, Alex와 팀원들이 어떻게 반응하는지, 소개가 성공적으로 끝나는지는 실제 대화에서 정한다.",
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

## 1번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 상대 운전자. 사고 직후라 긴장했지만 필요한 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, wearing a plain gray jacket, tense and cautious with his hands slightly raised, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 내 차와 Daniel의 차가 사고가 난 직후다. 안전을 확인한 뒤 갓길에서 상대 운전자와 직접 연락처와 보험 정보를 교환하려 한다. 나는 사고 상황에 대해 필요한 말을 하고, 서로의 전화번호와 보험 관련 정보를 확인하려 한다. Daniel이 협조적인지, 사고에 대해 어떤 입장인지, 정보 교환이 어떻게 진행되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 확인해야 해요",
        "title": "사고 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 확인해야 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 그 상황을 영어로 연습한다면, 부부싸움이 한창인 순간보다 **감정이 조금 가라앉은 뒤 육아 분담이나 서로의 힘든 점을 다시 이야기하는 장면**이 좋을 것 같아요.

어떤 말을 해보고 싶으세요? 예를 들면:

- 육아를 혼자 떠맡고 있는 것 같아 힘들다고 말하기
- 아내가 서운했던 이유를 듣고 내 입장도 설명하기
- 앞으로 육아를 어떻게 나눌지 제안하기

이 중 가까운 장면이 있나요, 아니면 어제 실제로 오간 상황을 바탕으로 하고 싶으세요?

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶은지 조금만 더 말해 주세요. 예를 들면 여행, 직장, 식당, 병원처럼 장소와 하고 싶은 일을 알려주시면 돼요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편하면 짧게 말하고 상대의 설명은 끝까지 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 소리를 지르거나 화내지 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
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

같은 비행기에서 다른 상황도 연습해 볼게요. 옆자리 승객과 아기 이야기가 아닌 여행이나 취미 이야기를 시작해 보거나, 승무원에게 아기를 달랠 수 있도록 조용한 자리를 잠시 요청하는 장면은 어때요? 어느 쪽이든 첫 에피소드의 결과와 관계없이 연습할 수 있어요.원하는 장면을 말해 주세요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

이어지는 에피소드로, 같은 매장의 사용법 안내 코너에서 커피 머신의 올바른 사용법을 직원에게 묻는 상황도 해볼까요? 교환 요청이 받아들여졌는지와 관계없이 연습할 수 있어요. 지금 정한 누수 제품 교환 상황만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 문제 상황과 구매 내용을 확인하며 대응한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green store uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mina"
        ],
        "details": "어제 이 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 장면을 찍은 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mina는 화내지 않고 내 설명과 자료를 확인한다. 교환이 실제로 이루어지는지, 어떤 절차가 필요한지는 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 보여 주며 교환을 요청해요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 산 매장의 고객 상담대",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 겪을 법한 구체적인 장면부터 정해 볼까요?

예를 들면 집을 구하며 집주인에게 조건을 묻는 상황, 마트에서 원하는 물건을 찾는 상황, 병원에서 증상을 설명하는 상황, 직장이나 학교에서 처음 자기소개하는 상황이 있어요. 어떤 장면을 먼저 연습하고 싶으세요?

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
        "role": "30대 초반의 아파트 관리 직원. 입주 절차를 차분히 설명하고 필요한 정보를 다시 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, smart casual blouse and cardigan, welcoming but attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 생활을 시작하며 아파트 관리 사무실에서 입주 절차를 안내받는 상황이다. 나는 계약서에 적힌 보증금과 공과금 납부 방법을 이해하고, 문제가 생겼을 때 누구에게 연락해야 하는지 물어보려 한다. Maya가 모든 내용을 쉽게 설명해 주거나 내가 바로 이해하는지는 정하지 않으며, 실제 대화에서 질문과 설명에 따라 진행한다.",
        "number": 1,
        "preview": "새로 살 집에 들어가기 전 관리 사무실에서 입주 절차를 안내받아요",
        "title": "새 집 입주"
      }
    ],
    "hook": "해외에서 새로 살 집의 입주 절차를 영어로 안내받아요",
    "setting": "해외 도시의 아파트 관리 사무실",
    "title": "해외 생활 시작"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 멈추지 않아 주변 시선이 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보는 가운데 먼저 말을 걸어, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 부탁하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 비행 중 옆자리 승객에게 목적지에 도착한 뒤 가 볼 만한 곳을 물으며 대화를 이어 가는 상황도 해볼까요? 처음 상황에서 상대가 어떻게 반응했든, 여행 이야기를 새로 꺼내 보는 장면이에요. 지금 정한 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 회사원. 불편해도 화를 내기보다 표정과 짧은 말로 감정을 드러내며 상대의 설명을 들으려 한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, sighing with a tired but restrained expression and glancing sideways, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화를 내거나 소리치지는 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떤 반응을 보이거나 부탁을 받아들일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하고 싶은 상황인가요? 예를 들면 물이 새서 수리를 요청하거나, 난방이 작동하지 않아 빨리 고쳐 달라고 말하는 장면이에요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요.

이어서 동네 모임에서 처음 만난 사람에게 먼저 인사하고, 어디에서 왔는지와 모임에 참여한 이유를 간단히 이야기하는 상황도 해 볼까요? 지금 정한 집주인과의 대화만 만들어도 좋아요.

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
        "role": "50대 초반의 집주인. 집 수리 요청을 받으면 문제와 필요한 일정을 확인하며 차분하게 대화한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 친근하게 말을 걸고 주말에 하는 일을 편하게 이야기한다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual button-up shirt and dark trousers, concerned but composed with one hand slightly raised as if listening, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 문제를 보여 주는 사진과 집 안 온도를 기록한 자료를 가지고 있다. Daniel에게 자료를 보여 주며 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 언제 수리할 수 있는지, 어떤 조치를 제안하는지, 수리가 실제로 이루어지는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya와 인사를 나눈다. 나는 자전거 타기를 좋아한다고 먼저 말하고, 주말에 무엇을 하는지와 관련된 이야기를 이어 가고 싶다. Maya가 어떤 취미를 갖고 있는지, 대화가 얼마나 이어지는지는 플레이에서 정한다. 첫 번째 집주인과의 대화가 어떻게 끝났는지는 이 장면에서 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말하고 주말 취미를 물어봐요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "난방이 고장 난 집주인과 동네 모임의 새 이웃에게 차례로 말을 걸어요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 커피 머신의 사용법을 시연받으며, 원하는 커피를 만들려면 어떤 설정을 해야 하는지 직원에게 묻는 상황은 어때요? 첫 번째 기계를 교환했는지와 관계없이 연습할 수 있어요.  
이 상황으로 넣을까요, 아니면 다른 일을 겪어 보고 싶으세요?

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
        "details": "첫 번째 에피소드와 다른 날, 같은 매장에서 Noah를 만난다. 나는 우유 거품을 내는 법을 배우고 싶어 그 방법과 필요한 순서를 물어본다. 첫 번째 커피 머신을 교환했는지, 교환에 성공했는지, 어떤 제품을 사용하게 되었는지는 정하지 않는다. Noah가 실제로 어떻게 설명하고 도움을 주는지는 플레이에서 정한다.",
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
        "details": "다른 날 같은 가전 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 제대로 만드는 방법을 배우고, 필요한 순서와 요령을 영어로 물어보려 한다. 첫 에피소드의 교환 결과와는 무관하게 체험 코너에 온 상황이며, Noah가 얼마나 자세히 알려 주는지는 실제 대화에서 정한다.",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량을 확인하고 싶다. 정확한 청소 방법이나 세척제의 양은 실제 대화에서 정한다.",
        "number": 5,
        "preview": "같은 매장 직원에게 커피 머신 청소법과 세척제 사용량을 물어보고 싶어요",
        "title": "커피 머신 청소"
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

점심시간에 동료에게 먼저 취미 이야기를 꺼내며 친해지는 상황도 이어서 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Alex",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원이 경력과 맡을 일을 설명할 때 핵심을 차분히 물으며 말이 막혀도 기다려 준다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "20대 후반의 동료. 업무 밖의 이야기를 편하게 나누지만 상대가 업무 이야기를 피하고 싶어 하면 그 뜻을 존중한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt with a charcoal blazer, calm and welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Alex가 새로 합류한 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 경력직이지만 영어로 말하는 것이 서툴러 긴장한 나는 지금까지 해 온 일과 맡게 될 업무를 팀원들에게 설명하려 한다. 말이 막히거나 표현을 고쳐야 하는 상황에서도 핵심 내용을 전달하는 것이 목표다. Alex가 얼마나 기다려 주거나 질문하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "회사 식당에서 Mia와 함께 식사하며 내가 먼저 취미 이야기를 꺼내 대화를 시작하려 한다. 첫 팀 회의 뒤의 관계가 어떻게 되었는지는 정하지 않으며, 업무 이야기는 피하고 사진이나 음악처럼 업무와 관계없는 취미를 이야기하고 Mia의 취미도 물어보려 한다. Mia가 어떤 취미를 말하고 대화가 어떻게 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내고 업무 얘기는 피하고 싶어요",
        "title": "식당에서 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 출근 날과 회사 식당",
    "title": "새 팀에서 첫 대화"
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
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 팀 리더. 회의에서 새 팀원의 경력과 담당 업무를 차분히 듣고, 이해가 안 되는 부분은 부담스럽지 않게 다시 묻는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "20대 후반의 동료. 점심시간에 가벼운 대화를 즐기며, 상대가 긴장하면 천천히 이야기할 수 있도록 기다린다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt with a charcoal blazer, calm but attentive with slightly tense shoulders, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 영어로 지금까지의 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장하고 있어, 준비한 내용을 바탕으로 핵심 경력과 담당 업무를 분명하게 말하고 필요한 경우 표현을 고쳐 다시 설명하려 한다. Daniel이 어떤 질문을 하거나 어떻게 반응할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "첫 팀 회의가 있는 날 회사 식당에서 Maya와 점심을 먹는다. 나는 먼저 취미 이야기를 꺼내 내가 좋아하는 일을 말하고 Maya의 취미도 물으며 대화를 이어가려 한다. 영어가 서툴러 문장을 고르는 데 긴장할 수 있지만, 회의에서 어떤 결과가 있었거나 Maya와 이미 친해졌다고 정하지 않는다. 실제 대화에서 상대의 반응과 대화의 흐름을 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내 대화를 이어가요",
        "title": "점심 대화"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 회사 식당",
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
        "name": "Alex",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 안 되는 부분은 구체적으로 다시 묻는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "20대 후반의 동료. 복사기 사용법을 직접 설명해 주지만, 바쁠 때는 필요한 부분부터 간단히 말한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, light blue shirt and charcoal jacket, welcoming but focused with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원인 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태라, 준비한 경력과 담당 업무를 너무 어렵지 않은 말로 설명하고 필요한 경우 다시 말해 달라고 하려 한다. Alex가 어떤 질문을 하거나 어떻게 반응하는지, 소개가 얼마나 잘 전달되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "사무실에서 양면 복사를 해야 하는 나는 동료 Maya에게 복사기 사용법을 영어로 묻는다. 어떤 문서를 몇 부 복사할지는 대화 중 설명할 수 있으며, 양면으로 복사하려면 복사기의 설정을 어떻게 해야 하는지와 필요한 버튼을 물어보려 한다. Maya가 바쁘거나 설명을 충분히 이해하는지는 정하지 않고, 실제 대화에서 질문과 설명을 주고받는다.",
        "number": 2,
        "preview": "사무실에서 양면 복사를 하려고 동료에게 복사기 사용법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 회의실과 사무실 복사 공간",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료에게 현재 진행 중인 프로젝트의 업무 흐름과 자료 위치를 묻는 상황은 어때요? 영어가 서툰 상태에서 맡은 일을 제대로 시작하기 위해 질문하는 장면이에요. 첫 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Alex",
        "position": 1,
        "role": "30대 초반의 프로젝트 팀원. 새로 온 동료의 소개를 차분히 듣고 맡은 일과 경력에 관해 필요한 질문을 한다."
      },
      {
        "name": "Jordan",
        "position": 2,
        "role": "20대 후반의 사무실 동료. 복사기 사용법을 설명해 달라는 요청을 받으면 직접 해 보이며 차근차근 알려 준다."
      }
    ],
    "cover": "A man in his early thirties, short dark hair, neat business casual clothes, slightly tense but attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, Alex를 비롯한 팀원들 앞에서 짧고 분명하게 말하려 한다. Alex가 어떤 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Jordan"
        ],
        "details": "사무실에서 문서를 복사해야 하는 나는 Jordan에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 복사기 앞에서 필요한 설정을 어떻게 하는지 설명해 달라고 요청하고, 설명을 잘 이해하지 못하면 다시 물어볼 수 있다. Jordan이 어떤 방식으로 설명하고 내가 실제로 복사에 성공하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 사무실",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 안 되는 부분은 구체적으로 다시 묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with a calm encouraging expression and an open posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 지금까지의 경력과 새 팀에서 담당할 업무를 영어로 설명하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태라 말이 막히거나 표현을 고쳐 말할 수 있다. Maya가 얼마나 이해하는지, 추가로 무엇을 묻는지, 소개가 어떻게 끝나는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실",
    "title": "첫 팀 회의 소개"
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
        "role": "30대 후반의 운전자. 사고 직후 긴장했지만 차분하게 사실을 확인하며 필요한 정보를 주고받는다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual gray jacket, tense but composed with both hands slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 차 사고가 난 직후, 나는 상대 운전자 Daniel과 갓길에서 대화한다. 서로의 안전을 확인한 뒤 사고 상황에 대해 필요한 말을 나누고, 연락처와 보험 정보를 교환하려 한다. 나는 내 연락처와 보험 정보를 정확히 전달하고 Daniel의 정보도 확인하려 한다. 사고의 책임이 누구에게 있는지, 상대가 협조할지, 경찰이나 보험사가 어떻게 처리할지는 미리 정하지 않으며 실제 대화에서 결정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받으려 해요",
        "title": "사고 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 정보를 주고받으려 해요",
    "setting": "사고 직후 차를 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 이 상황에서 어떤 장면을 영어로 연습해 보고 싶으세요?

예를 들면, **다음 날 아내에게 먼저 말을 꺼내 사과하고 서로의 생각을 설명하는 순간**이나 **육아 분담을 다시 정하자고 제안하는 순간**처럼 구체적으로 정할 수 있어요. 무엇을 말하고 싶었는지도 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으세요? ಉದ?

```json
[]
```
검사: 관계없는 외국어 조각

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
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
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray sweater, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 한숨을 쉬고 우리를 쳐다보지만 소리치지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
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

같은 비행기에서 다른 상황도 넣어 볼게요. 아기가 계속 울고 있는 가운데 승무원에게 다가가 분유나 아기를 달래는 데 필요한 도움을 요청하는 장면은 어때요? 첫 번째 상황이 잘 풀렸는지는 정하지 않고, 이번에는 승무원에게 필요한 것을 영어로 설명하는 연습이에요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

매장에서 교환을 요청한 뒤, 같은 매장의 사용법 상담 코너에서 새 커피 머신의 기본 사용법을 묻는 상황도 해볼까요? 아직 교환이 이루어졌는지는 정하지 않고, 지금 말씀하신 누수 문제만 연습해도 좋아요.

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
        "name": "Maya",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명과 증거를 차분히 확인하고 화내지 않으며, 교환 요청에 필요한 절차를 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 보여 주며 제품에 문제가 있다는 것을 설명하고 교환을 요청하려 한다. Maya는 화내지 않고 내 설명과 자료를 차분히 확인한다. 제품을 실제로 교환할 수 있는지와 매장의 대응은 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아갔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 산 매장의 고객 서비스 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면부터 정해 볼까요?

예를 들면 집 근처 마트에서 원하는 물건의 위치를 묻기, 병원에서 증상을 설명하기, 집주인에게 고장 난 시설을 말하기, 은행에서 계좌를 만들기, 이웃과 처음 인사하기 같은 상황이 있어요.

가장 먼저 연습하고 싶은 장면을 말해 주세요.

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
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣고 집 상태와 필요한 조치를 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, soft gray sweater, concerned and leaning slightly forward with an attentive expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 빌린 집의 주방 싱크대 아래에서 물이 새기 시작했다. 나는 집주인 Maya에게 문제를 설명하고, 언제 수리할 수 있는지와 그동안 어떻게 해야 하는지를 물으려 한다. 임대 계약서와 물이 새는 모습을 찍은 사진을 가지고 있다. Maya가 바로 수리를 약속하는지, 다른 방법을 제안하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "주방 싱크대 아래에서 물이 새서 집주인에게 수리를 요청해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "주방 싱크대 아래에서 물이 새서 집주인에게 연락해요",
    "setting": "해외에서 빌린 아파트의 주방",
    "title": "해외 생활 첫 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는데, 먼저 말을 꺼내서 양해를 구하는 순간으로 해볼까요? 아기를 달래느라 애쓰고 있다는 점과 조금만 이해해 달라는 말을 전하는 장면이에요.

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 비행기 안에서 승무원에게 아기에게 필요한 도움을 요청하는 상황도 해볼까요? 예를 들어 아기를 잠깐 달래기 위해 따뜻한 물이나 조용한 공간을 부탁하는 장면이에요. 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편해도 고함치지 않고 상대의 설명을 들으려 한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않고 한숨을 쉬며 계속 바라본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하고 대화가 어떻게 풀리는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 시선이 계속 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 말하고 싶으세요?

예를 들면, **욕실에서 물이 새서 사진을 보여 주며 빨리 고쳐 달라고 요청하는 상황**처럼 구체적으로 정할 수 있어요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 문제 상황은 정해졌어요. 이제 동네 모임에서 인사하는 장면을 정해 볼게요. 처음 만난 사람에게 자기소개를 하고 대화를 시작하려는 상황인가요? 모임의 종류나 먼저 꺼내고 싶은 이야기가 있으면 알려 주세요.

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
        "role": "50대 초반의 집주인. 집의 문제를 차분히 확인하고 수리 일정과 비용을 따져 본다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 조심스럽게 대화하지만 상대가 관심사를 말하면 자신의 주말 이야기도 나눈다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual dark sweater, concerned and listening with a measured posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 보여 주는 사진과 실내 온도 기록을 가지고 있다. Daniel에게 문제와 불편을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 요청을 받아들이거나 언제 수리할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 집주인에게 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 대화를 시작한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물어보며 이야기를 이어가려 한다. Maya가 어떤 취미를 말하거나 대화가 어떻게 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 주말 취미로 자전거 타기를 이야기해요",
        "title": "이웃과 첫인사"
      }
    ],
    "hook": "집의 난방이 고장 나 집주인에게 수리를 부탁하고, 동네 모임에서 처음 만난 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "새 동네에서 말하기"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 직원에게 커피 머신의 세척 방법과 관리 주기를 묻는 상황은 어때요? 교환이 되었는지와 관계없이, 매장 사용 설명 코너에서 직접 관리법을 확인하는 장면이에요. 지금 에피소드에 이 상황을 더해 볼까요?

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만나 우유 거품을 내는 법을 물어본다. 첫 번째 에피소드에서 커피 머신을 교환했는지, 교환에 성공했는지는 정하지 않는다. 나는 우유 거품을 만들 때 필요한 방법과 주의할 점을 설명해 달라고 하려 한다. Noah가 얼마나 자세히 알려 주는지는 실제 대화에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 제대로 만들고 싶어 사용 방법과 요령을 질문하려 한다. 첫 번째 에피소드에서 커피 머신을 교환했는지는 전제로 삼지 않으며, 교환 결과와 무관하게 체험 코너에 온 상황이다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품을 내는 법을 물어요",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 청소 방법을 설명해 달라고 하려 한다. 실제로 어떤 방법과 양을 안내받을지는 플레이에서 정한다.",
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

첫 팀 회의에서 경력과 맡을 일을 소개하는 상황이네요. 이어서 회의가 끝난 뒤 한 동료가 다가와 업무 진행 방식이나 이전 경험에 대해 더 묻는 상황도 해 볼까요? 첫 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 초반의 팀 동료. 새로운 사람의 소개를 주의 깊게 듣고, 상대가 긴장하면 차분하게 기다린다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "40대 초반의 팀 리더. 팀원의 경력과 맡은 일을 구체적으로 확인하고, 설명이 막히면 다시 물어본다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, simple business casual outfit, slightly nervous but welcoming with relaxed shoulders, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya",
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 앞으로 맡을 일을 영어로 소개한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 내가 해 온 일과 새로 맡을 업무를 간단히 설명하려 한다. Maya와 Daniel은 소개를 듣고 필요한 내용을 물을 수 있다. 내가 얼마나 잘 설명하는지, 상대가 어떻게 반응하는지, 소개가 어떻게 마무리되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 나는 동료 Maya에게 먼저 취미 이야기를 꺼내며 업무 이야기는 피하려 한다. 내가 좋아하는 취미를 말하고 Maya의 취미도 물으며 사적인 대화를 이어가려 한다. 첫 팀 회의에서 어떤 대화가 오갔는지와 관계가 어떻게 되었는지는 미리 정하지 않으며, Maya가 어떤 취미와 반응을 보일지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내고 업무 이야기는 피하려고 해요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 점심시간의 회사 식당",
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
        "role": "30대 후반의 팀 리더. 새로 온 팀원의 경력과 맡을 일을 들으며 필요한 내용을 차분히 확인한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에 가벼운 대화를 나누며 상대가 먼저 꺼낸 취미 이야기에 자연스럽게 반응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, slightly nervous but welcoming with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 영어로 지금까지의 경력과 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태에서 직접 말하기 시작한다. Maya는 팀 리더로 회의에서 소개를 듣는다. 내가 경력과 담당 업무를 얼마나 자연스럽게 설명하는지, Maya가 어떻게 반응하고 어떤 질문을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 동료 Daniel과 점심을 먹으며 취미 이야기를 꺼내려 한다. 나는 내가 좋아하는 취미를 말하고 Daniel에게도 취미를 물으며 대화를 이어가려 한다. 첫 팀 회의에서 어떤 말을 했거나 어떤 반응을 받았는지는 정하지 않으며, Daniel과 어떤 대화가 이어지는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 제 취미를 말하고 그의 취미도 물어봐요.",
        "title": "점심시간 대화"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "새로 입사한 해외 회사의 회의실과 회사 식당",
    "title": "새 회사에서 시작하기"
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
        "role": "30대 후반의 팀 리더. 새로 합류한 사람의 경력과 맡을 일을 차분히 확인하고, 설명이 모호하면 구체적으로 다시 묻는다."
      },
      {
        "name": "Lucas",
        "position": 2,
        "role": "30대 초반의 팀 동료. 사무실 기기를 자주 사용하며, 복사하려는 내용을 확인한 뒤 순서대로 설명한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart blazer over a simple blouse, attentive with a calm encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 새 팀에서 담당할 업무를 간단히 설명하고 질문을 받을 수 있다. Maya가 얼마나 도와주거나 되묻는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Lucas"
        ],
        "details": "사무실 복사기 앞에서 양면 복사를 해야 하는 나는 동료 Lucas에게 사용법을 영어로 묻는다. 복사할 자료가 있고 한 장의 앞뒤 면에 복사하려 하지만, 복사기의 조작 순서와 설정을 모르는 상황이다. 나는 필요한 설정을 확인하고 직접 복사하는 방법을 설명받으려 한다. Lucas가 어떤 방식으로 알려 주고 복사가 잘되는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 양면 복사하는 법을 동료에게 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 소개하고 사무실에서 양면 복사하는 법도 물어봐요",
    "setting": "해외 회사의 첫 팀 회의실과 사무실 복사 공간",
    "title": "새 회사에서 말 걸기"
  }
]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 회의가 끝난 뒤 동료에게 업무 자료를 어디서 찾는지 묻고 앞으로 맡을 일을 확인하는 상황은 어때요? 첫 회의에서 자기소개를 한 뒤라 영어로 다시 말을 걸기 부담스럽지만, 업무를 시작하려면 필요한 정보를 얻어야 하는 장면이에요. 지금 정한 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 중반의 팀 동료. 새로 합류한 사람의 경력과 맡을 일을 차분히 듣고, 필요한 설명은 천천히 해준다."
      }
    ],
    "cover": "A man in his mid thirties, short dark hair, light blue shirt and charcoal cardigan, attentive with a calm encouraging expression and slightly open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 짧고 분명하게 내 경험과 담당 업무를 말하려 한다. Alex가 어떤 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다. 회의가 끝난 뒤 사무실에서 Alex에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 복사기 사용법을 설명받을 수 있는지는 실제 대화에서 정하며, 첫 회의에서 어떤 소개를 했는지에 따라 말을 꺼내는 방식이 달라질 수 있다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Alex"
        ],
        "details": "첫 팀 회의가 끝난 뒤 사무실에서 나는 동료 Alex에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 업무에 필요한 자료를 준비하려고 복사기를 사용해야 하지만, 사용법을 잘 몰라 도움을 요청하는 상황이다. 나는 양면으로 복사하는 방법을 이해하고 직접 해보려 하며, Alex가 얼마나 자세히 설명하거나 도와줄지는 실제 대화에서 정한다. 앞선 자기소개가 어떻게 진행되었는지에 따라 다시 말을 거는 방식은 달라질 수 있지만, 복사기의 양면 복사 방법을 묻는 상황은 유지한다.",
        "number": 2,
        "preview": "사무실에서 동료에게 복사기의 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 회의가 끝난 뒤의 사무실",
    "title": "새 팀에서 첫걸음"
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, attentive with an encouraging but focused expression, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 시작하는 순간이다. 나는 경력직으로 입사했으며 지금까지의 경력과 이번 팀에서 맡을 일을 영어로 설명하려 한다. 영어가 서툴러 긴장하고 있어서 문장을 고쳐 말하거나 잠시 멈출 수 있다. Maya는 팀 리더로서 내 소개를 듣고 경력과 담당 업무를 확인하려 한다. 내가 얼마나 자연스럽게 말하는지나 Maya가 어떻게 받아들이는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개하려고 해요.",
        "title": "첫 팀 자기소개"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개하려고 해요.",
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
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 차분하게 사실을 확인하려 하며, 연락처와 보험 정보를 교환하는 대화에 응한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket over a shirt, tense but trying to stay calm, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 내 차와 Daniel의 차가 사고가 난 직후다. 차를 안전한 곳에 세운 뒤, 나는 Daniel에게 먼저 말을 걸어 서로의 연락처와 보험 정보를 교환하려 한다. 사고 상황에 대한 기억이 다를 수 있고 Daniel이 어떤 태도로 반응할지는 정하지 않는다. 실제 대화에서 필요한 정보를 확인하고 교환이 이루어지는지는 내가 하는 말에 따라 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 난 뒤 상대 운전자에게 연락처와 보험 정보를 요청해요",
        "title": "사고 직후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 난 뒤 상대 운전자에게 연락처와 보험 정보를 요청해요",
    "setting": "사고 직후 차량을 안전하게 세운 고속도로 갓길",
    "title": "사고 직후"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 영어로 연습하고 싶은 장면은 **싸운 다음 날 아내와 다시 대화하며 서로의 입장을 설명하고, 육아 분담에 대해 이야기하는 순간**으로 해볼까요?

예를 들면, 아내가 “당신은 육아를 나만의 일처럼 생각해”라고 말했고, 나는 억울함을 설명하면서 앞으로 어떻게 나눌지 이야기하려는 상황이에요.  
혹시 실제로는 **사과하고 싶은지, 내 입장을 설명하고 싶은지, 구체적인 육아 분담을 정하고 싶은지** 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련해 어떤 상황에서 영어로 대화해 보고 싶으세요?  
예를 들면 비행기 결항을 문의하거나, 우산을 빌리거나, 비 오는 날 택시 기사에게 목적지를 설명하는 상황처럼 정해 볼 수 있어요.

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
        "role": "40대 초반의 승객. 아기의 울음에 불편함을 느끼지만 고함치지 않고 한숨과 시선으로 반응하며, 설명을 들으면 끝까지 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray sweater, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리의 Emma는 고함치지 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저와 아기를 쳐다봐요",
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

같은 비행기에서 승무원에게 아기를 달랠 수 있도록 따뜻한 물이나 필요한 도움을 요청하는 상황은 어때요? 옆자리 승객과의 대화가 어떻게 끝났는지와 관계없이 이어갈 수 있어요. 지금 정한 에피소드와 함께 넣어도 좋아요.

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 커피 머신 교환을 요청하는 상황이네요. 직원은 화내지 않고 차분하게 확인하는 사람으로 두겠습니다.

이어서 같은 매장에서 새 커피 머신의 사용법을 묻는 상황도 해볼까요? 교환이 실제로 되었는지와 관계없이, 매장 사용법 안내 코너에서 직원에게 올바른 사용 방법과 누수를 막기 위해 확인할 점을 묻는 장면이에요. 지금 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 영수증과 제품 상태를 차분히 확인하며 손님의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 산 커피 머신에서 물이 새어 매장에 가져온다. 나는 영수증과 누수 영상을 보여 주며 제품에 문제가 생겼다는 것을 설명하고 교환을 요청하려 한다. Mia는 화내지 않고 영수증과 영상, 제품 상태를 차분히 확인한다. 교환이 가능한지, 추가 확인이 필요한지, 다른 해결 방법을 제안할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "고장 난 커피 머신을 들고 찾아간 매장 안내 창구",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 자주 겪는 순간부터 연습해 볼까요?

예를 들면 이런 장면이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻기
- 마트에서 원하는 물건의 위치나 성분을 묻기
- 병원에서 증상을 설명하고 진료받기
- 은행이나 관공서에서 계좌나 서류 문제를 처리하기
- 직장이나 학교에서 자기소개하고 도움을 요청하기
- 이웃이나 동료와 처음 대화하기

가장 먼저 연습하고 싶은 상황을 골라 주세요. 장소와 누구와 대화하는지, 무엇을 해결하려는지도 함께 말해 주시면 장면을 구체적으로 만들어 볼게요.

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
        "role": "30대 초반의 집주인. 임대 조건과 생활 규칙을 차분하게 설명하고, 모호한 부분은 구체적으로 되묻는다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, simple beige sweater and dark trousers, attentive with a cautious but welcoming expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 지낼 집을 알아보며 집주인 Maya와 처음 만난다. 나는 집의 월세와 보증금, 공과금에 포함되는 항목, 계약 기간을 영어로 확인하고 싶다. 입주 가능한 날짜와 집에서 지켜야 할 생활 규칙도 묻으려 한다. Maya가 조건을 어떻게 설명하거나 조정하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외에서 지낼 집을 보러 가서 집주인에게 계약 조건을 물어봐요",
        "title": "집 구하기"
      }
    ],
    "hook": "해외에서 지낼 집을 보러 가서 집주인에게 계약 조건을 물어봐요",
    "setting": "해외 도시의 작은 임대 주택",
    "title": "낯선 곳에서 살기"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속되는 가운데, 옆자리 승객이 한숨을 쉬며 쳐다보는 순간으로 해볼까요? 아기 때문에 미안하다고 말하면서도, 최선을 다하고 있으니 조금만 이해해 달라고 부탁하는 상황이에요.

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어지는 다른 에피소드로, 비행기에서 내린 뒤 공항에서 아기와 함께 이동할 길을 찾으며 안내 직원에게 묻는 상황도 해볼까요? 지금 정한 옆자리 승객 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편해도 화내지 않고 상대의 설명을 차분히 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 상황이 어떻게 풀리는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 해외에서 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하고 싶으세요?  
예를 들면 물이 새거나 난방이 안 되는 상황에서, 언제까지 고쳐 달라고 요청하는 장면이에요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 문제를 사진과 온도 기록으로 설명하고, 이번 주 안에 수리해 달라고 요청하는 상황으로 잡을게요.

이어서 동네 모임에서 처음 만난 사람들에게 인사하고, 사는 곳이나 모임에 오게 된 이유를 간단히 이야기하는 상황도 해 볼까요? 지금 정한 집주인과의 대화만 만들어도 좋아요.

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
        "role": "40대 후반의 집주인. 집 상태와 수리 요청을 차분히 확인하며 일정과 비용을 먼저 따져 본다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 예의 바르게 인사하고 주말 취미를 편하게 묻는다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater, concerned and listening carefully with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮게 유지되고 있다. 나는 난방 문제를 보여 주는 사진과 온도 기록을 가지고 Daniel에게 상황을 설명하려 한다. 이번 주 안에 수리를 끝내 달라고 부탁하려 하며, 수리 일정과 방법이 어떻게 정해질지는 실제 대화에서 사용자의 말과 Daniel의 반응에 따라 정한다. Daniel이 바로 수리해 주거나 요청을 받아들이는 결과는 미리 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 대화를 시작한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물어보며 이야기를 이어가려 한다. 처음 만난 자리인 만큼 자연스럽게 자기소개와 취미 이야기를 나누는 상황이며, Maya가 어떤 취미를 말하거나 대화가 얼마나 이어질지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "동네 첫인사"
      }
    ],
    "hook": "난방이 고장 난 집주인과 이야기하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "새 동네에서 말하기"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 직원에게 커피 머신의 기본 사용법과 세척 방법을 묻는 상황을 이어서 넣어 볼까요? 교환이나 환불 결과와 관계없이, 매장에 있는 체험 제품을 보며 안전하게 사용하는 법을 질문하는 장면이에요. 기존 에피소드만 그대로 두어도 좋아요.

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
        "details": "첫 에피소드와 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 어떤 우유를 써야 하는지와 거품을 내는 순서를 설명해 달라고 하려 한다. 첫 에피소드에서 교환에 성공했는지, 어떤 커피 머신을 갖고 있는지는 정하지 않는다. Noah가 직접 시범을 보이거나 다른 방법을 안내할지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah를 다시 만나 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 사용법 체험 공간",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 첫 번째 에피소드에서 커피 머신을 교환했는지와 관계없이 이 체험 코너에 방문한다. Noah가 어떤 설명이나 도움을 주는지는 실제 대화에서 정한다.",
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
        "details": "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 환불을 요청한다. 직원은 화내지 않으며 환불 결과는 아직 모른다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 환불하고 싶어요",
        "title": "환불 요청"
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적절한 양과 청소 방법을 설명해 달라고 한다. 실제로 올바른 방법을 안내받는지는 플레이에서 정한다.",
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
