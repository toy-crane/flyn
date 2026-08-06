import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Button,
  Chip,
  Description,
  FieldError,
  InputGroup,
  Label,
  Spinner,
  TextField,
  Typography,
  useThemeColor,
} from "heroui-native";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  InteractionManager,
  ScrollView,
  type TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { withUniwind } from "uniwind";
import { LaunchChecking } from "../../components/launch-screens";
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

/** 닉네임 화면과 같은 이유로 감싼다 — 헤더 높이만큼의 어긋남을 없앤다. */
const KeyboardAvoiding = withUniwind(KeyboardAvoidingView);

const USERNAME_RULE = "4~20자, 영문 소문자·숫자·_·.만 사용할 수 있어요.";

function saveFailed() {
  Alert.alert("저장하지 못했어요", "잠시 후 다시 시도해 주세요.");
}

/**
 * 온보딩 마지막 단계. 저장에 성공하면 프로필의 아이디가 채워지고 게이트가
 * 뒤집혀 홈으로 들어간다 — 이 화면은 push하지 않는다
 * (docs/decisions/profile-identity.md).
 */
export default function UsernameOnboardingScreen() {
  const userId = useUserId();
  const profile = useProfile(userId);
  const save = useSaveUsername(userId);
  const [candidate, setCandidate] = useState<string | null>(null);
  const handleSubmit = useCallback(
    (username: string, onDuplicate: () => void) => {
      save.mutate(username, {
        onError: (error) => {
          // 저장 순간의 유니크 위반은 일반 실패가 아니라 중복 상태다.
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
  const input = useRef<TextInput>(null);
  const [typed, setTyped] = useState(initialValue);
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const checkedStatus = useUsernameAvailability(typed);
  const normalized = normalizeUsername(typed);
  const status = duplicateValue === normalized ? "taken" : checkedStatus;
  const taken = status === "taken";
  const [accentForeground, successColor, dangerColor] = useThemeColor([
    "accent-foreground",
    "success",
    "danger",
  ]);

  /*
   * `autoFocus`는 마운트 커밋 그 순간에 focus를 부른다. 이 화면은 후보를 받은
   * 뒤에야 폼을 세우므로 그 호출이 native stack push 한가운데 떨어졌고, 요청이
   * 삼켜져 키보드가 영영 오지 않았다 — 닉네임에서 넘어올 때 실제로 그랬다.
   *
   * `runAfterInteractions`가 전환 종료를 기다리는 것은 아니다. 등록된
   * interaction handle이 있을 때만 기다리는데 `@react-navigation/*`도
   * `react-native-screens`도 `createInteractionHandle`을 부르지 않으므로, 여기서
   * 이것은 다음 `setImmediate` 배치로의 한 틱 지연이다. 증상이 사라진 이유도 그
   * 한 틱, 즉 focus 호출이 마운트 커밋 밖으로 나온 것으로 보인다.
   *
   * 닉네임 화면은 같은 비동기 게이트를 쓰면서도 `autoFocus`를 그대로 둔다. 그
   * 화면은 `Redirect`로만 들어와 push 전환이 없고 증상도 없다 — 재현되지 않는
   * 화면까지 우회를 복사하지 않는다.
   */
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      input.current?.focus();
    });

    return () => task.cancel();
  }, []);

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

  const locked = useMemo(
    () =>
      pending ||
      status === "checking" ||
      status === "invalid" ||
      status === "taken",
    [pending, status]
  );

  const handleChangeText = useCallback((next: string) => {
    setTyped(normalizeUsername(next));
    setDuplicateValue(null);
  }, []);

  const submit = useCallback(() => {
    const value = normalizeUsername(typed);
    if (!locked && isUsernameValid(value)) {
      onSubmit(value, () => setDuplicateValue(value));
    }
  }, [locked, onSubmit, typed]);

  /*
   * 가용성은 필드 안 trailing 자리에서 말한다
   * (docs/decisions/settings-edits-use-native-form.md). 아이콘은 브랜드 층
   * 어휘인 Ionicons를 쓰고 색은 의미 토큰이 준다
   * (docs/decisions/apple-hig-with-app-theme.md). 색과 모양만으로 뜻을 나르지
   * 않도록 상태를 그대로 읽는 접근성 이름을 함께 둔다. 중복은 여기에 더해 필드의
   * invalid 외곽선과 `FieldError`가 함께 danger로 말한다 — 규칙 위반은 그러지
   * 않는다.
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
    <KeyboardAvoiding
      automaticOffset
      behavior="padding"
      className="flex-1 bg-background"
    >
      <View className="flex-1 gap-3 px-5 pt-6 pb-3">
        {/* 중복일 때 추천이 아래로 붙으므로 입력은 스크롤 안에 둔다. */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextField isInvalid={taken}>
            <Label>아이디</Label>
            <InputGroup>
              <InputGroup.Input
                accessibilityLabel="아이디"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="ascii-capable"
                maxLength={USERNAME_MAX}
                onChangeText={handleChangeText}
                onSubmitEditing={submit}
                placeholder="아이디"
                ref={input}
                returnKeyType="done"
                value={typed}
              />
              {/* 상태 표시라 누를 것이 없다 — 탭은 밑의 입력으로 흘려보내되
                  아이콘의 접근성 이름은 트리에 남긴다. */}
              <InputGroup.Suffix pointerEvents="none">
                {signal}
              </InputGroup.Suffix>
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
                    disabled={pending}
                    key={suggestion}
                    onSelect={handleChangeText}
                    value={suggestion}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* 전진 CTA는 부모의 정렬에 기대지 않고 스스로 가로를 채운다 — 나중에
            row 안에 감싸도 줄어들지 않는다. 버튼 안 progress는 그 action의
            전경색을 따른다(docs/specs/neutral-loading-indicators/spec.md). */}
        <Button
          className="w-full"
          isDisabled={locked}
          onPress={submit}
          size="lg"
        >
          {pending ? <Spinner color={accentForeground} size="sm" /> : null}
          <Button.Label>시작하기</Button.Label>
        </Button>
      </View>
    </KeyboardAvoiding>
  );
}

/** 누르면 값만 채운다 — 저장은 사용자가 CTA로 한다. */
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
