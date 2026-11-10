import { useEffect, useState } from "react";
import { ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { sessionRoomPath, type SessionDetail } from "../../types/session";

function StartedAt({ value }: { value: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const date = new Date(value);
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  return <time dateTime={value} title={date.toLocaleString()}>{minutes < 1 ? "Just started" : `Started ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`}</time>;
}

export function FeaturedSession({ session, onMaterials }: { session: SessionDetail; onMaterials: () => void }) {
  const live = session.status === "live";
  return (
    <section className={`min-w-0 rounded-2xl border p-5 sm:p-6 ${live ? "border-emerald-500/40 bg-emerald-500/5" : "border-accent/25 bg-accent/5"}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className={`flex items-center gap-2 text-xs font-bold tracking-wider ${live ? "text-success" : "text-accent"}`}><Radio size={16}/>{live ? "LIVE NOW" : "NEXT CLASS"}</p>
          <h2 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{session.title}</h2>
          <p className="break-words text-sm text-muted">{session.module_title}{session.lesson_title ? ` · ${session.lesson_title}` : " · Teaching notes"}</p>
          <p className="text-sm text-muted">{live ? (session.started_at ? <StartedAt value={session.started_at}/> : "Your instructor has started the class") : <time dateTime={session.starts_at}>{new Date(session.starts_at).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</time>}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:flex-col lg:items-stretch">
          {live && <ButtonLink to={sessionRoomPath(session.id)}>Join class <ArrowRight size={16}/></ButtonLink>}
          <Button variant="ghost" onClick={onMaterials}>View materials</Button>
        </div>
      </div>
    </section>
  );
}
