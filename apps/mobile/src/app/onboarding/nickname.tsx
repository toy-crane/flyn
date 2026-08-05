import { Column, Text, useNativeState } from "@expo/ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { FormTextField } from "../../components/forms/form-text-field";
import { LaunchChecking } from "../../components/launch";
import { OnboardingForm } from "../../components/profile/onboarding-form";
import { fetchNameCandidate } from "../../lib/auth/name-candidate";
import {
  DISPLAY_NAME_MAX,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../../lib/display-name";
import { useSaveDisplayName } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

export default function NicknameOnboardingScreen() {
  const router = useRouter();
  const userId = useUserId();
  const save = useSaveDisplayName(userId);
  const [candidate, setCandidate] = useState<string | null>(null);
  const handleSubmit = useCallback(
    (name: string) => {
      save.mutate(name, {
        onError: saveFailed,
        onSuccess: () => router.push("/onboarding/username"),
      });
    },
    [router, save]
  );

  useEffect(() => {
    let current = true;
    fetchNameCandidate().then((name) => {
      if (current) {
        setCandidate(name);
      }
    });

    return () => {
      current = false;
    };
  }, []);

  if (candidate === null) {
    return <LaunchChecking />;
  }

  return (
    <NicknameForm
      initialValue={candidate}
      onSubmit={handleSubmit}
      pending={save.isPending}
    />
  );
}

function NicknameForm({
  initialValue,
  onSubmit,
  pending,
}: {
  initialValue: string;
  onSubmit: (name: string) => void;
  pending: boolean;
}) {
  const name = useNativeState(initialValue);
  const [typed, setTyped] = useState(initialValue);

  const handleChangeText = useCallback(
    (next: string) => {
      name.value = next;
      setTyped(next);
    },
    [name]
  );

  const submit = useCallback(
    (raw: string) => {
      const normalized = normalizeDisplayName(raw);
      if (!pending && isDisplayNameSubmittable(normalized)) {
        onSubmit(normalized);
      }
    },
    [onSubmit, pending]
  );
  const handlePress = useCallback(() => submit(name.value), [name, submit]);

  return (
    <OnboardingForm
      disabled={!isDisplayNameSubmittable(typed)}
      onSubmit={handlePress}
      pending={pending}
      submitLabel="아이디 정하기"
    >
      <Column alignment="start" spacing={8}>
        <FormTextField
          autoComplete="nickname"
          autoFocus
          label="닉네임"
          maxLength={DISPLAY_NAME_MAX}
          onChangeText={handleChangeText}
          onSubmitEditing={submit}
          placeholder="닉네임"
          returnKeyType="next"
          value={name}
        />
        <Text
          modifiers={[
            font({ textStyle: "footnote" }),
            foregroundStyle({ style: "secondary", type: "hierarchical" }),
          ]}
        >
          1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.
        </Text>
      </Column>
    </OnboardingForm>
  );
}
