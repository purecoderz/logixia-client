import { Link } from "react-router-dom";
import { cohort, seatsLeft } from "../cohortData";

export function MobileEnrolBar() {
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 border-t border-[#30363d] bg-[#0d1117] px-4 py-3 lg:hidden">
      <div>
        <p className="text-sm font-medium text-white">{cohort.price}</p>
        <p className="text-[11px] text-[#8b949e]">{seatsLeft} seats left · starts {cohort.startDate}</p>
      </div>
      <Link
        to="/cohorts/register"
        className="rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white"
      >
        Register
      </Link>
    </div>
  );
}