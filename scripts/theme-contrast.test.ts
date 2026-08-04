import { describe, test } from "bun:test";
import { PRODUCT_STATE_COLORS } from "../apps/mobile/src/theme/product-colors";

const MINIMUM_BODY_TEXT_CONTRAST = 4.5;
const NATIVE_SURFACE_FIXTURES = {
  dark: ["#000000", "#1C1C1E"],
  light: ["#F7F7F5", "#FFFFFF"],
} as const;

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );

  if (!channels) {
    throw new Error(`hex 색이 아닙니다: ${hex}`);
  }

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground: string, background: string) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

describe("앱의 명시적 제품 상태색 대비", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`${mode} danger/success는 native 배경 fixture에서 4.5:1 이상이다`, () => {
      const state = PRODUCT_STATE_COLORS[mode];

      for (const foreground of [state.danger, state.success]) {
        for (const background of NATIVE_SURFACE_FIXTURES[mode]) {
          const ratio = contrast(foreground, background);

          if (ratio < MINIMUM_BODY_TEXT_CONTRAST) {
            throw new Error(
              `${mode} ${foreground}/${background} 대비가 ${ratio.toFixed(2)}:1입니다.`
            );
          }
        }
      }
    });
  }
});
