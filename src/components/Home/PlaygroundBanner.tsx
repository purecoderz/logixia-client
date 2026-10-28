import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export function PlaygroundBanner() {
  return (
    <div className="relative">
      {/* the horizontal line */}
      <div className="absolute inset-x-0 top-1/2 border-t border-[#30363d]" />

      {/* the card, centred on the line */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-4 rounded-xl border border-[#30363d] bg-[#0d1117] p-5 shadow-xl shadow-black/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Terminal size={20} className="mt-0.5 shrink-0 text-[#3fb950]" />
          <div>
            <p className="text-sm font-medium text-white">
              Not ready to commit? Just start coding.
            </p>
            <p className="mt-0.5 text-xs text-[#8b949e]">
              Open the playground, write code in your browser and run it instantly.
            </p>
          </div>
        </div>
        <Link
          to="/playground"
          className="inline-flex items-center justify-center rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white"
        >
          Open playground
        </Link>
      </div>
    </div>
  );
}