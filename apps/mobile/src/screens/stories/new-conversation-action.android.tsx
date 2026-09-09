import { Host, Text, TextButton } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

import { storyLabels } from "@/features/story/ui/story-labels";
import type { NewConversationActionProps } from "./new-conversation-action";

/**
 * Android의 `새 대화`.
 *
 * Material 3 텍스트 버튼이다. 색과 눌린 상태는 Material이 소유한다. 여기서 색을
 * 고르면 두 플랫폼의 헤더 액션을 앱이 맞춰 들고 있어야 한다.
 *
 * `Host matchContents`가 폭을 내용에 맞춘다. 이것이 없으면 툴바에 들어간 React
 * Native 뷰가 바 전체로 늘어나 제목과 뒤로 가기를 밀어낸다.
 *
 * 이름은 감싼 뷰가 들고 있다. Compose 버튼은 접근성 노드를 스스로 만들어서
 * 바깥에서 붙인 이름이 그 노드에 닿지 않는다. `ProfileSaveHeaderAction`과 같은
 * 자리이고, 남는 이름 없는 노드도 같은 이유로 남는다.
 * docs/follow-ups/android-compose-button-unnamed-node.md를 본다.
 */
export function NewConversationAction({ onPress }: NewConversationActionProps) {
  return (
    <View
      accessibilityLabel={storyLabels.newConversation}
      accessibilityRole="button"
      accessible
    >
      <Host matchContents>
        {/*
          Compose 버튼의 자식은 Compose 요소여야 한다. 문자열을 그대로 넣으면
          React Native가 <Text> 밖의 글자로 보고 화면에 오류를 띄운다.
        */}
        <TextButton onClick={onPress}>
          <Text>{storyLabels.newConversation}</Text>
        </TextButton>
      </Host>
    </View>
  );
}
