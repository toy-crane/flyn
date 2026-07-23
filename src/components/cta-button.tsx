import { Pressable, Text } from "@/tw";

type CtaButtonProps = {
  label: string;
  onPress?: () => void;
  /** Ghost is the tinted secondary style used for "다른 상황 보기", "닫기". */
  variant?: "primary" | "ghost";
  disabled?: boolean;
};

export function CtaButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: CtaButtonProps) {
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      className={`min-h-[50px] items-center justify-center rounded-full px-4 py-3.5 ${
        disabled
          ? "bg-fill"
          : primary
            ? "bg-tint active:opacity-75"
            : "bg-tint-soft active:opacity-75"
      }`}
    >
      <Text
        className={`text-[17px] font-semibold ${
          disabled ? "text-tertiary" : primary ? "text-white" : "text-tint"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
