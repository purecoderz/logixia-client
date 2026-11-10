import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../../components/ui/ErrorState";
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { Code2, MessageCircle, Users } from "lucide-react";
import { CohortService, type CohortStatus } from "../Services/cohortService";

import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { SearchBar } from "../../../components/ui/SearchBar";
import { FilterTabs } from "../../../components/ui/FilterTabs";
import { CohortCard } from "../components/students/CohortCard";

type Filter = "all" | CohortStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "starting-soon", label: "Starting soon" },
  { value: "in-progress", label: "In progress" },
];

export function CohortsRegistrationPage() {
  const { pathname } = useLocation();
  const detailsBasePath = pathname.startsWith("/register/")
    ? "/student/cohort"
    : "/cohort";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const {
    data: cohorts = [],
    isPending: isLoading,
    error: errMessage,
    refetch,
  } = useQuery({
    queryKey: ["cohorts", "public"],
    queryFn: () => CohortService.getCohorts(),
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return cohorts.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (!q || `${c.name} ${c.subtitle}`.toLowerCase().includes(q)),
    );
  }, [query, filter, cohorts]);

  return (
    <div className="space-y-0">
      <section className="grid items-center gap-8 pb-10 lg:grid-cols-[1fr_auto] lg:pb-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">
            LEARN WITH A GROUP
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Your next chapter.
            <br />
            <span className="text-cyan-500">Better together.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            Find your cohort and build your skills with an instructor, practical
            exercises, and people learning alongside you.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-body lg:flex-col lg:border-l lg:border-line lg:pl-10">
          {[
            { icon: Users, text: "Learn alongside others" },
            { icon: Code2, text: "Practise with real code" },
            { icon: MessageCircle, text: "Get instructor feedback" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-3">
              <Icon size={19} className="text-cyan-500" />
              {text}
            </span>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="available-cohorts"
        className="border-t border-line pt-8"
      >
        <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2
              id="available-cohorts"
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              Explore cohorts
            </h2>
            <p className="mt-2 text-sm text-muted">
              Find a group that fits your next step.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search cohorts"
            />
          </div>
        </div>
        <div className="mb-6">
          <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        {errMessage && (
          <ErrorState
            what="cohorts"
            error={errMessage}
            onRetry={() => void refetch()}
            variant="section"
          />
        )}

        {isLoading ? (
          <CardGridSkeleton label="Loading cohorts" />
        ) : errMessage ? null : visible.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {visible.map((c) => (
              <CohortCard
                key={c.id}
                cohort={c}
                detailsBasePath={detailsBasePath}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line py-14 text-center">
            <Users size={28} className="mx-auto text-muted" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {query || filter !== "all"
                ? "No matching cohorts"
                : "New cohorts are on the way"}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {query || filter !== "all"
                ? "Try another search or choose a different filter."
                : "Check back soon to find your next learning group."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export { CohortsRegistrationPage as CohortsPage };

