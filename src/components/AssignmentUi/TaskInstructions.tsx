// components/Assignment/TaskInstructions.tsx
type Props = {
  title: string;
  instructions: string;
  xp: number;
  dueDate: string;
};

const chip =
  "rounded-md bg-[#161b22] px-2 py-0.5 text-xs text-[#c9d1d9] ring-1 ring-inset ring-[#30363d]";

export function TaskInstructions({ title, instructions, xp, dueDate }: Props) {
  const due = new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className={chip}>{xp} XP</span>
        <span className={chip}>Due {due}</span>
      </div>

      <div className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-[#c9d1d9]">
        {instructions}
      </div>
    </div>
  );
}