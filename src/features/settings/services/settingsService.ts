import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";

export interface AccountSettings {
  fullname: string;
  username: string;
  email: string;
  bio: string;
}
export type ProfilePatch = Partial<Pick<AccountSettings, "fullname" | "username" | "bio">>;
export interface PasswordChange { current_password: string; new_password: string }

export const SettingsService = {
  async get(): Promise<AccountSettings> {
    const response = await apiFetch("/user/settings");
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async update(patch: ProfilePatch): Promise<AccountSettings> {
    const response = await apiFetch("/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async changePassword(input: PasswordChange): Promise<void> {
    const response = await apiFetch("/user/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!response.ok) throw await apiErrorFrom(response);
  },
};
