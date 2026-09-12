# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:48:29.183Z
프롬프트: 현재 작업본
프롬프트 SHA-256: dc1800cdcc67531af3cebe6036d9d3259c8e96f6f27369cdab9683ffa23e5b61
답 60개, 실패 1개, 호출 실패 0개

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
        "role": "30대 후반의 운전자. 사고 상황을 차분히 확인하고 연락처와 보험 정보를 주고받으려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense but composed and standing cautiously, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후, 나는 상대 운전자 Daniel과 연락처와 보험 정보를 교환하려 한다. 사고에 관해 필요한 기본 정보를 서로 확인하고 내 연락처와 보험 정보를 전달해야 한다. Daniel이 어떤 태도로 반응하는지와 정보 교환이 어떻게 진행되는지는 실제 대화에서 정한다. 사고의 책임이나 보험 처리 결과는 미리 정하지 않는다.",
        "number": 1,
        "preview": "고속도로에서 사고가 난 뒤 상대 운전자와 연락처와 보험 정보를 주고받으려 해요.",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 정보를 주고받아야 해요",
    "setting": "사고 직후의 고속도로 갓길",
    "title": "사고 후 연락처 교환"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 거라면, 싸움이 벌어진 순간부터 해볼까요, 아니면 감정이 조금 가라앉은 뒤 아내와 다시 이야기하는 장면부터 해볼까요?

그때 영어로 가장 하고 싶었던 말이 무엇이었는지도 알려 주세요. 예를 들면 육아 분담을 조정하고 싶었다거나, 서로의 입장을 이해하고 싶었다는 식이면 돼요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비”라고 하신 건 비 오는 날의 상황을 말씀하신 걸까요?  
예를 들면 우산을 빌리기, 택시를 잡기, 젖은 옷 때문에 가게에 도움을 요청하기처럼 구체적인 장면을 정해 볼 수 있어요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편해도 소리치지 않고 시선과 한숨으로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 소리를 지르거나 직접 화내지는 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 진정시키려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응할지와 부탁을 받아들일지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기가 계속 우는 가운데 옆자리 승객의 한숨과 시선이 느껴져요",
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

여행 중 겪을 다른 장면도 하나 넣어 볼게요. 비행기에서 내린 뒤, 수하물이 늦게 나와 공항 직원에게 상황을 설명하고 도움을 요청하는 상황은 어때요?

수하물이 실제로 늦게 나온 건지, 분실된 건지는 정하지 않고요. 원하시면 다른 장소나 대화 상대의 상황으로 바꿀 수 있어요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품 상태와 구매 내역을 확인하고 고객의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green retail shirt and beige pants, calm and attentive with an apologetic expression, standing with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 구매한 커피 머신에 물이 새는 문제가 생겼다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 제품 상태와 구매 내역을 확인하며 내 설명을 듣는다. 교환이 가능한지, 다른 해결 방법이 제시되는지는 실제 대화에서 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 매장에 찾아왔어요",
    "setting": "문제가 생긴 커피 머신을 들고 찾아간 매장 고객 서비스 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 법한 장면을 영어로 연습해 볼 수 있어요. 예를 들면:

- 집을 구하거나 집주인에게 수리를 요청하는 상황
- 마트나 약국에서 필요한 물건을 묻는 상황
- 카페나 식당에서 주문에 문제가 생긴 상황
- 직장이나 학교에서 자기소개하고 대화하는 상황
- 병원에서 증상을 설명하는 상황
- 길을 묻거나 대중교통 이용법을 확인하는 상황
- 이웃에게 소음이나 생활 문제를 조심스럽게 말하는 상황

이 중에서 특히 연습하고 싶은 생활 장면이 있나요? 여러 개라면 몇 화로 해볼지도 함께 알려 주세요.

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
        "role": "30대 중반의 아파트 관리 직원. 주민의 요청을 차분히 듣고 필요한 내용을 확인하지만, 규정과 가능한 해결 방법을 먼저 설명한다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, neat beige blouse and cardigan, attentive with a slightly concerned expression and an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 지낸 아파트의 욕실에서 물이 새기 시작해 관리 사무실에 직접 찾아간 상황이다. 나는 누수가 언제부터 시작됐고 생활에 어떤 불편이 있는지 설명하고, 가능한 한 빨리 점검이나 수리를 요청하려 한다. 관리 직원 Maya는 상황과 긴급성을 확인하고 건물의 처리 절차를 설명할 수 있다. 나는 집 안에 들어오는 수리 일정과 비용 부담에 대해 알고 있는 만큼 말할 수 있지만, 수리가 바로 이루어지거나 비용 문제가 해결된다고 미리 정하지 않는다. 물이 새는 정도와 내가 피하고 싶은 추가 피해는 대화 중 설명한다.",
        "number": 1,
        "preview": "새로 지낸 아파트 욕실에서 물이 새서 관리 사무실을 찾아가요",
        "title": "누수 신고"
      }
    ],
    "hook": "새로 지낸 아파트 욕실에서 물이 새기 시작해 관리 사무실을 찾아가요",
    "setting": "해외 아파트 관리 사무실",
    "title": "해외 생활 첫날들"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 시선도 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬어서 먼저 말을 거는 순간으로 연습해 볼까요? 상대가 화를 내지는 않지만, 저는 애쓰고 있으니 조금만 이해해 달라고 말하려는 장면이에요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 중요하게 여기지만, 상대가 설명하면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울음을 멈추지 않는다. 옆자리 승객 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 말하려 한다. Emma가 이해해 주는지, 상황이 어떻게 풀리는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
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

## 1번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

두 상황을 각각 한 화로 만들어 볼게요.

먼저 해외에서 집주인에게 수리를 요청하는 장면은 어떤 문제인가요? 예를 들면 **온수가 안 나오거나, 난방이 고장 났거나, 욕실 누수가 생긴 상황**이 있어요. 집주인에게 수리를 부탁하면서 꼭 전하고 싶은 내용이나 피하고 싶은 반응도 있으면 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며, **이번 주 안에 수리해 달라고 요청하는 상황**으로 정할게요. 집주인이 수리 일정을 바로 정할지는 플레이에서 열어 두겠습니다.

두 번째로, 동네 모임에서는 어떤 장면을 원하세요? 예를 들면 **처음 참석한 모임에서 옆 사람에게 먼저 인사하고 자기소개하는 순간**이나, **모임이 시작되기 전에 여러 사람에게 자연스럽게 말을 거는 순간**이 있어요. 어느 쪽에 가까운지, 나누고 싶은 관심사가 있으면 알려 주세요.

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
        "name": "Maya",
        "position": 1,
        "role": "40대 초반의 집주인. 문제 상황을 차분히 확인하지만 수리 일정은 자신의 사정을 고려해 정하려 한다."
      },
      {
        "name": "Ben",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게도 주말 취미를 물으며 편하게 대화를 이어 간다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length dark hair, casual knit sweater and trousers, concerned with an attentive expression and slightly tense posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 지내는 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 집주인 Maya에게 설명하고, 고장 상태를 보여 주는 사진과 실내 온도 기록을 근거로 제시하려 한다. 이번 주 안에 수리해 달라고 부탁하는 것이 목표다. Maya가 수리를 약속하거나 일정을 정하는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며 수리를 요청해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Ben"
        ],
        "details": "동네 모임에 처음 참석해 Ben이라는 이웃을 처음 만난다. 나는 먼저 인사하고 주말에 무엇을 하는지 물으며 대화를 시작하려 한다. 내가 자전거 타기를 좋아한다는 이야기를 하고, Ben의 주말 취미도 물어보려 한다. 대화가 자연스럽게 이어지거나 두 사람이 친해졌다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "첫인사"
      }
    ],
    "hook": "난방이 고장 난 집주인에게 수리를 부탁하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "새로운 동네에서"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

커피 머신을 산 뒤 매장에서 겪을 다른 상황도 넣어 볼게요. 직원에게 사용법을 물어보는데, 설명서가 이해되지 않아 특정 기능을 어떻게 쓰는지 다시 설명해 달라고 요청하는 장면은 어때요? 어떤 기능을 배우고 싶은지 말씀해 주세요.

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
        "details": "첫 번째 일과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 원하는 거품을 만들 수 있도록 사용 방법을 설명해 달라고 하려 한다. 첫 번째 일에서 교환이 성공했는지, 어떤 제품을 갖고 있는지는 미리 정하지 않는다. Noah가 설명할 수 있는 범위와 실제 사용 결과는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유의 양과 거품을 내는 순서와 방법을 이해하고 직접 해 보려 한다. 첫 번째 화에서 커피 머신을 교환했는지, 교환하지 못했는지는 정하지 않으며, 이번 대화는 그 결과와 무관하게 시작된다.",
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

에피소드는 최대 5화까지라 지금은 더 추가할 수 없어요. 기존 화 중 하나를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 올바른 사용량과 세척 방법을 확인하려 한다. Noah가 정확한 방법을 안내할 수 있는지는 실제 대화에서 정한다.",
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
        "role": "30대 후반의 상대 운전자. 사고 직후 연락처와 보험 정보를 확인하려 한다. 자신의 입장을 설명하지만 실제 과실이나 처리 결과는 현장에서 정해지지 않는다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense and focused while standing upright and facing someone after a sudden incident, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후, 차를 안전한 곳에 세우고 상대 운전자와 마주한다. 나는 Daniel과 연락처와 보험 정보를 서로 교환하려 한다. 사고 경위에 관해 필요한 말을 할 수 있지만, 어느 쪽의 과실인지나 보험 처리가 어떻게 끝나는지는 정하지 않는다. Daniel의 연락처와 보험 정보를 확인하는 과정에서 실제로 어떤 정보가 오가는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 정보를 교환해야 해요",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답하셨겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 거라면, 부부싸움 전체보다 **어떤 순간에 무슨 말을 하고 싶은지** 정하면 좋아요.

예를 들면:

- 아내에게 내 입장도 이해해 달라고 말하고 싶었어요
- 육아 분담을 구체적으로 다시 정하고 싶었어요
- 감정이 격해진 뒤 대화를 다시 시작하고 싶었어요
- 사과하면서도 내가 힘들었던 점은 설명하고 싶었어요

어제 싸움에서 영어로 가장 말해 보고 싶은 순간은 어느 쪽에 가까우세요?

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

‘비’와 관련된 상황을 말하신 걸까요? 예를 들면 비행기, 비 오는 날 길을 걷다, 우산을 빌리거나 환불을 요청하는 상황처럼요. 어떤 장면을 영어로 연습하고 싶으세요?

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
        "role": "40대 초반의 승객. 아기의 울음에 불편해하지만 소리치지 않고 한숨과 시선으로 반응한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with restrained frustration, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 소리치지 않고 한숨을 쉬며 아기와 나를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 바라봐요",
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

비행기 안에서 겪을 다른 장면도 넣어 볼게요. 예를 들면, 승무원이 다가와 아기를 달랠 수 있는 방법을 안내하는데 필요한 도움을 요청하는 상황은 어떠세요?

어떤 도움을 요청하고 싶은지 말씀해 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 고객의 설명과 구매 자료를 확인하며 가능한 교환 절차를 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder length dark brown hair, green retail uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 산 커피 머신에서 물이 새어 매장에 가져온 상황이다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 내 설명과 영수증, 영상을 확인한다. 교환이 가능한지와 실제 처리 결과는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "새는 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 판매한 매장의 고객 서비스 데스크",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면을 영어로 연습해 보고 싶은 거군요. 예를 들면 이런 상황이 있어요.

- 집을 구하거나 집주인에게 수리 요청하기
- 마트나 약국에서 필요한 물건 묻기
- 카페나 식당에서 주문하고 문제 해결하기
- 직장이나 학교에서 자기소개하고 대화하기
- 병원에서 증상을 설명하기
- 이웃이나 룸메이트와 생활 규칙 이야기하기
- 관공서나 은행에서 서류와 절차를 확인하기

이 중에서 가장 먼저 겪어 보고 싶은 상황이 있나요? 꼭 목록에 없는 장면이어도 괜찮아요.

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
        "role": "30대 초반의 집주인. 세입자의 설명을 차분히 듣지만 수리의 긴급성과 비용을 먼저 확인한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark brown hair, casual beige sweater and jeans, concerned and standing with a cautious attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 지내는 아파트의 욕실 수도꼭지에서 물이 계속 새고 있다. 나는 집주인 Maya에게 문제를 설명하고 가능한 한 빨리 수리를 요청하려 한다. 물이 새기 시작한 때와 현재 상태를 말할 수 있고, 사진을 보여 줄 수도 있다. Maya가 바로 수리해 주거나 비용을 부담하는지는 정하지 않는다. 나는 생활에 불편이 커지기 전에 해결 방법과 방문 가능한 시간을 확인해야 한다.",
        "number": 1,
        "preview": "해외에서 지내는 집의 욕실 수도꼭지가 계속 새고 있어 집주인에게 연락해요",
        "title": "집 수리 요청"
      }
    ],
    "hook": "해외에서 지내는 집의 욕실 수도꼭지가 계속 새고 있어 집주인에게 연락해요",
    "setting": "해외 아파트의 거실",
    "title": "낯선 곳에서 살기"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데 주변 승객의 시선이 느껴지는 상황이네요. 옆자리 승객이 한숨을 쉬거나 계속 쳐다보는 순간, 먼저 말을 걸어 양해를 구하는 장면으로 연습해 볼까요?

상대가 화를 내는 사람인지, 아니면 불편해하지만 말없이 바라보는 사람인지도 정해 주세요.

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
        "role": "40대 초반의 승객. 아기의 울음이 불편하지만 화내지는 않고 한숨을 쉬며 바라본다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with restrained discomfort, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화내거나 소리치지는 않지만 한숨을 쉬며 계속 바라본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 시선이 계속 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "울음을 멈추지 않는 아기"
  }
]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

두 가지 상황을 각각 한 화로 만들어 볼게요.

먼저 해외에서 집주인에게 수리를 요청하는 장면부터 정해 볼까요? 예를 들면 **욕실 누수, 난방 고장, 에어컨 고장**처럼 실제로 문제가 생겨 수리가 필요한 순간이에요. 어떤 문제를 말하고 싶으세요?

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주며, 이번 주 안에 수리해 달라고 부탁하는 상황으로 정할게요.

두 번째 **동네 모임에서 인사하기**는 어떤 순간을 원하세요? 예를 들면 처음 참석해서 옆자리 사람에게 자기소개를 하고, 이사 온 곳이나 관심사를 간단히 이야기하는 장면이 있어요. 무엇을 말해 보고 싶으세요?

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
        "role": "40대 초반의 집주인. 수리 요청을 들으면 문제 상황과 필요한 조치를 차분히 확인한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게 편하게 말을 걸고 주말 취미를 물어본다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual sweater and jeans, concerned and listening with a slightly tense posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 임대한 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 설명하고, 고장 상태를 보여 주는 사진과 실내 온도 기록을 제시하려 한다. 집주인 Daniel에게 이번 주 안에 수리를 해 달라고 부탁하려 한다. Daniel이 수리 일정을 정하거나 요청을 받아들이는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "집 난방이 고장 나서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에 처음 참석해 처음 만난 이웃 Maya와 인사를 나눈다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 친해졌거나 대화가 자연스럽게 이어진다고 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "첫 만남"
      }
    ],
    "hook": "해외에서 집주인과 이웃을 만나 영어로 말을 걸어야 해요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

이번에는 같은 매장에서 제품 문제를 설명한 뒤, 환불이나 수리 절차를 문의하는 상황은 어때요?  
교환이 됐는지와 관계없이, 저는 **제품을 더 이상 쓰기 어려워서 환불을 요청하고 싶다**고 말하는 장면으로 만들 수 있어요. 원하시는 목표나 꼭 보여 주고 싶은 자료가 있나요?

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
        "details": "첫 번째 사건과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 방법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 순서와 주의할 점을 이해하려 한다. 첫 번째 사건에서 교환에 성공했는지, 어떤 제품을 갖고 있는지는 정하지 않는다. Noah가 어떤 방법을 안내하는지와 내가 이해하는지는 실제 대화에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보며 어떤 우유를 써야 하는지와 기계를 어떻게 조작해야 하는지 알고 싶다. 첫 화에서 커피 머신을 교환했는지, 교환하지 못했는지와 관계없이 체험 코너에 온 상황이며, Noah가 얼마나 자세히 설명하거나 도와주는지는 정하지 않는다.",
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

이미 5화라 에피소드를 더 추가할 수 없어요. 기존 화를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적절한 양과 세척 방법을 설명해 달라고 하려 한다. Noah가 설명하는 내용과 실제로 청소할 수 있는지는 플레이에서 정한다.",
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

## 3번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 연습하고 싶어요.

사고 직후 갓길에 차를 세우고, 상대 운전자와 서로 연락처와 보험 정보를 확인하는 상황으로 만들 수 있어요. 과실을 따지거나 사고 처리를 끝내는 장면이 아니라, 필요한 정보를 차분히 교환하는 순간에 집중하면 될까요?

상대 운전자는 **차분한 사람**인가요, 아니면 **당황해서 말이 조금 꼬이는 사람**인가요?

```json
[]
```
검사: 카드 하나 필요, 카드 앞뒤 대화 중복

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답하셨겠어요. 그 상황을 영어로 연습해 보고 싶은 거라면, 싸운 뒤 다시 대화를 꺼내는 장면으로 해볼 수 있어요.

예를 들면 아래 중 어떤 순간에 가까운가요?

1. 서로 진정한 뒤, 내가 먼저 대화를 시작하고 싶어요.  
2. 육아 분담이 불공평하다고 느낀 점을 설명하고 싶어요.  
3. 아내의 불만을 듣고 내 입장도 차분히 말하고 싶어요.  
4. 어제 말이 너무 심했다면 사과하고 싶어요.

실제 상황에서 무슨 문제로 다퉜고, 영어로 무엇을 말하고 싶었는지 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하시려던 건가요? 조금만 더 이어서 적어 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편해도 소리치지 않고 상대의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리의 Emma는 소리를 지르지 않고 한숨을 쉬며 나와 아기를 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
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

여행 중 다른 상황도 하나 넣어 볼게요. 비행기에서 내린 뒤 공항에서 아기와 함께 이동하다가 길을 찾기 어려워, 공항 직원에게 도움을 요청하는 장면은 어때요? 원하는 장면이 다르면 말씀해 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 고객의 설명과 제품 상태를 확인하고, 요청을 들으면 필요한 절차를 안내한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, casual store uniform, calm and attentive with an apologetic expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "어제 이 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 내 설명과 자료를 확인한다. 매장의 교환 절차나 제품 재고 여부, 교환이 가능한지는 실제 대화에서 정하지 않는다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 왔어요",
    "setting": "커피 머신을 산 전자제품 매장",
    "title": "누수 난 커피 머신"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 지내며 자주 겪는 상황들을 영어로 연습해 보고 싶으신 거네요. 예를 들면 아래 같은 장면이 있어요.

- 집을 구하거나 집주인에게 문제를 설명하기
- 직장이나 학교에서 처음 인사하고 대화하기
- 병원이나 약국에서 증상 설명하기
- 은행이나 통신사에서 서비스 이용하기
- 마트나 식당에서 필요한 것을 요청하기
- 이웃이나 동료와 자연스럽게 친해지기

이 중에서 특히 겪어 보고 싶은 상황이 있나요? 한 가지 장면부터 정해도 좋고, 여러 상황을 원하시면 몇 화로 해볼지도 알려 주세요.

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
        "role": "30대 후반의 집주인. 문제를 바로 해결하기보다 상황과 책임 범위를 먼저 확인한다. 구체적으로 설명하면 차분히 대화하지만, 감정적인 표현에는 조심스럽게 반응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, casual beige sweater, concerned and slightly guarded, standing with tense shoulders, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 생활하는 동안 집에서 난방이 갑자기 작동하지 않는다. 추운 날씨라 밤을 보내기 불편하고, 나는 집주인 Maya에게 현재 상황을 설명한 뒤 수리 방법과 가능한 일정을 묻고 싶다. 난방이 언제부터 작동하지 않았는지와 온도 조절기를 확인해 본 사실은 알고 있지만, 고장의 원인이나 수리 비용 부담 주체는 정해져 있지 않다. Maya가 바로 수리해 주거나 문제를 해결한다고 미리 정하지 않으며, 나는 필요한 도움을 요청하고 상황이 더 나빠지지 않게 대화하려 한다.",
        "number": 1,
        "preview": "집의 난방이 갑자기 멈춰 집주인에게 상황을 설명하고 도움을 요청해요",
        "title": "난방 문제"
      }
    ],
    "hook": "해외에서 지내는 집의 난방이 멈춰 집주인에게 도움을 요청해요",
    "setting": "추운 날 저녁의 해외 임대 주택",
    "title": "해외 생활의 첫 문제"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데, 옆자리 승객이 계속 쳐다보며 불편한 기색을 보이는 순간으로 해볼까요?

그 승객에게 상황을 설명하고 조금만 이해해 달라고 말하고 싶은지, 아니면 승무원에게 도움을 요청하고 싶은지 알려 주세요.

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 중요하게 여기지만, 상대가 사정을 설명하면 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with restrained discomfort, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화를 내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 상황을 조금만 이해해 달라고 말하려 한다. Emma가 이해해 주는지, 대화가 어떻게 끝나는지는 정하지 않는다.",
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

서로 다른 두 장면을 연습하고 싶으시군요.

- **집주인과 수리 얘기하기**: 집에서 어떤 문제가 생겼고, 집주인에게 무엇을 요청하려고 하나요? 예를 들면 온수가 안 나오거나, 누수가 생겨 수리 날짜를 잡아 달라고 요청하는 상황이에요.
- **동네 모임에서 인사하기**: 처음 참석한 모임에서 누구에게 먼저 말을 걸고, 어떤 이야기를 나누고 싶으세요? 예를 들면 자기소개를 하고 이 동네에 온 지 얼마 안 됐다고 말하는 상황이에요.

먼저 두 장면의 구체적인 상황을 각각 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 주고, 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임 장면을 정해 볼까요?  
처음 참석한 모임에서 누구에게 먼저 인사하고, 자기소개 외에 어떤 이야기를 나누고 싶으세요? 예를 들면 이사 온 지 얼마 안 됐다는 말이나 모임에 참여한 이유를 이야기할 수 있어요.

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
        "role": "40대 후반의 집주인. 수리 요청을 들으면 문제와 증거를 차분히 확인하고 일정부터 조율한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 조심스럽지만 상대의 취미를 물으며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-down shirt, concerned and listening with a slight frown, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 상태를 보여 주는 사진과 온도 기록을 가지고 있다. Daniel에게 이 자료를 보여 주며 문제를 설명하고, 이번 주 안에 수리를 해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이거나 특정 날짜를 정하는지는 플레이에서 결정한다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 들고 집주인에게 수리를 요청해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 자전거 타기를 좋아한다고 말하고, 주말에 하는 취미에 관해 이야기하며 대화를 이어 가려 한다. Maya가 어떤 취미를 말하거나 두 사람이 계속 대화하게 되는지는 플레이에서 결정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "첫 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 모임에서 이웃에게 먼저 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "해외 생활의 두 장면"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 다른 상황도 하나 넣어 볼게요.  
**커피 머신을 사기 전에 직원에게 기능과 사용법을 물어보는 장면**은 어때요?

원하는 모델의 조건이나 꼭 확인하고 싶은 기능이 있으면 알려 주세요.

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
        "details": "첫 번째 에피소드와 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, Noah의 설명을 들으며 필요한 사용 방법을 확인하려 한다. 첫 번째 에피소드에서 커피 머신을 교환했는지, 어떤 제품을 갖고 있는지, Noah와 어떤 대화를 나눴는지는 정하지 않는다. 우유 거품을 내는 방법을 설명받는 상황만 정하고 실제로 잘 따라 하게 되는지는 플레이에서 결정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보고 싶어 방법과 주의할 점을 물으려 한다. 이 방문은 첫 화의 교환 결과와 관계없이 이루어지며, 이전에 교환이 성공했거나 실패했다고 정하지 않는다. Noah가 시범을 보이거나 어떤 설명을 하는지는 실제 대화에서 정한다.",
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

에피소드는 최대 5화까지라 지금은 더 추가할 수 없어요. 기존 화 중 하나를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르며, 안전하게 세척하는 방법과 세척제의 적정량을 설명해 달라고 하려 한다. 정확한 사용법을 안내받는지는 플레이에서 정한다.",
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
