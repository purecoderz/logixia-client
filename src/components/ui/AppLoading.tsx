import "./app-loading.css";

interface AppLoadingProps {
  message?: string;
  fullscreen?: boolean;
}

/** Shared loading state for session checks and page handoffs. */
export function AppLoading({
  message = "Getting things ready…",
  fullscreen = true,
}: AppLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`${fullscreen ? "fixed inset-0 z-[200] min-h-dvh" : "min-h-64"} flex flex-col items-center justify-center bg-canvas px-6 text-body`}
    >
      <div className="relative flex size-24 items-center justify-center">
        <span
          aria-hidden="true"
          className="app-loading-ring absolute inset-0 rounded-full border-2 border-line border-t-cyan-500"
        />
        <img
          src="/logixialogo.webp"
          alt=""
          className="size-16 object-contain"
        />
      </div>
      <span className="mt-6 text-xl font-semibold tracking-tight text-foreground">
        Logixia
      </span>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}
