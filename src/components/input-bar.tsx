import { Pressable, Text, TextInput, View } from "@/tw";

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
  return (
    <View className="flex-row items-center gap-2 bg-background px-3 pt-3 pb-2">
      <TextInput
        className="min-h-11 flex-1 rounded-full bg-fill px-4 py-3 text-sm text-foreground"
        placeholder={placeholder}
        placeholderTextColor="#8b95a1"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="보내기"
        onPress={onSend}
        className="h-11 w-11 items-center justify-center rounded-full bg-accent"
      >
        <Text className="text-base text-white">➤</Text>
      </Pressable>
    </View>
  );
}
