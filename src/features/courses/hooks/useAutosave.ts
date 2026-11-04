import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface AutosaveOptions<T> {
  value: T;
  /** What the server has right now (what the editor was loaded with). */
  initial: T;
  equals: (a: T, b: T) => boolean;
  /** Return false while the value can't be saved yet (for example a blank title). */
  isValid?: (value: T) => boolean;
  save: (value: T, lastSaved: T) => Promise<void>;
  delay?: number;
}

/**
 * Saves `value` a moment after the user stops changing it. One save runs at a time, anything
 * typed during a save is saved straight after, and whatever is unsaved is saved when the
 * component goes away.
 */
export function useAutosave<T>({ value, initial, equals, isValid = () => true, save, delay = 1500 }: AutosaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savedRef = useRef(initial);
  const latest = useRef(value);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const everSaved = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // keep the newest values where the timer and the unmount cleanup can read them
  const opts = useRef({ equals, isValid, save });
  useEffect(() => {
    latest.current = value;
    opts.current = { equals, isValid, save };
  });

  /** Save until nothing is left to save. Resolves true when everything is saved. */
  const run = useCallback((): Promise<boolean> => {
    if (inFlight.current) return inFlight.current;

    const job = (async () => {
      let didSave = false;
      try {
        for (;;) {
          const current = latest.current;
          const { equals: same, isValid: valid, save: doSave } = opts.current;
          if (same(current, savedRef.current)) {
            if (didSave) setStatus("saved");
            return true;
          }
          if (!valid(current)) {
            setStatus("dirty");
            return false;
          }
          setStatus("saving");
          await doSave(current, savedRef.current);
          savedRef.current = current;
          everSaved.current = true;
          didSave = true;
        }
      } catch {
        setStatus("error");
        return false;
      }
    })();

    // A run can finish without ever waiting (nothing to save, or an invalid value), so clear the
    // marker after it has been set, never from inside the run itself.
    inFlight.current = job;
    void job.finally(() => {
      if (inFlight.current === job) inFlight.current = null;
    });
    return job;
  }, []);

  // schedule a save whenever the value changes
  useEffect(() => {
    if (equals(value, savedRef.current)) {
      // changed and then changed back: there is nothing left to save
      if (!inFlight.current) setStatus(everSaved.current ? "saved" : "idle");
      return;
    }
    if (!inFlight.current) setStatus("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void run(), delay);
    return () => clearTimeout(timer.current);
  }, [value, equals, delay, run]);

  // last chance: leaving the page with unsaved work saves it
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      const { equals: same, isValid: valid } = opts.current;
      if (!same(latest.current, savedRef.current) && valid(latest.current)) void run();
    },
    [run],
  );

  // closing the tab with unsaved work asks first
  useEffect(() => {
    if (status === "idle" || status === "saved") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  /** Save now. Use before navigating away on purpose. */
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    return run();
  }, [run]);

  return { status, flush, retry: flush };
}