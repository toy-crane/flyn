import { useRouter } from "expo-router";
import {
  Button,
  Description,
  Input,
  Label,
  Spinner,
  TextField,
  useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { withUniwind } from "uniwind";
import { LaunchChecking } from "../../components/launch-screens";
import { fetchNameCandidate } from "../../lib/auth/name-candidate";
import {
  DISPLAY_NAME_MAX,
  isDisplayNameSubmittable,
  normalizeDisplayName,
} from "../../lib/display-name";
import { useSaveDisplayName } from "../../lib/use-profile";
import { useUserId } from "../../lib/user-id";

/**
 * RN 기본 `KeyboardAvoidingView`는 native stack 헤더 높이만큼 덜 밀어 올린다 —
 * `automaticOffset`이 화면 안 실제 위치를 재서 그 차이를 없앤다. uniwind는 RN
 * 코어 컴포넌트만 자동으로 감싸므로 className을 받으려면 이 래핑이 필요하다.
 */
const KeyboardAvoiding = withUniwind(KeyboardAvoidingView);

const NICKNAME_RULE = "1~32자, 글자·숫자·공백과 - ' .만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

/**
 * 온보딩 첫 단계. HeroUI가 그리는 브랜드 표면이고 로그인과 같은 하단 CTA 전진
 * 흐름을 쓴다(docs/decisions/self-contained-native-ui-boundaries.md의 배정표).
 *
 * provider 이름은 입력칸에 미리 채우는 후보일 뿐이다 — 사용자가 제출해야
 * 프로필의 값이 된다(docs/decisions/profile-identity.md).
 */
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

  // 후보를 받기 전에 그리면 빈 칸이 한 번 보였다가 값이 튀어 들어온다.
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
  const [name, setName] = useState(initialValue);
  const accentForeground = useThemeColor("accent-foreground");
  const submittable = isDisplayNameSubmittable(name);

  const submit = useCallback(() => {
    const normalized = normalizeDisplayName(name);
    if (!pending && isDisplayNameSubmittable(normalized)) {
      onSubmit(normalized);
    }
  }, [name, onSubmit, pending]);

  return (
    <KeyboardAvoiding
      automaticOffset
      behavior="padding"
      className="flex-1 bg-background"
    >
      <View className="flex-1 gap-3 px-5 pt-6 pb-3">
        {/* 가장 큰 Dynamic Type에서 규칙 각주가 두 줄이 되어도 CTA를 밀어내지
            않도록 입력은 스크롤 안에 둔다. */}
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextField>
            <Label>닉네임</Label>
            {/* 이 화면은 `Redirect`로만 들어와 push 전환이 없다 — 아이디 화면이
                focus를 한 틱 미루는 이유가 여기에는 없다. */}
            <Input
              accessibilityLabel="닉네임"
              autoComplete="nickname"
              autoFocus
              maxLength={DISPLAY_NAME_MAX}
              onChangeText={setName}
              onSubmitEditing={submit}
              placeholder="닉네임"
              returnKeyType="next"
              value={name}
            />
            {/*
             * 규칙은 오류가 아니라 각주다. 이모지처럼 쓸 수 없는 문자는 빨간
             * 오류를 띄우는 대신 CTA만 잠근다
             * (docs/decisions/settings-edits-use-native-form.md).
             */}
            <Description>{NICKNAME_RULE}</Description>
          </TextField>
        </ScrollView>

        {/*
         * 전진 CTA는 부모의 정렬에 기대지 않고 스스로 가로를 채운다 — 나중에
         * row 안에 감싸도 줄어들지 않는다.
         *
         * 단일 form의 submit은 화면 전체 overlay가 아니라 같은 자리의
         * button-local progress를 쓴다. 버튼 안 progress는 수동형 indicator가
         * 아니라 그 action의 전경색을 따른다
         * (docs/decisions/apple-hig-with-app-theme.md).
         */}
        <Button
          className="w-full"
          isDisabled={!submittable || pending}
          onPress={submit}
          size="lg"
        >
          {pending ? <Spinner color={accentForeground} size="sm" /> : null}
          <Button.Label>아이디 정하기</Button.Label>
        </Button>
      </View>
    </KeyboardAvoiding>
  );
}
