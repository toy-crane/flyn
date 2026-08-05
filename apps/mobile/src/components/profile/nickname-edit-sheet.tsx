import { Column, Text, useNativeState } from "@expo/ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import {
  DISPLAY_NAME_MAX,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../../lib/display-name";
import { useSaveDisplayName } from "../../lib/use-profile";
import { FormInput } from "../forms/form-input";
import { ProfileEditSheet } from "./profile-edit-sheet";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

export function NicknameEditSheet({
  initialValue,
  onDismiss,
  userId,
}: {
  initialValue: string;
  onDismiss: () => void;
  userId: string;
}) {
  const save = useSaveDisplayName(userId);
  const name = useNativeState(initialValue);
  const [typed, setTyped] = useState(initialValue);
  const normalized = normalizeDisplayName(typed);
  const canSave =
    normalized !== normalizeDisplayName(initialValue) &&
    isDisplayNameSubmittable(normalized);

  const handleChangeText = useCallback(
    (next: string) => {
      name.value = next;
      setTyped(next);
    },
    [name]
  );

  const handleSave = useCallback(() => {
    const value = normalizeDisplayName(name.value);
    if (canSave && !save.isPending && isDisplayNameSubmittable(value)) {
      save.mutate(value, { onError: saveFailed, onSuccess: onDismiss });
    }
  }, [canSave, name, onDismiss, save]);

  return (
    <ProfileEditSheet
      canSave={canSave}
      onDismiss={onDismiss}
      onSave={handleSave}
      pending={save.isPending}
      testID="nickname-edit-sheet"
      title="닉네임"
    >
      <Column spacing={8} style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <FormInput
          autoComplete="nickname"
          autoFocus
          editable={!save.isPending}
          label="닉네임"
          maxLength={DISPLAY_NAME_MAX}
          onChangeText={handleChangeText}
          value={name}
        />
        <Text
          modifiers={[
            foregroundStyle({
              style: "secondary",
              type: "hierarchical",
            }),
          ]}
        >
          1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.
        </Text>
      </Column>
    </ProfileEditSheet>
  );
}
