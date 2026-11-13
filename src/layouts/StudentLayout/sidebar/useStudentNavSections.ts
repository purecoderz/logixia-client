import { useQuery } from "@tanstack/react-query";
import { useActiveCohort } from "@/features/cohorts/hooks/useActiveCohort";
import {
  StudentSessionService,
  studentSessionKeys,
} from "@/features/live/services/studentSessionService";
import {
  GUEST_NAV_SECTIONS,
  getStudentNavSections,
  type NavSection,
} from "../navConfig";

export function useStudentNavSections(isAuthenticated: boolean): NavSection[] {
  const { activeCohort } = useActiveCohort(isAuthenticated);
  const cohortId = isAuthenticated ? (activeCohort?.id ?? null) : null;

  const { data: sessions = [] } = useQuery({
    queryKey: studentSessionKeys.list(cohortId ?? 0),
    queryFn: () => StudentSessionService.list(cohortId!),
    enabled: cohortId !== null,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (!isAuthenticated) {
    return GUEST_NAV_SECTIONS;
  }

  const hasLiveSession =
    cohortId !== null &&
    sessions.some((session) => session.status === "live");

  return getStudentNavSections(hasLiveSession);
}
