// hooks/useAccessVoice.ts
import { useEffect, useRef } from "react";

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // never queue up behind an older message
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

export function useAccessVoice(canWrite: boolean, enabled: boolean) {
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // First value after joining: just remember it, don't announce it
    if (previous.current === null) {
      previous.current = canWrite;
      return;
    }

    if (previous.current !== canWrite) {
      previous.current = canWrite;
      speak(canWrite ? "You have been granted the permission to speek and write." : "Your writing access has been removed.");
    }
  }, [canWrite, enabled]);

  // Stop talking if the student leaves the room mid-sentence
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
}