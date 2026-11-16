// components/LiveRoom/FloatingTerminal.tsx
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { X } from "lucide-react";
import type { TerminalLine } from "@/components/SmartTerminal/TerminalView";
import { TerminalOutput } from "@/components/SmartTerminal/TerminalOutput";

interface FloatingTerminalProps {
  renderSurface?: (children: ReactNode) => ReactNode;
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  lines: TerminalLine[];
}

type Pos = { x: number; y: number };
type Size = { width: number; height: number };

const DEFAULT_WIDTH = 440;
const DEFAULT_HEIGHT = 280;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 160;
const MIN_MOBILE_HEIGHT = 180;
const POS_STORAGE_KEY = "room:terminal-pos";
const SIZE_STORAGE_KEY = "room:terminal-size";

const clampSize = (s: Size, pos: Pos = { x: 0, y: 0 }): Size => ({
  width: Math.min(
    Math.max(MIN_WIDTH, s.width),
    Math.max(MIN_WIDTH, window.innerWidth - pos.x),
  ),
  height: Math.min(
    Math.max(MIN_HEIGHT, s.height),
    Math.max(MIN_HEIGHT, window.innerHeight - pos.y),
  ),
});

// Keeps the whole window inside the screen, so it can't be lost off an edge
const clampPos = (p: Pos, s: Size): Pos => ({
  x: Math.min(Math.max(0, p.x), Math.max(0, window.innerWidth - s.width)),
  y: Math.min(Math.max(0, p.y), Math.max(0, window.innerHeight - s.height)),
});

function startSize(): Size {
  try {
    const saved = JSON.parse(localStorage.getItem(SIZE_STORAGE_KEY) ?? "null");
    if (
      saved &&
      typeof saved.width === "number" &&
      typeof saved.height === "number"
    ) {
      return clampSize(saved);
    }
  } catch {
    /* fall through to the default */
  }
  return clampSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
}

function startPosition(size: Size): Pos {
  try {
    const saved = JSON.parse(localStorage.getItem(POS_STORAGE_KEY) ?? "null");
    if (saved && typeof saved.x === "number" && typeof saved.y === "number")
      return clampPos(saved, size);
  } catch {
    /* fall through to the default */
  }
  // bottom right, above the status bar
  return clampPos(
    {
      x: window.innerWidth - size.width - 24,
      y: window.innerHeight - size.height - 64,
    },
    size,
  );
}

const clampMobileHeight = (height: number): number =>
  Math.min(
    Math.max(MIN_MOBILE_HEIGHT, height),
    Math.max(MIN_MOBILE_HEIGHT, Math.round(window.innerHeight * 0.85)),
  );

export function FloatingTerminal({
  open,
  onClose,
  isMobile,
  lines,
  renderSurface = (children) => children,
}: FloatingTerminalProps) {
  const [size, setSize] = useState<Size>(startSize);
  const [pos, setPos] = useState<Pos>(() => startPosition(size));
  const [mobileHeight, setMobileHeight] = useState<number>(() =>
    clampMobileHeight(Math.round(window.innerHeight * 0.4)),
  );

  const posRef = useRef(pos);
  const sizeRef = useRef(size);
  const mobileHeightRef = useRef(mobileHeight);

  const grab = useRef<Pos | null>(null);
  const resizeDrag = useRef<{
    axis: "x" | "y" | "xy";
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const mobileDrag = useRef<{ startY: number; startHeight: number } | null>(
    null,
  );

  const move = (next: Pos) => {
    const clamped = clampPos(next, sizeRef.current);
    posRef.current = clamped;
    setPos(clamped);
  };

  const updateSize = (next: Size) => {
    const clamped = clampSize(next, posRef.current);
    sizeRef.current = clamped;
    setSize(clamped);
  };

  const savePos = () => {
    try {
      localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(posRef.current));
    } catch {
      /* storage can be unavailable, it's only a convenience */
    }
  };

  const saveSize = () => {
    try {
      localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(sizeRef.current));
    } catch {
      /* storage can be unavailable, it's only a convenience */
    }
  };

  // The browser window got smaller: pull and fit the terminal back on screen
  useEffect(() => {
    const onResize = () => {
      const nextPos = clampPos(posRef.current, sizeRef.current);
      posRef.current = nextPos;
      setPos(nextPos);

      const nextSize = clampSize(sizeRef.current, nextPos);
      sizeRef.current = nextSize;
      setSize(nextSize);

      const nextMobile = clampMobileHeight(mobileHeightRef.current);
      mobileHeightRef.current = nextMobile;
      setMobileHeight(nextMobile);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!open) return null;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!grab.current) return;
    move({ x: e.clientX - grab.current.x, y: e.clientY - grab.current.y });
  };

  const onPointerUp = () => {
    if (!grab.current) return;
    grab.current = null;
    savePos();
  };

  const onResizeDown =
    (axis: "x" | "y" | "xy") => (e: PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeDrag.current = {
        axis,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: sizeRef.current.width,
        startHeight: sizeRef.current.height,
      };
    };

  const onResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = resizeDrag.current;
    if (!drag) return;
    const dx = drag.axis === "y" ? 0 : e.clientX - drag.startX;
    const dy = drag.axis === "x" ? 0 : e.clientY - drag.startY;
    updateSize({
      width: drag.startWidth + dx,
      height: drag.startHeight + dy,
    });
  };

  const onResizeUp = () => {
    if (!resizeDrag.current) return;
    resizeDrag.current = null;
    saveSize();
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
    savePos();
  };

  const title = (
    <span className="flex items-center gap-2 text-xs text-body">
      Instructor's terminal
      <span className="rounded bg-hover px-1.5 py-0.5 text-[10px] text-muted">
        View only
      </span>
    </span>
  );

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Hide terminal"
      className="flex size-7 items-center justify-center rounded text-muted hover:bg-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <X size={16} aria-hidden />
    </button>
  );

  // Phones: a resizable bottom sheet
  if (isMobile) {
    return (
      <section
        aria-label="Instructor's terminal"
        style={{ height: mobileHeight }}
        className="fixed inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden rounded-t-xl border-t border-line bg-input shadow-2xl"
      >
        {renderSurface(
          <div className="flex h-full flex-col">
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="Drag to resize terminal height"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                mobileDrag.current = {
                  startY: e.clientY,
                  startHeight: mobileHeightRef.current,
                };
              }}
              onPointerMove={(e) => {
                if (!mobileDrag.current) return;
                const next = clampMobileHeight(
                  mobileDrag.current.startHeight +
                    (mobileDrag.current.startY - e.clientY),
                );
                mobileHeightRef.current = next;
                setMobileHeight(next);
              }}
              onPointerUp={() => {
                mobileDrag.current = null;
              }}
              className="flex h-3 shrink-0 cursor-ns-resize touch-none items-center justify-center bg-surface"
            >
              <span className="h-1 w-10 rounded-full bg-line" />
            </div>
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-line bg-surface pl-3 pr-1">
              {title}
              {closeButton}
            </div>
            <TerminalOutput lines={lines} />
          </div>,
        )}
      </section>
    );
  }

  return (
    <section
      aria-label="Instructor's terminal"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
      }}
      className="fixed z-30 flex flex-col overflow-hidden rounded-lg border border-line bg-input shadow-2xl"
    >
      {renderSurface(
        <div className="relative flex h-full flex-col">
          <div
            role="group"
            tabIndex={0}
            aria-label="Terminal title bar. Use the arrow keys to move the window."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onKeyDown}
            className="flex h-9 shrink-0 cursor-grab touch-none select-none items-center justify-between border-b border-line bg-surface pl-3 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent active:cursor-grabbing"
          >
            {title}
            {closeButton}
          </div>
          <TerminalOutput lines={lines} />

          {/* Right edge resize handle */}
          <div
            aria-hidden
            onPointerDown={onResizeDown("x")}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            className="absolute inset-y-2 right-0 w-1.5 cursor-ew-resize touch-none hover:bg-accent/30"
          />

          {/* Bottom edge resize handle */}
          <div
            aria-hidden
            onPointerDown={onResizeDown("y")}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            className="absolute inset-x-2 bottom-0 h-1.5 cursor-ns-resize touch-none hover:bg-accent/30"
          />

          {/* Bottom-right corner resize handle */}
          <div
            role="separator"
            aria-label="Resize terminal"
            onPointerDown={onResizeDown("xy")}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            className="absolute bottom-0 right-0 flex size-4 cursor-nwse-resize touch-none items-end justify-end p-0.5 text-muted/70 hover:text-accent"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M9 1L1 9M9 5L5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>,
      )}
    </section>
  );
}
