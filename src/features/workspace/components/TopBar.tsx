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
        <header className="h-10 shrink-0 flex items-center justify-between px-2 bg-[#161b22] border-b border-[#30363d]">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-[#8b949e] hover:bg-[#30363d]/60 hover:text-[#c9d1d9] transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <div className="w-px h-4 bg-[#30363d]" />
                <span className="text-sm truncate">{title}</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
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
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-sm border border-[#30363d] hover:bg-[#30363d]/60 transition-colors"
                >
                    <Download size={14} />
                    Export
                </button>
            </div>
        </header>
    );
}