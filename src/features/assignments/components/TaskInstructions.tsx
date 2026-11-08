import { MarkdownRenderer } from "@/components/ui/Markdown";

// components/Assignment/TaskInstructions.tsx
type Props = {
  instructions: string;

};


export function TaskInstructions({ instructions,}: Props) {
  // const due = new Date(dueDate).toLocaleDateString(undefined, {
  //   month: "short",
  //   day: "numeric",
  // });

  return (
    <div className="h-full overflow-y-auto p-4">

      <MarkdownRenderer content={instructions} />
    </div>
  );
}
