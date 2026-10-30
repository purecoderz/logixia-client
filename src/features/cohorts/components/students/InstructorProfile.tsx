const card = "rounded-lg border border-[#30363d] bg-[#0d1117] p-4";

export type Instructor = {
  name: string;
  bio?: string;
  /** e.g. "Staff engineer at Stripe" */
  role?: string;
  avatarUrl?: string;
  /** Short proof points, e.g. { value: "1,200+", label: "students taught" } */
  highlights?: { value: string; label: string }[];
  /** Social / portfolio links */
  links?: { label: string; href: string }[];
};

export type Schedule = {
  when: string;
  recordings: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className={card}>
      <p className="font-mono text-xs text-[#8b949e]">Live class</p>
      <p className="mt-1.5 text-sm text-white">{schedule.when}</p>
      <p className="mt-1 text-[13px] text-[#8b949e]">{schedule.recordings}</p>
    </div>
  );
}

export function InstructorProfile({ instructor }: { instructor: Instructor }) {
  const { name, bio, role, avatarUrl, highlights, links } = instructor;

  return (
    <article
      className={`${card} p-5 sm:p-6`}
      aria-label={`Instructor: ${name}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              width={88}
              height={88}
              className="size-[88px] rounded-xl object-cover ring-1 ring-[#30363d]"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-[88px] items-center justify-center rounded-xl bg-[#161b22] text-2xl font-semibold tracking-tight text-white ring-1 ring-[#30363d]"
            >
              {initials(name)}
            </div>
          )}
        </div>

        {/* Identity + bio */}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {name}
          </h3>
          {role && <p className="mt-0.5 text-sm text-[#8b949e]">{role}</p>}

          {bio && (
            <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-[#c9d1d9]">
              {bio}
            </p>
          )}

          {links && links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md border border-[#30363d] px-2.5 py-1 text-[13px] text-[#c9d1d9] transition-colors hover:border-[#8b949e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Proof points */}
      {highlights && highlights.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 divide-x divide-[#21262d] border-t border-[#21262d] pt-4 sm:grid-cols-3">
          {highlights.slice(0, 3).map((h, i) => (
            <div
              key={h.label}
              className={`flex flex-col px-4 first:pl-0 ${i === 2 ? "hidden sm:flex" : ""}`}
            >
              <dt className="order-2 text-[13px] text-[#8b949e]">{h.label}</dt>
              <dd className="order-1 text-lg font-semibold text-white">{h.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}