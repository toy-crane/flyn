// React가 act() 지원 환경임을 인식하게 한다. RNTL은 자기 act 래퍼 안에서만
// 이 플래그를 켜므로, 비동기 상태 업데이트가 래퍼 밖에서 끝나면 경고가 난다.
// https://github.com/reactwg/react-18/discussions/102
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Reanimated 4는 Worklets native module을 불러온다. Jest에서는 공식 mock을
// 먼저 연결한 뒤 animation test matcher와 timer 환경을 초기화한다.
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/lib/module/mock")
);
require("react-native-reanimated").setUpTests();

// 화면 테스트는 앱 root 밖에서 각 surface를 직접 렌더한다. 실제 provider 계약은
// theme 전용 테스트가 검증하고, 나머지 테스트에는 역할이 구분되는 결정적 값을 준다.
jest.mock("./src/theme/app-theme", () => {
  const { typography } = require("./src/theme/tokens");
  const colors = {
    accent: "#111111",
    background: "#111111",
    border: "#111111",
    danger: "#111111",
    disabled: "#111111",
    disabledText: "#111111",
    groupedBackground: "#333333",
    inputFill: "#222222",
    link: "#111111",
    onAccent: "#fefefe",
    onPrimary: "#fefefe",
    onUserBubble: "#fefefe",
    overlay: "rgba(0, 0, 0, 0.5)",
    placeholder: "#111111",
    primary: "#111111",
    secondaryText: "#111111",
    separator: "#111111",
    success: "#111111",
    surface: "#111111",
    text: "#111111",
    userBubble: "#111111",
  };
  const theme = {
    colorScheme: "light",
    colors,
    spacing: {},
    typography,
  };

  return {
    AppThemeProvider: ({ children }) => children,
    useColors: () => colors,
    useTheme: () => theme,
  };
});
