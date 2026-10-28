// pages/Assignments/AssignmentGround.tsx
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { AssignmentService } from "../../services/assignmentService";
import { CodeWorkspace } from "../../components/Workspace/workspace";
import { useParams } from "react-router-dom";
import { TaskInstructions } from "../../components/AssignmentUi/TaskInstructions";

// Same shape as your tasks table, replace with a real fetch later
const MOCK_TASK = {
    title: "Loops exercise",
    instructions:
        "Write a program that prints the numbers 1 to 10, one per line.\n\nThen change it so multiples of 3 print \"Fizz\" instead of the number.",
    xp: 20,
    due_date: new Date(Date.now() + 86_400_000).toISOString(),
    starter_file: { "main.py": "# Write your solution here\n" } as Record<string, string>,
};

type SubmitState = "idle" | "submitting" | "submitted" | "error";

export function AssignmentGroundPage() {
    const { id } = useParams<{ id: string }>();
    return <AssignmentGround key={id} assignmentId={id ?? "0"} />;
}

export function AssignmentGround({ assignmentId }: { assignmentId: string }) {
    const task = MOCK_TASK;
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

    return (
        <CodeWorkspace
            layout="split"
            storageKey={`assignment:${assignmentId}`}
            title={task.title}
            starterFiles={task.starter_file}
            asideTitle="Task"
            aside={
                <TaskInstructions
                    title={task.title}
                    instructions={task.instructions}
                    xp={task.xp}
                    dueDate={task.due_date}
                />
            }
            asideFooter={({ nodes, getFiles }) => (
                <div className="flex items-center justify-between gap-3">
                    <p
                        role="status"
                        className={`min-w-0 truncate text-xs ${
                            submitState === "submitted"
                                ? "text-[#3fb950]"
                                : submitState === "error"
                                  ? "text-[#f85149]"
                                  : "text-[#8b949e]"
                        }`}
                    >
                        {submitState === "submitted"
                            ? "Submitted. You can resubmit until the due date."
                            : submitState === "error"
                              ? "Couldn't submit. Try again."
                              : "Your work saves automatically."}
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
    );
}