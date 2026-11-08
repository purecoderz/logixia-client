import { Play, Lock } from "lucide-react";
import { TimelineRow } from "./TimelineRow";

interface LessonRowProps {
  title: string;
  duration?: string;
  locked: boolean;
  to?: string;
  sample?: boolean;
}

export function LessonRow({
  title,
  duration,
  locked,
  to,
  sample,
}: LessonRowProps) {
  return (
    <TimelineRow
      node={<Play size={12} fill="currentColor" />}
      title={title}
      to={to}
      badge={sample ? "SAMPLE" : undefined}
      trailing={
        <>
          {locked && <Lock size={12} className="text-danger" />}
          <span className="rounded bg-hover px-1.5 py-0.5 text-[11px] text-muted">
            {duration}
          </span>
        </>
      }
    />
  );
}
