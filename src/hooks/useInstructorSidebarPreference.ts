import { useSyncExternalStore } from "react";

const key = "instructorSidebarCollapsed";
const event = "instructor-sidebar-preference";
let fallback = false;
function read() {
  try { return localStorage.getItem(key) === "true"; } catch { return fallback; }
}
function subscribe(callback: () => void) {
  const onStorage = (change: StorageEvent) => { if (change.key === key || change.key === null) callback(); };
  window.addEventListener(event, callback);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(event, callback); window.removeEventListener("storage", onStorage); };
}
function set(next: boolean | ((current: boolean) => boolean)) {
  const value = typeof next === "function" ? next(read()) : next;
  fallback = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Use in-memory preference if storage is unavailable. */ }
  window.dispatchEvent(new Event(event));
}

/** Shared between the layout toggle and Settings, including updates in other tabs. */
export function useInstructorSidebarPreference() {
  return [useSyncExternalStore(subscribe, read, () => false), set] as const;
}
