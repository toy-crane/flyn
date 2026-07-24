import type { Tables } from "@flyn/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

type ScratchNote = Tables<"scratch_notes">;

const QUERY_KEY = ["scratch_notes"];

async function fetchNotes(): Promise<ScratchNote[]> {
  const { data, error } = await supabase
    .from("scratch_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function insertNote(body: string): Promise<void> {
  // user_id는 auth.uid() 기본값으로 채워진다 — 앱은 body만 보낸다.
  const { error } = await supabase.from("scratch_notes").insert({ body });

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("scratch_notes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

function NoteRow({
  note,
  onDelete,
  disabled,
}: {
  note: ScratchNote;
  onDelete: (id: string) => void;
  disabled: boolean;
}) {
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

export function ScratchNotes() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const notes = useQuery({ queryFn: fetchNotes, queryKey: QUERY_KEY });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    [queryClient]
  );

  const add = useMutation({
    mutationFn: insertNote,
    onSuccess: () => {
      setDraft("");
      invalidate();
    },
  });

  const remove = useMutation({ mutationFn: deleteNote, onSuccess: invalidate });

  const addDisabled = draft.trim().length === 0 || add.isPending;

  const handleAdd = useCallback(() => {
    const body = draft.trim();
    if (body.length > 0) {
      add.mutate(body);
    }
  }, [add, draft]);

  return (
    <View className="w-full gap-3 rounded-2xl bg-white/80 p-5 dark:bg-white/10">
      <Text className="text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
        scratch_notes · RLS로 내 행만
      </Text>

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

      {notes.isPending ? <ActivityIndicator /> : null}

      {notes.isError ? (
        <Text className="text-rose-600 dark:text-rose-400">
          {notes.error.message}
        </Text>
      ) : null}

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
    </View>
  );
}
