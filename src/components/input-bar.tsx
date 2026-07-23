import { SymbolView } from "expo-symbols";

import { Pressable, TextInput, View, useCSSVariable } from "@/tw";

type InputBarProps = {
  placeholder: string;
  value?: string;
  onChangeText?: (value: string) => void;
  onSend?: () => void;
  editable?: boolean;
};

/** Pinned composer for the story session and the correction thread. */
export function InputBar({
  placeholder,
  value,
  onChangeText,
  onSend,
  editable = true,
}: InputBarProps) {
  const placeholderColor = useCSSVariable("--color-tertiary");
  const tint = useCSSVariable("--color-tint");

  return (
    <View className="flex-row items-center gap-2 bg-background px-3 pt-3 pb-2">
      <TextInput
        className="min-h-11 flex-1 rounded-full bg-fill px-4 py-3 text-[17px] text-label"
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="보내기"
        onPress={onSend}
        className="h-11 w-11 items-center justify-center active:opacity-75"
      >
        <SymbolView name="arrow.up.circle.fill" size={32} tintColor={tint} />
      </Pressable>
    </View>
  );
}
