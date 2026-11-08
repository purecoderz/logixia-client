import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../../components/ui/ErrorState";
// pages/Sessions/LiveSessionsPage.tsx
import { useMemo, useState } from "react";
import { Radio, CalendarClock, Video } from "lucide-react";

import { SearchBar } from "../../../components/ui/SearchBar";
import { GlobalHero } from "../../cohorts/components/students/CohortsHero";
import { SessionService } from "../services/liveSessionServices";
import { LiveSessionsView } from "../components/session/LiveSessionsView";

const hero = {
  eyebrow: "Live sessions",
  title: "Learn together, in real time",
  description:
    "See what's happening now and what's coming up next for your cohorts.",
  facts: [
    { icon: Radio, label: "See what's live right now" },
    { icon: CalendarClock, label: "Know what's coming up" },
    { icon: Video, label: "One click to join" },
  ],
};

export function LiveSessionsPage() {
  const [query, setQuery] = useState("");

  const {
    data: sessions = [],
    isPending: isLoading,
    error: errMessage,
    refetch,
  } = useQuery({
    queryKey: ["live-sessions", "student"],
    queryFn: SessionService.getSessions,
  });

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter((s) =>
      `${s.title} ${s.cohort_name} ${s.instructor}`.toLowerCase().includes(q),
    );
  }, [query, sessions]);

  return (
    <div className="space-y-4">
      {errMessage && (
        <ErrorState
          what="live sessions"
          error={errMessage}
          onRetry={() => void refetch()}
          variant="section"
        />
      )}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search sessions"
      />
      <GlobalHero {...hero} />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">
          Loading sessions...
        </p>
      ) : (
        !errMessage && <LiveSessionsView sessions={matches} />
      )}
    </div>
  );
}
