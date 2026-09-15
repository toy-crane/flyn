import { router, Stack, useLocalSearchParams } from "expo-router";

import { noteLabels } from "@/features/note/ui/note-labels";
import { NoteAskScreen } from "@/screens/note/note-ask-screen";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

/**
 * 닫는 것이지 뒤로 가는 것이 아니다. 아래에 있는 노트는 이 화면이 거쳐 온 화면이
 * 아니고, 플랫폼의 시트 제스처도 같은 일을 한다.
 */
function closeAsk() {
  if (router.canDismiss()) {
    router.dismiss();
  }
}

/** 표현 노트의 카드에서 연 `AI에게 물어보기`. */
export default function NoteAskRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <NoteAskScreen id={id} onMissing={closeAsk} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={noteLabels.askClose}
          icon={toolbarIcon("close")}
          onPress={closeAsk}
        />
      </Stack.Toolbar>
    </>
  );
}
