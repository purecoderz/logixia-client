import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Radio } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SearchBar } from "@/components/ui/SearchBar";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { ActionNotice, type Notice } from "@/features/courses/components/instructor/ActionNotice";
import { useInstructorCohorts } from "@/features/cohorts/hooks/useCohorts";
import type { InstructorCohort } from "@/features/cohorts/types/types";
import { InstructorSessionService, sessionKeys } from "../services/instructorSessionService";
import { sessionRoomPath, type CohortSession, type SessionDetail, type SessionInput, type SessionStatus } from "../types/session";
import { SessionScheduleDrawer } from "../components/instructor/SessionScheduleDrawer";
import { SessionScheduleCard } from "../components/session/SessionScheduleCard";
import { SessionMaterials } from "../components/SessionMaterials";

const views:{value:SessionStatus;label:string}[]=[{value:"scheduled",label:"Upcoming"},{value:"live",label:"Live"},{value:"ended",label:"Past"},{value:"cancelled",label:"Cancelled"}];
export default function InstructorSessionsPage(){
  const cohorts=useInstructorCohorts();
  const [params,setParams]=useSearchParams();
  if(cohorts.isPending)return <ListPageSkeleton label="Loading your cohorts"/>;
  if(cohorts.error)return <ErrorState what="your cohorts" error={cohorts.error} onRetry={()=>void cohorts.refetch()}/>;
  const selected=params.get("cohort") ?? "";
  const valid=cohorts.data.some(item=>item.id===selected);
  return <div className="min-w-0 space-y-6">
    <header><h1 className="text-2xl font-semibold tracking-tight text-foreground">Sessions</h1><p className="mt-2 text-sm text-muted">Plan your classes and keep your cohorts on track.</p></header>
    {!cohorts.data.length ? <div className="space-y-4 rounded-xl border border-line bg-surface p-6"><p className="text-sm text-muted">Create a cohort before scheduling your first session.</p><ButtonLink to="/instructor/cohorts/new">Create cohort</ButtonLink></div> : <>
      <div className="w-full min-w-0 max-w-md"><label htmlFor="sessions-cohort" className="mb-2 block text-sm font-medium text-foreground">Cohort</label><Select id="sessions-cohort" searchable value={valid?selected:""} placeholder="Select a cohort" onChange={value=>setParams({cohort:value})} options={cohorts.data.map(item=>({value:item.id,label:item.name,description:item.course}))}/></div>
      {valid ? <SessionList key={selected} cohorts={cohorts.data} cohortId={selected}/> : <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center"><CalendarDays size={28} className="mx-auto text-muted"/><h2 className="mt-4 font-semibold text-foreground">Choose a cohort to view its sessions</h2><p className="mt-2 text-sm text-muted">Select a cohort above to view its schedule or plan a class.</p></div>}
    </>}
  </div>;
}
function SessionList({cohorts,cohortId}:{cohorts:InstructorCohort[];cohortId:string}){
  const query=useQuery({queryKey:sessionKeys.list(cohortId),queryFn:()=>InstructorSessionService.list(cohortId)});
  const client=useQueryClient(); const navigate=useNavigate();
  const [params,setParams]=useSearchParams();
  const status=views.some(view=>view.value===params.get("status"))?params.get("status") as SessionStatus:"scheduled";
  const [search,setSearch]=useState("");
  const [drawer,setDrawer]=useState<"new"|CohortSession|null>(null);
  const [materials,setMaterials]=useState<SessionDetail|null>(null);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  function showMaterials(session: SessionDetail) { setMaterials(session); setMaterialsOpen(true); }
  const [confirm,setConfirm]=useState<{action:"start"|"cancel";session:CohortSession}|null>(null);
  const [busy,setBusy]=useState(false);const running=useRef(false);
  const [notice,setNotice]=useState<Notice|null>(null);const dismiss=useCallback(()=>setNotice(null),[]);
  const rows=query.data??[];
  const visible=rows.filter(item=>item.status===status && `${item.title} ${item.module_title} ${item.lesson_title??""} ${item.cohort_name}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>status==="ended"?new Date(b.starts_at).getTime()-new Date(a.starts_at).getTime():new Date(a.starts_at).getTime()-new Date(b.starts_at).getTime());
  const groups=new Map<string,{title:string;rows:SessionDetail[]}>();
  for(const item of visible){const key=`${item.cohort_id}:${item.module_id}`;if(!groups.has(key))groups.set(key,{title:item.module_title,rows:[]});groups.get(key)!.rows.push(item);}
  const live=rows.filter(item=>item.status==="live");
  async function refresh(){await Promise.all([client.invalidateQueries({queryKey:sessionKeys.instructor}),client.invalidateQueries({queryKey:["live-sessions"]}),client.invalidateQueries({queryKey:["sessions","detail"]})]);}
  async function save(id:string,input:SessionInput){if(drawer && drawer!=="new")await InstructorSessionService.update(drawer.id,input);else await InstructorSessionService.create(id,input);await refresh();setNotice({kind:"success",message:drawer==="new"?"Session scheduled.":"Session updated."});}
  async function confirmAction(){if(!confirm||running.current)return;const {action,session}=confirm;running.current=true;setBusy(true);setNotice(null);try{if(action==="start")await InstructorSessionService.start(session.id);else await InstructorSessionService.cancel(session.id);await refresh();setConfirm(null);if(action==="start")navigate(sessionRoomPath(session.id));else setNotice({kind:"success",message:"Session cancelled."});}catch(error){setNotice({kind:"error",message:error instanceof ApiError && error.status===409?error.message:friendlyMessage(error,`Couldn’t ${action} the session. Please try again.`)});setConfirm(null);}finally{running.current=false;setBusy(false);}}
  return <div className="min-w-0 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted">{cohorts.find(item=>item.id===cohortId)?.course}</p><Button disabled={busy} onClick={()=>setDrawer("new")}><Plus size={16}/>Schedule session</Button></div>
    <ActionNotice notice={notice} onDismiss={dismiss}/>
    {query.isPending?<ListPageSkeleton label="Loading sessions"/>:query.error?<ErrorState what="your sessions" error={query.error} onRetry={()=>void query.refetch()}/>:<>
      <div className="flex flex-wrap border-b border-line">{views.map(view=><button key={view.value} type="button" aria-pressed={view.value===status} onClick={()=>setParams(previous=>{const next=new URLSearchParams(previous);next.set("status",view.value);return next;},{replace:true})} className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold ${view.value===status?"border-accent text-accent":"border-transparent text-muted hover:text-foreground"}`}>{view.label}<span className="rounded-full bg-hover px-2 py-0.5 text-[10px]">{rows.filter(item=>item.status===view.value).length}</span></button>)}</div>
      <div className="w-full min-w-0 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search sessions, modules or lessons"/></div>
      {status!=="live" && live.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"><div className="flex min-w-0 items-center gap-3"><Radio size={20} className="text-success"/><div className="min-w-0"><span className="text-[10px] font-bold tracking-wider text-success">LIVE NOW</span><h2 className="break-words text-sm font-semibold text-foreground">{item.title}</h2><p className="mt-1 text-xs text-muted">{item.cohort_name}</p></div></div><ButtonLink to={sessionRoomPath(item.id)}>Join room →</ButtonLink></div>)}
      {visible.length ? [...groups.entries()].map(([key,group]) => <section key={key} className="min-w-0 space-y-3">
        <h2 className="break-words text-sm font-semibold text-foreground">{group.title}</h2>
        {group.rows.map(item => <SessionScheduleCard key={item.id} session={item}>
          {item.status === "scheduled" ? <Button variant="ghost" disabled={busy} onClick={()=>setConfirm({action:"start",session:item})}>Start room</Button> : item.status === "live" ? <ButtonLink to={sessionRoomPath(item.id)}>Join room</ButtonLink> : <Button variant="ghost" onClick={()=>showMaterials(item)}>View materials</Button>}
          <ActionMenu label={`Actions for ${item.title}`} disabled={busy} items={[{label:"View teaching materials",onSelect:()=>showMaterials(item)},...(item.status === "scheduled" ? [{label:"Edit session",onSelect:()=>setDrawer(item)},{label:"Cancel session",onSelect:()=>setConfirm({action:"cancel" as const,session:item})}] : [])]}/>
        </SessionScheduleCard>)}
      </section>) : <div className="rounded-xl border border-dashed border-line py-14 text-center"><CalendarDays size={28} className="mx-auto text-muted"/><h2 className="mt-4 font-semibold text-foreground">{search?"No matching sessions":`No ${views.find(view=>view.value===status)?.label.toLowerCase()} sessions`}</h2><p className="mt-2 text-sm text-muted">{search?"Try another search.":"Sessions appear here when their status matches this view."}</p></div>}
      <p className="text-xs text-muted">Dates use your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. <Link to="/instructor/cohorts" className="text-accent hover:underline">Manage cohorts →</Link></p>
    </>}
    {drawer && <SessionScheduleDrawer cohorts={cohorts.filter(item=>item.id===cohortId)} initialCohortId={cohortId} editing={drawer==="new"?null:drawer} onClose={()=>setDrawer(null)} onSave={save}/>}
    {materials!==null && <SessionMaterials session={materials} open={materialsOpen} onClose={()=>setMaterialsOpen(false)}/>}
    <ConfirmDialog open={!!confirm} title={confirm?.action==="start"?"Start this session?":"Cancel this session?"} message={confirm?.action==="start"?`“${confirm.session.title}” will become live and cohort members can join.`:`Cancel “${confirm?.session.title??""}”? It will remain in your cancelled sessions.`} confirmLabel={confirm?.action==="start"?"Start room":"Cancel session"} busy={busy} onConfirm={()=>void confirmAction()} onCancel={()=>setConfirm(null)}/>
  </div>;
}
