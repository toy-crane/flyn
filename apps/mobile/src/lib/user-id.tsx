import { createContext, type ReactNode, useContext } from "react";

/**
 * `useAuth` 구독은 `_layout` 한 곳뿐이다(그 파일의 주석). 그런데 화면들은
 * 프로필을 읽고 쓰려면 자기 `userId`가 필요하다 — 가드를 통과한 사실을
 * 컨텍스트로 내려, 화면이 인증을 다시 구독하지 않게 한다.
 */
const UserIdContext = createContext<string | null>(null);

export function UserIdProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  return (
    <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
  );
}

/**
 * 로그인 가드 안에서만 부른다. 밖에서 부르면 `null`을 조용히 흘려보내는 대신
 * 던진다 — 그 상태로 프로필을 읽으면 남의 행을 찾거나 빈 화면이 된다.
 */
export function useUserId(): string {
  const userId = useContext(UserIdContext);

  if (userId === null) {
    throw new Error("useUserId는 로그인 가드 안에서만 쓸 수 있다");
  }

  return userId;
}
