// components/LiveRoom/ChatPanel.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "../../hooks/useLiveRoom";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Auto-resize textarea as text grows, up to 120px max
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 120);
    el.style.height = `${Math.max(nextHeight, 38)}px`;
  }, [draft]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    // On mobile devices, let Enter add newlines normally (virtual keyboard Return key).
    // On desktop, Enter sends the message, Shift+Enter adds a newline.
    if (e.key === "Enter") {
      if (isMobile) {
        return;
      }
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-surface">
      <h2 className="border-b border-line px-3 py-2 text-xs font-semibold text-muted">
        Chat
      </h2>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3 text-sm">
        {messages.map((m, i) => {
          const mine = m.author === "You";
          // show the name only when the sender changes, like WhatsApp groups
          const showName = !mine && messages[i - 1]?.author !== m.author;

          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] break-words rounded-lg px-3 py-1.5 shadow-sm ${
                  mine
                    ? "rounded-tr-none bg-[#005c4b] text-[#e9edef]"
                    : "rounded-tl-none bg-surface-muted text-body"
                }`}
              >
                {showName && (
                  <p className="mb-0.5 text-xs font-semibold text-accent">
                    {m.author}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex items-end gap-2 border-t border-line p-2"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message"
          placeholder={
            isMobile
              ? "Type a message"
              : "Type a message (Shift + Enter for new line)"
          }
          className="min-h-[38px] max-h-[120px] min-w-0 flex-1 resize-none rounded-2xl border border-line bg-input px-3.5 py-2 text-sm text-body outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="flex h-9 shrink-0 items-center justify-center rounded-full bg-[#00a884] px-4 text-sm font-medium text-white transition-colors hover:bg-[#06cf9c]"
        >
          Send
        </button>
      </form>
    </section>
  );
}
