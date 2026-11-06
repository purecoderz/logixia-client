import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, fieldProps } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { SettingsService, type AccountSettings, type ProfilePatch } from "../services/settingsService";

export const settingsKey = (userId: string) => ["settings", userId] as const;

export function ProfileSettings({ initial }: { initial: AccountSettings }) {
  const { profile, updateProfile } = useAuth();
  const client = useQueryClient();
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState({ fullname: initial.fullname ?? "", username: initial.username, bio: initial.bio ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const running = useRef(false);
  const mutation = useMutation({ mutationFn: SettingsService.update });
  const dirty = Object.entries(values).some(([key, value]) => value.trim() !== (saved[key as keyof typeof values] ?? ""));
  function change(key: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setMessage(null); setSuccess(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (running.current || !dirty) return;
    const found: typeof errors = {};
    if (!values.fullname.trim() || values.fullname.trim().length > 120) found.fullname = "Enter a name between 1 and 120 characters.";
    if (!/^[A-Za-z0-9_]{3,30}$/.test(values.username.trim())) found.username = "Use 3–30 letters, numbers or underscores.";
    if (values.bio.trim().length > 1000) found.bio = "Keep your bio within 1,000 characters.";
    setErrors(found);
    const first = (Object.keys(values) as (keyof typeof values)[]).find((key) => found[key]);
    if (first) { document.getElementById(`settings-${first}`)?.focus(); return; }
    const patch: ProfilePatch = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]).filter(([key, value]) => value !== (saved[key as keyof typeof values] ?? "")));
    running.current = true; setMessage(null); setSuccess(false);
    try {
      const result = await mutation.mutateAsync(patch);
      setSaved(result); setValues({ fullname: result.fullname ?? "", username: result.username, bio: result.bio ?? "" });
      if (profile) client.setQueryData(settingsKey(profile.id), result);
      updateProfile({ username: result.username });
      setSuccess(true);
    } catch (error) {
      setMessage(error instanceof ApiError && error.status === 409 ? "That username is already taken. Choose another." : error instanceof ApiError && error.status === 422 ? "Check your profile details and try again." : friendlyMessage(error, "Couldn’t save your profile. Please try again."));
    } finally { running.current = false; }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {message && <FormError message={message} />}
      <p role="status" className="text-sm text-success">{success ? "Profile updated." : ""}</p>
      <fieldset disabled={mutation.isPending} className="space-y-4">
        <legend className="sr-only">Profile details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="settings-fullname" error={errors.fullname}>
            <input {...fieldProps("settings-fullname", errors.fullname)} autoComplete="name" value={values.fullname} onChange={(e) => change("fullname", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Username" htmlFor="settings-username" error={errors.username} hint="3–30 letters, numbers or underscores.">
            <input {...fieldProps("settings-username", errors.username, true)} autoComplete="username" value={values.username} onChange={(e) => change("username", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Email" htmlFor="settings-email" hint="Your sign-in and invitation email. Contact support if it needs to change.">
          <input {...fieldProps("settings-email", undefined, true)} type="email" readOnly value={initial.email} className={`${inputClass} text-muted`} />
        </Field>
        <Field label="Bio" htmlFor="settings-bio" error={errors.bio} hint="A short introduction for your students. Up to 1,000 characters.">
          <textarea {...fieldProps("settings-bio", errors.bio, true)} rows={4} value={values.bio} onChange={(e) => change("bio", e.target.value)} className={`${inputClass} resize-y`} />
        </Field>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Button variant="ghost" disabled={!dirty || mutation.isPending} onClick={() => { setValues({fullname:saved.fullname ?? "",username:saved.username,bio:saved.bio ?? ""}); setErrors({}); setMessage(null); setSuccess(false); }}>Reset changes</Button>
        <Button type="submit" disabled={!dirty || mutation.isPending} aria-busy={mutation.isPending}>{mutation.isPending ? <><Spinner tone="dark" /> Saving…</> : "Save changes"}</Button>
      </div>
    </form>
  );
}
