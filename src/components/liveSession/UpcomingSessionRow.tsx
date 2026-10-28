// components/Sessions/UpcomingSessionRow.tsx
interface UpcomingSessionRowProps {
  title: string;
  cohort: string;
  instructor: string;
  startsAt: string; // ISO string
  meetingUrl: string;
}

export function UpcomingSessionRow({
  title,
  cohort,
  instructor,
  startsAt,
  meetingUrl,
}: UpcomingSessionRowProps) {
  const when = new Date(startsAt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 hover:bg-[#161b22]">
      <div className="min-w-0">
        <p className="truncate text-sm text-[#c9d1d9]">{title}</p>
        <p className="truncate text-xs text-[#8b949e]">
          {cohort} · {instructor}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-[#8b949e]">{when}</p>
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#58a6ff] hover:underline"
        >
          Meeting link
        </a>
      </div>
    </div>
  );
}