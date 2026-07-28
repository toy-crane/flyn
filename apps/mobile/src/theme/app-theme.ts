import { useCSSVariable } from "uniwind";

/**
 * className을 받을 수 없는 네이티브 경계에 CSS 테마를 건네는 얇은 브리지.
 * 값은 global.css만 소유하고 이 모듈은 변수 이름과 역할 대응만 안다.
 */
const APP_THEME_VARIABLES = [
  "--app-background",
  "--app-surface",
  "--app-foreground",
  "--app-muted-foreground",
  "--app-disabled-foreground",
  "--app-placeholder",
  "--app-border",
  "--app-primary",
  "--app-primary-foreground",
  "--app-disabled",
  "--app-overlay",
  "--app-danger",
  "--app-success",
];

export function useAppTheme() {
  const [
    background,
    surface,
    foreground,
    mutedForeground,
    disabledForeground,
    placeholder,
    border,
    primary,
    primaryForeground,
    disabled,
    overlay,
    danger,
    success,
  ] = useCSSVariable(APP_THEME_VARIABLES);

  return {
    background: background as string,
    border: border as string,
    danger: danger as string,
    disabled: disabled as string,
    disabledForeground: disabledForeground as string,
    foreground: foreground as string,
    mutedForeground: mutedForeground as string,
    overlay: overlay as string,
    placeholder: placeholder as string,
    primary: primary as string,
    primaryForeground: primaryForeground as string,
    success: success as string,
    surface: surface as string,
  };
}
