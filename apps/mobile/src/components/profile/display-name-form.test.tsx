import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";

jest.mock("@expo/ui", () =>
  require("../../test-support/expo-ui").universalMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../../test-support/expo-ui").modifiersMock()
);

import { DISPLAY_NAME_MAX } from "../../lib/display-name";
import { DisplayNameForm } from "./display-name-form";

const FIELD = "표시 이름";
const SUBMIT = "저장";
const SAVE_FAILED = /저장하지 못했습니다/;

function noop() {
  // 제출을 보지 않는 테스트용
}

function renderForm(
  props: Partial<Parameters<typeof DisplayNameForm>[0]> = {}
) {
  return render(
    <DisplayNameForm
      description="앱에서 나를 부르는 이름이에요."
      initialValue=""
      onSubmit={noop}
      submitLabel={SUBMIT}
      {...props}
    />
  );
}

describe("DisplayNameForm", () => {
  it("입력한 이름으로 제출한다", async () => {
    const onSubmit = jest.fn();

    await renderForm({ onSubmit });
    await fireEvent.changeText(screen.getByLabelText(FIELD), "한울");
    await fireEvent.press(screen.getByText(SUBMIT));

    expect(onSubmit).toHaveBeenCalledWith("한울");
  });

  // DB의 트리거도 같은 일을 하지만, 여기서 다듬어야 사용자가 본 값과 저장된
  // 값이 같아진다.
  it("앞뒤 공백을 떼고 제출한다", async () => {
    const onSubmit = jest.fn();

    await renderForm({ onSubmit });
    await fireEvent.changeText(screen.getByLabelText(FIELD), "  한울  ");
    await fireEvent.press(screen.getByText(SUBMIT));

    expect(onSubmit).toHaveBeenCalledWith("한울");
  });

  it("미리 채운 값으로 시작하고 그대로 제출할 수 있다", async () => {
    const onSubmit = jest.fn();

    await renderForm({ initialValue: "김한울", onSubmit });

    expect(screen.getByLabelText(FIELD).props.value).toBe("김한울");

    await fireEvent.press(screen.getByText(SUBMIT));

    expect(onSubmit).toHaveBeenCalledWith("김한울");
  });

  it("활성 제출 버튼 라벨에 primary foreground 색을 적용한다", async () => {
    await renderForm({ initialValue: "한울" });

    expect(screen.getByText(SUBMIT)).toHaveStyle({ color: "#fefefe" });
  });

  // provider가 준 이름은 미리 채우되 자동 저장하지 않는다.
  it("미리 채운 값을 저절로 저장하지 않는다", async () => {
    const onSubmit = jest.fn();

    await renderForm({ initialValue: "김한울", onSubmit });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("빈 입력에는 제출 버튼이 잠겨 있다", async () => {
    await renderForm();

    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText(FIELD), "한울");

    expect(screen.getByRole("button", { name: SUBMIT })).not.toBeDisabled();
  });

  it("공백뿐인 이름에는 제출 버튼이 잠겨 있다", async () => {
    await renderForm();
    await fireEvent.changeText(screen.getByLabelText(FIELD), "   ");

    expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled();
  });

  it("저장하는 중에는 다시 누를 수 없다", async () => {
    await renderForm({ initialValue: "한울", pending: true });

    const submit = screen.getByRole("button", { name: SUBMIT });

    expect(submit).toBeDisabled();
    expect(within(submit).getByTestId("form-submit-progress")).toBeTruthy();
  });

  it("서버가 거부할 길이는 애초에 입력되지 않게 막는다", async () => {
    await renderForm();

    expect(screen.getByLabelText(FIELD).props.maxLength).toBe(DISPLAY_NAME_MAX);
  });

  it("실패는 인라인 각주로 보여준다", async () => {
    await renderForm({ failure: "이름을 저장하지 못했습니다." });

    expect(screen.getByText(SAVE_FAILED)).toBeTruthy();
  });

  it("리턴 키로도 제출된다", async () => {
    const onSubmit = jest.fn();

    await renderForm({ onSubmit });

    const field = screen.getByLabelText(FIELD);

    await fireEvent.changeText(field, "한울");
    await fireEvent(field, "submitEditing");

    expect(onSubmit).toHaveBeenCalledWith("한울");
  });

  it("입력창 밖에 label을 보여준다", async () => {
    await renderForm();

    expect(screen.getByText(FIELD)).toBeTruthy();
  });
});

// 실물에서 입력값은 네이티브 쪽에서 동기로 갱신되어 React 렌더보다 앞선다.
// 제출을 React 미러에서 읽으면 마지막 글자를 놓친다 — 로그인 화면에서 실제로
// verify@example.test가 verify@example.tes로 발송된 적이 있다.
describe("DisplayNameForm — 네이티브 값과 React 미러가 어긋날 때", () => {
  it("React가 아직 못 따라잡았어도 입력한 이름 전체를 제출한다", async () => {
    const onSubmit = jest.fn();

    await renderForm({ onSubmit });

    const field = screen.getByLabelText(FIELD);

    await fireEvent.changeText(field, "한울이");
    // 여기서 await하지 않는다 — 마지막 글자가 네이티브에만 있고 React state에는
    // 아직 반영되지 않은 순간을 만든다.
    fireEvent.changeText(field, "한울이다");
    fireEvent.press(screen.getByText(SUBMIT));

    expect(onSubmit).toHaveBeenCalledWith("한울이다");
  });
});
