import { useEffect, useRef, useState } from "react";
import { Check, Copy, Eraser, Play, Square } from "lucide-react";


export type TerminalLine = {
    kind: "command" | "stdout" | "stderr" | "system";
    text: string;
};

export const COLORS: Record<TerminalLine["kind"], string> = {
    command: "text-[#50fa7b]",
    stdout: "text-[#f8f8f2]",
    stderr: "text-[#ff5555]",
    system: "text-[#8b949e]",
};

type TerminalViewProps = {
    lines: TerminalLine[];
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: () => void;
    isRunning?: boolean;
    onRun?: () => void;
    onStop?: () => void;
    onNavigate: (direction: "up" | "down") => void
    prompts?: string | null
    onComplete: () => void
    onClear: () => void;
};

export function TerminalView({
    lines,
    input,
    onInputChange,
    onSubmit,
    isRunning = false,
    onRun,
    onStop,
    prompts,
    onComplete,
    onClear,
    onNavigate
}: TerminalViewProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const copyOutput = async () => {
        const text = lines
            .map((l) => (l.kind === "command" ? `$ ${l.text}` : l.text))
            .join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard blocked; ignore
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: "end" });
    }, [lines, input]);

    useEffect(() => {
        if (prompts !== null) inputRef.current?.focus();
    }, [prompts]);



    return (
        <div className="flex flex-col h-full bg-[#161b22] font-mono text-xs">
            {/* Header (macOS style) */}
            <div className="relative h-9 shrink-0 flex items-center justify-between px-3 bg-[#21262d] border-b border-[#30363d] select-none">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>

                <span className="absolute inset-x-0 text-center text-[12px] text-[#8b949e] pointer-events-none">
                    Terminal
                </span>

                <div className="relative z-10 flex items-center gap-2">
                    <button
                        onClick={onClear}
                        disabled={lines.length === 0}
                        title="Clear terminal"
                        aria-label="Clear terminal"
                        className="p-1.5 rounded-md text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Eraser size={14} />
                    </button>
                    <button
                        onClick={copyOutput}
                        disabled={lines.length === 0}
                        title={copied ? "Copied" : "Copy output"}
                        aria-label="Copy output"
                        className="p-1.5 rounded-md text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {copied ? <Check size={14} className="text-[#50fa7b]" /> : <Copy size={14} />}
                    </button>

                    {isRunning ? (
                        <button
                            onClick={onStop}
                            title="Stop"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-sans bg-[#da3633] text-white hover:bg-[#f85149] transition-colors"
                        >
                            <Square size={11} fill="currentColor" />
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={onRun}
                            title="Run"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-sans bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
                        >
                            <Play size={11} fill="currentColor" />
                            Run
                        </button>
                    )}
                </div>
            </div>

            {/* Output + prompt, scroll together */}
            <div
                className="flex-1 min-h-0 overflow-y-auto px-3 py-2"
                onClick={() => inputRef.current?.focus()}
            >
                {lines.map((line, i) => (
                    <div key={i} className={`whitespace-pre-wrap break-words ${COLORS[line.kind]}`}>
                        {line.kind === "command" ? `$ ${line.text}` : line.text}
                    </div>
                ))}

                {/* Prompt: always the last row */}
                <div className={`flex items-center ${prompts === null ? "gap-2" : ""}`}>
                    <span
                        className={`whitespace-pre ${prompts === null ? "text-[#bd93f9]" : "text-[#f8f8f2]"
                            }`}
                    >
                        {prompts === null ? "$" : prompts}
                    </span>

                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSubmit();
                            if (e.key === "ArrowUp") {
                                e.preventDefault();
                                onNavigate("up");
                            }
                            if (e.key === "Tab") {
                                e.preventDefault();
                                onComplete();
                            }
                            if (e.key === "ArrowDown") {
                                e.preventDefault();
                                onNavigate("down");
                            }
                        }}
                        className="flex-1 min-w-0 bg-transparent outline-none text-[#f8f8f2]"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>

                <div ref={bottomRef} />
            </div>
        </div>
    );
}