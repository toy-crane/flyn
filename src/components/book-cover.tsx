import { Text, View } from "@/tw";
import { GENRE_LABEL, type Genre } from "@/types/learner";
import { ENDING_BADGE, coverColorFor, type EndingKind } from "@/types/story";

type BookCoverProps = {
  title: string;
  genre: Genre;
  /** Omit on the book detail hero, where the badge is not repeated. */
  endingKind?: EndingKind;
  /** Grid covers stretch; the result hero uses a fixed width. */
  width?: number;
};

/** Genre-colored spine-shadowed cover, serif title — the book of a session. */
export function BookCover({
  title,
  genre,
  endingKind,
  width,
}: BookCoverProps) {
  return (
    <View
      className="aspect-[2/3] rounded-l-md rounded-r-2xl p-3"
      style={{
        backgroundColor: coverColorFor(genre),
        width,
        // the spine: an inner shadow on the left edge
        borderLeftWidth: 6,
        borderLeftColor: "rgba(0,0,0,0.22)",
      }}
    >
      <Text className="text-[11px] font-bold uppercase tracking-wider text-white/80">
        {GENRE_LABEL[genre]}
      </Text>
      <Text className="mt-1.5 font-story text-[17px] font-bold leading-tight text-white">
        {title}
      </Text>
      {endingKind ? (
        <View className="mt-auto self-start rounded-full bg-white/25 px-2 py-[3px]">
          <Text className="text-[10px] font-semibold text-white">
            {ENDING_BADGE[endingKind]}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
