import { Link } from "react-router-dom";
import { describeError, type ErrorKind } from "../../lib/apiError";
import { Button } from "./Button";

interface ErrorStateProps {
  error: unknown;
  /** Completes "Couldn't load ...", for example "your cohorts". */
  what: string;
  onRetry?: () => void;
  /** "page" fills the page. "section" is a card for when one part failed. */
  variant?: "page" | "section";
  /** Where the secondary button goes. Without it the button says "Go back". */
  homeTo?: string;
  homeLabel?: string;
}

const icons: Record<ErrorKind, string> = {
  server: "M12 3.5l9 15.5H3L12 3.5zM12 10v4M12 17v.1",
  request: "M12 3.5l9 15.5H3L12 3.5zM12 10v4M12 17v.1",
  offline: "M2 8.5a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.1M3 3l18 18",
  auth: "M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3",
  forbidden: "M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3",
  notFound: "M4.5 11a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zM16 16l5 5M9 9.5c.3-1 1.2-1.5 2-1.5 1.2 0 2 .8 2 1.8 0 1.5-2 1.5-2 3",
};

const tones: Record<ErrorKind, string> = {
  server: "text-red-400 bg-red-400/10",
  request: "text-amber-400 bg-amber-400/10",
  offline: "text-amber-400 bg-amber-400/10",
  auth: "text-gray-400 bg-gray-400/10",
  forbidden: "text-gray-400 bg-gray-400/10",
  notFound: "text-gray-400 bg-gray-400/10",
};

export function ErrorState({
  error,
  what,
  onRetry,
  variant = "page",
  homeTo,
  homeLabel = "Go to dashboard",
}: ErrorStateProps) {
  const copy = describeError(error, what);
  const page = variant === "page";

  const icon = (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${page ? "size-14" : "size-10"} ${tones[copy.kind]}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={icons[copy.kind]} />
      </svg>
    </span>
  );

  const actions = (
    <div className={`flex flex-wrap gap-2 ${page ? "justify-center" : ""}`}>
      {copy.retryable && onRetry && <Button variant={page ? "primary" : "ghost"} onClick={onRetry}>Try again</Button>}
      {page &&
        (homeTo ? (
          <Link
            to={homeTo}
            className="inline-flex min-h-11 items-center rounded-lg border border-gray-700 px-4 text-sm font-semibold text-gray-200 hover:bg-gray-800"
          >
            {homeLabel}
          </Link>
        ) : (
          <Button variant="ghost" onClick={() => history.back()}>
            Go back
          </Button>
        ))}
    </div>
  );

  const details = copy.details && (
    <details className="text-sm text-gray-400">
      <summary className="inline-flex min-h-11 cursor-pointer items-center">Show details</summary>
      <code className="block rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5 text-left font-mono text-xs text-gray-300">
        {copy.details}
      </code>
    </details>
  );

  if (page) {
    return (
      <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-3.5 rounded-xl border border-gray-800 bg-gray-800/30 px-6 py-14 text-center">
        {icon}
        <h2 className="text-xl font-semibold text-gray-50">{copy.title}</h2>
        <p className="max-w-sm text-sm leading-relaxed text-gray-400">{copy.text}</p>
        {actions}
        {details}
      </div>
    );
  }

  return (
    <div role="alert" className="flex items-start gap-3.5 rounded-xl border border-gray-800 bg-gray-800/30 p-5">
      {icon}
      <div className="space-y-2">
        <p className="font-semibold text-gray-50">{copy.title}</p>
        <p className="text-sm text-gray-400">{copy.text}</p>
        {actions}
        {details}
      </div>
    </div>
  );
}