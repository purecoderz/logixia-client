import { MemoryRouter } from "react-router-dom";
import StudentSettingsPage from "../src/features/settings/pages/StudentSettingsPage";
import { ThemeProvider } from "../src/features/theme/ThemeProvider";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileSettings } from "../src/features/settings/components/ProfileSettings";
import { PasswordSettings } from "../src/features/settings/components/PasswordSettings";
import { SettingsService } from "../src/features/settings/services/settingsService";
import { useInstructorSidebarPreference } from "../src/hooks/useInstructorSidebarPreference";

const { updateProfile } = vi.hoisted(() => ({updateProfile:vi.fn()}));
vi.mock("../src/features/auth/context/AuthContext", () => ({useAuth:()=>({profile:{id:"1",username:"ada",email:"ada@example.com"},updateProfile})}));
vi.mock("../src/features/settings/services/settingsService", () => ({SettingsService:{get:vi.fn(),update:vi.fn(),changePassword:vi.fn()}}));
afterEach(() => {cleanup(); vi.clearAllMocks(); localStorage.clear();});
const initial={fullname:"Ada Okafor",username:"ada",email:"ada@example.com",bio:"Python instructor"};

it("sends only changed profile fields and updates the signed-in username", async () => {
 const user=userEvent.setup();
 vi.mocked(SettingsService.update).mockResolvedValue({...initial,username:"ada_new"});
 render(<QueryClientProvider client={new QueryClient()}><ProfileSettings initial={initial}/></QueryClientProvider>);
 const save=screen.getByRole("button",{name:"Save changes"});
 expect((save as HTMLButtonElement).disabled).toBe(true);
 const input=screen.getByLabelText("Username");
 await user.clear(input); await user.type(input,"ada_new");
 await user.click(save);
 expect(await screen.findByText("Profile updated.")).toBeTruthy();
 expect(SettingsService.update).toHaveBeenCalledExactlyOnceWith({username:"ada_new"},expect.anything());
 expect(updateProfile).toHaveBeenCalledWith({username:"ada_new"});
 expect((screen.getByLabelText("Email") as HTMLInputElement).readOnly).toBe(true);
});

it("rejects mismatched password confirmation without sending a request", async () => {
 const user=userEvent.setup(); render(<PasswordSettings/>);
 await user.type(screen.getByLabelText("Current password"),"OldPassword1!");
 await user.type(screen.getByLabelText("New password"),"NewPassword1!");
 await user.type(screen.getByLabelText("Confirm new password"),"Different1!");
 await user.click(screen.getByRole("button",{name:"Update password"}));
 expect(screen.getByText("The new passwords must match.")).toBeTruthy();
 expect(SettingsService.changePassword).not.toHaveBeenCalled();
});

it("clears password inputs after a successful update", async () => {
 const user=userEvent.setup(); vi.mocked(SettingsService.changePassword).mockResolvedValue(); render(<PasswordSettings/>);
 await user.type(screen.getByLabelText("Current password"),"OldPassword1!");
 await user.type(screen.getByLabelText("New password"),"NewPassword1!");
 await user.type(screen.getByLabelText("Confirm new password"),"NewPassword1!");
 await user.click(screen.getByRole("button",{name:"Update password"}));
 expect(await screen.findByText("Password updated.")).toBeTruthy();
 expect(SettingsService.changePassword).toHaveBeenCalledWith({current_password:"OldPassword1!",new_password:"NewPassword1!"});
 expect((screen.getByLabelText("Current password") as HTMLInputElement).value).toBe("");
 expect((screen.getByLabelText("New password") as HTMLInputElement).value).toBe("");
});

function Preference({label}:{label:string}) {const [value,set]=useInstructorSidebarPreference();return <button aria-pressed={value} onClick={()=>set(!value)}>{label}</button>;}
it("syncs the settings switch and sidebar preference without a reload", async () => {
 render(<><Preference label="Layout"/><Preference label="Settings"/></>);
 await userEvent.click(screen.getByRole("button",{name:"Settings"}));
 expect(screen.getByRole("button",{name:"Layout"}).getAttribute("aria-pressed")).toBe("true");
 expect(localStorage.getItem("instructorSidebarCollapsed")).toBe("true");
 act(()=>{localStorage.setItem("instructorSidebarCollapsed","false");window.dispatchEvent(new StorageEvent("storage",{key:"instructorSidebarCollapsed"}));});
 expect(screen.getByRole("button",{name:"Settings"}).getAttribute("aria-pressed")).toBe("false");
});

it("loads student profile settings and switches between account sections", async () => {
 vi.mocked(SettingsService.get).mockResolvedValue(initial);
 const user = userEvent.setup();
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter><ThemeProvider><StudentSettingsPage /></ThemeProvider></MemoryRouter></QueryClientProvider>);
 expect(await screen.findByLabelText("Username")).toBeTruthy();
 expect(screen.getByText("Update how you appear to instructors and other learners.")).toBeTruthy();
 await user.click(screen.getByRole("button", {name:"Password", exact:true}));
 expect(screen.getByLabelText("Current password")).toBeTruthy();
 await user.click(screen.getByRole("button", {name:"Display", exact:true}));
 expect(screen.getByRole("heading", {name:"Display preferences"})).toBeTruthy();
 expect(screen.getByLabelText("Theme")).toBeTruthy();
 expect(screen.queryByRole("switch")).toBeNull();
});
