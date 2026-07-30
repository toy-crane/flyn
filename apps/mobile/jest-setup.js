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

// Metro가 global.css에서 만드는 변수 저장소는 Jest에 없다. 화면 테스트가
// native bridge를 통과할 수 있도록 실제 색과 무관한 결정적 값만 제공한다.
jest.mock("uniwind", () => ({
  useCSSVariable: (name) => {
    const value = (variable) => {
      if (variable === "--app-overlay") {
        return "rgba(0, 0, 0, 0.5)";
      }

      // foreground 배선은 배경/tint와 다른 값이어야 테스트가 두 역할을
      // 실수로 맞바꿔도 잡아낸다.
      return variable === "--app-primary-foreground" ? "#fefefe" : "#111111";
    };

    return Array.isArray(name) ? name.map(value) : value(name);
  },
}));
