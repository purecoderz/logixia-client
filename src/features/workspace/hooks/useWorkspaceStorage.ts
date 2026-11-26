import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export type WorkspaceStorage = "local" | "session" | "memory";

export function clearWorkspaceStorage(
  prefix: string,
  mode: WorkspaceStorage = "local",
) {
  if (mode === "memory") return;
  try {
    const store = mode === "session" ? sessionStorage : localStorage;
    store.removeItem(`${prefix}:nodes`);
    store.removeItem(`${prefix}:active`);
    store.removeItem(`${prefix}:tabs`);
  } catch {
    /* Ignore storage errors. */
  }
}

/** Storage mode is fixed for the lifetime of a workspace instance. */
export function useWorkspaceStorage<T>(
  key: string,
  initial: T | (() => T),
  mode: WorkspaceStorage,
) {
  const [value, setValue] = useState<T>(() => {
    if (mode !== "memory") {
      try {
        const raw = (
          mode === "session" ? sessionStorage : localStorage
        ).getItem(key);
        if (raw !== null) return JSON.parse(raw) as T;
      } catch {
        /* Use the supplied initial state if storage is unavailable. */
      }
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });
  useEffect(() => {
    if (mode === "memory") return;
    try {
      (mode === "session" ? sessionStorage : localStorage).setItem(
        key,
        JSON.stringify(value),
      );
    } catch {
      /* Keep editing in memory. */
    }
  }, [key, mode, value]);
  return [value, setValue] as [T, Dispatch<SetStateAction<T>>];
}
