import { Users } from "lucide-react";

export function HostCohortBanner({ onNotify }: { onNotify?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#30363d] p-4">
      <Users size={28} className="shrink-0 text-[#58a6ff]" aria-hidden />
      <div className="flex-1">
        <p className="text-sm text-white">Coming soon: host your own cohort</p>
        <p className="text-xs text-[#8b949e]">Teachers will be able to run cohorts on Logixia.</p>
      </div>
      <button
        onClick={onNotify}
        className="rounded-lg border border-[#30363d] px-3 py-1.5 text-xs text-[#c9d1d9] hover:border-[#8b949e]"
      >
        Notify me
      </button>
    </div>
  );
}