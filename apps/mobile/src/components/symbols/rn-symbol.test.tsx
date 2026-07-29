import { render, screen } from "@testing-library/react-native";

jest.mock("expo-symbols", () => {
  const ReactRuntime = require("react");
  const { View } = require("react-native");

  return {
    SymbolView: ({
      name,
      size,
      tintColor,
      weight,
    }: {
      name: string;
      size: number;
      tintColor: string;
      weight: string;
    }) =>
      ReactRuntime.createElement(View, {
        accessibilityLabel: name,
        size,
        tintColor,
        weight,
      }),
  };
});

import { RNSymbol } from "./rn-symbol";

it("RN disclosure 심볼을 같은 SF Symbol 표현으로 그린다", async () => {
  await render(<RNSymbol color="#686868" symbol="disclosure" />);

  const symbol = screen.getByLabelText("chevron.right");

  expect(symbol.props).toMatchObject({
    size: 14,
    tintColor: "#686868",
    weight: "medium",
  });
});
