import { ThemeToggle } from "../../theme/ThemeToggle";
// components/TopBar.tsx
import { ArrowLeft, Download, Play } from "lucide-react";

type TopBarProps = {
  title: string;
  onBack: () => void;
  onExport: () => void;
  onRun?: () => void;
};

export function TopBar({ title, onBack, onExport, onRun }: TopBarProps) {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-2 bg-surface border-b border-line">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-muted hover:bg-hover/60 hover:text-body transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="mx-1 w-px h-5 bg-line" />
        <img
          src="/logixialogo.webp"
          alt=""
          className="hidden size-7 object-contain sm:block"
        />
        <span className="text-sm font-semibold tracking-tight truncate">
          {title}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {onRun && (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-sm bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
          >
            <Play size={14} />
            Run
          </button>
        )}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-sm border border-line hover:bg-hover/60 transition-colors"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </header>
  );
}
