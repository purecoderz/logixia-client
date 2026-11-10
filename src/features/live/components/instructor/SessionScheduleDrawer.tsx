import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { InstructorCohort } from "@/features/cohorts/types/types";
import type { CohortSession, SessionInput } from "../../types/session";
import { SessionForm } from "./SessionForm";

export function SessionScheduleDrawer({ cohorts, initialCohortId, editing, onClose, onSave }: { cohorts: InstructorCohort[]; initialCohortId:string; editing:CohortSession|null; onClose:()=>void; onSave:(cohortId:string,input:SessionInput)=>Promise<void> }) {
  const [dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false);
  const [discard,setDiscard]=useState(false);
  function close(){ if(busy || discard)return; if(dirty)setDiscard(true);else onClose(); }
  return <Dialog open onClose={close} className="relative z-50">
    <DialogBackdrop transition className="fixed inset-0 bg-black/55 transition-opacity duration-200 data-closed:opacity-0 motion-reduce:transition-none" />
    <div className="fixed inset-0 overflow-hidden"><div className="absolute inset-y-0 right-0 flex max-w-full"><DialogPanel data-learning-shell-overlay transition className="flex h-full w-screen max-w-xl flex-col border-l border-line bg-surface text-body shadow-2xl transition-transform duration-300 data-closed:translate-x-full motion-reduce:transition-none">
      <header className="flex items-start justify-between gap-4 border-b border-line p-5"><div><DialogTitle className="text-lg font-semibold text-foreground">{editing ? "Edit session" : "Schedule a session"}</DialogTitle><Description className="mt-2 text-xs leading-6 text-muted">Group your class under a module, attach a lesson or prepare Markdown teaching notes.</Description></div><button type="button" disabled={busy} onClick={close} aria-label="Close session drawer" className="rounded-lg p-2 hover:bg-hover"><X size={18} /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5"><SessionForm cohorts={cohorts} initialCohortId={initialCohortId} editing={editing} onDirty={setDirty} onBusy={setBusy} onSave={async(cohortId,input)=>{await onSave(cohortId,input);onClose();}} /></div>
      <footer className="flex justify-end gap-3 border-t border-line p-5"><Button variant="ghost" disabled={busy} onClick={close}>Cancel</Button><Button type="submit" form="session-form" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Schedule session"}</Button></footer>
      <ConfirmDialog open={discard} title="Discard session changes?" message="Your unsaved session details and teaching notes will be lost. Any module already created stays in the course." confirmLabel="Discard changes" onConfirm={onClose} onCancel={()=>setDiscard(false)} />
    </DialogPanel></div></div>
  </Dialog>;
}
