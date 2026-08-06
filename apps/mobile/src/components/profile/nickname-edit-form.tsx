import { Description, Input, TextField } from "heroui-native";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import {
  DISPLAY_NAME_MAX,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../../lib/display-name";
import { useSaveDisplayName } from "../../lib/use-profile";
import { ProfileEditScreen } from "./profile-edit-screen";

const NICKNAME_RULE = "1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

/**
 * 닉네임 편집 시트의 본문. 저장·폐기·잠금은 toolbar가 소유하고 여기에는 필드와
 * 규칙 각주만 둔다(docs/decisions/settings-edits-use-native-form.md).
 */
export function NicknameEditForm({
  initialValue,
  onDismiss,
  userId,
}: {
  initialValue: string;
  onDismiss: () => void;
  userId: string;
}) {
  const save = useSaveDisplayName(userId);
  const [typed, setTyped] = useState(initialValue);
  const normalized = normalizeDisplayName(typed);
  const canSave =
    normalized !== normalizeDisplayName(initialValue) &&
    isDisplayNameSubmittable(normalized);

  const handleSave = useCallback(() => {
    const value = normalizeDisplayName(typed);
    if (canSave && !save.isPending && isDisplayNameSubmittable(value)) {
      save.mutate(value, { onError: saveFailed, onSuccess: onDismiss });
    }
  }, [canSave, onDismiss, save, typed]);

  return (
    <ProfileEditScreen
      canSave={canSave}
      onDismiss={onDismiss}
      onSave={handleSave}
      pending={save.isPending}
    >
      {/* 저장 중에는 필드를 잠근다 — `TextField`가 상태를 본문 전체에 내린다. */}
      <TextField isDisabled={save.isPending}>
        {/*
         * 온보딩과 달리 보이는 `Label`을 두지 않는다. 시트 제목이 이미 무엇을
         * 고치는지 말한다(docs/specs/input-form-style/spec.md) — 접근성 이름만
         * 필드에 남긴다.
         */}
        <Input
          accessibilityLabel="닉네임"
          autoComplete="nickname"
          autoFocus
          maxLength={DISPLAY_NAME_MAX}
          onChangeText={setTyped}
          value={typed}
        />
        {/*
         * 규칙은 오류가 아니라 각주다. 이모지처럼 쓸 수 없는 문자는 빨간 오류를
         * 띄우는 대신 저장만 잠근다
         * (docs/decisions/settings-edits-use-native-form.md).
         */}
        <Description>{NICKNAME_RULE}</Description>
      </TextField>
    </ProfileEditScreen>
  );
}
