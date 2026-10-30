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
        badgeStyle: "bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30",
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
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        path: "/live-stream",
      },
      {
        id: "lessons",
        label: "Pre-Class Notes",
        icon: "📝",
        badge: "24h Prior",
        badgeStyle: "bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30",
        path: "/lessons",
      },
      {
        id: "assignments",
        label: "Assignments",
        icon: "📋",
        path: "/assignments",
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
    title: "Registration",
    items: [
      {
        id: "reg-cohort",
        label: "Register Cohort",
        icon: "📝",
        path: "/cohorts",
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
        badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
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
        path: "courses",
      },
    ],
  },
];


