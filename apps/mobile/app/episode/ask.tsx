import { router, Stack, useLocalSearchParams } from "expo-router";
import { correctionLabels } from "@/features/episode/ui/episode-labels";
import { EpisodeAskScreen } from "@/screens/episode/episode-ask-screen";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

/**
 * 닫는 것이지 뒤로 가는 것이 아니다. 아래에 있는 에피소드는 이 화면이 거쳐 온
 * 화면이 아니고, 플랫폼의 시트 제스처도 같은 일을 한다.
 */
function closeAsk() {
  if (router.canDismiss()) {
    router.dismiss();
  }
}

function AskToolbar() {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button
        accessibilityLabel={correctionLabels.askClose}
        icon={toolbarIcon("close")}
        onPress={closeAsk}
      />
    </Stack.Toolbar>
  );
}

export default function EpisodeAskRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <EpisodeAskScreen id={id} onMissing={closeAsk} />
      <AskToolbar />
    </>
  );
}
