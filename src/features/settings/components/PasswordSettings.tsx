import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, fieldProps } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { SettingsService } from "../services/settingsService";

export function PasswordSettings() {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof values, string>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (running.current) return;
    const found: typeof errors = {};
    if (!values.current) found.current = "Enter your current password.";
    if (
      values.next.length < 8 ||
      !/[A-Z]/.test(values.next) ||
      !/[a-z]/.test(values.next) ||
      !/[0-9]/.test(values.next) ||
      !/[^A-Za-z0-9]/.test(values.next)
    )
      found.next =
        "Use at least 8 characters with uppercase, lowercase, a number and a symbol.";
    else if (values.next === values.current)
      found.next = "Choose a password different from your current one.";
    if (!values.confirm || values.next !== values.confirm)
      found.confirm = "The new passwords must match.";
    setErrors(found);
    setMessage(null);
    setSuccess(false);
    const first = (Object.keys(values) as (keyof typeof values)[]).find(
      (key) => found[key],
    );
    if (first) {
      document.getElementById(`password-${first}`)?.focus();
      return;
    }
    running.current = true;
    setBusy(true);
    try {
      await SettingsService.changePassword({
        current_password: values.current,
        new_password: values.next,
      });
      setValues({ current: "", next: "", confirm: "" });
      setSuccess(true);
    } catch (error) {
      setMessage(
        error instanceof ApiError && error.status === 422
          ? "Your new password wasn’t accepted. Check the requirements and try again."
          : friendlyMessage(
              error,
              "Couldn’t change your password. Check your current password and try again.",
            ),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {message && <FormError message={message} />}
      <p role="status" className="text-sm text-success">
        {success ? "Password updated." : ""}
      </p>
      <fieldset disabled={busy} className="max-w-lg space-y-4">
        <legend className="sr-only">Change password</legend>
        {(
          [
            ["current", "Current password", "current-password"],
            ["next", "New password", "new-password"],
            ["confirm", "Confirm new password", "new-password"],
          ] as const
        ).map(([key, label, autocomplete]) => (
          <Field
            key={key}
            label={label}
            htmlFor={`password-${key}`}
            error={errors[key]}
            hint={
              key === "next"
                ? "At least 8 characters with uppercase, lowercase, a number and a symbol."
                : undefined
            }
          >
            <input
              {...fieldProps(`password-${key}`, errors[key], key === "next")}
              type="password"
              autoComplete={autocomplete}
              value={values[key]}
              onChange={(e) => {
                setValues((previous) => ({
                  ...previous,
                  [key]: e.target.value,
                }));
                setErrors((previous) => ({ ...previous, [key]: undefined }));
                setMessage(null);
                setSuccess(false);
              }}
              className={inputClass}
            />
          </Field>
        ))}
      </fieldset>
      <div className="flex justify-end border-t border-line pt-4">
        <Button type="submit" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <Spinner tone="dark" /> Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </div>
    </form>
  );
}
