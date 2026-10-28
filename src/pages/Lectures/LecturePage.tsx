import { useEffect, useMemo, useState } from "react";
import { Clock, Code, PlayCircle } from "lucide-react";
import { SearchBar } from "../../components/Cohorts/SearchBar";
import { GlobalHero } from "../../components/Cohorts/CohortsHero";
import { FilterTabs } from "../../components/Cohorts/FilterTabs";
import { TutorialService, type Tutorial, type TutorialLevel } from "../../services/LecturesService";
import { LectureCard} from "../../components/Lecture/LectureCard";


type Filter = "all" | TutorialLevel;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const hero = {
  eyebrow: "Lectures",
  title: "Learn by doing",
  description: "Pick a tutorial, work through short interactive lessons at your own pace, and build as you go.",
  facts: [
    { icon: PlayCircle, label: "Interactive lessons" },
    { icon: Clock, label: "Self-paced" },
    { icon: Code, label: "Hands-on coding" },
  ],
};

export function LecturePage() {
  const [lectures, setLectures] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let ignore = false;

    const fetchLectures = async () => {
      setErrMessage(null);
      try {
        const response = await TutorialService.fakegetTutorials();
        if (!ignore) setLectures(response);
      } catch (err) {
        if (!ignore) {
          setErrMessage(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchLectures();
    return () => {
      ignore = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return lectures.filter(
      (t) =>
        (filter === "all" || t.level === filter) &&
        (!q || `${t.name} ${t.subtitle}`.toLowerCase().includes(q))
    );
  }, [query, filter, lectures]);

  return (
    <div className="space-y-4">
      {errMessage && <p className="text-red-500">{errMessage}</p>}
      <SearchBar value={query} onChange={setQuery} placeholder="Search lectures" />
      <GlobalHero {...hero} />
      <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-[#8b949e]">Loading lectures...</p>
      ) : visible.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <LectureCard key={t.id} tutorial={t} />
          ))}
        </div>
      ) : (
        !errMessage && (
          <p className="py-10 text-center text-sm text-[#8b949e]">No lectures match your search.</p>
        )
      )}
    </div>
  );
}