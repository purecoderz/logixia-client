import { ErrorState } from "../../../components/ui/ErrorState";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignment } from "../hooks/useAssignmentDraft";
import { AppLoading } from "../../../components/ui/AppLoading";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ThemeBoundary } from "../../theme/ThemeProvider";
// pages/Assignments/AssignmentGround.tsx
import { useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";

import { AssignmentService } from "../services/assignmentService";

import { useParams } from "react-router-dom";
import { TaskInstructions } from "../components/TaskInstructions";
import { CodeWorkspace } from "@/features/workspace/Workspace";

type SubmitState = "idle" | "submitting" | "submitted" | "error";

export function AssignmentGroundPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  return profile ? (
    <ThemeBoundary>
      <AssignmentGround
        key={`${profile.id}:${id}`}
        userId={String(profile.id)}
        assignmentId={id ?? "0"}
      />
    </ThemeBoundary>
  ) : null;
}

export function AssignmentGround({
  assignmentId,
  userId,
}: {
  assignmentId: string;
  userId: string;
}) {
  const assignment = useAssignment(assignmentId);
  const task = assignment.task;
  const [confirmReset, setConfirmReset] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const submit = async (files: Record<string, string>) => {
    setSubmitState("submitting");
    try {
      await AssignmentService.submit(assignmentId, files);
      setSubmitState("submitted");
    } catch {
      setSubmitState("error");
    }
  };

  if (assignment.loadError)
    return (
      <div className="min-h-dvh bg-canvas px-5 py-12">
        <ErrorState
          what="your task"
          error={assignment.loadError}
          onRetry={assignment.retryLoad}
          homeTo="/tasks"
          homeLabel="Back to tasks"
        />
      </div>
    );
    
  if (!task) return <AppLoading message="Restoring your task…" />;

  return (
    <>
      <CodeWorkspace
        key={assignment.generation}
        storageMode="memory"
        layout="split"
        storageKey={`assignment:${userId}:${assignmentId}`}
        title={task.title}
        starterFiles={assignment.initialFiles}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={submitState === "submitting"}
              className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-xs text-body hover:bg-hover disabled:opacity-50"
            >
              <RotateCcw size={13} />
              Reset to starter files
            </button>
          </div>
        }
        asideTitle={task.title}
        aside={
          <TaskInstructions
            instructions={task.instructions}
          />
        }
        asideFooter={({ nodes, getFiles }) => (
          <div className="flex items-center justify-between gap-3">
            <p
              role="status"
              className={`min-w-0 truncate text-xs ${
                submitState === "submitted"
                  ? "text-success"
                  : submitState === "error"
                    ? "text-danger"
                    : "text-muted"
              }`}
            >
              {submitState === "submitted"
                ? "Submitted. You can resubmit until the due date."
                : submitState === "error"
                  ? "Couldn't submit. Try again."
                  : "Submit when ready."}
            </p>

            <button
              type="button"
              onClick={() => submit(getFiles())}
              disabled={submitState === "submitting" || nodes.length === 0}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#238636] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2ea043] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitState === "submitting" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : submitState === "submitted" ? (
                <Check className="size-4" aria-hidden />
              ) : null}
              {submitState === "submitting"
                ? "Submitting"
                : submitState === "submitted"
                  ? "Resubmit"
                  : "Submit"}
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset to starter files?"
        message="This replaces every file with the original starter files and removes files you added. Submitted work is not changed."
        confirmLabel="Reset files"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          assignment.reset();
          setSubmitState("idle");
          setConfirmReset(false);
        }}
      />
    </>
  );
}