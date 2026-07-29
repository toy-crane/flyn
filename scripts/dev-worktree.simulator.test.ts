import { describe, expect, test } from "bun:test";
import {
  AGENT_DEVICE_APP_NAME,
  agentDeviceAppsArgs,
  agentDeviceOpenArgs,
  createSimulatorSessionName,
  developmentBuildCommand,
  parseAgentDeviceApps,
  parseIosSimulators,
} from "./dev-worktree/simulator";

describe("dev:worktree agent-device adapter", () => {
  test("agent-device 목록에서 iOS Simulator만 선택한다", () => {
    expect(
      parseIosSimulators({
        data: {
          devices: [
            {
              appleOs: "ios",
              id: "SIM-1",
              kind: "simulator",
              name: "iPhone 17",
              platform: "ios",
            },
            {
              appleOs: "ipados",
              id: "IPAD-1",
              kind: "simulator",
              name: "iPad",
              platform: "ios",
            },
            {
              appleOs: "ios",
              id: "PHONE-1",
              kind: "device",
              name: "Physical iPhone",
              platform: "ios",
            },
          ],
        },
        success: true,
      })
    ).toEqual([{ id: "SIM-1", name: "iPhone 17" }]);
  });

  test("com.odd.flyn development build 설치 여부를 판별한다", () => {
    expect(
      parseAgentDeviceApps({
        data: {
          apps: ["Expo Go (host.exp.Exponent)", "flyn (com.odd.flyn)"],
        },
        success: true,
      })
    ).toContain(AGENT_DEVICE_APP_NAME);
  });

  test("session 이름과 수동 development build 명령을 만든다", () => {
    expect(createSimulatorSessionName("abc123", 4)).toBe("flyn-abc123-slot-4");
    expect(developmentBuildCommand("SIM-1")).toBe(
      'cd apps/mobile && bunx expo run:ios --device "SIM-1" --no-bundler'
    );
    expect(agentDeviceAppsArgs("SIM-1")).toContain("--udid");
    expect(agentDeviceAppsArgs("SIM-1")).not.toContain("--device");
    expect(
      agentDeviceOpenArgs({
        plan: {
          apiPort: 3004,
          device: { id: "SIM-1", name: "iPhone 17" },
          metroPort: 8085,
          slot: 4,
        },
        sessionName: "flyn-repo-slot-4",
      })
    ).toEqual([
      "open",
      "flyn",
      "--platform",
      "ios",
      "--udid",
      "SIM-1",
      "--session",
      "flyn-repo-slot-4",
      "--metro-host",
      "127.0.0.1",
      "--metro-port",
      "8085",
      "--launch-url",
      "exp+flyn://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8085",
      "--relaunch",
    ]);
  });

  test("예상하지 못한 agent-device 응답은 거부한다", () => {
    expect(() => parseIosSimulators({ success: false })).toThrow(
      "agent-device devices 응답"
    );
    expect(() => parseAgentDeviceApps({ data: {}, success: true })).toThrow(
      "agent-device apps 응답"
    );
  });
});
