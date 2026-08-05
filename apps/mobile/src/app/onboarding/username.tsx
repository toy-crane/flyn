import { Button, Column, Icon, Text, useNativeState } from "@expo/ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import { FormTextField } from "../../components/forms/form-text-field";
import { LaunchChecking } from "../../components/launch";
import { OnboardingForm } from "../../components/profile/onboarding-form";
import {
  checkUsernameAvailability,
  isUsernameAlreadyTaken,
  useProfile,
  useSaveUsername,
} from "../../lib/use-profile";
import { useUsernameAvailability } from "../../lib/use-username-availability";
import { useUserId } from "../../lib/user-id";
import {
  createUsernameFallback,
  createUsernameSuggestions,
  findAvailableUsername,
  isUsernameValid,
  normalizeUsername,
  USERNAME_MAX,
} from "../../lib/username";
import { useColors } from "../../theme/app-theme";

const USERNAME_RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

export default function UsernameOnboardingScreen() {
  const userId = useUserId();
  const profile = useProfile(userId);
  const save = useSaveUsername(userId);
  const [candidate, setCandidate] = useState<string | null>(null);
  const handleSubmit = useCallback(
    (username: string, onDuplicate: () => void) => {
      save.mutate(username, {
        onError: (error) => {
          if (isUsernameAlreadyTaken(error)) {
            onDuplicate();
            return;
          }
          saveFailed();
        },
      });
    },
    [save]
  );

  useEffect(() => {
    const email = profile.data?.email;
    if (!email) {
      return;
    }

    let current = true;
    findAvailableUsername(email, checkUsernameAvailability)
      .then((username) => {
        if (current) {
          setCandidate(username);
        }
      })
      .catch(() => {
        if (current) {
          setCandidate(createUsernameFallback(email));
        }
      });

    return () => {
      current = false;
    };
  }, [profile.data?.email]);

  if (candidate === null) {
    return <LaunchChecking />;
  }

  return (
    <UsernameForm
      initialValue={candidate}
      onSubmit={handleSubmit}
      pending={save.isPending}
    />
  );
}

function UsernameForm({
  initialValue,
  onSubmit,
  pending,
}: {
  initialValue: string;
  onSubmit: (username: string, onDuplicate: () => void) => void;
  pending: boolean;
}) {
  const colors = useColors();
  const username = useNativeState(initialValue);
  const [typed, setTyped] = useState(initialValue);
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const checkedStatus = useUsernameAvailability(typed);
  const normalized = normalizeUsername(typed);
  const status = duplicateValue === normalized ? "taken" : checkedStatus;

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

  const locked = useMemo(
    () =>
      pending ||
      status === "checking" ||
      status === "invalid" ||
      status === "taken",
    [pending, status]
  );

  const handleChangeText = useCallback(
    (next: string) => {
      const nextNormalized = normalizeUsername(next);
      username.value = nextNormalized;
      setTyped(nextNormalized);
      setDuplicateValue(null);
    },
    [username]
  );

  const submit = useCallback(
    (raw: string) => {
      const value = normalizeUsername(raw);
      if (!locked && isUsernameValid(value)) {
        onSubmit(value, () => setDuplicateValue(value));
      }
    },
    [locked, onSubmit]
  );
  const handlePress = useCallback(
    () => submit(username.value),
    [submit, username]
  );

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
    <OnboardingForm
      disabled={locked}
      onSubmit={handlePress}
      pending={pending}
      submitLabel="시작하기"
    >
      <Column alignment="start" spacing={16}>
        <Column alignment="start" spacing={8}>
          <FormTextField
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            invalid={status === "taken"}
            keyboardType="ascii-capable"
            label="아이디"
            maxLength={USERNAME_MAX}
            onChangeText={handleChangeText}
            onSubmitEditing={submit}
            placeholder="아이디"
            returnKeyType="done"
            trailing={trailing}
            value={username}
          />
          <Text
            modifiers={[
              font({ textStyle: "footnote" }),
              foregroundStyle(
                status === "taken"
                  ? colors.danger
                  : { style: "secondary", type: "hierarchical" }
              ),
            ]}
          >
            {footer}
          </Text>
        </Column>

        {status === "taken" && suggestions.length > 0 ? (
          <Column alignment="start" spacing={8}>
            <Text
              modifiers={[
                font({ textStyle: "subheadline", weight: "semibold" }),
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
                disabled={pending}
                key={suggestion}
                onSelect={handleChangeText}
                value={suggestion}
              />
            ))}
          </Column>
        ) : null}
      </Column>
    </OnboardingForm>
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
      label={value}
      onPress={handlePress}
      variant="text"
    />
  );
}
