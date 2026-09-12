# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:01:56.371Z
프롬프트: 현재 작업본
프롬프트 SHA-256: bc5ce425cb2eb5c1813aa679e2e06ef49f849ddc029d49033331566f7d8d2e43 (실행 뒤 같은 프롬프트에서 확인)
답 45개, 실패 0개, 호출 실패 0개

의미와 재미에 대한 사람의 검토는 별도다. 아래는 출력 전문과 기계 검사 결과다.

## 1번째 충분한 한 사건
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 차분하게 제품과 구매 내역을 확인하고 고객의 설명을 들은 뒤 가능한 절차를 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, green store uniform and beige trousers, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 구매한 커피 머신에서 물이 새는 문제를 설명한다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 제품과 구매 내역을 확인하며 응대한다. 교환이 가능한지와 이후 절차는 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "새는 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 구매한 매장 고객 서비스 데스크",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 처음 생활하며 일상적인 도움을 요청하는 상황부터 연습해 볼 수 있어요. 집을 구한 뒤 집주인에게 고장 난 수도를 설명하는 순간과, 동네 마트에서 원하는 물건을 찾지 못해 직원에게 묻는 순간 중 어떤 장면이 더 필요해요?

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
        "role": "20대 후반의 마트 직원. 손님이 찾는 물건의 위치를 차분히 안내하고 필요한 설명을 다시 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, attentive and slightly uncertain, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 생활을 시작한 뒤 동네 마트에서 필요한 식재료를 찾지 못해 직원 Maya에게 도움을 요청한다. 나는 물건의 이름과 용도를 설명하고 어디에 있는지 물어보려 한다. Maya는 매장 안 물건 위치를 안내할 수 있지만 내가 찾는 물건을 정확히 알아듣는지는 대화에서 정한다. 주변 손님에게 크게 묻거나 물건을 포기하지 않고 직원과 영어로 해결하려 한다.",
        "number": 1,
        "preview": "동네 마트에서 필요한 식재료를 찾지 못해 직원에게 물어봐요",
        "title": "마트에서 찾기"
      }
    ],
    "hook": "해외 생활 첫 장보기에서 필요한 식재료를 찾지 못해요",
    "setting": "해외의 동네 마트 통로",
    "title": "낯선 동네에서 장보기"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬고 쳐다보는데 먼저 양해를 구하는 순간으로 해볼까요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편해도 화내지 않고 한숨과 시선으로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. Emma는 옆자리에서 한숨을 쉬며 계속 쳐다보지만 화내지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 말하려 한다. Emma가 이해해 주는지는 플레이에서 정한다.",
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

해외 집에서 문제가 생겨 집주인에게 수리를 요청하고, 동네 모임에서는 처음 만난 사람에게 자연스럽게 인사하는 상황이네요. 먼저 집주인에게 누수가 생겼다고 알리고 빨리 수리해 달라고 말하는 순간부터 정해 볼까요?

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리를 부탁하는 상황으로 정할게요. 동네 모임에서는 처음 만난 이웃에게 이름과 사는 곳을 간단히 말하고 상대의 이야기도 물어보는 순간으로 해볼까요?

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
        "role": "40대 후반의 집주인. 수리 요청을 받으면 비용과 일정을 먼저 확인하고 구체적인 자료가 있으면 차분히 검토한다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 조심스럽지만 주말 취미 이야기가 나오면 자신의 관심사도 편하게 나눈다."
      }
    ],
    "cover": "A man in his late forties, short salt and pepper hair, casual dark sweater and trousers, concerned and slightly tense while listening attentively, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 보여 주는 사진과 온도 기록을 가지고 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정을 받아들이는지, 비용이나 다른 조건을 제시하는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "동네 모임에서 처음 만난 Sophie에게 인사를 건넨다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Sophie의 주말 취미도 물으며 자연스럽게 대화를 이어가려 한다. Sophie의 취미와 대화의 흐름은 플레이에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 주말 취미로 자전거 타기를 이야기해요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 모임에서 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

가전 매장에서 겪을 다른 상황도 넣어 볼게요. 며칠 뒤 같은 매장에 다시 들러 커피 머신 사용법을 물어보는 대신, 다른 제품의 기능을 비교해 보며 직원에게 추천을 요청하는 장면은 어때요?

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, Noah의 설명을 들으며 필요한 방법을 확인하려 한다. 첫 번째 에피소드에서 커피 머신 교환에 성공했는지는 정하지 않으며, 그 결과와 관계없이 우유 거품 내는 법을 묻는 상황으로 시작한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 커피 머신을 교환했는지, 교환하지 못했는지는 정하지 않으며, 체험 코너에서 우유 거품을 직접 만들어 보는 방법과 주의할 점을 영어로 물어보려 한다.",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 청소 방법을 설명해 달라고 하려 한다. Noah가 설명을 얼마나 자세히 해 주는지는 정하지 않는다.",
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

## 2번째 충분한 한 사건
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



```json
[
  {
    "characters": [
      {
        "name": "Maya",
        "position": 1,
        "role": "20대 후반의 매장 직원. 차분하게 제품과 구매 내용을 확인하고 손님의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, attentive and slightly concerned while leaning forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "전자제품 매장에서 어제 산 커피 머신에 물이 새는 문제를 설명한다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 차분하게 제품과 구매 내용을 확인한다. 영수증과 영상은 내가 직접 보여 줄 수 있지만, 교환이 가능한지와 직원의 최종 답변은 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "전자제품 매장 고객 서비스 데스크",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 매일 마주칠 만한 영어 대화를 연습하고 싶은 거네요. 처음 장을 보러 간 가게에서 원하는 물건을 찾지 못해 직원에게 위치나 대체 상품을 묻는 순간부터 해볼까요?

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
        "role": "30대 초반의 마트 직원. 손님의 말을 차분히 듣고 매장 안의 위치나 비슷한 상품을 안내한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, green store vest over a beige shirt, attentive and slightly curious, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외 생활을 시작한 뒤 동네 마트에서 필요한 물건을 찾지 못한 상황이다. 나는 진열대 앞에서 Maya에게 물건의 위치를 묻고, 원하는 상품이 없을 때는 비슷한 대체 상품이 있는지도 물어보려 한다. Maya가 어떤 상품을 안내할지와 내가 원하는 물건을 찾을 수 있는지는 정하지 않는다.",
        "number": 1,
        "preview": "동네 마트에서 필요한 물건을 찾지 못해 직원에게 도움을 요청해요",
        "title": "마트에서 찾기"
      }
    ],
    "hook": "동네 마트에서 필요한 물건을 찾지 못해 직원에게 도움을 요청해요",
    "setting": "해외의 동네 마트",
    "title": "해외 생활 첫 장보기"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬고 쳐다보는 가운데, 달래려고 애쓰고 있으니 조금만 이해해 달라고 먼저 말하는 순간으로 해볼까요?

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
        "role": "40대 초반의 회사원. 조용히 쉬고 싶어 하지만 화내지 않고 상대의 설명을 들으면 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, beige sweater, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 생활하며 집주인과 수리 일정을 조율하고 동네 사람들과 처음 인사하는 상황이네요. 먼저 집에서 물이 새거나 난방이 안 되는 등 생활에 불편이 생겨 집주인에게 상황을 설명하고 수리를 요청하는 순간부터 정해 볼까요?

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요. 동네 모임에서는 처음 만난 이웃에게 가볍게 자기소개하고 모임에 온 이유를 말하는 장면으로 해볼까요?

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
        "role": "40대 초반의 집주인. 수리 요청을 받으면 먼저 상황과 기록을 확인하고 가능한 일정을 조율한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 가볍게 인사를 나누며 상대의 취미를 들으면 자신의 주말 이야기도 보탠다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual sweater and trousers, concerned and slightly tense while standing upright, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 가지고 Daniel에게 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 요청을 받아들이는지, 수리 일정을 잡을 수 있는지는 정하지 않는다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 Maya와 인사를 나눈다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 친해졌거나 대화가 잘 풀렸다고 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말해요",
        "title": "주말 취미"
      }
    ],
    "hook": "집 난방이 고장 나 집주인에게 이번 주 안에 수리해 달라고 부탁하고, 동네 모임에서는 처음 만난 이웃과 주말 취미를 이야기해요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

커피 머신을 산 뒤 겪을 다른 상황도 넣어 볼게요. 며칠 후 같은 매장에 다시 들러 사용법을 잘 모르겠다고 직원에게 묻는 장면은 어때요?

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
        "details": "다른 날 같은 매장에서 Noah를 다시 만난다. 나는 커피 머신으로 우유 거품을 내는 법을 물어보고, 원하는 거품을 만들기 위한 순서와 방법을 설명해 달라고 한다. 첫 번째 에피소드에서 교환에 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않으며 Noah가 사용법을 설명할 수 있는지는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보고 싶어 사용 방법과 주의할 점을 질문한다. 첫 번째 에피소드에서 교환이 되었는지, 거절되었는지, 어떤 절차가 진행되었는지는 정하지 않으며 그 결과와 무관하게 체험 코너에서 대화를 시작한다.",
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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 청소 방법을 설명해 달라고 한다. Noah가 정확한 사용법을 알려 주는지는 플레이에서 정한다.",
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

## 3번째 충분한 한 사건
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



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
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store apron over a white shirt, calm but concerned while leaning slightly forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "매장에서 어제 구매한 커피 머신을 가져와 물이 새는 문제를 설명한다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 영수증과 영상을 확인하며 내 설명을 듣는다. 교환이 가능한지와 직원의 최종 대응은 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "생활 가전 매장의 고객 상담대",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외 생활에서 자주 겪는 일부터 영어로 말해 보고 싶은 거네요. 처음 이사한 동네의 슈퍼마켓에서 원하는 물건을 찾지 못해 직원에게 묻고 결제까지 해보는 상황은 어때요?

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
        "role": "20대 후반의 슈퍼마켓 직원. 손님이 찾는 물건을 먼저 확인하고, 설명이 필요하면 천천히 다시 말한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, green supermarket vest over a white shirt, attentive and slightly puzzled while gesturing gently, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "해외 생활을 시작한 뒤 동네 슈퍼마켓에서 필요한 물건을 찾지 못한다. 나는 진열대 위치와 비슷한 상품의 차이를 Mia에게 영어로 묻고, 원하는 물건을 골라 계산하려 한다. Mia가 물건을 찾아 주거나 내가 바로 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "동네 슈퍼마켓에서 원하는 물건을 찾지 못해 직원에게 물어봐요",
        "title": "슈퍼마켓에서"
      }
    ],
    "hook": "동네 슈퍼마켓에서 원하는 물건을 찾지 못해 직원에게 물어봐요",
    "setting": "해외 주거 지역의 작은 슈퍼마켓",
    "title": "낯선 동네 생활"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬며 쳐다보는데, 먼저 말을 걸어 조금만 이해해 달라고 부탁하는 순간으로 해볼까요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편해도 고함치지 않고 상대의 설명을 들어요."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, seated upright with her shoulders slightly tense, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 상황이 불편하더라도 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하는지와 상황이 풀리는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내에서 양해 구하기"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외 집주인에게 집 안의 고장 난 부분을 설명하고 수리를 요청하는 상황과, 동네 모임에서 처음 만난 사람에게 자연스럽게 인사하는 상황이네요. 수리는 물이 새거나 난방이 안 되는 문제를 설명하는 장면으로, 모임은 옆자리에 앉은 사람에게 먼저 말을 거는 장면으로 정해 볼까요?

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하는 상황이네요. 동네 모임에서는 처음 만난 사람에게 이름과 어디에서 왔는지를 간단히 말하며 대화를 시작하는 장면으로 해볼까요?

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
        "role": "40대 후반의 집주인. 수리 요청의 내용을 먼저 확인하고 일정과 비용을 신중하게 따진다. 사진과 기록처럼 구체적인 자료가 있으면 차분히 설명을 듣는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 조심스럽지만 상대의 취미를 물으며 편안하게 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair, casual sweater and jeans, concerned and listening with one hand slightly raised, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 보여 주는 사진과 실내 온도 기록을 가지고 집주인 Daniel에게 문제를 설명한다. 이번 주 안에 수리해 달라고 부탁하려 하며, Daniel이 수리 일정을 잡을 수 있는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya와 인사를 나눈다. 나는 주말에 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물으며 자연스럽게 대화를 이어 가려 한다. 두 사람이 가까워졌거나 대화가 잘 풀렸다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "처음 만난 이웃에게 자전거 타기를 좋아한다고 말하며 주말 취미를 물어요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외 생활 중 집주인과 이웃에게 각각 필요한 말을 꺼내야 해요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 날 직원에게 커피 머신 사용법을 물어보는 상황도 넣어 볼게요. 물이 새는 문제와는 별개로, 처음 사용할 때 추출 시간이 너무 길어 원래 그런 제품인지 확인하는 장면은 어때요?

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
        "details": "다른 날 같은 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신의 교환이 성공했는지는 정해지지 않은 상태에서 사용 방법을 설명해 달라고 한다. Noah가 어떤 방법을 알려 주는지와 내가 원하는 거품을 만들 수 있는지는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에 간다. 이전에 커피 머신을 교환했는지, 어떤 결과가 났는지와 무관하게 우유 거품을 내는 법을 Noah에게 묻고 직접 배워 보려 한다. Noah가 시범을 보이거나 설명하는 방식과 내가 제대로 따라 하는지는 플레이에서 정한다.",
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

한 스토리에는 최대 5화까지 넣을 수 있어요. 어느 화를 뺄지 말해 주세요?

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
        "details": "같은 매장 직원에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 방법을 설명해 달라고 하려 한다. Noah가 정확한 양을 알려 주는지는 정하지 않는다.",
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
