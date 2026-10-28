import { TimelineRow } from "./TimelineRow";


interface RoadmapRowProps {
  step: number;
  title: string;
  to: string;
}

export function RoadmapRow({ step, title, to }: RoadmapRowProps) {
  return <TimelineRow node={step} title={title} to={to} />;
}