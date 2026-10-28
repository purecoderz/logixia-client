// components/ui/CardGridSkeleton.tsx
import { Skeleton } from "./Skeleton";

interface CardGridSkeletonProps {
  count?: number;          // how many placeholder cards
  filters?: boolean;       // show the chip row + view toggle
  chips?: number;          // how many chips in that row
  progress?: boolean;      // show the progress bar line
  label?: string;          // screen reader text
  className?: string;      // grid classes, to match each page's real grid
}

function CardSkeleton({ progress }: { progress: boolean }) {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="mt-4 h-5 w-3/5" />
      {progress && <Skeleton className="mt-8 h-1.5 w-full rounded-full" />}
      <div className={`${progress ? "mt-4" : "mt-8"} flex items-center justify-between`}>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 3,
  filters = true,
  chips = 4,
  progress = true,
  label = "Loading",
  className = "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
}: CardGridSkeletonProps) {
  return (
    <div role="status" aria-label={label}>
      {filters && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            {Array.from({ length: chips }, (_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-7 w-[74px]" />
        </div>
      )}

      <div className={className}>
        {Array.from({ length: count }, (_, i) => (
          <CardSkeleton key={i} progress={progress} />
        ))}
      </div>

      <span className="sr-only">{label}…</span>
    </div>
  );
}