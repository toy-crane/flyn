import { router } from "expo-router";

import { BookCover } from "@/components/book-cover";
import { EmptyState } from "@/components/empty-state";
import {
  ScreenSubtitle,
  ScreenTitle,
  SectionHeading,
} from "@/components/headings";
import { ScreenScroll } from "@/components/screen-scroll";
import { useStoreData } from "@/hooks/use-store-data";
import { Pressable, Text, View } from "@/tw";

/** ⑦ 서재 — finished stories, stacked as books. */
export function LibraryScreen() {
  const books = useStoreData((store) => store.listBooks());

  return (
    <ScreenScroll>
      <ScreenTitle>서재</ScreenTitle>
      <ScreenSubtitle>완성한 이야기가 책으로 남아요.</ScreenSubtitle>

      {books === undefined ? null : books.length === 0 ? (
        <EmptyState
          message={
            "아직 서재가 비어 있어요.\n첫 이야기를 완성하면 첫 책이 생겨요."
          }
        />
      ) : (
        <>
          <SectionHeading>{`완성한 이야기 ${books.length}`}</SectionHeading>
          <View className="mt-1 flex-row flex-wrap gap-x-3 gap-y-4">
            {books.map((book) => (
              <Pressable
                key={book.sessionId}
                accessibilityRole="button"
                onPress={() => router.push(`/book/${book.sessionId}`)}
                className="w-[47%]"
              >
                <BookCover
                  title={book.title}
                  genre={book.genre}
                  endingKind={book.endingKind}
                />
                <Text className="mt-1.5 text-[11px] text-muted">
                  {`${book.turnCount}턴 · 교정 ${book.correctionCount}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScreenScroll>
  );
}
