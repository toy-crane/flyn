import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity,
  TextInput as RNTextInput,
  FlatList as RNFlatList,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

/**
 * react-native-css derives a dot-notation prop map from the component type.
 * For Animated wrappers and generic list components that map exceeds
 * TypeScript's instantiation depth, so those call sites go through this
 * widened view of the same function. Runtime behavior is unchanged.
 */
const useCssElementUntyped = useCssElement as (
  component: React.ComponentType<any>,
  props: any,
  mapping: Record<string, string>,
) => React.ReactElement;

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string },
) => {
  return useCssElementUntyped(RouterLink, props, { className: "style" });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElementUntyped(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string },
) => {
  return useCssElementUntyped(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => {
  return useCssElementUntyped(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => {
  return useCssElementUntyped(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TouchableOpacity
export const TouchableOpacity = (
  props: React.ComponentProps<typeof RNTouchableOpacity> & {
    className?: string;
  },
) => {
  return useCssElementUntyped(RNTouchableOpacity, props, {
    className: "style",
  });
};
TouchableOpacity.displayName = "CSS(TouchableOpacity)";

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => {
  return useCssElementUntyped(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

// AnimatedView
export const AnimatedView = (
  props: React.ComponentProps<typeof Animated.View> & { className?: string },
) => {
  return useCssElementUntyped(Animated.View, props, { className: "style" });
};
AnimatedView.displayName = "CSS(AnimatedView)";

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  },
) => {
  return useCssElementUntyped(Animated.ScrollView, props, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  });
};
AnimatedScrollView.displayName = "CSS(AnimatedScrollView)";

// AnimatedText
export const AnimatedText = (
  props: React.ComponentProps<typeof Animated.Text> & { className?: string },
) => {
  return useCssElementUntyped(Animated.Text, props, { className: "style" });
};
AnimatedText.displayName = "CSS(AnimatedText)";

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: React.ComponentProps<typeof RNTouchableHighlight>,
) {
  // NativeWind funnels underlayColor through the style object; peel it back out.
  const { underlayColor, ...style } = (StyleSheet.flatten(props.style) ||
    {}) as ViewStyle & { underlayColor?: string };
  return (
    <RNTouchableHighlight
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight> & {
    className?: string;
  },
) => {
  return useCssElementUntyped(XXTouchableHighlight, props, {
    className: "style",
  });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";

// FlatList
export function FlatList<T>(
  props: React.ComponentProps<typeof RNFlatList<T>> & {
    className?: string;
    contentContainerClassName?: string;
  },
) {
  return useCssElementUntyped(RNFlatList<T>, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
}
FlatList.displayName = "CSS(FlatList)";

// SafeAreaView
export const SafeAreaView = (
  props: React.ComponentProps<typeof RNSafeAreaView> & {
    className?: string;
  },
) => {
  return useCssElementUntyped(RNSafeAreaView, props, { className: "style" });
};
SafeAreaView.displayName = "CSS(SafeAreaView)";

export { Image, ImageProps } from "./image";
