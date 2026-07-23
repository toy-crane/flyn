import { View } from "@/tw";

/**
 * The two speech bubbles from the app icon, laid out as in app-icon.svg
 * (1024 master: 180,225 and 404,535, each 440×270 with a 135 radius).
 */
export function AppMark({ size = 76 }: { size?: number }) {
  const s = size / 1024;
  const bubble = { width: 440 * s, height: 270 * s, borderRadius: 135 * s };

  return (
    // Fixed brand blue, matching app-icon.svg — the app mark stays this exact
    // color regardless of the systemBlue tint or light/dark mode (brand
    // exception, see docs/design-guidelines.md).
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.237,
        backgroundColor: "#3182f6",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 180 * s,
          top: 225 * s,
          backgroundColor: "#ffffff",
          ...bubble,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 404 * s,
          top: 535 * s,
          backgroundColor: "#a8ccfa",
          ...bubble,
        }}
      />
    </View>
  );
}
