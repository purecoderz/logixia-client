import { useEffect, useRef, useState, type ReactNode } from "react";

export type TokenKind = "kw" | "fn" | "str" | "num" | "com" | "var" | "txt";
export type CodeToken = [TokenKind, string];
export type CodeLineTokens = CodeToken[];

export function CodeTokens({ line }: { line: CodeLineTokens }) {
  return (
    <>
      {line.map(([kind, text], i) => (
        <span key={i} className={`hl-${kind}`}>
          {text}
        </span>
      ))}
    </>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logixialogo.webp"
        alt="Logixia"
        className="size-8 shrink-0 object-contain"
      />
      <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-foreground">
        Logixia <span className="text-muted">Academy</span>
      </span>
    </span>
  );
}

/** Fades content in once it scrolls into view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`home-reveal ${shown ? "home-reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
      <span aria-hidden="true" className="h-px w-6 bg-accent" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">{description}</p>
      )}
    </div>
  );
}

/** Editor-style window chrome used by every product preview. */
export function WindowFrame({
  title,
  right,
  children,
  className = "",
}: {
  title: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`home-window-shadow overflow-hidden rounded-xl border border-line bg-surface ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-line bg-surface-muted/60 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-danger/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </span>
        <div className="min-w-0 flex-1 truncate font-mono text-xs text-muted">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent",
} as const;
