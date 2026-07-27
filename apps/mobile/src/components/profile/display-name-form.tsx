import {
  Button,
  Column,
  Host,
  Text,
  TextInput,
  useNativeState,
} from "@expo/ui";
import {
  controlSize,
  font,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useCallback, useState } from "react";
import {
  DISPLAY_NAME_MAX,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../../lib/display-name";
import { colors } from "../../theme/colors";

/**
 * 온보딩과 설정의 편집이 **같은 화면을 쓴다**(§4). 검증·저장 규칙이 갈리지
 * 않게 하는 가장 확실한 방법은 규칙을 공유하는 게 아니라 화면을 공유하는 것이다.
 *
 * universal `@expo/ui`로 만든다 — RN 경계가 필요한 것이 하나도 없다.
 *
 * 색은 두 자리뿐이다. 배경은 `Host`에 주고(경계의 RN 쪽이라 `PlatformColor`가
 * 통한다), 글자색은 `foregroundStyle` 모디파이어로만 준다 — `textStyle.color`는
 * CSS 문자열만 받아 hex를 칠하게 되고 그러면 다크 모드가 굳는다.
 *
 * **`initialValue`는 마운트 때 한 번만 읽는다.** 온보딩은 provider가 준 이름
 * 후보를, 편집은 지금 저장된 이름을 미리 채우는데, 둘 다 사용자가 고치는 중에
 * 밖에서 값이 바뀌어 입력을 덮어써서는 안 된다. 후보를 늦게 얻는 쪽(온보딩)은
 * 얻은 뒤에 이 폼을 그린다.
 */
export function DisplayNameForm({
  description,
  failure,
  initialValue,
  onSubmit,
  pending,
  submitLabel,
}: {
  description: string;
  failure?: string;
  initialValue: string;
  onSubmit: (name: string) => void;
  pending?: boolean;
  submitLabel: string;
}) {
  const name = useNativeState(initialValue);
  // 버튼 잠금을 판단하려면 렌더가 필요해서 React 상태에 한 번 더 비춘다.
  // **이 미러는 잠금 판단에만 쓴다** — 제출값을 여기서 읽으면 네이티브 쪽이
  // 앞서 있는 만큼 마지막 글자가 빠진다.
  const [typed, setTyped] = useState(initialValue);

  const handleChangeText = useCallback(
    (next: string) => {
      name.value = next;
      setTyped(next);
    },
    [name]
  );

  const submit = useCallback(
    (text: string) => {
      const trimmed = normalizeDisplayName(text);

      if (isDisplayNameSubmittable(trimmed) && !pending) {
        onSubmit(trimmed);
      }
    },
    [onSubmit, pending]
  );

  // 버튼에서는 네이티브 상태가 진실이다. 리턴 키는 현재 값을 함께 준다.
  const handlePress = useCallback(() => submit(name.value), [name, submit]);

  const locked = !isDisplayNameSubmittable(typed) || Boolean(pending);

  return (
    <Host style={{ backgroundColor: colors.systemBackground, flex: 1 }}>
      <Column
        alignment="start"
        spacing={12}
        style={{ paddingHorizontal: 20, paddingTop: 24 }}
      >
        <Text
          modifiers={[
            font({ textStyle: "subheadline" }),
            foregroundStyle({ style: "secondary", type: "hierarchical" }),
          ]}
        >
          {description}
        </Text>

        <TextInput
          autoFocus
          // 서버가 거부할 길이를 애초에 입력하지 못하게 막는다. 진짜 경계는
          // DB의 profiles_display_name_length다.
          maxLength={DISPLAY_NAME_MAX}
          onChangeText={handleChangeText}
          onSubmitEditing={submit}
          placeholder="표시 이름"
          returnKeyType="done"
          value={name}
        />

        {failure ? (
          <Text
            modifiers={[
              font({ textStyle: "footnote" }),
              foregroundStyle(colors.systemRed),
            ]}
          >
            {failure}
          </Text>
        ) : null}

        <Button
          // 비활성 외형을 손으로 칠하지 않는다 — iOS가 알아서 준다.
          disabled={locked}
          label={submitLabel}
          modifiers={[controlSize("large")]}
          onPress={handlePress}
        />
      </Column>
    </Host>
  );
}
