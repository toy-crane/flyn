import { router } from "expo-router";

import { AppMark } from "@/components/app-mark";
import { Pressable, SafeAreaView, Text, View } from "@/tw";

/**
 * ⓪ 로그인. The real Sign in with Apple button is S1's — it must be Apple's
 * own component, not a reproduction, so this placeholder only holds its place.
 */
export function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* SafeAreaView writes its own padding, so the gutter lives one level in. */}
      <View className="flex-1 px-3">
        <View className="flex-1 items-center justify-center">
          <View className="mb-[18px]">
            <AppMark />
          </View>
          <Text
            role="heading"
            className="text-center text-[23px] font-bold leading-8 text-foreground"
          >
            {"이야기 속에서\n영어가 늘어요"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/onboarding")}
          className="min-h-11 items-center justify-center rounded-cta bg-black py-4"
        >
          <Text className="text-base font-semibold text-white">
            Apple로 로그인
          </Text>
        </Pressable>
        <Text className="mt-3 pb-2 text-center text-[11px] leading-5 text-muted">
          {
            "계속하면 서비스 약관과 개인정보 처리방침에\n동의하는 것으로 간주돼요."
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}
