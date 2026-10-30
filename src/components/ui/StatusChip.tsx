export type Tone = "neutral" | "success" | "warning" | "info" | "draft";

const tones: Record<Tone, string> = {
  neutral: "bg-gray-500/20 text-gray-300",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
  info: "bg-sky-500/15 text-sky-300",
  draft: "border border-dashed border-gray-500 text-gray-300",
};

export function StatusChip({ tone, children }: { tone: Tone; children: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}