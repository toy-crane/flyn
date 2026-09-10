import { TabStack } from "@/core/navigation/tab-stack";
import { noteLabels } from "@/features/note/ui/note-labels";

export default function NotesLayout() {
  return <TabStack routeName="notes" title={noteLabels.title} />;
}
