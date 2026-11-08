import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Mail, Ticket } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FormError } from "@/components/ui/FormError";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { InvitationService } from "../Services/invitationService";
import { cohortKeys } from "../hooks/useCohorts";

function invitationError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 410)
      return "This invitation has expired or been revoked. Ask your instructor for a new link.";
    if (error.status === 404 || error.status === 422)
      return "This invitation link is invalid. Ask your instructor for a new link.";
    if (error.status === 409)
      return "This invitation has already been used, or you already belong to this cohort. Your existing membership has not been changed.";
    if (error.status === 403)
      return "This invitation can’t be accepted with this account. Sign in with the invited email and make sure it is verified.";
    if (error.status === 401)
      return "Your session has expired. Sign in again to accept this invitation.";
  }
  return friendlyMessage(
    error,
    "Couldn’t load or accept the invitation. Please try again.",
  );
}

export default function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const { profile } = useAuth();
  const token = params.get("token")?.trim() ?? "";
  return (
    <InvitationContent
      key={`${token}:${profile?.id ?? "guest"}`}
      token={token}
    />
  );
}

function InvitationContent({ token }: { token: string }) {
  const { profile, isLoading, logout } = useAuth();
  const location = useLocation();
  const client = useQueryClient();
  const [now, setNow] = useState(Date.now);
  const running = useRef(false);
  // Do not put the invitation token or private preview in the shared query cache.
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof InvitationService.preview>
  > | null>(null);
  const [previewError, setPreviewError] = useState<unknown>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const accept = useMutation({
    mutationFn: () => InvitationService.accept(token),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: cohortKeys.all });
    },
  });
  const authLink = (path: string) => (
    <Link
      to={path}
      state={{ from: location }}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-4 text-sm font-semibold text-accent hover:bg-surface-muted"
    >
      {path.endsWith("signup") ? "Create an account" : "Sign in"}
    </Link>
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token || !profile) return;
    let ignore = false;
    setLoadingPreview(true);
    setPreview(null);
    setPreviewError(null);
    InvitationService.preview(token)
      .then((data) => {
        if (!ignore) setPreview(data);
      })
      .catch((error: unknown) => {
        if (!ignore) setPreviewError(error);
      })
      .finally(() => {
        if (!ignore) setLoadingPreview(false);
      });
    return () => {
      ignore = true;
    };
  }, [token, profile?.id, attempt]);

  const expired = preview ? Date.parse(preview.expires_at) <= now : false;
  const mismatch =
    preview && profile
      ? preview.email.trim().toLowerCase() !==
        profile.email.trim().toLowerCase()
      : false;

  async function join() {
    if (
      running.current ||
      !preview ||
      Date.parse(preview.expires_at) <= Date.now() ||
      mismatch ||
      !profile ||
      accept.isSuccess
    )
      return;
    running.current = true;
    try {
      await accept.mutateAsync();
    } catch {
      /* Mutation error is displayed below. */
    } finally {
      running.current = false;
    }
  }

  return (
    <div className="mx-auto max-w-xl text-body">
      <div className="w-full max-w-xl space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="space-y-2">
          <Ticket className="text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-semibold text-foreground">
            You’re invited to a cohort
          </h1>
          <p className="text-sm text-muted">
            Review your invitation and accept when you’re ready to join.
          </p>
        </div>
        {!token ? (
          <FormError message="This link is missing its invitation token. Ask your instructor for the complete link." />
        ) : isLoading ? (
          <p role="status" className="flex items-center gap-2">
            <Spinner /> Checking your session…
          </p>
        ) : !profile ? (
          <div className="space-y-4">
            <p className="text-sm text-body">
              Sign in or create an account using the email your instructor
              invited. Opening this link does not enrol you automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              {authLink("/auth/login")}
              {authLink("/auth/signup")}
            </div>
          </div>
        ) : accept.isSuccess ? (
          <div className="space-y-4">
            <CheckCircle2 className="text-success" aria-hidden="true" />
            <p role="status" className="text-lg font-semibold text-foreground">
              You’ve joined {preview?.cohort_name ?? "the cohort"}.
            </p>
            <p className="text-sm text-muted">
              {preview?.access === "owing"
                ? "Your payment is outstanding. Your instructor’s payment and access rules apply."
                : "Your payment for this cohort is waived."}
            </p>
            <ButtonLink to="/">Go to dashboard</ButtonLink>
          </div>
        ) : loadingPreview || (!preview && !previewError) ? (
          <p role="status" className="flex items-center gap-2">
            <Spinner /> Loading invitation…
          </p>
        ) : previewError ? (
          <div className="space-y-4">
            <FormError message={invitationError(previewError)} />
            {previewError instanceof ApiError && previewError.status === 401 ? (
              authLink("/auth/login")
            ) : (
              <Button variant="ghost" onClick={() => setAttempt((a) => a + 1)}>
                Try again
              </Button>
            )}
          </div>
        ) : (
          preview && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {preview.cohort_name}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {preview.course_title}
                </p>
              </div>
              <dl className="space-y-3 rounded-xl border border-line p-4 text-sm">
                <div>
                  <dt className="text-muted">Invited email</dt>
                  <dd className="mt-1 flex items-center gap-2 break-all">
                    <Mail size={16} aria-hidden="true" />
                    {preview.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Payment access</dt>
                  <dd className="mt-1">
                    {preview.access === "waived"
                      ? "Waived — no payment required"
                      : "Owing — payment required"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Expires</dt>
                  <dd className="mt-1">
                    {new Date(preview.expires_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
              {expired && (
                <FormError message="This invitation has expired. Ask your instructor for a new link." />
              )}
              {mismatch && (
                <FormError
                  message={`You’re signed in as ${profile.email}. Use the account matching ${preview.email} to accept.`}
                />
              )}
              {accept.isError && (
                <FormError message={invitationError(accept.error)} />
              )}
              <p className="text-xs text-muted">
                This invitation can be accepted once, using the invited email
                address.
              </p>
              <Button
                onClick={() => void join()}
                disabled={expired || Boolean(mismatch) || accept.isPending}
                aria-busy={accept.isPending}
              >
                {accept.isPending ? (
                  <>
                    <Spinner tone="dark" /> Accepting…
                  </>
                ) : (
                  "Accept invitation"
                )}
              </Button>
            </div>
          )
        )}
        {profile && !accept.isSuccess && (
          <div className="border-t border-line pt-4 text-sm text-muted">
            <p className="break-all">Signed in as {profile.email}</p>
            <Button
              variant="ghost"
              disabled={accept.isPending}
              onClick={() => logout()}
            >
              Sign out to use another account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
