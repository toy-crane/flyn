import { useLocalSearchParams } from "expo-router";

import { BookDetailScreen } from "@/screens/book-detail";

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BookDetailScreen sessionId={id} />;
}
