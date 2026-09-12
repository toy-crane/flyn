# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:39:23.873Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 3f4b657e489afb9601e2ac8bb8354a1f4d791f62328efd9224d925b53c01c079
답 57개, 실패 0개, 호출 실패 0개

기계 검사는 카드 계약을 확인한다. 대화의 이해도, 답할 지점, 말투와 가독성은 아래 전문으로 따로 검토한다. 문장 수와 서식 유무는 합격 기준이 아니다. 사용자 재미 확인도 별도다.

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답하셨겠어요. 그 상황을 영어로 다시 대화해 보고 싶은 거라면, 싸움이 벌어진 뒤 배우자와 어떤 순간을 연습하고 싶은지 정해 볼까요?

예를 들면:
- 서로 진정한 뒤, 내가 서운했던 점을 설명하는 순간
- 육아 분담이 불공평하다고 느낀 이유를 말하는 순간
- 상대의 입장도 듣고 앞으로의 방법을 함께 찾는 순간

어떤 말을 전하고 싶었는지도 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비”와 관련된 어떤 상황에서 영어로 대화해 보고 싶으세요? 예를 들면 비행기, 비 오는 날의 택시, 우산을 빌리는 상황처럼 구체적으로 말씀해 주세요.

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
        "role": "40대 초반의 승객. 아기의 울음에 불편함을 느끼지만 소리치지 않고 한숨과 시선으로 반응하며, 설명을 들으면 대화를 이어간다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft gray sweater, tired and glancing sideways with a restrained sigh, seated posture, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 계속된다. 옆자리 승객 Emma는 소리치거나 화내지 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 진정시키려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
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

같은 비행기 여행에서 다른 상황도 하나 넣어 볼게요. 예를 들면 **비행 중 아기에게 필요한 물건을 찾지 못해 승무원에게 도움을 요청하는 순간**은 어때요? 무엇을 찾고, 승무원에게 어떤 도움을 받고 싶은지 말씀해 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품 상태와 구매 정보를 확인하고 고객의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm and attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 내 설명과 자료를 확인한다. 교환이 가능한지, 어떤 절차가 필요한지, 문제가 해결되는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 찾아갔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 찾아갔어요",
    "setting": "고장 난 커피 머신을 들고 찾아간 전자제품 매장",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 지내며 자주 겪는 상황 중 어떤 장면을 연습해 볼까요?

예를 들면,

- 집을 구하거나 집주인에게 문제를 말하는 상황
- 마트나 식당에서 필요한 것을 묻는 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 직장이나 학교에서 사람들과 처음 대화하는 상황
- 은행, 관공서, 통신사에서 서비스를 신청하는 상황
- 길을 묻거나 대중교통 문제를 해결하는 상황

가장 먼저 겪을 것 같은 상황 하나를 골라 주세요.

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
        "role": "30대 초반의 집주인 관리 대행인. 세입자의 설명을 차분히 듣고 수리 요청의 긴급성과 일정을 확인한다."
      },
      {
        "name": "Liam",
        "position": 2,
        "role": "20대 후반의 이웃. 건물에서 자주 마주치지만 먼저 말을 많이 걸지는 않는다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, beige cardigan over a simple blouse, concerned and leaning slightly forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 구한 아파트에 입주한 뒤 저녁이 되었는데 난방이 작동하지 않는다. 나는 추워서 오늘 밤 지내기 어렵다는 점을 설명하고, 관리 대행인 Maya에게 가능한 수리 일정이나 임시로 할 수 있는 조치를 요청하려 한다. 난방이 바로 고쳐지는지, 추가 비용이 드는지, Maya가 어떤 해결책을 제시하는지는 정하지 않는다.",
        "number": 1,
        "preview": "새 집에 입주했는데 난방이 작동하지 않아서 관리 대행인에게 연락해요",
        "title": "고장 난 난방"
      }
    ],
    "hook": "새 집에 입주했는데 난방이 작동하지 않아서 도움을 요청해요",
    "setting": "추운 저녁의 해외 아파트 현관 앞",
    "title": "낯선 곳의 첫날"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서도 주변 승객에게 먼저 말을 꺼내야 하는 순간으로 해볼까요?

예를 들면 옆자리 승객이 계속 쳐다보거나 한숨을 쉬고 있고, 사용자는 아기를 달래려고 애쓰고 있다는 점을 설명하며 조금만 이해해 달라고 부탁하는 상황이에요. 상대는 화를 내지는 않지만 불편해하는 태도입니다.

이런 장면이 맞나요? 상대에게는 사과하고 싶은지, 아니면 이해를 부탁하고 싶은지도 알려 주세요.

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하며 불편할 때 한숨과 시선으로 반응하지만 화를 내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내거나 고함치지는 않지만 한숨을 쉬며 계속 나를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

두 가지 상황을 각각 한 화로 만들어 볼게요.

1. **집주인과 수리 얘기하기**  
   집에서 어떤 문제가 생겼고, 집주인에게 수리를 요청하는 상황인가요? 예를 들면 난방이 안 되거나, 욕실 누수가 생긴 경우가 있어요. 수리 시급성이나 사진·계약서처럼 보여 줄 자료가 있는지도 알려 주세요.

2. **동네 모임에서 인사하기**  
   처음 참석한 모임에서 옆 사람에게 먼저 자기소개하고 대화를 시작하는 순간으로 해볼까요? 모임의 종류와, 가볍게 나누고 싶은 관심사가 있다면 함께 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방 고장 상황은 이렇게 정할게요. 사진과 실내 온도 기록을 보여 주면서 집주인에게 이번 주 안에 수리해 달라고 요청하는 순간으로요.

동네 모임에서 인사하기는 어떤 모임인가요? 예를 들면 아파트 주민 모임, 동네 독서 모임, 운동 모임 등이 있어요. 처음 만난 사람에게 자기소개만 할지, 대화를 조금 이어 가고 싶은지도 알려 주세요.

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
        "role": "40대 후반의 집주인. 임대 주택의 문제를 차분히 확인하고 수리 일정에 관한 설명을 듣는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람과 가벼운 주말 취미 이야기를 나누며 상대의 관심사에도 반응한다."
      }
    ],
    "cover": "A man in his late forties, short salt and pepper hair, casual dark sweater, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 지내는 집의 난방이 고장 난 상태다. 나는 난방 문제를 보여 주는 사진과 실내 온도 기록을 가지고 집주인 Daniel에게 상황을 설명하려 한다. 이번 주 안에 수리해 달라고 부탁하려 하며, Daniel이 어떻게 반응하거나 실제로 언제 수리할지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 나서 사진과 온도 기록을 집주인에게 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 자전거 타기를 좋아한다고 말하고 서로의 주말 취미에 관해 이야기하려 한다. Maya가 어떤 취미를 말하거나 대화가 어떻게 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 자전거 타기를 좋아한다고 말하며 주말 취미를 물어봐요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 모임에서 새 이웃과 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 동네 주민 모임 공간",
    "title": "해외 생활 속 두 만남"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

커피 머신을 교환한 뒤 겪을 수 있는 다른 상황도 넣어 볼게요.

새 제품을 집에서 처음 사용했는데 또 문제가 생겨 매장에 다시 연락하는 장면은 어때요? 문제가 무엇인지, 그리고 어떻게 해결하고 싶은지 말씀해 주세요.

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
        "details": "첫 번째 사건 이후 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보며 커피 머신 사용 방법을 배우려 한다. 첫 번째 사건에서 교환에 성공했는지, 어떤 제품을 사용하고 있는지는 정하지 않는다. Noah가 설명하는 방법과 내가 추가로 묻는 내용은 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 같은 매장에서 Noah를 만나 우유 거품 내는 법을 물어봐요",
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
        "role": "30대 매장 직원. 제품 문제와 사용법을 차분히 설명한다. 질문을 들으면 먼저 필요한 조건을 확인한 뒤 시범을 보여 준다."
      }
    ],
    "cover": "A man in his thirties, curly black hair, green shirt, attentive and demonstrating with calm focus, seen from slightly above, looking up, plum background",
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
        "details": "다른 날 같은 매장의 체험 코너에 간다. 커피 머신의 우유 거품을 내는 법을 Noah에게 묻고, 나는 원하는 거품의 상태와 사용 방법을 이해하려 한다. 첫 번째 에피소드에서 교환이 되었는지 여부와 관계없이 체험 코너에 가며, Noah가 얼마나 자세히 설명하거나 시범을 보일지는 정하지 않는다.",
        "number": 2,
        "preview": "다른 날 체험 코너에서 우유 거품을 내는 법을 물어요",
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

이미 5화라서 에피소드를 더 추가할 수 없어요. 기존 화 중 하나를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 청소 방법을 설명해 달라고 한다. Noah가 설명을 이해하기 쉽게 해 주는지와 실제 청소 결과는 정하지 않는다.",
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

많이 힘드셨겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 거군요.

부부끼리 **육아 방식에 대해 의견이 엇갈린 뒤, 감정이 가라앉지 않은 상태에서 먼저 대화를 꺼내는 장면**으로 해볼까요?  
그때 실제로 말하고 싶었던 핵심은 무엇이었나요?

예를 들면:
- 서로 탓하지 말고 해결책을 찾고 싶었어요
- 제 입장도 이해해 달라고 말하고 싶었어요
- 육아 분담을 다시 정하고 싶었어요
- 어제는 너무 감정적이었으니 사과하고 싶었어요

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하시려던 건가요? “비가 오는 날 길을 묻는 상황”처럼 이어서 적어 주세요.

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하며 불편할 때 한숨과 시선으로 마음을 드러내지만 소리치지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft gray sweater, tired and glancing sideways with restrained annoyance, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 한숨을 쉬고 나와 아기를 바라보지만 소리치지는 않는다. 나는 아기를 진정시키려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 바라봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선과 한숨이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 한숨"
  }
]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

비행기에서 겪을 다른 상황도 넣어 볼게요. 아기를 달랜 뒤, 승무원에게 아기용품이나 좌석 주변에 필요한 도움을 요청하는 순간은 어떠세요? 어떤 도움을 받고 싶은지 말씀해 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품 상태와 구매 내역을 확인하고, 손님의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm but attentive with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 산 다음 날 매장에 가져오니 물이 새고 있다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 제품 상태와 구매 내역을 확인한다. 교환이 가능한지와 직원이 어떤 절차를 안내할지는 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "고장 난 커피 머신을 들고 찾아간 전자제품 매장",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 지내며 자주 겪을 수 있는 장면을 골라 연습해 볼 수 있어요.

예를 들면:
- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 상황
- 카페나 식당에서 주문에 문제가 생긴 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 직장이나 학교에서 처음 만난 사람과 대화하는 상황
- 관공서에서 서류나 체류 관련 문제를 문의하는 상황
- 이웃에게 소음이나 생활 규칙을 조심스럽게 말하는 상황

이 중에서 어떤 장면을 가장 먼저 겪어 보고 싶으세요? 자세히 떠오르는 상황이 있다면 그대로 말해 주셔도 돼요.

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
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣고 집 상태와 계약 조건을 먼저 확인한다."
      },
      {
        "name": "Daniel",
        "position": 2,
        "role": "20대 후반의 이웃. 이 건물의 생활 규칙을 잘 알고 필요하면 자신의 경험을 짧게 알려 준다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, casual beige sweater and dark trousers, concerned but composed with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 아파트에 입주한 첫날, 방의 난방이 제대로 작동하지 않아 Maya에게 말을 걸어 문제를 설명하려 한다. 나는 오늘 밤 지낼 수 있도록 난방을 확인해 달라고 요청하고, 방이 너무 추워서 불편하다는 점을 말하려 한다. Maya는 집주인으로서 계약 내용과 현재 상태를 확인하려 하지만, 바로 수리해 주거나 해결해 준다고 정하지 않는다. 나는 임대 계약서와 방 사진을 가지고 있으며, 고장 원인을 알고 있지는 않다. 공격적으로 따지거나 계약을 해지하겠다고 말하는 상황은 피하고, 우선 문제를 정확히 전달하고 가능한 조치를 묻는다.",
        "number": 1,
        "preview": "새 아파트에 입주했는데 난방이 작동하지 않아 집주인에게 문제를 설명해요",
        "title": "난방 문제"
      }
    ],
    "hook": "새 아파트에 입주했는데 난방이 작동하지 않아 집주인에게 말해요",
    "setting": "해외에서 처음 구한 아파트의 거실",
    "title": "새로운 곳에서 살기"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간에 먼저 말을 걸어 보며, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 부탁하는 장면으로 해볼까요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편하면 한숨을 쉬거나 쳐다보지만 화를 내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a cream cardigan, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 시선과 한숨이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

두 가지 상황을 각각 한 화로 만들어 볼게요.

1. **집주인과 수리 얘기하기**  
   집에서 어떤 문제가 생겼나요? 예를 들면 온수가 안 나오거나, 난방이 고장 났거나, 누수가 생긴 상황이 있어요. 집주인에게 수리를 요청하고 싶은지, 수리 시기나 비용도 함께 확인하고 싶은지 알려 주세요.

2. **동네 모임에서 인사하기**  
   어떤 모임인가요? 예를 들면 아파트 주민 모임, 동네 운동 모임, 취미 모임 등이 있어요. 처음 만난 사람에게 간단히 자기소개하고 대화를 시작하려는 상황인지, 다음에도 편하게 인사할 수 있을 만큼 친해지고 싶은 상황인지 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

집주인에게 난방 고장 사실을 사진과 온도 기록으로 보여 주고, 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

동네 모임에서는 어떤 자리에서 처음 인사하나요? 그리고 자기소개만 하고 끝내고 싶은지, 상대에게 질문하며 대화를 조금 이어 가고 싶은지 알려 주세요.

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
        "role": "40대 후반의 집주인. 세입자의 설명과 수리 요청을 듣고 필요한 내용을 확인한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람과 주말에 하는 일을 편하게 이야기한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater and trousers, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮다. 나는 난방 문제를 찍은 사진과 온도 기록을 가지고 집주인 Daniel에게 상황을 설명하려 한다. 이번 주 안에 수리해 달라고 부탁하고, 필요한 경우 수리 일정을 확인하려 한다. Daniel이 수리를 받아들이거나 언제 처리할지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 나서 사진과 온도 기록을 보여 주며 집주인에게 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 자전거 타기를 좋아한다고 말하고, 주말에 무엇을 하는지 이야기한 뒤 Maya의 주말 취미도 물어보며 대화를 이어 가려 한다. 두 사람이 친해지거나 다음 약속을 정했다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미로 자전거 타기를 이야기해요",
        "title": "첫 이웃 인사"
      }
    ],
    "hook": "난방 수리를 부탁하고 동네 모임에서 새로운 이웃과 주말 취미 이야기를 나눠요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "집과 동네에서"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 상황도 넣어 볼게요. 교환이나 환불 절차를 진행하는 동안, 직원에게 사용 방법이나 관리 방법을 물어보는 장면은 어때요?  
제품을 오래 쓰기 위해 궁금한 점이 있다면 말씀해 주세요.

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
        "details": "첫 번째 상황과 같은 매장에서 다른 날 Noah를 만난다. 나는 커피 머신으로 우유 거품을 내는 법을 물어보고, 원하는 질감이나 사용 중 궁금한 점을 설명하려 한다. 첫 번째 상황에서 교환에 성공했는지, 어떤 제품을 갖고 있는지는 정하지 않으며, Noah가 얼마나 자세히 도와주는지도 플레이에서 정한다.",
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
        "details": "첫 번째 방문과 다른 날, 같은 매장의 체험 코너에 간다. 첫 번째 커피 머신의 교환 결과와 관계없이 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. Noah가 어떤 방법과 설명을 하는지는 정하지 않으며, 나는 우유 거품을 직접 내는 방법을 이해하려고 한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
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

에피소드는 최대 5화까지라 지금은 더 추가할 수 없어요. 기존 화를 빼거나 다른 화로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 안전하게 세척할 수 있도록 적정량과 사용 방법을 설명해 달라고 하려 한다. Noah가 어떤 방법과 양을 안내할지는 플레이에서 정한다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
        "title": "세척제의 양"
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

많이 답답했겠어요. 그 상황을 영어로 다시 겪어 본다면, 어떤 순간을 연습하고 싶으세요?

예를 들면,

- 어제 싸운 뒤 먼저 대화를 꺼내고 싶다
- 내가 서운했던 점을 차분히 설명하고 싶다
- 육아 분담을 다시 정하고 싶다
- 아내의 입장을 듣고 오해를 풀고 싶다

어떤 말을 해보고 싶은 상황에 가까운지 알려주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

‘비’와 관련된 어떤 상황을 영어로 연습해 보고 싶으세요? 예를 들면 비 오는 날 길을 묻기, 우산을 빌리기, 야외 일정 변경을 요청하기 등이 있어요.

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 불편함을 한숨과 시선으로 드러내지만, 상대가 설명하면 들어본다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, casual beige sweater, tired and glancing toward the viewer with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 소리를 지르거나 직접 화내지는 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 진정시키려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저희를 바라봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 울음"
  }
]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

비행기 안에서 겪을 다른 상황으로, 아기가 잠든 뒤 승무원이 식사나 음료를 건네며 말을 거는 순간을 연습해 볼까요? 승무원에게 무엇을 요청하거나 설명하고 싶은지 말씀해 주세요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 영상을 차분히 확인한 뒤 고객의 요청 내용을 묻는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder length dark hair, green retail apron over a white shirt, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 어제 매장에서 샀는데 집에서 사용하자 물이 샌다. 나는 영수증과 누수 영상을 직원에게 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 확인한다. 교환이 가능한지와 직원이 어떤 안내를 하는지는 실제 대화에서 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 찾아가요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 누수 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 매장의 고객 응대 창구",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면 중 하나를 골라 구체적으로 연습해 볼 수 있어요.

예를 들면:

- 집을 구하면서 집주인이나 중개인에게 조건을 묻기
- 식료품점에서 원하는 물건의 위치나 가격 묻기
- 병원에서 증상을 설명하고 진료받기
- 은행에서 계좌를 만들거나 카드 문제 해결하기
- 직장이나 학교에서 처음 만난 사람과 대화하기
- 집에 문제가 생겨 관리인에게 수리 요청하기

어떤 상황에서 영어로 말해 보고 싶으세요?

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
        "role": "30대 초반의 아파트 관리인. 입주자의 설명을 차분히 듣고 필요한 정보를 확인한다."
      },
      {
        "name": "Leo",
        "position": 2,
        "role": "20대 후반의 이웃. 건물에서 자주 보지만 아직 서로 잘 알지 못한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder length dark hair, simple blue cardigan, concerned and slightly hesitant, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새 아파트에 살기 시작한 뒤 욕실의 물이 제대로 빠지지 않는다. 나는 아파트 관리인 Maya에게 문제를 설명하고 가능한 한 빨리 수리를 요청하려 한다. 배수구가 언제부터 막혔는지와 물이 빠지는 데 오래 걸린다는 사실은 알고 있지만, 고장 원인이나 수리 가능 시간은 정해져 있지 않다. Maya가 추가로 확인할 내용이나 방문 일정을 어떻게 말할지는 플레이에서 정한다.",
        "number": 1,
        "preview": "새로 이사한 집 욕실에 문제가 생겨 관리인에게 수리를 요청해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "새로 이사한 집 욕실에 문제가 생겨 관리인에게 수리를 요청해요",
    "setting": "해외 아파트의 관리 사무실",
    "title": "해외 생활 첫 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간에 먼저 말을 걸어, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 부탁하는 장면으로 해볼까요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기지만, 상대가 사정을 설명하면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 시선"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외 생활에서 자주 마주칠 수 있는 두 장면이네요. 각각 어떤 순간부터 대화를 시작할지 정해 볼게요.

1. **집주인과 수리 얘기하기**  
   어떤 문제가 생겼나요? 예를 들면 난방이 안 되거나, 수도가 새거나, 세탁기가 고장 난 상황이에요. 집주인에게 수리를 요청하고 싶은 건지, 수리 일정이나 비용을 확인하고 싶은 건지도 알려 주세요.

2. **동네 모임에서 인사하기**  
   어떤 모임인가요? 아파트 주민 모임, 취미 모임, 동네 행사처럼 정할 수 있어요. 처음 만난 사람에게 자기소개를 하고 모임에 대해 물어보려는 상황인지, 이미 대화 중인 사람들에게 자연스럽게 인사하려는 상황인지 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요. 수리 날짜를 확정할 수 있는지는 실제 대화에서 열어 두겠습니다.

동네 모임에서 인사하기는 어떤 장면을 원하세요? 예를 들면 **처음 참석한 취미 모임에서 옆 사람에게 자기소개하고 모임에 대해 묻는 상황**처럼 정할 수 있어요.

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
        "role": "40대 후반의 집주인. 집 수리 요청을 받으면 문제의 상태와 일정을 먼저 확인하며, 구체적인 자료가 있으면 차분히 검토한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 주말 취미 이야기를 좋아하지만 처음에는 상대의 말에 맞춰 조심스럽게 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater and jeans, concerned and slightly tense while leaning forward, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮게 유지되고 있다. 나는 난방 문제를 찍은 사진과 온도 기록을 가지고 있다. Daniel에게 자료를 보여 주며 상황을 설명하고 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이거나 특정 날짜를 약속하는지는 정하지 않는다.",
        "number": 1,
        "preview": "집 안 난방이 고장 나서 사진과 온도 기록을 들고 집주인에게 수리를 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "처음 참석한 동네 모임에서 Maya라는 이웃을 만난다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 자연스럽게 대화를 이어 가려 한다. Maya가 어떤 취미를 말하거나 대화가 얼마나 이어지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 주말 취미를 묻고 자전거 타기를 이야기해요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 처음 만난 이웃과 취미 이야기를 나눠요",
    "setting": "난방이 고장 난 해외 임대 주택과 주말 동네 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 상황도 넣어 볼게요. 교환을 요청한 뒤, 직원이 제품 점검을 위해 잠시 기다려 달라고 해서 고장 원인과 처리 방법을 묻는 장면은 어때요? 원하는 목표나 꼭 말하고 싶은 내용이 있으면 알려 주세요.

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
        "role": "30대 매장 직원. 증거를 먼저 확인하고, 제품 사용법을 물으면 차근차근 설명한다."
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
        "details": "첫 번째 상황과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 커피 머신으로 우유 거품을 내는 법을 물어보고, 집에서 원하는 거품을 만들기 위해 사용 순서와 주의할 점을 이해하려 한다. 첫 번째 상황에서 교환에 성공했는지, 어떤 제품을 사용하게 되었는지, Noah와 친해졌는지는 정하지 않는다. Noah가 설명하는 방법과 내가 가진 제품의 상태는 실제 플레이에서 확인한다.",
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
        "details": "첫 번째 방문과 다른 날, 나는 같은 매장의 체험 코너에 간다. 교환 결과와 관계없이 우유 거품을 내는 법을 배우고 싶어 Noah에게 방법을 묻는다. Noah가 시범을 보이거나 어떤 설명을 하는지는 정하지 않으며, 내가 원하는 거품의 상태나 사용 방법을 영어로 물어본다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
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

에피소드는 최대 5화까지라 더 추가할 수 없어요. 기존 화를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 제품에 맞는 세척제의 양과 기본적인 청소 절차를 설명해 달라고 하려 한다. Noah가 정확히 어떤 방법을 안내하는지는 정하지 않는다.",
        "number": 5,
        "preview": "커피 머신을 청소하려는데 세척제를 얼마나 넣어야 할지 모르겠어요",
        "title": "청소 방법 묻기"
      }
    ],
    "hook": "산 지 하루 된 커피 머신에서 물이 새요",
    "setting": "가전 매장의 반품 창구와 체험 코너",
    "title": "새 커피 머신"
  }
]
```
검사: 통과
