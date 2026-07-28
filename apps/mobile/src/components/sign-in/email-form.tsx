import { Host } from "@expo/ui";
import {
  Button,
  ProgressView,
  Spacer,
  Text,
  TextField,
  useNativeState,
  VStack,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  keyboardType,
  onSubmit as onSubmitModifier,
  padding,
  submitLabel,
  textContentType,
  textFieldStyle,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import { useCallback, useState } from "react";
import { isEmailSubmittable } from "../../lib/otp-code";
import { colors } from "../../theme/colors";

/**
 * 이메일 입력만 하는 화면. SwiftUI로 만든다 —
 * docs/decisions/expo-ui-by-default.md의 판정표에서 RN이 하나도 필요 없는
 * 유일한 로그인 화면이고, 맨 `TextField`는 스파이크에서 정상 동작했다.
 *
 * **`TextField`에 `frame` 모디파이어를 걸지 않는다.** 스파이크가 확인한 대로
 * `frame`은 히트 영역을 죽여 탭이 포커스를 잡지 못하게 한다. 크기가 필요하면
 * 바깥 `VStack`에 건다.
 *
 * 색은 두 자리에서만 준다. 나머지는 SwiftUI 기본값이 이미 시맨틱 색이다.
 *
 * - **배경은 `Host`에.** `Host`는 경계의 RN 쪽이라 `PlatformColor`가 통한다.
 *   안 주면 네이티브 기본값이 grouped 회색이라 systemBackground를 잃는다.
 * - **글자색은 `foregroundStyle`로.** 이 모디파이어만 `PlatformColor`와 계층
 *   스타일을 받는다. `background`·`tint`는 hex만 받으므로 쓰지 않는다 —
 *   hex를 칠하면 다크 모드가 굳는다.
 */
export function EmailForm({
  failure,
  onSubmit,
  pending,
}: {
  failure?: string;
  onSubmit: (email: string) => void;
  pending?: boolean;
}) {
  const email = useNativeState("");
  // 버튼 잠금을 판단하려면 렌더가 필요해서 React 상태에 한 번 더 비춘다.
  // **이 미러는 잠금 판단에만 쓴다.** 한 프레임 늦어도 잠금은 곧 따라잡지만,
  // 제출값을 여기서 읽으면 마지막 글자가 빠진 주소가 나간다.
  const [typed, setTyped] = useState("");

  const handleTextChange = useCallback(
    (next: string) => {
      email.value = next;
      setTyped(next);
    },
    [email]
  );

  const submit = useCallback(() => {
    // 진실은 네이티브 상태다. 값은 네이티브 쪽에서 동기로 갱신되어 React 렌더보다
    // 앞서므로, 미러를 읽으면 방금 친 글자를 놓친다 — 시뮬레이터에서
    // verify@example.test가 verify@example.tes로 발송됐다.
    const address = email.value.trim();

    if (isEmailSubmittable(address) && !pending) {
      onSubmit(address);
    }
  }, [email, onSubmit, pending]);

  const locked = !isEmailSubmittable(typed) || Boolean(pending);

  return (
    // 배경은 `Host`에 준다. `Host`는 경계의 RN 쪽이라 `PlatformColor`가 통하고,
    // 안쪽 SwiftUI의 `background` 모디파이어는 hex만 받아 다크 모드를 깬다.
    // 지정하지 않으면 네이티브 기본값이 grouped 회색이라 systemBackground를
    // 어긴다 — 시뮬레이터에서 실제로 회색으로 나왔다.
    <Host style={{ backgroundColor: colors.systemBackground, flex: 1 }}>
      <VStack
        alignment="leading"
        modifiers={[padding({ horizontal: 20, top: 24 })]}
        spacing={12}
      >
        <Text
          modifiers={[
            font({ textStyle: "subheadline" }),
            foregroundStyle({ style: "secondary", type: "hierarchical" }),
          ]}
        >
          코드를 받을 이메일 주소를 입력해 주세요.
        </Text>

        <TextField
          autoFocus
          modifiers={[
            textFieldStyle("roundedBorder"),
            keyboardType("email-address"),
            textContentType("emailAddress"),
            textInputAutocapitalization("never"),
            autocorrectionDisabled(),
            // 이메일 경로가 한 탭 뒤에 있으니 리턴 키로도 제출되게 한다.
            submitLabel("continue"),
            onSubmitModifier(submit),
          ]}
          onTextChange={handleTextChange}
          placeholder="이메일 주소"
          text={email}
        />

        {failure ? (
          <Text
            modifiers={[
              font({ textStyle: "footnote" }),
              // hex가 아니라 토큰이다 — foregroundStyle은 PlatformColor를 받는다.
              foregroundStyle(colors.systemRed),
            ]}
          >
            {failure}
          </Text>
        ) : null}

        <Button
          label="코드 받기"
          modifiers={[
            buttonStyle("borderedProminent"),
            controlSize("large"),
            // 비활성 외형을 손으로 칠하지 않는다 — iOS가 알아서 준다.
            disabled(locked),
          ]}
          onPress={submit}
        />

        {pending ? <ProgressView /> : null}

        <Spacer />
      </VStack>
    </Host>
  );
}
