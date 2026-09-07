import Animated, {
  type CSSAnimationKeyframes,
  FadeIn,
  ReduceMotion,
  useReducedMotion,
} from "react-native-reanimated";

import { chatLabels } from "./chat-labels";

const APPEARING = FadeIn.duration(200).reduceMotion(ReduceMotion.System);
const DOT_DELAYS = [0, 200, 400] as const;
const BRIGHTEN: CSSAnimationKeyframes = {
  "0%, 60%, 100%": { opacity: 0.3 },
  "30%": { opacity: 0.95 },
};

export function WaitingAnswer() {
  const isReducedMotion = useReducedMotion();

  return (
    <Animated.View
      accessibilityLabel={chatLabels.waiting}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessible
      className="h-9 flex-row items-center gap-[5px] self-start rounded-2xl bg-surface px-3.5"
      entering={APPEARING}
      testID="chat-waiting"
    >
      {DOT_DELAYS.map((delay) => (
        <Animated.View
          accessible={false}
          className="size-1.5 rounded-full bg-foreground"
          key={delay}
          style={
            isReducedMotion
              ? { opacity: 0.65 }
              : {
                  animationDelay: delay,
                  animationDuration: 1200,
                  animationIterationCount: "infinite",
                  animationName: BRIGHTEN,
                  animationTimingFunction: "ease-in-out",
                  opacity: 0.3,
                }
          }
          testID="chat-waiting-dot"
        />
      ))}
    </Animated.View>
  );
}
