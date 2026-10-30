// components/LiveRoom/FloatingTerminal.tsx
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { X } from "lucide-react";
import { TerminalOutput } from "../SmartTerminal/TerminalOutput";
import type { TerminalLine } from "../SmartTerminal/TerminalView";

interface FloatingTerminalProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  lines: TerminalLine[];
}

type Pos = { x: number; y: number };

const WIDTH = 440;
const HEIGHT = 280;
const STORAGE_KEY = "room:terminal-pos";

// Keeps the whole window inside the screen, so it can't be lost off an edge
const clamp = (p: Pos): Pos => ({
  x: Math.min(Math.max(0, p.x), Math.max(0, window.innerWidth - WIDTH)),
  y: Math.min(Math.max(0, p.y), Math.max(0, window.innerHeight - HEIGHT)),
});

function startPosition(): Pos {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved && typeof saved.x === "number" && typeof saved.y === "number") return clamp(saved);
  } catch {
    /* fall through to the default */
  }
  // bottom right, above the status bar
  return clamp({ x: window.innerWidth - WIDTH - 24, y: window.innerHeight - HEIGHT - 64 });
}

export function FloatingTerminal({ open, onClose, isMobile, lines }: FloatingTerminalProps) {
  const [pos, setPos] = useState<Pos>(startPosition);
  const posRef = useRef(pos);            // always the latest position, even inside event handlers
  const grab = useRef<Pos | null>(null); // where inside the title bar I picked it up

  const move = (next: Pos) => {
    const clamped = clamp(next);
    posRef.current = clamped;
    setPos(clamped);
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current));
    } catch {
      /* storage can be unavailable, it's only a convenience */
    }
  };

  // The browser window got smaller: pull the terminal back on screen
  useEffect(() => {
    const onResize = () => {
      const clamped = clamp(posRef.current);
      posRef.current = clamped;
      setPos(clamped);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!open) return null;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return; // the close button isn't a handle
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!grab.current) return;
    move({ x: e.clientX - grab.current.x, y: e.clientY - grab.current.y });
  };

  const onPointerUp = () => {
    if (!grab.current) return;
    grab.current = null;
    save(); // once, when you let go, not on every pixel
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 48 : 16;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = deltas[e.key];
    if (!delta) return;
    e.preventDefault();
    move({ x: posRef.current.x + delta[0], y: posRef.current.y + delta[1] });
    save();
  };

  const title = (
    <span className="flex items-center gap-2 text-xs text-[#c9d1d9]">
      Instructor's terminal
      <span className="rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] text-[#8b949e]">View only</span>
    </span>
  );

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Hide terminal"
      className="flex size-7 items-center justify-center rounded text-[#8b949e] hover:bg-[#30363d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
    >
      <X size={16} aria-hidden />
    </button>
  );

  // Phones: a sheet at the bottom, no dragging
  if (isMobile) {
    return (
      <section
        aria-label="Instructor's terminal"
        className="fixed inset-x-0 bottom-0 z-30 flex h-[40dvh] flex-col overflow-hidden rounded-t-xl border-t border-[#30363d] bg-[#0d1117] shadow-2xl"
      >
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#21262d] bg-[#161b22] pl-3 pr-1">
          {title}
          {closeButton}
        </div>
        <TerminalOutput lines={lines} />
      </section>
    );
  }

  return (
    <section
      aria-label="Instructor's terminal"
      style={{ left: pos.x, top: pos.y, width: WIDTH, height: HEIGHT }}
      className="fixed z-30 flex flex-col overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117] shadow-2xl"
    >
      <div
        role="group"
        tabIndex={0}
        aria-label="Terminal title bar. Use the arrow keys to move the window."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="flex h-9 shrink-0 cursor-grab touch-none select-none items-center justify-between border-b border-[#21262d] bg-[#161b22] pl-3 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#58a6ff] active:cursor-grabbing"
      >
        {title}
        {closeButton}
      </div>
      <TerminalOutput lines={lines} />
    </section>
  );
}