import { ErrorState } from "../../../components/ui/ErrorState";
import { ApiError } from "../../../lib/apiError";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Check,
  Clock,
  ListChecks,
  MessageCircle,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import { STATUS_STYLES } from "../components/students/CohortCard";
import { EnrolCard, MobileEnrolBar } from "../components/students/EnrolCard";
import { CohortService, type CohortStatus } from "../Services/cohortService";

import { SectionRow } from "../../../components/CoursesUi/SectionRow";
import { toCohortView } from "../utils/toCohotView";
import { RoadmapRow } from "../../../components/CoursesUi/RoadmapRow";

const card = "rounded-xl border border-line bg-surface p-4";
const h2 = "text-xl font-medium text-foreground";

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

export interface ApiCohortDetails {
  name: string;
  description: string;
  skills: string[] | null; // a plain list of strings
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

interface FactData {
  icon: LucideIcon;
  label: string;
  value: string;
}

const HOW_IT_WORKS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Video, title: "Live classes", text: "Weekly sessions with your instructor, coding together in a shared editor." },
  { icon: ListChecks, title: "Assignments", text: "Graded automatically, so you know straight away where you stand." },
  { icon: MessageCircle, title: "Feedback", text: "Your instructor reviews your work and tells you what to improve." },
];

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "xl" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent ${
        size === "xl" ? "size-20 text-3xl ring-4 ring-accent/10" : "size-7 text-xs"
      }`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function Fact({ icon: Icon, label, value }: FactData) {
  return (
    <div className="rounded-lg border border-line px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        <Icon size={14} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

/** Same shape as the page, so nothing jumps when the data arrives. */
function CohortDetailsSkeleton() {
  const bone = "rounded-xl border border-line bg-surface motion-safe:animate-pulse";
  return (
    <div role="status" aria-label="Loading cohort" className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <span className="sr-only">Loading cohort…</span>
      <div className="flex flex-col gap-8">
        <div className={`${bone} h-72`} />
        <div className={`${bone} h-40`} />
        <div className={`${bone} h-56`} />
      </div>
      <div className={`${bone} hidden h-80 lg:block`} />
    </div>
  );
}

export function CohortDetails() {
  const { pathname } = useLocation();
  const listingPath = pathname.startsWith("/student/") ? "/student/cohorts" : pathname.startsWith("/instructor/") ? "/instructor/cohorts" : "/cohorts";
  const { id } = useParams();
  // Strips any non-digit prefix, so both "c5" and "5" become "5".
  const cohortId = id?.replace(/^\D+/, "");

  const [cohort, setCohort] = useState<CohortView | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0); // bump to retry after an error

  useEffect(() => {
    if (!cohortId) {
      setStatus("notfound");
      return;
    }

    let ignore = false; // set on cleanup so a stale responwho dey breathse can't overwrite newer state

    const loadCohort = async () => {
      setStatus("loading");

      try {
        const response = await CohortService.getCohortsDetails(cohortId);
        if (ignore) return;

        // works whether the service returns the JSON body or an axios-style response
        const body = ((response as { data?: ApiCohortDetails })?.data ?? response) as ApiCohortDetails;

        setCohort(toCohortView(body));
        setStatus("ready");
      } catch (err) {
        if (ignore) return;

        setError(err);
        setStatus("error");
      }
    };

    loadCohort();

    return () => {
      ignore = true;
    };
  }, [cohortId, attempt]);

  // All hooks are above this line. Early returns must come after every hook.
  if (status === "notfound")
    return (
      <ErrorState
        what="this cohort"
        error={new ApiError("Cohort not found", 404)}
        homeTo={listingPath}
        homeLabel="Browse cohorts"
      />
    );

  if (status === "loading") return <CohortDetailsSkeleton />;

  if (status === "error")
    return (
      <ErrorState
        what="this cohort"
        error={error}
        onRetry={() => setAttempt((value) => value + 1)}
        homeTo={listingPath}
        homeLabel="Browse cohorts"
      />
    );

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

  const skills = cohort.outcomes.map((o) => o.title).filter(Boolean);

  const facts = [
    cohort.status === "in-progress"
      ? { icon: Calendar, label: "Now", value: cohort.durationLabel }
      : cohort.status === "completed"
        ? { icon: Calendar, label: "Status", value: "Completed" }
        : { icon: Calendar, label: "Starts", value: cohort.startsOn || "To be announced" },
    cohort.totalWeeks > 0 && { icon: Clock, label: "Duration", value: `${cohort.totalWeeks} weeks` },
    cohort.totalLessons > 0 && { icon: BookOpen, label: "Lessons", value: String(cohort.totalLessons) },
    cohort.seatsTotal != null
      ? { icon: Users, label: "Seats", value: String(cohort.seatsTotal) }
      : { icon: Video, label: "Format", value: "Live weekly" },
  ].filter((f): f is FactData => Boolean(f));

  return (
    <div className="pb-24 text-body lg:pb-0">
      <Link to={listingPath} className="font-mono text-[13px] text-accent hover:text-accent-hover">
        ← All cohorts
      </Link>

      <div className={`mt-5 grid gap-8 ${hasEnrolData ? "lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start" : ""}`}>
        <div className="flex min-w-0 flex-col gap-12">
          {/* Hero */}
          <header className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/10 blur-3xl"
            />
            <div className="relative">
              <span className={`inline-block rounded-full px-3 py-1 font-mono text-xs ${s.badge}`}>
                {s.label}
                {when && ` · ${when}`}
              </span>

              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {cohort.headline}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{cohort.summary}</p>

              <a href="#instructor" className="mt-5 inline-flex items-center gap-2.5 text-sm text-body hover:text-foreground">
                <Avatar name={cohort.instructor.name} />
                <span>
                  Taught by <span className="font-medium text-foreground">{cohort.instructor.name}</span>
                </span>
              </a>

              <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map((f) => (
                  <Fact key={f.label} {...f} />
                ))}
              </dl>

              {cohort.prerequisite && (
                <p className="mt-4 text-sm text-muted">
                  Before you start: <span className="text-body">{cohort.prerequisite}</span>
                </p>
              )}
            </div>
          </header>

          {/* What you'll learn */}
          {skills.length > 0 && (
            <section aria-labelledby="learn-heading">
              <h2 id="learn-heading" className={h2}>
                What you'll learn
              </h2>
              <ul className="mt-4 grid gap-x-6 gap-y-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
                {skills.map((skill, i) => (
                  <li key={`${skill}-${i}`} className="flex items-start gap-3 text-sm text-body">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check size={12} aria-hidden="true" />
                    </span>
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* How it works */}
          <section aria-labelledby="how-heading">
            <h2 id="how-heading" className={h2}>
              How it works
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ icon: Icon, title, text }) => (
                <li key={title} className={card}>
                  <Icon size={18} className="text-accent" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Syllabus: unchanged */}
          <section id="syllabus" className="scroll-mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={h2}>Syllabus</h2>
              {cohort.weeks.length > 0 && (
                <span className="font-mono text-xs text-muted">
                  {cohort.totalWeeks} weeks · {cohort.totalLessons} lessons
                </span>
              )}
            </div>

            {cohort.weeks.length === 0 ? (
              <p className="mt-4 text-sm text-muted">The syllabus for this cohort hasn't been published yet.</p>
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

          {/* Instructor */}
          <section id="instructor" aria-labelledby="instructor-heading" className="scroll-mt-8">
            <h2 id="instructor-heading" className={h2}>
              Your instructor
            </h2>

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
              <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent" />
              <div className="flex flex-col gap-5 p-6 pl-7 sm:flex-row sm:items-center sm:gap-7 sm:p-8 sm:pl-9">
                <Avatar name={cohort.instructor.name} size="xl" />
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent">
                    <Video size={12} aria-hidden="true" />
                    Live instructor
                  </span>
                  <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-foreground">
                    {cohort.instructor.name}
                  </p>
                  <p className="mt-3 max-w-xl border-l-2 border-accent/40 pl-4 text-[15px] leading-relaxed text-body">
                    {cohort.instructor.bio ?? "Leads every live class and reviews your work along the way."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Desktop sticky card */}
        {hasEnrolData && (
          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <EnrolCard cohort={cohort} totalWeeks={cohort.totalWeeks} />
          </aside>
        )}
      </div>

      {hasEnrolData && <MobileEnrolBar cohort={cohort} />}
    </div>
  );
}