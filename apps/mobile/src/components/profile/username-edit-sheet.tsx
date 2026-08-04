import {
  FieldGroup,
  Icon,
  ListItem,
  Row,
  Text,
  TextInput,
  useNativeState,
} from "@expo/ui";
import {
  accessibilityLabel,
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
import { useAppTheme } from "../../theme/app-theme";
import { ProfileEditSheet } from "./profile-edit-sheet";

const USERNAME_RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

export function UsernameEditSheet({
  initialValue,
  onDismiss,
  userId,
}: {
  initialValue: string;
  onDismiss: () => void;
  userId: string;
}) {
  const app = useAppTheme();
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
      <Icon color={app.success} name="checkmark.circle.fill" size={20} />
    );
  } else if (status === "taken") {
    trailing = (
      <Icon color={app.danger} name="exclamationmark.circle.fill" size={20} />
    );
  }

  const footer =
    status === "taken" ? "이미 사용 중인 아이디예요." : USERNAME_RULE;

  return (
    <ProfileEditSheet
      canSave={canSave}
      onDismiss={onDismiss}
      onSave={handleSave}
      pending={save.isPending}
      testID="username-edit-sheet"
      title="아이디"
    >
      <FieldGroup>
        <FieldGroup.Section>
          <Row alignment="center" spacing={8}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              editable={!save.isPending}
              keyboardType="ascii-capable"
              maxLength={USERNAME_MAX}
              modifiers={[
                frame({ maxWidth: Number.POSITIVE_INFINITY }),
                accessibilityLabel("아이디"),
              ]}
              onChangeText={handleChangeText}
              value={username}
            />
            {trailing}
          </Row>
          <FieldGroup.SectionFooter>
            <Text
              modifiers={[
                foregroundStyle(
                  status === "taken" ? app.danger : app.mutedForeground
                ),
              ]}
            >
              {footer}
            </Text>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>

        {status === "taken" && suggestions.length > 0 ? (
          <FieldGroup.Section title="추천">
            {suggestions.map((suggestion) => (
              <UsernameSuggestion
                disabled={save.isPending}
                key={suggestion}
                onSelect={handleChangeText}
                value={suggestion}
              />
            ))}
          </FieldGroup.Section>
        ) : null}
      </FieldGroup>
    </ProfileEditSheet>
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
    <ListItem onPress={disabled ? undefined : handlePress}>{value}</ListItem>
  );
}
