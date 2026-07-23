import { Stack, router } from "expo-router";

import { Badge } from "@/components/badge";
import { BookCover } from "@/components/book-cover";
import { CtaBar } from "@/components/cta-bar";
import { CtaButton } from "@/components/cta-button";
import { EmptyState } from "@/components/empty-state";
import { ScreenSubtitle, SectionHeading } from "@/components/headings";
import { ListRow } from "@/components/list-row";
import { StatTile } from "@/components/stat-tile";
import { useStoreData } from "@/hooks/use-store-data";
import { SafeAreaView, ScrollView, Text, View } from "@/tw";

/**
 * ⑤ 결과 — the moment right after an ending. "The End" holds for all three
 * branches; there is no "새 이야기 시작" here, because inviting the next
 * session is home's job.
 */
export function SessionResultScreen({ sessionId }: { sessionId: string }) {
  const session = useStoreData((store) => store.getStorySession(sessionId));
  const corrections = useStoreData((store) => store.listCorrections(sessionId));
  const stats = useStoreData((store) => store.getSessionStats(sessionId));

  if (!session?.ending || !stats)
    return <View className="flex-1 bg-grouped" />;

  return (
    <SafeAreaView className="flex-1 bg-grouped" edges={["bottom"]}>
      <Stack.Screen options={{ title: "" }} />
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-4">
        <View className="items-center">
          <BookCover
            title={session.scenario.title}
            genre={session.scenario.genre}
            endingKind={session.ending.kind}
            width={104}
          />
          <Text
            role="heading"
            className="mt-3 mb-1.5 font-story text-[22px] font-bold italic text-label"
          >
            The End
          </Text>
          <Text className="mb-2 text-[13px] font-semibold text-tint">
            6일 연속 학습
          </Text>
          <ScreenSubtitle>{session.ending.summary}</ScreenSubtitle>
        </View>

        <View className="my-3.5 flex-row gap-2">
          <StatTile value={stats.turnCount} label="주고받은 턴" />
          <StatTile value={stats.correctionCount} label="교정" />
          <StatTile value={stats.correctionThreadCount} label="교정 대화" />
        </View>

        <SectionHeading>이번 이야기의 교정</SectionHeading>
        {corrections === undefined ? null : corrections.length === 0 ? (
          <EmptyState message={"교정할 문장이 없었어요.\n완벽한 세션이에요!"} />
        ) : (
          corrections.map((correction) => (
            <ListRow
              key={correction.id}
              title={correction.correctedText}
              meta={correction.originalText}
              trailing={
                correction.id === "fix-1" ? <Badge label="대화 2" /> : undefined
              }
              onPress={() => router.push(`/correction/${correction.id}`)}
            />
          ))
        )}
      </ScrollView>

      <CtaBar background="grouped">
        <CtaButton label="완료" onPress={() => router.dismissTo("/home")} />
      </CtaBar>
    </SafeAreaView>
  );
}
