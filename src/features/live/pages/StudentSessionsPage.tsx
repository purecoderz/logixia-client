import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { useActiveCohort } from "@/features/cohorts/hooks/useActiveCohort";
import { ActiveCohortRequired } from "@/features/cohorts/components/students/ActiveCohortRequired";
import { StudentSessionService, studentSessionKeys } from "../services/studentSessionService";
import { SessionMaterials } from "../components/SessionMaterials";
import { SessionScheduleCard } from "../components/session/SessionScheduleCard";
import { FeaturedSession } from "../components/session/FeaturedSession";
import { safeRecordingUrl, type SessionDetail } from "../types/session";

export function StudentSessionsPage() {
  const cohort = useActiveCohort();
  if (cohort.isPending) return <ListPageSkeleton label="Loading your cohorts"/>;
  if (cohort.error) return <ErrorState what="your cohorts" error={cohort.error} onRetry={()=>void cohort.refetch()}/>;
  if (!cohort.activeCohort) return <ActiveCohortRequired cohorts={cohort.cohorts} onSelect={cohort.selectCohort}/>;
  return <StudentSchedule key={cohort.activeCohort.id} cohortId={cohort.activeCohort.id} cohortName={cohort.activeCohort.name}/>;
}

function StudentSchedule({ cohortId, cohortName }: { cohortId: number; cohortName: string }) {
  const query = useQuery({ queryKey: studentSessionKeys.list(cohortId), queryFn: ()=>StudentSessionService.list(cohortId), refetchInterval: 60_000 });
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState<SessionDetail | null>(null);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  function showMaterials(session: SessionDetail) { setMaterials(session); setMaterialsOpen(true); }
  const sessions = query.data ?? [];
  const upcoming = sessions.filter(session=>session.status === "scheduled").sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const past = sessions.filter(session=>session.status === "ended").sort((a,b)=>Date.parse(b.starts_at)-Date.parse(a.starts_at));
  const live = sessions.filter(session=>session.status === "live");
  const featured = live.length ? live : upcoming.slice(0,1);
  const visible = (tab === "upcoming" ? upcoming : past).filter(session=>`${session.title} ${session.module_title} ${session.lesson_title ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  const groups = new Map<number, { title: string; sessions: SessionDetail[] }>();
  for (const session of visible) {
    if (!groups.has(session.module_id)) groups.set(session.module_id, {title: session.module_title, sessions: []});
    groups.get(session.module_id)!.sessions.push(session);
  }
  return <div className="min-w-0 space-y-6">
    <header><p className="mb-2 break-words text-xs font-medium text-accent">{cohortName}</p><h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Your classes</h1><p className="mt-2 text-sm text-muted">Join live classes and revisit what you have learned.</p></header>
    {query.isPending ? <ListPageSkeleton label="Loading your classes"/> : query.error ? <ErrorState what="your sessions" error={query.error} onRetry={()=>void query.refetch()}/> : <>
      {featured.map(session=><FeaturedSession key={session.id} session={session} onMaterials={()=>showMaterials(session)}/>)}
      {!featured.length && <p className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">No upcoming class yet. Your instructor’s next scheduled class will appear here.</p>}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex border-b border-line">{(["upcoming", "past"] as const).map(value=><button key={value} type="button" aria-pressed={tab === value} onClick={()=>setTab(value)} className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${tab === value ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}>{value === "upcoming" ? "Upcoming" : "Past"} ({value === "upcoming" ? upcoming.length : past.length})</button>)}</div>
        <div className="w-full sm:max-w-xs"><SearchBar value={search} onChange={setSearch} placeholder="Search sessions"/></div>
      </div>
      {[...groups.entries()].map(([id, group])=><section key={id} className="min-w-0 space-y-3"><h2 className="break-words text-base font-semibold text-foreground">{group.title}</h2>{group.sessions.map(session=>{
        const recording = session.status === "ended" ? safeRecordingUrl(session.recording_url) : null;
        return <SessionScheduleCard key={session.id} session={session}><Button variant="ghost" onClick={()=>showMaterials(session)}>View materials</Button>{recording && <a href={`/sessions/${session.id}/watch?cohort=${session.cohort_id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">Watch recording →</a>}</SessionScheduleCard>;
      })}</section>)}
      {!visible.length && <div className="rounded-xl border border-dashed border-line px-5 py-10 text-center"><CalendarDays size={26} className="mx-auto text-muted"/><h2 className="mt-3 text-sm font-semibold text-foreground">{search ? "No matching sessions" : tab === "past" ? "No past classes yet" : "No upcoming classes"}</h2><p className="mt-2 text-sm text-muted">{search ? "Try another session, module or lesson name." : tab === "past" ? "Completed classes and their available recordings will appear here." : "Check back when your instructor schedules a class."}</p></div>}
      <p className="text-xs text-muted">All times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p>
    </>}
    {materials && <SessionMaterials session={materials} open={materialsOpen} onClose={()=>setMaterialsOpen(false)}/>}
  </div>;
}
