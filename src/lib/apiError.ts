// "server" = we failed (5xx). "request" = the server refused it (other 4xx, like 400 or 409).
export type ErrorKind = "offline" | "auth" | "forbidden" | "notFound" | "server" | "request";

/** A failed API response. `status` is null when no response arrived at all. */
export class ApiError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Build an ApiError from a failed Response, using FastAPI's `{ "detail": "..." }` when present. */
export async function apiErrorFrom(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  const detail =
    typeof body === "object" && body !== null && "detail" in body ? (body as { detail: unknown }).detail : undefined;
  const message = typeof detail === "string" ? detail : response.statusText || "Request failed";
  return new ApiError(message, response.status);
}

export function kindOf(error: unknown): ErrorKind {
  if (error instanceof ApiError) {
    if (error.status === 401) return "auth";
    if (error.status === 403) return "forbidden";
    if (error.status === 404) return "notFound";
    if (error.status !== null && error.status >= 400 && error.status < 500) return "request";
    return "server"; // 5xx, or an ApiError with no status
  }
  // fetch itself failed: no response at all
  if (error instanceof TypeError || (typeof navigator !== "undefined" && navigator.onLine === false)) {
    return "offline";
  }
  return "server";
}

export interface ErrorCopy {
  kind: ErrorKind;
  title: string;
  text: string;
  /** Trying again can only help for these. */
  retryable: boolean;
  /** Technical line for "Show details", empty when there's nothing useful. */
  details: string;
}

/** `what` completes "Couldn't load ...", for example "your cohorts". */
export function describeError(error: unknown, what: string): ErrorCopy {
  const kind = kindOf(error);
  const details =
    error instanceof ApiError
      ? `${error.status ?? "No response"} · ${error.message}`
      : error instanceof Error && kind !== "offline"
        ? error.message
        : "";

  switch (kind) {
    case "offline":
      return { kind, title: "No connection", text: "Check your internet and try again.", retryable: true, details: "" };
    case "auth":
      return { kind, title: "Please sign in again", text: "Your session has expired.", retryable: false, details };
    case "forbidden":
      return {
        kind,
        title: "You don’t have access",
        text: "You don’t have permission to see this. Ask an admin if you think that’s a mistake.",
        retryable: false,
        details,
      };
    case "notFound":
      return { kind, title: "We can’t find that", text: "It may have been moved or removed.", retryable: false, details };
    case "request":
      return {
        kind,
        title: `Couldn’t load ${what}`,
        text: "The request wasn’t accepted. If this keeps happening, let us know.",
        retryable: false,
        details,
      };
    case "server":
      return {
        kind,
        title: `Couldn’t load ${what}`,
        text: "Something went wrong on our side. Your data is safe. Try again in a moment.",
        retryable: true,
        details,
      };
  }
}

/**
 * One line for a failed SAVE. A 400 carries a message the user can act on
 * ("slug already exists"), so show it. Anything else gets the plain fallback.
 */
export function friendlyMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 400) return error.message;
  if (kindOf(error) === "offline") return "No connection. Check your internet and try again.";
  return fallback;
}