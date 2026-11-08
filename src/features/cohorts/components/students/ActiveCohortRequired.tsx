import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { CohortOption } from "../../Services/cohortService";

export function ActiveCohortRequired({
  cohorts,
  onSelect,
}: {
  cohorts: CohortOption[];
  onSelect: (id: number) => void;
}) {
  const hasCohorts = cohorts.length > 0;
  return (
    <section
      className="student-card mx-auto max-w-2xl rounded-2xl border border-line bg-surface px-6 py-12 text-center sm:px-10"
      aria-labelledby="active-cohort-title"
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Users size={27} aria-hidden="true" />
      </span>
      <h1
        id="active-cohort-title"
        className="mt-6 text-2xl font-semibold tracking-tight text-foreground"
      >
        You need an active cohort
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
        {hasCohorts
          ? "Choose a cohort to see your learning progress, tasks and upcoming activities."
          : "Join a cohort to see your learning progress, tasks and upcoming activities. You can also join using an invitation from your instructor."}
      </p>
      {hasCohorts && (
        <div className="mx-auto mt-6 max-w-sm text-left">
          <label
            htmlFor="dashboard-cohort"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Choose your active cohort
          </label>
          <Select
            id="dashboard-cohort"
            value=""
            onChange={(value) => onSelect(Number(value))}
            placeholder="Select a cohort"
            options={cohorts.map((cohort) => ({
              value: String(cohort.id),
              label: cohort.name,
            }))}
          />
        </div>
      )}
      <Link
        to="/student/cohorts"
        className={`mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ${hasCohorts ? "text-accent hover:underline" : "bg-accent text-on-accent hover:bg-accent-hover"}`}
      >
        Browse cohorts <ArrowRight size={16} />
      </Link>
    </section>
  );
}
