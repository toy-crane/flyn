// React가 act() 지원 환경임을 인식하게 한다. RNTL은 자기 act 래퍼 안에서만
// 이 플래그를 켜므로, 비동기 상태 업데이트가 래퍼 밖에서 끝나면 경고가 난다.
// https://github.com/reactwg/react-18/discussions/102
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Metro가 global.css에서 만드는 변수 저장소는 Jest에 없다. 화면 테스트가
// native bridge를 통과할 수 있도록 실제 색과 무관한 결정적 값만 제공한다.
jest.mock("uniwind", () => ({
  useCSSVariable: (name) => {
    const value = (variable) =>
      variable === "--app-overlay" ? "rgba(0, 0, 0, 0.5)" : "#111111";

    return Array.isArray(name) ? name.map(value) : value(name);
  },
}));
