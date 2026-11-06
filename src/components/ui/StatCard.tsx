interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning";
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  const warn = tone === "warning";
  return (
    <div
      className={`rounded-xl border p-5 ${
        warn ? "border-amber-500/40 bg-amber-500/10" : "border-line bg-surface-muted/30"
      }`}
    >
      <p className={`text-sm font-medium ${warn ? "text-warning" : "text-muted"}`}>{label}</p>
      <p className={`mt-1 text-3xl font-bold tracking-tight ${warn ? "text-warning" : "text-foreground"}`}>
        {value}
      </p>
      {hint && <p className={`mt-1 text-sm ${warn ? "text-warning/80" : "text-muted"}`}>{hint}</p>}
    </div>
  );
}