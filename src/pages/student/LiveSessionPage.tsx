// pages/Sessions/LiveSessionsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Radio, CalendarClock, Video } from "lucide-react";


import { SearchBar } from "../../components/Cohorts/SearchBar";
import { GlobalHero } from "../../components/Cohorts/CohortsHero";
import { SessionService, type Session } from "../../services/liveSessionServices";
import { LiveSessionsView } from "../../components/liveSession/LiveSessionsView";

const hero = {
  eyebrow: "Live sessions",
  title: "Learn together, in real time",
  description: "See what's happening now and what's coming up next for your cohorts.",
  facts: [
    { icon: Radio, label: "See what's live right now" },
    { icon: CalendarClock, label: "Know what's coming up" },
    { icon: Video, label: "One click to join" },
  ],
};

export function LiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchSessions = async () => {
      setErrMessage(null);
      try {
        const response = await SessionService.getSessions();
        if (!ignore) setSessions(response);
      } catch (err) {
        if (!ignore) {
          setErrMessage(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchSessions();
    return () => {
      ignore = true;
    };
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter((s) =>
      `${s.title} ${s.cohort_name} ${s.instructor}`.toLowerCase().includes(q)
    );
  }, [query, sessions]);

  return (
    <div className="space-y-4">
      {errMessage && <p className="text-red-500">{errMessage}</p>}
      <SearchBar value={query} onChange={setQuery} placeholder="Search sessions" />
      <GlobalHero {...hero} />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-[#8b949e]">Loading sessions...</p>
      ) : (
        !errMessage && <LiveSessionsView sessions={matches} />
      )}
    </div>
  );
}