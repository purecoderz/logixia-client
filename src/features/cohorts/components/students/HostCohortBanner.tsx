import { Users } from "lucide-react";

export function HostCohortBanner({ onNotify }: { onNotify?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-4">
      <Users size={28} className="shrink-0 text-accent" aria-hidden />
      <div className="flex-1">
        <p className="text-sm text-foreground">
          Coming soon: host your own cohort
        </p>
        <p className="text-xs text-muted">
          Teachers will be able to run cohorts on Logixia.
        </p>
      </div>
      <button
        onClick={onNotify}
        className="rounded-lg border border-line px-3 py-1.5 text-xs text-body hover:border-[#8b949e]"
      >
        Notify me
      </button>
    </div>
  );
}
