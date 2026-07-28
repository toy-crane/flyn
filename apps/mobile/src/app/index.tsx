import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { useProfile } from "../lib/use-profile";
import { useUserId } from "../lib/user-id";

export default function HomeScreen() {
  const router = useRouter();
  const userId = useUserId();
  const profile = useProfile(userId);

  const openSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  return (
    <>
      {/* 설정 진입은 네이티브 헤더 버튼이다. RN 뷰를 헤더에 얹지 않으므로
          글래스 효과와 눌림 반응을 iOS가 그대로 준다. 스크롤 콘텐츠 안이 아니라
          형제로 둔다 — 화면에 그려지는 것이 아니라 헤더에 등록되는 것이다. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="설정"
          icon="gearshape"
          onPress={openSettings}
        />
      </Stack.Toolbar>

      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-3 px-6 pt-12">
          <Text className="font-semibold text-[34px] text-foreground leading-[41px] tracking-tight">
            안녕하세요,{"\n"}
            {profile.data?.display_name ?? ""}님.
          </Text>
          <Text className="text-[17px] text-muted-foreground leading-6">
            오늘도 가볍게 시작해 보세요.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
