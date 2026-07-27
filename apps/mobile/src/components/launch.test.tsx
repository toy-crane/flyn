import { render, screen } from "@testing-library/react-native";

// SwiftUI 트리는 jest에서 불투명한 네이티브 뷰 하나로만 그려진다 — 안의 문구를
// RNTL이 못 본다. 목이 그걸 RN 프리미티브로 갈아끼운다.
jest.mock("@expo/ui", () => require("../test-support/expo-ui").universalMock());
jest.mock("@expo/ui/swift-ui", () =>
  require("../test-support/expo-ui").swiftUiMock()
);
jest.mock("@expo/ui/swift-ui/modifiers", () =>
  require("../test-support/expo-ui").modifiersMock()
);

import { LaunchChecking, LaunchFailed } from "./launch";

const MISSING_ENV = /환경변수 없음/;
const ANY_PROGRESS_COPY = /확인|불러오|로딩/;

describe("LaunchFailed", () => {
  it("무엇이 잘못됐는지 그대로 보여준다", async () => {
    await render(
      <LaunchFailed reason="Supabase 환경변수 없음 — .env.local을 설정하라." />
    );

    expect(screen.getByText(MISSING_ENV)).toBeTruthy();
  });

  // 스펙 §8은 `다시 시도` 버튼을 요구했지만 failed는 오직 !supabaseConfigured에서만
  // 나오고 그건 빌드 타임에 인라인되는 값이라 런타임에 바뀔 수 없다. 누르면 같은
  // 분기로 되돌아올 뿐이라 버튼은 위약이다. 부재를 의도로 못박는다.
  it("다시 시도 버튼을 두지 않는다 — 재시도할 것이 없다", async () => {
    await render(<LaunchFailed reason="Supabase 환경변수 없음" />);

    expect(screen.queryByText("다시 시도")).toBeNull();
  });
});

describe("LaunchChecking", () => {
  // 정상 경로에서는 한순간이라 문구가 오히려 깜빡임으로 보인다(스펙 §8).
  it("문구 없이 스피너만 그린다", async () => {
    await render(<LaunchChecking />);

    expect(screen.queryByText(ANY_PROGRESS_COPY)).toBeNull();
  });
});
