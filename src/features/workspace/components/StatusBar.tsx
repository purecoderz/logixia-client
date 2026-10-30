type StatusBarProps = {
    runtime: "loading" | "ready" | "running";
    language?: string | null;
    filePath?: string | null;
};

const RUNTIME = {
    loading: { label: "Loading Python...", dot: "bg-[#ffbd2e]" },
    ready: { label: "Python ready", dot: "bg-[#27c93f]" },
    running: { label: "Running...", dot: "bg-[#58a6ff] animate-pulse" },
};

export function StatusBar({ runtime, language, filePath }: StatusBarProps) {
    const r = RUNTIME[runtime];

    return (
        <div className="h-6 shrink-0 flex items-center justify-between px-3 bg-[#161b22] border-t border-[#30363d] text-[11px] text-[#8b949e] select-none">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${r.dot}`} />
                <span>{r.label}</span>
            </div>

            <div className="flex items-center gap-4">
                {filePath && <span className="truncate max-w-[300px]">{filePath}</span>}
                {language && <span className="capitalize">{language}</span>}
            </div>
        </div>
    );
}