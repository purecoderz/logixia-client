export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
}

export interface AssistantChatRequest {
  message: string;
  history: Array<Pick<AssistantMessage, "role" | "content">>;
  context: {
    pathname: string;
  };
}

export interface AssistantChatResponse {
  message: string;
}
