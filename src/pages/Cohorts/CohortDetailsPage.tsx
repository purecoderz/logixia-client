import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Calendar, Check, Users, Video } from "lucide-react";

import { STATUS_STYLES } from "../../components/Cohorts/CohortCard";
import { EnrolCard, MobileEnrolBar } from "../../components/CohortsDetails/EnrolCard";
import { CohortService, type CohortStatus } from "../../features/cohorts/Services/cohortService";

import { SectionRow } from "../../components/CoursesUi/SectionRow";
import { LessonRow } from "../../components/CoursesUi/LessonRow";
import { toCohortView } from "../../components/CohortsDetails/toCohorotView";
import { InstructorProfile } from "../../components/CohortsDetails/InstructorProfile";
import { RoadmapRow } from "../../components/CoursesUi/RoadmapRow";

const card = "rounded-xl border border-[#30363d] bg-[#161b22] p-4";
const h2 = "text-xl font-medium text-white";

// ---------- what the API sends ----------
interface ApiLesson {
  lesson_order: number;
  title: string;
}

interface ApiModule {
  id: number;
  module_order: number;
  title: string;
  lessons?: ApiLesson[];
}

interface ApiSkill {
  title: string;
  description: string;
}

export interface ApiCohortDetails {
  name: string;
  description: string;
  skills: ApiSkill[] | null;
  start: string; // ISO datetime string
  end: string;
  price: number;
  instructor: string;
  bio: string | null;
  syllabus: ApiModule[];
}

// ---------- what this page works with ----------
export interface CohortView {
  headline: string;
  summary: string;
  outcomes: { title: string; text: string }[];
  weeks: { id: number; title: string; lessons: ApiLesson[] }[];
  totalWeeks: number;
  totalLessons: number;
  instructor: { name: string; bio?: string };
  status: CohortStatus;
  startsOn: string;
  durationLabel: string;
  price: number;

  // Not sent by the API yet, so the page hides them
  seatsTotal?: number;
  seatsTaken?: number;
  prerequisite?: string;
  schedule?: { when: string; recordings: string };
}

type LoadState = "loading" | "ready" | "notfound" | "error";


export function CohortDetails() {
  const { id } = useParams();
  // Strips any non-digit prefix, so both "c5" and "5" become "5".
  const cohortId = id?.replace(/^\D+/, "");

  const [cohort, setCohort] = useState<CohortView | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [attempt, setAttempt] = useState(0); // bump to retry after an error

  useEffect(() => {
    if (!cohortId) {
      setStatus("notfound");
      return;
    }

    let ignore = false; // set on cleanup so a stale response can't overwrite newer state

    const loadCohort = async () => {
      setStatus("loading");

      try {
        const response = await CohortService.getCohortsDetails(cohortId);
        if (ignore) return;

        // works whether the service returns the JSON body or an axios-style response
        const body = ((response as { data?: ApiCohortDetails })?.data ??
          response) as ApiCohortDetails;

        setCohort(toCohortView(body));
        setStatus("ready");
      } catch (err) {
        if (ignore) return;

        const httpStatus = (err as { response?: { status?: number } })?.response?.status;
        console.error(err);
        setStatus(httpStatus === 404 ? "notfound" : "error");
      }
    };

    loadCohort();

    return () => {
      ignore = true;
    };
  }, [cohortId, attempt]);

  // All hooks are above this line. Early returns must come after every hook.
  if (status === "notfound") return <Navigate to="/cohorts" replace />;

  if (status === "loading") {
    return <p className="font-mono text-sm text-[#8b949e]">Loading cohort…</p>;
  }

  if (status === "error") {
    return (
      <div className={`${card} max-w-md`}>
        <p className="text-sm text-white">We couldn't load this cohort.</p>
        <p className="mt-1.5 text-[13px] text-[#8b949e]">Check your connection, then try again.</p>
        <button
          onClick={() => setAttempt((a) => a + 1)}
          className="mt-3 rounded-md border border-[#30363d] px-3 py-1.5 text-sm text-white hover:bg-[#21262d]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!cohort) return null; // narrows the type so `cohort` is not null below

  const s = STATUS_STYLES[cohort.status];
  const when =
    cohort.status === "in-progress"
      ? cohort.durationLabel
      : cohort.status === "completed"
        ? undefined
        : cohort.startsOn
          ? `starts ${cohort.startsOn}`
          : undefined;
  // a finished cohort can't be registered for
  const hasEnrolData = cohort.price != null && cohort.status !== "completed";

  return (
    <div className="pb-24 text-[#c9d1d9] lg:pb-0">
      <Link to="/cohorts" className="font-mono text-[13px] text-[#58a6ff] hover:text-[#79b8ff]">
        ← All cohorts
      </Link>

      <div className="mt-5 flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-10">
          {/* Header */}
          <header>
            <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs ${s.badge}`}>
              {s.label}
              {when && ` · ${when}`}
            </span>
            <h1 className="mt-3.5 text-4xl font-semibold leading-tight text-white">{cohort.headline}</h1>
            <p className="mt-3.5 max-w-2xl text-base leading-relaxed text-[#8b949e]">{cohort.summary}</p>

            <div className="mt-5 flex flex-wrap items-center gap-5 font-mono text-[13px]">
              {cohort.totalWeeks > 0 && (
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#8b949e]" />
                  {cohort.totalWeeks} weeks
                </span>
              )}
              {cohort.seatsTotal != null && (
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-[#8b949e]" />
                  {cohort.seatsTotal} seats
                </span>
              )}
              <span className="flex items-center gap-2">
                <Video size={16} className="text-[#8b949e]" />
                Weekly live classes
              </span>
              {cohort.prerequisite && (
                <span className="rounded-md border border-[#30363d] px-2.5 py-0.5">{cohort.prerequisite}</span>
              )}
            </div>
          </header>

          {/* Outcomes */}
          {cohort.outcomes.length > 0 && (
            <section>
              <h2 className={h2}>What you'll be able to do</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {cohort.outcomes.map((o, i) => (
                  <div key={`${o.title}-${i}`} className={card}>
                    <p className="flex items-center gap-2 text-sm font-medium text-white">
                      <Check size={16} className="text-[#3fb950]" />
                      {o.title}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#8b949e]">{o.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Syllabus */}
          <section id="syllabus" className="scroll-mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={h2}>Syllabus</h2>
              {cohort.weeks.length > 0 && (
                <span className="font-mono text-xs text-[#8b949e]">
                  {cohort.totalWeeks} weeks · {cohort.totalLessons} lessons
                </span>
              )}
            </div>

            {cohort.weeks.length === 0 ? (
              <p className="mt-4 text-sm text-[#8b949e]">The syllabus for this cohort hasn't been published yet.</p>
            ) : (
              <div className="mt-4">
                {cohort.weeks.map((week, i) => (
                  <SectionRow
                    key={week.id}
                    title={week.title}
                    completed={0}
                    total={week.lessons.length}
                    defaultOpen={i === 0}
                  >
                    {week.lessons.map((lesson) => (
                      <RoadmapRow
                        key={`${week.id}-${lesson.lesson_order}`}
                        title={lesson.title}
                        step={lesson.lesson_order}
                        to=""
                      />
                    ))}
                  </SectionRow>
                ))}
              </div>
            )}
          </section>

          {/* instructor */}
          <section>
            <h2 className={h2}>Instructor</h2>
            <div className="mt-4 grid gap-3">
              {/* {cohort.schedule && <ScheduleCard schedule={cohort.schedule} />} */}
              <InstructorProfile instructor={cohort.instructor} />
            </div>
          </section>
        </div>

        {/* Desktop sticky card */}
        {hasEnrolData && (
          <aside className="hidden w-[340px] shrink-0 lg:sticky lg:top-6 lg:block">
            <EnrolCard cohort={cohort} totalWeeks={cohort.totalWeeks} />
          </aside>
        )}
      </div>

      {hasEnrolData && <MobileEnrolBar cohort={cohort} />}
    </div>
  );
}