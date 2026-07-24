import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function Card({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <View className="w-full gap-2 rounded-2xl bg-white/80 p-5 dark:bg-white/10">
      {label ? (
        <Text className="text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function CardError({ children }: { children: ReactNode }) {
  return (
    <Text className="font-semibold text-lg text-rose-600 dark:text-rose-400">
      {children}
    </Text>
  );
}

export function CardValue({ children }: { children: ReactNode }) {
  return (
    <Text className="font-semibold text-emerald-600 text-lg dark:text-emerald-400">
      {children}
    </Text>
  );
}
