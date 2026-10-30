import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Video } from "lucide-react";
import { SearchBar } from "../../components/Cohorts/SearchBar";
import { GlobalHero as CohortsHero } from "../../components/Cohorts/CohortsHero";
import { FilterTabs } from "../../components/Cohorts/FilterTabs";
import { CohortCard, type Cohort, type CohortStatus } from "../../components/Cohorts/CohortCard";
import { HostCohortBanner } from "../../components/Cohorts/HostCohortBanner";
import { CohortService } from "../../features/cohorts/Services/cohortService";
import { CardGridSkeleton } from "../../components/ui/CardGridSkeleton";

type Filter = "all" | CohortStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "starting-soon", label: "Starting soon" },
  { value: "in-progress", label: "In progress" },
];

const hero = {
  eyebrow: "Cohorts",
  title: "Learn live, together",
  description: "Join a small group, learn with an instructor every week, and get feedback on your work.",
  facts: [
    { icon: Calendar, label: "12 weeks" },
    { icon: Users, label: "20 seats per cohort" },
    { icon: Video, label: "Weekly live classes" },
  ],
};



export function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errMessage, setErrMessage] = useState<string | null>(null)
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setErrMessage(null)
    const fetchCohorts = async () => {
      try {
        const response = await CohortService.getCohorts()
        setCohorts(response)
      } catch (err) {
        setErrMessage(err instanceof Error ? err.message : "somwthing went wrong")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCohorts()
  }, [])


  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return cohorts.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (!q || `${c.name} ${c.subtitle}`.toLowerCase().includes(q))
    );
  }, [query, filter, cohorts]);

  isLoading && (
    <CardGridSkeleton label="Loading assignments" />
  )



  return (
    <div className="space-y-4">
      {errMessage && (
        <p className="text-red-500">{errMessage}</p>
      )}
      <SearchBar value={query} onChange={setQuery} placeholder="Search cohorts" />
      <CohortsHero {...hero} />
      <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />

      {isLoading ? (
        <CardGridSkeleton label="Loading cohorts" />
      ) : visible.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <CohortCard key={c.id} cohort={c} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-[#8b949e]">
          No cohorts match your search.
        </p>
      )}

      <HostCohortBanner />
    </div>
  );
}