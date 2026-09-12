# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:14:15.647Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 02c7b6710def9ab8fe0451a9efb763cf01e6fe8f8a790f24b49403ead9d874f5
답 54개, 실패 1개, 호출 실패 0개

의미와 재미에 대한 사람의 검토는 별도다. 아래는 출력 전문과 기계 검사 결과다.

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비행기에서 영어로 대화해 보고 싶은 상황을 말하려던 걸까요? 비행기 안에서 승무원에게 요청하거나 옆자리 승객에게 말을 거는 장면 중 하나를 떠올리고 있다면, 어느 쪽에 가까워요?

```json
[]
```
검사: 마지막 문장 질문 규칙

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: My baby keeps crying on a plane. The passenger next to me sighs and looks at us but does not shout. I want to explain I am trying and ask for understanding. Make only this one episode.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 승객. 불편하면 한숨을 쉬고 쳐다보지만 고함치지는 않으며, 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways while sitting upright, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 계속된다. Emma는 옆자리에서 한숨을 쉬고 나와 아기를 쳐다보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응할지는 정하지 않는다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객이 한숨을 쉬며 우리를 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선과 한숨이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

기내에서 다른 장면을 하나 더 넣어 볼게요. 아기를 안고 있는데 승무원이 다가와 필요한 것이 있는지 묻고, 물이나 기저귀를 부탁하는 상황을 경험해 보는 건 어때요?

```json
[]
```
검사: 통과

## 1번째 충분한 한 사건
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 영수증과 제품 상태를 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, green store uniform, calm but concerned while listening attentively, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "커피 머신을 산 다음 날 집에서 사용하다가 물이 새는 것을 발견했다. 매장 직원 Maya에게 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 고객의 설명을 들으며 영수증과 영상을 확인한다. 실제로 교환이 가능한지와 Maya가 어떤 절차를 안내하는지는 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 왔어요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 왔어요.",
    "setting": "주방용품을 파는 매장의 고객 안내대",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 지내며 일상적으로 영어를 써야 하는 상황을 연습하고 싶으신 거네요. 처음 이사한 동네의 마트에서 원하는 물건을 찾지 못해 직원에게 물어보는 순간부터 해볼까요?

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
        "role": "20대 후반의 마트 직원. 손님이 찾는 물건을 차분히 확인하고 필요한 위치를 설명한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, green store uniform, attentive with a patient expression and one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 생활을 시작한 지 얼마 되지 않은 나는 동네 마트에서 필요한 생활용품을 찾지 못한다. 매장 안에서 Maya에게 물건의 위치를 영어로 묻고, 비슷한 물건과 원하는 물건의 차이도 설명하려 한다. Maya가 물건을 찾아 주는지, 내가 원하는 것을 정확히 전달하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "동네 마트에서 필요한 생활용품을 찾지 못해 직원에게 물어봐요",
        "title": "마트에서 물건 찾기"
      }
    ],
    "hook": "해외 생활을 시작하고 동네 마트에서 필요한 물건을 찾지 못해요",
    "setting": "해외의 동네 마트",
    "title": "낯선 동네 생활"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데 주변 승객의 반응이 신경 쓰이는 상황이네요. 옆자리 승객이 화내지는 않지만 계속 한숨을 쉬고 쳐다봐서, 먼저 사과하고 조금만 이해해 달라고 말하는 순간으로 해볼까요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬고 쳐다보지만 화내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
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

해외에서 생활하며 집주인에게 수리를 요청하고 동네 사람들과 처음 인사하는 두 장면을 연습하고 싶으신 거네요. 먼저 집 안의 수도나 난방처럼 바로 설명하고 수리 일정을 잡아야 하는 문제를 집주인에게 말하는 순간부터 정해 볼까요?

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 집주인에게 요청하는 상황이네요. 동네 모임에서는 처음 만난 이웃에게 가볍게 자기소개하고 사는 곳이나 모임에 온 이유를 말하는 순간으로 정해 볼까요?

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
        "role": "40대 후반의 집주인. 수리 요청을 받으면 문제와 일정을 먼저 확인한다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 주말 취미를 물으며 편안하게 대화한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair, casual button-up shirt and cardigan, concerned and listening with a measured posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 충분히 따뜻해지지 않는다. 나는 난방 상태를 찍은 사진과 실내 온도 기록을 가지고 있으며, 이를 집주인 Daniel에게 보여 주며 문제를 설명하려 한다. 이번 주 안에 수리를 해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이거나 언제 수리할지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Sophie와 인사를 나눈다. 나는 자전거 타기를 좋아한다고 말하고, 주말에 주로 무엇을 하는지와 어떤 취미가 있는지 이야기하며 대화를 이어가려 한다. Sophie가 어떤 취미를 말하거나 대화가 어떻게 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "처음 만난 이웃에게 자전거 타기를 좋아한다고 말하며 주말 취미를 물어봐요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외 생활 중 집주인에게 난방 수리를 부탁하고 동네 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 주민들이 모이는 동네 커뮤니티 공간",
    "title": "해외 생활의 두 장면"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 제품을 살펴보다가 직원에게 원하는 기능을 물어보는 장면도 넣을 수 있어요. 커피 머신 말고 집에서 쓸 조용한 청소기를 찾고, 소음과 관리 방법을 비교해 달라고 묻는 상황은 어때요?

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
        "details": "다른 날 같은 가전 매장에서 Noah를 만난다. 이전에 산 커피 머신의 교환이 성공했는지는 정하지 않는다. 나는 우유 거품을 내는 법을 물어보고, 어떤 우유를 써야 하는지와 거품을 내는 순서를 설명해 달라고 한다. Noah가 알고 있는 사용법과 설명 방식은 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 Noah에게 우유 거품을 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 이전 방문에서 커피 머신을 교환했는지는 정하지 않으며, 매장 체험 코너에서 직접 방법을 설명해 달라고 요청하려 한다. Noah가 시범을 보이거나 어떤 방식으로 설명할지는 플레이에서 정한다.",
        "number": 2,
        "preview": "매장 체험 코너에서 우유 거품을 내는 법을 배우고 싶어요",
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

한 스토리에는 최대 5화까지 넣을 수 있어요. 어느 화를 뺄지 말해 주세요.

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
        "details": "같은 매장의 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적절한 양과 청소 방법을 설명해 달라고 하려 한다. Noah가 알려 주는 구체적인 방법은 플레이에서 정한다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비가 와서 곤란해진 상황을 영어로 연습해 보고 싶은 거네요. 우산 없이 비를 맞고 있는데 낯선 사람에게 도움을 요청하는 순간으로 해볼까요?

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
        "role": "40대 초반의 승객. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨과 시선으로 표현한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray sweater, tired and glancing sideways with restrained annoyance, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 고함치지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지는 플레이에서 정한다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

비행기에서 겪을 다른 장면도 하나 더 넣어 볼게요. 같은 여행 중 호텔 아침 식당에서 옆자리 승객을 다시 만나, 이번에는 아기 이야기에서 벗어나 서로의 여행 계획을 이야기하는 상황은 어때요?

```json
[]
```
검사: 통과

## 2번째 충분한 한 사건
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 영수증과 제품 상태를 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store polo shirt, attentive with a concerned expression and hands held calmly in front of her, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 산 커피 머신을 가져와 교환을 요청한다. 집에서 사용하던 중 물이 새기 시작했고, 영수증과 누수 영상을 가지고 있다. 나는 영수증과 영상으로 구매 시점과 문제를 설명한 뒤 새 제품으로 교환해 달라고 말하려 한다. Mia는 화내지 않고 차분하게 설명을 듣고 제품과 자료를 확인한다. 교환이 가능한지와 매장의 처리 방식은 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "새는 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 산 매장의 고객 응대 공간",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 마주칠 수 있는 장면부터 연습해 보면 좋아요. 처음 이사한 동네에서 집주인이나 이웃에게 생활 규칙을 묻는 상황과, 마트나 병원에서 필요한 것을 설명하는 상황 중 어떤 장면을 먼저 겪어 보고 싶어요?

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
        "role": "30대 초반의 집주인. 생활 문제를 차분히 확인하고 구체적인 설명을 들으면 해결 방법을 함께 찾는다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "20대 후반의 이웃. 건물의 생활 규칙을 잘 알고 필요한 정보를 짧게 알려 준다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, casual beige sweater and dark trousers, attentive with a slightly concerned expression and one hand raised in explanation, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활하는 집의 실내 난방이 작동하지 않아 추위를 느끼고 있다. 나는 집주인 Maya에게 난방이 언제부터 작동하지 않았는지 설명하고, 오늘 밤 지낼 수 있도록 점검이나 임시 해결 방법을 요청하려 한다. Maya는 상황을 확인할 수 있지만 즉시 해결할 수 있는지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 지낸 집의 난방이 작동하지 않아 집주인에게 도움을 요청해요",
        "title": "난방 문제"
      }
    ],
    "hook": "해외에서 처음 지낸 집의 난방이 작동하지 않아 집주인에게 도움을 요청해요",
    "setting": "해외의 작은 아파트 거실",
    "title": "첫날의 집 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 시선도 신경 쓰이는 상황이네요. 옆자리 승객이 계속 한숨을 쉬거나 쳐다봐서, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 먼저 말하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 2번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬고 쳐다보지만 화내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. Emma는 옆자리에서 한숨을 쉬며 계속 쳐다보지만 화내거나 고함치지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지는 플레이에서 정한다.",
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

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 생활하며 집주인에게 수리를 요청하고 동네 사람들과 처음 인사하는 상황이네요. 먼저 집 안의 온수가 갑자기 나오지 않아 집주인에게 상황을 설명하고 수리 일정을 부탁하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요. 동네 모임에서는 처음 만난 이웃이 어디에서 왔는지 묻고 모임에 계속 나와도 되는지 이야기하는 순간으로 해볼까요?

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
        "role": "40대 후반의 집주인. 집 상태와 수리 비용을 신중하게 확인하며 구체적인 자료가 있으면 차분히 검토한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게 편하게 말을 걸고 주말 활동을 자연스럽게 묻는다."
      }
    ],
    "cover": "A man in his late forties, short salt and pepper hair, casual dark sweater and jeans, concerned and leaning forward with an attentive expression, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 찍은 사진과 실내 온도 기록을 집주인 Daniel에게 보여 주며 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리를 받아들이거나 일정을 정하는지는 플레이에서 결정한다.",
        "number": 1,
        "preview": "난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya와 주말 취미에 관해 이야기한다. 나는 자전거 타기를 좋아한다고 말하고, Maya의 주말 활동도 물으며 자연스럽게 인사를 이어 가려 한다. 두 사람이 친해지거나 대화가 원하는 방향으로 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말해요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 모임에서 새 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 동네 커뮤니티 모임 공간",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 날, 직원에게 커피 머신의 보증 수리 절차와 수리 기간을 물어보는 장면을 넣어 볼게요. 새 제품 교환 여부와 관계없이 수리가 필요할 때를 대비해 상황을 설명하고 가능한 방법을 확인하는 대화로 해볼까요?

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 원하는 거품의 질감과 사용 중인 우유에 대해 설명하며 방법을 배우려 한다. 첫 번째 에피소드에서 교환에 성공했는지는 정하지 않으며, Noah가 시범을 보이거나 어떤 방법을 안내할지는 플레이에서 정한다.",
        "number": 2,
        "preview": "같은 매장에서 Noah를 다시 만나 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 매장 체험 코너에서 직접 방법을 배우고 커피에 맞는 우유 거품을 만들어 보려 한다. 첫 번째 에피소드의 교환 결과와 관계없이 체험 코너에 가며, Noah가 얼마나 자세히 설명하거나 시범을 보일지는 정하지 않는다.",
        "number": 2,
        "preview": "매장 체험 코너에서 Noah에게 우유 거품 내는 법을 물어요",
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

한 스토리에는 최대 5화까지 넣을 수 있어요. 어느 화를 뺄지 말해 주세요.

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
        "details": "같은 매장에서 Noah에게 커피 머신 청소 방법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 사용 방법을 설명해 달라고 하려 한다. Noah가 알려 주는 내용과 실제로 청소가 잘되는지는 정하지 않는다.",
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

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련된 영어 대화 상황을 연습하고 싶은 걸로 이해했어요. 비 때문에 약속이나 이동에 문제가 생겨 상대에게 설명하는 장면으로 해볼까요?

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하며 불편할 때 한숨과 시선으로 반응하지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained irritation, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 소리를 지르거나 직접 화내지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객의 한숨과 시선이 느껴져요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선과 한숨이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

비행기에서 이어지는 다른 여행 상황도 하나 넣어 볼게요. 착륙 후 공항에서 아기와 함께 이동하다가 직원에게 유모차를 어디서 받는지 묻는 장면으로 해볼까요?

```json
[]
```
검사: 통과

## 3번째 충분한 한 사건
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
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store polo shirt, concerned and calmly leaning forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 산 다음 날 집에서 사용해 보니 물이 새기 시작했다. 나는 매장에 영수증과 누수 장면을 찍은 영상을 가져와 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 확인하며 내 설명을 듣는다. 교환이 가능한지와 직원이 어떤 절차를 안내하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요.",
        "title": "누수 제품 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요.",
    "setting": "커피 머신을 산 매장의 고객 서비스 데스크",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 일부터 영어로 풀어 보고 싶은 상황이네요. 처음 정착한 동네에서 집주인이나 이웃에게 생활 문제를 설명하는 장면으로 해볼까요?

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
        "name": "Mia",
        "position": 1,
        "role": "30대 후반의 집주인. 집과 계약 문제를 꼼꼼하게 확인하며 차분히 설명한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "20대 후반의 이웃. 낯선 사람에게도 생활 정보를 알려 주지만 자신의 일에는 선을 긋는다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, casual beige sweater, concerned but composed with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "해외에서 처음 생활을 시작한 뒤 임대 주택의 욕실에서 물이 새는 것을 발견한다. 나는 집주인 Mia에게 누수 상황을 설명하고 수리를 요청하려 한다. 휴대전화에 찍은 누수 사진과 임대 계약서를 가지고 있다. Mia는 집 상태와 계약 내용을 확인하려 하며, 수리가 언제 끝날지나 비용을 누가 부담할지는 아직 정하지 않는다. 나는 문제를 설명하면서 당장 사용할 수 있는 조치도 물어보려 한다.",
        "number": 1,
        "preview": "새 집 욕실에서 물이 새서 집주인에게 상황을 설명해요",
        "title": "욕실 누수"
      }
    ],
    "hook": "새로 구한 집 욕실에서 물이 새서 집주인에게 연락해요",
    "setting": "해외에서 처음 구한 아파트의 복도와 욕실 앞",
    "title": "첫 집의 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬며 쳐다보는데 먼저 말을 꺼내 양해를 구하는 순간으로 해볼까요?

```json
[]
```
검사: 통과

## 3번째 비행기 회귀
질문: 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Emma",
        "position": 1,
        "role": "40대 초반의 회사원. 조용히 쉬고 싶어 하며 불편할 때 한숨을 쉬지만 화내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, weary and glancing sideways with restrained patience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않고 한숨을 쉬며 계속 바라본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
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

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외 생활에서 집주인에게 수리를 요청하는 일과 동네 사람들에게 처음 인사하는 상황을 각각 연습하고 싶군요. 먼저 욕실 누수처럼 생활에 불편을 주는 문제를 집주인에게 설명하고 수리 일정을 잡아 달라고 말하는 장면으로 해볼까요?

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 요청하는 상황이네요. 동네 모임에 처음 참석해 옆자리에 앉은 사람에게 자기소개를 하고 이 동네에서 지내는 이야기를 가볍게 나누는 장면으로 해볼까요?

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
        "name": "Alex",
        "position": 1,
        "role": "40대 후반의 집주인. 수리 요청의 내용을 차분히 확인하고 일정과 비용 문제를 따져 본다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 조심스럽지만 주말 취미 이야기가 나오면 자신의 경험도 편하게 나눈다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater and trousers, concerned and leaning slightly forward with an attentive expression, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Alex"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 가지고 있다. Alex에게 현재 상태를 설명하고 이 자료를 보여 주며 이번 주 안에 수리해 달라고 부탁하려 한다. Alex가 수리 일정을 잡거나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 나서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Mia와 인사를 나눈다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Mia의 주말 취미도 물으며 대화를 이어가려 한다. Mia가 어떤 취미를 말하는지와 대화가 어떻게 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "처음 만난 이웃에게 자전거 타기를 좋아한다고 말하며 주말 취미를 물어봐요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외에서 고장 난 난방을 수리해 달라고 집주인에게 부탁하고 동네 모임에서 새 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 직원에게 제품 사용법을 물어보는 상황도 넣어 볼게요. 커피 머신을 처음 사용해 보며 버튼 조작이 헷갈리는 순간에 직원에게 천천히 설명해 달라고 요청하는 장면은 어때요?

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
        "details": "다른 날 같은 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 원하는 질감과 사용 방법을 설명해 달라고 부탁하려 한다. 첫 화에서 커피 머신을 교환했는지, 어떤 제품을 가지고 있는지는 정하지 않는다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 우유 거품을 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 지난번 커피 머신 교환 결과와 무관하게 체험 코너에 와서, 우유 거품을 내는 순서와 주의할 점을 설명해 달라고 한다. Noah가 시범을 보이거나 어떤 방법을 안내할지는 정하지 않는다.",
        "number": 2,
        "preview": "매장 체험 코너에서 Noah에게 우유 거품 내는 법을 물어요",
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

한 스토리에는 최대 5화까지 넣을 수 있어요. 어느 화를 뺄지 말해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 정확한 사용량과 기본적인 세척 방법을 설명해 달라고 한다. 청소가 제대로 되는지나 Noah의 답변은 정하지 않는다.",
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
