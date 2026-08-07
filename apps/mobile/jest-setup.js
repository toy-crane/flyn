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

// gesture-handler도 native 모듈이다. HeroUI 설치 계약이 루트에 세우는
// GestureHandlerRootView는 이 공식 mock 없이는 jest에서 install에 실패한다.
require("react-native-gesture-handler/jestSetup");

// 토큰은 더 이상 전역 mock이 아니다. 값의 원본이 CSS `@theme` 하나가 되면서
// 화면 테스트는 필요한 suite에서만 `test-support/heroui`의 uniwindThemeMock으로
// resolve 한 단계를 세운다.
