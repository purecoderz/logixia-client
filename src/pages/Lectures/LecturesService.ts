import { apiFetch } from "../../lib/http";
import { apiErrorFrom } from "../../lib/apiError";
const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/lectures`;

export type TutorialLevel = "beginner" | "intermediate" | "advanced";
export type TutorialStatus = "draft" | "published";

const ada: Instructor = {
  id: "b3f1c2a4-5d6e-4f70-8a91-0c2d3e4f5a61",
  name: "Ada Okafor",
};


export const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: 1,
    slug: "python-for-beginners",
    name: "Python for beginners",
    subtitle:
      "Variables, loops and functions. Write your first programs, one short lesson at a time.",
    level: "beginner",
    status: "published",
    price: 0,
    instructor: ada,
  }
];

export interface Instructor {
  id: string;
  name: string;
}

export interface Tutorial {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  level: TutorialLevel;
  status: TutorialStatus;
  price: number;
  instructor: Instructor;
}

export const TutorialService = {
  async fakegetTutorials() {
    return MOCK_TUTORIALS;
  },

  async getTutorials(): Promise<Tutorial[]> {
    const response = await apiFetch(API_URL);
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};
