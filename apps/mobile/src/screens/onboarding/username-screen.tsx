import { InputGroup } from "heroui-native/input-group";
import { Label } from "heroui-native/label";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { TextField } from "heroui-native/text-field";
import { Fragment, useCallback } from "react";
import type { TextInput } from "react-native";
import { View } from "react-native";

import { useUsernameStep } from "@/features/auth/state/use-username-step";
import { AuthFieldError, AuthLayout } from "@/features/auth/ui/auth-layout";
import { onboardingLabels } from "@/features/auth/ui/onboarding-labels";
import { useFocusOnArrival } from "@/shared/navigation/use-screen-arrival";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { PressableListRow } from "@/shared/ui/list-row";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";

/**
 * The second onboarding screen, and the one that saves.
 *
 * The rules for an account id are not written on the screen. A person typing
 * their own name never meets most of them, and a list of them is a wall in
 * front of a single field — so the screen stays quiet until a value actually
 * runs into one.
 *
 * No `@` anywhere. It would promise mentions and profile addresses this product
 * does not have, and it would make the value shown differ from the value typed.
 */
export function UsernameScreen() {
  const form = useUsernameStep();
  const inputRef = useFocusOnArrival<TextInput>();

  return (
    <AuthLayout
      footer={
        <Button
          accessibilityLabel={onboardingLabels.start}
          isDisabled={!form.canSubmit}
          isPending={form.isSaving}
          onPress={form.submit}
        >
          {onboardingLabels.start}
        </Button>
      }
      title="아이디를 정해 주세요"
    >
      <TextField isInvalid={form.message !== undefined}>
        <Label>{onboardingLabels.username}</Label>
        <InputGroup>
          <InputGroup.Input
            accessibilityLabel={onboardingLabels.username}
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect={false}
            onChangeText={form.changeUsername}
            onSubmitEditing={form.canSubmit ? form.submit : undefined}
            placeholder={onboardingLabels.username}
            ref={inputRef}
            returnKeyType="done"
            spellCheck={false}
            testID="onboarding-username"
            value={form.username}
          />
          <InputGroup.Suffix>
            <UsernameMark
              isAvailable={form.isAvailable}
              isChecking={form.isChecking}
            />
          </InputGroup.Suffix>
        </InputGroup>
        {form.message ? (
          <UsernameMessage
            canRetry={form.isCheckFailed}
            message={form.message}
            onRetry={form.retryCheck}
          />
        ) : null}
      </TextField>

      {form.suggestions.length > 0 ? (
        <UsernameSuggestions
          onChoose={form.chooseSuggestion}
          suggestions={form.suggestions}
        />
      ) : null}
    </AuthLayout>
  );
}

/**
 * Whether the id is being checked, or free.
 *
 * The free mark is a bare check, not a filled disc. A disc is the loudest thing
 * the screen has — the only saturated shape on it — and it is spent on a state
 * nobody has to act on; a stroke also lands at the weight of the spinner it
 * replaces, so finishing the check does not jump. Colour and shape are not the
 * message either: the accessible name is, so a screen reader hears that the id
 * is free rather than that there is a green mark.
 *
 * Both states spell out `busy`. They sit at the same place in the tree, so
 * React updates one native view rather than swapping two, and Android keeps a
 * `busy` it is no longer given — which left TalkBack reading the finished
 * check as still in progress on the emulator.
 */
function UsernameMark({
  isAvailable,
  isChecking,
}: {
  isAvailable: boolean;
  isChecking: boolean;
}) {
  if (isChecking) {
    return (
      <View
        accessibilityLabel={onboardingLabels.checking}
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        accessible
        testID="onboarding-username-checking"
      >
        <LoadingSpinner />
      </View>
    );
  }

  if (!isAvailable) {
    return null;
  }

  return (
    <View
      accessibilityLabel={onboardingLabels.available}
      accessibilityState={{ busy: false }}
      accessible
      testID="onboarding-username-available"
    >
      <Icon name="check" tone="success" />
    </View>
  );
}

/**
 * The message under the field.
 *
 * A failed check is the one message the person can act on directly, so in that
 * state a small retry button stands beside it. The button's accessible name
 * says what it retries; on screen the message next to it already does.
 */
function UsernameMessage({
  canRetry,
  message,
  onRetry,
}: {
  canRetry: boolean;
  message: string;
  onRetry: () => void;
}) {
  const error = (
    <AuthFieldError testID="onboarding-error-username">
      {message}
    </AuthFieldError>
  );

  if (!canRetry) {
    return error;
  }

  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">{error}</View>
      <Button
        accessibilityLabel={onboardingLabels.retryCheck}
        onPress={onRetry}
        size="sm"
        testID="onboarding-username-retry"
        variant="tertiary"
      >
        {onboardingLabels.retry}
      </Button>
    </View>
  );
}

/** Free spellings of the id the person asked for, confirmed by the server. */
function UsernameSuggestions({
  onChoose,
  suggestions,
}: {
  onChoose: (value: string) => void;
  suggestions: string[];
}) {
  return (
    <View className="gap-2.5">
      <Typography.Paragraph
        accessibilityRole="header"
        color="muted"
        type="body-sm"
        weight="medium"
      >
        {onboardingLabels.suggestions}
      </Typography.Paragraph>
      <ListGroup testID="onboarding-username-suggestions">
        {suggestions.map((candidate, index) => (
          <Fragment key={candidate}>
            {index === 0 ? null : <Separator className="mx-4" />}
            <UsernameSuggestion candidate={candidate} onChoose={onChoose} />
          </Fragment>
        ))}
      </ListGroup>
    </View>
  );
}

function UsernameSuggestion({
  candidate,
  onChoose,
}: {
  candidate: string;
  onChoose: (value: string) => void;
}) {
  const choose = useCallback(() => {
    onChoose(candidate);
  }, [candidate, onChoose]);

  return (
    <PressableListRow
      accessibilityLabel={candidate}
      onPress={choose}
      testID="onboarding-username-suggestion"
    >
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{candidate}</ListGroup.ItemTitle>
      </ListGroup.ItemContent>
    </PressableListRow>
  );
}
