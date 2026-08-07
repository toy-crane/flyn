import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Chip,
  Description,
  FieldError,
  InputGroup,
  TextField,
  Typography,
  useThemeColor,
} from "heroui-native";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import {
  checkUsernameAvailability,
  isUsernameAlreadyTaken,
  useSaveUsername,
} from "../../lib/use-profile";
import { useUsernameAvailability } from "../../lib/use-username-availability";
import {
  createUsernameSuggestions,
  isUsernameValid,
  normalizeUsername,
  USERNAME_MAX,
} from "../../lib/username";
import { ProfileEditScreen } from "./profile-edit-screen";

const USERNAME_RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

/**
 * 아이디 편집 시트의 본문. 저장·폐기·잠금은 toolbar가 소유하고 여기에는 필드와
 * 가용성 신호, 중복일 때의 추천만 둔다
 * (docs/decisions/settings-edits-use-native-form.md).
 */
export function UsernameEditForm({
  initialValue,
  onDismiss,
  userId,
}: {
  initialValue: string;
  onDismiss: () => void;
  userId: string;
}) {
  const save = useSaveUsername(userId);
  const [typed, setTyped] = useState(initialValue);
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const normalized = normalizeUsername(typed);
  const checkedStatus = useUsernameAvailability(normalized);
  const status = duplicateValue === normalized ? "taken" : checkedStatus;
  const taken = status === "taken";
  const changed = normalized !== normalizeUsername(initialValue);
  const canSave =
    changed &&
    isUsernameValid(normalized) &&
    status !== "checking" &&
    status !== "invalid" &&
    !taken;
  const [successColor, dangerColor] = useThemeColor(["success", "danger"]);

  useEffect(() => {
    if (!taken) {
      setSuggestions([]);
      return;
    }

    let current = true;
    createUsernameSuggestions(normalized, checkUsernameAvailability)
      .then((next) => {
        if (current) {
          setSuggestions(next);
        }
      })
      .catch(() => {
        if (current) {
          setSuggestions([]);
        }
      });

    return () => {
      current = false;
    };
  }, [normalized, taken]);

  const handleChangeText = useCallback((next: string) => {
    setTyped(normalizeUsername(next));
    setDuplicateValue(null);
  }, []);

  const handleSave = useCallback(() => {
    const value = normalizeUsername(typed);
    if (!(canSave && isUsernameValid(value) && !save.isPending)) {
      return;
    }

    save.mutate(value, {
      onError: (error) => {
        // 저장 순간의 유니크 위반은 일반 실패가 아니라 중복 상태다.
        if (isUsernameAlreadyTaken(error)) {
          setDuplicateValue(value);
          return;
        }
        saveFailed();
      },
      onSuccess: onDismiss,
    });
  }, [canSave, onDismiss, save, typed]);

  /*
   * 가용성은 필드 안 trailing 자리에서 말한다
   * (docs/decisions/self-contained-native-ui-boundaries.md). 아이콘은 브랜드 층
   * 어휘인 Ionicons를 쓰고 색은 의미 토큰이 준다
   * (docs/decisions/apple-hig-with-app-theme.md). 색과 모양만으로 뜻을 나르지
   * 않도록 상태를 그대로 읽는 접근성 이름을 함께 둔다. 확인 중과 규칙 위반은
   * 아직 말할 것이 없어 어느 신호도 그리지 않는다 — 온보딩 아이디 화면과 같다.
   */
  let signal: ReactNode = null;
  if (status === "available") {
    signal = (
      <Ionicons
        accessibilityLabel="사용할 수 있는 아이디예요"
        color={successColor}
        name="checkmark-circle"
        size={20}
      />
    );
  } else if (taken) {
    signal = (
      <Ionicons
        accessibilityLabel="사용 중인 아이디예요"
        color={dangerColor}
        name="alert-circle"
        size={20}
      />
    );
  }

  return (
    <ProfileEditScreen
      canSave={canSave}
      onDismiss={onDismiss}
      onSave={handleSave}
      pending={save.isPending}
    >
      {/* 중복만 danger로 말한다 — 규칙 위반은 저장만 잠근다. */}
      <TextField isDisabled={save.isPending} isInvalid={taken}>
        {/*
         * 온보딩과 달리 보이는 `Label`을 두지 않는다. 시트 제목이 이미 무엇을
         * 고치는지 말한다(docs/specs/input-form-style/spec.md) — 접근성 이름만
         * 필드에 남긴다.
         *
         * `InputGroup`은 자기 context의 disabled를 입력에 그대로 내리므로
         * `TextField`의 상태가 여기까지 닿으려면 같은 값을 함께 받아야 한다.
         */}
        <InputGroup isDisabled={save.isPending}>
          <InputGroup.Input
            accessibilityLabel="아이디"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            keyboardType="ascii-capable"
            maxLength={USERNAME_MAX}
            onChangeText={handleChangeText}
            value={typed}
          />
          {/* 상태 표시라 누를 것이 없다 — 탭은 밑의 입력으로 흘려보내되
              아이콘의 접근성 이름은 트리에 남긴다. */}
          <InputGroup.Suffix pointerEvents="none">{signal}</InputGroup.Suffix>
        </InputGroup>
        <Description hideOnInvalid>{USERNAME_RULE}</Description>
        <FieldError>이미 사용 중인 아이디예요.</FieldError>
      </TextField>

      {taken && suggestions.length > 0 ? (
        <View className="gap-2">
          <Typography color="muted" type="body-sm">
            추천
          </Typography>
          <View className="flex-row flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <UsernameSuggestion
                disabled={save.isPending}
                key={suggestion}
                onSelect={handleChangeText}
                value={suggestion}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ProfileEditScreen>
  );
}

/** 누르면 값만 채운다 — 저장은 사용자가 toolbar로 한다. */
function UsernameSuggestion({
  disabled,
  onSelect,
  value,
}: {
  disabled: boolean;
  onSelect: (value: string) => void;
  value: string;
}) {
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Chip
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      size="sm"
      variant="secondary"
    >
      <Chip.Label>{value}</Chip.Label>
    </Chip>
  );
}
