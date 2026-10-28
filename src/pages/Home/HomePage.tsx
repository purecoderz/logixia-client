import { Link } from "react-router-dom";
import { Hero } from "../../components/Home/Hero";
import { CohortCard } from "../../components/Home/CohortCard";
import { CourseCard } from "../../components/Home/CourseCard";
import { PlaygroundBanner } from "../../components/Home/PlaygroundBanner";
import { HostCohortBanner } from "../../components/Cohorts/HostCohortBanner";

export function Home() {
  const courses = [
    {
      title: "Python from zero",
      meta: "24 lessons · beginner",
      price: "₦15,000",
      filename: "main.py",
      code: 'def greet(name):\n    return f"Hi {name}"',
      to: "/courses",
    },
    {
      title: "JavaScript basics",
      meta: "30 lessons · beginner",
      price: "₦15,000",
      filename: "app.js",
      code: "const greet = (name) => {\n  return `Hi ${name}`;\n};",
      to: "/courses",
    },
    {
      title: "Backend and databases",
      meta: "18 lessons · intermediate",
      price: "₦25,000",
      filename: "server.py",
      code: "from fastapi import FastAPI\n\napp = FastAPI()",
      to: "/courses",
    },
  ];

  return (
    <div className="text-[#c9d1d9]">
      <Hero />
      <PlaygroundBanner />

      <section id="cohort" className="scroll-mt-8  pt-10">
        <p className="mb-3 text-xs uppercase tracking-wider text-[#8b949e]">
          Learn with a group
        </p>
        <CohortCard />
      </section>


      <section className="mt-12 border-t border-[#30363d] pt-10 pb-8">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8b949e]">
              Learn on your own
            </p>
            <h2 className="mt-1 text-lg font-medium text-white">
              Ready-made courses
            </h2>
          </div>
          <Link to="/courses" className="text-xs text-[#58a6ff]">Browse all</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
      </section>
      <HostCohortBanner/>
    </div>
  );
}