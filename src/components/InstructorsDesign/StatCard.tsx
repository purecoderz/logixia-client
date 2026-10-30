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
        warn ? "border-amber-500/40 bg-amber-500/10" : "border-gray-800 bg-gray-800/30"
      }`}
    >
      <p className={`text-sm font-medium ${warn ? "text-amber-300" : "text-gray-400"}`}>{label}</p>
      <p className={`mt-1 text-3xl font-bold tracking-tight ${warn ? "text-amber-200" : "text-gray-50"}`}>
        {value}
      </p>
      {hint && <p className={`mt-1 text-sm ${warn ? "text-amber-200/80" : "text-gray-400"}`}>{hint}</p>}
    </div>
  );
}