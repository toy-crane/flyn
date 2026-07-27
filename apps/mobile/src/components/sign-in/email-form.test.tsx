import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui", () =>
  require("../../test-support/expo-ui").swiftUiMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { EmailForm } from "./email-form";

const FIELD = "이메일 주소";
const SUBMIT = "코드 받기";
const NETWORK_COPY = /인터넷에 연결/;

function noop() {
  // 제출을 보지 않는 테스트용
}

describe("EmailForm", () => {
  it("입력한 주소로 제출한다", async () => {
    const onSubmit = jest.fn();

    await render(<EmailForm onSubmit={onSubmit} />);
    await fireEvent.changeText(
      screen.getByPlaceholderText(FIELD),
      "me@example.test"
    );
    await fireEvent.press(screen.getByText(SUBMIT));

    expect(onSubmit).toHaveBeenCalledWith("me@example.test");
  });

  // 앞뒤 공백은 자동완성·붙여넣기에서 흔하다. 여기서 다듬지 않으면 코드를 보낸
  // 주소와 검증하는 주소가 갈린다.
  it("앞뒤 공백을 떼고 제출한다", async () => {
    const onSubmit = jest.fn();

    await render(<EmailForm onSubmit={onSubmit} />);
    await fireEvent.changeText(
      screen.getByPlaceholderText(FIELD),
      "  me@example.test  "
    );
    await fireEvent.press(screen.getByText(SUBMIT));

    expect(onSubmit).toHaveBeenCalledWith("me@example.test");
  });

  it("주소가 그럴듯해지기 전에는 제출 버튼이 잠겨 있다", async () => {
    await render(<EmailForm onSubmit={noop} />);

    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();

    await fireEvent.changeText(
      screen.getByPlaceholderText(FIELD),
      "me@example.test"
    );

    expect(screen.getByRole("button", { name: SUBMIT })).not.toBeDisabled();
  });

  it("보내는 중에는 다시 누를 수 없다", async () => {
    await render(<EmailForm onSubmit={noop} pending />);

    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
  });

  // 스펙 §6 — email·code는 얼럿이 아니라 인라인 각주다.
  it("실패는 인라인 각주로 보여준다", async () => {
    await render(
      <EmailForm
        failure="인터넷에 연결되어 있는지 확인해 주세요."
        onSubmit={noop}
      />
    );

    expect(screen.getByText(NETWORK_COPY)).toBeTruthy();
  });

  it("이메일 자동완성을 켠다", async () => {
    await render(<EmailForm onSubmit={noop} />);

    expect(screen.getByPlaceholderText(FIELD).props.textContentType).toBe(
      "emailAddress"
    );
  });
});
