const API_URL = "http://localhost:8000/lectures";

export type TutorialLevel = "beginner" | "intermediate" | "advanced";
export type TutorialStatus = "draft" | "published";


const ada: Instructor = {
  id: "b3f1c2a4-5d6e-4f70-8a91-0c2d3e4f5a61",
  name: "Ada Okafor",
};

const tunde: Instructor = {
  id: "7a9e2d10-3c4b-4e58-9f61-1b2c3d4e5f72",
  name: "Tunde Bello",
};

export const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: 1,
    slug: "python-for-beginners",
    name: "Python for beginners",
    subtitle: "Variables, loops and functions. Write your first programs, one short lesson at a time.",
    level: "beginner",
    status: "published",
    price: 0,
    instructor: ada,
  },
  {
    id: 2,
    slug: "html-and-css-basics",
    name: "HTML and CSS basics",
    subtitle: "Build and style your first web page from scratch.",
    level: "beginner",
    status: "published",
    price: 0,
    instructor: tunde,
  },
  {
    id: 3,
    slug: "javascript-essentials",
    name: "JavaScript essentials",
    subtitle: "Learn the core of the language: values, functions, arrays and objects.",
    level: "beginner",
    status: "published",
    price: 15,
    instructor: tunde,
  },
  {
    id: 4,
    slug: "react-fundamentals",
    name: "React fundamentals",
    subtitle: "Components, props and state. Build a small app as you learn.",
    level: "intermediate",
    status: "published",
    price: 29.99,
    instructor: tunde,
  },
  {
    id: 5,
    slug: "building-apis-with-fastapi",
    name: "Building APIs with FastAPI",
    subtitle: "Routes, validation and database access for a real backend.",
    level: "intermediate",
    status: "published",
    price: 24.5,
    instructor: ada,
  },
  {
    id: 6,
    slug: "advanced-typescript",
    name: "Advanced TypeScript",
    subtitle: "Generics, conditional types and patterns that keep large codebases safe.",
    level: "advanced",
    status: "published",
    price: 49,
    instructor: tunde,
  },
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
    async fakegetTutorials(){
        return MOCK_TUTORIALS
    },

    async getTutorials():Promise<Tutorial[]>{
        const response = await fetch(API_URL)
        return response.json()
    }
}


