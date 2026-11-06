import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const {theme,setPreference}=useTheme();
  const label=theme==="dark" ? "Switch to light theme" : "Switch to dark theme";
  return <button type="button" aria-label={label} title={label} onClick={()=>setPreference(theme==="dark" ? "light" : "dark")} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-body hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent">
    {theme==="dark" ? <Sun size={19} aria-hidden="true"/> : <Moon size={19} aria-hidden="true"/>}
  </button>;
}
