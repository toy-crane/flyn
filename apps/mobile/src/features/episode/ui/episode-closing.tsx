import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { useThemeColor } from "heroui-native/hooks";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  processColor,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  Keyframe,
  ReduceMotion,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";
import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import { Button } from "@/shared/ui/button";
import closingBurst from "./celebration/closing-burst.gen.json";
import closingBurstHalf from "./celebration/closing-burst-half.gen.json";
import closingMark from "./celebration/closing-mark.gen.json";

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const TRAILING_PERIOD = /[.]$/;

// 시안 closing.html의 순서. 카드가 올라오고, 마크가 튀고(Lottie 안 40ms),
// 체크가 그려지고, 고리가 퍼지고, 조각이 터지고, `해냈어요!`가 팝하고, 결과
// 문장이 올라온다. 지연은 모두 카드가 보이는 순간부터 센다. 마크의 박자를
// 시안보다 줄였으므로(scripts/closing-celebration/lottie.ts) 문구의 지연도
// 그만큼 당겨, 마지막 요소가 500ms 안에 움직이기 시작한다.
//
// CSS 애니메이션이 아니라 entering을 쓰는 이유: Android는 CSS 애니메이션이
// 붙은 뷰의 스타일을 두세 프레임 늦게 적용해서, 지연을 기다리는 문구가 그동안
// 그대로 비쳤다. entering은 마운트 순간에 첫 값을 잡는다.
//
// 동작 줄이기는 이 컴포넌트가 지금 값을 읽어 정한다. Reanimated의 기본값은 앱
// 실행 때의 설정이라, 그 뒤에 껐다면 문구만 연출 없이 튀어나온다.
const rise = FadeInUp.duration(260)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.Never)
  .withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] });
const popText = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.6 }] },
  70: {
    easing: Easing.bezier(0.2, 0.75, 0.25, 1),
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  100: {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    opacity: 1,
    transform: [{ scale: 1 }],
  },
})
  .duration(340)
  .delay(400)
  .reduceMotion(ReduceMotion.Never);
const slideUp = FadeInUp.duration(380)
  .delay(480)
  .easing(easeOut)
  .reduceMotion(ReduceMotion.Never)
  .withInitialValues({ opacity: 0, transform: [{ translateY: 14 }] });
const settle = FadeIn.duration(500)
  .delay(300)
  .easing(Easing.out(Easing.ease))
  .reduceMotion(ReduceMotion.Never)
  .withInitialValues({ opacity: 0.55 });
/** 동작 줄이기 설정을 읽는 동안 카드를 감춘다. 일반 View라 첫 프레임부터 적용된다. */
const hidden = { opacity: 0 } as const;

/** 시안의 `.mark`는 72pt다. 파일은 튀는 순간의 후광까지 담아 더 크므로 위아래를 접는다. */
const MARK_BOX = 72;
const markStyle = { height: closingMark.h, width: closingMark.w } as const;
/** 조각이 터져 나오는 자리. 시안은 카드 위에서 46pt 아래, 가로 가운데다. */
const BURST_TOP = 46;
/**
 * iOS는 Core Animation 엔진으로 그리면 색을 입힐 때마다 레이어를 다시 만들고, 그
 * 사이 멈춘 메인 스레드 뒤로 마크의 시계가 먼저 가서 튀는 장면을 건너뛴다. 메인
 * 스레드 엔진은 프레임마다 그리기만 한다. 파일을 읽을 때 한 번은 여전히 Core
 * Animation 엔진으로 만들었다가 버리지만, 그때는 아직 재생 전이다. Android의
 * SOFTWARE는 비트맵 렌더링이라 기본값을 둔다.
 */
const RENDER_MODE = process.env.EXPO_OS === "ios" ? "SOFTWARE" : "AUTOMATIC";

/** 파일을 못 읽으면 자리가 조용히 비어 버린다. 이유만이라도 남긴다. */
function warnAnimationFailure(error: string) {
  console.warn(`결말 축하 Lottie를 그리지 못했습니다: ${error}`);
}

/**
 * 레이어 이름에 입힐 색. 값을 읽지 못한 색은 빼서 Android가 없는 색을 정수로
 * 읽다 멈추지 않게 한다. 빠진 레이어는 파일에 든 밝은 화면의 색으로 남는다.
 */
function colorFilters(entries: [keypath: string, color: unknown][]) {
  return entries.flatMap(([keypath, color]) =>
    typeof color === "string" && typeof processColor(color) === "number"
      ? [{ color, keypath }]
      : []
  );
}

/**
 * 결말이 났는지에 따라 연출이 다르다. `pending`은 동작 줄이기 설정을 아직 읽지
 * 못한 첫 순간이고, `play`는 한 번 재생, `still`은 마지막 프레임에 멈춘 상태다.
 */
type Motion = "pending" | "play" | "still";

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
  const [motion, setMotion] = useState<Motion>(requested ? "pending" : "still");
  // 다 재생한 뒤에는 autoPlay를 내린다. Android는 색 같은 prop이 바뀔 때마다
  // autoPlay가 켜져 있으면 멈춘 애니메이션을 처음부터 다시 돌린다.
  const [finished, setFinished] = useState(false);
  const finish = useCallback(() => setFinished(true), []);
  const { fontScale, height } = useWindowDimensions();
  useEffect(() => {
    if (!requested) {
      return;
    }
    let canStart = true;
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      () => {
        // 재생 중에 켜면 멈추고, 다시 꺼도 이미 지나간 연출은 되풀이하지 않는다.
        canStart = false;
        setMotion("still");
      }
    );
    // Reanimated의 초기값은 앱 실행 때의 설정이다. 카드를 열 때 현재 값을 읽는다.
    AccessibilityInfo.isReduceMotionEnabled().then(
      (reduced) => {
        if (canStart) {
          setMotion(reduced ? "still" : "play");
        }
      },
      () => {
        // 설정을 읽지 못했으면 정지된 완료 표시를 유지한다.
        if (canStart) {
          setMotion("still");
        }
      }
    );
    return () => {
      canStart = false;
      listener.remove();
    };
  }, [requested]);
  useEffect(() => {
    if (motion === "play") {
      // 마크가 튀는 박자에 한 번. 햅틱을 지원하지 않는 기기에서도 연출은 그대로다.
      impactAsync(ImpactFeedbackStyle.Medium).catch(() => undefined);
    }
  }, [motion]);
  const isSuccess = ending.kind === "성공";
  const playing = motion === "play";
  const pending = motion === "pending";
  return (
    <View
      accessibilityElementsHidden={pending}
      importantForAccessibility={pending ? "no-hide-descendants" : "auto"}
      pointerEvents={pending ? "none" : "auto"}
      style={pending ? hidden : undefined}
    >
      {/* motion이 바뀌면 카드를 새로 만들어 entering이 그 순간부터 돌고, 마크는
          정지한 마지막 프레임으로 다시 그려진다. */}
      <Animated.View
        className="gap-4 overflow-hidden rounded-3xl border border-accent/15 bg-surface px-5 pt-5 pb-4"
        entering={playing ? rise : undefined}
        key={motion}
        style={{ maxHeight: height * 0.4 }}
        testID="episode-closing"
      >
        <View className="absolute inset-0 bg-accent/5" pointerEvents="none" />
        {/* 마크보다 먼저 만들어 iOS가 효과 파일을 읽는 동안 마크의 시계가 먼저
            가지 않게 한다. 형제 순서상 마크와 글 뒤에 깔려 그 뒤에서 터진다. */}
        {playing ? (
          <CelebrationBurst
            half={!isSuccess}
            onFinish={finish}
            playing={!finished}
          />
        ) : null}
        <ScrollView
          className="shrink grow-0"
          contentContainerClassName="items-center gap-2 py-1"
          showsVerticalScrollIndicator={false}
        >
          <CompletionMark finished={finished} motion={motion} />
          {isSuccess ? (
            <Animated.View entering={playing ? popText : undefined}>
              <Text
                className="font-semibold text-accent text-sm"
                dynamicTypeRamp="footnote"
                key={`success-${fontScale}`}
              >
                해냈어요!
              </Text>
            </Animated.View>
          ) : null}
          <Animated.View entering={playing ? slideUp : undefined}>
            <Text
              accessibilityRole="header"
              className="text-center font-bold text-[22px] text-foreground leading-[30px]"
              dynamicTypeRamp="title2"
              key={`outcome-${fontScale}`}
              testID="episode-closing-outcome"
            >
              {ending.outcome.replace(TRAILING_PERIOD, "")}
            </Text>
          </Animated.View>
        </ScrollView>
        <Animated.View entering={playing ? settle : undefined}>
          <Button
            accessibilityLabel="표현 돌아보기"
            key={`review-${fontScale}`}
            onPress={onReview}
          >
            표현 돌아보기
          </Button>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/**
 * 파란 원이 튀어나오고 안에서 체크가 그려지는 마크. 파일의 색은 실행 시점의
 * 강조색으로 바꿔 입혀 밝은 화면과 어두운 화면을 따른다. 정지 상태는 마지막
 * 프레임이다. 고리는 효과 파일이 그린다.
 */
function CompletionMark({
  finished,
  motion,
}: {
  finished: boolean;
  motion: Motion;
}) {
  const [accent, accentForeground] = useThemeColor([
    "accent",
    "accent-foreground",
  ]);
  const filters = useMemo(
    () =>
      colorFilters([
        ["Disc", accent],
        ["Check", accentForeground],
      ]),
    [accent, accentForeground]
  );
  const inset = (closingMark.h - MARK_BOX) / 2;
  return (
    <View
      style={{ ...markStyle, marginVertical: -inset }}
      testID="episode-completion-mark"
    >
      {motion === "pending" ? null : (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <LottieView
            autoPlay={motion === "play" && !finished}
            colorFilters={filters}
            loop={false}
            onAnimationFailure={warnAnimationFailure}
            progress={motion === "still" ? 1 : 0}
            renderMode={RENDER_MODE}
            source={closingMark}
            style={markStyle}
            testID="episode-completion-mark-lottie"
          />
        </View>
      )}
    </View>
  );
}

const burstStyle = { height: closingBurst.h, width: closingBurst.w } as const;
const burstHalfStyle = {
  height: closingBurstHalf.h,
  width: closingBurstHalf.w,
} as const;

/**
 * 마크 뒤에서 퍼지는 고리와 파랑, 보라, 청록 조각. 목표를 이루지 못한 결말은
 * 고리 없이 조각이 절반이다. 출발점이 상자의 세로 가운데라 상자 높이의 절반만큼
 * 올려 시안의 자리에 맞춘다.
 */
function CelebrationBurst({
  half,
  onFinish,
  playing,
}: {
  half: boolean;
  onFinish: () => void;
  playing: boolean;
}) {
  const accent = useThemeColor("accent");
  const learn = useCSSVariable("--learn");
  const expression = useCSSVariable("--expression");
  const filters = useMemo(
    () =>
      colorFilters([
        ["Ring", accent],
        ["Accent", accent],
        ["Learn", learn],
        ["Expression", expression],
      ]),
    [accent, learn, expression]
  );
  const source = half ? closingBurstHalf : closingBurst;
  return (
    <View
      accessibilityElementsHidden
      className="absolute inset-x-0 items-center"
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ top: BURST_TOP - source.h / 2 }}
    >
      <LottieView
        autoPlay={playing}
        colorFilters={filters}
        loop={false}
        onAnimationFailure={warnAnimationFailure}
        onAnimationFinish={onFinish}
        renderMode={RENDER_MODE}
        source={source}
        style={half ? burstHalfStyle : burstStyle}
        testID="episode-celebration-burst"
      />
    </View>
  );
}
