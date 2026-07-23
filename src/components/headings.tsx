import { Text } from "@/tw";

/**
 * In-body question headline (Title2) — used on pushed form-like screens
 * (상황 만들기, 온보딩) that ask a single question below their own small
 * native header. Tab-root screens use a native large title instead; see
 * docs/design-guidelines.md.
 */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <Text
      role="heading"
      className="mt-3.5 mb-1.5 text-[22px] font-bold leading-8 tracking-tight text-label"
    >
      {children}
    </Text>
  );
}

/** The supporting line under a screen title. */
export function ScreenSubtitle({ children }: { children: string }) {
  return (
    <Text className="mb-4 text-[15px] leading-6 text-secondary">
      {children}
    </Text>
  );
}

/** Section label inside a screen ("이번 이야기의 교정"). */
export function SectionHeading({ children }: { children: string }) {
  return (
    <Text className="mt-5 mb-2.5 text-[13px] font-semibold text-secondary">
      {children}
    </Text>
  );
}
