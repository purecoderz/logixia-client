import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { PasswordRecoveryForm } from "./components/PasswordRecoveryForm";

/** Handles the deep-link reset URL: /password?token=<key> */
export function ResetPasswordPage() {
  return (
    <ThemeProvider>
      <PasswordRecoveryForm mode="reset" />
    </ThemeProvider>
  );
}
