import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  eraseSavedExpression,
  readExpressionNote,
  type SavedExpression,
} from "@/features/note/api/expression-note";

/** 계정을 바꿨을 때 앞 계정의 노트를 읽지 않도록 사용자 ID를 키에 넣는다. */
export function expressionNoteQueryKey(userId: string) {
  return ["expression-note", userId] as const;
}

/**
 * 표현 노트의 목록.
 *
 * 기본 1분 대신 곧바로 낡은 것으로 본다. 이 목록을 바꾸는 일은 모두 대화에서
 * 일어나는데 그쪽은 쿼리를 거치지 않아 무효로 만들 자리가 없다. 방금 담은 것이
 * 노트에 없으면 담기가 실패한 것처럼 보인다.
 */
export function useExpressionNote(
  userId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    enabled: userId !== undefined && accessToken !== undefined,
    queryFn: () => readExpressionNote(accessToken ?? ""),
    queryKey: expressionNoteQueryKey(userId ?? ""),
    retry: 1,
    staleTime: 0,
  });
}

/**
 * 카드 하나를 지운다.
 *
 * 확인을 묻지 않으므로 목록에서 먼저 빼고 서버에 알린다. 실패하면 그 자리로
 * 되돌린다.
 */
export function useEraseSavedExpression(
  userId: string | undefined,
  accessToken: string | undefined
) {
  const queryClient = useQueryClient();
  const key = expressionNoteQueryKey(userId ?? "");
  const erase = useMutation({
    mutationFn: (id: string) => eraseSavedExpression(accessToken ?? "", id),
    onError: (_error, _id, kept: SavedExpression[] | undefined) => {
      queryClient.setQueryData(key, kept ?? []);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const kept = queryClient.getQueryData<SavedExpression[]>(key) ?? [];

      queryClient.setQueryData(
        key,
        kept.filter((expression) => expression.id !== id)
      );

      return kept;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  const { mutate } = erase;

  return useCallback(
    (id: string) => {
      mutate(id);
    },
    [mutate]
  );
}
