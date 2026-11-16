import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PartyPopper, X } from "lucide-react";

interface UnlockCelebrationProps {
  title: string;
  subtitle?: string;
  actionPath?: string | null;
  actionLabel?: string;
  onDismiss: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
  alpha: number;
}

const COLORS = [
  "#58a6ff",
  "#3fb950",
  "#d29922",
  "#f778ba",
  "#a371f7",
  "#79c0ff",
];

export function UnlockCelebration({
  title,
  subtitle = "You unlocked a new step on your learning path!",
  actionPath = null,
  actionLabel = "Go now",
  onDismiss,
}: UnlockCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const spawnBurst = (originX: number, originY: number, dir: number) => {
      for (let i = 0; i < 45; i++) {
        const angle = -Math.PI / 2 + dir * (0.2 + Math.random() * 0.75);
        const speed = 7 + Math.random() * 10;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 3,
          size: 5 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.25,
          alpha: 1,
        });
      }
    };

    // Spray from bottom-left and bottom-right like party poppers
    spawnBurst(canvas.width * 0.18, canvas.height * 0.92, 1);
    spawnBurst(canvas.width * 0.82, canvas.height * 0.92, -1);

    let frameId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.vx *= 0.99;
        p.rotation += p.vr;
        p.alpha -= 0.008;

        if (p.alpha <= 0 || p.y > canvas.height + 24) continue;
        alive++;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
        ctx.restore();
      }

      if (alive > 0) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50"
      />
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-surface/95 px-4 py-3.5 shadow-2xl backdrop-blur-sm animate-fade-in"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-success">
            <PartyPopper className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {title}
            </p>
            <p className="truncate text-xs text-muted">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {actionPath && (
            <Link
              to={actionPath}
              onClick={onDismiss}
              className="inline-flex items-center gap-1 rounded-lg bg-[#238636] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2ea043]"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          )}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss celebration"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-hover hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}
