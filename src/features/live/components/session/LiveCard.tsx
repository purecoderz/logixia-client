import { Link } from "react-router-dom";

interface LiveSessionCardProps {
  title: string;
  cohort: string;
  instructor: string;
  meetingUrl: string;
}

export function LiveSessionCard({ title, cohort, instructor, meetingUrl }: LiveSessionCardProps) {
  return (
    <div className="rounded-xl border border-[#238636]/40 bg-[#161b22] p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-[#3fb950]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3fb950] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3fb950]" />
        </span>
        LIVE NOW
      </div>

      <h2 className="text-xl text-white">{title}</h2>
      <p className="mt-1 text-sm text-[#8b949e]">
        {cohort} · {instructor}
      </p>

      <Link
        to={meetingUrl}
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ea043]"
      >
        Join session
      </Link>
    </div>
  );
}