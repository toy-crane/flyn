# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T17:12:19.530Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 511afc52d4a75c86be4bbb6e1950aa3566b22499db8b91bcf815dce2474aaa4e
답 60개, 실패 3개, 호출 실패 0개

기계 검사는 카드 계약을 확인한다. 대화의 이해도, 답할 지점, 말투와 가독성은 아래 전문으로 따로 검토한다. 문장 수와 서식 유무는 합격 기준이 아니다. 사용자 재미 확인도 별도다.

## 1번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 감정적으로 몰아붙이지 않고 필요한 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket over a shirt, tense and cautious with one hand raised to pause, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로 갓길에서 나와 Daniel이 사고 직후 마주 보고 있다. 나는 상대 운전자와 연락처를 교환하고 각자의 자동차 보험 정보를 확인하려 한다. 사고의 책임이나 과실을 미리 정하지 않으며, 다친 사람이 있는지와 경찰이나 긴급 지원이 필요한지는 플레이에서 대화로 확인한다. 나는 현장에서 감정적으로 다투거나 성급하게 잘못을 인정하지 않고, 필요한 정보를 차분히 주고받으려 한다. Daniel이 어떤 정보를 제공하고 교환에 응하는지는 정하지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 확인하려고 해요.",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 정보를 교환하려고 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 그 상황을 영어로 다시 대화해 보고 싶은 거군요.

어떤 순간을 연습하고 싶으세요?

- 싸운 다음, 아내에게 먼저 말을 걸고 싶을 때
- 육아 분담에 대한 내 입장을 설명하고 싶을 때
- 아내의 힘든 점을 듣고 서로 풀어 보고 싶을 때
- 감정이 올라온 상태에서 대화를 중단하지 않고 차분히 말하고 싶을 때

가장 가까운 장면을 골라 주시거나, 실제로 무슨 말을 하려 했는지 편하게 말해 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하신 걸까요? 비 오는 날 겪는 일인지, 다른 뜻인지 조금만 더 알려 주세요.

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
        "role": "40대 초반의 여행객. 아기의 울음에 한숨을 쉬며 쳐다보지만 소리를 지르지는 않고, 설명을 들으면 반응을 보인다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, casual beige cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 한숨을 쉬고 나와 아기를 쳐다보지만 소리를 지르거나 직접 화를 내지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 쳐다봐요",
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

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 겪을 다른 상황도 넣어 볼게요. 아기가 잠든 뒤, 옆자리 승객과 다시 말을 나누며 서로의 여행 이야기를 묻는 장면은 어때요? 어떤 이야기를 꺼내고 싶은지 알려 주세요.

```json
[]
```
검사: 이전 결과 선확정

## 1번째 충분한 한 사건
질문: 어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.



```json
[
  {
    "characters": [
      {
        "name": "Mia",
        "position": 1,
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 누수 영상을 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green retail polo shirt, calmly concerned and leaning slightly forward, three-quarter view, body turned, face toward the viewer, mustard background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 산 지 하루 만에 물이 새기 시작했다. 나는 매장에 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 차분히 확인하며 내 설명을 듣는다. 교환이 가능한지와 매장의 대응은 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "누수 제품 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 매장의 고객 응대 창구",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 영어를 써야 하는 순간들을 연습하고 싶으신 거네요. 먼저 한 장면부터 골라 구체적으로 정해 볼까요?

예를 들면 이런 상황이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 순간
- 마트에서 원하는 물건의 위치나 환불 방법을 묻는 순간
- 병원이나 약국에서 증상을 설명하는 순간
- 직장이나 학교에서 자기소개하고 동료와 처음 대화하는 순간
- 집에서 문제가 생겨 관리인에게 수리를 요청하는 순간
- 은행이나 통신사에서 계좌나 휴대폰 문제를 해결하는 순간

가장 먼저 연습하고 싶은 상황이 무엇인가요? ક્યાં

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
        "role": "30대 초반의 아파트 관리인. 문제 상황을 차분히 확인하고 구체적인 설명을 들으면 해결 방법을 찾아본다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, casual green cardigan over a white shirt, attentive with a slightly concerned expression and one hand raised as if asking for details, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활하는 나는 아파트 주방의 수도에서 물이 새는 것을 발견한다. 물이 바닥으로 번지기 전에 관리인 Maya에게 상황을 설명하고 수리를 요청하려 한다. 누수의 원인이나 수리 가능 시간은 아직 정해지지 않았으며, Maya가 문제를 어떻게 확인하고 대응할지는 대화에서 정한다. 나는 집 안에 들어오는 시간과 당장 필요한 조치를 영어로 물어볼 수 있다.",
        "number": 1,
        "preview": "새로 지낸 집 주방에서 물이 새서 관리인에게 수리를 요청해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "해외에서 지낸 지 얼마 되지 않았는데 집 주방에서 물이 새기 시작해요",
    "setting": "해외 아파트의 작은 주방",
    "title": "낯선 곳에서 생활하기"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데 주변 승객의 시선과 한숨이 느껴지는 순간으로 해볼까요? 먼저 말을 걸어 미안하다고 하면서도 계속 노력하고 있으니 조금만 이해해 달라고 설명하는 상황이에요. 옆자리 승객에게 말하는 장면이 맞을까요, 아니면 주변 승객 전체에게 양해를 구하는 장면을 원하시나요?

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
        "role": "40대 초반의 편집자. 아기 울음에 지쳐 한숨을 쉬지만 고함치지는 않고, 상대가 설명하면 들어본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지는 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래기 위해 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 한숨"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "옆자리의 한숨"
  }
]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 빌린 집에 문제가 생겨 집주인에게 수리를 요청하는 상황이네요. 먼저 어떤 문제가 생겼는지 정해 볼까요?

예를 들면 **온수가 나오지 않아서 집주인에게 상황을 설명하고 가능한 빨리 수리해 달라고 요청하는 순간**으로 연습할 수 있어요. 이 장면으로 해볼까요, 아니면 다른 문제를 원하세요?

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임에서 인사하는 장면을 정해 볼까요? 예를 들면 **처음 참석한 모임에서 옆자리에 앉은 이웃에게 자기소개를 하고, 이 모임에 오게 된 이유와 상대의 이름을 묻는 순간**으로 해볼 수 있어요. 이 정도의 상황이면 될까요?

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
        "role": "40대 후반의 집주인. 임대 주택의 문제를 차분히 확인하며 구체적인 자료와 요청을 들으면 메모한다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 예의 바르게 인사하고 주말에 하는 일에 관심을 보인다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual sweater and jeans, concerned and leaning forward attentively, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 집 안이 춥다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 실내 온도를 기록한 자료를 집주인에게 제시하려 한다. 이번 주 안에 수리해 달라고 부탁하려 하며, 집주인이 어떻게 반응하거나 실제로 언제 수리할지는 정하지 않는다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 준비해 집주인에게 수리를 부탁하려고 해요.",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "동네 모임에 처음 참석해 처음 만난 이웃 Sophie와 대화를 시작한다. 나는 자전거 타기를 좋아한다고 말하며 주말 취미에 대해 이야기하고, 상대의 주말 활동도 물어보려 한다. 두 사람이 얼마나 대화를 이어 가거나 가까워지는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요.",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "집 난방이 고장 나 사진과 온도 기록을 준비해 집주인에게 수리를 부탁하려고 해요",
    "setting": "해외에서 생활하는 임대 주택과 동네 커뮤니티 모임",
    "title": "해외 생활의 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 새로 겪을 상황을 하나 더 넣어 볼게요. 교환 결과와 관계없이, 매장에 다시 방문해 직원에게 커피 머신의 사용법을 물어보는 장면은 어때요?

예를 들면 물이 새는 문제와는 별개로, 커피 농도와 세척 방법을 제대로 알고 싶어서 설명을 요청하는 상황이에요. 어떤 점을 물어보고 싶은지 정해 주세요.

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
        "details": "며칠 뒤 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 순서와 주의할 점을 설명해 달라고 한다. 첫 화에서 교환이 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않으며, 그 결과와 관계없이 우유 거품 내는 법을 묻는 상황으로 시작한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에 간다. 나는 Noah에게 우유 거품을 내는 법을 묻고, 커피 머신으로 우유 거품을 만드는 방법을 배우려 한다. 첫 번째 화에서 교환이 되었는지, Noah와 어떤 대화를 나눴는지는 정하지 않으며, 이번 체험에 참여할 수 있는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "같은 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
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

이미 5화라서 에피소드를 더 추가할 수 없어요. 기존 화를 빼거나 다른 화로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 방법을 설명해 달라고 하려 한다. Noah가 알려 주는 구체적인 방법과 세척제의 양은 플레이에서 정한다.",
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

## 2번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 상대 운전자. 사고 직후 당황했지만 목소리를 높이지 않고 필요한 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket over a shirt, tense and cautiously attentive, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후 갓길에 차를 세운 상황이다. 나는 상대 운전자 Daniel과 연락처와 보험 정보를 교환하려 한다. 사고의 책임이나 과실을 미리 정하지 않으며, Daniel이 어떤 정보를 제시하거나 교환에 응하는지는 플레이에서 정한다. 안전을 위해 사고 현장에서 언성을 높이거나 위험한 행동을 하지 않고 필요한 확인과 연락에 집중한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 확인하려고 해요.",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 확인하려고 해요",
    "setting": "사고 직후 차를 세운 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 거군요.

어떤 순간을 다뤄 볼까요?

- 싸운 뒤 아내에게 먼저 말을 꺼내고 싶다
- 육아 분담에 대한 내 생각을 설명하고 싶다
- 아내의 불만을 듣고 서로 이해하고 싶다
- 감정이 격해지지 않게 대화를 다시 시작하고 싶다

그리고 대화의 목표가 무엇인지, 꼭 전하고 싶은 말이 있으면 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하시려던 건지 조금만 더 알려주실래요? 예를 들면 여행, 호텔, 직장, 식당처럼 장소나 하고 싶은 일을 적어 주셔도 좋아요.

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
        "role": "40대 초반의 승객. 불편하면 한숨과 시선으로 드러내지만 고함치지는 않고 상대의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 계속된다. 옆자리 승객 Emma는 한숨을 쉬며 아기와 나를 쳐다보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 정하지 않는다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 여행에서 겪을 다른 상황도 넣어 볼게요. 비행기에서 만난 옆자리 승객을 공항이나 호텔에서 다시 마주쳐, 이번에는 아기 이야기와 다른 일상적인 대화를 나누는 장면은 어때요? 어떤 장소에서 무엇을 이야기하고 싶은지 정해 볼까요?

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 누수 영상을 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store uniform, calm and attentive with an apologetic expression and open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "매장에서 어제 산 커피 머신에 물이 새기 시작했다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 차분하게 내 설명과 자료를 확인한다. 교환이 가능한지, 어떤 절차가 필요한지, 최종적으로 어떻게 처리되는지는 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 산 전자제품 매장",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 영어를 써야 하는 순간을 연습해 보고 싶으시군요. 먼저 한 장면을 정해 볼까요?

예를 들면,

- 집을 구하거나 집주인에게 문제를 말하는 상황
- 마트나 약국에서 필요한 것을 찾는 상황
- 직장이나 학교에서 처음 사람들과 대화하는 상황
- 병원에 가서 증상을 설명하는 상황
- 은행이나 관공서에서 서류를 처리하는 상황
- 이웃에게 소음이나 생활 문제를 조심스럽게 말하는 상황

이 중에서 가장 먼저 겪어 보고 싶은 장면이 있나요? 직접 떠올린 상황을 말해 주셔도 좋아요.

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
        "role": "30대 중반의 집주인. 생활 문제를 차분히 확인하지만 계약 조건과 비용에는 신중하게 반응한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, simple beige sweater and jeans, concerned while listening with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활하며 임대한 아파트의 난방이 갑자기 작동하지 않는다. 추운 저녁, 나는 집주인 Maya에게 문제를 설명하고 가능한 한 빨리 수리해 달라고 요청하려 한다. 난방이 언제부터 작동하지 않았는지와 현재 집 안이 춥다는 점을 말할 수 있다. 수리 시기와 비용 부담이 어떻게 정해지는지는 플레이에서 결정한다. Maya가 바로 해결해 주거나 내 설명을 완전히 이해한다고 미리 정하지 않는다.",
        "number": 1,
        "preview": "추운 저녁에 집 난방이 고장 나서 집주인에게 연락해요",
        "title": "고장 난 난방"
      }
    ],
    "hook": "추운 저녁에 집 난방이 고장 나서 집주인에게 연락해요",
    "setting": "해외에서 처음 구한 아파트의 거실",
    "title": "낯선 곳의 첫날"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데 주변 승객의 시선이 느껴지는 상황이네요. 옆자리 승객이 계속 한숨을 쉬며 쳐다보는 순간에 먼저 말을 걸어 보며, 조금만 이해해 달라고 설명하는 장면으로 해볼까요? 상대가 화를 내는 사람인지, 조용히 불편해하는 사람인지도 정해 주세요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬지만 상대가 설명하면 조용히 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 옆자리에서 아기를 달래고 있지만 울음이 멈추지 않는다. Emma는 화를 내거나 소리치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
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

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 집주인에게 집 수리를 요청하는 상황과 동네 사람들과 처음 인사하는 상황을 연습하고 싶으시군요.

먼저 **집주인과 수리 얘기하기**부터 정해 볼게요. 어떤 문제가 생긴 상황인가요?

예를 들면  
- 온수가 나오지 않아서 수리를 요청하기  
- 난방이 고장 나서 빨리 봐 달라고 말하기  
- 욕실 누수를 설명하고 수리 일정을 잡기  
- 에어컨이 작동하지 않는다고 알리기  

이 중 하나에 가깝나요, 아니면 다른 문제인가요?

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황이네요.

이제 **동네 모임에서 인사하기**를 정해 볼게요. 처음 참석한 모임에서 여러 사람 앞에 자기소개를 하는 장면인가요, 아니면 한 사람에게 먼저 다가가 인사하고 대화를 시작하는 장면인가요? 무엇을 말하고 싶은지도 알려 주세요.

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
        "role": "40대 후반의 집주인. 집의 문제를 차분히 확인하고 수리 요청의 내용과 긴급성을 먼저 듣는다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 가볍게 인사를 나누고 상대의 주말 취미를 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual olive sweater and dark jeans, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내 온도가 낮다. 나는 난방 문제를 찍은 사진과 온도 기록을 가지고 있으며, 이를 보여 주면서 상황을 설명하려 한다. 집주인 Daniel에게 이번 주 안에 수리해 달라고 부탁하려 한다. 실제로 수리가 언제 이루어지는지나 Daniel이 어떻게 답하는지는 정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 자연스럽게 대화를 이어 가려 한다. 두 사람이 얼마나 가까워지는지나 Maya가 어떤 취미를 말하는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미로 자전거 타기를 이야기해요",
        "title": "첫 만남의 취미"
      }
    ],
    "hook": "집의 난방이 고장 나 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "낯선 동네의 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 상황도 하나 넣어 볼게요. 교환 요청을 마친 뒤 결과와 관계없이, 매장 직원에게 커피 머신의 기본 사용법을 물어보는 장면은 어때요?  
원하는 기능이나 궁금한 점이 있으면 함께 말해 주세요.

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
        "details": "첫 번째 상황과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 커피 머신으로 우유 거품을 내는 법을 물어보고, 원하는 거품의 상태와 사용 방법을 설명해 달라고 하려 한다. 첫 번째 상황에서 교환에 성공했는지, 어떤 제품을 가지고 있는지는 정하지 않는다. Noah가 설명할 수 있는 범위와 대화의 방향은 실제 첫 번째 대화의 결과에 따라 달라진다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 교환 결과와 관계없이 매장 체험 코너에 와서, 우유 거품을 잘 만들기 위한 방법과 기계 사용 순서를 설명해 달라고 하려 한다. 첫 화에서 커피 머신을 교환했는지, 교환하지 못했는지는 정하지 않으며, Noah가 얼마나 자세히 도와주는지도 플레이에서 정한다.",
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

## 2번째 상한과 삭제 뒤 재추가
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 상황도 넣어 볼게요.  
수리나 교환 결과와 관계없이, 매장 직원에게 **커피 머신에 맞는 세척용품을 추천해 달라고 묻는 장면**은 어때요? 원하는 세척 주기나 사용 중인 머신의 문제를 설명하며 필요한 제품을 고르는 상황이에요.

```json
[]
```
검사: 상한 안내 없음

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
        "details": "같은 매장에서 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르기 때문에 적정량과 기본적인 청소 방법을 설명해 달라고 하려 한다. 이전 화에서 교환이나 사용법 안내가 이루어졌는지는 가정하지 않으며, Noah가 어떤 안내를 해 주는지는 플레이에서 정한다.",
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

## 3번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 연습하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Michael",
        "position": 1,
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 서로의 연락처와 보험 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket over a shirt, tense but trying to stay composed with one hand slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Michael"
        ],
        "details": "고속도로에서 나와 Michael의 차량이 사고를 냈고, 두 사람은 사고 직후 갓길에서 마주한다. 나는 상대 운전자와 연락처를 교환하고 각자의 보험사와 보험 정보를 확인하려 한다. 사고의 책임이나 과실 비율은 미리 정하지 않으며, 내가 가진 정보와 Michael이 제공하는 정보도 대화 속에서 확인한다. 경찰이나 보험사에 신고했는지는 정하지 않고, 사고 현장에서 안전을 우선하며 필요한 정보를 교환하려는 상황으로 시작한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요.",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요.",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

어제 다툰 일을 영어로 풀어 보고 싶은 거군요.  
부부끼리 **육아 방식에 대해 다시 대화하며 서로의 입장을 설명하는 장면**으로 연습해 볼까요?

예를 들면,  
- 아이의 훈육 방법이 달랐던 경우  
- 육아 분담이 한쪽에 치우쳤다고 느낀 경우  
- 서로 너무 지쳐서 말이 거칠어졌던 경우  

어떤 문제였고, 영어로 무엇을 말하고 싶었는지 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

입력이 중간에 끊긴 것 같아요. ‘비행기’, ‘비 오는 날’처럼 어떤 상황을 말씀하시려던 걸까요?

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
        "role": "40대 초반의 편집자. 아기의 울음에 불편함을 느끼지만 고함치지 않고 한숨과 시선으로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리의 Emma는 소리를 지르거나 화내지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해할지는 정하지 않는다.",
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

같은 여행에서 다른 상황도 하나 넣어 볼게요. 비행기에서 내린 뒤 공항 대기 구역에서 옆자리 승객을 다시 마주치고, 아기와 함께 여행하는 이유를 짧게 설명하며 대화를 이어 가려는 장면은 어때요?

비행기 안에서 어떤 대화가 오갔는지와 관계없이 시작할 수 있고, 상대가 친절하게 반응했는지는 미리 정하지 않을게요.

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
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 영수증과 제품 상태를 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, simple green store uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "매장에서 어제 산 커피 머신을 사용했는데 물이 새기 시작했다. 나는 영수증과 누수 장면을 찍은 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 내 설명과 자료를 차분히 확인한다. 교환이 가능한지와 직원이 어떤 절차를 안내하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아갔어요.",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아갔어요.",
    "setting": "커피 머신을 산 매장의 고객 서비스 데스크",
    "title": "새 커피 머신의 누수"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 영어를 써야 하는 순간들을 연습하고 싶으신 거네요. 먼저 한 장면부터 정해 볼까요?

예를 들면 이런 상황이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 상황
- 마트에서 원하는 물건의 위치나 재고를 묻는 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 은행이나 통신사에서 계좌·휴대폰 문제를 해결하는 상황
- 직장이나 학교에서 처음 만난 사람과 대화하는 상황
- 이웃에게 생활 소음이나 택배 문제를 말하는 상황

가장 먼저 겪어 보고 싶은 장면이 무엇인가요?

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
        "role": "30대 후반의 집주인. 생활 문제를 차분히 확인하며 구체적인 설명을 들으려 한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length wavy brown hair, casual knit sweater and jeans, concerned but patient with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 아파트에 살고 있는데 저녁부터 난방이 작동하지 않는다. 추운 밤을 보내기 어려운 나는 집주인 Maya에게 현재 상황을 설명하고, 수리나 임시로 할 수 있는 조치를 요청하려 한다. 난방이 언제 고쳐질지, Maya가 어떤 해결책을 제시할지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 구한 아파트의 난방이 갑자기 작동하지 않아요",
        "title": "고장 난 난방"
      }
    ],
    "hook": "해외에서 새로 구한 집의 난방이 갑자기 작동하지 않아요",
    "setting": "해외의 아파트 거실",
    "title": "해외 생활 첫 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬며 쳐다보는데, 먼저 말을 꺼내서 “저도 애쓰고 있으니 조금만 이해해 달라”고 부탁하는 순간으로 연습해 볼까요?

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬며 쳐다보지만 고함치지 않고 상대의 설명을 들으면 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 상황이 어떻게 풀리는지는 정하지 않는다.",
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

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 집주인에게 집 안의 문제를 설명하고 수리를 요청하는 상황이네요. 먼저 어떤 문제가 생겼는지 정해 볼까요?

예를 들면 **물이 새는 수도꼭지, 고장 난 난방, 작동하지 않는 세탁기**처럼 실제로 겪을 법한 문제예요. 집주인에게는 무엇을 설명하고, 어떤 수리를 부탁하고 싶으세요?

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 후반의 집주인. 임대 주택의 문제를 확인하고 수리 요청을 듣지만, 일정과 수리 방법을 먼저 따져 본다."
      }
    ],
    "cover": "A man in his late forties, short dark hair, casual sweater and jeans, concerned and listening carefully with a slightly tense posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 집주인 Daniel에게 설명하고, 사진과 실내 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하려 한다. 사진과 온도 기록은 내가 가진 자료로 사용한다. Daniel이 수리를 약속하는지, 언제 수리할 수 있는지는 정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "고장 난 난방"
      }
    ],
    "hook": "집의 난방이 고장 나서 집주인에게 수리를 부탁해요",
    "setting": "해외에서 빌린 집의 거실",
    "title": "해외 생활의 부탁"
  }
]
```
검사: 합의 전에 카드 생성, 대화 없음, 요청한 화 수와 다름

## 3번째 서로 다른 두 상황
질문: 동네 모임에서 처음 만난 이웃과 주말 취미 얘기를 해보고 싶어요. 저는 자전거 타기를 좋아해요. 두 상황은 이것으로 만들어 줘.



```json
[
  {
    "characters": [
      {
        "name": "Daniel",
        "position": 1,
        "role": "40대 후반의 집주인. 임대 주택의 문제를 확인하고 수리 요청을 듣지만, 일정과 수리 방법을 먼저 따져 본다."
      },
      {
        "name": "Olivia",
        "position": 2,
        "role": "30대 초반의 이웃. 동네 모임에서 처음 만난 사람과 주말 이야기를 나누며 자신의 취미도 편하게 이야기한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair, casual sweater and jeans, concerned and listening carefully with a slightly tense posture, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 집주인 Daniel에게 설명하고, 사진과 실내 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁하려 한다. 사진과 온도 기록은 내가 가진 자료로 사용한다. Daniel이 수리를 약속하는지, 언제 수리할 수 있는지는 정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 집주인에게 사진과 온도 기록을 보여 주며 수리를 부탁해요",
        "title": "고장 난 난방"
      },
      {
        "cast": [
          "Olivia"
        ],
        "details": "해외의 동네 모임에서 처음 만난 이웃 Olivia와 대화를 시작한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, 상대의 주말 취미도 물어보며 자연스럽게 인사를 나누려 한다. 두 사람이 이미 친해졌거나 대화가 잘 풀린다고 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 자전거 타기를 좋아한다고 말하며 주말 이야기를 나눠요",
        "title": "첫 동네 인사"
      }
    ],
    "hook": "집의 난방이 고장 나서 집주인에게 수리를 부탁해요",
    "setting": "해외에서 빌린 집과 동네 모임",
    "title": "해외 생활의 부탁"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 이어지는 다른 상황으로, 직원에게 커피 머신의 안전한 사용법과 관리 방법을 물어보는 장면은 어때요?  
교환이 되었는지와 관계없이, 누수가 생긴 원인을 확인하고 앞으로 어떻게 사용해야 할지 설명을 듣는 상황이에요.

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
        "details": "다른 날 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 제대로 내는 법을 물어보고, 어떤 우유를 써야 하는지와 거품을 낼 때 주의할 점도 알아보려 한다. 첫 번째 에피소드에서 커피 머신을 교환했는지, 교환 요청이 어떻게 되었는지는 정하지 않으며, Noah가 실제로 어떤 기계를 기준으로 설명할 수 있는지도 대화에서 드러난다.",
        "number": 2,
        "preview": "다른 날 매장에서 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보며 어떤 우유를 써야 하는지와 거품을 내는 순서를 알고 싶어 한다. 첫 번째 화에서 커피 머신을 교환했는지는 정하지 않으며, 그 결과와 관계없이 체험 코너에 방문한 상황이다. Noah가 시범을 보이거나 설명하는 방식과 내가 실제로 거품을 잘 내는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "같은 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
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

에피소드가 이미 5개라서 더 추가할 수 없어요. 기존 화 중 하나를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장에서 같은 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 기본적인 세척 절차를 확인하려 한다. 앞선 교환이나 사용법 안내가 어떻게 끝났는지는 정하지 않는다.",
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
