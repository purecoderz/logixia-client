import { StatusChip, type Tone } from "../../../../components/ui/StatusChip";
import type { InstructorCourseStatus } from "../../types/types";

const chips: Record<InstructorCourseStatus, { tone: Tone; label: string }> = {
  draft: { tone: "draft", label: "Draft" },
  published: { tone: "success", label: "Published" },
  archived: { tone: "neutral", label: "Archived" },
};

export function CourseStatusChip({ status }: { status: InstructorCourseStatus }) {
  const { tone, label } = chips[status];
  return <StatusChip tone={tone}>{label}</StatusChip>;
}
