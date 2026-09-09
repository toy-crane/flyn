import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { cubicBezier } from "react-native-reanimated";
import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

const arrive = {
  from: { opacity: 0, transform: [{ scale: 0.95 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
};
const easeOut = cubicBezier(0.23, 1, 0.32, 1);
const TRAILING_PERIOD = /[.]$/;
const particles = Array.from({ length: 18 }, (_, index) => {
  const direction = index % 2 ? -1 : 1;
  const x = direction * (35 + ((index * 17) % 99));
  const y = -(20 + ((index * 23) % 66));
  const rotation = direction * (70 + ((index * 31) % 160));
  return {
    animationDelay: (index % 4) * 22,
    animationName: {
      "0%": {
        opacity: 0,
        transform: [{ translateX: 0 }, { translateY: 8 }, { rotate: "0deg" }],
      },
      "12%": { opacity: 1 },
      "58%": {
        opacity: 1,
        transform: [
          { translateX: x * 0.72 },
          { translateY: y },
          { rotate: `${rotation * 0.6}deg` },
        ],
      },
      "100%": {
        opacity: 0,
        transform: [
          { translateX: x },
          { translateY: y + 68 },
          { rotate: `${rotation}deg` },
        ],
      },
    },
    id: index,
  };
});

/** 결말은 그대로 두고, 종료 직후 한 번만 짧게 축하한다. */
export function EpisodeClosing({
  ending,
  animate,
  onReview,
}: {
  ending: EpisodeEnding;
  animate: boolean;
  onReview: () => void;
}) {
  const [requested] = useState(animate);
  const [playAnimation, setPlayAnimation] = useState(false);
  const { fontScale, height } = useWindowDimensions();
  useEffect(() => {
    let canStart = requested;
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (reduced) => {
        canStart = false;
        if (reduced) {
          setPlayAnimation(false);
        }
      }
    );
    if (requested) {
      // Reanimated의 초기값은 앱 실행 때의 설정이다. 카드를 열 때 현재 값을 읽는다.
      AccessibilityInfo.isReduceMotionEnabled().then(
        (reduced) => {
          if (canStart && !reduced) {
            setPlayAnimation(true);
          }
        },
        () => {
          // 설정을 읽지 못했으면 정지된 완료 표시를 유지한다.
        }
      );
    }
    return () => {
      canStart = false;
      listener.remove();
    };
  }, [requested]);
  const motion = playAnimation;
  return (
    <View
      className="gap-4 overflow-hidden rounded-3xl border border-accent/15 bg-surface px-5 pt-5 pb-4"
      style={{ maxHeight: height * 0.4 }}
      testID="episode-closing"
    >
      <View className="absolute inset-0 bg-accent/5" pointerEvents="none" />
      <ScrollView
        className="shrink grow-0"
        contentContainerClassName="items-center gap-2 py-1"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          className="size-16 items-center justify-center"
          style={
            motion
              ? {
                  animationDuration: 280,
                  animationName: arrive,
                  animationTimingFunction: easeOut,
                }
              : undefined
          }
          testID="episode-completion-mark"
        >
          <View className="size-14 items-center justify-center rounded-full border-4 border-accent/15 bg-accent">
            <Icon name="check" size="lg" tone="accentForeground" />
          </View>
          <View className="absolute top-0 -right-4">
            <Icon name="learn" size="sm" tone="accent" />
          </View>
          <View className="absolute bottom-1 -left-4">
            <Icon name="learn" size="xs" tone="accent" />
          </View>
        </Animated.View>
        {ending.kind === "성공" ? (
          <Text
            className="font-semibold text-accent text-sm"
            dynamicTypeRamp="footnote"
            key={`success-${fontScale}`}
          >
            해냈어요!
          </Text>
        ) : null}
        <Text
          accessibilityRole="header"
          className="text-center font-bold text-[22px] text-foreground leading-[30px]"
          dynamicTypeRamp="title2"
          key={`outcome-${fontScale}`}
          testID="episode-closing-outcome"
        >
          {ending.outcome.replace(TRAILING_PERIOD, "")}
        </Text>
      </ScrollView>
      {motion ? (
        <View
          accessibilityElementsHidden
          className="absolute top-10 left-1/2"
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          testID="episode-celebration-burst"
        >
          {particles.map(({ id, ...animation }) => (
            <Animated.View
              className={
                id % 3
                  ? "absolute h-2.5 w-1.5 rounded-sm bg-accent"
                  : "absolute size-1.5 rounded-full bg-accent/50"
              }
              key={id}
              style={{
                ...animation,
                animationDuration: 1050,
                animationFillMode: "both",
                animationTimingFunction: easeOut,
              }}
            />
          ))}
        </View>
      ) : null}
      <Button
        accessibilityLabel="표현 돌아보기"
        key={`review-${fontScale}`}
        onPress={onReview}
      >
        표현 돌아보기
      </Button>
    </View>
  );
}
