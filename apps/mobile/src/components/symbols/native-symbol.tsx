import { Icon } from "@expo/ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import type { ColorValue } from "react-native";
import { APP_SYMBOLS, type AppSymbolName } from "./app-symbols";

interface NativeSymbolProps {
  color?: ColorValue;
  symbol: AppSymbolName;
}

export function NativeSymbol({ color, symbol }: NativeSymbolProps) {
  const definition = APP_SYMBOLS[symbol];

  return (
    <Icon
      color={color}
      modifiers={[
        font({
          size: definition.size,
          weight: definition.weight,
        }),
        ...(color
          ? []
          : [
              foregroundStyle({
                style: "secondary",
                type: "hierarchical",
              }),
            ]),
      ]}
      name={definition.name}
    />
  );
}
