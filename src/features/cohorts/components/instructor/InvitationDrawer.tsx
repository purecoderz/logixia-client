import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InvitationForm } from "./InvitationForm";
import type {
  CreatedInvitation,
  CreateInvitationInput,
} from "../../types/membership";

export function InvitationDrawer({
  onCreate,
}: {
  onCreate: (input: CreateInvitationInput) => Promise<CreatedInvitation>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="!min-h-9 !py-2" onClick={() => setOpen(true)}>
        <UserPlus size={16} aria-hidden="true" /> Invite student
      </Button>
      <Dialog
        open={open}
        onClose={setOpen}
        unmount={false}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/55 transition-opacity duration-200 data-closed:opacity-0 motion-reduce:transition-none"
        />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <DialogPanel
              transition
              className="flex h-full w-screen max-w-md flex-col border-l border-line bg-surface text-body shadow-2xl transition-transform duration-300 ease-out data-closed:translate-x-full motion-reduce:transition-none"
            >
              <header className="flex items-start justify-between gap-4 border-b border-line p-5">
                <div>
                  <DialogTitle className="text-lg font-semibold text-foreground">
                    Invite a student
                  </DialogTitle>
                  <Description className="mt-2 text-xs leading-relaxed text-muted">
                    Create a link for one email address, then copy and share it.
                    The invitation expires after 24 hours and can be used once.
                  </Description>
                </div>
                <button
                  type="button"
                  aria-label="Close invitation drawer"
                  onClick={() => setOpen(false)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-5">
                <InvitationForm embedded onCreate={onCreate} />
              </div>
              <footer className="border-t border-line p-4 text-xs text-muted">
                Students join only after accepting their invitation.
              </footer>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
