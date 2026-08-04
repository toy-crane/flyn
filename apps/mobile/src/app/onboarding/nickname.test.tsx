import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("../../lib/auth/name-candidate", () => ({
  fetchNameCandidate: jest.fn(),
}));
jest.mock("../../lib/use-profile", () => ({
  useSaveDisplayName: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "user-1" }));

import { useRouter } from "expo-router";
import { fetchNameCandidate } from "../../lib/auth/name-candidate";
import { useSaveDisplayName } from "../../lib/use-profile";
import NicknameOnboardingScreen from "./nickname";

const mockFetchCandidate = fetchNameCandidate as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSave = useSaveDisplayName as jest.Mock;
const mutate = jest.fn();
const push = jest.fn();
const OTHER_PEOPLE = /다른 사람에게/;
const LATER_IN_SETTINGS = /나중에 설정/;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchCandidate.mockResolvedValue("김한울");
  mockUseRouter.mockReturnValue({ push });
  mockUseSave.mockReturnValue({ isPending: false, mutate });
});

async function renderScreen() {
  await render(<NicknameOnboardingScreen />);
  await screen.findByLabelText("닉네임");
}

it("설명 문단 없이 닉네임 필드·규칙·다음 행동만 보여준다", async () => {
  await renderScreen();

  expect(screen.getByText("닉네임")).toBeTruthy();
  expect(
    screen.getByText("1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.")
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "아이디 정하기" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "로그아웃" })).toBeNull();
  expect(screen.queryByText(OTHER_PEOPLE)).toBeNull();
  expect(screen.queryByText(LATER_IN_SETTINGS)).toBeNull();
});

it("provider 이름을 미리 채우되 자동 저장하지 않는다", async () => {
  await renderScreen();

  expect(screen.getByLabelText("닉네임").props.value).toBe("김한울");
  expect(mutate).not.toHaveBeenCalled();
});

it("닉네임 저장이 성공하면 아이디 단계로 push한다", async () => {
  await renderScreen();
  await fireEvent.changeText(screen.getByLabelText("닉네임"), "  한울  ");
  await fireEvent.press(screen.getByText("아이디 정하기"));

  expect(mutate).toHaveBeenCalledWith("한울", expect.any(Object));
  const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
  await act(() => options.onSuccess());

  expect(push).toHaveBeenCalledWith("/onboarding/username");
});

it("허용하지 않는 이름에는 버튼을 잠근다", async () => {
  await renderScreen();
  await fireEvent.changeText(screen.getByLabelText("닉네임"), "한울😀");

  expect(screen.getByRole("button", { name: "아이디 정하기" })).toBeDisabled();
});

it("저장 실패는 입력 규칙 자리가 아니라 alert로 알린다", async () => {
  const alert = jest.spyOn(Alert, "alert");
  await renderScreen();
  await fireEvent.press(screen.getByText("아이디 정하기"));

  const options = mutate.mock.calls[0]?.[1] as { onError: () => void };
  await act(() => options.onError());

  expect(alert).toHaveBeenCalledWith(
    "저장하지 못했어요",
    "잠시 후 다시 시도해 주세요."
  );
});
