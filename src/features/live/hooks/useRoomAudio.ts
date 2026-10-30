// hooks/useRoomAudio.ts
import { useCallback, useEffect, useRef, useState } from "react";
import AudioService from "../services/audioService";

type ListenState = "connecting" | "live" | "blocked" | "failed";
export type AudioStatus = "idle" | "connecting" | "live" | "blocked" | "problem";

interface Options {
  sessionId: number;
  myId: string | null;
  speakers: string[];
  canSpeak: boolean;
  sendMic: (on: boolean) => void;
}

const MAX_TRIES = 6;
const pathFor = (sessionId: number, userId: string) => `${sessionId}-${userId}`;

export function useRoomAudio({ sessionId, myId, speakers, canSpeak, sendMic }: Options) {
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, ListenState>>({});

  const players = useRef(new Map<string, HTMLAudioElement>());
  const tries = useRef(new Map<string, number>());

  const mark = useCallback((id: string, state: ListenState) => {
    setStates((prev) => (prev[id] === state ? prev : { ...prev, [id]: state }));
  }, []);

  // ---- listening ---------------------------------------------------
  // Plain functions on purpose: the effect below only runs when the speaker list changes

  function drop(id: string) {
    const el = players.current.get(id);
    if (!el) return;
    AudioService.stopListening(pathFor(sessionId, id));
    el.pause();
    el.srcObject = null;
    players.current.delete(id);
    tries.current.delete(id);
    setStates((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function retryLater(id: string, el: HTMLAudioElement) {
    const n = (tries.current.get(id) ?? 0) + 1;
    tries.current.set(id, n);
    if (n > MAX_TRIES) {
      if (players.current.get(id) === el) mark(id, "failed");
      return;
    }
    window.setTimeout(() => connect(id, el), 1000);
  }

  async function connect(id: string, el: HTMLAudioElement) {
    const current = () => players.current.get(id) === el; // false once they stop speaking, or we leave
    if (!current()) return;
    mark(id, "connecting");

    try {
      await AudioService.listen(
        pathFor(sessionId, id),
        (stream) => {
          if (!current()) return;
          el.srcObject = stream;
          el.play()
            .then(() => {
              if (!current()) return;
              tries.current.set(id, 0);
              mark(id, "live");
            })
            .catch(() => {
              if (current()) mark(id, "blocked"); // the browser refused to play sound
            });
        },
        (connState) => {
          if (!current()) return;
          if (connState === "failed") retryLater(id, el);
          else if (connState === "disconnected") mark(id, "connecting"); // may recover by itself
          else if (connState === "connected" && el.srcObject && !el.paused) mark(id, "live");
        },
      );
    } catch {
      retryLater(id, el);
    }
  }

  function sync(list: string[]) {
    const wanted = new Set(list.filter((id) => id !== myId));

    for (const id of [...players.current.keys()]) {
      if (!wanted.has(id)) drop(id);
    }
    for (const id of wanted) {
      if (players.current.has(id)) continue;
      const el = new Audio();
      el.autoplay = true;
      players.current.set(id, el);
      tries.current.set(id, 0);
      connect(id, el);
    }
  }

  const speakersKey = speakers.join(",");
  useEffect(() => {
    sync(speakers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakersKey, myId, sessionId]);

  // The icon was tapped. This is a real click, so the browser now allows sound
  function fix() {
    const values = Object.values(states);
    if (values.includes("blocked") && !values.includes("failed")) {
      players.current.forEach((el, id) => {
        el.play().then(() => mark(id, "live")).catch(() => {});
      });
      return;
    }
    for (const id of [...players.current.keys()]) drop(id);
    sync(speakers);
  }

  // What the icon shows
  const wantedIds = speakers.filter((id) => id !== myId);
  const list = wantedIds.map((id) => states[id] ?? "connecting");
  let status: AudioStatus;
  if (list.length === 0) status = "idle";
  else if (list.includes("failed")) status = "problem";
  else if (list.includes("blocked")) status = "blocked";
  else if (list.every((s) => s === "live")) status = "live";
  else status = "connecting";

  // ---- speaking ----------------------------------------------------

  const stopMic = useCallback(() => {
    AudioService.stopMic();
    setMicOn(false);
    sendMic(false);
  }, [sendMic]);

  const toggleMic = useCallback(async () => {
    if (micOn) {
      stopMic();
      return;
    }
    if (!canSpeak || !myId) return;
    setError(null);
    try {
      await AudioService.startMic(pathFor(sessionId, myId));
      setMicOn(true);
      sendMic(true); // only after the stream exists
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access was denied."
          : "Could not start the microphone.",
      );
    }
  }, [micOn, canSpeak, myId, sessionId, sendMic, stopMic]);

  // Lost the pen while speaking: the mic goes off
  useEffect(() => {
    if (micOn && !canSpeak) stopMic();
  }, [micOn, canSpeak, stopMic]);

  // Leaving the room
  useEffect(() => {
    const map = players.current;
    return () => {
      AudioService.stopAll();
      map.forEach((el) => {
        el.pause();
        el.srcObject = null;
      });
      map.clear();
    };
  }, []);

  return { micOn, toggleMic, error, status, fix };
}