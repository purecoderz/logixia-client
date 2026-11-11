import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ThemeProvider } from "@/features/theme/ThemeProvider";

import { SystemStatePage } from "../components/SystemStatePage";

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const homePath = location.pathname.startsWith("/instructor")
    ? "/instructor"
    : "/";

  return (
    <ThemeProvider>
      <SystemStatePage
        fullScreen
        eyebrow="404 error"
        title="Page not found"
        description="The address may be incorrect, or the page may have moved. Check the link or return to a page you know."
        icon={<SearchX size={30} aria-hidden="true" />}
        actions={
          <>
            <Link
              to={homePath}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Home size={17} aria-hidden="true" />
              Go to dashboard
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-body transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Previous page
            </button>
          </>
        }
      />
    </ThemeProvider>
  );
}
