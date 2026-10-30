import { StatusChip, type Tone } from "../../../../components/ui/StatusChip";
import type { InstructorCohortStatus } from "../../types/types";

const chips: Record<InstructorCohortStatus, { tone: Tone; label: string }> = {
  draft: { tone: "draft", label: "Draft" },
  open: { tone: "success", label: "Open" },
  "starting-soon": { tone: "warning", label: "Starting soon" },
  "in-progress": { tone: "info", label: "In progress" },
  completed: { tone: "neutral", label: "Completed" },
};

export function CohortStatusChip({ status }: { status: InstructorCohortStatus }) {
  const { tone, label } = chips[status];
  return <StatusChip tone={tone}>{label}</StatusChip>;
}