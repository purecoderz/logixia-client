import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { BookOpen, Clock3, X } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/Markdown";
import { ErrorState } from "@/components/ui/ErrorState";
import { InstructorSessionService, sessionKeys } from "../services/instructorSessionService";
import { safeRecordingUrl, type SessionDetail } from "../types/session";

export function SessionMaterials({ session, open, onClose }: { session:SessionDetail;open:boolean;onClose:()=>void }) {
  const data=session;
  const recording=safeRecordingUrl(data?.recording_url ?? null);
  return <MaterialsDrawer open={open} onClose={onClose} title={data.title}>
          <p className="text-xs text-muted">{data.cohort_name} · {data.module_title}</p>
          {data.lesson && <section><h2 className="mb-4 font-semibold text-foreground">{data.lesson.title}</h2>{data.lesson.content.trim() ? <MarkdownRenderer content={data.lesson.content} /> : <p className="text-sm text-muted">This lesson has no published teaching content yet.</p>}</section>}
          {data.notes?.trim() && <section><h2 className="mb-4 font-semibold text-foreground">{data.lesson ? "Additional teaching notes" : "Teaching notes"}</h2><MarkdownRenderer content={data.notes} /></section>}
          {!data.lesson && !data.notes?.trim() && <p className="text-sm text-muted">No teaching materials have been added.</p>}
          {recording && <a href={recording} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg border border-line px-4 py-2 text-sm font-semibold text-accent hover:bg-hover">Open recording ↗</a>}
          {data.instructor_codes && Object.keys(data.instructor_codes).length>0 && <section className="space-y-3"><h2 className="font-semibold text-foreground">Instructor code</h2>{Object.entries(data.instructor_codes).map(([path,code])=><details key={path} className="rounded-lg border border-line bg-input"><summary className="cursor-pointer px-4 py-3 text-xs font-medium">{path}</summary><pre className="overflow-x-auto border-t border-line p-4 text-xs leading-6">{code}</pre></details>)}</section>}
  </MaterialsDrawer>;
}

export function SessionMaterialsButton({sessionId}:{sessionId:number}) {
  const [open,setOpen]=useState(false);
  const query=useSessionDetail(sessionId);
  return <><button type="button" onClick={()=>setOpen(true)} aria-label="Open teaching materials" className="flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm text-body hover:bg-hover"><BookOpen size={17}/><span className="hidden md:inline">Materials</span></button>{query.data ? <SessionMaterials session={query.data} open={open} onClose={()=>setOpen(false)}/> : <MaterialsDrawer open={open} onClose={()=>setOpen(false)} title="Session materials">{query.error ? <ErrorState what="session materials" error={query.error} onRetry={()=>void query.refetch()} variant="section"/> : <p role="status">Loading teaching materials…</p>}</MaterialsDrawer>}</>;
}

export function SessionRoomTitle({ sessionId }: { sessionId:number }) {
  const query=useSessionDetail(sessionId);
  return <>{query.data?.title ?? "Live classroom"}</>;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

export function SessionElapsedTimer({ sessionId }: { sessionId: number }) {
  const query = useSessionDetail(sessionId);
  const fallbackStart = useRef(Date.now());
  const startedMs = query.data?.started_at ? Date.parse(query.data.started_at) : NaN;
  const origin = Number.isFinite(startedMs) ? startedMs : fallbackStart.current;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      aria-label="Session elapsed time"
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line bg-input px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-body"
    >
      <Clock3 size={12} className="text-muted" aria-hidden />
      {formatElapsed(now - origin)}
    </span>
  );
}

function useSessionDetail(sessionId:number) {
  return useQuery({queryKey:sessionKeys.detail(sessionId),queryFn:()=>InstructorSessionService.get(sessionId),enabled:Number.isSafeInteger(sessionId)&&sessionId>0,staleTime:5*60*1000});
}

/** Shared reading panel for loaded materials and the live room's loading/error states. */
function MaterialsDrawer({ open, onClose, title, children }: { open:boolean; onClose:()=>void; title:string; children:ReactNode }) {
  return <Transition appear show={open}><Dialog onClose={onClose} className="relative z-[80]">
    <DialogBackdrop transition className="fixed inset-0 bg-black/55 transition-opacity duration-400 ease-in-out data-closed:opacity-0 motion-reduce:transition-none"/>
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <DialogPanel data-learning-shell-overlay transition className="flex h-full w-screen max-w-3xl flex-col border-l border-line bg-surface text-body shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] data-leave:ease-in-out data-closed:translate-x-full motion-reduce:transition-none">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5 sm:px-8">
            <div className="min-w-0"><p className="mb-1 text-xs font-medium text-muted">Session materials</p><DialogTitle className="break-words text-lg font-semibold text-foreground">{title}</DialogTitle></div>
            <button type="button" aria-label="Close session materials" onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-hover"><X size={20}/></button>
          </header>
          <div className="min-h-0 min-w-0 flex-1 space-y-7 overflow-y-auto overscroll-contain break-words p-5 sm:p-8">{children}</div>
        </DialogPanel>
      </div>
    </div>
  </Dialog></Transition>;
}
