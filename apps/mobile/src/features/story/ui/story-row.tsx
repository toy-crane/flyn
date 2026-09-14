import { ListGroup } from "heroui-native/list-group";

import { StoryCover } from "@/features/story/ui/story-cover";
import { PressableListRow } from "@/shared/ui/list-row";

/**
 * 목록의 스토리 한 줄.
 *
 * 탐색과 스토리 탭이 같은 것을 쓴다. 두 목록이 보여 주는 것은 표지, 제목, 한 줄
 * 소개로 같고, 다른 것은 눌렀을 때 어디로 가느냐뿐이다.
 *
 * 진행 바가 없다. 같은 스토리를 여러 회차로 진행하므로 목록에 세울 대표 진행이
 * 없고, 회차별 진행은 대화 기록이 카드마다 따로 보여 준다.
 *
 * HeroUI `ListGroup` 행이다. 부르는 쪽이 `ListGroup` 안에 행 사이 `Separator`와
 * 함께 세운다.
 */
export function StoryRow({
  coverBlurhash,
  coverImagePath,
  hook,
  onPress,
  testID,
  title,
}: {
  coverBlurhash: string | null;
  coverImagePath: string | null;
  hook: string;
  onPress: () => void;
  testID?: string;
  title: string;
}) {
  return (
    <PressableListRow
      accessibilityLabel={`${title}, ${hook}`}
      onPress={onPress}
      testID={testID}
    >
      <ListGroup.ItemPrefix>
        <StoryCover blurhash={coverBlurhash} imagePath={coverImagePath} />
      </ListGroup.ItemPrefix>
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle numberOfLines={1}>{title}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription numberOfLines={2}>
          {hook}
        </ListGroup.ItemDescription>
      </ListGroup.ItemContent>
      <ListGroup.ItemSuffix />
    </PressableListRow>
  );
}
