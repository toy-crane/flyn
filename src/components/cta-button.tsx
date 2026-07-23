import { Pressable, Text } from "@/tw";

type CtaButtonProps = {
  label: string;
  onPress?: () => void;
  /** Ghost is the secondary fill used for "다른 상황 보기", "닫기". */
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
      onPress={onPress}
      disabled={disabled}
      className={`rounded-cta py-4 px-4 items-center ${
        primary ? "bg-accent" : "bg-fill"
      } ${disabled ? "opacity-40" : ""}`}
    >
      <Text
        className={`text-base font-bold ${
          primary ? "text-white" : "text-sub2"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
