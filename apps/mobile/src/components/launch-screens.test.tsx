import { act, render, screen } from "@testing-library/react-native";
import { HeroUIWrapper } from "../test-support/heroui";
import { LaunchChecking, LaunchFailed } from "./launch-screens";

const MISSING_ENV = /환경변수 없음/;
const ANY_PROGRESS_COPY = /확인|불러오|로딩/;

describe("LaunchFailed", () => {
  it("무엇이 잘못됐는지 그대로 보여준다", async () => {
    await render(
      <LaunchFailed reason="Supabase 환경변수 없음 — .env.local을 설정하라." />,
      { wrapper: HeroUIWrapper }
    );

    expect(screen.getByText(MISSING_ENV)).toBeTruthy();
  });

  // failed는 오직 !supabaseConfigured에서만 나오고 그건 빌드 타임에 인라인되는
  // 값이라 런타임에 바뀔 수 없다. 누르면 같은 분기로 되돌아올 뿐이라
  // `다시 시도` 버튼은 위약이다. 부재를 의도로 못박는다.
  it("다시 시도 버튼을 두지 않는다 — 재시도할 것이 없다", async () => {
    await render(<LaunchFailed reason="Supabase 환경변수 없음" />, {
      wrapper: HeroUIWrapper,
    });

    expect(screen.queryByText("다시 시도")).toBeNull();
  });

  // iOS Dynamic Type ramp를 걸어야 시스템 글자 크기 설정을 따라간다.
  it("사유 문구를 body ramp에 걸어 시스템 글자 크기를 따른다", async () => {
    await render(<LaunchFailed reason="Supabase 환경변수 없음" />, {
      wrapper: HeroUIWrapper,
    });

    expect(screen.getByText(MISSING_ENV).props.dynamicTypeRamp).toBe("body");
  });
});

describe("LaunchChecking", () => {
  // 정상 경로에서는 한순간이라 문구가 오히려 깜빡임으로 보인다.
  it("문구 없이 스피너만 그린다", async () => {
    jest.useFakeTimers();

    try {
      await render(<LaunchChecking />, { wrapper: HeroUIWrapper });
      await act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getByRole("progressbar")).toBeTruthy();
      expect(screen.queryByText(ANY_PROGRESS_COPY)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("짧은 판정에는 progress를 그리지 않고 실제 대기에서만 보여준다", async () => {
    jest.useFakeTimers();

    try {
      await render(<LaunchChecking />, { wrapper: HeroUIWrapper });

      expect(
        screen.queryByRole("progressbar", { includeHiddenElements: true })
      ).toBeNull();

      await act(() => {
        jest.advanceTimersByTime(199);
      });
      expect(
        screen.queryByRole("progressbar", { includeHiddenElements: true })
      ).toBeNull();

      await act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(screen.getByRole("progressbar")).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
