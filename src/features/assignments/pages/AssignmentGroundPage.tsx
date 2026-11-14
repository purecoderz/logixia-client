import { ErrorState } from "../../../components/ui/ErrorState";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignment } from "../hooks/useAssignmentDraft";
import { WorkspaceSkeleton } from "../../../components/ui/TaskSkeletons";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ThemeBoundary } from "../../theme/ThemeProvider";
// pages/Assignments/AssignmentGround.tsx
import { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, FlaskConical, Loader2, RotateCcw } from "lucide-react";

import {
  AssignmentService,
  type SubmissionResult,
} from "../services/assignmentService";

import { useNavigate, useParams } from "react-router-dom";
import { TaskInstructions } from "../components/TaskInstructions";
import { CodeWorkspace } from "@/features/workspace/Workspace";
import type { TerminalLine } from "@/components/SmartTerminal/TerminalView";
import { friendlyMessage } from "@/lib/apiError";

type SubmitState = "idle" | "submitting" | "submitted" | "error" | "practiced";

const SUBMIT_STEPS = [
  "Sending code…",
  "Validating syntax…",
  "Running checks…",
  "Finalizing submission…",
];

function formatSubmissionLines(
  result: SubmissionResult,
  isPractice: boolean,
): TerminalLine[] {
  const tests = Array.isArray(result.tests) ? result.tests : [];
  const passedCount = tests.filter((t) => t.passed).length;
  const lines: TerminalLine[] = [
    { kind: "system", text: "" },
    {
      kind: "system",
      text: isPractice
        ? "─── Practice Check Results ───"
        : "─── Submission Results ───",
    },
  ];

  for (const test of tests) {
    if (test.passed) {
      lines.push({ kind: "command", text: `  ✓ ${test.name}` });
    } else {
      lines.push({ kind: "stderr", text: `  ✗ ${test.name}` });
      if (test.message) {
        for (const msgLine of test.message.split("\n")) {
          lines.push({ kind: "stderr", text: `    ${msgLine}` });
        }
      }
    }
  }

  lines.push({
    kind: result.passed ? "command" : "stderr",
    text: result.passed
      ? `Result: ${passedCount}/${tests.length} checks passed${result.submission_status ? ` (${result.submission_status})` : ""}`
      : `Result: ${passedCount}/${tests.length} checks passed — fix the failed check(s) above and try again.`,
  });

  return lines;
}

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
  const navigate = useNavigate();
  const assignment = useAssignment(assignmentId);
  const task = assignment.task;
  const [confirmReset, setConfirmReset] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitStep, setSubmitStep] = useState(0);
  const [lastPassed, setLastPassed] = useState<boolean | null>(null);

  useEffect(() => {
    if (submitState !== "submitting") return;
    setSubmitStep(0);
    const id = window.setInterval(() => {
      setSubmitStep((step) =>
        step < SUBMIT_STEPS.length - 1 ? step + 1 : step,
      );
    }, 900);
    return () => window.clearInterval(id);
  }, [submitState]);

  useEffect(() => {
    if (task && task.type === "quiz") {
      navigate(`/tasks/${assignmentId}/quiz`, { replace: true });
    }
  }, [task, assignmentId, navigate]);

  const isMissed = task?.status === "missed";
  const isPreviouslyCompleted =
    task?.status === "completed" || task?.status === "submitted";
  const isExpiredOrDone = isMissed || isPreviouslyCompleted;

  const submit = async (
    files: Record<string, string>,
    appendTerminalLines: (lines: TerminalLine[]) => void,
  ) => {
    setSubmitState("submitting");
    setLastPassed(null);
    try {
      const result = isExpiredOrDone
        ? await AssignmentService.practiceRun(assignmentId, files)
        : await AssignmentService.submit(assignmentId, files);

      if (result) {
        appendTerminalLines(formatSubmissionLines(result, isExpiredOrDone));
        setLastPassed(result.passed);
      }
      setSubmitState(isExpiredOrDone ? "practiced" : "submitted");
    } catch (err) {
      appendTerminalLines([
        {
          kind: "stderr",
          text: `Submission failed: ${friendlyMessage(err, "Please try again.")}`,
        },
      ]);
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

  if (!task || task.type === "quiz")
    return <WorkspaceSkeleton label="Restoring your task" />;

  // ── Status badge shown in the toolbar ──────────────────────────────────────
  const statusBadge = isMissed ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f85149]/10 px-2 py-1 text-xs font-medium text-danger">
      <AlertCircle size={12} aria-hidden />
      Missed — deadline passed
    </span>
  ) : isPreviouslyCompleted ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3fb950]/10 px-2 py-1 text-xs font-medium text-success">
      <CheckCircle2 size={12} aria-hidden />
      Already submitted
    </span>
  ) : null;

  // ── Status banner shown above the action button ───────────────────────────
  const statusBanner = isMissed ? (
    <p className="rounded-md border border-[#f85149]/30 bg-[#f85149]/10 px-3 py-2 text-xs leading-relaxed text-danger">
      Deadline passed — submissions are closed. You can still run your code for practice.
    </p>
  ) : isPreviouslyCompleted ? (
    <p className="rounded-md border border-[#3fb950]/30 bg-[#3fb950]/10 px-3 py-2 text-xs leading-relaxed text-success">
      You already submitted this task. Run your code anytime to keep practising.
    </p>
  ) : null;

  // ── Action button label & icon ────────────────────────────────────────────
  const isPracticeMode = isExpiredOrDone;
  const isPracticed = submitState === "practiced";

  const btnIcon =
    submitState === "submitting" ? (
      <Loader2 className="size-4 animate-spin" aria-hidden />
    ) : submitState === "submitted" || isPracticed ? (
      <Check className="size-4" aria-hidden />
    ) : isPracticeMode ? (
      <FlaskConical className="size-4" aria-hidden />
    ) : null;

  const btnLabel =
    submitState === "submitting"
      ? isPracticeMode
        ? "Running…"
        : "Submitting…"
      : isPracticed
        ? "Run again"
        : submitState === "submitted"
          ? "Resubmit"
          : isPracticeMode
            ? "Run & check"
            : "Submit";

  // ── Footer status text ───────────────────────────────────────────────────
  const footerText =
    submitState === "submitting"
      ? SUBMIT_STEPS[submitStep]
      : isPracticed
        ? lastPassed === false
          ? "Some checks failed — see terminal."
          : "Practice run complete — keep experimenting!"
        : submitState === "submitted"
          ? lastPassed === false
            ? "Submitted with failing checks — see terminal."
            : "All checks passed!"
          : submitState === "error"
            ? "Couldn't submit. Try again."
            : isPracticeMode
              ? "Practice runs don't count towards your grade."
              : "Submit when ready.";

  const footerColor =
    submitState === "submitting"
      ? "text-accent"
      : submitState === "error" || lastPassed === false
        ? "text-danger"
        : isPracticed || submitState === "submitted"
          ? "text-success"
          : "text-muted";

  return (
    <>
      <CodeWorkspace
        key={assignment.generation}
        storageMode="memory"
        layout="split"
        storageKey={`assignment:${userId}:${assignmentId}`}
        title={task.title}
        starterFiles={assignment.initialFiles}
        runDisabled={submitState === "submitting"}
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
            {statusBadge}
          </div>
        }
        asideTitle={task.title}
        aside={
          <div className="space-y-3">
            {statusBanner && <div className="px-4 pt-3">{statusBanner}</div>}
            <TaskInstructions
              instructions={task.instructions}
            />
          </div>
        }
        asideFooter={({ nodes, getFiles, appendTerminalLines }) => (
          <div className="flex items-center gap-2.5">
            <p
              role="status"
              aria-live="polite"
              className={`truncate text-xs ${submitState === "submitting" ? "inline" : "hidden xl:inline"} ${footerColor}`}
            >
              {footerText}
            </p>

            <button
              type="button"
              onClick={() => void submit(getFiles(), appendTerminalLines)}
              disabled={submitState === "submitting" || nodes.length === 0}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff] disabled:cursor-not-allowed disabled:opacity-50 ${
                isPracticeMode
                  ? "bg-[#1f6feb] hover:bg-[#388bfd]"
                  : "bg-[#238636] hover:bg-[#2ea043]"
              }`}
            >
              {btnIcon}
              {btnLabel}
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