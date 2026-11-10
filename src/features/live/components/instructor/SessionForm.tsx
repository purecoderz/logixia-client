import { useRef, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { ErrorState } from "@/components/ui/ErrorState";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { inputClass } from "@/components/ui/formStyles";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { useAddModule } from "@/features/courses/hooks/useAddModule";
import type { OutlineModule } from "@/features/courses/types/outline";
import type { InstructorCohort } from "@/features/cohorts/types/types";
import { localDateTime } from "@/features/cohorts/types/cohortTask";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { validateSession, sessionPayload, type CohortSession, type SessionFields, type SessionInput } from "../../types/session";

interface Props {
  cohorts: InstructorCohort[];
  initialCohortId: string;
  editing: CohortSession | null;
  onSave: (cohortId: string, input: SessionInput) => Promise<void>;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
}
export function SessionForm({ cohorts, initialCohortId, editing, onSave, onDirty, onBusy }: Props) {
  const [cohortId, setCohortId] = useState(editing ? String(editing.cohort_id) : initialCohortId);
  const cohort = cohorts.find(item => item.id === cohortId);
  const outline = useCourseOutline(cohort ? String(cohort.courseId) : undefined);
  const addModule = useAddModule(cohort ? String(cohort.courseId) : "");
  const [created, setCreated] = useState<OutlineModule[]>([]);
  const initial: SessionFields = { title: editing?.title ?? "", moduleId: editing ? String(editing.module_id) : "", lessonId: editing?.lesson_id ? String(editing.lesson_id) : "", notes: editing?.notes ?? "", startsAt: editing ? localDateTime(editing.starts_at) : "" };
  const [fields, setFields] = useState<SessionFields>(initial);
  const [creating, setCreating] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorFocusKey, setErrorFocusKey] = useState(0);
  function showError(message: string) { setModuleError(null); setError(message); setErrorFocusKey(value => value + 1); }
  function showModuleError(message: string) { setError(null); setModuleError(message); setErrorFocusKey(value => value + 1); }
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const modules = [...(outline.data?.modules ?? []), ...created.filter(item => !outline.data?.modules.some(module => module.id === item.id))].sort((a,b) => a.order-b.order);
  const selectedModule = modules.find(item => String(item.id) === fields.moduleId);
  const lessons = [...(selectedModule?.lessons ?? [])].sort((a,b) => a.order-b.order);
  function change(patch: Partial<SessionFields>) { setFields(current => ({ ...current, ...patch })); setError(null); onDirty(true); }
  async function quickCreate() {
    if (running.current || !cohort) return;
    if (!moduleTitle.trim() || moduleTitle.trim().length > 200) { showModuleError("Enter a module title between 1 and 200 characters."); return; }
    running.current = true; setBusy(true); onBusy(true); setModuleError(null);
    try {
      const module = await addModule.mutateAsync(moduleTitle.trim());
      setCreated(current => [...current, module]); change({ moduleId: String(module.id), lessonId: "" }); setCreating(false); setModuleTitle("");
    } catch (failure) { showModuleError(friendlyMessage(failure, "Couldn’t create the module. Please try again.")); }
    finally { running.current = false; setBusy(false); onBusy(false); }
  }
  async function submit() {
    if (running.current) return;
    const problem = !cohort ? "Choose a cohort first." : validateSession(fields) ?? (!selectedModule ? "Choose a module from this cohort’s course." : fields.lessonId && !lessons.some(lesson => String(lesson.id) === fields.lessonId) ? "Choose a lesson from the selected module." : null);
    if (problem) { showError(problem); return; }
    running.current = true; setBusy(true); onBusy(true); setError(null);
    try { await onSave(cohortId, sessionPayload(fields)); }
    catch (failure) { showError(failure instanceof ApiError && failure.status === 409 ? failure.message : failure instanceof ApiError && failure.status === 422 ? "Check the selected module, lesson and session details." : friendlyMessage(failure, "Couldn’t save the session. Please try again.")); }
    finally { running.current = false; setBusy(false); onBusy(false); }
  }
  return <form id="session-form" onSubmit={event => { event.preventDefault(); void submit(); }} className="space-y-5">
    <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
      <div><label htmlFor="session-cohort" className="mb-2 block text-sm font-medium text-foreground">Cohort</label><Select id="session-cohort" value={cohortId} disabled={!!editing} onChange={value => { setCohortId(value); setCreated([]); setCreating(false); setModuleTitle(""); change({ moduleId:"",lessonId:"" }); }} placeholder="Select a cohort" options={cohorts.map(item => ({ value:item.id,label:item.name,description:item.course }))} /></div>
      <div><label htmlFor="session-title" className="mb-2 block text-sm font-medium text-foreground">Session title</label><input id="session-title" maxLength={200} value={fields.title} onChange={event => change({ title:event.target.value })} placeholder="What will you teach?" className={inputClass} /></div>
      <div className="space-y-3"><div className="flex items-center justify-between gap-3"><label htmlFor="session-module" className="text-sm font-medium text-foreground">Module</label><button type="button" disabled={!cohort || !!outline.error} onClick={() => { setCreating(true); setModuleError(null); }} className="text-xs font-semibold text-accent disabled:opacity-50">+ Create module</button></div>
        {outline.error ? <ErrorState what="course modules" error={outline.error} onRetry={() => void outline.refetch()} variant="section" /> : <Select id="session-module" value={fields.moduleId} disabled={!cohort || outline.isPending} onChange={value => change({ moduleId:value,lessonId:"" })} placeholder={cohort && outline.isPending ? "Loading modules…" : "Select a module"} options={modules.map(item => ({value:String(item.id),label:item.title}))} emptyMessage="No modules yet. Create one above." />}
        {creating && <div className="space-y-3 rounded-lg border border-line bg-input p-3"><label htmlFor="quick-module-title" className="block text-xs text-muted">New module title</label><input id="quick-module-title" autoFocus value={moduleTitle} onChange={event => {setModuleTitle(event.target.value);setModuleError(null);onDirty(true);}} onKeyDown={event => {if(event.key === "Enter"){event.preventDefault();void quickCreate();}}} className={inputClass} maxLength={200} />{moduleError && <FormError message={moduleError} autoFocus focusKey={errorFocusKey} />}<div className="flex gap-2"><Button type="button" disabled={busy || !moduleTitle.trim()} onClick={() => void quickCreate()}>{busy ? "Creating…" : "Create and select"}</Button><button type="button" onClick={() => {setCreating(false);setModuleTitle("");}} className="px-3 text-xs text-muted">Cancel</button></div><p className="text-xs leading-5 text-muted">The module is added to the course immediately and stays there if you cancel this session.</p></div>}
      </div>
      <div><label htmlFor="session-lesson" className="mb-2 block text-sm font-medium text-foreground">Lesson <span className="text-muted">(optional)</span></label><Select id="session-lesson" value={fields.lessonId} disabled={!selectedModule} onChange={value => change({lessonId:value})} placeholder="Use session notes instead" options={[{value:"",label:"No lesson — use session notes"},...lessons.map(item => ({value:String(item.id),label:item.title}))]} /><p className="mt-2 text-xs leading-5 text-muted">Attach an existing lesson from this module, or write the concepts in Markdown below.</p></div>
      <div><label htmlFor="session-start" className="mb-2 block text-sm font-medium text-foreground">Starts at</label><input id="session-start" type="datetime-local" value={fields.startsAt} onChange={event => change({startsAt:event.target.value})} className={inputClass} /><p className="mt-2 text-xs text-muted">Your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}. The room opens when you start the session.</p></div>
      <MarkdownEditor id="session-notes" label="Teaching notes" value={fields.notes} onChange={notes => change({notes})} rows={9} hint={fields.lessonId ? "Optional Markdown notes to accompany the attached lesson." : "Required without a lesson. Supports headings, lists, links and code blocks."} />
      {error && <FormError message={error} autoFocus focusKey={errorFocusKey} />}
    </fieldset>
  </form>;
}
