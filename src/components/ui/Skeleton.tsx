export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-[#21262d] motion-reduce:animate-none ${className}`}
    />
  );
}