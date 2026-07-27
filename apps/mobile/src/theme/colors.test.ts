import { colors } from "./colors";

// 이 테스트가 있는 이유는 값이 아니라 **로드**다. colors는 모듈 로드 시점에
// Color.ios의 Proxy를 통해 PlatformColor를 부르므로, jest에서 이게 던지면 색과
// 무관한 화면 테스트가 전부 같이 죽는다. 색 자체는 단언하지 않는다 — OS가 정한다.
describe("colors", () => {
  // Color.ios는 Proxy이고, EXPO_OS가 ios가 아니면 조용히 null을 준다. null이면
  // 화면은 색 없이 그려져 테스트는 통과하지만 실물은 시맨틱 색을 잃는다 —
  // "정의됨"으로는 못 잡으므로 null까지 걸러야 한다.
  it("모든 토큰이 실제 플랫폼 색으로 풀린다", () => {
    for (const [name, value] of Object.entries(colors)) {
      const resolved = value !== null && value !== undefined;

      expect(`${name}: ${resolved ? "풀림" : "풀리지 않음"}`).toBe(
        `${name}: 풀림`
      );
    }
  });

  it("결정 기록의 토큰을 빠짐없이 내보낸다", () => {
    // docs/decisions/ios-semantic-colors.md의 표 그대로. 화면이 쓰려는 토큰이
    // 빠져 있으면 여기서 걸린다.
    expect(Object.keys(colors).sort()).toEqual([
      "label",
      "placeholderText",
      "secondaryLabel",
      "secondarySystemBackground",
      "separator",
      "systemBackground",
      "systemBlue",
      "systemGray5",
      "systemRed",
      "tertiaryLabel",
    ]);
  });
});
