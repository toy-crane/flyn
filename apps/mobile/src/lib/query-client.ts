import { QueryClient } from "@tanstack/react-query";

// 앱 전역 QueryClient 싱글턴. _layout에서 QueryClientProvider로 주입한다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // 변경은 뮤테이션이 명시적으로 무효화하므로, 마운트마다 다시 받아올 이유가 없다.
      staleTime: 30_000,
    },
  },
});
