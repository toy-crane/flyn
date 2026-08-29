import { Uniwind } from "uniwind";

/**
 * A value for every semantic role the app reads.
 *
 * `useThemeColor` answers with the string `"invalid"` for a role this table
 * misses, and that string travels on as if it were a colour: `react-native-svg`
 * warns about it, and an assertion like `expect(color).toBeTruthy()` still
 * passes because a non-empty string is truthy. A missing role therefore costs a
 * test its meaning rather than failing it, so a role the app reads has to be
 * here — and reading a new one in the app means adding it here too.
 *
 * These are stand-ins, not the product palette. The real values live in
 * `global.css`, which Jest never loads; what tests need is that every role
 * resolves to something a renderer accepts, and that roles meant to contrast do.
 */
export const testThemeVariables = {
  "--color-accent": "#4285f4",
  "--color-accent-foreground": "#ffffff",
  "--color-accent-hover": "#3277e6",
  "--color-accent-soft-foreground": "#1d4ed8",
  "--color-background": "#f4f4f6",
  "--color-border": "#d4d4d8",
  "--color-danger": "#dc2626",
  "--color-danger-foreground": "#ffffff",
  "--color-danger-hover": "#b91c1c",
  "--color-danger-soft-foreground": "#b91c1c",
  "--color-danger-soft-hover": "#fee2e2",
  "--color-default-foreground": "#111114",
  "--color-default-hover": "#e5e7eb",
  "--color-foreground": "#111114",
  "--color-link": "#2563eb",
  "--color-muted": "#6b7280",
  "--color-success": "#16a34a",
  "--color-success-foreground": "#ffffff",
  "--color-success-soft-foreground": "#15803d",
  "--color-surface": "#ffffff",
  "--color-surface-foreground": "#111114",
  "--color-warning": "#ca8a04",
  // 교정 채널. HeroUI의 시맨틱 집합에 이 뜻을 가진 역할이 없어서 앱이 전역
  // CSS에 직접 등재했고, 이름도 `--color-` 없이 그 이름 그대로다.
  "--learn": "#7c3aed",
  "--learn-foreground": "#ffffff",
  "--learn-surface": "#f1ebfd",
  "--theme": "default",
};

/**
 * Put the theme in front of every test, not only the ones that render through
 * `renderWithHeroUI`.
 *
 * `renderRouter` from `expo-router/testing-library` draws the real screens
 * without that helper, and those screens read the same roles. Leaving the
 * variables to the helper left every colour in a routing test unresolved.
 */
export function applyTestTheme() {
  Uniwind.updateCSSVariables("light", testThemeVariables);
  Uniwind.updateCSSVariables("dark", testThemeVariables);
}
