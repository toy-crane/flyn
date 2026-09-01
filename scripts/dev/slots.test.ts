import { describe, expect, test } from "bun:test";

import { allocateSlot, apiPort, metroPort, projectBand } from "./slots";

const allFree = () => true;
const noFreeSlotMessage = /빈 slot을 찾지 못했습니다/;
const bandMessage = /프로젝트 포트 대역을 읽지 못했습니다/;

describe("projectBand", () => {
  test("Supabase API 포트에서 대역 번호를 읽는다", () => {
    expect(projectBand(54_321)).toBe(0);
    expect(projectBand(54_331)).toBe(1);
    expect(projectBand(54_411)).toBe(9);
  });

  test("대역 규칙 밖의 포트는 추측하지 않고 실패한다", () => {
    expect(() => projectBand(54_322)).toThrow(bandMessage);
    expect(() => projectBand(54_311)).toThrow(bandMessage);
    expect(() => projectBand(54_421)).toThrow(bandMessage);
  });
});

describe("포트 계산", () => {
  test("0번 대역은 기본 포트에서 slot마다 10씩 올라간다", () => {
    expect([metroPort(0, 0), metroPort(1, 0), metroPort(2, 0)]).toEqual([
      8081, 8091, 8101,
    ]);
    expect([apiPort(0, 0), apiPort(1, 0), apiPort(2, 0)]).toEqual([
      3900, 3910, 3920,
    ]);
  });

  test("대역 번호는 slot 간격 안의 한 자리를 차지한다", () => {
    expect([metroPort(0, 1), metroPort(1, 1)]).toEqual([8082, 8092]);
    expect([apiPort(0, 1), apiPort(1, 1)]).toEqual([3901, 3911]);
    expect(metroPort(0, 9)).toBe(8090);
    expect(metroPort(1, 0)).toBe(8091);
  });
});

describe("allocateSlot", () => {
  test("첫 worktree는 slot 0을 받는다", () => {
    expect(
      allocateSlot({
        band: 0,
        currentSlot: undefined,
        isPortFree: allFree,
        takenSlots: new Set(),
      })
    ).toEqual({ changed: true, slot: 0 });
  });

  test("다른 worktree가 쓰는 slot은 건너뛴다", () => {
    expect(
      allocateSlot({
        band: 0,
        currentSlot: undefined,
        isPortFree: allFree,
        takenSlots: new Set([0, 1]),
      })
    ).toEqual({ changed: true, slot: 2 });
  });

  test("기존 worktree는 같은 slot을 계속 쓴다", () => {
    expect(
      allocateSlot({
        band: 0,
        currentSlot: 3,
        isPortFree: allFree,
        takenSlots: new Set([0, 1]),
      })
    ).toEqual({ changed: false, slot: 3 });
  });

  test("첫 배정은 두 포트가 모두 비어 있는 slot만 쓴다", () => {
    // slot 0은 Metro 포트만, slot 1은 API 포트만 막혀 있다.
    const isPortFree = (port: number) => port !== 8081 && port !== 3910;

    expect(
      allocateSlot({
        band: 0,
        currentSlot: undefined,
        isPortFree,
        takenSlots: new Set(),
      })
    ).toEqual({ changed: true, slot: 2 });
  });

  test("다른 대역의 프로세스가 잡은 포트는 이 대역의 slot을 막지 않는다", () => {
    // 0번 대역의 slot 0(8081, 3900)이 사용 중이어도 1번 대역은 slot 0을 쓴다.
    const isPortFree = (port: number) => port !== 8081 && port !== 3900;

    expect(
      allocateSlot({
        band: 1,
        currentSlot: undefined,
        isPortFree,
        takenSlots: new Set(),
      })
    ).toEqual({ changed: true, slot: 0 });
  });

  test("알 수 없는 프로세스가 저장된 포트를 쓰면 다른 slot으로 옮긴다", () => {
    const isPortFree = (port: number) => port !== 3910;

    expect(
      allocateSlot({
        band: 0,
        currentSlot: 1,
        isPortFree,
        takenSlots: new Set([0]),
      })
    ).toEqual({ changed: true, slot: 2 });
  });

  test("자기 세션이 쓰는 포트 때문에 slot을 옮기지 않는다", () => {
    // 다시 시작할 때 살아 있는 자기 API와 Metro가 포트를 잡고 있다.
    expect(
      allocateSlot({
        band: 0,
        currentSlot: 1,
        isPortFree: () => false,
        ownPorts: new Set([8091, 3910]),
        takenSlots: new Set([0]),
      })
    ).toEqual({ changed: false, slot: 1 });
  });

  test("빈 slot이 없으면 남의 프로세스를 죽이지 않고 실패한다", () => {
    expect(() =>
      allocateSlot({
        band: 0,
        currentSlot: undefined,
        isPortFree: () => false,
        takenSlots: new Set(),
      })
    ).toThrow(noFreeSlotMessage);
  });
});
