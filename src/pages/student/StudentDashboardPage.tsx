// pages/Dashboard/StudentDashboardPage.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { DashboardHero } from "../../components/Dashboard/DashboardHero";

function Placeholder({ title, className = "" }: { title: string; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#30363d] bg-[#161b22] p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <div className="mt-3 h-24 rounded-lg border border-dashed border-[#30363d]" />
    </section>
  );
}

export function StudentDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const dueCount = 3; // placeholder

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* left: wide main column */}
        <div className="min-w-0 space-y-6">
          <DashboardHero
            name={profile?.username ?? "there"}
            dueCount={dueCount}
            onReview={() => navigate("/assignments")}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Placeholder title="Performance" />
            <Placeholder title="Progress" />
          </div>

          <Placeholder title="Due soon" />
        </div>

        {/* right: narrow column */}
        <aside className="min-w-0 space-y-6">
          <Placeholder title="Today" />
          <Placeholder title="Upcoming" />
        </aside>
      </div>
    </div>
  );
}