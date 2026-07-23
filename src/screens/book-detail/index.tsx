import { Stack, router } from "expo-router";

import { Badge } from "@/components/badge";
import { BookCover } from "@/components/book-cover";
import { GroupedList, GroupedListRow } from "@/components/grouped-list";
import { ScreenSubtitle, SectionHeading } from "@/components/headings";
import { ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { useStoreData } from "@/hooks/use-store-data";
import { Text, View } from "@/tw";
import { ENDING_BADGE } from "@/types/story";

/**
 * ⑨ 책 상세 — the same data as the result screen, read in a different mood:
 * looking back rather than finishing up. Stays inside the library tab, so the
 * tab bar remains visible.
 */
export function BookDetailScreen({ sessionId }: { sessionId: string }) {
  const books = useStoreData((store) => store.listBooks());
  const corrections = useStoreData((store) => store.listCorrections(sessionId));

  const book = books?.find((candidate) => candidate.sessionId === sessionId);
  if (!book) return <View className="flex-1 bg-background" />;

  return (
    <ScreenScroll>
      <Stack.Screen options={{ title: "" }} />

      <View className="items-center">
        <BookCover title={book.title} genre={book.genre} width={104} />
        <Text role="heading" className="mt-3 text-[22px] font-bold text-label">
          {book.title}
        </Text>
        <ScreenSubtitle>
          {`${book.turnCount}턴 · ${ENDING_BADGE[book.endingKind]}`}
        </ScreenSubtitle>
      </View>

      <GroupedList surface="card">
        <GroupedListRow
          first
          label="대화 다시 읽기"
          onPress={() => router.push(`/session/${sessionId}`)}
        />
      </GroupedList>

      <SectionHeading>이 이야기의 교정</SectionHeading>
      {(corrections ?? []).map((correction) => (
        <ListRow
          key={correction.id}
          title={correction.correctedText}
          meta={correction.originalText}
          trailing={
            correction.id === "fix-1" ? <Badge label="대화 2" /> : undefined
          }
          onPress={() => router.push(`/correction/${correction.id}`)}
          surface="card"
        />
      ))}
    </ScreenScroll>
  );
}
