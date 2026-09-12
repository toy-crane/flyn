# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T17:13:55.086Z
프롬프트: 현재 작업본
프롬프트 SHA-256: ff7b7592d27df30f8a43f2c71d61cb96b83b30b4caa8cecd2753f86dd8068be5
답 60개, 실패 0개, 호출 실패 0개

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
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 고함치지는 않으며 연락처와 보험 정보를 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket over a shirt, tense and cautiously attentive, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후 갓길에 차를 세운 상황이다. 나는 상대 운전자 Daniel과 연락처를 교환하고 서로의 보험 정보를 확인하려 한다. 사고의 책임이나 피해 정도를 미리 정하지 않으며, 경찰이나 보험사의 개입 여부도 정하지 않는다. Daniel이 어떤 정보를 제시하거나 어떻게 반응하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 정보를 교환해야 해요",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차를 세운 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상하셨겠어요. 그 상황에서 영어로 어떤 대화를 연습해 보고 싶으세요?

예를 들면,

- 싸운 다음 먼저 사과하고 대화를 다시 시작하는 순간
- 육아 분담이 불공평하다고 느낀 점을 설명하는 순간
- 상대의 불만을 듣고 서로 할 일을 정하는 순간
- 감정이 올라오기 전에 대화를 잠시 멈추자고 말하는 순간

어느 장면에 가까운지, 그리고 무엇을 말하고 싶었는지 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하신 걸까요? 비행기, 비즈니스 미팅, 비자 신청처럼 **‘비…’로 시작하는 상황**을 원하시는지, 조금만 더 설명해 주세요.

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
        "role": "40대 초반의 승객. 불편하면 한숨을 쉬며 바라보지만 고함치지는 않고, 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, soft gray sweater, tired and glancing sideways with a restrained sigh, seated with her shoulders slightly turned, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울고 있어 나는 아기를 달래려고 애쓰고 있다. 옆자리의 Emma는 한숨을 쉬며 나와 아기를 바라보지만 소리를 지르거나 화를 내지는 않는다. 나는 아기를 달래기 위해 노력하고 있다는 점을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저와 아기를 바라봐요",
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

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 이어지는 다른 상황으로, **아기를 안고 통로에 잠시 서 있는데 옆자리 승객이 말을 걸어오는 순간**은 어때요?

이번에는 아기 울음에 대한 설명을 반복하기보다, 짧게 상황을 이야기하고 상대의 여행 목적이나 비행 경험을 물으며 대화를 이어가려는 장면으로 만들 수 있어요. 이 방향이 맞으면, 어떤 이야기를 나누고 싶은지 알려 주세요.

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
        "role": "20대 후반의 매장 직원. 고객의 설명을 차분히 듣고 영수증과 제품 상태를 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green store polo shirt, calm and attentive while holding an open-palm gesture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 산 다음 날 매장에 방문했는데 제품에서 물이 샌다. 나는 영수증과 누수 영상을 보여 주며 불량 상황을 설명하고 교환을 요청하려 한다. Mia는 화내지 않고 내 설명과 자료를 차분히 확인한다. 실제로 교환이 가능한지와 매장에서 어떤 절차를 안내하는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "누수 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 판매한 매장의 고객 응대 창구",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 마주칠 만한 순간을 연습해 보고 싶으시군요. 예를 들면 이런 장면이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 상황
- 카페나 식당에서 주문이 잘못 나온 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 직장이나 학교에서 자기소개하고 동료와 대화하는 상황
- 대중교통을 이용하다가 길이나 환승 방법을 묻는 상황
- 관공서에서 비자나 거주 관련 서류를 문의하는 상황

가장 먼저 어떤 장면을 겪어 보고 싶으세요? 해외에 머무는 목적이 여행인지, 유학인지, 취업이나 이민인지도 알려 주시면 더 현실적으로 맞춰 볼게요.

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
        "role": "30대 후반의 아파트 관리인. 입주자의 설명을 차분히 듣고 필요한 정보를 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, simple beige sweater and dark trousers, concerned while leaning slightly forward with an attentive expression, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 처음 지내는 아파트에서 저녁이 되었는데 난방이 작동하지 않는다. 나는 아파트 관리인 Maya에게 현재 방이 춥고 난방을 켜도 따뜻해지지 않는다고 설명한 뒤, 점검이나 수리를 요청하려 한다. 임대 계약서와 입주 안내에 적힌 아파트 정보를 가지고 있다. Maya는 문제를 확인하는 데 필요한 질문을 할 수 있지만, 수리 시기나 해결 여부는 미리 정하지 않는다. 나는 상황을 설명하고 필요한 도움을 요청해야 하며, 고장 원인을 이미 알고 있다고 가정하지 않는다.",
        "number": 1,
        "preview": "새로 지낸 아파트의 난방이 작동하지 않아 관리인에게 도움을 요청해요",
        "title": "난방 문제"
      }
    ],
    "hook": "해외에서 지내는 첫날 밤, 아파트 난방이 작동하지 않아요",
    "setting": "해외의 아파트 관리 사무실",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래느라 애쓰고 있는데 주변 승객의 시선이 신경 쓰이는 상황이네요.  

옆자리 승객이 계속 쳐다보거나 한숨을 쉬어서 먼저 말을 걸고, 아기를 달래고 있다는 점을 설명하며 조금만 이해해 달라고 부탁하는 순간으로 연습해 볼까요?

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
        "role": "40대 초반의 회사원. 불편하면 한숨을 쉬며 쳐다보지만 화를 내지는 않고 상대의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울고 있어 나는 아이를 달래려고 애쓰고 있다. 옆자리의 Emma는 한숨을 쉬며 계속 쳐다보지만 화를 내거나 소리를 지르지는 않는다. 나는 나도 최선을 다하고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 미리 정하지 않는다.",
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

해외에서 생활하며 꼭 필요한 두 장면이네요. 먼저 집주인에게 수리를 요청하는 상황부터 구체적으로 정해 볼게요.

집에서 어떤 문제가 생겼고, 집주인에게 무엇을 말하고 싶으세요? 예를 들면 수도가 새거나 난방이 안 되는 상황에서, 언제부터 문제였는지 설명하고 수리 일정을 요청하는 장면처럼 정할 수 있어요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

좋아요. 첫 번째는 난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 이번 주 안에 수리해 달라고 집주인에게 요청하는 상황으로 정할게요.

이제 동네 모임에서 인사하는 장면을 정해 볼까요? 처음 참석한 모임에서 누구에게 먼저 말을 걸고, 어떤 말을 나누고 싶으세요? 예를 들면 모임 장소나 활동에 대해 묻고 자기소개를 하는 상황처럼 구체화할 수 있어요.

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
        "name": "Michael",
        "position": 1,
        "role": "50대 초반의 집주인. 수리 요청을 들으면 문제 상황과 자료를 확인하며 대화한다."
      },
      {
        "name": "Sophie",
        "position": 2,
        "role": "30대 초반의 이웃. 주말 활동을 편하게 이야기하며 상대의 취미에도 관심을 보인다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual dark sweater, concerned and leaning forward attentively, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Michael"
        ],
        "details": "해외의 임대 주택에서 난방이 고장 나 집 안이 춥다. 나는 난방 문제를 언제부터 겪었는지 설명하고, 고장 상태를 보여 주는 사진과 집 안 온도 기록을 제시하려 한다. 집주인 Michael에게 이번 주 안에 수리해 달라고 부탁하려 한다. Michael이 수리 일정을 잡거나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 수리를 요청해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Sophie"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Sophie에게 먼저 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고, Sophie의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 친해지거나 대화가 잘 풀리는지는 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 주말 취미를 물어봐요",
        "title": "첫인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 요청하고 새로운 이웃에게 먼저 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 커뮤니티 모임",
    "title": "낯선 동네의 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 다른 상황도 연습해 볼게요.  
직원에게 커피 머신의 사용법이나 관리 방법을 물어보는 장면은 어때요? 교환이 되었는지와 관계없이, 매장에 다시 들러 새로 궁금해진 점을 질문하는 상황으로 만들 수 있어요.

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
        "details": "며칠 뒤 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 원하는 거품의 상태와 사용 방법을 설명해 달라고 하려 한다. 첫 번째 방문에서 커피 머신을 교환했는지, 어떤 도움을 받았는지는 정하지 않는다. 이번 대화에서 Noah가 설명하는 내용과 내가 실제로 이해하거나 원하는 결과를 얻는지는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보며 사용하는 방법과 요령을 배우려 한다. 첫 번째 화에서 커피 머신을 교환했는지, Noah와 어떤 대화를 나눴는지는 정하지 않는다. 이 체험 코너에 오게 된 사실과 우유 거품 내는 법을 묻는 상황만 다룬다.",
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

에피소드는 최대 5화까지 만들 수 있어서 더 추가할 수 없어요. 기존 화를 빼거나 다른 화로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서, 적정량과 청소 방법을 설명해 달라고 하려 한다. Noah가 안내하는 방법과 세척제의 양은 대화에서 정한다.",
        "number": 5,
        "preview": "세척제를 얼마나 넣어야 할지 몰라 커피 머신 청소법을 물어보고 싶어요",
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

## 2번째 사고 정보 교환에서 사용자를 별도 인물로 만들지 않기
질문: 고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 연습하고 싶어요.



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
    "cover": "A man in his late thirties, short dark hair, casual gray jacket, tense and alert with both hands slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 차량 사고가 난 직후, 나는 상대 운전자 Daniel과 연락처와 보험 정보를 교환하려 한다. 사고의 책임이나 부상 여부는 정하지 않으며, 서로 필요한 정보를 확인하고 기록하는 순간부터 시작한다. 나는 상대방의 연락처와 보험 정보를 요청하고 내 정보도 전달하려 한다. Daniel이 어떤 태도를 보이는지와 정보 교환이 어떻게 진행되는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 교환해야 해요",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답했겠어요. 그 상황을 영어로 연습한다면, **싸움이 한창인 순간**보다 다시 대화를 시작해야 하는 장면이 도움이 될 것 같아요.

예를 들면 이런 상황이에요.

- 아이를 재운 뒤, 어제 다툰 육아 문제를 다시 꺼내요.
- 와이프는 서운했던 점을 말하고, 저는 제 입장도 설명하면서 앞으로 어떻게 나눌지 이야기하려 해요.
- 서로 감정은 남아 있지만, 고함치거나 모욕하는 상황은 아니에요.

이 장면이 맞나요?  
그리고 영어로는 **사과하고 싶었는지**, **내 입장을 설명하고 싶었는지**, 아니면 **육아 분담 방법을 정하고 싶었는지** 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

어떤 상황을 말씀하시려던 건지 조금만 더 알려 주실래요? 예를 들면 비행기, 비 오는 날 길에서, 비즈니스 미팅처럼 장소나 상황을 적어 주셔도 좋아요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬거나 시선을 보내지만 고함치지 않고 상대의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리 승객 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해해 주는지는 미리 정하지 않는다.",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

같은 비행기에서 다른 상황도 넣어 볼게요.

옆자리 승객과 다시 말을 나누며, 아기 때문에 좌석을 조금 바꿀 수 있는지 함께 상의하는 장면은 어때요? 아기의 울음이 멎었거나 문제가 해결됐다고 가정하지 않고, 지금 상황에서 좌석을 조정할 방법을 물어보는 순간으로 만들 수 있어요.  
원하는 장면이 맞으면, 그때 무엇을 부탁하고 싶은지 알려 주세요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 영상을 차분히 확인하며 고객의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green retail apron over a white shirt, calm and attentive with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 산 커피 머신을 사용했는데 물이 새고 있다. 나는 영수증과 누수 장면을 찍은 영상을 직원에게 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않으며, 영수증과 영상을 확인하고 내 설명을 듣는다. 교환이 가능한지와 직원이 어떤 절차를 안내하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 매장의 고객 응대 창구",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 법한 장면들을 연습해 보고 싶으신 거군요. 예를 들면 이런 상황이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 순간
- 카페나 식당에서 주문이 잘못 나와 설명하는 순간
- 병원이나 약국에서 증상을 설명하는 순간
- 직장이나 학교에서 처음 만난 사람과 대화하는 순간
- 관공서에서 서류나 비자 문제를 문의하는 순간
- 이웃에게 소음이나 생활 문제를 조심스럽게 말하는 순간

먼저 어떤 상황부터 겪어 보고 싶으세요? 두세 가지를 원하셔도 첫 번째 장면부터 하나씩 구체화해 볼게요.

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
        "role": "20대 후반의 집주인. 세입자의 설명을 차분히 듣고 구체적인 문제와 요청을 확인한다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length wavy brown hair, casual beige sweater and dark jeans, concerned and standing with an apologetic but attentive posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 지내는 집의 주방 싱크대 아래에서 물이 새기 시작해 집주인 Maya에게 직접 알리려 한다. 나는 언제부터 어떤 문제가 생겼는지 설명하고, 집에 더 큰 손상이 생기지 않도록 수리 일정을 묻고 싶다. 물이 계속 새고 있어 당장은 싱크대를 사용하지 않고 있으며, 사진을 보여 줄 수 있다. Maya가 언제 수리할지, 문제를 해결해 줄지는 미리 정하지 않는다. 나는 상황을 설명하면서도 무례하게 들리거나 집주인을 탓하는 말은 피하려 한다.",
        "number": 1,
        "preview": "해외에서 지내는 집에 문제가 생겨 집주인에게 설명해야 해요.",
        "title": "싱크대 누수"
      }
    ],
    "hook": "해외에서 지내는 집의 싱크대에서 물이 새기 시작했어요",
    "setting": "해외의 작은 아파트 주방",
    "title": "낯선 집의 문제"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래고 있지만 울음이 멈추지 않아 주변의 시선이 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간, 먼저 말을 걸어 이해를 구하는 장면으로 해볼까요? 어떤 말을 하고 싶은지, 예를 들면 “저도 최선을 다하고 있으니 조금만 이해해 주세요”라고 설명하고 싶은 상황인지 알려 주세요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬며 시선을 보내지만 상대가 설명하면 차분히 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화를 내거나 고함치지는 않지만 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 주변에 피해를 주려는 것이 아니니 조금만 이해해 달라고 말하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
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

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

먼저 해외에서 집주인에게 수리를 요청하는 상황부터 정해 볼게요.

집에서 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하려는 장면인가요? 예를 들면 **물이 새서 수리를 요청하기**, **난방이 작동하지 않아 고쳐 달라고 말하기**, **수리 일정을 조율하기**처럼 정할 수 있어요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요.

이제 동네 모임에서 인사하는 장면을 정해 볼까요?  
처음 참석한 모임에서 **누구에게 먼저 말을 걸고**, 어떤 식으로 인사하고 싶으세요? 예를 들면 이름과 사는 곳을 소개하거나, 모임에 참여한 이유를 말하는 상황이 있어요.

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
        "role": "40대 초반의 집주인. 수리 요청의 내용을 차분히 확인하고 구체적인 자료가 있으면 일정을 조율한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 편안하게 말을 건네며 주말에 하는 일을 물어본다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual button up shirt, concerned and leaning forward with an attentive expression, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 가지고 있다. 집주인 Daniel에게 이 자료를 보여 주며 상황을 설명하고 이번 주 안에 수리해 달라고 부탁하려 한다. 실제로 수리 일정이 정해지거나 요청이 받아들여지는지는 플레이에서 정한다.",
        "number": 1,
        "preview": "집 난방이 고장 나 사진과 온도 기록을 보여 주며 이번 주 안에 수리해 달라고 부탁해요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Maya의 주말 취미도 물어보며 대화를 이어가려 한다. 두 사람이 친해지거나 대화가 원활하게 이어지는지는 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미로 자전거 타기를 이야기해요",
        "title": "첫 만남 인사"
      }
    ],
    "hook": "집 난방이 고장 나 집주인에게 수리를 부탁하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 이어지는 다른 상황으로는, **교환이나 환불 절차를 확인한 뒤 제품 사용 중 주의할 점을 직원에게 묻는 장면**이 어때요?

교환이 실제로 됐다고 가정하지 않고, 매장에 다시 방문해 커피 머신의 누수 원인과 안전하게 확인할 방법을 묻는 상황으로 만들 수 있어요. 이때 어떤 것을 물어보고 싶은지 알려 주세요.

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
        "details": "첫 번째 일과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 첫 번째 일에서 교환이나 환불이 실제로 이루어졌는지는 정하지 않는다. 나는 우유 거품을 내는 방법을 물어보고, 커피 머신을 사용할 때 어떤 순서와 방법으로 거품을 만들어야 하는지 설명을 듣고 싶어 한다. Noah가 어떤 제품을 기준으로 설명할 수 있는지와 실제로 도움을 주는지는 플레이에서 정한다.",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 첫 번째 에피소드에서 커피 머신을 교환했는지, 교환 요청이 어떻게 되었는지는 전제하지 않는다. 나는 우유 거품을 제대로 내고 싶어서 방법을 설명해 달라고 하며, Noah의 안내를 듣고 추가로 궁금한 점을 물어보려 한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어봐요",
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

에피소드는 최대 5화까지 만들 수 있어요. 지금 이미 5화라서 추가하려면 기존 화 중 하나를 빼거나 다른 상황으로 바꿔야 해요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 청소 절차를 설명해 달라고 하려 한다. Noah가 안내하는 내용은 실제 대화에서 정한다.",
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
        "name": "Daniel",
        "position": 1,
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 차분히 사실을 확인하며 연락처와 보험 정보를 교환하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket, tense and alert with one hand raised in a calming gesture, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 사고가 난 직후 갓길에 차를 세운 상황이다. 나는 상대 운전자 Daniel과 연락처와 보험 정보를 교환하려 한다. 사고의 책임이나 수리 방법을 미리 정하지 않으며, Daniel이 어떤 정보를 제시하고 대화에 어떻게 반응하는지는 실제 대화에서 정한다. 고속도로 주변의 위험 때문에 안전을 확인하면서 필요한 정보를 주고받아야 한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 주고받아야 해요",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 연락처와 보험 정보를 교환해야 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "사고 후 정보 교환"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 힘드셨겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 거라면, 싸움 전체보다 **어떤 순간에 무슨 말을 하려는지** 정하면 좋아요.

예를 들면:

- 아내에게 어제 말이 너무 거칠었다고 사과하는 순간
- 육아를 한쪽이 더 많이 맡고 있다고 느낀 이유를 설명하는 순간
- 오늘부터 육아를 어떻게 나눌지 함께 정하는 순간
- 아내의 불만을 먼저 듣고 오해를 풀어 보려는 순간

어느 장면을 연습하고 싶으세요? 꼭 화해나 해결까지 가는 상황일 필요는 없어요.ેણ

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

말씀하시려던 상황을 조금만 더 이어서 적어 주세요.  
예를 들면 “비행기에서…”처럼 장소와 누구와 무슨 일이 생겼는지를 알려 주시면 돼요.

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
        "role": "40대 초반의 회사원. 불편하면 한숨을 쉬며 바라보지만 고함치지 않고 상대의 설명을 들어요."
      }
    ],
    "cover": "A woman in her early forties with short brown hair, wearing a soft gray sweater, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리의 Emma는 한숨을 쉬며 나와 아기를 바라보지만 소리를 지르지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 상황을 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하는지와 부탁이 받아들여지는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 우리를 바라봐요",
        "title": "옆자리의 시선"
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

같은 비행기에서 이어지는 다른 상황으로, **옆자리 승객이 아기에게 말을 걸어 보려는 순간**을 연습해 볼까요?

아기가 계속 울고 있어 결과가 어떻게 되었는지는 정하지 않은 채, 먼저 말을 건네려는 상황이에요. 괜찮으면 그때 하고 싶은 말을 알려 주세요.

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
        "role": "20대 후반의 매장 직원. 화내지 않고 영수증과 제품 상태를 차분히 확인하며 요청 내용을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green retail shirt, calm but concerned with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "커피 머신을 산 매장에 다시 찾아간다. 어제 산 커피 머신에서 물이 새고 있어 영수증과 누수 장면을 찍은 영상을 보여 주며 교환을 요청하려 한다. Mia는 화내지 않고 영수증과 영상을 확인하며 이야기를 듣는다. 나는 제품에 생긴 문제를 설명하고 교환을 요청해야 한다. 교환이 가능한지와 직원이 어떤 절차를 안내하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "새는 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 산 매장의 고객 응대 공간",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪을 만한 장면을 영어로 연습해 보고 싶으신 거군요. 예를 들면 이런 상황이 있어요.

1. **집 구하기**: 집주인이나 부동산 직원에게 방 상태와 계약 조건을 묻기  
2. **마트나 가게에서 문제 해결하기**: 물건이 없거나 결제에 문제가 생겨 직원에게 도움 요청하기  
3. **병원 방문하기**: 증상을 설명하고 진료나 약에 대해 묻기  
4. **직장이나 학교에서 처음 인사하기**: 새로운 사람에게 자신을 소개하고 대화 이어 가기  
5. **공공기관 이용하기**: 은행, 통신사, 우체국에서 필요한 업무 처리하기  

이 중에서 가장 먼저 연습하고 싶은 상황이 있나요? 직접 떠올려 둔 장면이 있다면 그 상황을 말씀해 주셔도 좋아요.

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
        "role": "30대 후반의 아파트 관리인. 생활 문제의 구체적인 상황을 먼저 확인하고 차분하게 대응한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark brown hair, casual maintenance office sweater, concerned and leaning slightly forward as if listening carefully, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 아파트에 입주한 첫날이다. 저녁에 샤워하려고 했지만 욕실 수도에서 물이 나오지 않는다. 나는 아파트 관리인 Maya에게 문제를 설명하고, 언제 어떻게 도움을 받을 수 있는지 물어보려 한다. 주방 수도도 같은 상태인지는 대화 중 확인할 수 있으며, Maya가 바로 수리해 주거나 문제를 해결하는지는 정하지 않는다.",
        "number": 1,
        "preview": "새로 이사한 아파트에서 물이 나오지 않아 관리인에게 도움을 요청해요",
        "title": "수도가 안 나와요"
      }
    ],
    "hook": "새로 이사한 아파트에서 물이 나오지 않아 관리인에게 도움을 요청해요",
    "setting": "해외 아파트 관리 사무실",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래도 울음이 멈추지 않아 주변 승객의 시선이 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬어서, 먼저 말을 걸고 “저도 달래려고 애쓰고 있으니 조금만 이해해 달라”고 설명하는 순간으로 연습해 볼까요?

옆자리 승객은 화를 내기보다는 불편한 표정으로 바라보는 사람으로 할지, 아니면 다른 상황을 원하시는지 말씀해 주세요.

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
        "role": "40대 초반의 편집자. 불편하면 한숨을 쉬며 바라보지만 화를 내지는 않고, 상대가 설명하면 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and glancing sideways with restrained impatience, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화를 내거나 고함치지 않고 한숨을 쉬며 계속 바라본다. 나는 Emma에게 먼저 말을 걸어 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 사람이 한숨을 쉬며 계속 쳐다봐요",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 사람의 한숨과 시선이 느껴져요",
    "setting": "아이와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

두 가지 상황을 각각 연습하고 싶으시군요. 먼저 해외에서 집주인에게 수리를 요청하는 장면부터 구체적으로 정해 볼게요.

어떤 문제가 생겼나요? 예를 들면 **난방이 작동하지 않거나, 욕실 누수가 있거나, 온수가 나오지 않는 상황**처럼요. 그리고 집주인에게는 수리를 요청하고 문제의 상태와 불편한 점을 설명하려는 게 맞을까요?

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 실내 온도 기록을 보여 주며, 이번 주 안에 수리해 달라고 집주인에게 요청하는 상황이네요.

두 번째 상황인 동네 모임에서는 어떤 순간에 인사하고 싶으세요? 예를 들면 **처음 참석해서 옆 사람에게 말을 거는 순간**이나 **모임에 늦게 도착해 사람들에게 자신을 소개하는 순간**이 있어요. 인사하면서 간단히 자기소개만 할지, 상대의 이름이나 모임에 온 이유까지 물어볼지도 알려 주세요.

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
        "role": "40대 초반의 집주인. 수리 요청을 들으면 문제의 상태와 근거를 먼저 확인하고 일정에 대해 대화한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람과 가볍게 이야기를 나누며 주말에 하는 일을 물어본다."
      }
    ],
    "cover": "A man in his early forties, short dark hair, casual sweater and jeans, concerned and listening with one hand slightly raised, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 가지고 Daniel에게 상황을 설명하려 한다. 이번 주 안에 수리해 달라고 부탁하고, 자료를 근거로 불편한 상태를 전달하려 한다. Daniel이 언제 수리할 수 있는지나 요청을 받아들이는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 친해졌다고 미리 정하지 않으며, Maya가 어떤 취미를 이야기할지는 플레이에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "첫 이웃 인사"
      }
    ],
    "hook": "해외에서 집주인에게 고장 난 난방을 설명하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 모임 공간",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 겪을 다른 상황도 넣어 볼게요.

**교환 요청을 하러 다시 방문한 상황과는 별개로**, 매장 직원에게 커피 머신의 기본 사용법이나 관리 방법을 물어보는 장면은 어때요? 새 제품을 받았다고 가정하지 않고, 매장에 전시된 제품을 보며 물이 새지 않게 사용하는 방법과 청소 방법을 묻는 상황으로 만들 수 있어요.

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
        "details": "첫 번째 사건과 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 커피 머신으로 우유 거품을 만들 때 필요한 순서와 주의할 점을 설명해 달라고 하려 한다. 이전에 커피 머신 교환에 성공했는지, 어떤 제품을 갖고 있는지는 정하지 않는다. Noah가 어떤 방법을 알려 주는지와 대화가 어떻게 이어지는지는 플레이에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장에서 Noah를 만나 우유 거품 내는 법을 물어봐요",
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
        "details": "다른 날 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 직접 만들어 보는 방법과 필요한 순서를 설명해 달라고 하려 한다. 첫 번째 화에서 커피 머신을 교환했는지, 교환 요청이 어떻게 끝났는지는 정하지 않으며, 이 체험 코너에 가는 일은 그 결과와 무관하게 성립한다.",
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

지금은 이미 5화라 에피소드를 더 추가할 수 없어요. 기존 화를 빼거나 다른 화로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장에서 Noah에게 커피 머신 청소 방법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 방법을 확인하려 한다. Noah가 알려 주는 내용과 실제로 청소가 잘되는지는 플레이에서 정한다.",
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
