import { Text } from "@/tw";

/** Screen headline — the large type at the top of a screen. */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <Text
      role="heading"
      className="mt-3.5 mb-1.5 text-[23px] font-bold leading-8 tracking-tight text-foreground"
    >
      {children}
    </Text>
  );
}

/** The supporting line under a screen title. */
export function ScreenSubtitle({ children }: { children: string }) {
  return (
    <Text className="mb-4 text-[15px] leading-6 text-muted">{children}</Text>
  );
}

/** Section label inside a screen ("이번 이야기의 교정"). */
export function SectionHeading({ children }: { children: string }) {
  return (
    <Text className="mt-5 mb-2.5 text-[15px] font-bold text-foreground">
      {children}
    </Text>
  );
}
