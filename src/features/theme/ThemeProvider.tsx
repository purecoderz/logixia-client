import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
const storageKey = "appTheme";
interface ThemeContextValue {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (value: ThemePreference) => void;
}
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
function read(): ThemePreference {
  try {
    const value =
      localStorage.getItem(storageKey) ??
      localStorage.getItem("instructorTheme");
    return value === "light" || value === "system" ? value : "dark";
  } catch {
    return "dark";
  }
}

/** Wrap app layouts, but leave coding workspace routes outside this boundary. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(read);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true,
  );
  const theme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (
        event.key === storageKey ||
        event.key === "instructorTheme" ||
        event.key === null
      )
        setPreferenceState(read());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
useLayoutEffect(() => {
    // Keep your existing data attribute
    document.body.dataset.appTheme = theme;
    
    // Add this: Toggle the standard Tailwind 'dark' class on the HTML tag
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      delete document.body.dataset.appTheme;
      document.documentElement.classList.remove("dark");
    };
  }, [theme]);
  function setPreference(value: ThemePreference) {
    setPreferenceState(value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* Keep the selection in memory if storage is blocked. */
    }
  }
  return (
    <ThemeContext value={{ preference, theme, setPreference }}>
      {children}
    </ThemeContext>
  );
}
const fallbackTheme: ThemeContextValue = {
  preference: "dark",
  theme: "dark",
  setPreference: () => {},
};
export function useTheme() {
  return useContext(ThemeContext) ?? fallbackTheme;
}

/** Reuse a surrounding provider; standalone workspaces create their own. */
export function ThemeBoundary({ children }: { children: ReactNode }) {
  const existing = useContext(ThemeContext);
  return existing ? children : <ThemeProvider>{children}</ThemeProvider>;
}

/** Backward-compatible name for the instructor layout. */
export const InstructorThemeProvider = ThemeProvider;
