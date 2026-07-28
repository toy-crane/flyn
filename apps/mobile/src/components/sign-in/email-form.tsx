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
import { useAppTheme } from "../../theme/app-theme";

/**
 * 이메일 입력만 하는 화면. SwiftUI로 만든다 —
 * docs/decisions/expo-ui-by-default.md의 판정표에서 RN이 하나도 필요 없는
 * 유일한 로그인 화면이고, 맨 `TextField`는 스파이크에서 정상 동작했다.
 *
 * **`TextField`에 `frame` 모디파이어를 걸지 않는다.** 스파이크가 확인한 대로
 * `frame`은 히트 영역을 죽여 탭이 포커스를 잡지 못하게 한다. 크기가 필요하면
 * 바깥 `VStack`에 건다.
 *
 * background와 interactive tint는 `Host`에 CSS 앱 테마를 전달한다. 나머지
 * 텍스트와 control 상태는 SwiftUI의 기본 계층 표현을 유지한다.
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
  const app = useAppTheme();
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
    // Host가 RN과 SwiftUI의 경계다. background와 tint만 공통 CSS 테마에서 주고
    // 안쪽 control의 상태 표현은 SwiftUI에 맡긴다.
    <Host
      seedColor={app.primary}
      style={{ backgroundColor: app.background, flex: 1 }}
    >
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
              foregroundStyle(app.danger),
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
            // borderedProminent의 기본 라벨은 다크 모드에서도 흰색이라, 흰
            // primary 배경과 겹치면 사라진다. 활성일 때만 on-primary를 준다.
            ...(locked ? [] : [foregroundStyle(app.primaryForeground)]),
          ]}
          onPress={submit}
        />

        {pending ? <ProgressView /> : null}

        <Spacer />
      </VStack>
    </Host>
  );
}
