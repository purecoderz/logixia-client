import { Link } from "react-router-dom";
import { ChevronRight, Clock, Code2 } from "lucide-react";

import { DashboardCard, EmptyState, SeeAllLink } from "./DashboardCard";
import type { Assignment } from "@/features/assignments/services/assignmentService";
import { dueText } from "@/features/assignments/utils/assignments";


function DueRow({ a }: { a: Assignment }) {
  return (
    <Link
      to={`/assignments/${a.id}`}
      className="group flex items-center gap-3 rounded-xl bg-[#0d1117] p-3 transition-colors hover:bg-[#21262d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1f6feb]/15 text-[#58a6ff]">
        <Code2 className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{a.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#8b949e]">
          <Clock className="size-3" aria-hidden />
          {dueText(a)}
          <span aria-hidden>·</span>
          {a.status === null ? "Not started" : "In progress"}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-[#d29922]/15 px-2 py-0.5 text-[11px] font-semibold text-[#d29922]">
        +{a.xp} XP
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-[#8b949e] transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

interface DueSoonCardProps {
  assignments: Assignment[];
  isLoading: boolean;
  error: Error | null;
}

export function DueSoonCard({ assignments, isLoading, error }: DueSoonCardProps) {
  return (
    <DashboardCard title="Due soon" action={<SeeAllLink />}>
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#0d1117]" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error.message}</p>
      ) : assignments.length === 0 ? (
        <EmptyState>Nothing due right now.</EmptyState>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {assignments.map((a) => (
            <DueRow key={a.id} a={a} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}