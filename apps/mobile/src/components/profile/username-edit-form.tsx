import { Button, Column, Icon, Text, useNativeState } from "@expo/ui";
import {
  buttonStyle,
  font,
  foregroundStyle,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
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
import { useColors } from "../../theme/app-theme";
import { FormInput } from "../forms/form-input";
import { ProfileEditScreen } from "./profile-edit-screen";

const USERNAME_RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

export function UsernameEditForm({
  initialValue,
  onDismiss,
  userId,
}: {
  initialValue: string;
  onDismiss: () => void;
  userId: string;
}) {
  const colors = useColors();
  const save = useSaveUsername(userId);
  const username = useNativeState(initialValue);
  const [typed, setTyped] = useState(initialValue);
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const normalized = normalizeUsername(typed);
  const checkedStatus = useUsernameAvailability(normalized);
  const status = duplicateValue === normalized ? "taken" : checkedStatus;
  const changed = normalized !== normalizeUsername(initialValue);
  const canSave =
    changed &&
    isUsernameValid(normalized) &&
    status !== "checking" &&
    status !== "invalid" &&
    status !== "taken";

  useEffect(() => {
    if (status !== "taken") {
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
  }, [normalized, status]);

  const handleChangeText = useCallback(
    (next: string) => {
      const value = normalizeUsername(next);
      username.value = value;
      setTyped(value);
      setDuplicateValue(null);
    },
    [username]
  );

  const handleSave = useCallback(() => {
    const value = normalizeUsername(username.value);
    if (!(canSave && isUsernameValid(value) && !save.isPending)) {
      return;
    }

    save.mutate(value, {
      onError: (error) => {
        if (isUsernameAlreadyTaken(error)) {
          setDuplicateValue(value);
          return;
        }
        saveFailed();
      },
      onSuccess: onDismiss,
    });
  }, [canSave, onDismiss, save, username]);

  let trailing: ReactNode = null;
  if (status === "available") {
    trailing = (
      <Icon color={colors.success} name="checkmark.circle.fill" size={20} />
    );
  } else if (status === "taken") {
    trailing = (
      <Icon
        color={colors.danger}
        name="exclamationmark.circle.fill"
        size={20}
      />
    );
  }

  const footer =
    status === "taken" ? "이미 사용 중인 아이디예요." : USERNAME_RULE;

  return (
    <ProfileEditScreen
      canSave={canSave}
      onDismiss={onDismiss}
      onSave={handleSave}
      pending={save.isPending}
    >
      <Column spacing={8} style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <FormInput
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          editable={!save.isPending}
          invalid={status === "taken"}
          keyboardType="ascii-capable"
          label="아이디"
          maxLength={USERNAME_MAX}
          onChangeText={handleChangeText}
          trailing={trailing}
          value={username}
        />
        <Text
          modifiers={[
            foregroundStyle(
              status === "taken"
                ? colors.danger
                : { style: "secondary", type: "hierarchical" }
            ),
          ]}
        >
          {footer}
        </Text>

        {status === "taken" && suggestions.length > 0 ? (
          <Column spacing={4} style={{ paddingTop: 16 }}>
            <Text
              modifiers={[
                font({ textStyle: "footnote", weight: "semibold" }),
                foregroundStyle({
                  style: "secondary",
                  type: "hierarchical",
                }),
              ]}
            >
              추천
            </Text>
            {suggestions.map((suggestion) => (
              <UsernameSuggestion
                disabled={save.isPending}
                key={suggestion}
                onSelect={handleChangeText}
                value={suggestion}
              />
            ))}
          </Column>
        ) : null}
      </Column>
    </ProfileEditScreen>
  );
}

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
    <Button
      disabled={disabled}
      modifiers={[
        buttonStyle("plain"),
        frame({
          alignment: "leading",
          maxWidth: Number.POSITIVE_INFINITY,
          minHeight: 44,
        }),
      ]}
      onPress={handlePress}
    >
      <Text>{value}</Text>
    </Button>
  );
}
