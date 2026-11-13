import { useSyncExternalStore } from "react";
import { useMyCohorts } from "./useCohorts";

const key = "activeCohortId";
const event = "active-cohort-change";
let fallback: number | null = null;
function read() {
  try {
    const raw = localStorage.getItem(key);
    const value: unknown = raw === null ? null : JSON.parse(raw);
    return typeof value === "number" && Number.isInteger(value) && value > 0
      ? value
      : null;
  } catch {
    return fallback;
  }
}
function subscribe(callback: () => void) {
  const onStorage = (change: StorageEvent) => {
    if (change.key === key || change.key === null) callback();
  };
  window.addEventListener(event, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(event, callback);
    window.removeEventListener("storage", onStorage);
  };
}
function select(id: number | null) {
  fallback = id;
  try {
    if (id === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(id));
  } catch {
    /* Keep selection in memory. */
  }
  window.dispatchEvent(new Event(event));
}

/** One source of truth for selection, membership validation and loading state. */
export function useActiveCohort(enabled = true) {
  const membership = useMyCohorts(enabled);
  const selectedId = useSyncExternalStore(subscribe, read, () => null);
  const cohorts = membership.data ?? [];
  const activeCohort =
    cohorts.find((cohort) => cohort.id === selectedId) ?? null;
  return {
    ...membership,
    cohorts,
    selectedId,
    activeCohort,
    selectCohort: select,
  };
}
