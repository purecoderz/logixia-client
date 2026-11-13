import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

export const NAVIGATION_DURATION = 650;
export type NavigationMotion =
  "idle" | "student-exit" | "student-enter" | "public-return";
export const NavigationMotionContext = createContext<NavigationMotion>("idle");
export const useNavigationMotion = () => useContext(NavigationMotionContext);

export function isStudentWorkspace(path: string, search = "") {
  if (path === "/playground" || /^\/tasks\/[^/]+$/.test(path)) return true;
  if (path === "/game") {
    const params = new URLSearchParams(search);
    return (
      params.get("mode") === "code-bot-maze" && Boolean(params.get("level"))
    );
  }
  return false;
}

function isPublicPage(path: string, signedIn: boolean) {
  return (
    ["/privacy", "/terms", "/courses", "/cohorts"].includes(path) ||
    path.startsWith("/cohort/") ||
    (path === "/" && !signedIn)
  );
}
function isStudentPage(path: string, signedIn: boolean) {
  return (
    (path === "/" && signedIn) ||
    path.startsWith("/student/") ||
    [
      "/settings",
      "/live-stream",
      "/lessons",
      "/tasks",
      "/history",
      "/leaderboard",
      "/game",
      "/daily-challenge",
      "/user/cohorts",
      "/invitations/accept",
    ].includes(path)
  );
}

/** Owns route timing; layouts only respond to the current motion phase. */
export function useNavigationTransition(signedIn: boolean) {
  const destination = useLocation();
  const [displayedLocation, setDisplayedLocation] = useState(destination);
  const displayed = useRef(displayedLocation);
  const [motion, setMotion] = useState<NavigationMotion>("idle");

  useLayoutEffect(() => {
    if (destination === displayed.current) {
      setMotion("idle");
      return;
    }
    const from = displayed.current.pathname;
    const to = destination.pathname;
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let next: NavigationMotion = "idle";
    if (!reducedMotion && !destination.state?.authTransition) {
      if (isStudentWorkspace(to) && isStudentPage(from, signedIn))
        next = "student-exit";
      else if (isStudentWorkspace(from) && isStudentPage(to, signedIn))
        next = "student-enter";
      else if (
        (from === "/playground" || from.startsWith("/auth/")) &&
        isPublicPage(to, signedIn)
      )
        next = "public-return";
    }
    setMotion(next);
    const commit = () => {
      displayed.current = destination;
      setDisplayedLocation(destination);
    };
    // Enter the workspace now; its existing navigation leaves over the editor.
    if (next === "student-exit") commit();
    if (next === "idle") {
      commit();
      return;
    }
    const timer = window.setTimeout(() => {
      setMotion("idle");
      commit();
    }, NAVIGATION_DURATION);
    return () => window.clearTimeout(timer);
  }, [destination, signedIn]);

  return { displayedLocation, motion };
}
