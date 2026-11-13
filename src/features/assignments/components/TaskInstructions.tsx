import { MarkdownRenderer } from "@/components/ui/Markdown";

// components/Assignment/TaskInstructions.tsx
type Props = {
  instructions: string;

};


export function TaskInstructions({ instructions }: Props) {
  return (
    <div className="p-4">
      <MarkdownRenderer content={instructions} />
    </div>
  );
}
