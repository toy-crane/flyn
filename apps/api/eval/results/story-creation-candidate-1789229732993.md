# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:15:32.993Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 8dc2d8ab3ee0504abdcaaede4bcd48a606efa5b9612db022ae3370fd9c8dbf71
답 54개, 실패 0개, 호출 실패 0개

의미와 재미에 대한 사람의 검토는 별도다. 아래는 출력 전문과 기계 검사 결과다.

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련된 상황을 영어로 연습해 보고 싶은 거라면, 갑자기 비를 맞아 가게에서 우산을 빌리는 장면이나 약속 장소에 늦어 비 때문에 늦었다고 설명하는 장면이 떠올라요. 둘 중 어느 장면에 가까워요?

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하며 불편할 때 고함치지 않고 한숨과 시선으로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 소리를 지르거나 화내지 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 사실을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
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

여행 중 다른 장면으로, 비행기에서 내린 뒤 공항에서 아기와 함께 갈 곳을 찾다가 안내 직원에게 수유실이나 조용한 공간을 묻는 상황을 넣어 볼게요. 안내 직원에게 필요한 장소를 설명하고 위치를 물어보는 장면이 맞아요?

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
    "cover": "A woman in her late twenties, shoulder length dark brown hair, green store apron over a white shirt, calm and attentive with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "매장에서 어제 산 커피 머신을 들고 와서 물이 새는 문제를 설명한다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 내 설명과 자료를 차분히 확인한다. 실제로 교환이 가능한지, 추가 확인이 필요한지는 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요.",
    "setting": "커피 머신을 구매한 매장 고객 서비스 데스크",
    "title": "커피 머신 문제"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에 막 도착해 일상에서 영어로 말을 꺼내야 하는 상황을 연습하고 싶은 거네요. 집을 구하거나 관공서에서 도움을 요청하는 장면보다, 처음 만난 이웃에게 생활 정보를 묻거나 동네 가게에서 필요한 물건을 찾는 순간부터 시작해 볼까요?

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
        "role": "30대 초반의 이웃 주민. 생활 규칙을 잘 알고 있지만 낯선 사람에게는 먼저 말을 많이 걸지 않는다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "20대 후반의 같은 집 거주자. 필요한 정보는 친절하게 알려 주지만 바쁠 때는 대화를 짧게 끝내려 한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, casual beige sweater and jeans, slightly nervous but polite with one hand raised to get attention, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 생활을 시작한 나는 공동주택에 막 이사해 왔다. 공용 세탁실과 쓰레기 배출 장소를 아직 잘 모르고, 관리 안내문에는 기본적인 생활 규칙만 적혀 있다. 복도에서 만난 Maya에게 먼저 인사를 건 뒤 세탁실 이용 방법과 쓰레기를 내놓는 시간을 묻고, 낯선 환경에 적응하는 데 도움이 될 만한 생활 정보를 부탁하려 한다. Maya가 얼마나 자세히 알려 주는지나 내가 원하는 정보를 얻는지는 정하지 않는다. 무례하게 따지거나 긴급한 문제라고 과장하지 않고, 필요한 내용을 이해하지 못하면 다시 물어보려 한다.",
        "number": 1,
        "preview": "새로 이사한 집의 생활 규칙을 몰라 이웃에게 먼저 말을 걸어요",
        "title": "이웃에게 묻기"
      }
    ],
    "hook": "새로 이사한 집의 생활 규칙을 몰라 이웃에게 먼저 말을 걸어요",
    "setting": "해외의 공동주택 복도와 공용 세탁실",
    "title": "낯선 동네에서 살기"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬며 쳐다봐서, 먼저 말을 걸고 애쓰고 있으니 조금만 이해해 달라고 부탁하는 순간으로 해볼까요?

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
        "role": "40대 초반의 승객. 불편하면 한숨을 쉬며 바라보지만 화내지는 않고 상대의 설명을 들으면 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft gray sweater, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내지 않고 한숨을 쉬며 계속 바라본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지는 플레이에서 정한다.",
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

해외에서 집주인에게 집 안의 고장 수리를 요청하고, 동네 모임에서는 처음 만난 이웃에게 자연스럽게 인사하는 상황이네요. 수리는 욕실 누수처럼 생활에 불편을 주는 문제를 설명하는 순간으로, 모임 인사는 옆자리에 앉은 이웃에게 자기소개와 동네에 온 이유를 말하는 순간으로 정해 볼까요?

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요. 동네 모임에서는 처음 만난 이웃에게 이름과 사는 곳을 소개하고 가볍게 대화를 시작하는 장면으로 해볼까요?

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
        "role": "40대 후반의 집주인. 수리 요청의 구체적인 증거를 확인하고 일정과 비용을 차분히 따진다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게도 편하게 말을 걸지만 상대의 관심사를 먼저 살핀다."
      }
    ],
    "cover": "A man in his late forties, short salt and pepper hair, casual button up shirt and dark trousers, concerned and slightly tense while listening, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 보여 주는 사진과 온도 기록을 가지고 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정을 바로 정하는지, 다른 방법을 제시하는지는 정하지 않는다.",
        "number": 1,
        "preview": "집 난방이 고장 나서 사진과 온도 기록을 들고 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 Maya와 주말 취미에 관해 이야기한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물으며 대화를 이어가려 한다. Maya의 취미와 대화의 분위기는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말해요",
        "title": "주말 취미"
      }
    ],
    "hook": "집 난방이 고장 나 사진과 온도 기록을 들고 집주인을 찾아가요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

커피 머신을 들고 매장을 다시 방문해 다른 직원에게 상황을 설명하는 장면도 넣을 수 있어요. 같은 매장에서 사용법을 확인받거나 수리 절차를 문의하는 상황 중 어느 쪽을 경험해 보고 싶어요?

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
        "details": "같은 매장에서 다른 날 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신을 실제로 교환했는지 또는 어떤 상태인지에 대한 결과는 정하지 않는다. Noah가 우유 거품을 내는 방법을 설명할지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah에게 우유 거품 내는 법을 물어봐요",
        "title": "우유 거품 내기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 커피 시연 공간",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 제대로 만들고 싶어 사용법과 적절한 우유 양이나 순서를 설명해 달라고 하려 한다. 첫 번째 에피소드의 교환 결과나 Noah와의 관계는 정해져 있지 않으며, 체험 코너에서 우유 거품 내는 법을 묻는 상황으로 진행한다.",
        "number": 2,
        "preview": "같은 매장 체험 코너에서 우유 거품을 내는 법을 물어봐요",
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
        "details": "같은 매장 직원에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 정확한 사용량과 청소 방법을 확인하려 한다. Noah가 설명하는 내용과 청소 결과는 정하지 않는다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비가 오는 날 영어로 대화하는 상황을 떠올리신 거라면, 우산이 없어 곤란한 순간에 카페 직원이나 지나가는 사람에게 도움을 요청하는 장면 중 어느 쪽에 가까워요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬지만 상대의 설명은 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 계속된다. Emma는 고함치지 않고 한숨을 쉬며 아기와 나를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 대화가 어떻게 끝나는지는 정하지 않는다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

비행기에서 겪을 다른 장면도 넣어 볼게요. 아기를 안고 있는 상태에서 승무원에게 아기용품이나 좌석 주변의 도움을 요청하는 순간을 추가할까요?

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 제품 상태를 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder length dark brown hair, green store polo shirt, calmly attentive with one hand raised in a reassuring gesture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 매장에서 산 커피 머신을 집에서 사용하던 중 물이 샌다. 나는 영수증과 누수 장면을 촬영한 영상을 가지고 매장에 와서 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 확인하며 제품과 구매 내용을 물어본다. 교환이 가능한지와 실제 결과는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 왔어요",
    "setting": "생활용품 매장의 고객 서비스 데스크",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 혼자 생활하며 현지 사람에게 필요한 말을 꺼내는 상황을 연습하고 싶은 거네요. 처음 도착한 날 집 근처 마트에서 물건 위치나 결제 방법을 직원에게 묻는 장면과, 집에서 문제가 생겨 집주인에게 연락하는 장면 중 어느 쪽에 가까워요?

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
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 마트 직원. 외국인 손님의 서툰 말을 재촉하지 않고 필요한 물건과 결제 방법을 차분히 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, green store uniform, attentive with a slightly puzzled but friendly expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "해외 생활을 시작한 지 얼마 되지 않은 나는 동네 마트에서 필요한 물건을 찾지 못하고 있다. Mia에게 물건의 위치를 묻고, 원하는 상품이 있는지 확인한 뒤 결제 방법까지 영어로 물어보려 한다. Mia가 어떤 상품을 안내할 수 있는지와 대화가 얼마나 순조로운지는 플레이에서 정한다. 주변 사람에게 대신 말해 달라고 요청하거나 당황해서 대화를 포기하지 않으려 한다.",
        "number": 1,
        "preview": "동네 마트에서 필요한 물건을 찾지 못해 직원에게 말을 걸어요",
        "title": "동네 마트"
      }
    ],
    "hook": "해외 생활을 시작하고 동네 마트에서 필요한 물건을 찾지 못했어요",
    "setting": "해외의 작은 동네 마트",
    "title": "낯선 동네 생활"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있는데 옆자리 승객이 계속 한숨을 쉬며 쳐다보는 상황이네요. 승객에게 애쓰고 있으니 조금만 이해해 달라고 먼저 양해를 구하는 장면으로 해볼까요?

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
        "role": "40대 초반의 편집자. 아기의 울음에 불편함을 느끼지만 화내지 않고 한숨과 시선으로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray sweater, tired and glancing sideways with restrained discomfort, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 주변 승객에게 폐를 끼치려는 것이 아니니 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요.",
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

해외에서 집주인에게 집 안의 문제를 설명하고 수리를 요청하는 상황과, 동네 모임에서 처음 만난 사람에게 자연스럽게 인사하는 상황이네요. 먼저 집주인에게 욕실 누수나 난방 고장처럼 생활에 불편을 주는 문제를 설명하고 수리 일정을 잡아 달라고 말하는 장면은 어때요?

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 요청하는 장면으로 정할게요. 동네 모임에서는 처음 만난 이웃에게 이름과 사는 곳을 간단히 말하고, 모임에 어떻게 오게 됐는지 물어보는 순간은 어때요?

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
        "role": "40대 후반의 집주인. 수리 요청을 받으면 먼저 문제의 상태와 기록을 확인하고 일정 조율을 신중하게 한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 가볍게 인사하고 상대의 취미를 들으면 자신의 주말 활동도 이야기한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a little gray, casual sweater and trousers, concerned and checking a message with a tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 임대한 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 문제 상태를 보여 주는 사진과 실내 온도 기록을 근거로 제시하며 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel은 집주인으로서 상태와 기록을 확인할 수 있고, 수리 일정이나 대응을 어떻게 할지는 대화에서 정한다. 난방이 실제로 이번 주 안에 고쳐지는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "집 난방이 고장 나서 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물어보며 대화를 이어가려 한다. Maya가 어떤 취미를 말할지, 두 사람이 얼마나 대화를 이어 갈지는 실제 대화에서 정한다. 앞 화의 집주인과의 대화 결과나 관계는 이 상황에 영향을 주지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말하고 주말 취미를 물어봐요",
        "title": "주말 취미"
      }
    ],
    "hook": "집 난방 문제를 해결해 달라고 집주인에게 자료를 보여 주고, 동네 모임에서는 새로운 이웃과 취미 이야기를 나눠요",
    "setting": "해외 임대 주택과 동네 커뮤니티 모임",
    "title": "해외 생활의 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 직원에게 제품 보증 기간과 수리 절차를 물어보는 장면을 추가해 볼게요. 고장 난 커피 머신을 들고 수리와 환불 중 어떤 방법이 가능한지 상담하는 상황이 맞아요?

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 방법을 물어보고, 어떤 우유를 써야 하는지와 거품을 낼 때 주의할 점을 설명해 달라고 한다. 첫 번째 에피소드에서 교환에 성공했는지, 커피 머신을 가지고 있는지, 두 사람의 관계가 어떻게 되었는지는 정하지 않는다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보며 적절한 우유와 방법을 설명해 달라고 하려 한다. 첫 번째 에피소드의 교환 결과와 무관하게 체험 코너에 온 상황이며, Noah가 얼마나 자세히 알려 주는지는 정하지 않는다.",
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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 안전하게 청소하는 방법과 세척제의 적정량을 설명해 달라고 하려 한다. Noah가 알려 주는 구체적인 방법과 세척제의 양은 플레이에서 정한다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
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

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

비와 관련된 영어 대화 상황을 떠올리신 거라면, 갑자기 비가 와서 카페 직원이나 호텔 프런트에 우산을 빌리거나 도움을 요청하는 장면 중 어느 쪽에 가까워요?

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
        "role": "40대 초반의 승객. 아기의 울음에 불편함을 느끼지만 소리치지 않고, 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울고 있어 나는 아기를 달래려고 애쓰고 있다. 옆자리의 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 소리를 지르거나 직접 항의하지는 않는다. 나는 내가 아기를 달래려고 노력하고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서 겪을 다른 장면도 넣어 볼게요. 비행기에서 내린 뒤 아기와 함께 공항에서 길을 찾다가 직원에게 도움을 요청하는 상황은 어때요?

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
        "name": "Maya",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명과 증거를 차분히 확인하고 정해진 교환 절차를 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple beige store uniform, calmly listening with an attentive expression and slightly open hands, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "매장에서 어제 구입한 커피 머신을 가지고 와서 물이 새는 문제를 설명한다. 나는 영수증과 누수 장면을 찍은 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 내 설명과 자료를 확인한다. 실제로 교환이 가능한지와 이후 절차는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 보여 주며 교환을 요청해요",
        "title": "누수 제품 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 판매한 매장의 고객 응대 창구",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 지내며 매일 겪는 생활 영어를 연습하고 싶은 상황이네요. 처음 이사한 집에서 난방이나 온수가 제대로 나오지 않아 집주인이나 관리인에게 설명하고 도움을 요청하는 장면부터 해볼까요?

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
        "role": "30대 중반의 주거 관리인. 문제 상황을 차분히 확인하고 가능한 해결 방법을 설명한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder length dark hair, casual blouse and cardigan, attentive with a concerned expression and slightly leaning forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활하는 중 집에서 난방이나 온수가 제대로 나오지 않는다. 나는 주거 관리인 Maya에게 현재 어떤 문제가 생겼는지 설명하고, 언제부터 그랬는지와 생활에 불편이 크다는 점을 말하며 도움을 요청하려 한다. Maya가 바로 해결해 주는지는 정하지 않으며, 문제의 원인이나 처리 방법은 대화 중 확인한다.",
        "number": 1,
        "preview": "집에서 난방이나 온수가 나오지 않아 관리인에게 상황을 설명해요",
        "title": "집의 고장"
      }
    ],
    "hook": "해외에서 지내는 집의 난방이나 온수가 나오지 않아 도움을 요청해요",
    "setting": "해외에서 처음 생활하는 아파트",
    "title": "해외 생활 첫 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 시선도 신경 쓰이게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬고 쳐다봐서 먼저 양해를 구하고 조금만 이해해 달라고 말하는 순간으로 해볼까요?

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하지만 상대가 사정을 설명하면 차분히 들어준다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내지 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 집주인에게 집 수리를 요청하고, 동네 모임에서 처음 만난 사람에게 자연스럽게 인사하는 두 장면이네요. 먼저 집주인에게 욕실 누수나 난방 문제처럼 생활에 불편을 주는 고장을 설명하고 수리 일정을 잡아 달라고 말하는 상황부터 정해 볼까요?

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 고장 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 집주인에게 부탁하는 상황으로 정할게요. 동네 모임에서는 처음 만난 이웃이 먼저 다가와 자기소개를 하고, 사는 곳이나 모임에 온 이유를 물어보는 순간에 인사해 보는 장면은 어때요?

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
        "role": "40대 초반의 집주인. 집 수리 요청을 받으면 상태와 기록을 확인한 뒤 가능한 일정을 따져 본다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게 주말 취미를 물으며 자신의 관심사도 편하게 이야기한다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual button-up shirt, concerned and listening with a slight frown, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 고장 사진과 실내 온도 기록을 가지고 Daniel에게 상태를 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 일정을 바로 정하거나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 나 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물어보며 대화를 이어가려 한다. 두 사람이 친해졌거나 대화가 자연스럽게 이어졌다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외 생활 중 집주인에게 난방 수리를 부탁하고 동네 모임에서 새 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "해외 생활의 두 장면"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 제품에 대해 직원에게 사용법을 묻는 장면을 넣어 볼게요. 커피 머신의 관리 방법을 묻는 상황과 새 가전제품의 기능을 비교해 달라는 상황 중 어느 쪽을 경험하고 싶어요?

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 우유 거품을 만들 때의 순서와 주의할 점을 설명해 달라고 하려 한다. 첫 번째 에피소드에서 교환에 성공했는지, 어떤 제품을 갖고 있는지는 정하지 않는다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 우유 거품을 내는 법을 물어보고 싶어요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보고, 어떤 우유와 방법을 써야 하는지 설명을 듣고 싶어 한다. 첫 번째 에피소드에서 교환이 되었는지, Noah와 어떤 대화를 나눴는지는 정하지 않으며, 그 결과와 무관하게 체험 코너에 온 상황이다.",
        "number": 2,
        "preview": "체험 코너에서 우유 거품을 내는 법을 배우고 싶어요",
        "title": "우유 거품 배우기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 커피 머신 체험 코너",
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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 사용 방법을 확인하려 한다. Noah가 알려 주는 내용과 청소가 잘되는지는 플레이에서 정한다.",
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
