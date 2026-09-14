import { expect, jest, test } from "@jest/globals";
import {
  act,
  fireEvent,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { Button } from "./button";

/** 줄 밖으로 떼어 놓는 절대 위치. */
const DETACHED_SLOT = /absolute|right-full/;
/** 호출 지점에서 HeroUI의 크기와 여백을 덮는 클래스. */
const SIZE_OVERRIDE = /!|\b(h|px|py|min-h)-/;

test("진행 중에도 원래 이름을 유지하고 다시 누를 수 없게 한다", async () => {
  const onPress = jest.fn();

  await renderWithHeroUI(
    <Button isPending onPress={onPress}>
      저장하기
    </Button>
  );

  const button = screen.getByRole("button", { name: "저장하기" });

  expect(button).toHaveTextContent("저장하기");
  expect(button).toBeBusy();
  expect(button).toBeDisabled();
  expect(screen.queryByRole("progressbar")).not.toBeOnTheScreen();

  await userEvent.setup().press(button);

  expect(onPress).not.toHaveBeenCalled();
});

test("진행 중에는 앞쪽 내용을 스피너로 바꾼다", async () => {
  await renderWithHeroUI(
    <Button isPending startContent={<View testID="action-icon" />}>
      업로드하기
    </Button>
  );

  expect(screen.queryByTestId("action-icon")).not.toBeOnTheScreen();
  expect(screen.getByText("업로드하기")).toBeOnTheScreen();
});

test("진행 표시와 앞 아이콘은 문구 앞의 같은 줄에 선다", async () => {
  const view = await renderWithHeroUI(
    <Button startContent={<View testID="action-icon" />}>업로드하기</Button>
  );

  const rowOf = () => {
    const leading = screen.getByTestId("button-leading-content", {
      includeHiddenElements: true,
    });
    const tree = JSON.stringify(screen.toJSON());

    // 문구 앞의 같은 줄이다. 줄 밖으로 떼어 놓는 절대 위치를 쓰지 않고 HeroUI가
    // 준 줄과 간격을 쓴다.
    expect(tree.indexOf("button-leading-content")).toBeLessThan(
      tree.indexOf("업로드하기")
    );
    expect(leading.props.className ?? "").not.toMatch(DETACHED_SLOT);

    return leading;
  };

  expect(
    within(rowOf()).getByTestId("action-icon", { includeHiddenElements: true })
  ).toBeOnTheScreen();

  await view.rerender(
    <Button isPending startContent={<View testID="action-icon" />}>
      업로드하기
    </Button>
  );

  expect(
    within(rowOf()).queryByTestId("action-icon", {
      includeHiddenElements: true,
    })
  ).not.toBeOnTheScreen();
});

test("내용 너비 버튼도 진행 중에 문구 폭을 지켜 줄바꿈하지 않는다", async () => {
  const view = await renderWithHeroUI(<Button>다시 시도하기</Button>);

  await act(() => {
    fireEvent(screen.getByRole("button"), "layout", {
      nativeEvent: { layout: { height: 48, width: 129, x: 0, y: 0 } },
    });
    fireEvent(screen.getByText("다시 시도하기"), "layout", {
      nativeEvent: { layout: { height: 24, width: 97, x: 16, y: 12 } },
    });
  });

  await view.rerender(<Button isPending>다시 시도하기</Button>);

  // 버튼 폭은 그대로 두고, 진행 표시가 들어온 만큼 문구가 좁아지지 않게 한다.
  expect(
    StyleSheet.flatten(screen.getByRole("button").props.style)
  ).toMatchObject({ height: 48, width: 129 });
  expect(
    StyleSheet.flatten(screen.getByText("다시 시도하기").props.style)
  ).toMatchObject({ flexShrink: 0, width: 97 });

  await view.rerender(<Button>다시 시도하기</Button>);

  expect(
    StyleSheet.flatten(screen.getByText("다시 시도하기").props.style) ?? {}
  ).not.toHaveProperty("width");
});

test("앞 내용이 없으면 줄에 빈 자리를 두지 않는다", async () => {
  await renderWithHeroUI(<Button>저장하기</Button>);

  // 빈 자리도 HeroUI 줄의 간격을 차지해서 문구가 가운데에서 밀린다.
  expect(
    screen.queryByTestId("button-leading-content", {
      includeHiddenElements: true,
    })
  ).not.toBeOnTheScreen();
});

test("기본 너비를 정하지 않고 사용처가 준 너비를 따른다", async () => {
  const view = await renderWithHeroUI(<Button>내용만큼</Button>);

  expect(
    StyleSheet.flatten(screen.getByRole("button").props.style)
  ).not.toHaveProperty("width");

  await view.rerender(<Button style={{ width: "100%" }}>가득 채우기</Button>);

  expect(
    StyleSheet.flatten(screen.getByRole("button").props.style)
  ).toMatchObject({ width: "100%" });
});

test("진행 중에는 작업을 시작하기 전의 실제 크기를 유지한다", async () => {
  const view = await renderWithHeroUI(<Button>내용만큼</Button>);
  const button = screen.getByRole("button");

  await act(() => {
    fireEvent(button, "layout", {
      nativeEvent: { layout: { height: 48, width: 104, x: 0, y: 0 } },
    });
  });

  await view.rerender(<Button isPending>내용만큼</Button>);

  const pendingButton = screen.getByRole("button");

  expect(StyleSheet.flatten(pendingButton.props.style)).toMatchObject({
    height: 48,
    width: 104,
  });
});

test("처음부터 진행 중이면 측정 전까지 내용에 맞춘 높이를 유지한다", async () => {
  await renderWithHeroUI(<Button isPending>내용만큼</Button>);

  const button = screen.getByRole("button");

  expect(StyleSheet.flatten(button.props.style)).not.toHaveProperty("height");
});

test("진행 단계의 문구가 바뀌면 이전 문구의 높이에 가두지 않는다", async () => {
  const view = await renderWithHeroUI(<Button>스토리 만들기</Button>);
  await act(() => {
    fireEvent(screen.getByRole("button"), "layout", {
      nativeEvent: { layout: { height: 48, width: 300, x: 0, y: 0 } },
    });
  });

  await view.rerender(<Button isPending>대본을 쓰고 있어요</Button>);

  const button = screen.getByRole("button", { name: "대본을 쓰고 있어요" });
  expect(StyleSheet.flatten(button.props.style)).not.toHaveProperty("height");
  expect(button).toBeBusy();
  expect(button).toBeDisabled();
});

test.each(["sm", "md", "lg"] as const)(
  "%s 버튼은 글자 크기를 제한하지 않고 HeroUI의 크기와 여백을 그대로 쓴다",
  async (size) => {
    await renderWithHeroUI(<Button size={size}>인증 코드 받기</Button>);

    const label = screen.getByText("인증 코드 받기");
    const button = screen.getByRole("button");

    expect(label.props.maxFontSizeMultiplier).toBeUndefined();
    expect(label.props.adjustsFontSizeToFit).toBeUndefined();
    expect(label.props.numberOfLines).toBeUndefined();
    expect(button.props.className).toContain(`button__root--size-${size}`);
    // 큰 글자에서 자라는 높이는 global.css의 재정의 하나가 맡는다. 호출
    // 지점에서 `!`로 HeroUI 클래스를 덮지 않는다.
    expect(button.props.className).not.toMatch(SIZE_OVERRIDE);
    expect(StyleSheet.flatten(button.props.style)).not.toHaveProperty(
      "paddingHorizontal"
    );
  }
);
