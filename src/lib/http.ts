// lib/http.ts
const BASE_URL = "http://localhost:8000";

export const AUTH_EXPIRED_EVENT = "auth:expired";

// login and refresh must never trigger a refresh themselves
const NO_REFRESH = ["/auth/login", "/auth/refresh"];

// one shared refresh for all requests that fail at the same time
let refreshPromise: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function expire() {
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
  const refreshed = await refreshSession();
  if (!refreshed) {
    expire();
    return response;
  }

  // retry the original request once with the new access cookie
  const retry = await fetch(url, options);
  if (retry.status === 401) expire();
  return retry;
}