# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-15T15:04:22.257Z
프롬프트: 581b1b5
프롬프트 SHA-256: ff7b7592d27df30f8a43f2c71d61cb96b83b30b4caa8cecd2753f86dd8068be5
답 29개, 실패 4개, 호출 실패 0개

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



```json
[
  {
    "characters": [
      {
        "name": "Rachel",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고, 경력과 맡을 일을 더 물어본다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, composed but attentive with a slightly encouraging expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Rachel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Rachel과 팀원들이 새로 합류한 나의 소개를 듣는다. 나는 서툰 영어로 이전 경력과 이번 팀에서 맡을 일을 설명하려고 한다. 영어가 서툴러 긴장하고 있지만, 준비한 내용을 바탕으로 내 경력과 역할을 분명하게 전달하려 한다. Rachel이 얼마나 기다려 주거나 추가로 질문하는지는 정하지 않는다.",
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
검사: 한 에피소드로 끝내는 안내 없음, 합의 전에 카드 생성, 대화 없음, 요청한 화 수와 다름

## 1번째 첫 출근의 제안 뒤 조건을 덧붙이기
질문: 회사 식당에서 동료에게 취미 이야기를 제가 먼저 꺼내고 싶어요. 업무 얘기는 피하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Rachel",
        "position": 1,
        "role": "30대 후반의 팀 리더. 새 팀원의 소개를 차분히 듣고, 경력과 맡을 일을 더 물어본다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 점심시간에는 업무에서 벗어난 가벼운 대화를 나누며 상대의 이야기를 자연스럽게 이어 간다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, smart casual blouse and blazer, composed but attentive with a slightly encouraging expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Rachel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 Rachel과 팀원들이 새로 합류한 나의 소개를 듣는다. 나는 서툰 영어로 이전 경력과 이번 팀에서 맡을 일을 설명하려고 한다. 영어가 서툴러 긴장하고 있지만, 준비한 내용을 바탕으로 내 경력과 역할을 분명하게 전달하려 한다. Rachel이 얼마나 기다려 주거나 추가로 질문하는지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "회사 식당에서 Daniel과 점심을 먹거나 식사를 준비하는 중이다. 나는 업무 이야기는 피하고, 먼저 내 취미 이야기를 꺼내 동료와 자연스럽게 대화를 시작하려 한다. 내 취미를 간단히 설명하고 Daniel의 취미나 관심사도 물어보려 한다. Daniel이 어떤 취미를 갖고 있는지, 대화가 얼마나 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "회사 식당에서 업무 대신 제 취미 이야기를 먼저 꺼내요",
        "title": "식당에서 취미 이야기"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 회사 식당",
    "title": "새 회사에서 말 걸기"
  }
]
```
검사: 통과

## 1번째 충분한 제안에 짧게 동의하면 바로 카드
질문: 좋아요

첫 팀 회의에서 경력과 맡을 일을 소개하는 장면에 더해, 회사 식당에서 동료와 취미를 이야기하는 장면도 넣자는 뜻일까요? 아니면 첫 팀 회의 장면만 만들어 볼까요?

```json
[]
```
검사: 카드 하나 필요, 카드 앞뒤 대화 중복

## 1번째 제안 대신 다른 사건을 말하면 그 사건만 추가
질문: 점심 말고 사무실에서 동료에게 복사기 사용법을 묻고 싶어요. 양면 복사를 해야 해요.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "30대 후반의 팀 리드. 첫 회의에서 새 팀원의 경력과 맡을 일을 차분히 확인하고, 긴장한 사람의 말을 재촉하지 않는다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 초반의 동료. 사무실 기기 사용법을 설명하는 데 익숙하며, 복사 설정을 하나씩 확인해 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder length dark hair, simple navy blouse, slightly nervous but composed with an attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사에 입사한 첫 팀 회의에서 새 팀원으로 자기소개를 한다. 나는 이전 경력을 영어로 설명하고, 앞으로 맡을 일을 소개하려 한다. 경력직이지만 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 천천히 말하고 싶다. 구체적인 경력과 맡을 일의 내용은 내가 직접 정한다. Maya가 어떤 질문을 하거나 어떻게 반응하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "첫 팀 회의에서 경력과 앞으로 맡을 일을 영어로 소개해요",
        "title": "첫 팀 소개"
      },
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사 사무실에서 복사기를 사용하려는데 양면 복사를 해야 한다. 나는 동료 Daniel에게 복사기 사용법을 영어로 묻고, 양면 복사 설정을 어떻게 해야 하는지 설명을 듣고 직접 시도하려 한다. 복사할 문서와 필요한 부수는 내가 정하며, Daniel이 얼마나 쉽게 설명하는지와 복사가 원하는 대로 되는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "사무실 복사기에서 양면 복사 설정을 동료에게 물어봐요",
        "title": "양면 복사"
      }
    ],
    "hook": "첫 팀 회의에서 경력과 앞으로 맡을 일을 영어로 소개해요",
    "setting": "해외 회사의 회의실과 사무실 복사 공간",
    "title": "새 팀에서 시작하기"
  }
]
```
검사: 통과

## 1번째 추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인
질문: 점심 말고 다른 일을 해보고 싶어요.

알겠어요. 점심 대화 말고, 해외 회사에서 해보고 싶은 다른 업무 상황을 정해 볼게요.

예를 들면 다음과 같은 장면이 있어요.

- 첫 회의에서 맡은 업무의 범위와 우선순위를 확인하기
- 상사에게 업무 진행 방법과 기대하는 결과를 묻기
- 동료에게 회사의 업무 방식이나 협업 절차를 질문하기
- 첫 업무를 받은 뒤 일정과 마감일을 조율하기
- 회의에서 제 의견을 짧게 말하고 질문받기

이 중 어떤 일을 영어로 해보고 싶으세요? 직접 떠오르는 상황을 말해 주셔도 좋아요.

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
        "role": "30대 중반의 팀 동료. 복사기 사용법을 차분히 설명하고 상대의 질문을 기다린다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "40대 초반의 팀 리더. 새 팀원이 경력과 맡을 일을 간단하고 분명하게 소개하기를 기대한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark brown hair, light blue blouse and gray cardigan, patient and slightly curious while turning toward someone, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새로 합류한 나는 경력과 앞으로 맡을 일을 영어로 소개하려 한다. 경력직이지만 영어가 서툴러 긴장하고 있으며, 준비한 내용을 바탕으로 짧고 분명하게 말하려 한다. Daniel이 내 소개를 듣고 무엇을 더 묻거나 어떻게 반응할지는 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 긴장한 채 제 경력과 맡을 일을 영어로 소개해요.",
        "title": "첫 자기소개"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사 사무실에서 복사기 앞에 있는 나는 동료 Maya에게 양면 복사하는 방법을 영어로 물어보려 한다. 복사기의 기본 사용법은 잘 모르지만, 문서를 양면으로 복사해야 해서 필요한 버튼과 순서를 이해하려 한다. Maya가 바로 도와줄 수 있는지, 복사에 성공하는지는 정하지 않는다.",
        "number": 2,
        "preview": "사무실 복사기 앞에서 동료에게 양면 복사 방법을 물어봐요.",
        "title": "양면 복사"
      }
    ],
    "hook": "해외 회사 첫 팀 회의에서 제 경력과 맡을 일을 영어로 소개해요",
    "setting": "새로 합류한 해외 회사의 사무실",
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
        "role": "30대 후반의 팀 리드. 새 팀원의 경력과 맡을 일을 차분히 확인하며 소개를 듣는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, smart casual navy blazer, slightly encouraging but attentive, standing upright with a tense smile, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 회사의 첫 팀 회의에서 새 팀원들 앞에 자기소개를 해야 한다. 나는 이전 직장에서 쌓은 경력과 이번 팀에서 맡을 일을 영어로 설명하려 한다. 영어가 서툴러 긴장한 상태이며, 준비한 내용을 바탕으로 천천히 말하고 싶다. Maya는 팀 리드로서 내 소개를 듣고, 내가 어떤 경험을 했고 어떤 일을 맡는지 이해하려 한다. 소개를 잘했는지, Maya가 어떤 반응을 보이는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "첫 팀 회의에서 경력과 맡을 일을 영어로 소개해야 해요",
        "title": "첫 팀 자기소개"
      }
    ],
    "hook": "첫 팀 회의에서 긴장한 채 경력과 맡을 일을 영어로 소개해요",
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
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 감정적으로 몰아붙이지 않고 사실관계와 필요한 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense and concerned with one hand raised cautiously, three-quarter view, body turned, face toward the viewer, mustard background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 접촉 사고가 난 직후, 안전을 위해 차를 세운 뒤 상대 운전자 Daniel과 마주한다. 나는 사고에 대해 감정적으로 다투기보다 서로의 이름과 연락처, 자동차 보험 정보를 교환하려 한다. 필요한 정보를 정확히 확인하고 나중에 보험사와 연락할 수 있도록 말하려 한다. 사고의 책임이 누구에게 있는지, 상대가 협조하는지, 보험 처리가 어떻게 진행되는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 정보를 주고받아야 해요",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차를 세운 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 힘드셨겠어요. 그 일을 영어로 다시 대화해 보고 싶은 건가요?

예를 들면 **다음 날 아내에게 먼저 말을 꺼내 사과하는 장면**, **육아 방식에 대한 서로의 생각을 설명하는 장면**, 또는 **감정이 다시 올라오기 전에 대화를 멈추고 정리하는 장면**으로 연습할 수 있어요. 어떤 순간을 겪어 보고 싶으세요?

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비…”라고 하신 건 비행기, 비 오는 날, 비즈니스 미팅 중 어떤 상황을 말씀하신 걸까요? 원하는 장면을 조금만 더 알려 주세요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬며 시선을 보내지만 고함치지 않고 상대의 설명을 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and quietly impatient with a restrained sigh, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 한숨을 쉬고 아기와 나를 바라보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 우리를 바라봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 다른 장면을 하나 더 넣어 볼게요. 첫 대화가 어떻게 끝났는지와 관계없이 이어질 수 있도록, 비행 중 옆자리 승객이 여행 목적을 물어보며 대화를 시작하는 상황은 어때요?

아기 이야기에서 벗어나 여행 이야기를 나누고, 상대에게도 여행 목적을 물어보는 장면이에요. 원하시면 이 방향으로 정할게요.

```json
[]
```
검사: 통과

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 영상을 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green store uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 영수증과 영상을 확인하며 내 설명을 듣는다. 교환이 가능한지와 Mia가 어떤 절차를 안내하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "누수 제품 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 전자제품 매장",
    "title": "커피 머신 교환"
  }
]
```
검사: 한 에피소드로 끝내는 안내 없음, 합의 전에 카드 생성, 대화 없음, 요청한 화 수와 다름

## 1번째 충분한 첫 사건 뒤 제안과 자연스러운 거절
질문: 아니요, 일단 교환 요청만 연습할래요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 영상을 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green store uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. 이번 화에서는 교환을 요청하는 대화만 연습한다. Mia는 화내지 않고 차분하게 영수증과 영상을 확인하며 내 설명을 듣는다. 교환 요청에 대한 Mia의 실제 반응이나 결과는 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가 교환을 요청해요",
        "title": "누수 제품 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 전자제품 매장",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 영어를 써야 하는 장면들을 연습해 보고 싶으시군요. 예를 들면 이런 상황이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻기
- 마트에서 원하는 물건의 위치나 성분을 물어보기
- 병원이나 약국에서 증상을 설명하기
- 직장이나 학교에서 처음 만난 사람과 대화하기
- 은행이나 통신사에서 계좌나 휴대폰 문제 해결하기
- 식당에서 주문이 잘못 나온 상황 설명하기

이 중에서 가장 먼저 겪어 보고 싶은 상황이 있나요? 직접 떠올린 장면이 있다면 그대로 말씀해 주셔도 돼요.

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
        "role": "30대 후반의 약사. 증상을 차분히 확인하고 필요한 정보를 구체적으로 물어본다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, pale blue blouse and beige cardigan, attentive with a concerned but calm expression, leaning slightly forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 생활하던 중 갑자기 목이 아프고 열이 나서 약국에 찾아간다. 나는 영어로 증상을 설명하고, 복용 중인 약이나 알레르기가 있는지 묻는 질문에 답하며, 병원에 가야 하는 상황인지와 어떤 약을 어떻게 먹어야 하는지 상담하려 한다. 증상이 언제 시작됐는지, 열과 통증의 정도 등 내가 알고 있는 내용을 설명할 수 있다. Maya가 어떤 약을 권하거나 병원 방문을 안내할지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "갑자기 몸이 아파서 해외 약국에서 증상을 설명해요",
        "title": "약국에서 증상 설명"
      }
    ],
    "hook": "갑자기 몸이 아파서 해외 약국에서 증상을 설명해요",
    "setting": "해외 주거 지역의 동네 약국",
    "title": "해외 생활 첫날들"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보는 순간 먼저 말을 걸어, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 부탁하는 장면으로 해볼까요?

옆자리 승객은 화를 내지는 않고 한숨을 쉬며 불편한 기색을 보이는 사람으로 할지, 아니면 직접 불편하다고 말하는 사람으로 할지 골라 주세요.

```json
[]
```
검사: 통과

## 1번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 한숨을 쉬며 쳐다보지만 화를 내지는 않고 상대의 설명을 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, seated with her shoulders slightly tense, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 울음을 멈추지 않는다. 옆자리 승객 Emma는 화를 내거나 직접 항의하지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것과 나도 곤란한 상황이라는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 한 에피소드로 끝내는 안내 없음, 합의 전에 카드 생성, 대화 없음, 요청한 화 수와 다름

## 1번째 비행기 회귀
질문: 그냥 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 한숨을 쉬며 쳐다보지만 화를 내지는 않고 상대의 설명을 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, seated with her shoulders slightly tense, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 울음을 멈추지 않는다. 옆자리 승객 Emma는 화를 내거나 직접 항의하지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것과 나도 곤란한 상황이라는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
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

먼저 해외에서 집주인에게 수리를 요청하는 상황부터 정해 볼게요. 어떤 문제가 생긴 집인가요? 예를 들면 **물이 새거나, 난방이 안 되거나, 전기가 고장 난 상황**처럼요.

그리고 집주인에게는 무엇을 말하고 싶으세요? 문제를 설명하고 **빨리 수리해 달라고 요청하는 것**이면 될까요?

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 실내 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임에서 인사하는 상황을 정해 볼까요? 처음 만난 사람에게 **자기소개를 하고, 어디에서 왔는지나 이 동네에 얼마나 살았는지 이야기하는 장면**이면 좋을까요? 모임의 분위기나 상대에게 꼭 묻고 싶은 것이 있으면 함께 알려 주세요.

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
        "role": "40대 후반의 집주인. 집의 문제를 먼저 확인하고 구체적인 수리 요청을 차분히 듣는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람과 주말 취미를 가볍게 나누며 공통점을 찾으려 한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair, casual sweater over a collared shirt, concerned and listening with a slightly furrowed brow, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 임대해 살고 있는 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 실내 온도 기록을 제시하려 한다. 집주인 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. 실제로 언제 수리되는지나 Daniel이 어떻게 답하는지는 정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고, 주말에 무엇을 하며 보내는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물어보며 대화를 이어가려 한다. 두 사람이 어떤 공통점을 찾는지나 대화가 얼마나 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "난방이 고장 난 집에서 집주인에게 이번 주 안에 수리해 달라고 부탁해요",
    "setting": "해외의 임대 주택과 동네 커뮤니티 모임",
    "title": "해외 생활 속 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 겪을 다른 상황도 넣어 볼게요. 교환 요청을 하러 다시 방문했을 때, 직원에게 커피 머신의 올바른 사용법과 누수를 피하는 방법을 물어보는 장면은 어때요? 알고 싶은 사용법이나 꼭 묻고 싶은 내용을 알려 주세요.

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
        "details": "같은 매장에서 다른 날 Noah를 다시 만난다. 앞선 교환 요청이 성공했는지 실패했는지, 어떤 제품을 갖고 있는지는 정하지 않는다. 나는 Noah에게 우유 거품을 내는 법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 순서와 주의할 점을 알아보려 한다. Noah가 설명해 주는 범위와 대화의 결과는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 필요한 순서를 알고 싶어 한다. 첫 화에서 커피 머신을 교환했는지, 어떤 제품을 갖고 있는지는 미리 정하지 않으며, Noah가 설명하고 시범을 보이는 방식과 내가 추가로 묻는 내용은 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "커피 머신을 판매하고 체험할 수 있는 가전 매장",
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

에피소드는 최대 5화까지라 더 추가할 수 없어요. 기존 화를 빼거나 다른 화로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 안전하게 세척하는 방법과 필요한 세척제의 양을 설명해 달라고 하려 한다. 직원이 알려 주는 방법과 실제 세척 결과는 정하지 않는다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
        "title": "세척제 사용법"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 체험 코너",
    "title": "새 커피 머신"
  }
]
```
검사: 통과
