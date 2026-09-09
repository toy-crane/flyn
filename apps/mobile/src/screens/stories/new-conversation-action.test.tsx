import { expect, jest, test } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { NewConversationAction } from "./new-conversation-action";

/*
  기본 구현은 아무것도 그리지 않는다. iOS의 `새 대화`는 헤더가 직접 그리는
  `Stack.Toolbar.Button`이고, 이 컴포넌트는 그것을 그리지 못하는 플랫폼만
  마운트한다. Jest는 기본 파일을 읽으므로 여기서 확인하는 것도 그 사실이다.

  Android 구현의 실제 표시와 동작은 기기에서 확인한다. Compose 뷰는 Jest에서
  그려지지 않는다.
*/
test("헤더가 텍스트 액션을 직접 그리는 플랫폼에서는 아무것도 그리지 않는다", async () => {
  await render(<NewConversationAction onPress={jest.fn()} />);

  expect(screen.queryByText("새 대화")).toBeNull();
});
