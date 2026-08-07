import { DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import { toNavigationTheme } from "./navigation-theme";

// CSS 토큰이 resolve된 뒤의 값 자리다 — bridge는 이름만 잇고 자체 팔레트를
// 갖지 않으므로, 역할이 뒤바뀌면 바로 드러나도록 서로 다른 값을 준다.
const colors = {
  accent: "accent",
  background: "background",
  foreground: "foreground",
  separator: "separator",
};

describe("React Navigation theme bridge", () => {
  for (const [themeName, base] of [
    ["light", DefaultTheme],
    ["dark", DarkTheme],
  ] as const) {
    it(`${themeName} base의 chrome 계약을 CSS 토큰에 연결한다`, () => {
      expect(toNavigationTheme(themeName, colors)).toEqual({
        ...base,
        colors: {
          ...base.colors,
          background: "background",
          border: "separator",
          card: "background",
          notification: "accent",
          primary: "accent",
          text: "foreground",
        },
      });
    });
  }
});
