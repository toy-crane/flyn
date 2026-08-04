import { render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui/swift-ui", () =>
  require("../../test-support/expo-ui").swiftUiMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);
jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, null, href),
  };
});
jest.mock("../../lib/use-profile", () => ({ useProfile: jest.fn() }));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useProfile } from "../../lib/use-profile";
import OnboardingIndexScreen from "./index";

const mockUseProfile = useProfile as jest.Mock;

it("닉네임이 없으면 닉네임 단계로 보낸다", async () => {
  mockUseProfile.mockReturnValue({
    data: { display_name: null, username: null },
  });

  await render(<OnboardingIndexScreen />);

  expect(screen.getByText("/onboarding/nickname")).toBeTruthy();
});

it("닉네임은 있고 아이디가 없으면 아이디 단계로 보낸다", async () => {
  mockUseProfile.mockReturnValue({
    data: { display_name: "한울", username: null },
  });

  await render(<OnboardingIndexScreen />);

  expect(screen.getByText("/onboarding/username")).toBeTruthy();
});
