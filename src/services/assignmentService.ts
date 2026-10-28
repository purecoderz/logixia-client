export type AssignmentStatus = "active" | "done" | "missed";
const BASE_URL = "http://localhost:8000/cohorts";
export interface Assignment {
  id: number; // cohorts_tasks.id
  title: string; // tasks.title
  lesson_title: string; // lessons title
  cohort_name: string;
  start_date: string;
  due_date: string;
  xp: number;
  status: AssignmentStatus;
  submitted_at: string | null;
}

const DAY = 86_400_000;
const at = (days: number, hour = 17) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: "Loops exercise",
    lesson_title: "Week 3: Loops",
    cohort_name: "Cohort 2",
    start_date: at(-3),
    due_date: at(0),
    xp: 20,
    status: "active",
    submitted_at: null,
  },
  {
    id: 2,
    title: "Functions worksheet",
    lesson_title: "Week 3: Functions",
    cohort_name: "Cohort 2",
    start_date: at(-2),
    due_date: at(2),
    xp: 15,
    status: "active",
    submitted_at: null,
  },
  {
    id: 3,
    title: "To-do list in React",
    lesson_title: "Week 4: Components",
    cohort_name: "Cohort 2",
    start_date: at(-1),
    due_date: at(5),
    xp: 30,
    status: "active",
    submitted_at: null,
  },
  {
    id: 4,
    title: "Lists and tuples",
    lesson_title: "Week 2: Collections",
    cohort_name: "Cohort 2",
    start_date: at(-10),
    due_date: at(-3),
    xp: 15,
    status: "missed",
    submitted_at: null,
  },
  {
    id: 5,
    title: "Variables quiz",
    lesson_title: "Week 2: Variables",
    cohort_name: "Cohort 2",
    start_date: at(-12),
    due_date: at(-6),
    xp: 10,
    status: "done",
    submitted_at: at(-7, 14),
  },
  {
    id: 6,
    title: "Hello world script",
    lesson_title: "Week 1: Getting started",
    cohort_name: "Cohort 2",
    start_date: at(-18),
    due_date: at(-12),
    xp: 10,
    status: "done",
    submitted_at: at(-14, 10),
  },
];

export const AssignmentService = {
  // Swap this body for a real fetch when the endpoint exists
  getAssignments: async (): Promise<Assignment[]> => {
    await new Promise((r) => setTimeout(r, 400)); // fake latency so you see the loading state
    return MOCK_ASSIGNMENTS;
  },

  getTask: async (): Promise<Assignment[]> => {
    const response = await fetch(`${BASE_URL}/${1}/assignments`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    return await response.json()
  },

  submit: async (
    assignmentId: string,
    files: Record<string, string>,
  ): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600)); // replace with a real POST later
    console.log("submit", assignmentId, files);
  },
};
