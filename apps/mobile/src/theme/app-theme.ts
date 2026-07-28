import { useCSSVariable } from "uniwind";

const APP_THEME_VARIABLES = [
  "--app-background",
  "--app-border",
  "--app-danger",
  "--app-disabled",
  "--app-disabled-foreground",
  "--app-foreground",
  "--app-muted-foreground",
  "--app-overlay",
  "--app-placeholder",
  "--app-primary",
  "--app-primary-foreground",
  "--app-success",
  "--app-surface",
];

function themeColor(value: number | string | undefined, variable: string) {
  if (typeof value !== "string") {
    throw new Error(`Theme variable ${variable} did not resolve to a color.`);
  }

  return value;
}

/**
 * className을 받을 수 없는 네이티브 경계에 CSS 테마를 전달한다.
 * 값은 global.css만 소유하고 이 훅은 변수와 역할의 대응만 안다.
 */
export function useAppTheme() {
  const values = useCSSVariable(APP_THEME_VARIABLES);

  return {
    background: themeColor(values[0], APP_THEME_VARIABLES[0]),
    border: themeColor(values[1], APP_THEME_VARIABLES[1]),
    danger: themeColor(values[2], APP_THEME_VARIABLES[2]),
    disabled: themeColor(values[3], APP_THEME_VARIABLES[3]),
    disabledForeground: themeColor(values[4], APP_THEME_VARIABLES[4]),
    foreground: themeColor(values[5], APP_THEME_VARIABLES[5]),
    mutedForeground: themeColor(values[6], APP_THEME_VARIABLES[6]),
    overlay: themeColor(values[7], APP_THEME_VARIABLES[7]),
    placeholder: themeColor(values[8], APP_THEME_VARIABLES[8]),
    primary: themeColor(values[9], APP_THEME_VARIABLES[9]),
    primaryForeground: themeColor(values[10], APP_THEME_VARIABLES[10]),
    success: themeColor(values[11], APP_THEME_VARIABLES[11]),
    surface: themeColor(values[12], APP_THEME_VARIABLES[12]),
  };
}
