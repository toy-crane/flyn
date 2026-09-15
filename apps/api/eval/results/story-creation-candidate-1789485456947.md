# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:17:36.947Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 815fcd75b98f44a0a0f229204af7f326116303a22b73f6612820a4f5e4f0e05a
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

첫 팀 회의에서 경력과 앞으로 맡을 일을 영어로 소개하는 순간이네요. 이어서 점심시간에 동료에게 먼저 취미를 물으며 친해지는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "name": "Daniel",
        "position": 1,
        "role": "40대 초반의 팀 리더. 새로 합류한 사람의 경력과 맡을 일을 차분히 듣고 필요한 점을 질문한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 동료. 업무 이야기는 자연스럽게 피하고 개인적인 관심사에는 편안하게 반응한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, light blue shirt and charcoal blazer, nervous but composed with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 준비한 경력과 담당 업무 내용을 바탕으로 또박또박 설명하고 질문을 들으려 한다. Daniel이 어떤 질문을 하거나 반응할지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 식사를 하며 내가 먼저 취미 이야기를 꺼내고, 서로의 관심사를 이야기하려 한다. 업무 이야기는 피하고 싶어서 일이나 프로젝트에 관한 질문으로 대화가 흘러가면 취미와 개인적인 관심사 쪽으로 돌리려 한다. 내가 어떤 취미를 말할지는 대화 중 정하고, Maya가 얼마나 대화를 이어 갈지는 미리 정하지 않는다.",
        "number": 2,
        "preview": "회사 식당에서 먼저 취미 이야기를 꺼내 업무 얘기를 피하고 싶어요",
        "title": "식당에서 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 구체적으로 되묻는다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "20대 후반의 동료 개발자. 먼저 편하게 말을 걸고, 상대가 말한 취미에 관심을 보이며 자기 이야기도 나눈다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, tailored charcoal blazer over a pale blue shirt, attentive and slightly encouraging with an upright posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya를 비롯한 팀원들 앞에 선다. 경력직으로 합류한 나는 지금까지의 경력과 이번 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장한 상태지만, 준비한 내용을 바탕으로 내 경험과 담당 업무를 분명하게 전달하고 질문을 들으려 한다. Maya가 얼마나 이해하거나 어떤 질문을 하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Leo"
        ],
        "details": "회사 식당에서 동료 Leo와 점심을 먹으며 대화를 시작한다. 나는 취미 이야기를 먼저 꺼내고, 내가 사진 찍는 것을 좋아한다는 등 내 취미를 말한 뒤 Leo에게도 취미를 물어보며 자연스럽게 대화를 이어가려 한다. Leo가 어떤 반응을 보이고 어떤 이야기를 나누는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심시간의 대화"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 팀 리더. 회의에서 새 팀원의 경력과 담당 업무를 차분히 듣고 필요한 내용을 물어본다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 알고 있으며, 질문을 받으면 직접 설명하거나 확인할 부분을 짚어 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blazer over a blouse, attentive and encouraging with a slightly tense smile, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya와 팀원들 앞에 새로 합류한 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 지금까지 해 온 일과 새 팀에서 담당할 업무를 간단히 설명하려 한다. Maya가 어떤 질문을 하거나 얼마나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "첫 팀 회의가 있는 해외 회사 사무실에서 복사기를 사용해야 하는 나는 Daniel에게 양면 복사 방법을 영어로 묻는다. 복사기에 문서를 넣고 필요한 설정을 확인하면서, 양면으로 복사하려는 목적을 설명하고 사용법을 이해하려 한다. Daniel이 바로 도와줄 수 있는지, 복사기가 어떤 설정을 요구하는지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어요.",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 주간 사무실",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

좋아요. 점심시간 말고, 첫 팀 회의가 끝난 뒤 동료에게 업무 진행 방법이나 회사 시스템 사용법을 묻는 상황은 어때요? 예를 들어 맡은 일을 시작하려는데 팀의 업무 절차가 익숙하지 않아 동료에게 도움을 요청하는 장면이에요. 이런 방향이 맞을까요, 아니면 다른 업무 상황을 원하세요?

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
        "role": "30대 중반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고 필요한 경우 짧게 질문한다."
      },
      {
        "name": "Liam",
        "position": 2,
        "role": "20대 후반의 동료 직원. 사무실 기기 사용법을 친절하게 알려 주지만 업무 중에는 설명을 간단히 한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, attentive with a calm encouraging expression and open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 내 경험과 담당 업무를 설명하고 팀 리더의 질문에 답하려 한다. Maya가 얼마나 협조적인지, 내가 소개를 얼마나 잘하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Liam"
        ],
        "details": "해외 회사 사무실에서 문서를 양면으로 복사하려는데 복사기 사용법이 익숙하지 않다. 나는 동료 Liam에게 양면 복사를 어떻게 하는지 영어로 물어보고, 필요한 설정을 설명해 달라고 하려 한다. Liam이 바로 도와줄 수 있는지와 복사가 원하는 대로 되는지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 출근 날 사무실",
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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 이해가 필요한 부분은 다시 물어본다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, light blue blouse and charcoal blazer, welcoming but attentive with slightly tense shoulders and open hands, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새 팀원인 나에게 경력과 맡을 일을 영어로 소개해 달라고 한다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태에서 이전 경력과 이번 팀에서 맡을 업무를 설명하려 한다. Maya가 내 말을 얼마나 이해하거나 어떤 추가 질문을 하는지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
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
        "role": "30대 후반의 상대 운전자. 사고 직후 긴장했지만 감정을 크게 드러내지 않고 필요한 정보를 차례로 확인한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, wearing a casual gray jacket, tense and cautious with one hand slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 내 차와 Daniel의 차가 사고가 난 직후다. 양쪽 모두 차를 안전한 곳에 세우고 사고 현장을 확인한 상태에서, 나는 Daniel에게 연락처와 보험 정보를 교환하자고 말하려 한다. 사고의 책임을 단정하거나 현장에서 합의하지 않고, 필요한 연락처와 보험 정보만 정확히 확인하려 한다. Daniel이 정보를 제공하는지, 사고 상황에 대해 어떻게 반응하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 확인해요",
        "title": "사고 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 확인해요",
    "setting": "사고 직후 차량을 안전하게 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

어떤 순간을 영어로 풀어 보고 싶으세요?

예를 들면, **아이를 재운 뒤 부부끼리 다시 대화하는 장면**에서 서로의 입장을 설명하고 사과하거나, 앞으로 육아를 어떻게 나눌지 이야기하는 상황으로 구체화할 수 있어요.  
아내에게 **무엇을 말하고 싶은지**와 대화의 장소도 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련된 어떤 상황에서 영어로 대화해 보고 싶으세요? 예를 들면 비행기 지연, 우산을 빌리기, 비 오는 날 길을 묻기처럼 구체적인 장면을 말해 주세요.

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
        "role": "40대 초반의 사무직 직장인. 조용히 쉬는 시간을 소중히 여기며 불편할 때 한숨과 시선으로 반응하지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 소리를 지르거나 직접 화내지는 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 계속 애쓰고 있다는 것을 설명하고, 상황이 쉽지 않으니 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 울음"
  }
]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 승무원에게 아기를 위해 따뜻한 물이나 담요를 부탁하는 상황은 어때요? 아기의 울음이 멈췄다고 정하지 않고, 필요한 도움을 영어로 요청하는 장면이에요. 지금 에피소드에서만 끝내도 좋아요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

매장에서 커피 머신을 교환해 달라고 요청하는 상황이네요. 영수증과 누수 영상을 보여 주고, 직원은 화내지 않지만 교환 가능 여부는 대화 속에서 확인하는 장면으로 잡을게요.

이어서 같은 매장에서 직원에게 새 커피 머신의 사용법과 누수를 막기 위한 관리 방법을 묻는 상황도 해 볼까요? 지금 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 차분하게 고객의 설명과 증거를 확인하며, 화내지 않고 매장 절차에 따라 응대한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm but concerned expression, holding her hands open in a polite explaining gesture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 내가 보여 주는 영수증과 영상을 확인한다. 교환이 가능한지, 추가 확인이나 매장 절차가 필요한지는 실제 대화에서 정하며 결과를 미리 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 교환을 요청하러 왔어요",
    "setting": "커피 머신을 산 매장의 고객 응대 창구",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면부터 연습해 볼까요?

예를 들면 **처음 도착한 날 집주인에게 집에 문제가 있다고 설명하기**, **마트에서 원하는 물건을 찾고 직원에게 묻기**, **병원이나 약국에서 증상을 설명하기**, **직장에서 동료와 처음 대화하기** 같은 상황이 있어요.

가장 먼저 연습하고 싶은 장면이 있나요?

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
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣고 집 상태와 수리 필요성을 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, casual beige sweater and jeans, concerned and listening with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 지내는 집의 욕실에서 물이 제대로 빠지지 않는 문제가 생겼다. 나는 집주인 Maya에게 현재 어떤 문제가 있는지, 언제부터 시작됐는지, 생활에 어떻게 불편을 주는지 영어로 설명하고 수리를 요청하려 한다. 문제를 직접 고칠 수 있는지, Maya가 언제 어떻게 대응할지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 지낸 집의 욕실에 문제가 생겨 집주인에게 설명해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "새로 지낸 집의 욕실에 문제가 생겨 집주인에게 설명해요",
    "setting": "해외의 임대 아파트",
    "title": "낯선 집에서 살기"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속되고, 옆자리 승객의 시선이 신경 쓰이는 순간부터 해볼까요? 옆자리 승객에게 상황을 설명하고 조금만 이해해 달라고 말하는 장면이에요.

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 승무원에게 아기에게 필요한 것을 부탁하는 상황도 해볼까요? 같은 비행기에서 아기를 달래는 데 쓸 따뜻한 물이나 다른 도움을 요청하는 장면이에요. 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 승객. 불편함을 한숨과 시선으로 드러내지만 화를 내지는 않고 상대의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and quietly concerned while glancing toward someone beside her, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객인 Emma는 화를 내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 상황이 어떻게 풀리는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인과 수리 얘기하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 요청하고 싶으세요?  
예를 들면 “욕실 수도꼭지가 새서 수리를 요청하고 싶다”처럼 말씀해 주시면 돼요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임에서 인사하는 장면을 정해 볼까요? 처음 만난 이웃들에게 자기소개를 하고 대화를 시작하려는 상황인가요, 아니면 이미 아는 사람에게 자연스럽게 인사하려는 상황인가요?

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
        "role": "40대 후반의 집주인. 수리 요청을 받으면 상황과 일정을 확인하며, 구체적인 자료가 있으면 차분히 검토한다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게도 편하게 말을 걸며 주말에 하는 일을 서로 묻는다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 집주인 Daniel에게 보여 주며 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정을 잡거나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 수리를 요청해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Sophie에게 먼저 인사한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Sophie의 주말 취미도 물으며 대화를 이어가려 한다. Sophie가 어떤 취미를 말하고 대화가 어떻게 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 주말 취미를 이야기해요",
        "title": "동네 모임 인사"
      }
    ],
    "hook": "해외에서 난방 문제를 설명하고 처음 만난 이웃과 취미 이야기를 나눠요",
    "setting": "난방이 고장 난 해외 임대 주택과 주말 동네 모임",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 직원에게 커피 머신의 기본 사용법이나 관리 방법을 묻는 상황을 이어서 넣어 볼까요? 교환이 되었는지와 관계없이, 매장에 방문해 물이 새지 않게 사용하는 법을 확인하는 장면이에요. 지금 에피소드만으로도 충분하니 원하면 이 장면을 추가해 만들게요.

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
        "details": "다른 날 같은 매장에서 Noah를 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신을 사용할 때 필요한 방법을 설명해 달라고 한다. 첫 에피소드에서 교환이 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않는다.",
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
        "details": "첫 번째 사건과 다른 날, 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 내는 방법과 주의할 점을 영어로 물어보려 한다. 첫 번째 사건에서 커피 머신을 교환했는지, 문제가 해결됐는지는 정하지 않으며, 그 결과와 무관하게 체험 코너에 방문한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 Noah에게 우유 거품 내는 법을 물어요",
        "title": "우유 거품 배우기"
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

같은 매장에서 직원에게 커피 머신의 보증 기간과 수리 절차를 물어보는 상황을 추가해 볼까요? 앞선 교환 요청이 어떻게 끝났는지와 관계없이 연습할 수 있어요. 지금까지의 에피소드만으로도 충분하다면 그렇게 해도 좋아요.

```json
[]
```
검사: 상한 안내 없음

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 방법을 확인하려 한다. 앞선 에피소드에서 교환이나 다른 요청이 어떻게 끝났는지는 정하지 않는다.",
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

첫 팀 회의에서 경력과 앞으로 맡을 일을 영어로 소개하는 순간을 연습해 볼게요. 경력직이지만 영어가 서툴러 긴장한 상태에서, 지금까지 해 온 일과 새 팀에서 맡을 업무를 간단히 설명하면 돼요.

이어서 점심시간에 동료에게 먼저 취미 이야기를 꺼내며 친해지는 상황도 넣어 볼까요? 지금 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람이 말을 이어 갈 시간을 준다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에는 업무에서 벗어난 가벼운 대화를 좋아하고, 상대가 먼저 꺼낸 취미 이야기에 자연스럽게 반응한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, light blue shirt and charcoal jacket, composed but encouraging with relaxed shoulders, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Daniel을 포함한 팀원들 앞에 서서 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개한다. 나는 경력직이지만 영어가 서툴러 긴장하고 있으며, 준비한 내용을 바탕으로 경력과 담당 업무를 설명하려 한다. 말이 막히거나 긴장하는 상황에서 Daniel의 반응과 대화의 흐름은 실제 플레이에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "회사 식당에서 Maya와 점심을 먹으며 내가 먼저 업무 이야기가 아닌 취미 이야기를 꺼내려 한다. 내 취미를 말하고 Maya의 취미도 물으며 대화를 이어 가고 싶어 하며, 대화에서는 업무 이야기를 피하고 싶다. Maya가 어떤 취미를 말하거나 대화가 어떻게 이어지는지는 실제 플레이에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 동료에게 먼저 취미 이야기를 꺼내요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 초반의 팀 리더. 새 팀원의 경력과 담당 업무를 차분히 듣고 필요한 내용을 물어본다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 중반의 동료. 점심시간에 편하게 대화하지만 낯선 사람에게는 먼저 말을 많이 걸지 않는다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, smart casual blouse and blazer, nervous but composed with hands lightly clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 시작하는 순간이다. 나는 경력직으로 합류했고, 지금까지의 경력과 새 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있으며, 준비한 내용을 바탕으로 천천히 말하고 필요한 경우 다시 설명하려 한다. Maya가 어떤 질문을 하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹으며 대화를 시작하는 순간이다. 나는 취미 이야기를 먼저 꺼내고, 내가 좋아하는 일을 말한 뒤 Daniel의 취미도 물어보며 자연스럽게 대화를 이어가려 한다. 첫 팀 회의에서 어떤 소개를 했는지나 그 결과는 미리 정하지 않으며, Daniel이 얼마나 편하게 대화하는지도 실제 플레이에서 정한다.",
        "number": 2,
        "preview": "점심시간에 동료에게 먼저 취미 이야기를 꺼내고 물어봐요",
        "title": "점심 취미 대화"
      }
    ],
    "hook": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
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
        "name": "Daniel",
        "position": 1,
        "role": "40대 초반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 듣고, 긴장한 사람에게도 업무 관련 질문을 분명하게 한다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 알고 있으며, 복사기의 설정을 직접 설명해 준다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, light blue shirt with rolled sleeves, attentive and encouraging while standing upright before a meeting, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 자기소개를 하는 순간이다. 나는 경력직으로 합류했지만 영어가 서툴러 긴장한 상태에서 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. Daniel은 팀 리더로서 내 소개를 듣고 업무와 관련된 질문을 할 수 있다. 내가 얼마나 자연스럽게 말하는지나 Daniel이 어떻게 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "사무실에서 양면 복사를 해야 하는데 복사기 설정 방법을 모르겠다. 나는 동료 Mia에게 양면으로 복사하는 방법을 영어로 묻고, 필요한 설정을 설명해 달라고 하려 한다. Mia가 곁에서 복사기를 확인하며 어떤 방식으로 안내할지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 양면 복사를 해야 해서 동료에게 복사기 사용법을 물어요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 팀 회의와 사무실 복사기 앞",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 2번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 팀 회의가 끝난 뒤 동료에게 회사에서 사용하는 협업 도구의 기본 사용법을 묻는 상황은 어때요? 영어가 서툴러도 다시 설명해 달라고 말하고, 내가 맡은 일을 시작하기 위해 필요한 정보를 얻는 장면이에요. 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 팀 리더. 새 팀원의 경력과 맡을 일을 차분히 확인하고, 설명이 막히면 구체적으로 다시 묻는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 편하게 설명하며, 상대가 직접 해 보도록 기다린다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, light blue blouse and charcoal blazer, composed but attentive with a slightly nervous newcomer in mind, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원인 나는 영어로 내 경력과 앞으로 맡을 일을 소개하려 한다. 경력직으로 합류했지만 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 경력과 담당 업무를 분명하게 말하려 한다. Maya가 질문하거나 이해하는 방식과 내가 말을 이어 가는 과정은 실제 대화에서 정한다. 자기소개가 순조롭게 끝났다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "같은 회사 사무실에서 나는 동료 Daniel에게 복사기의 양면 복사 방법을 영어로 물어보려 한다. 복사기를 사용해야 하지만 양면 복사 방법을 몰라서, 필요한 기능을 설명하고 사용 순서를 알려 달라고 부탁하려 한다. Daniel이 바로 도와주는지, 내가 추가로 무엇을 묻는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 복사기를 쓰다가 동료에게 양면 복사 방법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 팀 회의실과 이어지는 사무실",
    "title": "새 회사 첫날"
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
        "role": "30대 후반의 팀 리더. 회의에서 새 팀원의 소개를 차분히 듣고, 맡은 일을 구체적으로 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, light blue blouse and charcoal blazer, attentive with a calm encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya가 새로 합류한 나에게 경력과 앞으로 맡을 일을 소개해 달라고 한다. 나는 경력직이지만 영어가 서툴러 긴장한 상태에서 이전 경력과 이번 팀에서 맡을 업무를 영어로 설명하려 한다. 준비한 내용을 모두 자연스럽게 말할 수 있는지, Maya가 추가로 무엇을 물을지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
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
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 상대 운전자. 사고 직후라 긴장했지만 차분하게 사실을 확인하며 필요한 정보를 주고받으려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed with one hand slightly raised in a calming gesture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 차량 사고가 난 직후, 안전을 위해 차를 세운 뒤 Daniel과 연락처와 보험 정보를 교환하려 한다. 나는 사고 상황을 간단히 확인하고, 서로의 이름과 전화번호, 보험 정보를 정확히 주고받으려 한다. 필요한 경우 경찰이나 보험사에 알릴 수 있도록 정보를 기록하려 하지만, 사고의 책임이 누구에게 있는지나 보험 처리가 어떻게 끝날지는 정하지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받아요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 주고받아요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상하셨겠어요. 영어로는 싸운 뒤 아내와 다시 대화하며 서로의 입장을 설명하고 육아 방식을 조율하는 상황을 연습해 볼까요?

예를 들면, **아이를 재우거나 돌보는 방식 때문에 의견이 엇갈린 뒤, 먼저 대화를 꺼내 사과할 부분은 사과하고 앞으로 어떻게 나눌지 이야기하는 순간**이에요. 어떤 장면을 원하세요?

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으세요? 장소와 상대, 그리고 무엇을 말하고 싶은지 조금만 알려 주세요.

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
        "role": "40대 초반의 승객. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬고 쳐다보지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 고함치거나 직접 항의하지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 상황을 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저희를 쳐다봐요",
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

같은 여행에서 이어지는 다른 상황으로, 비행기에서 내린 뒤 공항 대기 공간에서 Emma를 다시 만나 짧게 말을 나누는 에피소드는 어때요? 아기 이야기를 계속하기보다 여행지나 사진처럼 가벼운 주제로 대화를 시작해 볼 수 있어요. 기존 에피소드만 두고 끝내도 좋아요.

```json
[]
```
검사: 통과

## 2번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 매장 직원에게 커피 머신 교환을 요청하는 순간으로 연습해 볼게요. 직원은 화내지 않고 차분하게 상황을 확인하는 사람으로 두겠습니다.

이어서 같은 매장에서 새 커피 머신의 사용법을 직원에게 묻는 상황도 해볼까요? 지금 교환 요청 에피소드만 만들어도 좋아요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 영상을 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple store uniform, calm and attentive with one hand slightly raised as if listening, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 이 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 물이 새는 모습을 촬영한 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 영수증과 영상을 차분히 확인하며 내 설명을 듣는다. 교환이 가능한지와 실제 처리 결과는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요.",
    "setting": "커피 머신을 산 매장의 고객 응대 창구",
    "title": "새 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 순간부터 연습해 볼까요? 예를 들면 **이사한 동네의 슈퍼마켓에서 원하는 물건의 위치와 결제 방법을 묻는 상황**이에요.

이 장면이 괜찮은지, 아니면 집 구하기·은행 업무·병원·직장·이웃과의 대화처럼 다른 상황을 원하시는지 말해 주세요.

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
        "role": "30대 초반의 슈퍼마켓 직원. 손님의 말을 차분히 듣고 매장 안에서 물건을 찾도록 도와준다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, green supermarket vest over a white shirt, attentive and slightly unsure, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 생활을 시작한 나는 동네 슈퍼마켓에서 필요한 생활용품을 찾지 못하고 있다. Maya에게 물건의 위치를 묻고, 비슷한 제품의 차이와 가격을 확인한 뒤 내게 맞는 것을 고르려 한다. 내가 찾는 물건을 정확히 설명하지 못하거나 직원의 말을 놓칠 수 있지만, Maya가 바로 이해하거나 원하는 제품을 찾게 되는지는 정하지 않는다.",
        "number": 1,
        "preview": "동네 슈퍼마켓에서 필요한 생활용품을 찾지 못해 직원에게 물어봐요",
        "title": "슈퍼마켓에서 묻기"
      }
    ],
    "hook": "새로 이사 온 동네의 슈퍼마켓에서 필요한 물건을 찾지 못해요",
    "setting": "해외에서 새 생활을 시작한 동네 슈퍼마켓",
    "title": "낯선 동네에서 살기"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 계속되는 가운데, 옆자리 승객이 한숨을 쉬며 쳐다봐 먼저 말을 꺼내야 하는 순간으로 해볼까요? 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 말하는 상황이에요.

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 같은 여행 중 공항에서 직원에게 유모차가 늦게 나오는 상황을 설명하고 도움을 요청하는 에피소드도 해볼까요? 지금 정한 옆자리 승객과의 대화만 만들어도 좋아요.

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
        "role": "40대 초반의 회사원. 불편하면 한숨을 쉬거나 시선을 보내지만, 상대가 차분히 설명하면 끝까지 들어준다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, looking tired but restrained with one hand slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울음을 멈추지 않는다. 옆자리의 Emma는 화를 내거나 소리치지는 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 아기가 울음을 멈추는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 시선이 계속 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 집주인과 수리 문제를 이야기하는 장면부터 정해 볼게요. 해외에서 빌린 집에 문제가 생겨 집주인에게 직접 설명하고 수리를 요청하는 상황이 맞나요?

예를 들면 **욕실 누수, 난방 고장, 온수 문제**처럼 어떤 수리를 말하고 싶은지 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 이번 주 안에 수리해 달라고 요청하는 장면으로 정할게요.

이제 동네 모임에서 인사하는 상황을 정해 볼까요? 처음 참석한 모임에서 여러 사람 앞에 간단히 자기소개하고, 옆 사람에게 먼저 말을 거는 순간을 연습하고 싶은 건가요? 특별히 소개하고 싶은 취미나 관심사가 있으면 함께 알려 주세요.

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
        "role": "40대 초반의 임대인. 집의 문제를 차분히 확인하고 구체적인 자료가 있으면 내용을 꼼꼼히 듣는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 후반의 이웃. 주말 취미 이야기를 좋아하고 상대의 관심사에도 자연스럽게 질문한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length dark brown hair, casual beige sweater and jeans, concerned but composed with an expectant expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮게 유지되고 있다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 온도 기록을 집주인 Maya에게 제시하려 한다. 이번 주 안에 수리해 달라고 부탁하려 하며, Maya가 언제 수리할 수 있는지나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "처음 참석한 동네 모임에서 처음 만난 이웃 Daniel과 대화한다. 나는 먼저 주말 취미 이야기를 꺼내고, 자전거 타기를 좋아한다고 말한 뒤 Daniel의 주말 취미도 물어보려 한다. 두 사람이 얼마나 가까워지거나 어떤 공통점을 찾는지는 정하지 않는다.",
        "number": 2,
        "preview": "처음 만난 이웃에게 주말 취미를 물으며 제가 좋아하는 자전거 타기를 이야기해요",
        "title": "주말 취미"
      }
    ],
    "hook": "집주인에게 난방 문제를 설명하고 동네 모임에서 새 이웃에게 먼저 말을 걸어요",
    "setting": "해외의 임대 주택과 주말 동네 모임 공간",
    "title": "새 동네에서 말 걸기"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 상황도 연습해 볼게요. 커피 머신 사용법 안내 행사에서 Noah에게 원하는 커피를 만드는 방법을 묻고, 집에서 생긴 문제를 설명하는 장면은 어때요? 첫 에피소드에서 교환이 되었는지와 관계없이 연습할 수 있어요. 지금 에피소드와는 다른 사건으로, 사용법을 배우려는 상황이에요.

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
        "details": "다른 날 같은 가전 매장에서 Noah를 만난다. 나는 우유 거품을 내는 방법을 물어보고, 필요한 순서와 주의할 점을 설명해 달라고 한다. 첫 에피소드에서 커피 머신을 교환했는지, 어떤 결과가 있었는지는 정하지 않는다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 첫 번째 에피소드에서 커피 머신을 교환했는지는 정하지 않으며, 교환 결과와 관계없이 체험 코너에 와서 우유 거품을 만드는 방법을 배우고 직접 질문하려 한다. Noah가 시범을 보이거나 어떤 제품을 사용하는지는 플레이에서 정한다.",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 청소 방법을 설명해 달라고 하려 한다. 청소가 제대로 되는지나 Noah가 어떤 방법을 안내할지는 정하지 않는다.",
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

첫 팀 회의에서 경력과 맡을 일을 소개하며 긴장된 상태로 말하는 상황이네요. 이어서 점심시간에 한 동료가 먼저 말을 걸어, 지금 맡은 일과 이전 회사에서 해 온 일을 조금 더 이야기하는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.

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
        "role": "30대 후반의 팀 리더. 회의에서 새 팀원의 경력과 담당 업무를 차분히 듣고 필요한 부분을 되묻는다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에는 편안한 분위기를 좋아하고 업무 이야기에서 벗어난 대화를 자연스럽게 이어 간다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual blouse and blazer, nervous but composed with her hands lightly clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 팀원들 앞에 영어로 자기소개를 한다. 이전 경력과 지금 맡게 될 일을 설명하려 하지만 영어가 서툴러 긴장한 상태다. Maya는 내가 말하는 내용을 듣고 경력이나 담당 업무에 대해 필요한 부분을 물을 수 있다. 나는 준비한 내용을 바탕으로 천천히 소개하고, 질문을 이해하지 못하면 다시 물으며 대화를 이어 가려 한다. Maya가 어떤 반응을 보이거나 내가 얼마나 잘 설명하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Leo"
        ],
        "details": "회사 식당에서 동료 Leo와 함께 식사하게 된다. 나는 업무 이야기는 피하고, 먼저 취미 이야기를 꺼내 편안한 대화를 시작하려 한다. 내 취미를 이야기한 뒤 Leo의 취미도 물어보려 한다. 첫 팀 회의에서 내가 어떻게 말했는지나 업무 관계가 어떻게 되었는지는 정하지 않으며, Leo가 어떤 취미를 말하거나 대화가 어떻게 이어지는지도 플레이에서 정한다.",
        "number": 2,
        "preview": "회사 식당에서 업무 이야기를 피하고 먼저 취미 이야기를 꺼내요",
        "title": "식당의 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 팀 리더. 새로 합류한 사람의 경력과 맡은 일을 차분히 확인하고, 설명이 모호하면 구체적으로 되묻는다."
      },
      {
        "name": "Ethan",
        "position": 2,
        "role": "30대 초반의 팀 동료. 점심시간에는 편하게 대화하지만 처음에는 자신의 취미를 짧게 말하고 상대에게도 질문한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blazer over a blouse, nervous but composed with hands lightly clasped, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로 새 팀원들에게 내 경력을 소개하고, 앞으로 맡을 일을 설명하려 한다. 영어가 서툴러 긴장한 상태이며, 준비한 경력과 담당 업무를 바탕으로 말한다. Maya는 팀 리더로서 내 소개를 듣고 경력이나 맡은 일에 대해 구체적으로 물을 수 있다. 내가 얼마나 유창하게 말하는지와 팀의 반응은 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Ethan"
        ],
        "details": "첫 팀 회의가 있는 날 회사 식당에서 Ethan과 점심을 먹는다. 나는 먼저 취미 이야기를 꺼내고 내 취미를 말한 뒤 Ethan의 취미도 물으며 편하게 대화를 이어가려 한다. 영어가 서툴러 긴장할 수 있지만, 어떤 취미를 말할지는 플레이 중 정한다. Ethan과 이미 친해졌거나 대화가 잘 풀린다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "점심시간에 먼저 취미 이야기를 꺼내 동료와 대화해요",
        "title": "점심 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 소개해요",
    "setting": "해외 회사의 첫 출근일과 회사 식당",
    "title": "첫 팀의 시작"
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
        "role": "30대 중반의 팀 동료. 회의에서는 업무 내용을 간결하게 설명하고, 서툰 영어로 말하는 사람의 설명을 재촉하지 않고 들어준다."
      }
    ],
    "cover": "A man in his mid thirties, short dark hair, light blue shirt and charcoal cardigan, slightly nervous but welcoming with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 나는 경력직으로서 이전 경력과 이번 팀에서 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있으며, 준비한 내용을 바탕으로 내 경험과 담당 업무를 설명하려 한다. Daniel이 어떤 반응을 보이거나 질문하는지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "사무실에서 복사기를 사용해야 하는데 양면 복사 방법을 모른다. 나는 동료 Daniel에게 먼저 말을 걸어 양면으로 복사하는 방법을 영어로 묻고, 필요한 설정을 설명하거나 다시 확인하려 한다. Daniel이 바로 도와줄 수 있는지, 복사가 원하는 대로 되는지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실에서 동료에게 양면 복사하는 법을 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근 주간 사무실",
    "title": "새 팀에서 말하기"
  }
]
```
검사: 통과

## 3번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

그럼 점심 대신, 첫 회의가 끝난 뒤 동료에게 현재 진행 중인 프로젝트와 자신의 맡을 일을 물어보는 상황은 어때요? 회의에서 들은 내용이 조금 불확실해서, 업무를 제대로 시작하기 전에 다시 확인하고 싶다고 말하는 장면이에요. 첫 자기소개와 이 상황을 함께 만들어도 좋고, 첫 회의 에피소드만 만들어도 좋아요.

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
        "role": "30대 중반의 프로젝트 매니저. 새 팀원의 소개를 차분히 듣고 업무에 관한 질문을 구체적으로 한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, smart casual blouse and cardigan, nervous but composed with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Maya를 포함한 팀원들 앞에 선다. 경력직으로 합류한 나는 지금까지의 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 영어가 서툴러 긴장하고 있으며, 준비한 내용을 바탕으로 천천히 말하고 필요한 경우 표현을 고쳐 말하려 한다. Maya가 어떤 반응을 보이거나 질문에 어떻게 답할지는 정하지 않는다.",
        "number": 1,
        "preview": "해외 회사의 첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "사무실에서 복사기를 사용하려는 나는 Maya에게 양면 복사 방법을 영어로 물어보려 한다. 복사할 자료를 가지고 있고, 기기에서 어느 설정을 선택해야 하는지 몰라 도움을 요청하려 한다. Maya가 바로 도와줄 수 있는지, 복사기가 어떻게 작동하는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "사무실에서 복사기를 쓰려는데 양면 복사 방법을 몰라 동료에게 물어봐요",
        "title": "복사기 사용법"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 첫 출근일 사무실",
    "title": "첫 출근 영어"
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
        "role": "30대 후반의 팀 리더. 회의를 차분하게 진행하며 경력과 맡을 일을 구체적으로 묻는다. 상대가 긴장해도 재촉하지 않고 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder length dark brown hair, smart beige blazer over a blue blouse, attentive with a calm encouraging expression and upright posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 경력직이지만 영어로 말하는 것이 서툴러 긴장하고 있다. Maya가 회의에서 내게 이전 경력과 이번 팀에서 맡을 일을 소개해 달라고 한다. 나는 그동안 해 온 일과 새 팀에서 담당할 업무를 영어로 설명하려 한다. 긴장해서 말이 막히거나 표현을 고쳐 달라고 요청할 수 있지만, Maya가 어떤 반응을 보이거나 내가 얼마나 잘 소개하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 경력과 맡을 일을 영어로 소개하려고 해요",
        "title": "첫 팀 소개"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 내 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 상대 운전자. 사고 직후 긴장했지만 차분하게 사실과 필요한 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed with one hand raised to pause and the other holding his phone, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로 갓길에 사고 차량을 세운 직후다. 나는 Daniel과 사고 상황을 확인하면서 서로의 이름과 연락처, 차량 및 보험 정보를 교환하려 한다. 필요한 정보가 빠지지 않도록 묻고 내 정보도 설명해야 한다. 사고의 책임이 누구에게 있는지, 경찰이나 보험사가 어떻게 처리할지는 아직 정하지 않는다. Daniel이 어떤 정보를 제공하고 대화가 어떻게 진행되는지는 실제 플레이에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 주고받아요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 힘드셨겠어요. 그 상황에서 어떤 말을 영어로 해보고 싶으세요?

예를 들면, **아이를 재우는 방식 때문에 말다툼한 뒤 아내에게 먼저 말을 걸어 서로의 입장을 설명하는 장면**으로 연습할 수 있어요. 사과하고 싶은 건지, 육아 분담을 다시 정하고 싶은 건지, 아니면 감정이 상하지 않게 대화하고 싶은 건지도 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황에서 영어로 대화해 보고 싶으세요? “비”와 관련된 상황을 말씀하신 걸까요? 예를 들면 비행기에서 문제가 생긴 상황인지, 비 오는 날 길을 묻는 상황인지 알려 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편해도 고함치지 않고 상대의 설명을 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리 승객 Emma는 화내거나 소리치지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 미리 정하지 않는다.",
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

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 다른 대화를 해 볼까요? 비행 중 잠시 조용해진 순간을 전제로 하지 않고, 옆자리 승객에게 여행 목적지를 묻고 자신의 여행 이야기도 꺼내며 대화를 이어 가는 상황을 제안해요. 첫 에피소드에서 Emma가 어떻게 반응했는지와 관계없이 시작할 수 있어요. 이 장면을 추가할까요, 아니면 다른 상황을 원하시나요?

```json
[]
```
검사: 통과

## 3번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.

영수증과 누수 영상을 보여 주며 커피 머신 교환을 요청하는 장면이네요. 직원은 화내지 않고, 문제 상황과 교환 요청을 차분히 듣는 것으로 시작할게요.

이어서 같은 매장에서 다른 커피 머신의 사용법을 직접 물어보는 상황도 넣어 볼까요? 교환이 되었는지와 관계없이, 새 모델을 살펴보며 원하는 기능과 사용 방법을 묻는 장면이에요. 지금 누수 문제만 연습해도 좋아요.

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
        "role": "30대 초반의 매장 직원. 고객의 설명과 증거 자료를 차분히 확인하고 화내지 않는다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, green store apron over a beige shirt, calm and attentive with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 보여 주며 제품에 문제가 있다는 것을 설명하고 교환을 요청하려 한다. Maya는 화내지 않으며 내 설명과 자료를 차분히 확인한다. 제품을 실제로 교환해 주는지, 다른 절차를 안내하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아왔어요",
        "title": "새는 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아왔어요",
    "setting": "커피 머신을 판매하는 매장의 고객 응대 데스크",
    "title": "커피 머신 교환 요청"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 수 있는 장면부터 정해 볼까요?

예를 들면 이런 상황이 있어요.

- 집을 구하며 집주인에게 조건을 묻기
- 마트에서 원하는 물건의 위치나 가격을 묻기
- 병원에서 증상을 설명하고 진료받기
- 은행에서 계좌를 만들거나 송금하기
- 직장이나 학교에서 처음 만난 사람과 대화하기
- 식당에서 주문하고 음식에 대한 요청하기

이 중 연습하고 싶은 장면이 있나요? 직접 겪을 상황을 말해 주셔도 좋아요.

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
        "role": "30대 초반의 은행 직원. 필요한 서류와 계좌 조건을 차분히 설명하고, 이해하지 못한 부분은 다시 묻는다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, light blue blouse and charcoal cardigan, attentive with a slightly questioning expression and one hand raised as if clarifying, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 생활을 시작한 지 얼마 되지 않은 나는 현지 은행 지점에 가서 일상생활에 사용할 계좌를 만들려고 한다. Maya에게 계좌를 개설하고 싶다고 말하고, 필요한 신분증과 주소 증명 서류, 수수료, 카드 발급과 사용 방법을 묻는다. 내가 준비한 서류만으로 충분한지는 정하지 않으며, Maya가 설명하는 조건을 듣고 필요한 내용을 다시 확인하면서 대화를 이어 간다.",
        "number": 1,
        "preview": "해외 생활에 필요한 은행 계좌를 만들려고 지점에 왔어요",
        "title": "은행 계좌 만들기"
      }
    ],
    "hook": "해외 생활을 시작하고 현지 은행에서 계좌를 만들려고 해요",
    "setting": "해외 도시의 작은 은행 지점",
    "title": "새로운 생활"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있는데 옆자리 승객이 계속 한숨을 쉬며 쳐다보는 순간으로 해볼까요? 주변에 피해를 주고 있다는 생각에 먼저 말을 걸어, 최선을 다하고 있으니 조금만 이해해 달라고 설명하는 상황이에요.

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.

이어서 착륙 후 공항에서 유모차를 어디서 찾는지 안내 데스크 직원에게 묻는 상황도 해볼까요? 지금 비행기 안에서 옆자리 승객에게 이해를 부탁하는 에피소드만 만들어도 좋아요.

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
        "role": "40대 초반의 승객. 아기의 울음에 불편함을 느끼지만 화내지 않고 한숨과 시선으로 반응하며 설명을 들으면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties with shoulder length brown hair, wearing a soft gray sweater, looking tired but restrained with a quiet sigh, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응할지와 상황이 어떻게 끝날지는 정하지 않는다.",
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

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 해외에서 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 요청하고 싶으세요? 예를 들면 난방이 안 되거나, 욕실에서 물이 새서 수리를 부탁하는 상황이에요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

사진과 온도 기록을 보여 주면서 이번 주 안에 난방을 고쳐 달라고 집주인에게 부탁하는 상황으로 정할게요.

이제 동네 모임에서 인사하는 장면을 정해 볼게요. 처음 만난 이웃들에게 어떤 자리에서, 어떤 말을 하며 인사를 나누고 싶으세요? 예를 들면 모임에 처음 참석해 자기소개를 하고, 다른 사람들의 이름과 관심사를 묻는 상황이에요.

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
        "role": "40대 후반의 집주인. 세입자의 설명과 수리 요청을 차분히 듣고 필요한 내용을 확인한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 편안하게 말을 걸고 주말 취미 이야기에 관심을 보인다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-up shirt and cardigan, concerned and leaning forward attentively, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 언제 수리할지 또는 요청을 받아들일지는 정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 사진과 온도 기록을 보여 주며 이번 주 안에 고쳐 달라고 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya와 인사를 나눈다. 나는 주말에 자전거 타기를 좋아한다고 먼저 말하고, Maya의 주말 취미에 대해서도 물으며 대화를 이어가려 한다. Maya가 어떤 취미를 말하거나 대화가 어떻게 이어질지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미로 자전거 타기를 이야기해요",
        "title": "동네 모임"
      }
    ],
    "hook": "해외 생활 중 집주인에게 난방 수리를 부탁하고 동네 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 주민 모임이 열리는 동네 커뮤니티 공간",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 상황도 넣어 볼게요. 교환 요청과는 별개로, 매장 체험 코너에서 직원에게 커피 머신의 기본 사용법을 묻고 직접 설정해 보는 상황은 어때요? 지금 제품 문제가 해결됐는지는 정하지 않고, 사용법을 배우려는 장면으로 진행할 수 있어요.

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
        "details": "다른 날 같은 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 순서와 방법을 설명해 달라고 한다. 첫 번째 에피소드에서 교환에 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않는다. Noah가 시연하거나 도와줄 수 있는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 만들기"
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 필요한 조작을 설명해 달라고 하려 한다. 첫 번째 에피소드에서 교환을 했는지, 요청이 받아들여졌는지는 정하지 않으며, Noah가 얼마나 자세히 알려 주는지도 플레이에서 정한다.",
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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 기본적인 세척 방법을 설명해 달라고 하려 한다. 세척 방법을 제대로 안내받는지는 플레이에서 정한다.",
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
