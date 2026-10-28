import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Video, ListChecks, MessageCircle } from "lucide-react";

const seatsTaken = 14;
const seatsTotal = 20;

const weekSteps = [
  { icon: Video, title: "Live class", text: "Code together in a shared editor" },
  { icon: ListChecks, title: "Assignments", text: "Graded automatically" },
  { icon: MessageCircle, title: "Feedback", text: "From your instructor" },
];

export function CohortCard() {
  return (
    <div className="grid gap-5 rounded-xl border border-[#30363d] bg-[#0d1117] p-5 md:grid-cols-2">
      <div>
        <span className="inline-block rounded-full bg-[#58a6ff]/10 px-3 py-1 text-xs text-[#58a6ff]">
          Cohort  · enrolment open
        </span>

        <h2 className="mt-3 text-lg font-medium text-white">
          Learn to code live with an instructor
        </h2>
        <p className="mt-1 text-sm text-[#8b949e]">
          Weekly live classes, graded assignments and feedback, in a small group.
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5"><Calendar size={16} className="text-[#8b949e]" />Starts Nov 3</span>
          <span className="flex items-center gap-1.5"><Clock size={16} className="text-[#8b949e]" />12 weeks</span>
          <span className="flex items-center gap-1.5"><Users size={16} className="text-[#8b949e]" />{seatsTotal} seats</span>
        </div>

        <p className="mt-4 mb-1.5 text-xs text-[#8b949e]">
          {seatsTaken} of {seatsTotal} seats taken
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#21262d]">
          <div
            className="h-full bg-[#3fb950]"
            style={{ width: `${(seatsTaken / seatsTotal) * 100}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/cohorts" className="rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white">
            Register for a cohort 
          </Link>
          <Link to="/cohorts" className="rounded-lg border border-[#30363d] px-4 py-2 text-sm">
            View syllabus
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
        <p className="mb-3 text-xs text-[#8b949e]">How a week works</p>
        <div className="space-y-3">
          {weekSteps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon size={18} className="mt-0.5 text-[#58a6ff]" />
              <div>
                <p className="text-sm text-white">{title}</p>
                <p className="text-xs text-[#8b949e]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}