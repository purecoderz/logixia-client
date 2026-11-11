import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import authservices from "@/services/authservice";
import {
  PasswordRequirements,
  passwordMeetsRequirements,
} from "./PasswordRequirements";

type RecoveryMode = "forgot" | "reset";

export function PasswordRecoveryForm({ mode }: { mode: RecoveryMode }) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const instructor = params.get("audience") === "instructor";
  const loginPath = instructor ? "/instructor/login" : "/auth/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "reset" && !token) {
      setError("This password reset link is missing its token.");
      return;
    }
    if (mode === "reset" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (mode === "reset" && !passwordMeetsRequirements(password)) {
      setError("Your new password does not meet all password requirements.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "forgot") {
        await authservices.requestPasswordReset(email);
        setSuccess(
          "If an account exists for that email, we sent a password reset link.",
        );
      } else {
        await authservices.resetPassword(token, password);
        setSuccess("Your password has been reset. You can now sign in.");
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-panel flex min-h-screen w-full items-center justify-center bg-input p-6 text-body sm:p-12 lg:p-16">
      <div className="w-full max-w-md animate-fade-in">
        <Link
          to={loginPath}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Back to sign in
        </Link>

        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1 font-mono text-xs text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Account recovery
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {mode === "forgot" ? "Reset your password" : "Choose a new password"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {mode === "forgot"
              ? "Enter your account email and we’ll send you a secure, time-limited reset link."
              : "Create a strong new password for your Logixia account."}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-success">
            {success}
          </div>
        )}

        {!success && (
          <form className="space-y-4" onSubmit={submit}>
            {mode === "forgot" ? (
              <label className="block">
                <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Email address
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value.trim().toLowerCase())}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </label>
            ) : (
              <>
                <label className="block">
                  <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                    New password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </label>
                <PasswordRequirements password={password} />
                <label className="block">
                  <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                    Confirm new password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl border border-white/10 bg-[#238636] px-4 py-3.5 font-mono font-bold text-white transition hover:bg-[#2ea043] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting
                ? "Please wait…"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Reset password"}
            </button>
          </form>
        )}

        {success && mode === "reset" && (
          <Link
            to={loginPath}
            className="inline-flex w-full justify-center rounded-xl bg-[#238636] px-4 py-3 font-mono font-bold text-white"
          >
            Continue to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
