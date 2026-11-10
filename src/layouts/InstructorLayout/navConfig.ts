export interface InstructorNavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string;
  children?: { id: string; label: string; path: string }[];
}

export interface InstructorNavSection {
  title: string;
  items: InstructorNavItem[];
}

export const instructorNav: InstructorNavSection[] = [
  {
    title: "Academic & Teaching",
    items: [
      { id: "overview", label: "Overview", path: "/instructor", icon: "🏠" },
      {
        id: "courses",
        label: "Courses",
        path: "/instructor/courses",
        icon: "📚",
        children: [
          {
            id: "all-courses",
            label: "All Courses",
            path: "/instructor/courses",
          },
          {
            id: "create-course",
            label: "Create Course",
            path: "/instructor/courses/new",
          },
        ],
      },
      {
        id: "cohorts",
        label: "Cohorts",
        path: "/instructor/cohorts",
        icon: "🎓",
        children: [
          {
            id: "all-cohorts",
            label: "All Cohorts",
            path: "/instructor/cohorts",
          },
          {
            id: "create-cohort",
            label: "Create Cohort",
            path: "/instructor/cohorts/new",
          },
          {
            id: "manage-tasks",
            label: "Manage Tasks",
            path: "/instructor/cohorts/tasks",
          },
          {
            id: "manage-students",
            label: "Manage Students",
            path: "/instructor/cohorts/members",
          },
        ],
      },
      {
        id: "sessions",
        label: "Sessions",
        path: "/instructor/sessions",
        icon: "📅",
      },
      {
        id: "plan",
        label: "Classroom Plan",
        path: "/instructor/plan",
        icon: "📅",
      },
      {
        id: "tasks",
        label: "Tasks",
        path: "/instructor/tasks",
        icon: "📋",
        children: [
          {
            id: "all-tasks",
            label: "All Task",
            path: "/instructor/tasks",
          },
        ],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "roster",
        label: "Student Roster",
        path: "/instructor/students",
        icon: "👥",
      },
      {
        id: "register",
        label: "Register Student",
        path: "/instructor/students/new",
        icon: "📝",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        id: "settings",
        label: "Settings",
        path: "/instructor/settings",
        icon: "⚙️",
      },
    ],
  },
];
