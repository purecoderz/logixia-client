// Instructor-side cohort. Kept separate from the student `Cohort` card type.
export type InstructorCohortStatus =
  | "draft"
  | "open"
  | "starting-soon"
  | "in-progress"
  | "completed";

export interface InstructorCohort {
  id: string;
  name: string; // "Python Pro #2"
  course: string; // course title
  status: InstructorCohortStatus;
  startDate?: string; // ISO date
  endDate?: string;
  seatsTaken: number;
  seatsTotal: number;
  price: number; // naira, per seat
  // Only set while in progress
  currentWeek?: number;
  totalWeeks?: number;
  nextSession?: string; // "Thu 6:00 PM"
}

export interface Cohort {
    id: string;
    status: CohortStatus;
    name: string;
    subtitle: string;
    startsOn: string;
    durationLabel: string; // "12 weeks" or "Week 6 of 12"
    seatsTaken: number;
    seatsTotal: number;
    price: number;
}

export type CohortStatus = "open" | "starting-soon" | "in-progress" | "completed";
