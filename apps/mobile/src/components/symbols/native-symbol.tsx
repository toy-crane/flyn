import { Icon } from "@expo/ui";
import { font } from "@expo/ui/swift-ui/modifiers";
import { APP_SYMBOLS, type AppSymbolName } from "./app-symbols";

interface NativeSymbolProps {
  color: string;
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
      ]}
      name={definition.name}
    />
  );
}
