/** 1200000 -> "₦1.2M", 810000 -> "₦810K", 0 -> "—" */
export function formatNaira(amount: number) {
  if (amount <= 0) return "—";
  if (amount >= 1_000_000) return `₦${+(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}K`;
  return `₦${amount}`;
}

const day = new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" });

/** "Oct 1 – Dec 20" */
export function formatDateRange(start?: string, end?: string) {
  if (!start || !end) return "Dates not set";
  return `${day.format(new Date(start))} – ${day.format(new Date(end))}`;
}