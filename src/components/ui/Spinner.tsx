interface SpinnerProps {
  size?: number;
  /** "dark" for use on a bright (primary) button. */
  tone?: "light" | "dark";
}

export function Spinner({ size = 16, tone = "light" }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 rounded-full border-2 motion-safe:animate-spin ${
        tone === "dark"
          ? "border-on-accent/25 border-t-on-accent"
          : "border-line-strong border-t-accent"
      }`}
    />
  );
}
