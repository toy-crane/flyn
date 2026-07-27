/**
 * 화면 테스트용 `expo-router` 대역.
 *
 * `_layout.test.tsx`의 대역과는 모양이 다르다. 거기서 `Stack.Screen`은 라우트
 * **선언**이라 `screen:${name}`을 그려야 가드 배선이 보이지만, 화면 안에서는
 * 헤더 **설정**이라 아무것도 그리면 안 된다.
 */

const NOTHING = () => null;

/** 화면들이 부르는 라우터. 메서드만 jest.fn이라 resetAllMocks에 안전하다. */
export const routerStub = {
  back: jest.fn(),
  dismissTo: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

let searchParams: Record<string, string> = {};

/** `useLocalSearchParams`가 돌려줄 값. beforeEach에서 세운다. */
export function setSearchParams(next: Record<string, string>) {
  searchParams = next;
}

export function expoRouterMock() {
  return {
    // theme/colors.ts가 모듈 로드 시점에 Color.ios를 읽는다. 빠뜨리면 색과 무관한
    // 테스트가 로드 단계에서 죽는다. 실물 색 모듈만 되살린다 —
    // requireActual("expo-router")는 네비게이터까지 끌어온다.
    Color: jest.requireActual("expo-router/build/color").Color,
    Stack: Object.assign(NOTHING, { Protected: NOTHING, Screen: NOTHING }),
    // jest.fn이 아니라 맨 함수다. 저장소가 beforeEach에서 resetAllMocks를 쓰는데,
    // 그게 구현을 지워 useRouter()가 undefined를 돌려주게 된다.
    useLocalSearchParams: () => searchParams,
    useRouter: () => routerStub,
  };
}
