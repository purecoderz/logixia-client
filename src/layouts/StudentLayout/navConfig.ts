export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  badgeStyle?: string;
  isLivePulse?: boolean;
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
    items: [{ id: "home", label: "Student Dashboard", icon: "🏠", path: "/" }],
  },
  {
    title: "ACTIVE COHORT",
    items: [
      {
        id: "live-stream",
        label: "Live Synchronized Room",
        icon: "🔴",
        isLivePulse: true,
        badge: "IN SESSION",
        badgeStyle: "bg-emerald-500/10 text-success border-emerald-500/30",
        path: "/live-stream",
      },
      {
        id: "lessons",
        label: "Pre-Class Notes",
        icon: "📝",
        badge: "24h Prior",
        badgeStyle: "bg-accent/10 text-accent border-accent/30",
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
        id: "schedule",
        label: "Class Timetable",
        icon: "📅",
        path: "/schedule",
      },
    ],
  },
  {
    title: "Cohort Management",
    items: [
      {
        id: "reg-cohort",
        label: "Cohort Registration",
        icon: "📝",
        path: "/register/cohorts",
      },

      {
        id: "my-cohort",
        label: "My Cohort",
        icon: "💻",
        path: "/student/cohorts",
      },
    ],
  },
  {
    title: "PRACTICE & GAMIFICATION",
    items: [
      {
        id: "playground",
        label: "PlayGround IDE",
        icon: "🧪",
        path: "/playground",
      },
      {
        id: "playgame",
        label: "PlayGame Arcade",
        icon: "👾",
        badge: "+150 XP",
        badgeStyle: "bg-amber-500/10 text-warning border-amber-500/30",
        path: "/game",
      },
    ],
  },
  {
    title: "SELF-PACED COURSES",
    items: [
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
