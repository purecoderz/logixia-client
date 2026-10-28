// components/SmartTerminal/TerminalOutput.tsx
import { useEffect, useRef } from "react";
import { COLORS, type TerminalLine } from "./TerminalView";

export function TerminalOutput({ lines }: { lines: TerminalLine[] }) {
  const box = useRef<HTMLDivElement>(null);

  // Stay at the newest line. Setting scrollTop only moves this box,
  // while scrollIntoView can also scroll the whole page behind it
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div
      ref={box}
      role="log"
      aria-label="Terminal output"
      className="min-h-0 flex-1 overflow-y-auto bg-[#161b22] px-3 py-2 font-mono text-xs"
    >
      {lines.map((line, i) => (
        <div key={i} className={`whitespace-pre-wrap break-words ${COLORS[line.kind]}`}>
          {line.kind === "command" ? `$ ${line.text}` : line.text}
        </div>
      ))}
    </div>
  );
}