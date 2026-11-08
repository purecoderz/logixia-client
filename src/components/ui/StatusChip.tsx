export type Tone = "neutral" | "success" | "warning" | "info" | "draft";

const tones: Record<Tone, string> = {
  neutral: "bg-gray-500/20 text-body",
  success: "bg-emerald-500/15 text-success",
  warning: "bg-amber-500/15 text-warning",
  info: "bg-sky-500/15 text-accent",
  draft: "border border-dashed border-line-strong text-body",
};

export function StatusChip({
  tone,
  children,
}: {
  tone: Tone;
  children: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
