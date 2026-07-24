import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // 변경은 뮤테이션이 명시적으로 무효화하므로, 마운트마다 다시 받아올 이유가 없다.
      staleTime: 30_000,
    },
  },
});
