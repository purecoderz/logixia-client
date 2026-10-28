// components/Sessions/LiveSessionsView.tsx

import type { Session } from "../../services/liveSessionServices";
import { LiveSessionCard } from "./LiveCard";
import { UpcomingSessionRow } from "./UpcomingSessionRow";


export function LiveSessionsView({ sessions }: { sessions: Session[] }) {
    const live = sessions.filter((s) => s.status === "live");
    const upcoming = sessions.filter((s) => s.status === "upcoming");

    if (live.length === 0 && upcoming.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-[#8b949e]">
                No live or upcoming sessions.
            </p>
        );
    }

    return (
        <div className="space-y-8">
            {live.length > 0 && (
                <section className="space-y-3">
                    {live.map((s) => (
                        <LiveSessionCard
                            key={s.id}
                            title={s.title}
                            cohort={s.cohort_name}
                            instructor={s.instructor}
                            meetingUrl={s.meeting_url}
                        />
                    ))}
                </section>
            )}

            {upcoming.length > 0 && (
                <section>
                    <h2 className="mb-2 text-sm font-semibold text-[#8b949e]">Upcoming</h2>
                    {upcoming.map((s) => (
                        <UpcomingSessionRow
                            key={s.id}
                            title={s.title}
                            cohort={s.cohort_name}
                            instructor={s.instructor}
                            startsAt={s.starts_at}
                            meetingUrl={s.meeting_url}
                        />
                    ))}
                </section>
            )}
        </div>
    );
}