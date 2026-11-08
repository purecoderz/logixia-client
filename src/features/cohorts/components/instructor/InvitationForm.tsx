import { Select } from "@/components/ui/Select";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, fieldProps } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import type {
  CreatedInvitation,
  CreateInvitationInput,
  InvitationAccess,
} from "../../types/membership";

interface Props {
  embedded?: boolean;
  onCreate: (input: CreateInvitationInput) => Promise<CreatedInvitation>;
}

/** The server generates the link, fixes its expiry, and enforces email and single use. */
export function InvitationForm({ onCreate, embedded = false }: Props) {
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState<InvitationAccess>("owing");
  const [emailError, setEmailError] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [result, setResult] = useState<
    (CreatedInvitation & CreateInvitationInput) | null
  >(null);
  const [copyMessage, setCopyMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running.current) return;
    const address = email.trim();
    const control = event.currentTarget.elements.namedItem(
      "email",
    ) as HTMLInputElement;
    if (!address || control.validity.typeMismatch) {
      setEmailError("Enter a valid email address.");
      control.focus();
      return;
    }
    running.current = true;
    setBusy(true);
    setEmailError(undefined);
    setError(null);
    setResult(null);
    setCopyMessage("");
    try {
      const invitation = await onCreate({ email: address, access });
      setResult({ ...invitation, email: address, access });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? err.message
          : err instanceof ApiError && err.status === 422
            ? "Check the email and payment access, then try again."
            : friendlyMessage(
                err,
                "Couldn’t create the invitation. Please try again.",
              ),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopyMessage("Invitation link copied.");
    } catch {
      setCopyMessage(
        "Couldn’t copy automatically. Select and copy the link below.",
      );
    }
  }

  return (
    <section
      className={
        embedded
          ? "space-y-4"
          : "space-y-3 rounded-lg border border-line bg-surface-muted/20 p-4"
      }
      aria-label={embedded ? "Invitation details" : undefined}
      aria-labelledby={embedded ? undefined : "invite-heading"}
    >
      {!embedded && (
        <div>
          <h2
            id="invite-heading"
            className="text-base font-semibold text-foreground"
          >
            Invite a student
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Only the invited email can accept. Invitations expire after 24 hours
            and can be used once.
          </p>
        </div>
      )}
      <form onSubmit={submit} noValidate className="space-y-3">
        {error && (
          <FormError message={error} onDismiss={() => setError(null)} />
        )}
        <fieldset
          disabled={busy}
          className={`grid gap-4 disabled:opacity-70 ${embedded ? "" : "sm:grid-cols-2"}`}
        >
          <legend className="sr-only">Invitation details</legend>
          <Field
            label="Student email"
            htmlFor="invite-email"
            error={emailError}
          >
            <input
              {...fieldProps("invite-email", emailError)}
              data-autofocus={embedded || undefined}
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`${inputClass} !min-h-9 !py-2`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(undefined);
              }}
            />
          </Field>
          <Field
            label="Payment access"
            htmlFor="invite-access"
            hint={
              access === "waived"
                ? "The student will not need to pay for this cohort."
                : "The student will join with payment outstanding."
            }
          >
            <Select
              className="!min-h-9 !py-2"
              {...fieldProps("invite-access", undefined, true)}
              disabled={busy}
              value={access}
              onChange={(value) => setAccess(value as InvitationAccess)}
              options={[
                {
                  value: "owing",
                  label: "Owing",
                  description: "Payment required",
                },
                {
                  value: "waived",
                  label: "Waived",
                  description: "No payment required",
                },
              ]}
            />
          </Field>
        </fieldset>
        <Button
          className="!min-h-9 !py-2 !text-xs"
          type="submit"
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? (
            <>
              <Spinner tone="dark" /> Creating invitation…
            </>
          ) : (
            "Create invitation"
          )}
        </Button>
      </form>
      {result && (
        <div className="space-y-3 border-t border-line pt-4">
          <p role="status" className="text-sm text-success">
            Invitation created for {result.email} ·{" "}
            {result.access === "waived" ? "Payment waived" : "Payment owing"}.
          </p>
          <p className="text-xs text-muted">
            Expires {new Date(result.expiresAt).toLocaleString()}.
          </p>
          <Field label="Invitation link" htmlFor="invite-link">
            <input
              id="invite-link"
              readOnly
              className={`${inputClass} !min-h-9 !py-2`}
              value={result.url}
              onFocus={(e) => e.target.select()}
            />
          </Field>
          <Button
            className="!min-h-9 !py-2 !text-xs"
            type="button"
            variant="ghost"
            onClick={() => void copy()}
          >
            Copy invitation link
          </Button>
          <p role="status" className="text-sm text-body">
            {copyMessage}
          </p>
        </div>
      )}
    </section>
  );
}
