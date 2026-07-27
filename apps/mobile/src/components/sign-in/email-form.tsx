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

/**
 * 이메일 입력만 하는 화면. SwiftUI로 만든다 —
 * docs/decisions/expo-ui-by-default.md의 판정표에서 RN이 하나도 필요 없는
 * 유일한 로그인 화면이고, 맨 `TextField`는 스파이크에서 정상 동작했다.
 *
 * **`TextField`에 `frame` 모디파이어를 걸지 않는다.** 스파이크가 확인한 대로
 * `frame`은 히트 영역을 죽여 탭이 포커스를 잡지 못하게 한다. 크기가 필요하면
 * 바깥 `VStack`에 건다.
 *
 * 색을 지정하지 않는다. SwiftUI 기본값이 이미 시맨틱 색이고(`Text`는 `label`,
 * 배경은 `systemBackground`), `background` 모디파이어는 hex만 받아 다크 모드를
 * 깬다 — theme/colors.ts는 여기 들어오지 않는다.
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
  // 네이티브 상태는 워클릿 쪽에서 갱신되므로 버튼 잠금 판단용으로 React 상태에
  // 한 번 더 비춘다.
  const [typed, setTyped] = useState("");

  const handleTextChange = useCallback(
    (next: string) => {
      email.value = next;
      setTyped(next);
    },
    [email]
  );

  const submit = useCallback(() => {
    const address = typed.trim();

    if (isEmailSubmittable(address) && !pending) {
      onSubmit(address);
    }
  }, [onSubmit, pending, typed]);

  const locked = !isEmailSubmittable(typed) || Boolean(pending);

  return (
    <Host style={{ flex: 1 }}>
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
            // §2가 이메일을 한 탭 뒤로 밀었으니 리턴 키로도 제출되게 한다.
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
              foregroundStyle("#FF3B30"),
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
