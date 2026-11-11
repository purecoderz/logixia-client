import { useEffect, useRef, useState } from "react";
import { friendlyMessage } from "@/lib/apiError";
import { InstructorAssistantService } from "../services/instructorAssistantService";
import type { AssistantMessage } from "../types";

const MAX_HISTORY = 12;
const MAX_MESSAGE_LENGTH = 4_000;

const message = (
  role: AssistantMessage["role"],
  content: string,
): AssistantMessage => ({ id: crypto.randomUUID(), role, content });

export function useInstructorAssistant(pathname: string) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef<{
    prompt: string;
    history: AssistantMessage[];
  } | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function request(
    prompt: string,
    history: AssistantMessage[],
    appendUser: boolean,
  ) {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(true);
    setError(null);
    if (appendUser) setMessages((current) => [...current, message("user", prompt)]);
    retryRef.current = { prompt, history };

    try {
      const response = await InstructorAssistantService.ask(
        {
          message: prompt,
          history: history.slice(-MAX_HISTORY).map(({ role, content }) => ({
            role,
            content,
          })),
          context: { pathname },
        },
        controller.signal,
      );
      setMessages((current) => [
        ...current,
        message("assistant", response.message),
      ]);
      retryRef.current = null;
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(
        friendlyMessage(
          reason,
          "The assistant couldn’t reply. Please try again.",
        ),
      );
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      setPending(false);
    }
  }

  function send(value: string) {
    const prompt = value.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!prompt || requestRef.current) return;
    void request(prompt, messages, true);
  }

  function retry() {
    if (!retryRef.current || requestRef.current) return;
    void request(retryRef.current.prompt, retryRef.current.history, false);
  }

  function clear() {
    if (pending) return;
    setMessages([]);
    setError(null);
    retryRef.current = null;
  }

  return { messages, pending, error, send, retry, clear };
}
