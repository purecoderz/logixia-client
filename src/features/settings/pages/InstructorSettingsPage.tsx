import { useInstructorSidebarPreference } from "@/hooks/useInstructorSidebarPreference";
import { AccountSettingsPage } from "./AccountSettingsPage";

export default function InstructorSettingsPage() {
  const sidebarPreference = useInstructorSidebarPreference();
  return (
    <AccountSettingsPage
      audience="instructor"
      sidebarPreference={sidebarPreference}
    />
  );
}
