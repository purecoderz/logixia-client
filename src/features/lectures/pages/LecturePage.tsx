import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../../components/ui/ErrorState";
import { useMemo, useState } from "react";
import { Clock, Code, PlayCircle } from "lucide-react";
import { SearchBar } from "../../../components/ui/SearchBar";
import { CardGridSkeleton } from "../../../components/ui/CardGridSkeleton";
import { FilterTabs } from "../../../components/ui/FilterTabs";
import {
  TutorialService,
  type TutorialLevel,
} from "../../../pages/Lectures/LecturesService";
import { LectureCard } from "../components/LectureCard";

type Filter = "all" | TutorialLevel;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function LecturePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const {
    data: lectures = [],
    isPending: isLoading,
    error: errMessage,
    refetch,
  } = useQuery({
    queryKey: ["courses", "public"],
    queryFn: TutorialService.fakegetTutorials,
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return lectures.filter(
      (t) =>
        (filter === "all" || t.level === filter) &&
        (!q || `${t.name} ${t.subtitle}`.toLowerCase().includes(q)),
    );
  }, [query, filter, lectures]);

  return (
    <div>
      <section className="grid items-center gap-8 pb-10 lg:grid-cols-[1fr_auto] lg:pb-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">
            LEARN AT YOUR OWN PACE
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Small lessons.
            <br />
            <span className="text-cyan-500">Real progress.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            Find your starting point and build your skills, one practical lesson
            at a time. Make room for learning on your schedule.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-body lg:flex-col lg:border-l lg:border-line lg:pl-10">
          {[
            { icon: PlayCircle, text: "Interactive lessons" },
            { icon: Clock, text: "Your pace, your schedule" },
            { icon: Code, text: "Hands-on coding" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-3">
              <Icon size={19} className="text-cyan-500" />
              {text}
            </span>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="explore-courses"
        className="border-t border-line pt-8"
      >
        <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2
              id="explore-courses"
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              Explore courses
            </h2>
            <p className="mt-2 text-sm text-muted">
              Start with the basics or take your skills further.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search courses"
            />
          </div>
        </div>
        <div className="mb-6">
          <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        {errMessage && (
          <ErrorState
            what="courses"
            error={errMessage}
            onRetry={() => void refetch()}
            variant="section"
          />
        )}

        {isLoading ? (
          <CardGridSkeleton label="Loading courses" />
        ) : errMessage ? null : visible.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((t) => (
              <LectureCard key={t.id} tutorial={t} />
            ))}
          </div>
        ) : (
          !errMessage && (
            <div className="rounded-xl border border-dashed border-line py-14 text-center">
              <Code size={28} className="mx-auto text-muted" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                {query || filter !== "all"
                  ? "No matching courses"
                  : "New courses are on the way"}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {query || filter !== "all"
                  ? "Try another search or choose a different level."
                  : "Check back soon for something new to learn."}
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
