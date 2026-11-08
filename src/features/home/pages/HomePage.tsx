import "../home.css";
import { HomeHero } from "../components/HomeHero";
import { LearningBenefits } from "../components/LearningBenefits";
import { LearningPaths } from "../components/LearningPaths";
import { PlaygroundInvitation } from "../components/PlaygroundInvitation";

export function Home() {
  return (
    <>
      <HomeHero />
      <LearningBenefits />
      <LearningPaths />
      <PlaygroundInvitation />
    </>
  );
}
