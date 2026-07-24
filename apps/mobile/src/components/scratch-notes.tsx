import type { Tables } from "@flyn/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { queryKeys } from "../lib/query-keys";
import { supabase } from "../lib/supabase";
import { Card, CardError } from "./card";

// 화면이 쓰는 컬럼만 가져온다.
type ScratchNote = Pick<Tables<"scratch_notes">, "id" | "body">;

async function fetchNotes(): Promise<ScratchNote[]> {
  const { data } = await supabase
    .from("scratch_notes")
    .select("id, body")
    .order("created_at", { ascending: false })
    .throwOnError();

  return data;
}

const NoteRow = memo(
  ({
    note,
    onDelete,
    disabled,
  }: {
    note: ScratchNote;
    onDelete: (id: string) => void;
    disabled: boolean;
  }) => {
    const handleDelete = useCallback(
      () => onDelete(note.id),
      [note.id, onDelete]
    );

    return (
      <View className="flex-row items-center justify-between gap-3 border-black/5 border-t pt-2 dark:border-white/10">
        <Text className="flex-1 text-slate-800 dark:text-slate-100">
          {note.body}
        </Text>
        <Pressable disabled={disabled} onPress={handleDelete}>
          <Text className="text-rose-600 dark:text-rose-400">삭제</Text>
        </Pressable>
      </View>
    );
  }
);

export function ScratchNotes() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const notes = useQuery({
    queryFn: fetchNotes,
    queryKey: queryKeys.scratchNotes,
  });

  // server-stats(집계)도 함께 무효화 — 두 카드가 어긋나지 않게. 반환하지 않으므로
  // 리페치가 끝나기를 기다리며 버튼이 잠기지 않는다.
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.scratchNotes });
    queryClient.invalidateQueries({ queryKey: queryKeys.serverStats });
  }, [queryClient]);

  const add = useMutation({
    // user_id는 auth.uid() 기본값으로 채워진다 — 앱은 body만 보낸다.
    mutationFn: async (body: string) => {
      await supabase.from("scratch_notes").insert({ body }).throwOnError();
    },
    onSuccess: () => {
      setDraft("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("scratch_notes").delete().eq("id", id).throwOnError();
    },
    onSuccess: invalidate,
  });

  const addDisabled = draft.trim().length === 0 || add.isPending;

  const handleAdd = useCallback(() => add.mutate(draft.trim()), [add, draft]);

  return (
    <Card label="scratch_notes · RLS로 내 행만">
      <View className="flex-row gap-2">
        <TextInput
          className="flex-1 rounded-lg bg-black/5 px-3 py-2 text-slate-900 dark:bg-white/10 dark:text-slate-50"
          onChangeText={setDraft}
          placeholder="메모를 입력…"
          value={draft}
        />
        <Pressable
          className={`justify-center rounded-lg bg-sky-600 px-4 ${addDisabled ? "opacity-40" : ""}`}
          disabled={addDisabled}
          onPress={handleAdd}
        >
          <Text className="font-semibold text-white">추가</Text>
        </Pressable>
      </View>

      {add.isError ? (
        <CardError>추가 실패: {add.error.message}</CardError>
      ) : null}

      {remove.isError ? (
        <CardError>삭제 실패: {remove.error.message}</CardError>
      ) : null}

      {notes.isPending ? <ActivityIndicator /> : null}

      {notes.isError ? <CardError>{notes.error.message}</CardError> : null}

      {notes.data?.map((note) => (
        <NoteRow
          disabled={remove.isPending}
          key={note.id}
          note={note}
          onDelete={remove.mutate}
        />
      ))}

      {notes.data?.length === 0 ? (
        <Text className="text-gray-400 text-sm">아직 메모가 없다.</Text>
      ) : null}
    </Card>
  );
}
