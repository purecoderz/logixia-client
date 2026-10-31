// Set VITE_API_URL in .env.production. The fallback is for local development.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const AUTH_EXPIRED_EVENT = "auth:expired";

// login and refresh must never trigger a refresh themselves
const NO_REFRESH = ["/auth/login", "/auth/refresh"];

type RefreshResult = "ok" | "denied" | "failed";

// one shared refresh for all requests that fail at the same time
let refreshPromise: Promise<RefreshResult> | null = null;

function tryRefresh(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      // "denied" = the server answered and said this session is over.
      // "failed" = server error or no connection: that says nothing about the session.
      .then((r): RefreshResult => (r.ok ? "ok" : r.status === 401 || r.status === 403 ? "denied" : "failed"))
      .catch((): RefreshResult => "failed")
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Same signature as before, for anything else that uses it
export function refreshSession(): Promise<boolean> {
  return tryRefresh().then((result) => result === "ok");
}

// Several requests can fail together, so announce an expired session once, not once per request
let lastExpiredAt = 0;
export function expire() {
  const now = Date.now();
  if (now - lastExpiredAt < 2000) return;
  lastExpiredAt = now;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const options: RequestInit = { credentials: "include", ...init };

  const response = await fetch(url, options);

  if (response.status !== 401 || NO_REFRESH.some((p) => url.includes(p))) {
    return response;
  }

  // access cookie expired: try a silent refresh
  const refreshed = await tryRefresh();

  if (refreshed === "denied") {
    expire();
    return response;
  }
  // The server is having trouble, or the connection dropped. Don't sign the user out for that.
  if (refreshed === "failed") return response;

  // retry the original request once with the new access cookie
  const retry = await fetch(url, options);
  if (retry.status === 401) expire();
  return retry;
}