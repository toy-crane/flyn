import { Surface, Typography } from "heroui-native";
import { View } from "react-native";

/**
 * 창 상단에 **고정되는** 인용 카드. 목록 머리에 두면 스크롤과 함께 사라져,
 * 지난 질문을 되짚는 동안 어느 문장을 두고 묻는지 잃는다. 그래서 대화 목록
 * 바깥에 서고 스크롤을 타지 않는다.
 */
export function QuotedSentenceCard({ sentence }: { sentence: string }) {
  return (
    <View className="bg-background px-4 pt-3" testID="quoted-sentence-card">
      {/* 반지름은 HeroUI 스케일에서 고른다 — `--radius-xl`이 곧 12pt다. */}
      <Surface
        className="rounded-xl px-4 py-3"
        testID="quoted-sentence-surface"
      >
        <Typography className="mb-1" color="muted" type="body-xs">
          이 문장에 대해
        </Typography>
        <Typography selectable testID="quoted-sentence" type="body-sm">
          {sentence}
        </Typography>
      </Surface>
    </View>
  );
}
