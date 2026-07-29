import { SymbolView } from "expo-symbols";
import { APP_SYMBOLS, type AppSymbolName } from "./app-symbols";

interface RNSymbolProps {
  color: string;
  symbol: AppSymbolName;
}

export function RNSymbol({ color, symbol }: RNSymbolProps) {
  const definition = APP_SYMBOLS[symbol];

  return (
    <SymbolView
      accessibilityElementsHidden
      name={definition.name}
      size={definition.size}
      tintColor={color}
      weight={definition.weight}
    />
  );
}
