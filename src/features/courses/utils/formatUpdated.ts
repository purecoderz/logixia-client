const day = new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" });

/** "2026-10-27" -> "Oct 27" */
export function formatUpdated(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : day.format(d);
}
