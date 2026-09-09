import { isBlurhashValid } from "blurhash";
import { Image } from "expo-image";
import { useMemo } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { readStoryCoverUrl } from "@/features/story/api/story-cover";
import { getSupabaseClient } from "@/shared/supabase/client";

const CoverImage = withUniwind(Image);
const BASE83 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

/** 표지는 제목과 함께 표시하는 장식 이미지다. 로딩 중에는 같은 원본의 미리보기를 보인다. */
export function StoryCover({
  blurhash,
  imagePath,
}: {
  blurhash: string | null;
  imagePath: string | null;
}) {
  const imageUrl = useMemo(
    () =>
      imagePath ? readStoryCoverUrl(getSupabaseClient(), imagePath) : null,
    [imagePath]
  );
  const validHash =
    typeof blurhash === "string" &&
    [...blurhash].every((character) => BASE83.includes(character)) &&
    isBlurhashValid(blurhash).result;

  return (
    <View
      accessibilityElementsHidden
      className="size-[72px] overflow-hidden rounded-[14px] bg-accent-soft"
      importantForAccessibility="no-hide-descendants"
      testID="story-cover"
    >
      {imageUrl ? (
        <CoverImage
          accessible={false}
          className="size-full"
          contentFit="cover"
          key={imageUrl}
          placeholder={validHash ? { blurhash } : null}
          placeholderContentFit="cover"
          recyclingKey={imageUrl}
          source={{ uri: imageUrl }}
          testID="story-cover-image"
          transition={200}
        />
      ) : null}
    </View>
  );
}
