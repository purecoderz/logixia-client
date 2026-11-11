import { apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from "../types";

export const InstructorAssistantService = {
  async ask(
    payload: AssistantChatRequest,
    signal?: AbortSignal,
  ): Promise<AssistantChatResponse> {
    const response = await apiFetch("/instructor/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
    if (!response.ok) throw await apiErrorFrom(response);

    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("message" in result) ||
      typeof result.message !== "string" ||
      !result.message.trim()
    ) {
      throw new Error("The assistant returned an invalid response.");
    }
    return { message: result.message.trim() };
  },
};
