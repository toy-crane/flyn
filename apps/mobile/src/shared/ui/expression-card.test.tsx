import { beforeEach, expect, jest, test } from "@jest/globals";
import {
  act,
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";
import { AccessibilityInfo, Text } from "react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { isTap } from "./expandable-card";
import { ExpressionCard } from "./expression-card";
import { IconRow, IconRowButton } from "./icon-row";

beforeEach(() => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
});

/**
 * 카드 뿌리의 HeroUI `Accordion`이 받은 속성.
 *
 * 화면에 그려진 것만으로는 애니메이션 설정이 보이지 않는다. 테스트 공급자가 이미
 * 모든 애니메이션을 끄므로, 카드가 넘긴 값을 컴포넌트 트리에서 직접 읽는다.
 */
function accordionRootProps(testID: string): Record<string, unknown> {
  let fiber = screen.getByTestId(testID).unstable_fiber;

  while (fiber) {
    if (fiber.type?.displayName === "HeroUINative.Accordion.Root") {
      return fiber.memoizedProps;
    }
    fiber = fiber.return;
  }

  throw new Error(`${testID} 위에 Accordion이 없다`);
}

const UTTERANCE = {
  english: "Next in line, please!",
  header: <Text>우리 동네 카페 · 1화</Text>,
  headerLabel: "우리 동네 카페 · 1화",
  markClassName: "",
  marks: [],
  meaning: "다음 분이요!",
  testID: "card",
};

const CORRECTION = {
  detail: {
    original: "I order a hot americano.",
    originalMarks: ["order"],
    whys: ["지난 일은 ordered로 말해요."],
  },
  english: "I ordered a hot americano.",
  header: <Text>우리 동네 카페 · 1화</Text>,
  headerLabel: "우리 동네 카페 · 1화",
  markClassName: "bg-learn-surface text-learn",
  marks: ["ordered"],
  meaning: "저는 뜨거운 아메리카노를 시켰어요.",
  testID: "card",
};

test("카드가 출처, 영어, 한국어 세 칸으로 선다", async () => {
  await renderWithHeroUI(<ExpressionCard {...UTTERANCE} />);

  expect(screen.getByText("우리 동네 카페 · 1화")).toBeOnTheScreen();
  expect(screen.getByTestId("card-english")).toHaveTextContent(
    "Next in line, please!"
  );
  expect(screen.getByTestId("card-meaning")).toHaveTextContent("다음 분이요!");
});

const BODY_SM_TYPE = /\btext__root--type-body-sm(\s|$)/;
const ARBITRARY_SIZE = /text-\[|leading-\[/;

test("영어 문장은 h6, 뜻은 작은 본문 역할이고 크기 클래스를 붙이지 않는다", async () => {
  await renderWithHeroUI(<ExpressionCard {...UTTERANCE} />);

  const english = screen.getByTestId("card-english").props.className;
  const meaning = screen.getByTestId("card-meaning").props.className;
  expect(english).toContain("text__root--type-h6");
  expect(meaning).toMatch(BODY_SM_TYPE);
  expect(meaning).toContain("text__root--color-muted");
  expect(`${english} ${meaning}`).not.toMatch(ARBITRARY_SIZE);
});

test("뜻이 없는 옛 항목은 한국어 줄만 빈다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} meaning={null} />);

  expect(screen.getByTestId("card-english")).toBeOnTheScreen();
  expect(screen.queryByTestId("card-meaning")).toBeNull();
});

test("펼치는 카드는 세 칸을 한 이름으로 읽는다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);

  expect(screen.getByTestId("card-body").props.accessibilityLabel).toBe(
    "우리 동네 카페 · 1화, I ordered a hot americano., 저는 뜨거운 아메리카노를 시켰어요."
  );
});

test("뜻이 빈 카드의 이름에는 한국어 줄이 빠진다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} meaning={null} />);

  expect(screen.getByTestId("card-body").props.accessibilityLabel).toBe(
    "우리 동네 카페 · 1화, I ordered a hot americano."
  );
});

/** 쉐브론은 그림이라 화면 읽기에서 숨어 있다. 숨은 것까지 훑어야 잡힌다. */
const chevron = () =>
  screen.queryByTestId("card-chevron", { includeHiddenElements: true });

test("옆으로 민 손가락은 누른 것으로 세지 않는다", () => {
  // 카드가 넓어 미는 동안에도 손가락이 카드 안에 머문다. 뗀 자리가 누른 자리에서
  // 얼마나 멀어졌는지가 민 것과 누른 것을 가른다.
  expect(isTap({ x: 330, y: 300 }, { x: 110, y: 304 })).toBe(false);
  expect(isTap({ x: 200, y: 300 }, { x: 200, y: 360 })).toBe(false);
  expect(isTap({ x: 330, y: 300 }, { x: 333, y: 302 })).toBe(true);
  expect(isTap({ x: 330, y: 300 }, { x: 330, y: 300 })).toBe(true);
});

test("펼칠 것이 없는 카드는 쉐브론이 없고 누르는 자리도 아니다", async () => {
  await renderWithHeroUI(<ExpressionCard {...UTTERANCE} />);

  expect(chevron()).toBeNull();
  expect(
    screen.getByTestId("card-body").props.accessibilityRole
  ).toBeUndefined();
  expect(screen.queryByTestId("card-detail")).toBeNull();
});

test("펼치면 내가 쓴 문장과 이렇게 쓰는 이유가 그 자리에서 열린다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);
  const body = screen.getByTestId("card-body");

  expect(chevron()).not.toBeNull();
  expect(body.props.accessibilityState).toMatchObject({ expanded: false });
  expect(screen.queryByTestId("card-detail")).toBeNull();

  await userEvent.press(body);

  expect(screen.getByText("내가 쓴 문장")).toBeOnTheScreen();
  expect(screen.getByTestId("card-original")).toHaveTextContent(
    "I order a hot americano."
  );
  expect(screen.getByText("이렇게 쓰는 이유")).toBeOnTheScreen();
  expect(screen.getByText("지난 일은 ordered로 말해요.")).toBeOnTheScreen();
  expect(
    screen.getByTestId("card-body").props.accessibilityState
  ).toMatchObject({ expanded: true });
});

test("제목 줄을 다시 누르면 접힌다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);

  await userEvent.press(screen.getByTestId("card-body"));
  await userEvent.press(screen.getByTestId("card-body"));

  expect(screen.queryByTestId("card-detail")).toBeNull();
  expect(
    screen.getByTestId("card-body").props.accessibilityState
  ).toMatchObject({ expanded: false });
});

test("옆으로 12pt 넘게 밀다 뗀 손가락은 카드를 펼치지 않는다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);
  const body = screen.getByTestId("card-body");

  // 130ms보다 짧은 누름은 React Native가 `pressOut`을 누름 뒤로 미룬다. 실제
  // 빠른 밀기의 순서대로 누르기 시작과 누름만 보낸다.
  await fireEvent(body, "pressIn", {
    nativeEvent: { pageX: 330, pageY: 300 },
  });
  await fireEvent.press(body, { nativeEvent: { pageX: 110, pageY: 304 } });

  expect(screen.queryByTestId("card-detail")).toBeNull();
  expect(
    screen.getByTestId("card-body").props.accessibilityState
  ).toMatchObject({ expanded: false });

  await fireEvent(body, "pressIn", {
    nativeEvent: { pageX: 330, pageY: 300 },
  });
  await fireEvent.press(body, { nativeEvent: { pageX: 333, pageY: 302 } });

  expect(screen.getByTestId("card-detail")).toBeOnTheScreen();
});

// 화면 읽기의 두 번 탭은 누르기 시작과 끝 없이 누름만 보낸다.
test("손가락 위치 없이 온 누름은 카드를 펼친다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);

  await fireEvent.press(screen.getByTestId("card-body"));

  expect(screen.getByTestId("card-detail")).toBeOnTheScreen();
});

test("펼치는 카드는 카드마다 하나인 HeroUI Accordion 표면 변형이다", async () => {
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);

  expect(screen.getByTestId("card").props.className).toContain(
    "accordion__root-container--variant-surface"
  );
  expect(accordionRootProps("card")).toMatchObject({
    isCollapsible: true,
    selectionMode: "single",
    variant: "surface",
  });
  expect(
    screen.getByRole("button", {
      name: "우리 동네 카페 · 1화, I ordered a hot americano., 저는 뜨거운 아메리카노를 시켰어요.",
    })
  ).toBe(screen.getByTestId("card-body"));
});

test("동작 줄이기가 켜져 있으면 펼침 애니메이션을 끈다", async () => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
  await renderWithHeroUI(<ExpressionCard {...CORRECTION} />);
  await act(async () => {
    await Promise.resolve();
  });

  expect(accordionRootProps("card").animation).toBe("disable-all");
});

test("펼치지 않는 인물 대사 카드는 HeroUI Card다", async () => {
  await renderWithHeroUI(<ExpressionCard {...UTTERANCE} />);

  const card = screen.getByTestId("card").props.className;
  expect(card).toContain("surface__root");
  expect(card).not.toContain("accordion__root-container");
});

test("아이콘을 눌러도 카드가 함께 펼쳐지지 않는다", async () => {
  const press = jest.fn();
  await renderWithHeroUI(
    <ExpressionCard
      {...CORRECTION}
      actions={
        <IconRow align="end">
          <IconRowButton label="삭제" onPress={press}>
            <Text>휴지통</Text>
          </IconRowButton>
        </IconRow>
      }
    />
  );

  await userEvent.press(screen.getByLabelText("삭제"));

  expect(press).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId("card-detail")).toBeNull();
  expect(
    screen.getByTestId("card-body").props.accessibilityState
  ).toMatchObject({ expanded: false });
});
