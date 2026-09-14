import { Typography } from "heroui-native/text";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/shared/ui/button";

interface Notice {
  body: string;
  title: string;
}

export function UpdateRequiredScreen({
  checkError,
  isRechecking,
  onOpenInstall,
  openError,
}: {
  checkError: boolean;
  isRechecking: boolean;
  onOpenInstall: () => void;
  openError: boolean;
}) {
  const insets = useSafeAreaInsets();
  let notice: Notice | null = null;
  if (isRechecking) {
    notice = {
      body: "설치한 앱 버전을 다시 확인하고 있어요",
      title: "업데이트 확인 중",
    };
  } else if (checkError) {
    notice = {
      body: "인터넷 연결을 확인하고 앱을 다시 열어 주세요",
      title: "지금은 확인할 수 없어요",
    };
  } else if (openError) {
    notice = {
      body: "잠시 후 다시 시도해 주세요",
      title: "설치 화면을 열지 못했어요",
    };
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="grow px-6"
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 16) + 16,
        paddingTop: insets.top + 16,
      }}
      testID="update-required"
    >
      <View className="flex-1 justify-center gap-4">
        <Typography.Heading className="text-foreground" type="h3" weight="bold">
          업데이트가 필요해요
        </Typography.Heading>
        <Typography.Paragraph className="text-muted" type="body">
          플린을 계속 사용하려면 최신 버전으로 업데이트해 주세요
        </Typography.Paragraph>
        {notice ? (
          <View
            accessibilityLiveRegion="polite"
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <Typography.Paragraph
              className="text-foreground"
              type="body-sm"
              weight="medium"
            >
              {notice.title}
            </Typography.Paragraph>
            <Typography.Paragraph className="mt-1 text-muted" type="body-sm">
              {notice.body}
            </Typography.Paragraph>
          </View>
        ) : null}
      </View>
      <View className="pt-6">
        <Button isDisabled={isRechecking} onPress={onOpenInstall} size="lg">
          업데이트하기
        </Button>
      </View>
    </ScrollView>
  );
}
