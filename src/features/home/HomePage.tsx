import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PublicFooter } from "@/layouts/PublicLayout/PublicFooter";
import { HomeHeader } from "./components/HomeHeader";
import { HomeHero } from "./components/HomeHero";
import { HomeLearningModes } from "./components/HomeLearningModes";
import { HomeLearningPath } from "./components/HomeLearningPath";
import { HomeLiveClassroom } from "./components/HomeLiveClassroom";
import { HomePillars } from "./components/HomePillars";
import { HomePlaygroundCta } from "./components/HomePlaygroundCta";
import { HomePractice } from "./components/HomePractice";
import "./home.css";


/** Public landing page. Render it inside the app's ThemeProvider. */
export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-canvas text-body antialiased">
      <HomeHeader />
      <main>
        <HomeHero />
        <HomePillars />
        <HomeLearningPath />
        <HomeLiveClassroom />
        <HomePractice />
        <HomeLearningModes />
        <HomePlaygroundCta />
      </main>
      <PublicFooter />
    </div>
  );
}

export default HomePage;
