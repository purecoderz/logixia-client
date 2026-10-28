// services/sessionService.ts
export interface Session {
  id: number;
  title: string;
  cohort_name: string;
  instructor: string;
  meeting_url: string;
  starts_at: string; // ISO 8601
  ends_at: string;
  status: "live" | "upcoming";
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;


function makeMockSessions(): Session[] {
  const now = Date.now();

  const raw = [
    {
      id: 1,
      title: "Docker Images Deep Dive",
      cohort_name: "Python automation from nothing to hero",
      instructor: "tester",
      meeting_url: "/live/room",
      start: now - 20 * MINUTE,
      end: now + 40 * MINUTE,
    },
    {
      id: 2,
      title: "Building Your First API",
      cohort_name: "Python automation from nothing to hero",
      instructor: "tester",
      meeting_url: "https://meet.google.com/klm-nopq-rst",
      start: now + 3 * HOUR,
      end: now + 4 * HOUR,
    },
    {
      id: 3,
      title: "Q&A: Deployment",
      cohort_name: "DevOps Foundations",
      instructor: "tester",
      meeting_url: "https://zoom.us/j/123456789",
      start: now + 26 * HOUR,
      end: now + 27 * HOUR,
    },
  ];

  return raw.map((s) => ({
    id: s.id,
    title: s.title,
    cohort_name: s.cohort_name,
    instructor: s.instructor,
    meeting_url: s.meeting_url,
    starts_at: new Date(s.start).toISOString(),
    ends_at: new Date(s.end).toISOString(),
    status: s.start <= now ? "live" : "upcoming",
  }));
}

export const SessionService = {
  async getSessions(): Promise<Session[]> {
    // Fake network delay so you can see your loading state
    await new Promise((resolve) => setTimeout(resolve, 600));
    return makeMockSessions();
  },
};