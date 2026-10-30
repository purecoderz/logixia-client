// components/Dashboard/DashboardSkeleton.tsx
import type { ReactNode } from "react";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#21262d] ${className}`} />;
}

function SkeletonCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#30363d] bg-[#161b22] p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <Bone className="h-4 w-24" />
        <Bone className="h-3 w-12" />
      </div>
      {children}
    </div>
  );
}

function RowBone() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#0d1117] p-3">
      <Bone className="size-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-3.5 w-2/3" />
        <Bone className="h-3 w-1/2" />
      </div>
      <Bone className="h-5 w-14" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1500px] p-4 md:p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {/* hero */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 md:p-8">
            <Bone className="h-8 w-56" />
            <Bone className="mt-4 h-4 w-full max-w-md" />
            <Bone className="mt-2 h-4 w-2/3 max-w-sm" />
            <Bone className="mt-5 h-9 w-28" />
          </div>

          {/* performance + progress */}
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <SkeletonCard>
              <Bone className="mb-4 h-9 w-24" />
              <div className="flex h-36 items-end justify-between gap-3">
                {[60, 85, 45, 100, 70, 55].map((h, i) => (
                  <Bone key={i} className="flex-1" style-height={h} />
                ))}
              </div>
            </SkeletonCard>

            <SkeletonCard>
              <div className="grid grid-cols-2 place-items-center gap-x-4 gap-y-5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Bone className="size-[76px] !rounded-full" />
                    <Bone className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>

          {/* due soon */}
          <SkeletonCard>
            <div className="grid gap-2 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <RowBone key={i} />
              ))}
            </div>
          </SkeletonCard>
        </div>

        <aside className="min-w-0 space-y-6">
          <SkeletonCard>
            <div className="space-y-2">
              <RowBone />
              <RowBone />
            </div>
          </SkeletonCard>
          <SkeletonCard>
            <div className="space-y-2">
              <RowBone />
              <RowBone />
              <RowBone />
            </div>
          </SkeletonCard>
        </aside>
      </div>
    </div>
  );
}