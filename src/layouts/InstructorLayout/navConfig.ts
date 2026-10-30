import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Home,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface InstructorNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
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
      { id: "overview", label: "Overview", path: "/instructor", icon: Home },
      {
        id: "courses",
        label: "Courses",
        path: "/instructor/courses",
        icon: BookOpen,
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
        icon: Users,
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
        ],
      },
      {
        id: "plan",
        label: "Classroom Plan",
        path: "/instructor/plan",
        icon: CalendarDays,
      },
      {
        id: "tasks",
        label: "Tasks",
        path: "/instructor/tasks",
        icon: ClipboardCheck,
        children: [
          {
            id: "all-tasks",
            label: "All Task",
            path: "/instructor/tasks",
          },
          {
            id: "create-cohorts",
            label: "Create Tasks",
            path: "/instructor/task/new",
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
        icon: GraduationCap,
      },
      {
        id: "register",
        label: "Register Student",
        path: "/instructor/students/new",
        icon: UserPlus,
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
        icon: Settings,
      },
    ],
  },
];
