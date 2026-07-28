// React가 act() 지원 환경임을 인식하게 한다. RNTL은 자기 act 래퍼 안에서만
// 이 플래그를 켜므로, 비동기 상태 업데이트가 래퍼 밖에서 끝나면 경고가 난다.
// https://github.com/reactwg/react-18/discussions/102
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Uniwind는 Metro가 global.css를 컴파일해 런타임 변수 저장소를 채운다는 전제다.
// Jest에는 그 단계가 없으므로 네이티브 경계가 읽을 값만 고정된 대역으로 준다.
jest.mock("uniwind", () => ({
  useCSSVariable: (name) => {
    const value = (variable) =>
      variable === "--app-overlay" ? "rgba(0, 0, 0, 0.5)" : "#111111";

    return Array.isArray(name) ? name.map(value) : value(name);
  },
}));
