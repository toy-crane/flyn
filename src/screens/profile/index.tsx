import { Stack, router } from "expo-router";

import {
  GroupedList,
  GroupedListDangerRow,
  GroupedListHeader,
  GroupedListRow,
} from "@/components/grouped-list";
import { StatTile } from "@/components/stat-tile";
import { ScreenScroll } from "@/components/screen-scroll";
import { useStoreData } from "@/hooks/use-store-data";
import { Text, View } from "@/tw";
import {
  ENGLISH_LEVEL_COPY,
  GENRE_LABEL,
  INTEREST_LABEL,
  LEARNING_GOAL_LABEL,
} from "@/types/learner";

/** Renders "여행 외 2" for a multi-select answer. */
function summarize(labels: string[]): string {
  if (labels.length === 0) return "";
  const [first, ...rest] = labels;
  return rest.length === 0 ? first! : `${first} 외 ${rest.length}`;
}

/** ⑧ 프로필 — streak, totals, and the five answers, all editable. */
export function ProfileScreen() {
  const profile = useStoreData((store) => store.getLearnerProfile());
  const stats = useStoreData((store) => store.getLearnerStats());

  if (!profile || !stats) return <View className="flex-1 bg-grouped" />;

  const level = ENGLISH_LEVEL_COPY[profile.englishLevel].short;

  return (
    <ScreenScroll background="grouped">
      <Stack.Screen options={{ title: "프로필", headerLargeTitle: true }} />
      <View className="my-2 flex-row items-center gap-3.5">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-tint-soft">
          <Text className="text-[26px] font-bold text-tint">
            {profile.nickname?.slice(0, 1) ?? "?"}
          </Text>
        </View>
        <View>
          <Text className="text-xl font-bold text-label">
            {profile.nickname ?? "이름 없음"}
          </Text>
          <Text className="mt-0.5 text-[13px] text-secondary">
            {`함께한 지 ${stats.daysSinceJoined}일 · ${level}`}
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row gap-2">
        <StatTile value={stats.streakDays} label="연속 학습일" />
        <StatTile value={stats.completedStories} label="완성한 이야기" />
      </View>
      <View className="mb-2 flex-row gap-2">
        <StatTile value={stats.totalTurns} label="주고받은 턴" />
        <StatTile value={stats.totalCorrections} label="받은 교정" />
      </View>

      <View
        className="mb-2 rounded-card bg-cell px-4 py-3.5"
        style={{ borderCurve: "continuous" }}
      >
        <Text className="text-[13px] font-bold text-label">
          이번 주{" "}
          <Text className="text-tint">{`${stats.streakDays}일 연속`}</Text>
        </Text>
        <View className="mt-3 flex-row justify-between">
          {stats.weeklyActivity.map((day) => (
            <View key={day.weekday} className="items-center gap-1.5">
              <View
                className={`h-[26px] w-[26px] rounded-full ${
                  day.isToday
                    ? "border-2 border-tint bg-cell"
                    : day.studied
                      ? "bg-tint"
                      : "bg-fill"
                }`}
              />
              <Text className="text-[11px] text-tertiary">{day.weekday}</Text>
            </View>
          ))}
        </View>
      </View>

      <GroupedListHeader label="학습 설정" />
      <GroupedList>
        <GroupedListRow
          first
          label="닉네임"
          value={profile.nickname ?? "없음"}
        />
        <GroupedListRow label="영어 수준" value={level} />
        <GroupedListRow
          label="학습 목적"
          value={summarize(
            profile.learningGoals.map((goal) => LEARNING_GOAL_LABEL[goal]),
          )}
        />
        <GroupedListRow
          label="장르 취향"
          value={summarize(
            profile.genrePreferences.map((genre) => GENRE_LABEL[genre]),
          )}
        />
        <GroupedListRow
          label="관심사"
          value={summarize(
            profile.interests.map((interest) => INTEREST_LABEL[interest]),
          )}
        />
      </GroupedList>

      <GroupedListHeader label="계정" />
      <GroupedList>
        <GroupedListRow
          first
          label="Apple 계정"
          value="t*****e@privaterelay.appleid.com"
          showChevron={false}
        />
      </GroupedList>
      <View className="mt-2">
        <GroupedList>
          <GroupedListDangerRow
            label="로그아웃"
            onPress={() => router.replace("/login")}
          />
        </GroupedList>
      </View>
    </ScreenScroll>
  );
}
