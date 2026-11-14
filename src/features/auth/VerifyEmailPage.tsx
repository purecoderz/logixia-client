import "./auth-theme.css";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, AlertCircle } from "lucide-react";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { Spinner } from "@/components/ui/Spinner";
import authservices, { type MessageResponse } from "@/services/authservice";

type VerifyStatus = "verifying" | "verified" | "error";

// Deduplicate one-time verification calls per token (e.g., under React StrictMode).
const verifyRequests = new Map<string, Promise<MessageResponse>>();

function verifyOnce(token: string): Promise<MessageResponse> {
  const existing = verifyRequests.get(token);
  if (existing) return existing;
  const req = authservices.verifyEmail(token);
  verifyRequests.set(token, req);
  return req;
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token")?.trim() ?? "";

  const [status, setStatus] = useState<VerifyStatus>(() =>
    token ? "verifying" : "error",
  );
  const [message, setMessage] = useState<string>(() =>
    token
      ? "Verifying your account…"
      : "This verification link is missing its token. Request a new verification email below.",
  );

  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "This verification link is missing its token. Request a new verification email below.",
      );
      return;
    }

    let cancelled = false;
    setStatus("verifying");
    setMessage("Verifying your account…");

    verifyOnce(token)
      .then((res) => {
        if (cancelled) return;
        setStatus("verified");
        setMessage(res.message || "Your account was verified successfully.");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Verification link is invalid or expired.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    setResendError(null);
    setResendMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setResendError("Please enter your email address.");
      return;
    }

    setResending(true);
    try {
      const res = await authservices.resendVerificationEmail(trimmed);
      setResendMessage(res.message);
    } catch (err) {
      setResendError(
        err instanceof Error
          ? err.message
          : "Unable to send verification email. Please try again.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen w-full items-center justify-center bg-input p-6 text-body sm:p-12">
        <div className="absolute right-4 top-4 z-30">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md animate-fade-in rounded-2xl border border-line bg-surface p-6 shadow-xl sm:p-8">
          <Link
            to="/auth/login"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to sign in
          </Link>

          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-line bg-input px-3 py-1 font-mono text-xs text-accent">
              <Mail className="size-3.5" aria-hidden />
              Email verification
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {status === "verifying"
                ? "Verifying your email"
                : status === "verified"
                  ? "Account verified"
                  : "Verification failed"}
            </h1>
          </div>

          {status === "verifying" && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl border border-line bg-input p-4 text-sm text-body"
            >
              <Spinner />
              <span>{message}</span>
            </div>
          )}

          {status === "verified" && (
            <div className="space-y-5">
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-success"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span>{message}</span>
              </div>

              <Link
                to="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              >
                Continue to sign in
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-danger"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span>{message}</span>
              </div>

              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Request a new verification email
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Enter the email address you signed up with and we’ll send a
                    fresh verification link.
                  </p>
                </div>

                {resendError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-danger"
                  >
                    {resendError}
                  </div>
                )}

                {resendMessage && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-success"
                  >
                    {resendMessage}
                  </div>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-line bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  />
                </label>

                <button
                  type="submit"
                  disabled={resending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resending ? (
                    <>
                      <Spinner tone="dark" />
                      Sending…
                    </>
                  ) : (
                    "Resend verification email"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
