import type { AnswerScope } from "../answer-checks";

/**
 * 2026-09-10에 `openai/gpt-5.6-luna`에서 실제로 받은 답이다.
 *
 * 원문과 그때의 질문은 스펙 폴더의 `sample-answers.md`에 있다. 검사가 무엇을
 * 가르는지는 통과하는 답만으로는 알 수 없으므로, 고치기 전 프롬프트의 답을
 * 대조군으로 함께 둔다.
 */
export interface SampleAnswer {
  answer: string;
  question: string;
  scope: AnswerScope;
}

/** 고치기 전 프롬프트의 답. 하나도 통과하지 못해야 검사가 가르는 것이다. */
export const PREVIOUS_PROMPT_ANSWERS: SampleAnswer[] = [
  {
    answer:
      "지금 받은 특정한 커피가 잘못된 것이라서 **the wrong coffee**라고 해요. **the**는 말하는 사람과 듣는 사람이 어떤 커피인지 알 수 있을 때 붙입니다. 여기서는 “내가 주문한 것과 다른, 방금 받은 그 커피”를 가리키므로 **I think this is the wrong coffee.**가 자연스러워요.",
    question: "the를 왜 붙여요?",
    scope: "correction",
  },
  {
    answer:
      "여기서는 이미 주문한 일을 말하므로 **ordered**를 써야 하고, **order**는 현재의 습관이나 지금 하는 일을 말할 때 써요.\n예를 들어 “아까 아이스 아메리카노를 주문했어요”는 **I ordered an iced americano.**이고, “저는 아이스 아메리카노를 주문해요”처럼 평소 습관을 말하면 **I order iced americanos.**라고 할 수 있어요.\n따라서 지금 상황에서는 **I ordered an iced americano.**가 맞습니다.",
    question: "ordered랑 order 차이가 뭐예요? 그냥 order 쓰면 안 돼요?",
    scope: "correction",
  },
  {
    answer:
      "네, 영어로는 보통 “an iced Americano”가 맞아요. 한국에서 쓰는 “아이스 아메리카노”의 ‘아이스’는 영어에서 음료를 꾸미는 형용사 iced로 씁니다. 그래서 “ice Americano”보다는 “an iced Americano”라고 말해요.",
    question:
      "iced americano가 맞아요? 한국에서는 다 아이스 아메리카노라고 하는데",
    scope: "correction",
  },
  {
    answer:
      "`the`는 듣는 사람도 어떤 것인지 알 수 있는 특정한 것을 말할 때, `a/an`은 여러 개 중 하나를 처음 말할 때 써요. 그래서 지금 받은 특정한 커피는 `the wrong coffee`이고, 아메리카노 한 잔을 주문했다는 뜻은 `an iced americano`예요. `a`와 `an`은 뜻은 같고, 뒤의 소리가 모음이면 `an`을 씁니다.",
    question: "관사는 언제 the 쓰고 언제 a 써요? 맨날 헷갈려요",
    scope: "correction",
  },
  {
    answer:
      "지금 받은 특정 커피가 잘못 나온 것을 가리키기 때문에 **the**를 붙여 **the wrong coffee**라고 해요. 여기서 **the**는 “내가 받은 그 커피”처럼 서로 어떤 커피인지 알 수 있다는 뜻입니다. 그래서 **I think this is the wrong coffee.**가 자연스러워요.",
    question: "the를 왜 붙여요?",
    scope: "correction",
  },
  {
    answer:
      "커피 두 잔이 잘못 나왔다면 **I think these are the wrong coffees.**라고 해요. 두 잔을 가리키므로 **this is**가 아니라 **these are**, **coffee**는 복수형 **coffees**가 됩니다. 두 커피가 특정되어 있으므로 **the**는 그대로 붙여요.",
    question: "그럼 이번엔 커피가 두 잔 잘못 나왔으면 뭐라고 해요?",
    scope: "correction",
  },
];

/** 확정한 프롬프트의 답. 세 갈래가 모두 들어 있다. */
export const CURRENT_PROMPT_ANSWERS: SampleAnswer[] = [
  {
    answer:
      "여기서는 지금 받은 특정한 커피를 가리키니까 the를 붙여요. 그래서 the wrong coffee는 “그 잘못 나온 커피”라는 뜻이에요.\n\nwrong coffee만 쓰면 어떤 커피가 잘못됐는지 가리키는 느낌이 약해서 이 상황에는 어색해요. 같은 방식으로 the wrong order는 “그 잘못된 주문”이라고 해요.",
    question: "the를 왜 붙여요?",
    scope: "correction",
  },
  {
    answer:
      "여기서는 이미 주문한 일이니까 I ordered가 맞아요. order는 지금 주문하거나 평소에 주문한다는 느낌이라, 이미 주문한 음료가 잘못 나왔다는 상황에는 어울리지 않아요.\n\nI ordered an iced americano.\n\n지금 주문하는 중이라면 I’d like to order an iced americano처럼 말할 수 있어요.",
    question: "ordered랑 order 차이가 뭐예요? 그냥 order 쓰면 안 돼요?",
    scope: "correction",
  },
  {
    answer:
      "네, 영어로는 iced americano가 맞아요. iced는 얼음을 넣은 음료라는 뜻의 표현이고, ice americano는 한국식 표현에 가까워요.\n\n한 잔을 말하니까 보통 an iced americano라고 해요. 여기서는 대문자로 An Iced Americano라고 써도 되지만, 문장 안에서는 an iced americano처럼 써요.",
    question:
      "iced americano가 맞아요? 한국에서는 다 아이스 아메리카노라고 하는데",
    scope: "correction",
  },
  {
    answer:
      "the는 서로 어떤 것을 가리키는지 알고 있는 특정한 것에 쓰고, a/an은 여러 개 중 하나를 처음 말할 때 써요.\n\n지금 받은 잘못 나온 커피를 가리키므로 the wrong coffee라고 하고, 아메리카노 한 잔을 주문한다는 뜻이므로 an iced americano라고 해요.\n\n모음 소리 앞에서는 a가 아니라 an을 써요. 그래서 iced americano 앞에는 an이 와요.",
    question: "관사는 언제 the 쓰고 언제 a 써요? 맨날 헷갈려요",
    scope: "correction",
  },
  {
    answer:
      "커피 두 잔을 가리키면 the wrong coffees라고 할 수 있어요. 여기서 the는 두 잔 모두를 가리키고, coffees는 커피 두 잔이라는 뜻이에요.\n\nI ordered two iced Americanos, but these are the wrong coffees.\n\n더 자연스럽게는 잔을 세어서 these are the wrong drinks라고도 해요.",
    question: "그럼 이번엔 커피가 두 잔 잘못 나왔으면 뭐라고 해요?",
    scope: "correction",
  },
  {
    answer:
      "Mia에게 환불을 요청하려면 이렇게 말하면 돼요.\n\nCould I get a refund, please?\n\n정중하게 환불해 달라고 하는 말이라, 이 문장으로 대화를 이어 가면 돼요.",
    question: "Mia한테 환불해 달라고 하려면 뭐라고 해요?",
    scope: "nextLine",
  },
  {
    answer:
      "가정법 과거는 지금 장면의 주문 문장과는 다른 문법이에요. 지금은 잘못 나온 커피를 말하고 주문 내용을 바로잡으면 되니까, 이렇게 말하면 돼요.\n\nI think this is the wrong coffee. I ordered an iced americano.",
    question: "가정법 과거는 언제 써요?",
    scope: "offTopic",
  },
  {
    answer:
      "결말은 여기서 정해져 있지 않아요. 지금은 Mia가 주문을 확인하는 장면이라, 아래처럼 바꿔 달라고 말하면 돼요.\n\nCould you change it to an iced americano, please?",
    question: "이 이야기 결말이 뭐예요? Mia가 바꿔 줘요?",
    scope: "offTopic",
  },
  {
    answer:
      "저녁 메뉴보다, 지금은 카페에서 주문이 잘못 나온 장면으로 돌아가면 돼요. 주문을 확인해 달라고 이렇게 말할 수 있어요.\n\nCould you check my order, please?",
    question: "오늘 저녁 뭐 먹을까요?",
    scope: "offTopic",
  },
  {
    answer:
      "지금은 카페에서 주문이 잘못 나온 상황에 집중하면 돼요. 직원이 주문을 확인하고 있으니, 원하는 음료를 다시 말하면 돼요.\n\nI ordered an iced americano, not a latte.",
    question: "너는 누구야? ChatGPT야?",
    scope: "offTopic",
  },
  {
    answer:
      "지금 장면에서는 주문한 커피가 잘못 나왔다고 말하면 돼요. 직원에게 이렇게 말하고 대화를 이어 가면 돼요.\n\nI think this is the wrong coffee.",
    question: "그럼 will이랑 be going to 차이는요?",
    scope: "offTopic",
  },
  {
    answer:
      "네, got 말고도 말할 수 있지만 이 상황에서는 got이 가장 자연스러워요.\n\nI was given a latte.\n\n이렇게 말하면 라떼를 받았다는 뜻이고, They gave me a latte라고 하면 누군가 라떼를 줬다는 뜻이 더 분명해져요.",
    question: "got 말고 다른 말은 없어요?",
    scope: "correction",
  },
  {
    answer:
      "Could you please change it to an iced Americano?\n\n이렇게 말하면 라떼를 아이스 아메리카노로 바꿔 달라는 뜻이에요. 이 말로 대화를 이어 가면 돼요.",
    question: "바꿔 달라고 하고 싶은데 뭐라고 해요?",
    scope: "nextLine",
  },
  {
    answer:
      "가정법 과거가 궁금할 수 있지만, 지금은 주문한 음료가 잘못 나온 상황이에요. 직원에게 바로잡아 달라고 하려면 이렇게 말하면 돼요.\n\nCould you please change it to an iced americano?",
    question: "가정법 과거는 언제 써요?",
    scope: "offTopic",
  },
];
