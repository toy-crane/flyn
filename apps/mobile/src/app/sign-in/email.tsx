import { useRouter } from "expo-router";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  Typography,
  useThemeColor,
} from "heroui-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { withUniwind } from "uniwind";
import { sendEmailCode } from "../../lib/auth/email";
import { authFailedFeedback } from "../../lib/haptics";
import { isEmailSubmittable } from "../../lib/otp-code";
import { useAuthAction } from "../../lib/use-auth-action";

/**
 * RN 기본 `KeyboardAvoidingView`는 자기 frame을 부모 기준으로 재서 native stack
 * 헤더 높이만큼 덜 밀어 올린다 — CTA가 키보드에 딱 그만큼 가렸다.
 * `automaticOffset`이 화면 안 실제 위치를 재서 그 차이를 없앤다.
 *
 * uniwind는 RN 코어 컴포넌트만 자동으로 감싸므로 className을 받으려면 이
 * 래핑이 필요하다.
 */
const KeyboardAvoiding = withUniwind(KeyboardAvoidingView);

/**
 * 코드를 보낼 주소만 받는 화면. HeroUI가 그리는 브랜드 표면이다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 배정표).
 *
 * 안내와 입력은 위, submit은 아래에 두고 그 사이를 늘린다. 키보드가 열리면
 * KeyboardAvoidingView가 CTA를 키보드 위로 올린다.
 */
export default function EmailScreen() {
  const { failure, pending, run } = useAuthAction();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const accentForeground = useThemeColor("accent-foreground");
  const address = email.trim();

  const send = useCallback(async () => {
    const result = await run(() => sendEmailCode(address), "email:send");

    // 성공(null)일 때만 넘어간다. 재진입으로 무시됐거나(IGNORED) 실패했으면
    // 여기 머무른다 — 보내지도 않은 코드의 입력 화면으로 가면 안 된다.
    if (result === null) {
      router.push({ params: { email: address }, pathname: "/sign-in/code" });
      return;
    }

    // IGNORED(재진입)는 실패가 아니다 — 진동시키지 않는다.
    if (result) {
      authFailedFeedback();
    }
  }, [address, router, run]);

  // 이벤트 핸들러는 발송을 기다리지 않는다 — 돌려주면 press가 네트워크 왕복에
  // 묶인다. 잠금은 pending과 useAuthAction의 재진입 가드가 맡는다.
  const submit = useCallback(() => {
    if (!isEmailSubmittable(address) || pending) {
      return;
    }

    send();
  }, [address, pending, send]);

  return (
    <KeyboardAvoiding
      automaticOffset
      behavior="padding"
      className="flex-1 bg-background"
    >
      <View className="flex-1 gap-3 px-5 pt-6 pb-3">
        <View className="flex-1 gap-4">
          <Typography.Paragraph color="muted">
            코드를 받을 이메일 주소를 입력해 주세요.
          </Typography.Paragraph>

          {/*
           * 발송 실패는 주소 옆에서 읽혀야 의미가 있다 — 얼럿이 아니라 필드에
           * 붙는 각주다. FieldError는 isInvalid일 때만 그려진다.
           */}
          <TextField isInvalid={Boolean(failure)}>
            <Label>이메일 주소</Label>
            <Input
              accessibilityLabel="이메일 주소"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              autoFocus
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={submit}
              placeholder="name@example.com"
              returnKeyType="next"
              value={email}
            />
            <FieldError>{failure?.message}</FieldError>
          </TextField>
        </View>

        {/*
         * 단일 form의 submit은 화면 전체 overlay가 아니라 같은 자리의
         * button-local progress를 쓴다(docs/decisions/social-sign-in-presentation.md).
         */}
        <Button
          isDisabled={!isEmailSubmittable(address) || pending}
          onPress={submit}
          size="lg"
        >
          {pending ? (
            /* 버튼이 이미 무엇을 하는지 말하므로 spinner에 따로 이름을 붙이지
               않는다 — 붙이면 버튼의 접근성 이름이 두 조각으로 읽힌다. */
            <Spinner color={accentForeground} size="sm" />
          ) : null}
          <Button.Label>코드 받기</Button.Label>
        </Button>
      </View>
    </KeyboardAvoiding>
  );
}
