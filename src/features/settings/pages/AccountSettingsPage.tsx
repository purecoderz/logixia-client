import { Select } from "@/components/ui/Select";
import {
  DIFFICULTY_META,
  useChallengeDifficulty,
  type ChallengeDifficulty,
} from "@/features/dashboard/services/dailyChallengeStore";
import { useTheme, type ThemePreference } from "@/features/theme/ThemeProvider";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UserRound, LockKeyhole, PanelLeft } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { SettingsService } from "../services/settingsService";
import { ProfileSettings, settingsKey } from "../components/ProfileSettings";
import { PasswordSettings } from "../components/PasswordSettings";

const sections = [
  {
    id: "profile",
    label: "Profile",
    icon: UserRound,
    title: "Your profile",
    description: "Update how you appear to your students.",
  },
  {
    id: "password",
    label: "Password",
    icon: LockKeyhole,
    title: "Change password",
    description: "Use a unique password to protect your account.",
  },
  {
    id: "display",
    label: "Display",
    icon: PanelLeft,
    title: "Workspace display",
    description: "Adjust your instructor workspace on this browser.",
  },
] as const;

interface AccountSettingsPageProps {
  audience: "student" | "instructor";
  sidebarPreference?: readonly [
    boolean,
    (next: boolean | ((current: boolean) => boolean)) => void,
  ];
}

export function AccountSettingsPage({
  audience,
  sidebarPreference,
}: AccountSettingsPageProps) {
  const { profile } = useAuth();
  const { preference, setPreference } = useTheme();
  const [challengeDifficulty, setChallengeDifficulty] =
    useChallengeDifficulty();
  const [params, setParams] = useSearchParams();
  const section =
    sections.find((item) => item.id === params.get("section")) ?? sections[0];
  const settings = useQuery({
    queryKey: settingsKey(profile?.id ?? ""),
    queryFn: SettingsService.get,
    enabled: Boolean(profile) && section.id === "profile",
  });
  const [collapsed, setCollapsed] = sidebarPreference ?? [false, () => {}];
  const profileDescription =
    audience === "student"
      ? "Update how you appear to instructors and other learners."
      : section.description;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <PageBreadcrumbs items={[{ label: "Settings" }]} />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage your profile, account security and workspace.
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="flex flex-wrap gap-1 self-start lg:flex-col"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={section.id === id ? "page" : undefined}
              onClick={() => setParams({ section: id })}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent ${section.id === id ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-muted/50 hover:text-foreground"}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <section
          aria-labelledby="settings-section-title"
          className="student-card min-w-0 rounded-xl border border-line bg-surface"
        >
          <div className="border-b border-line px-5 py-4">
            <h2
              id="settings-section-title"
              className="text-base font-semibold text-foreground"
            >
              {section.id === "display" && audience === "student"
                ? "Display preferences"
                : section.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {section.id === "profile"
                ? profileDescription
                : section.id === "display" && audience === "student"
                  ? "Choose how Logixia looks on this browser."
                  : section.description}
            </p>
          </div>
          <div className="p-5">
            {section.id === "profile" &&
              (settings.isPending ? (
                <p
                  role="status"
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <Spinner /> Loading profile…
                </p>
              ) : settings.isError ? (
                <ErrorState
                  variant="section"
                  what="your settings"
                  error={settings.error}
                  onRetry={() => void settings.refetch()}
                />
              ) : (
                <ProfileSettings key={profile?.id} initial={settings.data} />
              ))}
            {section.id === "password" && <PasswordSettings />}
            {section.id === "display" && (
              <div className="space-y-4">
                <div className="max-w-sm">
                  <label
                    htmlFor="account-theme"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Theme
                  </label>
                  <Select
                    id="account-theme"
                    value={preference}
                    onChange={(value) =>
                      setPreference(value as ThemePreference)
                    }
                    options={[
                      { value: "dark", label: "Dark" },
                      { value: "light", label: "Light" },
                      {
                        value: "system",
                        label: "System",
                        description: "Follow your device appearance",
                      },
                    ]}
                  />
                </div>
                {audience === "student" && (
                  <div className="max-w-sm">
                    <label
                      htmlFor="daily-challenge-difficulty"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Daily challenge difficulty
                    </label>
                    <Select
                      id="daily-challenge-difficulty"
                      value={challengeDifficulty}
                      onChange={(value) =>
                        setChallengeDifficulty(value as ChallengeDifficulty)
                      }
                      options={[
                        {
                          value: "beginner",
                          label: `Beginner (+${DIFFICULTY_META.beginner.xp} XP)`,
                          description: DIFFICULTY_META.beginner.description,
                        },
                        {
                          value: "intermediate",
                          label: `Intermediate (+${DIFFICULTY_META.intermediate.xp} XP)`,
                          description: DIFFICULTY_META.intermediate.description,
                        },
                        {
                          value: "advanced",
                          label: `Advanced (+${DIFFICULTY_META.advanced.xp} XP)`,
                          description: DIFFICULTY_META.advanced.description,
                        },
                      ]}
                    />
                  </div>
                )}
                {sidebarPreference && (
                  <div className="flex items-start justify-between gap-4 rounded-lg border border-line p-4">
                    <div>
                      <h3
                        id="sidebar-preference-label"
                        className="text-sm font-medium text-foreground"
                      >
                        Compact sidebar
                      </h3>
                      <p
                        id="sidebar-preference-hint"
                        className="mt-1 text-xs leading-relaxed text-muted"
                      >
                        Keep navigation icons visible and hide labels on
                        desktop. Your preference is saved on this browser.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={collapsed}
                      aria-labelledby="sidebar-preference-label"
                      aria-describedby="sidebar-preference-hint"
                      onClick={() => setCollapsed((value) => !value)}
                      className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-input ${collapsed ? "bg-accent" : "bg-gray-600"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${collapsed ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                )}
                <p role="status" className="text-xs text-muted">
                  Changes apply immediately and are saved on this browser.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
