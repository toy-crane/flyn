import { QueryClient } from "@tanstack/react-query";

// 앱 전역 QueryClient 싱글턴. _layout에서 QueryClientProvider로 주입한다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});
