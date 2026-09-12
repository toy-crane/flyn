# 스토리 만들기 인터뷰 평가

모델: openai/gpt-5.6-luna
실행: 2026-09-12T16:56:35.624Z
프롬프트: 현재 작업본
프롬프트 SHA-256: 60b4cfc25e4f63b7bcadc97497b82ac62cfffcd4773583b26bbb7e9bf0bbf5ee
답 60개, 실패 2개, 호출 실패 0개

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
        "role": "30대 후반의 상대 운전자. 사고 직후 당황했지만 감정을 크게 드러내지 않고 필요한 정보를 확인하려 한다. 과실이나 책임을 단정하기보다 사실관계를 먼저 듣는다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual gray jacket, tense and concerned with one hand slightly raised, three-quarter view, body turned, face toward the viewer, deep navy background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "고속도로에서 나와 Daniel의 차량 사이에 사고가 났고, 사고 직후 갓길에서 서로 대화를 시작한다. 부상 여부나 과실은 미리 정하지 않는다. 나는 상대 운전자와 이름과 연락처를 교환하고, 자동차 보험 회사와 보험 정보를 확인하려 한다. 필요하면 사고가 난 위치와 차량 손상 같은 사실도 차분히 설명하거나 물어볼 수 있다. Daniel이 어떤 정보를 제공하는지, 사고 책임에 대해 어떻게 반응하는지, 보험 처리가 어떻게 진행되는지는 실제 플레이에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 나서 상대 운전자와 필요한 정보를 교환하려고 해요.",
        "title": "사고 후 정보 교환"
      }
    ],
    "hook": "고속도로에서 사고가 나서 상대 운전자와 필요한 정보를 교환하려고 해요.",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 1번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 속상했겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 걸까요?

예를 들면 이런 장면이 있어요.

- 싸운 다음 날, 아내에게 먼저 말을 꺼내고 사과하기
- 육아에서 내가 힘들었던 점을 설명하기
- 아내가 느낀 부담을 듣고 서로 역할을 다시 정하기
- 감정이 올라오기 전에 대화를 잠시 멈추자고 말하기

어떤 순간을 직접 연습해 보고 싶으세요?

```json
[]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비”와 관련된 어떤 상황을 영어로 연습해 보고 싶으세요?  
예를 들면 우산을 빌리기, 비행기 결항을 문의하기, 비 때문에 약속 장소를 바꾸기처럼 구체적인 장면을 정할 수 있어요.

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
        "role": "40대 초반의 회사원. 아기 울음에 불편함을 느끼지만 고함치지 않고 한숨과 시선으로 반응하며 설명을 들으면 대답한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, beige cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 울고 있다. 옆자리 승객 Emma는 소리를 지르거나 직접 화내지는 않고 한숨을 쉬며 나와 아기를 바라본다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 태도가 바뀌는지, 상황이 어떻게 끝나는지는 정하지 않는다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 바라봐요.",
        "title": "옆자리의 시선"
      }
    ],
    "hook": "아기를 달래고 있는데 옆자리 승객의 한숨과 시선이 느껴져요",
    "setting": "아기와 함께 탄 비행기의 좌석",
    "title": "기내의 시선"
  }
]
```
검사: 통과

## 1번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

여행 중 겪을 다른 장면도 넣어 볼게요.  
비행기에서 내린 뒤 공항 안내 데스크에서 유모차를 찾지 못해 직원에게 위치를 묻는 상황은 어때요?

유모차가 없다면 어떻게 찾고 싶은지, 직원에게 꼭 설명해야 할 사정이 있는지 알려 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품 상태와 구매 내역을 확인하며 고객의 설명을 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark hair, simple green retail uniform, calm and attentive while listening with an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "어제 이 매장에서 산 커피 머신에서 물이 새고 있다. 나는 영수증과 누수 영상을 직원에게 보여 주며 제품을 교환해 달라고 요청하려 한다. Maya는 화내지 않고 제품 상태와 구매 내역을 확인하며 내 설명을 듣는다. 영수증과 누수 영상이 교환 요청의 자료로 준비되어 있다. 실제로 교환이 가능한지와 Maya의 최종 답변은 플레이에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "커피 머신 교환"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "고장 난 커피 머신을 들고 찾아간 매장 서비스 데스크",
    "title": "새는 커피 머신"
  }
]
```
검사: 통과

## 1번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 장면들을 영어로 연습해 보고 싶은 거네요.

예를 들면 이런 상황이 있어요.

1. 집을 구하면서 집주인이나 중개인에게 조건을 묻기  
2. 카페나 마트에서 원하는 것을 설명하고 문제를 해결하기  
3. 직장이나 학교에서 처음 만난 사람과 대화하기  
4. 병원이나 약국에서 증상을 설명하기  
5. 관공서에서 서류나 체류 관련 문제를 처리하기  

가장 먼저 어떤 상황을 겪어 보고 싶으세요? 원하시면 “그냥 해외 생활에 필요한 상황들로 만들어 주세요”라고 하셔도 돼요.

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
        "role": "30대 중반의 집주인. 약속과 규정을 중요하게 여기며, 차분한 설명에는 확인할 시간을 준다."
      }
    ],
    "cover": "A woman in her mid thirties, shoulder-length dark hair, casual beige sweater and dark trousers, standing with a concerned but attentive expression and one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 집에 입주한 첫날이다. 밤이 되자 침실의 난방이 작동하지 않아 다음 날까지 추위를 견뎌야 할 수 있다. 나는 집주인 Maya에게 문제를 설명하고, 언제 수리할 수 있는지와 그때까지 사용할 수 있는 임시 방법이 있는지 물어보려 한다. 난방 장치의 상태와 수리 가능 여부, Maya가 알고 있는 사정은 대화 중에 드러나며 해결 여부는 정하지 않는다.",
        "number": 1,
        "preview": "새 집에 들어온 첫날 밤, 침실 난방이 작동하지 않아요",
        "title": "첫날 밤의 고장"
      }
    ],
    "hook": "새 집에 들어온 첫날 밤, 침실 난방이 작동하지 않아요",
    "setting": "해외에서 처음 구한 아파트",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 1번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 시선도 신경 쓰이는 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 순간에 먼저 말을 걸어 보며, 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 설명하는 장면으로 해볼까요? 상대는 화를 내기보다는 불편한 표정을 보이는 사람으로 할까요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며 불편하면 한숨을 쉬거나 짧게 쳐다보지만 화를 내지는 않는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, wearing a soft gray cardigan, tired and glancing sideways with restrained concern, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화를 내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 어떤 반응을 보이는지는 실제 대화에서 정한다.",
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

두 가지 상황을 각각 한 화로 만들어 볼게요.

1. **집주인과 수리 이야기**  
어떤 문제가 생겼고, 집주인에게 무엇을 요청하고 싶으세요? 예를 들면 누수, 난방 고장, 온수 문제처럼요. 수리가 늦어져서 곤란한 점이나 보여 줄 사진·영상이 있는지도 알려 주세요.

2. **동네 모임에서 인사하기**  
어떤 모임에서 처음 만나는 사람에게 인사하는 상황인가요? 자기소개와 함께 취미나 이사 온 이유처럼 어떤 이야기를 꺼내고 싶은지도 알려 주세요.

```json
[]
```
검사: 통과

## 1번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 실내 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요. 수리가 늦어지면 생활이 불편하다는 점도 설명할 수 있겠네요.

이제 동네 모임에서 인사하는 상황을 정해 볼까요?  
처음 참석한 모임에서 자기소개를 하고 대화를 시작하는 장면이라면, 어떤 모임인지와 상대에게 어떤 이야기를 꺼내고 싶은지 알려 주세요.

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
        "role": "40대 후반의 집주인. 수리 요청을 받으면 먼저 상황과 증거를 확인하고 비용과 일정을 신중하게 따진다."
      },
      {
        "name": "Mia",
        "position": 2,
        "role": "30대 초반의 이웃. 처음에는 조심스럽지만 상대가 편하게 말하면 자신의 주말 취미도 자연스럽게 이야기한다."
      }
    ],
    "cover": "A man in his late forties, short dark hair with a few gray strands, casual button-up shirt and dark trousers, concerned and leaning forward as if listening carefully, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 가지고 있다. 집주인 Daniel에게 자료를 보여 주며 문제를 설명하고, 이번 주 안에 수리를 진행해 달라고 부탁하려 한다. 수리가 늦어질 때의 생활 불편도 설명할 수 있지만, Daniel이 어떤 답을 하거나 실제로 언제 수리되는지는 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 집주인에게 사진과 온도 기록을 보여 줘요",
        "title": "난방 수리 요청"
      },
      {
        "cast": [
          "Mia"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Mia에게 먼저 인사하고, 주말에 무엇을 하는지 이야기하려 한다. 나는 자전거 타기를 좋아한다고 말하고 Mia의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 이미 친해졌거나 대화가 잘 풀렸다고 정하지 않고, Mia가 어떤 취미를 이야기할지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "주말 취미 인사"
      }
    ],
    "hook": "해외에서 집주인에게 난방 수리를 부탁하고 동네 이웃에게 먼저 인사해요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 1번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 가전 매장에서 겪을 다른 상황도 넣어 볼게요.  
커피 머신을 교환한 뒤, 새 제품의 사용법을 직원에게 묻는 장면은 어때요? 어떤 기능을 확인하고 싶은지 말씀해 주세요.

```json
[]
```
검사: 이전 결과 선확정

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
        "details": "첫 번째 화와 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 첫 번째 화에서 커피 머신을 교환하는 데 성공했는지는 정하지 않는다. 나는 우유 거품을 내는 법을 물어보고, 어떤 우유를 써야 하는지와 기계를 어떻게 조작해야 하는지 설명을 듣고 싶어 한다. Noah가 기억하는 첫 만남의 내용과 실제로 알려 주는 방법은 플레이에서 정한다.",
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
        "details": "다른 날, 같은 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 우유 거품을 제대로 만들고 싶어 사용 방법과 요령을 질문한다. 이 장면은 첫 번째 에피소드의 교환 결과와 무관하게 시작하며, 그 결과나 두 사람의 관계가 어떻게 되었는지는 정하지 않는다. Noah가 시범을 보이거나 어떤 방법을 알려 주는지는 실제 대화에서 정한다.",
        "number": 2,
        "preview": "다른 날 매장 체험 코너에서 우유 거품을 내는 법을 물어요",
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

에피소드는 최대 5화까지라 더 추가할 수 없어요. 기존 화를 빼거나 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 몰라 적정량과 기본적인 세척 절차를 확인하려 한다. Noah가 설명하는 내용과 내가 실제로 청소를 끝내는지는 플레이에서 정한다.",
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

고속도로에서 사고가 난 직후, 차를 안전한 곳에 세우고 상대 운전자와 정보를 교환하는 장면이네요. 서로 다치지는 않았지만 긴장된 상황에서 연락처와 보험 정보를 요청하는 순간으로 연습해 볼까요?

상대 운전자는 협조적인 편인가요, 아니면 사고 책임을 두고 따지려는 사람인가요? 그리고 본인은 경찰을 부르기보다 우선 연락처와 보험 정보부터 교환하려는 상황이 맞나요?

```json
[]
```
검사: 카드 하나 필요, 카드 앞뒤 대화 중복

## 2번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

많이 답답하셨겠어요. 이 상황에서 어떤 순간을 영어로 연습해 보고 싶으세요?

예를 들면,

- 싸운 다음 날 아내에게 먼저 말을 거는 순간
- 육아 분담이 불공평하다고 느낀 점을 설명하는 순간
- 아내의 불만을 듣고 서로 해결책을 찾는 순간
- 감정이 다시 격해지지 않게 사과하거나 대화를 이어 가는 순간

어떤 장면에 가장 가까운지 알려 주세요.

```json
[]
```
검사: 통과

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비…”로 시작하는 상황을 말씀하시려던 걸까요? 원하시는 장소나 상대, 겪고 싶은 일을 조금만 더 알려 주세요.

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
        "role": "40대 초반의 승객. 아기의 울음에 지쳐 한숨을 쉬고 쳐다보지만 소리치지는 않으며, 상대의 설명을 들으면 짧게 반응한다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with a restrained expression, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기가 계속 울고 있다. 옆자리 승객 Emma는 한숨을 쉬며 나와 아기를 쳐다보지만 소리치거나 직접 항의하지는 않는다. 나는 아기를 달래려고 애쓰고 있다는 점을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기를 달래고 있는데 옆자리 승객이 한숨을 쉬며 저희를 쳐다봐요",
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

## 2번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 에피소드를 하나 더 넣고 싶어요.

여행 중 겪을 다른 장면도 넣어 볼게요. 비행기에서 내린 뒤 수하물 찾는 곳에서 옆자리 승객을 다시 만나, 아기 때문에 불편했을 수 있다는 말을 꺼내고 상대의 여행 이야기도 묻는 상황은 어때요? 어떤 말을 해보고 싶은지 알려 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품과 구매 기록을 확인하며 고객의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder length dark brown hair, green retail shirt and beige apron, attentive and calmly concerned while leaning slightly forward, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 산 커피 머신을 가져왔는데 물이 새고 있다. 나는 영수증과 누수 장면을 촬영한 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 제품과 구매 기록을 확인하며 내 설명을 듣는다. 교환이 가능한지, 다른 절차가 필요한지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "새는 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 판매한 매장의 고객 서비스 데스크",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 2번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 마주치는 순간들을 연습해 볼 수 있어요. 예를 들면:

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 상황
- 마트에서 원하는 물건의 위치나 가격을 묻는 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 직장이나 학교에서 처음 만난 사람과 대화하는 상황
- 집에 문제가 생겨 관리인에게 수리를 요청하는 상황
- 은행이나 관공서에서 필요한 절차를 확인하는 상황

이 중에서 어떤 장면을 먼저 경험해 보고 싶으세요? 여러 상황을 원하시면 몇 화로 만들지도 함께 알려 주세요.

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
        "role": "30대 초반의 집주인. 생활 규칙과 수리 요청을 차분히 확인하며 구체적인 설명을 들으려 한다."
      }
    ],
    "cover": "A woman in her early thirties, shoulder-length dark hair, casual beige sweater and jeans, standing with a concerned but patient expression and an open posture, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 집에 입주한 첫날, 욕실의 온수가 나오지 않는다. 나는 집주인 Maya에게 문제를 설명하고 언제 수리할 수 있는지, 그동안 어떻게 해야 하는지 물어보려 한다. Maya가 바로 해결해 주거나 수리 일정을 확정했다고 정하지 않는다. 나는 집의 위치와 문제 상황을 알고 있지만 별도의 사진이나 계약서 내용은 주어지지 않은 상태에서 대화를 시작한다.",
        "number": 1,
        "preview": "새로 이사한 집의 욕실에서 온수가 나오지 않아 집주인에게 연락해요",
        "title": "온수가 안 나오는 집"
      }
    ],
    "hook": "새로 이사한 집의 욕실에서 온수가 나오지 않아요",
    "setting": "해외에서 막 이사한 아파트",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 2번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 가운데 먼저 말을 꺼내는 순간으로 연습해 볼까요?

상대는 화를 내기보다는 불편한 표정을 짓고 있고, 사용자는 아기를 달래려고 애쓰고 있으니 조금만 이해해 달라고 말하고 싶은 상황인가요?

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 한숨을 쉬며 쳐다보지만 화를 내지는 않고 상대의 설명은 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리 승객 Emma는 화를 내거나 고함치지는 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 표정을 바꾸는지, 상황이 어떻게 풀리는지는 정하지 않는다.",
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

## 2번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 집주인에게 집 수리를 요청하는 상황과 동네 모임에서 처음 인사하는 상황이네요.

먼저 집주인과의 대화부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 요청하고 싶으세요? 예를 들면 **난방이 작동하지 않아 수리를 요청하는 상황**처럼 구체적으로 정할 수 있어요.

```json
[]
```
검사: 통과

## 2번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 집에서 사진과 온도 기록을 보여 주며, 집주인에게 이번 주 안에 수리해 달라고 요청하는 상황으로 정할게요. 집주인이 어떤 태도인지나 수리 가능 여부는 미리 정하지 않겠습니다.

이제 동네 모임 장면을 정해 볼게요. 어떤 모임에서 누구에게 처음 인사하고, 어떤 이야기를 나누고 싶으세요? 예를 들면 **새로 이사한 동네의 커뮤니티 모임에서 옆자리 사람에게 자기소개하고 동네 생활에 대해 묻는 상황**처럼 정할 수 있어요.

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
        "role": "40대 후반의 집주인. 임대 주택의 문제를 차분히 확인하지만 수리 일정은 신중하게 말한다. 사진과 기록을 보여 주면 내용을 꼼꼼히 살펴본다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 초반의 이웃. 처음 만난 사람에게 예의 바르고 주말에 하는 일을 편하게 이야기한다. 상대의 취미를 들으면 자신의 관심사도 자연스럽게 말한다."
      }
    ],
    "cover": "A man in his late forties, short graying brown hair, casual dark sweater, concerned and slightly tense, leaning forward with one hand raised as if listening carefully, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 임대해 살고 있는 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 온도 기록을 가지고 있다. Daniel에게 자료를 보여 주며 상황을 설명하고, 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 언제 수리할 수 있는지, 요청을 받아들이는지는 실제 대화에서 정한다. 문제가 이미 해결되었거나 수리 일정이 확정되었다고 가정하지 않는다.",
        "number": 1,
        "preview": "집의 난방이 고장 나서 사진과 온도 기록을 보여 주며 집주인에게 수리를 요청해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사하고 자기소개를 하려 한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 대화를 이어가려 한다. 두 사람이 이미 친해졌거나 대화가 잘 풀린다고 정하지 않는다. Maya가 어떤 취미를 이야기하는지와 대화의 결과는 실제 플레이에서 정한다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미 이야기를 꺼내요",
        "title": "동네 첫인사"
      }
    ],
    "hook": "난방이 고장 난 집에서 집주인에게 수리를 부탁하고 동네 모임에서 새 이웃에게 인사해요",
    "setting": "해외의 임대 주택과 주말 동네 커뮤니티 모임",
    "title": "해외 생활의 두 대화"
  }
]
```
검사: 통과

## 2번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

새 커피 머신을 산 뒤 겪을 수 있는 다른 장면으로, **제조사 고객센터에 전화해 보증 수리 조건과 필요한 서류를 묻는 상황**은 어때요?

교환이 됐는지와 관계없이 시작할 수 있고, 제품의 누수 문제를 설명하면서 수리나 점검 절차를 확인하는 연습을 할 수 있어요. 이 장면으로 넣을까요, 아니면 매장이나 집에서 겪는 다른 상황을 원하시나요?

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
        "details": "첫 번째 일과는 다른 날, 같은 매장에서 Noah를 다시 만난다. 나는 우유 거품을 내는 법을 물어보고, 집에서 따라 할 수 있도록 방법과 주의할 점을 설명해 달라고 하려 한다. 첫 번째 방문에서 커피 머신을 교환했는지, 교환에 성공했는지, Noah와 어떤 관계가 되었는지는 정하지 않는다. Noah가 나를 알아보는지와 우유 거품 내는 법을 어떻게 설명하는지는 실제 대화에서 정한다.",
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
        "role": "30대 매장 직원. 제품 문제를 확인하고 사용법도 차분하게 설명한다. 고객의 질문을 들은 뒤 필요한 절차나 방법을 안내한다."
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
        "details": "첫 번째 사건과 다른 날, 같은 가전 매장의 체험 코너에서 Noah에게 우유 거품을 내는 법을 묻는다. 나는 커피 머신으로 우유 거품을 제대로 만들고 싶어 사용 순서와 방법을 질문한다. 첫 번째 사건에서 교환이 되었는지, 교환되지 않았는지와 관계없이 이 체험 코너에 간다. Noah가 시범을 보이거나 내가 원하는 결과를 얻는지는 플레이에서 정한다.",
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

이미 5화라서 에피소드를 더 추가할 수 없어요. 기존 화를 빼거나 다른 상황으로 바꾸고 싶다면 말씀해 주세요.

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
        "details": "같은 매장 직원인 Noah에게 커피 머신을 청소하는 법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적정량과 기본적인 세척 방법을 설명해 달라고 하려 한다. Noah의 설명과 실제 세척 결과는 플레이에서 정한다.",
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



```json
[
  {
    "characters": [
      {
        "name": "Ethan",
        "position": 1,
        "role": "30대 후반의 운전자. 사고 직후 당황했지만 감정적으로 몰아붙이지 않고 필요한 정보를 차분히 확인하려 한다."
      }
    ],
    "cover": "A man in his late thirties, short dark hair, casual jacket over a shirt, tense and holding one hand up to pause the conversation, three-quarter view, body turned, face toward the viewer, terracotta orange background",
    "episodes": [
      {
        "cast": [
          "Ethan"
        ],
        "details": "고속도로에서 차량 사고가 난 직후 갓길이나 안전한 장소에서 Ethan과 마주한다. 나는 상대 운전자와 이름, 전화번호, 차량 정보와 보험 정보를 교환하려 한다. 사고의 책임이 누구에게 있는지나 상대가 보험 처리를 받아들였는지는 정하지 않는다. 나는 필요한 정보를 차분히 요청하고 사고 상황에 대한 기본적인 사실만 확인하려 한다. 상대의 정확한 보험 정보와 연락처를 받을 수 있는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "고속도로에서 사고가 난 뒤 상대 운전자와 필요한 정보를 주고받으려 해요",
        "title": "사고 직후"
      }
    ],
    "hook": "고속도로에서 사고가 나 상대 운전자와 필요한 정보를 교환하려 해요",
    "setting": "사고 직후 차량을 세운 고속도로 갓길",
    "title": "고속도로 사고"
  }
]
```
검사: 통과

## 3번째 육아 갈등에서 원하는 상황 함께 찾기
질문: 어제 와이프랑 육아 문제로 싸웠어

속상한 일이 있었겠어요. 그 상황을 영어로 다시 연습해 보고 싶은 거라면, 어떤 순간을 다뤄 볼까요?

예를 들면,

- 서로 감정이 올라온 뒤 차분히 대화를 다시 시작하는 순간
- 육아 분담이 불공평하다고 느낀 이유를 설명하는 순간
- 아내의 힘든 점을 듣고 앞으로의 방법을 함께 정하는 순간

어제 싸움에서 실제로 영어로 말해 보고 싶은 장면과, 꼭 전하고 싶은 뜻을 알려 주세요.

```json
[]
```
검사: 통과

## 3번째 짧게 끊긴 입력 뒤 추가 인터뷰
질문: 비

“비”라고 하신 건 **비 오는 날의 상황**을 말씀하신 걸까요?  
예를 들면 우산을 빌리거나, 비행기 지연을 문의하거나, 비 때문에 약속 장소를 바꾸는 상황처럼 구체적으로 정해 볼 수 있어요.

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
        "role": "40대 초반의 승객. 조용히 쉬고 싶어 하지만 고함치지는 않으며, 불편하면 한숨과 시선으로 반응하고 상대의 설명은 들어 본다."
      }
    ],
    "cover": "A woman in her early forties, shoulder-length brown hair, soft gray sweater, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 아기가 계속 운다. 옆자리 승객 Emma는 고함치거나 화내지 않고 한숨을 쉬며 아기와 나를 쳐다본다. 나는 아기를 진정시키려고 애쓰고 있다는 것을 설명하고, 조금만 이해해 달라고 부탁하려 한다. Emma가 어떻게 반응하거나 이해하는지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저와 아기를 쳐다봐요",
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

여행 중 겪을 다른 장면도 넣어 볼게요.  
**비행기에서 내린 뒤 수하물 찾는 곳에서 아기를 안고 있는데, 수하물이 나오지 않아 직원에게 상황을 설명하고 도움을 요청하는 장면**은 어때요?

수하물이 실제로 분실됐는지, 직원이 바로 해결해 주는지는 정하지 않고 대화로 풀어 볼 수 있어요. 이 장면을 연습하고 싶다면, 직원에게 어떤 도움을 요청하고 싶은지 알려 주세요.

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
        "role": "20대 후반의 매장 직원. 차분하게 제품과 구매 기록을 확인하며 고객의 설명을 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her late twenties, shoulder-length dark brown hair, green retail uniform, calm and attentive with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Mia"
        ],
        "details": "매장에서 어제 구입한 커피 머신을 가져온다. 집에서 사용하던 중 물이 새는 문제가 생겼고, 나는 영수증과 누수 영상을 보여 주며 제품을 교환해 달라고 요청하려 한다. Mia는 화내지 않고 차분하게 제품과 구매 기록을 확인하며 내 설명을 듣는다. 교환이 가능한지, 추가 확인이나 다른 해결 방법이 필요한지는 실제 대화에서 정한다.",
        "number": 1,
        "preview": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
        "title": "누수된 커피 머신"
      }
    ],
    "hook": "어제 산 커피 머신에서 물이 새서 영수증과 영상을 들고 매장에 찾아가요",
    "setting": "커피 머신을 구입한 전자제품 매장",
    "title": "커피 머신 교환"
  }
]
```
검사: 통과

## 3번째 모호한 첫 말과 그냥 만들기
질문: 해외 생활을 연습하고 싶어요.

해외에서 생활하며 자주 겪는 순간들을 영어로 연습해 보고 싶으시군요. 예를 들면 이런 장면이 있어요.

- 집을 구하면서 집주인이나 중개인에게 조건을 묻는 상황
- 동네 마트에서 원하는 물건의 위치나 가격을 묻는 상황
- 병원이나 약국에서 증상을 설명하는 상황
- 직장이나 학교에서 처음 만난 사람과 대화하는 상황
- 식당에서 주문이 잘못 나와 정중하게 설명하는 상황
- 공공기관에서 서류나 절차를 문의하는 상황

이 중에서 가장 먼저 연습하고 싶은 상황이 있나요? 직접 겪을 예정인 장면을 말씀해 주셔도 좋아요.

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
        "role": "30대 후반의 집주인. 세입자의 설명을 차분히 듣지만 수리 요청에는 구체적인 정보를 확인한다."
      }
    ],
    "cover": "A woman in her late thirties, shoulder-length dark hair, casual knit sweater and jeans, concerned and listening carefully with one hand slightly raised, three-quarter view, body turned, face toward the viewer, teal background",
    "episodes": [
      {
        "cast": [
          "Maya"
        ],
        "details": "해외에서 새로 구한 집에 입주한 뒤 욕실의 온수가 나오지 않는다. 나는 집주인 Maya에게 문제를 설명하고 언제 수리할 수 있는지, 그동안 어떻게 해야 하는지 물어보려 한다. Maya는 문제의 상태와 발생 시점을 확인할 수 있으며, 나는 집을 망가뜨렸다는 오해를 피하고 싶다. 실제로 수리가 언제 이루어지거나 Maya가 어떤 해결책을 제시하는지는 정하지 않는다.",
        "number": 1,
        "preview": "새 집 욕실에서 온수가 나오지 않아 집주인에게 설명해야 해요.",
        "title": "온수가 안 나와요"
      }
    ],
    "hook": "새 집 욕실에서 온수가 나오지 않아 집주인에게 설명해야 해요",
    "setting": "해외에서 막 이사한 아파트",
    "title": "해외 생활 첫날"
  }
]
```
검사: 통과

## 3번째 비행기 회귀
질문: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.

아기를 달래면서 주변 승객의 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 쳐다보거나 한숨을 쉬는 가운데, 먼저 말을 걸어 양해를 구하는 순간으로 해볼까요? 혹시 상대가 화를 내기보다는 불편한 표정만 짓는 상황을 원하시나요?

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
        "role": "40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여기며, 불편하면 한숨을 쉬거나 짧게 말하지만 상대의 설명은 끝까지 듣는다."
      }
    ],
    "cover": "A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways with a restrained sigh, close-up, head tilted, deep navy background",
    "episodes": [
      {
        "cast": [
          "Emma"
        ],
        "details": "비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. 옆자리의 Emma는 화내거나 고함치지 않고 한숨을 쉬며 계속 쳐다본다. 나는 아기를 달래려고 애쓰고 있다는 것과 상황이 쉽지 않다는 점을 설명한 뒤, 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지, 대화가 어떻게 이어지는지는 플레이에서 정한다.",
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

## 3번째 서로 다른 두 상황
질문: 해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.

해외에서 생활하며 자주 마주칠 수 있는 두 장면이네요.

먼저 **집주인에게 수리를 요청하는 상황**부터 정해 볼게요. 어떤 문제가 생겼고, 집주인에게 무엇을 부탁하고 싶으세요?  
예를 들면 **온수가 나오지 않아서 수리를 요청하는 상황**이나 **창문이 제대로 닫히지 않아 고쳐 달라고 말하는 상황**처럼 구체화할 수 있어요.

```json
[]
```
검사: 통과

## 3번째 서로 다른 두 상황
질문: 집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.

난방이 고장 난 상태에서 사진과 실내 온도 기록을 보여 주며, 집주인에게 **이번 주 안에 수리해 달라고 요청하는 상황**으로 정할게요. 수리 일정이 실제로 잡히는지는 대화에서 결정되도록 열어 두겠습니다.

이제 **동네 모임에서 인사하는 상황**을 정해 볼까요?  
처음 참석한 모임에서 자기소개를 하고 대화를 시작하려는 장면인가요, 아니면 이미 몇 번 본 이웃에게 먼저 말을 거는 장면인가요? 대화에서 이루고 싶은 것도 함께 알려 주세요.

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
        "role": "50대 초반의 집주인. 집 상태와 수리 비용을 신중하게 확인하며 구체적인 자료를 보여 주면 차분히 대응한다."
      },
      {
        "name": "Maya",
        "position": 2,
        "role": "30대 중반의 이웃. 처음 만난 사람에게 예의 바르게 인사하고 주말 취미에 관심을 보이며 대화를 이어 간다."
      }
    ],
    "cover": "A man in his early fifties, short graying hair, casual sweater and trousers, concerned and listening with a reserved posture, three-quarter view, body turned, face toward the viewer, forest green background",
    "episodes": [
      {
        "cast": [
          "Daniel"
        ],
        "details": "해외에서 빌린 집의 난방이 고장 나 실내가 춥다. 나는 난방 문제를 찍은 사진과 실내 온도 기록을 가지고 있으며, 집주인 Daniel에게 이 자료를 보여 주면서 이번 주 안에 수리해 달라고 부탁하려 한다. Daniel이 수리 요청을 받아들이거나 일정을 정하는지는 미리 정하지 않는다.",
        "number": 1,
        "preview": "난방이 고장 난 집에서 사진과 온도 기록을 보여 주며 집주인에게 수리를 부탁해요",
        "title": "난방 수리"
      },
      {
        "cast": [
          "Maya"
        ],
        "details": "동네 모임에서 처음 만난 이웃 Maya에게 먼저 인사한다. 나는 주말에 자전거 타기를 좋아한다고 말하고, Maya의 주말 취미도 물으며 대화를 이어 가려 한다. Maya가 어떤 취미를 말하거나 두 사람이 가까워지는지는 미리 정하지 않는다.",
        "number": 2,
        "preview": "동네 모임에서 처음 만난 이웃에게 인사하고 주말 취미를 이야기해요",
        "title": "주말 취미"
      }
    ],
    "hook": "해외에서 집주인에게 고장 난 난방을 설명하고 동네 이웃에게 먼저 인사해요",
    "setting": "해외의 임대 주택과 동네 주민 모임",
    "title": "해외 생활의 첫 대화"
  }
]
```
검사: 통과

## 3번째 추가 의사 뒤 합의
질문: 에피소드를 하나 더 넣고 싶어요.

같은 매장에서 겪을 수 있는 다른 상황도 넣어 볼게요. 교환이 가능하지 않을 때를 대비해, 직원에게 수리나 환불 같은 다른 방법을 문의하는 장면은 어때요? 원하시는 상황이나 목표가 있으면 말씀해 주세요.

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
        "details": "첫 번째 에피소드와 다른 날, 같은 가전 매장에서 Noah를 다시 만난다. 첫 번째 에피소드에서 교환이 성공했는지 여부는 정하지 않는다. 나는 우유 거품을 내는 방법을 물어보고, 어떤 우유를 써야 하는지와 기계를 어떻게 사용하는지 설명을 듣고 싶다. Noah가 나를 기억하는지, 어떤 방법을 알려 주는지는 실제 대화에서 정한다.",
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
        "details": "첫 번째 방문의 교환 결과와 관계없이, 다른 날 같은 매장의 체험 코너에 간다. 나는 우유 거품을 내는 법을 배우고 싶어서 Noah에게 사용 순서와 거품을 만드는 방법을 묻는다. 체험 코너에서 어떤 기계와 우유를 쓰는지는 대화 중 확인할 수 있으며, Noah가 설명을 잘 이해했는지나 거품이 원하는 대로 만들어지는지는 미리 정하지 않는다.",
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
        "preview": "어제 산 커피 머신에서 물이 새서 환불하고 싶어요",
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

## 3번째 상한과 삭제 뒤 재추가
질문: 에피소드를 하나 더 넣고 싶어요.

이미 5화라서 에피소드를 더 추가할 수 없어요. 기존 화를 빼거나 바꾸고 싶은 부분이 있으면 말씀해 주세요.

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
        "details": "같은 매장 직원 Noah에게 커피 머신을 청소하는 방법을 묻는다. 세척제를 얼마나 넣어야 할지 모르겠어서 적절한 양과 사용 방법을 확인하려 한다. 청소가 제대로 되었는지나 Noah가 어떤 방법을 안내할지는 플레이에서 정한다.",
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
