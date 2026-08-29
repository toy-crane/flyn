import { useMemo } from "react";
import { Image, Text, View } from "react-native";

import { readStoryCoverUrl } from "@/features/story/api/story-cover";
import { getSupabaseClient } from "@/shared/supabase/client";

/**
 * 스토리의 표지 타일.
 *
 * 이모지가 바탕에 늘 깔리고, 대표 캐릭터 일러스트가 있으면 그 위를 덮는다.
 * 그림을 아직 그리지 않은 스토리도, 그림을 못 받아 온 화면도 빈 사각형 대신
 * 그 스토리를 알아볼 무언가를 남긴다.
 *
 * 표지는 스토리를 알아보는 표시일 뿐 읽을 내용이 아니라서 보조 기술에는
 * 드러내지 않는다. 목록 행과 카드가 이미 제목과 소개를 읽어 준다.
 */
export function StoryCover({
  emoji,
  imagePath,
}: {
  emoji: string;
  imagePath: string | null;
}) {
  const imageUrl = useMemo(
    () =>
      imagePath ? readStoryCoverUrl(getSupabaseClient(), imagePath) : null,
    [imagePath]
  );

  return (
    <View
      accessibilityElementsHidden
      className="size-[72px] items-center justify-center overflow-hidden rounded-[14px] bg-accent-soft"
      importantForAccessibility="no-hide-descendants"
      testID="story-cover"
    >
      <Text className="text-3xl">{emoji}</Text>
      {imageUrl ? (
        <Image
          className="absolute inset-0 size-full"
          source={{ uri: imageUrl }}
          testID="story-cover-image"
        />
      ) : null}
    </View>
  );
}
