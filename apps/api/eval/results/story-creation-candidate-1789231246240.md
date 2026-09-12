# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:40:46.240Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 904a4dbff8e9703d0c55184e07b9b4c8d23ba005ff4bf317bd3514c2d4e93424
답 57개, 실패 0개, 호출 실패 0개

기계 검사는 카드 계약을 확인한다. 대화의 이해도, 답할 지점, 말투와 가독성은 아래 전문으로 따로 검토한다. 문장 수와 서식 유무는 합격 기준이 아니다. 사용자 재미 확인도 별도다.

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 그 상황에서 영어로 어떤 순간을 연습해 보고 싶으세요?

예를 들면,

- 싸운 다음 먼저 대화를 다시 시작하는 순간
- 아내에게 내 입장을 설명하고 싶은 순간
- 육아 분담을 구체적으로 다시 정하는 순간
- 내가 서운하게 말한 부분을 사과하는 순간

어떤 일이 계기가 됐고, 상대에게 무엇을 말하고 싶었는지 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하시려는 걸까요? “비”와 관련해 겪고 싶은 장면을 조금만 더 설명해 주세요. 예를 들면 비행기에서 우산을 빌리기, 비 때문에 약속 장소를 바꾸기처럼요.

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하며 불편할 때 한숨과 시선으로 반응하지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained annoyance, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 한숨을 쉬고 나와 아기를 바라보지만 소리를 지르거나 직접 화내지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 사실을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 바라봐요",
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

비행기에서 겪을 다른 장면도 하나 넣어 볼게요. 착륙 후 공항에서 아기와 함께 이동하다가, 수하물 문제로 직원에게 도움을 요청하는 상황은 어때요? 원하시는 다른 장면이 있으면 말씀해 주세요.

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
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 고객의 설명과 영수증, 누수 영상을 차분히 확인하며 화내지 않는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm but concerned with an apologetic expression and open hands, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 어제 매장에서 샀는데 집에서 사용하자 물이 샌다. 나는 영수증과 누수 영상을 직원 Mia에게 보여 주며 제품에 문제가 있다는 것을 설명하고 교환을 요청하려 한다. Mia는 화내지 않고 내 설명과 자료를 차분히 확인한다. 제품을 실제로 교환해 주는지, 다른 해결책을 제시하는지는 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아갔어요",
        "title": "누수 제품 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아갔어요",
    "setting": "고장 난 커피 머신을 들고 찾아간 매장 고객 서비스 데스크",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 법한 장면을 영어로 연습해 보고 싶으신 거네요.

예를 들면 이런 상황이 있어요.

1. **집 구하기**: 집주인이나 중개인에게 방 상태와 계약 조건을 묻기  
2. **마트나 식당 이용하기**: 원하는 물건을 찾거나 음식에 알레르기가 있다고 설명하기  
3. **직장이나 학교에서 생활하기**: 처음 만난 사람에게 자기소개하고 도움을 요청하기  
4. **병원이나 약국 가기**: 증상을 설명하고 필요한 약을 묻기  
5. **문제 해결하기**: 집의 고장, 배송 오류, 소음 문제를 담당자에게 설명하기  

어떤 장면부터 경험해 보고 싶으세요? 한 가지만 골라도 되고, 여러 상황을 정해도 돼요.

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
        "role": "30대 초반의 아파트 관리 직원. 입주자의 설명을 차분히 듣고 필요한 정보를 확인한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "30대 후반의 이웃 주민. 생활 규칙을 중요하게 생각하고 불편한 점을 직접 말한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder length dark brown hair, casual smart sweater and trousers, slightly nervous but attentive, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활을 시작한 나는 아파트에 입주한 뒤 욕실의 온수가 나오지 않는 문제를 발견한다. 관리 사무실에서 Maya에게 언제부터 문제가 있었는지 설명하고, 수리 가능한 시간과 내가 해야 할 일을 물어보려 한다. Maya가 바로 수리해 주는지, 추가 비용이 있는지, 문제가 해결되는지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 이사한 집에서 온수가 나오지 않아 관리 사무실에 찾아가 설명해요",
        "title": "고장 난 온수"
      }
    ],
    "hook": "새로 이사한 집에서 온수가 나오지 않아 관리 사무실에 찾아가요",
    "setting": "해외 아파트의 관리 사무실",
    "title": "낯선 곳에서 살기"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬어서, 먼저 말을 걸고 양해를 구하는 순간으로 연습해 볼까요? 화를 내는 사람인지, 조용히 불편해하는 사람인지도 알려 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편할 때 한숨을 쉬고 쳐다보지만 고함치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 어떤 반응을 보이는지는 정하지 않는다.",
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

해외 생활에서 꼭 필요한 두 장면이네요.

- **집주인과 수리 이야기:** 집 안의 문제가 생겨 집주인에게 상태와 불편한 점을 설명하고, 수리 일정을 요청하는 순간으로 해볼까요? 어떤 문제가 생겼는지 정해 주시면 좋아요. 예를 들면 **온수가 안 나오거나, 욕실 누수가 생긴 상황**이 있어요.
- **동네 모임에서 인사하기:** 처음 참석한 모임에서 옆 사람에게 자신을 소개하고, 어디에서 왔는지와 모임에 온 이유를 이야기하는 상황으로 해볼까요? 특별히 피하고 싶은 질문이나 꼭 말하고 싶은 내용이 있으면 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 나서 집 안이 춥고, 사진과 온도 기록을 보여 주며 이번 주 안에 수리를 요청하는 상황으로 정할게요. 집주인이 바로 해결해 줄지는 정하지 않고, 사용자가 문제와 요청을 설명하는 순간부터 시작하겠습니다.

동네 모임에서는 어떤 장면이 좋으세요? 처음 만난 사람에게 간단히 자기소개하는 상황이면 될까요, 아니면 이미 모임에 들어가 **옆자리에 앉은 사람에게 먼저 말을 거는 순간**을 연습하고 싶으세요?

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
        "role": "50대 초반의 집주인. 수리 요청을 받으면 비용과 일정을 먼저 확인하며 구체적인 자료가 있으면 내용을 꼼꼼히 살핀다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 가볍고 편하게 말을 걸며 주말에 하는 일을 물어본다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual dark sweater, concerned and slightly tense while listening carefully, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 상태를 찍은 사진과 실내 온도 기록을 가지고 집주인 Daniel에게 문제를 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이거나 실제 수리 일정을 정하는지는 플레이에서 결정한다.",
        "number": 1,
        "preview": "집 안 난방이 고장 나 사진과 온도 기록을 보여 주며 이번 주 안에 고쳐 달라고 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya와 대화를 시작한다. 나는 주말 취미로 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물어보며 대화를 이어가려 한다. 두 사람이 금방 친해지거나 대화가 잘 풀린다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말하고 주말 취미를 물어봐요",
        "title": "주말 취미"
      }
    ],
    "hook": "난방이 고장 난 집에서 집주인에게 수리를 부탁하고 동네 모임에서 새 이웃과 이야기를 나눠요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 교환이나 환불 절차를 확인하는 다른 장면을 넣어 볼게요. 예를 들면, 직원이 제품 점검을 위해 시간이 필요하다고 말해서, 당장 필요한 이유와 원하는 처리 방법을 설명하는 상황은 어때요?

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
        "details": "첫 번째 상황과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 필요한 방법이나 주의할 점을 설명해 달라고 하려 한다. 첫 번째 상황에서 커피 머신을 교환했는지, 교환에 성공했는지, 어떤 제품을 사용하고 있는지는 정하지 않는다. Noah가 어떻게 설명하는지는 플레이에서 정한다.",
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
        "details": "첫 번째 상황과 다른 날, 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보며 적절한 방법과 사용법을 알고 싶어 한다. 첫 번째 상황에서 교환이 되었는지 여부와 관계없이 체험 코너에 간 상황이며, Noah가 얼마나 자세히 설명하거나 직접 도와주는지는 정하지 않는다.",
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

이미 5화라서 에피소드를 더 추가할 수 없어요. 먼저 기존 화를 빼거나 바꿀 화를 정해 주세요.

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
        "details": "같은 매장 직원에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 사용 방법을 설명해 달라고 한다. 직원이 알려 주는 구체적인 방법은 플레이에서 정한다.",
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

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 마음이 무거우셨겠어요. 그 상황에서 어떤 대화를 영어로 연습해 보고 싶으세요?

예를 들면,

- 어제 다툰 뒤 먼저 말을 꺼내고 싶다
- 육아 분담에 대한 내 생각을 설명하고 싶다
- 아내의 말을 듣고 오해를 풀고 싶다
- 감정이 격해지지 않게 사과하고 대화하고 싶다

싸움의 구체적인 내용은 자세히 말하지 않아도 괜찮아요. 지금 가장 연습하고 싶은 순간과 이루고 싶은 말을 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비”라고 하신 건 어떤 상황을 뜻하시나요?  
예를 들면 **비 오는 날 길을 걷는 상황**, **비행기 안에서 대화하는 상황**, 또는 다른 장면일까요?

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
        "role": "40대 초반의 승객. 아기의 울음에 불편함을 느끼지만 소리치지 않고, 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with pressed lips, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리 승객 Emma는 한숨을 쉬고 나와 아기를 바라보지만 소리치지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저와 아기를 바라봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선과 한숨이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기 여행에서 이어지는 다른 장면으로, **비행이 끝난 뒤 수하물 찾는 곳에서 옆자리 승객을 다시 만나 짧게 말을 나누는 상황**은 어때요?

아직 첫 대화가 어떻게 끝났는지는 정하지 않고, 저는 아기를 돌보느라 정신없었던 상황을 설명하고 상대의 여행 목적도 물어보는 장면으로 만들 수 있어요. 이 방향이 괜찮을까요?

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
        "name": "Maya",
        "position": 1,
        "role": "20대 후반의 매장 직원. 손님의 설명과 자료를 차분히 확인하고 화내지 않으며 교환 요청에 응답한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 직원 Maya에게 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 내 설명과 자료를 확인한다. 교환이 실제로 가능한지와 Maya의 최종 답변은 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 매장의 고객 서비스 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 마주치는 상황을 연습해 보고 싶으신 거네요. 예를 들면 이런 장면이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻기
- 카페나 식당에서 주문이 잘못 나와 설명하기
- 병원이나 약국에서 증상을 말하기
- 직장이나 학교에서 처음 만난 사람과 대화하기
- 관공서에서 서류 문제를 해결하기
- 이웃에게 소음이나 생활 문제를 조심스럽게 말하기

이 중에서 어떤 상황을 겪어 보고 싶으세요? 여러 장면을 원하시면 함께 정해도 좋아요.

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
        "role": "30대 후반의 집주인. 세입자의 말을 차분히 듣고 집 상태와 계약 내용을 확인한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "20대 후반의 이웃. 건물 생활에 익숙하며 필요한 정보를 간단히 알려 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder length dark brown hair, casual beige sweater and dark trousers, concerned but attentive while standing upright and facing someone, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia",
          "Daniel"
        ],
        "details": "해외에서 새로 생활을 시작한 나는 집에서 온수가 나오지 않는 문제를 겪는다. 먼저 이웃 Daniel에게 건물의 온수 사용 방식과 연락해야 할 사람을 물어본 뒤, 집주인 Mia에게 상황을 설명하고 가능한 점검이나 수리를 요청하려 한다. 온수가 언제부터 나오지 않았는지, 다른 수도에서는 어떤지 말할 수 있고 집주인에게 보낼 사진도 가지고 있다. 문제를 설명하는 동안 계약상 수리 책임이 누구에게 있는지는 아직 확정하지 않으며, 수리가 바로 이루어지는지나 비용이 발생하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "새로 구한 집에서 온수가 나오지 않아 이웃에게 물어보고 집주인에게 연락해요",
        "title": "온수가 안 나와요"
      }
    ],
    "hook": "새로 구한 집에서 온수가 나오지 않아 도움을 요청해요",
    "setting": "해외의 오래된 아파트 건물",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 시선도 신경 쓰이는 상황이네요. 먼저 말을 걸어야 하는 순간으로 구체화해 볼까요?

예를 들면 옆자리 승객이 계속 쳐다보거나 한숨을 쉬지만 화를 내지는 않고, 나는 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 말하는 장면이에요. 이런 상황이 맞나요?

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
        "role": "40대 초반의 승객. 불편하면 한숨을 쉬며 쳐다보지만 화를 내지는 않고 상대의 말을 들을 때는 조용히 반응한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울음을 멈추지 않는다. 옆자리의 Emma는 한숨을 쉬며 계속 쳐다보지만 화를 내거나 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 한숨과 시선이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

두 가지 상황을 각각 한 화로 만들어 볼게요.

먼저 **집주인과 수리 얘기하기**는 어떤 문제인가요? 예를 들면 난방이 안 되거나, 물이 새거나, 세탁기가 고장 난 상황처럼요. 집주인에게 수리를 요청하고 싶은 건지, 수리 일정이나 비용도 함께 이야기하고 싶은지도 알려 주세요.

그리고 **동네 모임에서 인사하기**는 어떤 모임인가요? 처음 참석한 자리에서 자기소개를 하고 다른 사람에게 말을 거는 상황인지, 이미 몇 번 본 이웃과 자연스럽게 인사하는 상황인지 궁금해요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, **이번 주 안에 수리해 달라고 요청하는 상황**으로 정할게요. 집주인이 수리 일정을 바로 정할 수 있는지는 플레이에서 결정하지 않겠습니다.

이제 동네 모임에서 인사하는 장면만 정하면 돼요.  
처음 참석한 모임에서 여러 사람에게 자기소개하는 상황인가요, 아니면 이미 몇 번 본 이웃에게 먼저 말을 거는 상황인가요? 인사하면서 자신에 대해 말하고 싶은 내용이나 상대에게 묻고 싶은 것도 있으면 알려 주세요.

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
        "role": "40대 후반의 집주인. 수리 요청을 들으면 문제의 상태와 필요한 일정을 먼저 확인한다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게도 주말 이야기를 들으면 자신의 취미를 편하게 나눈다."
      }
    ],
    "cover": "A man in his late forties, short graying hair, casual sweater and dark trousers, concerned and leaning forward slightly, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 집주인 Daniel에게 보여 주며 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 언제 수리할 수 있는지, 요청을 어떻게 받아들일지는 플레이에서 정한다. 사진과 온도 기록 외에 다른 자료가 있다고 정하지 않는다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요.",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Sophie에게 먼저 인사한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Sophie의 주말 취미도 물으며 대화를 이어가려 한다. Sophie가 어떤 취미를 갖고 있는지, 대화가 얼마나 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요.",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "낯선 동네에서"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

커피 머신을 산 뒤 겪을 다른 상황도 넣어 볼게요.  
교환 요청을 마친 뒤 집에서 새 제품을 설치했는데, 사용법이 헷갈려 매장에 전화해 도움을 요청하는 장면은 어때요?

이 장면을 원하시면, 어떤 점이 헷갈리는지와 상대에게 무엇을 설명하거나 부탁하고 싶은지 알려 주세요.

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 어떤 우유를 써야 하는지나 거품기의 사용 순서처럼 필요한 점을 설명해 달라고 부탁하려 한다. 첫 번째 에피소드에서 교환이 성공했는지, 어떤 제품을 사용하게 되었는지는 정하지 않는다. Noah가 이전 만남을 어떻게 기억하거나 대화를 시작하는지도 플레이에서 정한다.",
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
        "details": "다른 날 같은 가전 매장의 체험 코너에 간다. 첫 번째 에피소드에서 교환이 이루어졌는지와 관계없이 우유 거품을 내는 방법을 Noah에게 묻고, 직접 따라 하거나 필요한 설명을 들으려 한다. Noah가 시범을 보이는 방식과 내가 원하는 거품의 상태는 플레이에서 정한다.",
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

에피소드는 최대 5화까지라 더 추가할 수 없어요. 기존 화를 빼거나 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 절차를 설명해 달라고 한다. Noah가 정확한 양이나 절차를 알려 줄지는 정하지 않는다.",
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

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 마음이 무거우셨겠어요. 그 상황에서 영어로 어떤 대화를 연습해 보고 싶으세요?

예를 들면,

- 싸운 다음 먼저 말을 꺼내고 사과하기
- 육아 부담이 한쪽에 치우쳤다고 설명하기
- 서로의 입장을 차분히 듣기
- 오늘부터 육아를 어떻게 나눌지 이야기하기

어제 실제로 어떤 말 때문에 다툼이 커졌는지, 그리고 상대에게 무엇을 전하고 싶은지 알려주시면 그 순간부터 장면을 만들어 볼게요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

‘비’와 관련된 어떤 상황을 영어로 연습해 보고 싶으세요?

예를 들면:
- 비행기나 기차가 지연된 상황
- 비 오는 날 우산을 빌리는 상황
- 비 때문에 야외 약속을 바꾸는 상황
- 여행 중 폭우로 도움을 요청하는 상황
- 비 오는 날 택시 기사에게 목적지를 설명하는 상황

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
        "role": "40대 초반의 승객. 아기의 울음에 불편함을 느끼지만 소리를 지르지 않고, 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, simple beige sweater, tired and glancing sideways with restrained irritation, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기에서 아기가 계속 울고 있어 나는 아이를 달래려고 애쓰는 중이다. 옆자리의 Emma는 한숨을 쉬고 우리를 바라보지만 소리를 지르지는 않는다. 나는 내가 노력하고 있다는 점을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 우리를 바라봐요",
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

여행 중 겪을 다른 장면도 하나 넣어 볼게요. 비행기에서 내린 뒤 공항에서 Emma를 다시 마주치고, 아기와 함께 여행하는 어려움에 대해 짧게 이야기를 나누는 상황은 어때요?

이 장면에서 어떤 말을 해보고 싶으세요?

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
        "role": "20대 후반의 매장 직원. 차분하게 영수증과 제품 상태를 확인하고 교환 요청의 이유를 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform over a white shirt, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 산 다음 날 매장에 다시 찾아간다. 집에서 사용해 보니 물이 새고, 나는 영수증과 누수가 찍힌 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 제품 상태를 차분히 확인하며 내 설명을 듣는다. 교환이 가능한지, 추가 확인이나 다른 절차가 필요한지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 찾아가요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 판매한 매장의 고객 응대 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 지내며 자주 영어를 써야 하는 일상 장면을 연습하고 싶으신 거네요. 예를 들면 이런 상황이 있어요.

- 집을 구하거나 집주인에게 수리를 요청하기
- 마트나 약국에서 필요한 물건을 찾기
- 카페나 식당에서 주문하고 문제를 말하기
- 직장이나 학교에서 처음 만난 사람과 대화하기
- 병원에서 증상을 설명하기
- 은행이나 통신사에서 서비스 신청하기
- 이웃에게 소음이나 생활 문제를 조심스럽게 말하기

이 중에서 어떤 상황을 먼저 겪어 보고 싶으세요? 원하시면 여러 상황을 골라도 돼요.

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
        "role": "30대 후반의 집주인. 세입자의 말을 차분히 듣지만 긴급하지 않은 문제는 나중에 처리하려 한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, casual sweater and jeans, mildly concerned and standing with a hesitant posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 집에 입주한 뒤 난방이 작동하지 않는다. 나는 집주인 Maya에게 이 문제를 설명하고, 밤이 되기 전에 점검이나 수리를 요청하려 한다. 집 안은 춥고 난방 조절기를 확인했지만 해결되지 않은 상태다. Maya가 얼마나 빨리 대응할 수 있는지, 수리비를 누가 부담하는지, 문제가 실제로 해결되는지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 이사한 집의 난방이 되지 않아 집주인에게 수리를 요청해요",
        "title": "고장 난 난방"
      }
    ],
    "hook": "새로 이사한 집의 난방이 되지 않아 집주인에게 연락해요",
    "setting": "해외에서 처음 구한 집의 거실",
    "title": "첫날의 집 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간, 먼저 말을 걸어 양해를 구하는 장면으로 연습해 볼까요? 아기를 달래려고 애쓰고 있다는 점을 설명하고 싶으신지도 알려 주세요.

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
        "role": "40대 초반의 회사원. 조용히 쉬고 싶어 하지만 화내지 않고 상대의 설명을 들으면 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, beige cardigan, tired and glancing sideways with a restrained sigh, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 받아들이는지와 상황이 풀리는지는 정하지 않는다.",
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

두 가지 상황을 각각 한 화로 만들어 볼게요.

먼저 집주인과 수리 얘기를 하는 상황부터 정하고 싶어요. 어떤 문제가 생겼고, 집주인에게 무엇을 요청하려고 하나요? 예를 들면 누수, 난방 고장, 온수 문제처럼 말해 주세요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 실내 온도 기록을 보여 주며, 이번 주 안에 수리해 달라고 집주인에게 요청하는 상황으로 정할게요.

두 번째는 동네 모임에서 처음 만난 사람에게 인사하는 장면으로 해볼까요? 자기소개를 하고 이 동네에 온 지 얼마나 됐는지 말하는 정도인지, 아니면 모임에 참여하게 된 이유나 관심사까지 이야기하고 싶은지도 알려 주세요.

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
        "role": "40대 후반의 집주인. 집의 문제를 먼저 확인하려 하며 수리 요청을 받으면 차분하게 설명한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게도 편안하게 말을 걸지만 상대의 관심사를 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-up shirt and cardigan, concerned and listening with a slight frown, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 문제를 설명하고, 고장 난 상태를 보여 주는 사진과 실내 온도 기록을 근거로 이번 주 안에 수리해 달라고 집주인 Daniel에게 부탁하려 한다. Daniel이 사진과 기록을 어떻게 받아들이는지, 수리가 가능한지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 인사한다. 나는 자전거 타기를 좋아한다고 말하고, 주말에 어떤 취미를 즐기는지 서로 이야기하려 한다. Maya가 어떤 취미를 말하는지, 두 사람이 대화를 얼마나 이어 가는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 모임에서 새 이웃과 취미를 이야기해요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "새 동네에서 말하기"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 겪을 다른 상황으로, 교환 절차를 마친 뒤 직원에게 새 커피 머신의 사용법이나 관리 방법을 물어보는 장면은 어때요?  
원하시면 무엇을 물어보고 싶은지 말씀해 주세요.

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
        "details": "첫 번째 에피소드와 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, Noah의 설명을 들으며 필요한 질문을 하려 한다. 첫 번째 에피소드에서 커피 머신을 교환했는지, 어떤 제품을 사용하고 있는지는 정하지 않는다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah를 다시 만나 우유 거품 내는 법을 물어봐요",
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
        "role": "30대 매장 직원. 증거를 먼저 확인하고, 제품 사용법을 물으면 차근차근 설명한다. 교환 요청과 사용법 질문을 구분해 응대한다."
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
        "details": "다른 날 같은 매장의 체험 코너에 간다. 나는 커피 머신으로 우유 거품을 내는 법을 Noah에게 묻고, 직접 따라 해 보거나 설명을 들으려 한다. 첫 화의 교환 결과와 Noah와의 관계는 정해지지 않으며, 그 결과와 무관하게 체험 코너에서 사용법을 묻는 상황으로 시작한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어요",
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

에피소드는 최대 5화까지라 지금은 더 추가할 수 없어요. 추가하려면 기존 화 중 하나를 빼거나 다른 장면으로 바꿔 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 안전하게 세척하려고 적절한 양과 기본적인 방법을 확인하려 한다. Noah가 설명하는 내용과 실제로 세척이 잘 되는지는 정하지 않는다.",
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
