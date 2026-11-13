export interface NavChildItem {
  id: string;
  label: string;
  path: string;
  badge?: string;
  badgeStyle?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  badgeStyle?: string;
  isLivePulse?: boolean;
  children?: NavChildItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Unauthenticated Guest Navigation Configuration
 */
export const GUEST_NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ id: "home", label: "Home", icon: "🏠", path: "/" }],
  },
  {
    title: "LIVE & BROADCAST",
    items: [
      {
        id: "cohorts",
        label: "Explore Programs",
        icon: "🎓",
        badge: "Cohort",
        badgeStyle: "bg-accent/10 text-accent border-accent/30",
        path: "/cohorts",
      },
    ],
  },
  {
    title: "INTERACTIVE COURSES",
    items: [{ id: "courses", label: "courses", icon: "📚", path: "/courses" }],
  },
  {
    title: "FREE SANDBOX",
    items: [
      {
        id: "playground-guest",
        label: "Public Playground",
        icon: "🧪",
        path: "/playground",
      },
      { id: "arcade-guest", label: "PlayGame Demo", icon: "👾", path: "/game" },
    ],
  },
];

/**
 * Authenticated Student Navigation Configuration
 */
export const STUDENT_NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { id: "home", label: "Student Dashboard", icon: "🏠", path: "/" },
      {
        id: "daily-challenge",
        label: "Daily Challenge",
        icon: "⚡",
        path: "/daily-challenge",
      },
    ],
  },
  {
    title: "ACTIVE COHORT",
    items: [
      {
        id: "live-stream",
        label: "Live Synchronized Room",
        icon: "🎥",
        isLivePulse: false,
        badgeStyle: "bg-emerald-500/10 text-success border-emerald-500/30",
        path: "/live-stream",
      },
      {
        id: "lessons",
        label: "Learning Path",
        icon: "🗺️",
        path: "/lessons",
      },
      {
        id: "tasks",
        label: "Tasks",
        icon: "📋",
        path: "/tasks",
      },
      {
        id: "session-history",
        label: "Session History",
        icon: "📜",
        path: "/history",
      },
      {
        id: "leaderboard",
        label: "Leaderboard",
        icon: "🏆",
        path: "/leaderboard",
      },
    ],
  },
  {
    title: "PROGRAMS & PRACTICE",
    items: [
      {
        id: "cohort-management",
        label: "Cohort Management",
        icon: "🎓",
        path: "/student/cohorts",
        children: [
          {
            id: "my-cohort",
            label: "My Cohort",
            path: "/student/cohorts",
          },
          {
            id: "reg-cohort",
            label: "Cohort Registration",
            path: "/register/cohorts",
          },
        ],
      },
      {
        id: "practice-group",
        label: "Practice & Arcade",
        icon: "🧪",
        path: "/playground",
        children: [
          {
            id: "playground",
            label: "PlayGround IDE",
            path: "/playground",
          },
          {
            id: "playgame",
            label: "PlayGame Arcade",
            badge: "+150 XP",
            badgeStyle: "bg-amber-500/10 text-warning border-amber-500/30",
            path: "/game",
          },
        ],
      },
      {
        id: "courses-catalog",
        label: "Courses Catalog",
        icon: "📚",
        path: "/student/courses",
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        id: "settings",
        label: "Profile settings",
        icon: "⚙️",
        path: "/settings",
      },
    ],
  },
];

export function getStudentNavSections(hasLiveSession = false): NavSection[] {
  if (!hasLiveSession) return STUDENT_NAV_SECTIONS;

  return STUDENT_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.id === "live-stream"
        ? {
            ...item,
            isLivePulse: true,
            badge: "IN SESSION",
          }
        : item,
    ),
  }));
}
