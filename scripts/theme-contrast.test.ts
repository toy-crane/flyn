import { describe, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MINIMUM_BODY_TEXT_CONTRAST = 4.5;
const THEME_CSS = readFileSync(
  join(import.meta.dir, "../apps/mobile/src/global.css"),
  "utf8"
);

function themeVariant(name: "dark" | "light") {
  const body = THEME_CSS.match(
    new RegExp(`@variant ${name} \\{([^}]*)\\}`)
  )?.[1];

  if (!body) {
    throw new Error(`${name} 테마를 찾지 못했습니다.`);
  }

  return Object.fromEntries(
    [...body.matchAll(/--app-([\w-]+):\s*(#[\da-f]{6});/gi)].map(
      ([, role, value]) => [role, value]
    )
  );
}

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

describe("앱 테마의 일반 텍스트 대비", () => {
  for (const mode of ["light", "dark"] as const) {
    test(`${mode}의 명시적 텍스트 역할은 실제 배경에서 4.5:1 이상이다`, () => {
      const theme = themeVariant(mode);
      const pairs = [
        ["foreground", "background"],
        ["foreground", "surface"],
        ["muted-foreground", "background"],
        ["muted-foreground", "surface"],
        ["danger", "background"],
        ["danger", "surface"],
        ["success", "background"],
        ["success", "surface"],
      ] as const;

      for (const [foreground, background] of pairs) {
        const ratio = contrast(theme[foreground], theme[background]);

        if (ratio < MINIMUM_BODY_TEXT_CONTRAST) {
          throw new Error(
            `${mode} ${foreground}/${background} 대비가 ${ratio.toFixed(2)}:1입니다.`
          );
        }
      }
    });
  }
});
